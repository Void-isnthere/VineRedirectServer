const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { addUser, findUser, verifyPassword } = require('./users');
const app = express();
const port = 3000;

// Define a simple route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the VineRedirect API');
});

// Define a route for redirection
app.get('/redirect/:id', (req, res) => {
  const videoId = req.params.id;
  // Logic to find the corresponding video URL
  const videoUrl = getVideoUrl(videoId); // Implement this function based on your data source

  if (videoUrl) {
    res.redirect(videoUrl);
  } else {
    res.status(404).send('Video not found');
  }
});

// Function to get video URL from video ID
function getVideoUrl(id) {
  // Implement your logic to retrieve video URL
  // For example, lookup in a database or an in-memory object
  const videoDatabase = {
    '1': 'https://example.com/video1.mp4',
    '2': 'https://example.com/video2.mp4'
  };
  return videoDatabase[id];
}

// Configure AWS SDK
var AWS = require("aws-sdk");
var creds = new AWS.Credentials('akid', 'secret', 'session');

AWS.config.update({
  accessKeyId: 'AKIA6GBMFO2Z6TDSHG52',
  secretAccessKey: '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',
  region: 'us-east-1' 
});

const s3 = new AWS.S3();
const bucketName = 'vine-redirect';


// Define a simple route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the VineRedirect API');
});

// Define a route for redirection
app.get('/redirect/:id', (req, res) => {
  const videoId = req.params.id;
  const videoUrl = getVideoUrl(videoId);

  if (videoUrl) {
    res.redirect(videoUrl);
  } else {
    res.status(404).send('Video not found');
  }
});

// Function to get video URL from S3
function getVideoUrl(id) {
  const params = {
    Bucket: bucketName,
    Key: `${id}.mp4`
  };

  try {
    const url = s3.getSignedUrl('getObject', params);
    return url;
  } catch (error) {
    console.error('Error generating signed URL', error);
    return null;
  }
}

const secretKey = 'YOUR_SECRET_KEY';

app.use(bodyParser.json());

// User Registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (findUser(username)) {
    return res.status(400).send('User already exists');
  }
  const user = addUser(username, password);
  res.status(201).send({ username: user.username });
});

// User Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = findUser(username);
  if (!user || !verifyPassword(user, password)) {
    return res.status(401).send('Invalid credentials');
  }
  const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
  res.send({ token });
});

// Middleware to protect routes
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.sendStatus(403);
  }
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// Protected Route Example
app.get('/protected', authenticateJWT, (req, res) => {
  res.send('This is a protected route');
});


app.listen(port, () => {
  console.log(`VineRedirect API server is running at http://localhost:${port}`);
});
