#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var open = require('open');
var express = require('express');


// gather images, prepend a 'files/' path (used to serve via express)
var images = fs.readdirSync('./').filter(function (f) {
  return f && f[0] != '.'; // Ignore hidden files
}).map(function (f) {
  return f = 'files/' + f;
});


// start express to serve up the front-end
var app = express();

// serve the front-end folder
app.use('/', express.static(path.join(__dirname, 'front-end')));

// json point, returns array of image paths in the invoked directory
app.get('/json', function (req, res) {
  res.send(images);
});

// serve up the image files from this route
app.use('/files', express.static(process.cwd()));

// start the server
app.listen(3000, function () {
  console.log('draw away. ctrl+c to stop');
  open('http://localhost:3000/');
});
