import express from 'express';
import { google } from 'googleapis';
import cors from 'cors';
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';
import axios from 'axios';
import fs from 'fs'
import { redis } from './Db/redis.js';
import multer from 'multer'
import { User } from './models/User.js';
import { connectToDatabase } from './Db/mongoose.js';
import { configDotenv } from 'dotenv';
import { setKeyWithDefaultExpiry } from './Db/redis.js';
configDotenv();
const app = express();
app.use(cors({
  exposedHeaders: ['Content-Disposition', 'X-File-Name']
}));

app.use(express.json({ limit: '50mb' })); 

app.use(cookieParser());

connectToDatabase();





const CLIENT_ID = "394660286643-a6ljdkjphlbipk6cegvu9lp62bc57hbb.apps.googleusercontent.com"
const CLIENT_SECRET = "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"
const REDIRECT_URI = "http://localhost:3000/oauth2callback"
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly','https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/drive.file', 
  'https://www.googleapis.com/auth/userinfo.profile', 
  'https://www.googleapis.com/auth/userinfo.email'   ]

const upload = multer({ dest: 'uploads/' });

async function getUserInfo(accessToken) {
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error.response ? error.response.data : error.message);
  }
}

// const CLIENT_ID = process.env.CLIENT_ID
// const CLIENT_SECRET = process.env.CLIENT_SECRET;
// const REDIRECT_URI = process.env.REDIRECT_URI;
// const SCOPES = process.env.SCOPES


const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const userTokens = [];
let id=null;
app.get('/auth', (req, res) => {
   id=req.headers['user_id'];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', 
    scope: SCOPES,
  });
  res.json({authUrl});
});

// OAuth2 callback route
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  try {
    connectToDatabase();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    userTokens.push(tokens);
    // console.log('Access Token:', tokens.access_token);
    
    const userinfo= await getUserInfo(tokens.access_token);
    // console.log(id);
    // console.log('User Info:', userinfo);
    const userexist=await User.findOne({gmail_id:userinfo.gmail_id});
    if(userexist)
    {
      res.redirect('https://drive-mounter-6a39.vercel.app');
      return;
    }

    
    const storage=await getDriveStorageDetails(tokens)
    const storageQuota = storage.storageQuota;

    // Convert bytes to GB
    const bytesToGB = (bytes) => (parseInt(bytes) / (1024 ** 3)).toFixed(4); 
    
    const totalGB = bytesToGB(storageQuota.limit);
    const usedGB = bytesToGB(storageQuota.usage);
    const usedInDriveGB = bytesToGB(storageQuota.usageInDrive);
    
    // Calculate percentage used
    const percentageUsed = ((usedGB / totalGB) * 100);
    const gb=Number(usedGB).toFixed(2);
  
    const newuser= await User.create({
      Admin_id: id,
      gmail_id:userinfo.id,
      name:userinfo.name,
      given_name:userinfo.given_name,
      last_name:userinfo.family_name,
      picture:userinfo.picture,
      access_token:tokens,
      Storage:gb
    })
    await newuser.save();
    console.log(newuser)
    // res.send('Google Drive connected successfully!');
    res.redirect('https://drive-mounter-6a39.vercel.app')

  } catch (error) {
    console.error('Error exchanging code for token:', error.response ? error.response.data : error.message);
    res.status(500).send('Authentication failed');
  }
});

app.get('/fetch-files', async (req, res) => {
  try {
    const userId = req.headers['user_id'];
    const key = `${userId}data`;
    // const cached = await redis.get(key);
    // const parsed = JSON.parse(cached);
    // if (parsed.files.length > 0) {
    //   return res.send(JSON.parse(cached));
    // }
    // console.log('here');
    const userTokens = [];
    const pageSize = parseInt(req.query.pageSize) || 10;
    let pageToken = req.query.pageToken || null;

    const allUsers = await User.find({ Admin_id: userId });
    allUsers.forEach((user) => userTokens.push(user.access_token));

    let allFiles = [];
 

    for (const tokens of userTokens) {
    
      const { files, nextPageToken } = await fetchFilesWithPagination(tokens, pageSize, pageToken);
      // console.log(files);
      allFiles = allFiles.concat(files);

      if (nextPageToken) {
        res.json({ files: allFiles, nextPageToken });
        return;
      }
    }
    await setKeyWithDefaultExpiry(key,JSON.stringify({ files: allFiles, nextPageToken: null }))
    res.json({ files: allFiles, nextPageToken: null });
  } catch (error) {
    console.error('Error fetching all files:', error);
    res.status(500).send('Error fetching all files.');
  }
});

async function getDriveStorageDetails(tokens) {

  oauth2Client.setCredentials(tokens);

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  try {
    const response = await drive.about.get({ fields: 'storageQuota' });
  
    return response.data;
  } catch (error) {
    console.error('Error fetching storage details:', error);
    throw error;
  }
}

async function fetchFilesWithPagination(tokens, pageSize, pageToken) {
  try {
    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const response = await drive.files.list({
      pageSize: pageSize,
      fields: 'nextPageToken, files(id, name, size, mimeType, webViewLink, thumbnailLink)',
      pageToken: pageToken,
    });

    return { files: response.data.files, nextPageToken: response.data.nextPageToken };
  } catch (e) {
    console.error('Error fetching files:', e);
    throw e;
  }
}





async function UplaodFile(file,tokens) {
  if (!tokens) {
    console.error('No tokens available.');
    return;
  }
  try {
    
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const filePath = file.path; 
    const fileMetadata = {
      name: file.name,
      mimeType: file.mimetype
    };
    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(filePath) 
    };
    
    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id'
    });
    console.log('File Created:', res.data);

  } catch (e) {
    console.error('Error creating file:', e);
  }
}

