const express = require('express');
const utils = require('../utils');
const path = require('path');

const app = express();

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get('/api', (req, res)=> {
  res.json({ message: 'Hello from server'});
});

app.get('*', (req, res)=>{
  console.log("Enter here");
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

utils.startServer(app, port=3000);
//utils.startLocal(app, port=3001);
