#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var images = fs.readdirSync('./').filter(function(f){
  return f && f[0] != '.'; // Ignore hidden files
});