app.post('/upload-file', upload.single('file'), async (req, res) => {
  const { driveId } = req.body;
  const file = req.file; 

  const user = await User.findOne({ gmail_id: driveId });
  if (!user) {
    return res.json({ msg: 'User does not exist' });
  }
  const token = user.access_token;
  const driveStorage=getDriveStorageDetails(token);
  console.log("file info :",file.size,driveStorage)
  await UplaodFile(file,token);
  const storage=await getDriveStorageDetails(token);
  const storageQuota = storage.storageQuota;

  const bytesToGB = (bytes) => (parseInt(bytes) / (1024 ** 3)).toFixed(4); 
    const usedGB = bytesToGB(storageQuota.usage);
    const gb=Number(usedGB).toFixed(2);
    user.Storage=gb;
    await user.save();

  res.json({ msg: 'File uploaded successfully' });
});

app.get('/fetch-drive',async(req,res)=>{
  const gmail_id=req.headers['gmail_id'];
  console.log("sdf",gmail_id)
  const usertoken=[];
 const cached= await redis.get(gmail_id);
  // if(cached)
  // {
  //   console.log(cached);
  //   return res.send(JSON.parse(cached));
  // }
  const user=await User.findOne({gmail_id:gmail_id});
  const pageSize = parseInt(req.query.pageSize) || 10; 
  let pageToken = req.query.pageToken || null; 
  let allFiles = [];

    do{
      // console.log('debug',user.access_token, pageSize, pageToken);
      const { files, nextPageToken } = await fetchFilesWithPagination(user.access_token, pageSize, pageToken);
      console.log(files,nextPageToken);
      allFiles = allFiles.concat(files);

      if (nextPageToken) {
        res.json({ files: allFiles, nextPageToken });
        return;
      }
      pageToken=nextPageToken;
    }while(pageToken)

  await setKeyWithDefaultExpiry(gmail_id,JSON.stringify({'files':allFiles}))
  res.json({'files':allFiles});
})



app.get('/get-accounts', async (req, res) => {
  const userid = req.headers['user_id'];
    const key=`${userid}account`
    // const cached=await redis.get(key);
    // if(cached)
    // {
    //    return res.send(cached)
    // }

  try {
      const response = await User.find({ Admin_id: userid });
      // console.log(response);
      await setKeyWithDefaultExpiry(key,JSON.stringify({
        "Accounts": response
    }))
      res.json({
          "Accounts": response
      });
  } catch (error) {
      console.error("Error fetching accounts:", error.message);
      res.status(500).send('Error fetching accounts');
  }
});

app.get('/download-file', async (req, res) => {
  const { fileId, userId } = req.query;
  if (!fileId || !userId) {
    return res.status(400).send('fileId and userId are required');
  }

  try {
    const user = await User.findOne({ Admin_id: userId });
    if (!user || !user.access_token) {
      return res.status(404).send('User not found or user has no access token');
    }

    oauth2Client.setCredentials(user.access_token);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata = await drive.files.get({ fileId: fileId, fields: 'name, mimeType' });
    let fileName = fileMetadata.data.name;
    const mimeType = fileMetadata.data.mimeType;

    let fileResponse;
    let exportMimeType;
    let exportFormat;

    // Determine the export MIME type based on the requested format
    if (mimeType.includes('application/vnd.google-apps')) {
      switch (mimeType) {
        case 'application/vnd.google-apps.document':
          exportFormat = 'docx'; // Default export format for Google Docs
          exportMimeType = exportFormat === 'docx' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // Export Google Docs as PDF or DOCX
          break;
        case 'application/vnd.google-apps.spreadsheet':
          exportFormat = 'xlsx'; // Default export format for Google Sheets
          exportMimeType = exportFormat === 'xlsx' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // Export Google Sheets as PDF or XLSX
          break;
        case 'application/vnd.google-apps.presentation':
          exportFormat = 'pptx'; // Default export format for Google Slides
          exportMimeType = exportFormat === 'pptx' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation'; // Export Google Slides as PDF or PPTX
          break;
        default:
          return res.status(400).send('Unsupported Google Workspace document type');
      }

      fileResponse = await drive.files.export(
        { fileId: fileId, mimeType: exportMimeType },
        { responseType: 'stream' }
      );
      fileName = fileName + `.${exportFormat}`;
      console.log(fileName);
      res.setHeader('Content-Type', exportMimeType);
    } else {
      // For non-Google Workspace files, download the file directly
      fileResponse = await drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream' }
      );
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('X-File-Name', fileName);

    fileResponse.data.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error.message);
    res.status(500).send('Error downloading file');
  }
});

app.delete('/delete-file', async (req, res) => {
  const { fileId, userId } = req.query;
  
  if (!fileId || !userId) {
    return res.status(400).send('fileId and userId are required');
  }

  try {

    const user = await User.findOne({ Admin_id: userId });
    if (!user || !user.access_token) {
      return res.status(404).send('User not found or user has no access token');
    }

    oauth2Client.setCredentials(user.access_token);

    const drive = google.drive({ version: 'v2', auth: oauth2Client });
    // console.log(fileId)
    await drive.files.delete({ fileId: fileId });

    res.status(200).send(`File with ID ${fileId} has been deleted successfully.`);
  } catch (error) {
    console.error('Error deleting file:', error.message);
    res.status(500).send('Error deleting file');
  }
});


app.listen(3000, () => {
  console.log('App listening on port 3000');
});



