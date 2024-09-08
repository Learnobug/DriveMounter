import express from 'express';
import { google } from 'googleapis';
import cors from 'cors';
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = process.env.SCOPES


const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const userTokens = [];


app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Redirecting to:', authUrl);
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('No authorization code found');
  }

  try {
  
    const { tokens: oauthTokens } = await oauth2Client.getToken(code);
    userTokens.push(oauthTokens); 
    console.log('Access Token:', oauthTokens.access_token);
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });

    const userInfo = await oauth2.userinfo.get();
    console.log('User Info:', userInfo.data);

    const { name, email, picture } = userInfo.data;
   console.log(name,email,picture);
    res.json({
      message: 'Authentication successful!',
      name,
      email,
      picture
    });
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
        fields: 'nextPageToken, files(id, name, size, mimeType, webViewLink)',
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
    let allFiles = [];
    for (const tokens of userTokens) {
      const files = await fetch_data(tokens);
      allFiles = allFiles.concat(files);
    }
    res.json(allFiles);
  } catch (error) {
    res.status(500).send('Error fetching all files.');
  }
});

app.listen(3000, () => {
  console.log('App listening on port 3000');
});
