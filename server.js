require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ngrok = require('ngrok');
const decodeJWT = require('did-jwt').decodeJWT;
const { Credentials } = require('uport-credentials');
const transports = require('uport-transports').transport
const message = require('uport-transports').message.util


let endpoint = ''

const app = express();
app.use(bodyParser.json({ type: '*/*' }))

const credentials = new Credentials({
  appName: 'MyDApp',
  network: "rinkeby",
  privateKey: process.env.APP_PRIVATE_KEY
})

console.log(process.env.APP_PRIVATE_KEY)
// in an express application
app.get("/login", (req, res) => {
  credentials.createDisclosureRequest({
    notifications: true,
    requested: ['name', 'country'],
    callbackUrl: endpoint + "/callback"
  }).then(requestToken => {
    console.log(decodeJWT(requestToken));
    const uri = message.paramsToQueryString(
      message.messageToURI(requestToken), 
      {callback_type: 'post'});
    const qr = transports.ui.getImageDataURI(uri);
    res.send(`<div><img src="${qr}"/></div>`)
  })
})
  
app.post("/callback", (req, res) => {
  const jwt = req.body.access_token
  // Do something with the jwt
  console.log(`JWT=${jwt}`);
  credentials.authenticateDisclosureResponse(jwt).then(credentials => {
    console.log(credentials);
    // Validate the information and apply authorization logic
  }).catch( err => {
    console.log(err)
  })
})

const server = app.listen(8088, () => {
  ngrok.connect(8088).then(ngrokUrl => {
    endpoint = ngrokUrl
    console.log(`Login Service running, open at ${endpoint}`)
  })
})
