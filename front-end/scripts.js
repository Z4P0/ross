(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var xhr = require('xhr');
var Timer = require('timer.js');
var shuffle = require('knuth-shuffle').knuthShuffle;


// Find the right method, call on correct element
function launchIntoFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}


function init () {

  // loadup images
  var images = [];
  var req = xhr('/json', function (err, res, body) {
    images = JSON.parse(body);
    shuffle(images);  // randomize the order
  });


  // DOM refs
  var controlBtn = document.querySelector('#control-btn'),
      startBtn = document.querySelector('#start-btn'),
      img = document.querySelector('#img'),
      timeFeedback = document.querySelector('#time'),
      container = document.querySelector('#container');

      img.style.maxHeight = container.clientHeight + 'px';

  // warm-up intervals
  var intervals = [
        10, 10, 10, 10, 10,   // 5 images x 10 sec
        30, 30, 30, 30, 30,   // 5 images x 30 sec
        60, 60, 60,           // 3 images x 1 min
        180, 180, 180         // 3 images x 3 min
      ],
      intervalIndex = 0;  // track where we are in the intervals[]

  // check if we're paused or not
  var appState = {
    on: false,
    paused: false
  };


  function newImage() {
    // remove the last one
    images.pop();
    img.src = images[images.length - 1];
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
    ontick  : function (sec) {
      feedback(Math.floor(sec/1000) + 1, timeFeedback);
    },
    onstart : function () {
      // fade to black?
      feedback(intervals[intervalIndex], timeFeedback);
    },
    // onstop  : function () { },
    // onpause : function () { console.log('timer set on pause') },
    onend   : function () {
      intervalIndex++;
      newImage();
      if (intervalIndex >= intervals.length - 1) {
        // console.log('last warm-up image');
        this.start(intervals[intervalIndex]).on('end', function () {
          feedback('--', timeFeedback);
          newImage();
        });
      } else {
        this.start(intervals[intervalIndex]);
      }
    }
  });


  function startApp () {
    img.src = images[images.length - 1];
    timer.start(intervals[intervalIndex]);
    feedback('Pause', controlBtn);
    container.classList.toggle('active');
    launchIntoFullscreen(document.documentElement); // the whole page
    appState.on = true;
    this.style.display = 'none';
  }

  function togglePause () {
    var feedbackString = '';
    if (appState.paused) {
      timer.start();
      appState.paused = false;
      feedbackString = 'Pause';
    } else {
      timer.pause();
      appState.paused = true;
      feedbackString = 'Resume';
    }
    feedback(feedbackString, controlBtn);
  }

  function controlBtnEventHandler () {
    if (!appState.on) {
      startApp();
    } else {
      togglePause();
    }
  }


  // setup start button
  startBtn.onclick = startApp;
  controlBtn.onclick = controlBtnEventHandler;

}

