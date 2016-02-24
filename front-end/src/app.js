var xhr = require('xhr');

window.onload = function() {
  // loadup images
  var images = [];
  var req = xhr('/json', function(err, res, body) {
    images = JSON.parse(body);
  });

  // DOM refs
  var startBtn = document.querySelector('#start-app'),
      img = document.querySelector('#img');

  // setup start button
  startBtn.onclick = function(e) {
    img.src = images[Math.floor(Math.random() * images.length)];
  }
}
