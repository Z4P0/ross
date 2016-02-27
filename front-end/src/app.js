var xhr = require('xhr');
var Timer = require('timer.js');

window.onload = function() {

  // loadup images
  var images = [];
  var req = xhr('/json', function(err, res, body) {
    images = JSON.parse(body);
  });


  // DOM refs
  var startBtn = document.querySelector('#start-app'),
      pauseBtn = document.querySelector('#pause-app'),
      img = document.querySelector('#img'),
      timeFeedback = document.querySelector('#time');


  // warm-up intervals
  var intervals = [
        10, 10, 10, 10, 10,   // 5 images x 10 sec
        30, 30, 30, 30, 30,   // 5 images x 30 sec
        60, 60, 60,           // 3 images x 1 min
        180, 180, 180         // 3 images x 3 min
      ],
      intervalIndex = 0;  // track where we are in the intervals[]

  // check if we're paused or not
  var paused = false;

  /**
   * returns a random image from the images array
   * @return {string} image path
   */
  function randomImage() {
    return images[Math.floor(Math.random() * images.length)];
  }

  /**
   * update <span> text to show the remaining time
   */
  function feedback(text, domNode) {
    domNode.textContent = text;
  }


  // timer setup
  var timer = new Timer({
    tick    : 1,
    ontick  : function(sec) {
      feedback(Math.floor(sec/1000) + 1, timeFeedback);
    },
    onstart : function() {
      // fade to black?
      feedback(intervals[intervalIndex] + ' seconds', timeFeedback);
    },
    // onstop  : function() { },
    // onpause : function() { console.log('timer set on pause') },
    onend   : function() {
      intervalIndex++;
      img.src = randomImage();
      if (intervalIndex >= intervals.length - 1) {
        // console.log('last warm-up image');
        this.start(intervals[intervalIndex]).on('end', function() {
          feedback('--', timeFeedback);
          img.src = randomImage();
        });
      } else {
        this.start(intervals[intervalIndex]);
      }
    }
  });



  // setup start button
  startBtn.onclick = function(e) {
    img.src = randomImage();
    timer.start(intervals[intervalIndex]);
    this.style.display = 'none';
  }

  // setup pause button
  // ----------------------------------------
  pauseBtn.onclick = function(e) {
    if (paused) {
      timer.start();
      paused = false;
      feedback('Pause', pauseBtn);
    } else {
      timer.pause();
      paused = true;
      feedback('Resume', pauseBtn);
    }
  }
}
