#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var open = require('open');
var express = require('express');


// gather images
var images = fs.readdirSync('./').filter(function(f){
  return f && f[0] != '.'; // Ignore hidden files
});


// start express to serve up the front-end
var app = express();

// serve the front-end folder
app.use('/', express.static(path.join(__dirname, 'front-end')));
// send json of images in the invoked directory
app.get('/images', function(req, res) {
  res.send(images);
});

// start the server
app.listen(3000, function () {
  console.log('draw away. ctrl+c to stop');
  open('http://localhost:3000/');
});
