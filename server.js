require('dotenv').config()
const uuidv4 = require('uuid/v4');
var sha1 = require('sha1');
const express = require('express');
const bodyParser = require('body-parser');
const ngrok = require('ngrok');
const path = require('path');
const decodeJWT = require('did-jwt').decodeJWT;
const { Credentials } = require('uport-credentials');
const transports = require('uport-transports').transport
const message = require('uport-transports').message.util
const EventEmitter = require('eventemitter3');

const events = require('./events');

let endpoint = ''

const app = express();
app.use(bodyParser.json({ type: '*/*' }))

const credentials = new Credentials({
  appName: 'MyDApp',
  network: "rinkeby",
  privateKey: process.env.APP_PRIVATE_KEY
})

// Test server authentication
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// Test client authentication
app.get('/client', function(req, res) {
  res.sendFile(path.join(__dirname + '/index_client.html'));
});

// Handle login and return the QR code.
app.post("/login/", (req, res) => {
  var tagId = sha1(uuidv4());
  credentials.createDisclosureRequest({
    notifications: true,
    requested: ['name', 'country'],
    callbackUrl: endpoint + `/callback/${tagId}`
  }).then(requestToken => {
    console.log(decodeJWT(requestToken));
    const uri = message.paramsToQueryString(
      message.messageToURI(requestToken), 
      {callback_type: 'post'});

    const qr = transports.ui.getImageDataURI(uri);
    transports.ui.requested
    res.json({
      'tagId': tagId,
      'image': qr
    })
  })
})
  
app.post("/callback/:tagId", (req, res) => {
  tagId = req.params.tagId;

  const jwt = req.body.access_token
  // Do something with the jwt
  credentials.authenticateDisclosureResponse(jwt).then(credentials => {
    
    console.log(credentials);
    // Validate the information and apply authorization logic
    events.publish(tagId, jwt);
  }).catch( err => {
    console.log(err)
  })
})

app.get('/events/:tagId', events.subscribe);

const server = app.listen(8088, () => {
  ngrok.connect(8088).then(ngrokUrl => {
    endpoint = ngrokUrl
    console.log(`Login Service running, open at ${endpoint}`)
  })
})
