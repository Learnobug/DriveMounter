import express from 'express';
import { google } from 'googleapis';
import cors from 'cors';
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';
import axios from 'axios';

import { User } from './models/User.js';
import { connectToDatabase } from './Db/mongoose.js';


const app = express();
app.use(cors());


app.use(bodyParser.json());
app.use(cookieParser());

connectToDatabase();


const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly','https://www.googleapis.com/auth/userinfo.profile'];

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
    const userexist=await User.find({gmail_id:userinfo.gmail_id});
    if(userexist)
    {
      res.redirect('http://localhost:3001');
    }
    const newuser= await User.create({
      Admin_id: id,
      gmail_id:userinfo.id,
      name:userinfo.name,
      given_name:userinfo.given_name,
      last_name:userinfo.family_name,
      picture:userinfo.picture,
      access_token:tokens
    })
    await newuser.save();
    // res.send('Google Drive connected successfully!');
    res.redirect('http://localhost:3001')

  } catch (error) {
    console.error('Error exchanging code for token:', error.response ? error.response.data : error.message);
    res.status(500).send('Authentication failed');
  }
});

async function fetch_data(tokens) {
  try {
    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    let files = [];
    let pageToken = null;

    do {
      const response = await drive.files.list({
        pageSize: 100,
        fields: 'nextPageToken, files(id, name, size, mimeType, webViewLink,thumbnailLink)',
        pageToken: pageToken,
      });

      files = files.concat(response.data.files);
      pageToken = response.data.nextPageToken;

    } while (pageToken);

    return files;
  } catch (e) {
    console.error('Error fetching files:', e);
    throw e;
  }
}
async function UplaodFile(tokens) {
  if (!tokens) {
    console.error('No tokens available.');
    return;
  }
  try {
    
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });


    const res = await drive.files.create({
      requestBody: {
        name: 'Test',
        mimeType: 'text/plain'
      },
      media: {
        mimeType: 'text/plain',
        body: 'Hello World'
      }
    });

    console.log('File Created:', res.data);
  } catch (e) {
    console.error('Error creating file:', e);
  }
}


app.get('/fetch-files', async (req, res) => {
  try {
    const userid=req.headers['user_id'];
    const usertoken=[];

    const allusers=await User.find({Admin_id:userid});

    allusers.map((u)=> usertoken.push(u.access_token))
    let allFiles = [];
    for (const tokens of usertoken) {
      // console.log(tokens)
      const files = await fetch_data(tokens);
      allFiles = allFiles.concat(files);
    }
    // console.log(allFiles)
    res.json({'files':allFiles});
  } catch (error) {
    res.status(500).send('Error fetching all files.');
  }
});

app.get('/get-accounts', async (req, res) => {
  const userid = req.headers['user_id'];
  // console.log(userid)
  try {
      const response = await User.find({ Admin_id: userid });
      res.json({
          "Accounts": response
      });
  } catch (error) {
      console.error("Error fetching accounts:", error.message);
      res.status(500).send('Error fetching accounts');
  }
});


app.listen(3000, () => {
  console.log('App listening on port 3000');
});