window.onload = init;

},{"knuth-shuffle":5,"timer.js":8,"xhr":10}],2:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":4}],3:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],5:[function(require,module,exports){
(function (global){
/*jshint -W054 */
(function (exports) {
  'use strict';

  // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  function shuffle(array) {
    var currentIndex = array.length
      , temporaryValue
      , randomIndex
      ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  exports.knuthShuffle = shuffle;
}('undefined' !== typeof exports && exports || 'undefined' !== typeof window && window || global));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],7:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":2,"trim":9}],8:[function(require,module,exports){
(function (root, factory) {
  'use strict'
  if (typeof define === 'function' && define.amd) define([], factory)
  else if (typeof exports === 'object') module.exports = factory()
  else root.Timer = factory()
}(this, function () {
  'use strict'

  var defaultOptions = {
    tick    : 1,
    onstart : null,
    ontick  : null,
    onpause : null,
    onstop  : null,
    onend   : null
  }

  var Timer = function (options) {
    if (!(this instanceof Timer)) return new Timer(options)
    this._ = {
      id       : +new Date,
      options  : {},
      duration : 0,
      status   : 'initialized',
      start    : 0,
      measures : []
    }
    for (var prop in defaultOptions) this._.options[prop] = defaultOptions[prop]
    this.options(options)
  }

  Timer.prototype.start = function (duration) {
    if (!+duration && !this._.duration) return this
    duration && (duration *= 1000)
    if (this._.timeout && this._.status === 'started') return this
    this._.duration = duration || this._.duration
    this._.timeout = setTimeout(end.bind(this), this._.duration)
    if (typeof this._.options.ontick === 'function')
      this._.interval = setInterval(function () {
        trigger.call(this, 'ontick', this.getDuration())
      }.bind(this), +this._.options.tick * 1000)
    this._.start = +new Date
    this._.status = 'started'
    trigger.call(this, 'onstart', this.getDuration())
    return this
  }

  Timer.prototype.pause = function () {
    if (this._.status !== 'started') return this
    this._.duration -= (+new Date - this._.start)
    clear.call(this, false)
    this._.status = 'paused'
    trigger.call(this, 'onpause')
    return this
  }

  Timer.prototype.stop = function () {
    if (!/started|paused/.test(this._.status)) return this
    clear.call(this, true)
    this._.status = 'stopped'
    trigger.call(this, 'onstop')
    return this
  }

  Timer.prototype.getDuration = function () {
    if (this._.status === 'started')
      return this._.duration - (+new Date - this._.start)
    if (this._.status === 'paused') return this._.duration
    return 0
  }

  Timer.prototype.getStatus = function () {
    return this._.status
  }

  Timer.prototype.options = function (option, value) {
    if (option && value) this._.options[option] = value
    if (!value && typeof option === 'object')
      for (var prop in option)
        if (this._.options.hasOwnProperty(prop))
          this._.options[prop] = option[prop]
    return this
  }

  Timer.prototype.on = function (option, value) {
    if (typeof option !== 'string' || typeof value !== 'function') return this
    if (!(/^on/).test(option))
      option = 'on' + option
    if (this._.options.hasOwnProperty(option))
      this._.options[option] = value
    return this
  }

  Timer.prototype.off = function (option) {
    if (typeof option !== 'string') return this
    option = option.toLowerCase()
    if (option === 'all') {
      this._.options = defaultOptions
      return this
    }
    if (!(/^on/).test(option)) option = 'on' + option
    if (this._.options.hasOwnProperty(option))
      this._.options[option] = defaultOptions[option]
    return this
  }

  Timer.prototype.measureStart = function (label) {
    this._.measures[label || ''] = +new Date
    return this
  }

  Timer.prototype.measureStop = function (label) {
    return +new Date - this._.measures[label || '']
  }

  function end () {
    clear.call(this)
    this._.status = 'stopped'
    trigger.call(this, 'onend')
  }

  function trigger (event) {
    var callback = this._.options[event],
      args = [].slice.call(arguments, 1)
    typeof callback === 'function' && callback.apply(this, args)
  }

  function clear (clearDuration) {
    clearTimeout(this._.timeout)
    clearInterval(this._.interval)
    if (clearDuration === true) this._.duration = 0
  }

  return Timer
}))

},{}],9:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],10:[function(require,module,exports){
"use strict";
var window = require("global/window")
var once = require("once")
var isFunction = require("is-function")
var parseHeaders = require("parse-headers")
var xtend = require("xtend")

module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    var callback = options.callback
    if(typeof callback === "undefined"){
        throw new Error("callback argument missing")
    }
    callback = once(callback)

    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === "text" || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    var failureResponse = {
                body: undefined,
                headers: {},
                statusCode: 0,
                method: method,
                url: uri,
                rawRequest: xhr
            }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        callback(err, response, response.body)

    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data || null
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer

    if ("json" in options) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            aborted=true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr


}

function noop() {}

},{"global/window":3,"is-function":4,"once":6,"parse-headers":7,"xtend":11}],11:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[1]);
