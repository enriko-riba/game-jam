(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["vendors~main"],{

/***/ "./node_modules/howler/dist/howler.js":
/*!********************************************!*\
  !*** ./node_modules/howler/dist/howler.js ***!
  \********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 *  howler.js v2.1.1
 *  howlerjs.com
 *
 *  (c) 2013-2018, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {

  'use strict';

  /** Global Methods **/
  /***************************************************************************/

  /**
   * Create the global controller. All contained methods and properties apply
   * to all sounds that are currently playing or will be in the future.
   */
  var HowlerGlobal = function() {
    this.init();
  };
  HowlerGlobal.prototype = {
    /**
     * Initialize the global Howler object.
     * @return {Howler}
     */
    init: function() {
      var self = this || Howler;

      // Create a global ID counter.
      self._counter = 1000;

      // Pool of unlocked HTML5 Audio objects.
      self._html5AudioPool = [];
      self.html5PoolSize = 10;

      // Internal properties.
      self._codecs = {};
      self._howls = [];
      self._muted = false;
      self._volume = 1;
      self._canPlayEvent = 'canplaythrough';
      self._navigator = (typeof window !== 'undefined' && window.navigator) ? window.navigator : null;

      // Public properties.
      self.masterGain = null;
      self.noAudio = false;
      self.usingWebAudio = true;
      self.autoSuspend = true;
      self.ctx = null;

      // Set to false to disable the auto audio unlocker.
      self.autoUnlock = true;

      // Setup the various state values for global tracking.
      self._setup();

      return self;
    },

    /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */
    volume: function(vol) {
      var self = this || Howler;
      vol = parseFloat(vol);

      // If we don't have an AudioContext created yet, run the setup.
      if (!self.ctx) {
        setupAudioContext();
      }

      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        self._volume = vol;

        // Don't update any of the nodes if we are muted.
        if (self._muted) {
          return self;
        }

        // When using Web Audio, we just need to adjust the master gain.
        if (self.usingWebAudio) {
          self.masterGain.gain.setValueAtTime(vol, Howler.ctx.currentTime);
        }

        // Loop through and change volume for all HTML5 audio nodes.
        for (var i=0; i<self._howls.length; i++) {
          if (!self._howls[i]._webAudio) {
            // Get all of the sounds in this Howl group.
            var ids = self._howls[i]._getSoundIds();

            // Loop through all sounds and change the volumes.
            for (var j=0; j<ids.length; j++) {
              var sound = self._howls[i]._soundById(ids[j]);

              if (sound && sound._node) {
                sound._node.volume = sound._volume * vol;
              }
            }
          }
        }

        return self;
      }

      return self._volume;
    },

    /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */
    mute: function(muted) {
      var self = this || Howler;

      // If we don't have an AudioContext created yet, run the setup.
      if (!self.ctx) {
        setupAudioContext();
      }

      self._muted = muted;

      // With Web Audio, we just need to mute the master gain.
      if (self.usingWebAudio) {
        self.masterGain.gain.setValueAtTime(muted ? 0 : self._volume, Howler.ctx.currentTime);
      }

      // Loop through and mute all HTML5 Audio nodes.
      for (var i=0; i<self._howls.length; i++) {
        if (!self._howls[i]._webAudio) {
          // Get all of the sounds in this Howl group.
          var ids = self._howls[i]._getSoundIds();

          // Loop through all sounds and mark the audio node as muted.
          for (var j=0; j<ids.length; j++) {
            var sound = self._howls[i]._soundById(ids[j]);

            if (sound && sound._node) {
              sound._node.muted = (muted) ? true : sound._muted;
            }
          }
        }
      }

      return self;
    },

    /**
     * Unload and destroy all currently loaded Howl objects.
     * @return {Howler}
     */
    unload: function() {
      var self = this || Howler;

      for (var i=self._howls.length-1; i>=0; i--) {
        self._howls[i].unload();
      }

      // Create a new AudioContext to make sure it is fully reset.
      if (self.usingWebAudio && self.ctx && typeof self.ctx.close !== 'undefined') {
        self.ctx.close();
        self.ctx = null;
        setupAudioContext();
      }

      return self;
    },

    /**
     * Check for codec support of specific extension.
     * @param  {String} ext Audio file extention.
     * @return {Boolean}
     */
    codecs: function(ext) {
      return (this || Howler)._codecs[ext.replace(/^x-/, '')];
    },

    /**
     * Setup various state values for global tracking.
     * @return {Howler}
     */
    _setup: function() {
      var self = this || Howler;

      // Keeps track of the suspend/resume state of the AudioContext.
      self.state = self.ctx ? self.ctx.state || 'suspended' : 'suspended';

      // Automatically begin the 30-second suspend process
      self._autoSuspend();

      // Check if audio is available.
      if (!self.usingWebAudio) {
        // No audio is available on this system if noAudio is set to true.
        if (typeof Audio !== 'undefined') {
          try {
            var test = new Audio();

            // Check if the canplaythrough event is available.
            if (typeof test.oncanplaythrough === 'undefined') {
              self._canPlayEvent = 'canplay';
            }
          } catch(e) {
            self.noAudio = true;
          }
        } else {
          self.noAudio = true;
        }
      }

      // Test to make sure audio isn't disabled in Internet Explorer.
      try {
        var test = new Audio();
        if (test.muted) {
          self.noAudio = true;
        }
      } catch (e) {}

      // Check for supported codecs.
      if (!self.noAudio) {
        self._setupCodecs();
      }

      return self;
    },

    /**
     * Check for browser support for various codecs and cache the results.
     * @return {Howler}
     */
    _setupCodecs: function() {
      var self = this || Howler;
      var audioTest = null;

      // Must wrap in a try/catch because IE11 in server mode throws an error.
      try {
        audioTest = (typeof Audio !== 'undefined') ? new Audio() : null;
      } catch (err) {
        return self;
      }

      if (!audioTest || typeof audioTest.canPlayType !== 'function') {
        return self;
      }

      var mpegTest = audioTest.canPlayType('audio/mpeg;').replace(/^no$/, '');

      // Opera version <33 has mixed MP3 support, so we need to check for and block it.
      var checkOpera = self._navigator && self._navigator.userAgent.match(/OPR\/([0-6].)/g);
      var isOldOpera = (checkOpera && parseInt(checkOpera[0].split('/')[1], 10) < 33);

      self._codecs = {
        mp3: !!(!isOldOpera && (mpegTest || audioTest.canPlayType('audio/mp3;').replace(/^no$/, ''))),
        mpeg: !!mpegTest,
        opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
        ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        oga: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
        aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
        caf: !!audioTest.canPlayType('audio/x-caf;').replace(/^no$/, ''),
        m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
        webm: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
        dolby: !!audioTest.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ''),
        flac: !!(audioTest.canPlayType('audio/x-flac;') || audioTest.canPlayType('audio/flac;')).replace(/^no$/, '')
      };

      return self;
    },

    /**
     * Some browsers/devices will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */
    _unlockAudio: function() {
      var self = this || Howler;

      // Only run this on certain browsers/devices.
      var shouldUnlock = /iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk|Mobi|Chrome|Safari/i.test(self._navigator && self._navigator.userAgent);
      if (self._audioUnlocked || !self.ctx || !shouldUnlock) {
        return;
      }

      self._audioUnlocked = false;
      self.autoUnlock = false;

      // Some mobile devices/platforms have distortion issues when opening/closing tabs and/or web views.
      // Bugs in the browser (especially Mobile Safari) can cause the sampleRate to change from 44100 to 48000.
      // By calling Howler.unload(), we create a new AudioContext with the correct sampleRate.
      if (!self._mobileUnloaded && self.ctx.sampleRate !== 44100) {
        self._mobileUnloaded = true;
        self.unload();
      }

      // Scratch buffer for enabling iOS to dispose of web audio buffers correctly, as per:
      // http://stackoverflow.com/questions/24119684
      self._scratchBuffer = self.ctx.createBuffer(1, 1, 22050);

      // Call this method on touch start to create and play a buffer,
      // then check if the audio actually played to determine if
      // audio has now been unlocked on iOS, Android, etc.
      var unlock = function(e) {
        // Create a pool of unlocked HTML5 Audio objects that can
        // be used for playing sounds without user interaction. HTML5
        // Audio objects must be individually unlocked, as opposed
        // to the WebAudio API which only needs a single activation.
        // This must occur before WebAudio setup or the source.onended
        // event will not fire.
        for (var i=0; i<self.html5PoolSize; i++) {
          var audioNode = new Audio();

          // Mark this Audio object as unlocked to ensure it can get returned
          // to the unlocked pool when released.
          audioNode._unlocked = true;

          // Add the audio node to the pool.
          self._releaseHtml5Audio(audioNode);
        }

        // Loop through any assigned audio nodes and unlock them.
        for (var i=0; i<self._howls.length; i++) {
          if (!self._howls[i]._webAudio) {
            // Get all of the sounds in this Howl group.
            var ids = self._howls[i]._getSoundIds();

            // Loop through all sounds and unlock the audio nodes.
            for (var j=0; j<ids.length; j++) {
              var sound = self._howls[i]._soundById(ids[j]);

              if (sound && sound._node && !sound._node._unlocked) {
                sound._node._unlocked = true;
                sound._node.load();
              }
            }
          }
        }

        // Fix Android can not play in suspend state.
        self._autoResume();

        // Create an empty buffer.
        var source = self.ctx.createBufferSource();
        source.buffer = self._scratchBuffer;
        source.connect(self.ctx.destination);

        // Play the empty buffer.
        if (typeof source.start === 'undefined') {
          source.noteOn(0);
        } else {
          source.start(0);
        }

        // Calling resume() on a stack initiated by user gesture is what actually unlocks the audio on Android Chrome >= 55.
        if (typeof self.ctx.resume === 'function') {
          self.ctx.resume();
        }

        // Setup a timeout to check that we are unlocked on the next event loop.
        source.onended = function() {
          source.disconnect(0);

          // Update the unlocked state and prevent this check from happening again.
          self._audioUnlocked = true;

          // Remove the touch start listener.
          document.removeEventListener('touchstart', unlock, true);
          document.removeEventListener('touchend', unlock, true);
          document.removeEventListener('click', unlock, true);

          // Let all sounds know that audio has been unlocked.
          for (var i=0; i<self._howls.length; i++) {
            self._howls[i]._emit('unlock');
          }
        };
      };

      // Setup a touch start listener to attempt an unlock in.
      document.addEventListener('touchstart', unlock, true);
      document.addEventListener('touchend', unlock, true);
      document.addEventListener('click', unlock, true);

      return self;
    },

    /**
     * Get an unlocked HTML5 Audio object from the pool. If none are left,
     * return a new Audio object and throw a warning.
     * @return {Audio} HTML5 Audio object.
     */
    _obtainHtml5Audio: function() {
      var self = this || Howler;

      // Return the next object from the pool if one exists.
      if (self._html5AudioPool.length) {
        return self._html5AudioPool.pop();
      }

      //.Check if the audio is locked and throw a warning.
      var testPlay = new Audio().play();
      if (testPlay && typeof Promise !== 'undefined' && (testPlay instanceof Promise || typeof testPlay.then === 'function')) {
        testPlay.catch(function() {
          console.warn('HTML5 Audio pool exhausted, returning potentially locked audio object.');
        });
      }

      return new Audio();
    },

    /**
     * Return an activated HTML5 Audio object to the pool.
     * @return {Howler}
     */
    _releaseHtml5Audio: function(audio) {
      var self = this || Howler;

      // Don't add audio to the pool if we don't know if it has been unlocked.
      if (audio._unlocked) {
        self._html5AudioPool.push(audio);
      }

      return self;
    },

    /**
     * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
     * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
     * @return {Howler}
     */
    _autoSuspend: function() {
      var self = this;

      if (!self.autoSuspend || !self.ctx || typeof self.ctx.suspend === 'undefined' || !Howler.usingWebAudio) {
        return;
      }

      // Check if any sounds are playing.
      for (var i=0; i<self._howls.length; i++) {
        if (self._howls[i]._webAudio) {
          for (var j=0; j<self._howls[i]._sounds.length; j++) {
            if (!self._howls[i]._sounds[j]._paused) {
              return self;
            }
          }
        }
      }

      if (self._suspendTimer) {
        clearTimeout(self._suspendTimer);
      }

      // If no sound has played after 30 seconds, suspend the context.
      self._suspendTimer = setTimeout(function() {
        if (!self.autoSuspend) {
          return;
        }

        self._suspendTimer = null;
        self.state = 'suspending';
        self.ctx.suspend().then(function() {
          self.state = 'suspended';

          if (self._resumeAfterSuspend) {
            delete self._resumeAfterSuspend;
            self._autoResume();
          }
        });
      }, 30000);

      return self;
    },

    /**
     * Automatically resume the Web Audio AudioContext when a new sound is played.
     * @return {Howler}
     */
    _autoResume: function() {
      var self = this;

      if (!self.ctx || typeof self.ctx.resume === 'undefined' || !Howler.usingWebAudio) {
        return;
      }

      if (self.state === 'running' && self._suspendTimer) {
        clearTimeout(self._suspendTimer);
        self._suspendTimer = null;
      } else if (self.state === 'suspended') {
        self.ctx.resume().then(function() {
          self.state = 'running';

          // Emit to all Howls that the audio has resumed.
          for (var i=0; i<self._howls.length; i++) {
            self._howls[i]._emit('resume');
          }
        });

        if (self._suspendTimer) {
          clearTimeout(self._suspendTimer);
          self._suspendTimer = null;
        }
      } else if (self.state === 'suspending') {
        self._resumeAfterSuspend = true;
      }

      return self;
    }
  };

  // Setup the global audio controller.
  var Howler = new HowlerGlobal();

  /** Group Methods **/
  /***************************************************************************/

  /**
   * Create an audio group controller.
   * @param {Object} o Passed in properties for this group.
   */
  var Howl = function(o) {
    var self = this;

    // Throw an error if no source is provided.
    if (!o.src || o.src.length === 0) {
      console.error('An array of source files must be passed with any new Howl.');
      return;
    }

    self.init(o);
  };
  Howl.prototype = {
    /**
     * Initialize a new Howl group object.
     * @param  {Object} o Passed in properties for this group.
     * @return {Howl}
     */
    init: function(o) {
      var self = this;

      // If we don't have an AudioContext created yet, run the setup.
      if (!Howler.ctx) {
        setupAudioContext();
      }

      // Setup user-defined default properties.
      self._autoplay = o.autoplay || false;
      self._format = (typeof o.format !== 'string') ? o.format : [o.format];
      self._html5 = o.html5 || false;
      self._muted = o.mute || false;
      self._loop = o.loop || false;
      self._pool = o.pool || 5;
      self._preload = (typeof o.preload === 'boolean') ? o.preload : true;
      self._rate = o.rate || 1;
      self._sprite = o.sprite || {};
      self._src = (typeof o.src !== 'string') ? o.src : [o.src];
      self._volume = o.volume !== undefined ? o.volume : 1;
      self._xhrWithCredentials = o.xhrWithCredentials || false;

      // Setup all other default properties.
      self._duration = 0;
      self._state = 'unloaded';
      self._sounds = [];
      self._endTimers = {};
      self._queue = [];
      self._playLock = false;

      // Setup event listeners.
      self._onend = o.onend ? [{fn: o.onend}] : [];
      self._onfade = o.onfade ? [{fn: o.onfade}] : [];
      self._onload = o.onload ? [{fn: o.onload}] : [];
      self._onloaderror = o.onloaderror ? [{fn: o.onloaderror}] : [];
      self._onplayerror = o.onplayerror ? [{fn: o.onplayerror}] : [];
      self._onpause = o.onpause ? [{fn: o.onpause}] : [];
      self._onplay = o.onplay ? [{fn: o.onplay}] : [];
      self._onstop = o.onstop ? [{fn: o.onstop}] : [];
      self._onmute = o.onmute ? [{fn: o.onmute}] : [];
      self._onvolume = o.onvolume ? [{fn: o.onvolume}] : [];
      self._onrate = o.onrate ? [{fn: o.onrate}] : [];
      self._onseek = o.onseek ? [{fn: o.onseek}] : [];
      self._onunlock = o.onunlock ? [{fn: o.onunlock}] : [];
      self._onresume = [];

      // Web Audio or HTML5 Audio?
      self._webAudio = Howler.usingWebAudio && !self._html5;

      // Automatically try to enable audio.
      if (typeof Howler.ctx !== 'undefined' && Howler.ctx && Howler.autoUnlock) {
        Howler._unlockAudio();
      }

      // Keep track of this Howl group in the global controller.
      Howler._howls.push(self);

      // If they selected autoplay, add a play event to the load queue.
      if (self._autoplay) {
        self._queue.push({
          event: 'play',
          action: function() {
            self.play();
          }
        });
      }

      // Load the source file unless otherwise specified.
      if (self._preload) {
        self.load();
      }

      return self;
    },

    /**
     * Load the audio file.
     * @return {Howler}
     */
    load: function() {
      var self = this;
      var url = null;

      // If no audio is available, quit immediately.
      if (Howler.noAudio) {
        self._emit('loaderror', null, 'No audio support.');
        return;
      }

      // Make sure our source is in an array.
      if (typeof self._src === 'string') {
        self._src = [self._src];
      }

      // Loop through the sources and pick the first one that is compatible.
      for (var i=0; i<self._src.length; i++) {
        var ext, str;

        if (self._format && self._format[i]) {
          // If an extension was specified, use that instead.
          ext = self._format[i];
        } else {
          // Make sure the source is a string.
          str = self._src[i];
          if (typeof str !== 'string') {
            self._emit('loaderror', null, 'Non-string found in selected audio sources - ignoring.');
            continue;
          }

          // Extract the file extension from the URL or base64 data URI.
          ext = /^data:audio\/([^;,]+);/i.exec(str);
          if (!ext) {
            ext = /\.([^.]+)$/.exec(str.split('?', 1)[0]);
          }

          if (ext) {
            ext = ext[1].toLowerCase();
          }
        }

        // Log a warning if no extension was found.
        if (!ext) {
          console.warn('No file extension was found. Consider using the "format" property or specify an extension.');
        }

        // Check if this extension is available.
        if (ext && Howler.codecs(ext)) {
          url = self._src[i];
          break;
        }
      }

      if (!url) {
        self._emit('loaderror', null, 'No codec support for selected audio sources.');
        return;
      }

      self._src = url;
      self._state = 'loading';

      // If the hosting page is HTTPS and the source isn't,
      // drop down to HTML5 Audio to avoid Mixed Content errors.
      if (window.location.protocol === 'https:' && url.slice(0, 5) === 'http:') {
        self._html5 = true;
        self._webAudio = false;
      }

      // Create a new sound object and add it to the pool.
      new Sound(self);

      // Load and decode the audio data for playback.
      if (self._webAudio) {
        loadBuffer(self);
      }

      return self;
    },

    /**
     * Play a sound or resume previous playback.
     * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Number}          Sound ID.
     */
    play: function(sprite, internal) {
      var self = this;
      var id = null;

      // Determine if a sprite, sound id or nothing was passed
      if (typeof sprite === 'number') {
        id = sprite;
        sprite = null;
      } else if (typeof sprite === 'string' && self._state === 'loaded' && !self._sprite[sprite]) {
        // If the passed sprite doesn't exist, do nothing.
        return null;
      } else if (typeof sprite === 'undefined') {
        // Use the default sound sprite (plays the full audio length).
        sprite = '__default';

        // Check if there is a single paused sound that isn't ended. 
        // If there is, play that sound. If not, continue as usual.  
        if (!self._playLock) {
          var num = 0;
          for (var i=0; i<self._sounds.length; i++) {
            if (self._sounds[i]._paused && !self._sounds[i]._ended) {
              num++;
              id = self._sounds[i]._id;
            }
          }

          if (num === 1) {
            sprite = null;
          } else {
            id = null;
          }
        }
      }

      // Get the selected node, or get one from the pool.
      var sound = id ? self._soundById(id) : self._inactiveSound();

      // If the sound doesn't exist, do nothing.
      if (!sound) {
        return null;
      }

      // Select the sprite definition.
      if (id && !sprite) {
        sprite = sound._sprite || '__default';
      }

      // If the sound hasn't loaded, we must wait to get the audio's duration.
      // We also need to wait to make sure we don't run into race conditions with
      // the order of function calls.
      if (self._state !== 'loaded') {
        // Set the sprite value on this sound.
        sound._sprite = sprite;

        // Mark this sound as not ended in case another sound is played before this one loads.
        sound._ended = false;

        // Add the sound to the queue to be played on load.
        var soundId = sound._id;
        self._queue.push({
          event: 'play',
          action: function() {
            self.play(soundId);
          }
        });

        return soundId;
      }

      // Don't play the sound if an id was passed and it is already playing.
      if (id && !sound._paused) {
        // Trigger the play event, in order to keep iterating through queue.
        if (!internal) {
          self._loadQueue('play');
        }

        return sound._id;
      }

      // Make sure the AudioContext isn't suspended, and resume it if it is.
      if (self._webAudio) {
        Howler._autoResume();
      }

      // Determine how long to play for and where to start playing.
      var seek = Math.max(0, sound._seek > 0 ? sound._seek : self._sprite[sprite][0] / 1000);
      var duration = Math.max(0, ((self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000) - seek);
      var timeout = (duration * 1000) / Math.abs(sound._rate);
      var start = self._sprite[sprite][0] / 1000;
      var stop = (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000;
      var loop = !!(sound._loop || self._sprite[sprite][2]);
      sound._sprite = sprite;

      // Mark the sound as ended instantly so that this async playback
      // doesn't get grabbed by another call to play while this one waits to start.
      sound._ended = false;

      // Update the parameters of the sound.
      var setParams = function() {
        sound._paused = false;
        sound._seek = seek;
        sound._start = start;
        sound._stop = stop;
        sound._loop = loop;
      };

      // End the sound instantly if seek is at the end.
      if (seek >= stop) {
        self._ended(sound);
        return;
      }

      // Begin the actual playback.
      var node = sound._node;
      if (self._webAudio) {
        // Fire this when the sound is ready to play to begin Web Audio playback.
        var playWebAudio = function() {
          self._playLock = false;
          setParams();
          self._refreshBuffer(sound);

          // Setup the playback params.
          var vol = (sound._muted || self._muted) ? 0 : sound._volume;
          node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
          sound._playStart = Howler.ctx.currentTime;

          // Play the sound using the supported method.
          if (typeof node.bufferSource.start === 'undefined') {
            sound._loop ? node.bufferSource.noteGrainOn(0, seek, 86400) : node.bufferSource.noteGrainOn(0, seek, duration);
          } else {
            sound._loop ? node.bufferSource.start(0, seek, 86400) : node.bufferSource.start(0, seek, duration);
          }

          // Start a new timer if none is present.
          if (timeout !== Infinity) {
            self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
          }

          if (!internal) {
            setTimeout(function() {
              self._emit('play', sound._id);
              self._loadQueue();
            }, 0);
          }
        };

        if (Howler.state === 'running') {
          playWebAudio();
        } else {
          self._playLock = true;

          // Wait for the audio context to resume before playing.
          self.once('resume', playWebAudio);

          // Cancel the end timer.
          self._clearTimer(sound._id);
        }
      } else {
        // Fire this when the sound is ready to play to begin HTML5 Audio playback.
        var playHtml5 = function() {
          node.currentTime = seek;
          node.muted = sound._muted || self._muted || Howler._muted || node.muted;
          node.volume = sound._volume * Howler.volume();
          node.playbackRate = sound._rate;

          // Some browsers will throw an error if this is called without user interaction.
          try {
            var play = node.play();

            // Support older browsers that don't support promises, and thus don't have this issue.
            if (play && typeof Promise !== 'undefined' && (play instanceof Promise || typeof play.then === 'function')) {
              // Implements a lock to prevent DOMException: The play() request was interrupted by a call to pause().
              self._playLock = true;

              // Set param values immediately.
              setParams();

              // Releases the lock and executes queued actions.
              play
                .then(function() {
                  self._playLock = false;
                  node._unlocked = true;
                  if (!internal) {
                    self._emit('play', sound._id);
                    self._loadQueue();
                  }
                })
                .catch(function() {
                  self._playLock = false;
                  self._emit('playerror', sound._id, 'Playback was unable to start. This is most commonly an issue ' +
                    'on mobile devices and Chrome where playback was not within a user interaction.');

                  // Reset the ended and paused values.
                  sound._ended = true;
                  sound._paused = true;
                });
            } else if (!internal) {
              self._playLock = false;
              setParams();
              self._emit('play', sound._id);
              self._loadQueue();
            }

            // Setting rate before playing won't work in IE, so we set it again here.
            node.playbackRate = sound._rate;

            // If the node is still paused, then we can assume there was a playback issue.
            if (node.paused) {
              self._emit('playerror', sound._id, 'Playback was unable to start. This is most commonly an issue ' +
                'on mobile devices and Chrome where playback was not within a user interaction.');
              return;
            }

            // Setup the end timer on sprites or listen for the ended event.
            if (sprite !== '__default' || sound._loop) {
              self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
            } else {
              self._endTimers[sound._id] = function() {
                // Fire ended on this audio node.
                self._ended(sound);

                // Clear this listener.
                node.removeEventListener('ended', self._endTimers[sound._id], false);
              };
              node.addEventListener('ended', self._endTimers[sound._id], false);
            }
          } catch (err) {
            self._emit('playerror', sound._id, err);
          }
        };

        // Play immediately if ready, or wait for the 'canplaythrough'e vent.
        var loadedNoReadyState = (window && window.ejecta) || (!node.readyState && Howler._navigator.isCocoonJS);
        if (node.readyState >= 3 || loadedNoReadyState) {
          playHtml5();
        } else {
          self._playLock = true;

          var listener = function() {
            // Begin playback.
            playHtml5();

            // Clear this listener.
            node.removeEventListener(Howler._canPlayEvent, listener, false);
          };
          node.addEventListener(Howler._canPlayEvent, listener, false);

          // Cancel the end timer.
          self._clearTimer(sound._id);
        }
      }

      return sound._id;
    },

    /**
     * Pause playback and save current position.
     * @param  {Number} id The sound ID (empty to pause all in group).
     * @return {Howl}
     */
    pause: function(id) {
      var self = this;

      // If the sound hasn't loaded or a play() promise is pending, add it to the load queue to pause when capable.
      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'pause',
          action: function() {
            self.pause(id);
          }
        });

        return self;
      }

      // If no id is passed, get all ID's to be paused.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]);

        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound && !sound._paused) {
          // Reset the seek position.
          sound._seek = self.seek(ids[i]);
          sound._rateSeek = 0;
          sound._paused = true;

          // Stop currently running fades.
          self._stopFade(ids[i]);

          if (sound._node) {
            if (self._webAudio) {
              // Make sure the sound has been created.
              if (!sound._node.bufferSource) {
                continue;
              }

              if (typeof sound._node.bufferSource.stop === 'undefined') {
                sound._node.bufferSource.noteOff(0);
              } else {
                sound._node.bufferSource.stop(0);
              }

              // Clean up the buffer source.
              self._cleanBuffer(sound._node);
            } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
              sound._node.pause();
            }
          }
        }

        // Fire the pause event, unless `true` is passed as the 2nd argument.
        if (!arguments[1]) {
          self._emit('pause', sound ? sound._id : null);
        }
      }

      return self;
    },

    /**
     * Stop playback and reset to start.
     * @param  {Number} id The sound ID (empty to stop all in group).
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Howl}
     */
    stop: function(id, internal) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to stop when capable.
      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'stop',
          action: function() {
            self.stop(id);
          }
        });

        return self;
      }

      // If no id is passed, get all ID's to be stopped.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]);

        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound) {
          // Reset the seek position.
          sound._seek = sound._start || 0;
          sound._rateSeek = 0;
          sound._paused = true;
          sound._ended = true;

          // Stop currently running fades.
          self._stopFade(ids[i]);

          if (sound._node) {
            if (self._webAudio) {
              // Make sure the sound's AudioBufferSourceNode has been created.
              if (sound._node.bufferSource) {
                if (typeof sound._node.bufferSource.stop === 'undefined') {
                  sound._node.bufferSource.noteOff(0);
                } else {
                  sound._node.bufferSource.stop(0);
                }

                // Clean up the buffer source.
                self._cleanBuffer(sound._node);
              }
            } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
              sound._node.currentTime = sound._start || 0;
              sound._node.pause();
            }
          }

          if (!internal) {
            self._emit('stop', sound._id);
          }
        }
      }

      return self;
    },

    /**
     * Mute/unmute a single sound or all sounds in this Howl group.
     * @param  {Boolean} muted Set to true to mute and false to unmute.
     * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
     * @return {Howl}
     */
    mute: function(muted, id) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to mute when capable.
      if (self._state !== 'loaded'|| self._playLock) {
        self._queue.push({
          event: 'mute',
          action: function() {
            self.mute(muted, id);
          }
        });

        return self;
      }

      // If applying mute/unmute to all sounds, update the group's value.
      if (typeof id === 'undefined') {
        if (typeof muted === 'boolean') {
          self._muted = muted;
        } else {
          return self._muted;
        }
      }

      // If no id is passed, get all ID's to be muted.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound) {
          sound._muted = muted;

          // Cancel active fade and set the volume to the end value.
          if (sound._interval) {
            self._stopFade(sound._id);
          }

          if (self._webAudio && sound._node) {
            sound._node.gain.setValueAtTime(muted ? 0 : sound._volume, Howler.ctx.currentTime);
          } else if (sound._node) {
            sound._node.muted = Howler._muted ? true : muted;
          }

          self._emit('mute', sound._id);
        }
      }

      return self;
    },

    /**
     * Get/set the volume of this sound or of the Howl group. This method can optionally take 0, 1 or 2 arguments.
     *   volume() -> Returns the group's volume value.
     *   volume(id) -> Returns the sound id's current volume.
     *   volume(vol) -> Sets the volume of all sounds in this Howl group.
     *   volume(vol, id) -> Sets the volume of passed sound id.
     * @return {Howl/Number} Returns self or current volume.
     */
    volume: function() {
      var self = this;
      var args = arguments;
      var vol, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // Return the value of the groups' volume.
        return self._volume;
      } else if (args.length === 1 || args.length === 2 && typeof args[1] === 'undefined') {
        // First check if this is an ID, and if not, assume it is a new volume.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          vol = parseFloat(args[0]);
        }
      } else if (args.length >= 2) {
        vol = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // Update the volume or return the current volume.
      var sound;
      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        // If the sound hasn't loaded, add it to the load queue to change volume when capable.
        if (self._state !== 'loaded'|| self._playLock) {
          self._queue.push({
            event: 'volume',
            action: function() {
              self.volume.apply(self, args);
            }
          });

          return self;
        }

        // Set the group volume.
        if (typeof id === 'undefined') {
          self._volume = vol;
        }

        // Update one or all volumes.
        id = self._getSoundIds(id);
        for (var i=0; i<id.length; i++) {
          // Get the sound.
          sound = self._soundById(id[i]);

          if (sound) {
            sound._volume = vol;

            // Stop currently running fades.
            if (!args[2]) {
              self._stopFade(id[i]);
            }

            if (self._webAudio && sound._node && !sound._muted) {
              sound._node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
            } else if (sound._node && !sound._muted) {
              sound._node.volume = vol * Howler.volume();
            }

            self._emit('volume', sound._id);
          }
        }
      } else {
        sound = id ? self._soundById(id) : self._sounds[0];
        return sound ? sound._volume : 0;
      }

      return self;
    },

    /**
     * Fade a currently playing sound between two volumes (if no id is passsed, all sounds will fade).
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id (omit to fade all sounds).
     * @return {Howl}
     */
    fade: function(from, to, len, id) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to fade when capable.
      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'fade',
          action: function() {
            self.fade(from, to, len, id);
          }
        });

        return self;
      }

      // Make sure the to/from/len values are numbers.
      from = parseFloat(from);
      to = parseFloat(to);
      len = parseFloat(len);

      // Set the volume to the start position.
      self.volume(from, id);

      // Fade the volume of one or all sounds.
      var ids = self._getSoundIds(id);
      for (var i=0; i<ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]);

        // Create a linear fade or fall back to timeouts with HTML5 Audio.
        if (sound) {
          // Stop the previous fade if no sprite is being used (otherwise, volume handles this).
          if (!id) {
            self._stopFade(ids[i]);
          }

          // If we are using Web Audio, let the native methods do the actual fade.
          if (self._webAudio && !sound._muted) {
            var currentTime = Howler.ctx.currentTime;
            var end = currentTime + (len / 1000);
            sound._volume = from;
            sound._node.gain.setValueAtTime(from, currentTime);
            sound._node.gain.linearRampToValueAtTime(to, end);
          }

          self._startFadeInterval(sound, from, to, len, ids[i], typeof id === 'undefined');
        }
      }

      return self;
    },

    /**
     * Starts the internal interval to fade a sound.
     * @param  {Object} sound Reference to sound to fade.
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id to fade.
     * @param  {Boolean} isGroup   If true, set the volume on the group.
     */
    _startFadeInterval: function(sound, from, to, len, id, isGroup) {
      var self = this;
      var vol = from;
      var diff = to - from;
      var steps = Math.abs(diff / 0.01);
      var stepLen = Math.max(4, (steps > 0) ? len / steps : len);
      var lastTick = Date.now();

      // Store the value being faded to.
      sound._fadeTo = to;

      // Update the volume value on each interval tick.
      sound._interval = setInterval(function() {
        // Update the volume based on the time since the last tick.
        var tick = (Date.now() - lastTick) / len;
        lastTick = Date.now();
        vol += diff * tick;

        // Make sure the volume is in the right bounds.
        vol = Math.max(0, vol);
        vol = Math.min(1, vol);

        // Round to within 2 decimal points.
        vol = Math.round(vol * 100) / 100;

        // Change the volume.
        if (self._webAudio) {
          sound._volume = vol;
        } else {
          self.volume(vol, sound._id, true);
        }

        // Set the group's volume.
        if (isGroup) {
          self._volume = vol;
        }

        // When the fade is complete, stop it and fire event.
        if ((to < from && vol <= to) || (to > from && vol >= to)) {
          clearInterval(sound._interval);
          sound._interval = null;
          sound._fadeTo = null;
          self.volume(to, sound._id);
          self._emit('fade', sound._id);
        }
      }, stepLen);
    },

    /**
     * Internal method that stops the currently playing fade when
     * a new fade starts, volume is changed or the sound is stopped.
     * @param  {Number} id The sound id.
     * @return {Howl}
     */
    _stopFade: function(id) {
      var self = this;
      var sound = self._soundById(id);

      if (sound && sound._interval) {
        if (self._webAudio) {
          sound._node.gain.cancelScheduledValues(Howler.ctx.currentTime);
        }

        clearInterval(sound._interval);
        sound._interval = null;
        self.volume(sound._fadeTo, id);
        sound._fadeTo = null;
        self._emit('fade', id);
      }

      return self;
    },

    /**
     * Get/set the loop parameter on a sound. This method can optionally take 0, 1 or 2 arguments.
     *   loop() -> Returns the group's loop value.
     *   loop(id) -> Returns the sound id's loop value.
     *   loop(loop) -> Sets the loop value for all sounds in this Howl group.
     *   loop(loop, id) -> Sets the loop value of passed sound id.
     * @return {Howl/Boolean} Returns self or current loop value.
     */
    loop: function() {
      var self = this;
      var args = arguments;
      var loop, id, sound;

      // Determine the values for loop and id.
      if (args.length === 0) {
        // Return the grou's loop value.
        return self._loop;
      } else if (args.length === 1) {
        if (typeof args[0] === 'boolean') {
          loop = args[0];
          self._loop = loop;
        } else {
          // Return this sound's loop value.
          sound = self._soundById(parseInt(args[0], 10));
          return sound ? sound._loop : false;
        }
      } else if (args.length === 2) {
        loop = args[0];
        id = parseInt(args[1], 10);
      }

      // If no id is passed, get all ID's to be looped.
      var ids = self._getSoundIds(id);
      for (var i=0; i<ids.length; i++) {
        sound = self._soundById(ids[i]);

        if (sound) {
          sound._loop = loop;
          if (self._webAudio && sound._node && sound._node.bufferSource) {
            sound._node.bufferSource.loop = loop;
            if (loop) {
              sound._node.bufferSource.loopStart = sound._start || 0;
              sound._node.bufferSource.loopEnd = sound._stop;
            }
          }
        }
      }

      return self;
    },

    /**
     * Get/set the playback rate of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   rate() -> Returns the first sound node's current playback rate.
     *   rate(id) -> Returns the sound id's current playback rate.
     *   rate(rate) -> Sets the playback rate of all sounds in this Howl group.
     *   rate(rate, id) -> Sets the playback rate of passed sound id.
     * @return {Howl/Number} Returns self or the current playback rate.
     */
    rate: function() {
      var self = this;
      var args = arguments;
      var rate, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // We will simply return the current rate of the first node.
        id = self._sounds[0]._id;
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new rate value.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          rate = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        rate = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // Update the playback rate or return the current value.
      var sound;
      if (typeof rate === 'number') {
        // If the sound hasn't loaded, add it to the load queue to change playback rate when capable.
        if (self._state !== 'loaded' || self._playLock) {
          self._queue.push({
            event: 'rate',
            action: function() {
              self.rate.apply(self, args);
            }
          });

          return self;
        }

        // Set the group rate.
        if (typeof id === 'undefined') {
          self._rate = rate;
        }

        // Update one or all volumes.
        id = self._getSoundIds(id);
        for (var i=0; i<id.length; i++) {
          // Get the sound.
          sound = self._soundById(id[i]);

          if (sound) {
            // Keep track of our position when the rate changed and update the playback
            // start position so we can properly adjust the seek position for time elapsed.
            if (self.playing(id[i])) {
              sound._rateSeek = self.seek(id[i]);
              sound._playStart = self._webAudio ? Howler.ctx.currentTime : sound._playStart;
            }
            sound._rate = rate;

            // Change the playback rate.
            if (self._webAudio && sound._node && sound._node.bufferSource) {
              sound._node.bufferSource.playbackRate.setValueAtTime(rate, Howler.ctx.currentTime);
            } else if (sound._node) {
              sound._node.playbackRate = rate;
            }

            // Reset the timers.
            var seek = self.seek(id[i]);
            var duration = ((self._sprite[sound._sprite][0] + self._sprite[sound._sprite][1]) / 1000) - seek;
            var timeout = (duration * 1000) / Math.abs(sound._rate);

            // Start a new end timer if sound is already playing.
            if (self._endTimers[id[i]] || !sound._paused) {
              self._clearTimer(id[i]);
              self._endTimers[id[i]] = setTimeout(self._ended.bind(self, sound), timeout);
            }

            self._emit('rate', sound._id);
          }
        }
      } else {
        sound = self._soundById(id);
        return sound ? sound._rate : self._rate;
      }

      return self;
    },

    /**
     * Get/set the seek position of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   seek() -> Returns the first sound node's current seek position.
     *   seek(id) -> Returns the sound id's current seek position.
     *   seek(seek) -> Sets the seek position of the first sound node.
     *   seek(seek, id) -> Sets the seek position of passed sound id.
     * @return {Howl/Number} Returns self or the current seek position.
     */
    seek: function() {
      var self = this;
      var args = arguments;
      var seek, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // We will simply return the current position of the first node.
        id = self._sounds[0]._id;
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new seek position.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else if (self._sounds.length) {
          id = self._sounds[0]._id;
          seek = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        seek = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // If there is no ID, bail out.
      if (typeof id === 'undefined') {
        return self;
      }

      // If the sound hasn't loaded, add it to the load queue to seek when capable.
      if (self._state !== 'loaded' || self._playLock) {
        self._queue.push({
          event: 'seek',
          action: function() {
            self.seek.apply(self, args);
          }
        });

        return self;
      }

      // Get the sound.
      var sound = self._soundById(id);

      if (sound) {
        if (typeof seek === 'number' && seek >= 0) {
          // Pause the sound and update position for restarting playback.
          var playing = self.playing(id);
          if (playing) {
            self.pause(id, true);
          }

          // Move the position of the track and cancel timer.
          sound._seek = seek;
          sound._ended = false;
          self._clearTimer(id);

          // Update the seek position for HTML5 Audio.
          if (!self._webAudio && sound._node && !isNaN(sound._node.duration)) {
            sound._node.currentTime = seek;
          }

          // Seek and emit when ready.
          var seekAndEmit = function() {
            self._emit('seek', id);

            // Restart the playback if the sound was playing.
            if (playing) {
              self.play(id, true);
            }
          };

          // Wait for the play lock to be unset before emitting (HTML5 Audio).
          if (playing && !self._webAudio) {
            var emitSeek = function() {
              if (!self._playLock) {
                seekAndEmit();
              } else {
                setTimeout(emitSeek, 0);
              }
            };
            setTimeout(emitSeek, 0);
          } else {
            seekAndEmit();
          }
        } else {
          if (self._webAudio) {
            var realTime = self.playing(id) ? Howler.ctx.currentTime - sound._playStart : 0;
            var rateSeek = sound._rateSeek ? sound._rateSeek - sound._seek : 0;
            return sound._seek + (rateSeek + realTime * Math.abs(sound._rate));
          } else {
            return sound._node.currentTime;
          }
        }
      }

      return self;
    },

    /**
     * Check if a specific sound is currently playing or not (if id is provided), or check if at least one of the sounds in the group is playing or not.
     * @param  {Number}  id The sound id to check. If none is passed, the whole sound group is checked.
     * @return {Boolean} True if playing and false if not.
     */
    playing: function(id) {
      var self = this;

      // Check the passed sound ID (if any).
      if (typeof id === 'number') {
        var sound = self._soundById(id);
        return sound ? !sound._paused : false;
      }

      // Otherwise, loop through all sounds and check if any are playing.
      for (var i=0; i<self._sounds.length; i++) {
        if (!self._sounds[i]._paused) {
          return true;
        }
      }

      return false;
    },

    /**
     * Get the duration of this sound. Passing a sound id will return the sprite duration.
     * @param  {Number} id The sound id to check. If none is passed, return full source duration.
     * @return {Number} Audio duration in seconds.
     */
    duration: function(id) {
      var self = this;
      var duration = self._duration;

      // If we pass an ID, get the sound and return the sprite length.
      var sound = self._soundById(id);
      if (sound) {
        duration = self._sprite[sound._sprite][1] / 1000;
      }

      return duration;
    },

    /**
     * Returns the current loaded state of this Howl.
     * @return {String} 'unloaded', 'loading', 'loaded'
     */
    state: function() {
      return this._state;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all sound instances attached to this group.
     */
    unload: function() {
      var self = this;

      // Stop playing any active sounds.
      var sounds = self._sounds;
      for (var i=0; i<sounds.length; i++) {
        // Stop the sound if it is currently playing.
        if (!sounds[i]._paused) {
          self.stop(sounds[i]._id);
        }

        // Remove the source or disconnect.
        if (!self._webAudio) {
          // Set the source to 0-second silence to stop any downloading (except in IE).
          var checkIE = /MSIE |Trident\//.test(Howler._navigator && Howler._navigator.userAgent);
          if (!checkIE) {
            sounds[i]._node.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
          }

          // Remove any event listeners.
          sounds[i]._node.removeEventListener('error', sounds[i]._errorFn, false);
          sounds[i]._node.removeEventListener(Howler._canPlayEvent, sounds[i]._loadFn, false);

          // Release the Audio object back to the pool.
          Howler._releaseHtml5Audio(sounds[i]._node);
        }

        // Empty out all of the nodes.
        delete sounds[i]._node;

        // Make sure all timers are cleared out.
        self._clearTimer(sounds[i]._id);
      }

      // Remove the references in the global Howler object.
      var index = Howler._howls.indexOf(self);
      if (index >= 0) {
        Howler._howls.splice(index, 1);
      }

      // Delete this sound from the cache (if no other Howl is using it).
      var remCache = true;
      for (i=0; i<Howler._howls.length; i++) {
        if (Howler._howls[i]._src === self._src || self._src.indexOf(Howler._howls[i]._src) >= 0) {
          remCache = false;
          break;
        }
      }

      if (cache && remCache) {
        delete cache[self._src];
      }

      // Clear global errors.
      Howler.noAudio = false;

      // Clear out `self`.
      self._state = 'unloaded';
      self._sounds = [];
      self = null;

      return null;
    },

    /**
     * Listen to a custom event.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
     * @return {Howl}
     */
    on: function(event, fn, id, once) {
      var self = this;
      var events = self['_on' + event];

      if (typeof fn === 'function') {
        events.push(once ? {id: id, fn: fn, once: once} : {id: id, fn: fn});
      }

      return self;
    },

    /**
     * Remove a custom event. Call without parameters to remove all events.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to remove. Leave empty to remove all.
     * @param  {Number}   id    (optional) Only remove events for this sound.
     * @return {Howl}
     */
    off: function(event, fn, id) {
      var self = this;
      var events = self['_on' + event];
      var i = 0;

      // Allow passing just an event and ID.
      if (typeof fn === 'number') {
        id = fn;
        fn = null;
      }

      if (fn || id) {
        // Loop through event store and remove the passed function.
        for (i=0; i<events.length; i++) {
          var isId = (id === events[i].id);
          if (fn === events[i].fn && isId || !fn && isId) {
            events.splice(i, 1);
            break;
          }
        }
      } else if (event) {
        // Clear out all events of this type.
        self['_on' + event] = [];
      } else {
        // Clear out all events of every type.
        var keys = Object.keys(self);
        for (i=0; i<keys.length; i++) {
          if ((keys[i].indexOf('_on') === 0) && Array.isArray(self[keys[i]])) {
            self[keys[i]] = [];
          }
        }
      }

      return self;
    },

    /**
     * Listen to a custom event and remove it once fired.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @return {Howl}
     */
    once: function(event, fn, id) {
      var self = this;

      // Setup the event listener.
      self.on(event, fn, id, 1);

      return self;
    },

    /**
     * Emit all events of a specific type and pass the sound id.
     * @param  {String} event Event name.
     * @param  {Number} id    Sound ID.
     * @param  {Number} msg   Message to go with event.
     * @return {Howl}
     */
    _emit: function(event, id, msg) {
      var self = this;
      var events = self['_on' + event];

      // Loop through event store and fire all functions.
      for (var i=events.length-1; i>=0; i--) {
        // Only fire the listener if the correct ID is used.
        if (!events[i].id || events[i].id === id || event === 'load') {
          setTimeout(function(fn) {
            fn.call(this, id, msg);
          }.bind(self, events[i].fn), 0);

          // If this event was setup with `once`, remove it.
          if (events[i].once) {
            self.off(event, events[i].fn, events[i].id);
          }
        }
      }

      // Pass the event type into load queue so that it can continue stepping.
      self._loadQueue(event);

      return self;
    },

    /**
     * Queue of actions initiated before the sound has loaded.
     * These will be called in sequence, with the next only firing
     * after the previous has finished executing (even if async like play).
     * @return {Howl}
     */
    _loadQueue: function(event) {
      var self = this;

      if (self._queue.length > 0) {
        var task = self._queue[0];

        // Remove this task if a matching event was passed.
        if (task.event === event) {
          self._queue.shift();
          self._loadQueue();
        }

        // Run the task if no event type is passed.
        if (!event) {
          task.action();
        }
      }

      return self;
    },

    /**
     * Fired when playback ends at the end of the duration.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _ended: function(sound) {
      var self = this;
      var sprite = sound._sprite;

      // If we are using IE and there was network latency we may be clipping
      // audio before it completes playing. Lets check the node to make sure it
      // believes it has completed, before ending the playback.
      if (!self._webAudio && sound._node && !sound._node.paused && !sound._node.ended && sound._node.currentTime < sound._stop) {
        setTimeout(self._ended.bind(self, sound), 100);
        return self;
      }

      // Should this sound loop?
      var loop = !!(sound._loop || self._sprite[sprite][2]);

      // Fire the ended event.
      self._emit('end', sound._id);

      // Restart the playback for HTML5 Audio loop.
      if (!self._webAudio && loop) {
        self.stop(sound._id, true).play(sound._id);
      }

      // Restart this timer if on a Web Audio loop.
      if (self._webAudio && loop) {
        self._emit('play', sound._id);
        sound._seek = sound._start || 0;
        sound._rateSeek = 0;
        sound._playStart = Howler.ctx.currentTime;

        var timeout = ((sound._stop - sound._start) * 1000) / Math.abs(sound._rate);
        self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
      }

      // Mark the node as paused.
      if (self._webAudio && !loop) {
        sound._paused = true;
        sound._ended = true;
        sound._seek = sound._start || 0;
        sound._rateSeek = 0;
        self._clearTimer(sound._id);

        // Clean up the buffer source.
        self._cleanBuffer(sound._node);

        // Attempt to auto-suspend AudioContext if no sounds are still playing.
        Howler._autoSuspend();
      }

      // When using a sprite, end the track.
      if (!self._webAudio && !loop) {
        self.stop(sound._id, true);
      }

      return self;
    },

    /**
     * Clear the end timer for a sound playback.
     * @param  {Number} id The sound ID.
     * @return {Howl}
     */
    _clearTimer: function(id) {
      var self = this;

      if (self._endTimers[id]) {
        // Clear the timeout or remove the ended listener.
        if (typeof self._endTimers[id] !== 'function') {
          clearTimeout(self._endTimers[id]);
        } else {
          var sound = self._soundById(id);
          if (sound && sound._node) {
            sound._node.removeEventListener('ended', self._endTimers[id], false);
          }
        }

        delete self._endTimers[id];
      }

      return self;
    },

    /**
     * Return the sound identified by this ID, or return null.
     * @param  {Number} id Sound ID
     * @return {Object}    Sound object or null.
     */
    _soundById: function(id) {
      var self = this;

      // Loop through all sounds and find the one with this ID.
      for (var i=0; i<self._sounds.length; i++) {
        if (id === self._sounds[i]._id) {
          return self._sounds[i];
        }
      }

      return null;
    },

    /**
     * Return an inactive sound from the pool or create a new one.
     * @return {Sound} Sound playback object.
     */
    _inactiveSound: function() {
      var self = this;

      self._drain();

      // Find the first inactive node to recycle.
      for (var i=0; i<self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          return self._sounds[i].reset();
        }
      }

      // If no inactive node was found, create a new one.
      return new Sound(self);
    },

    /**
     * Drain excess inactive sounds from the pool.
     */
    _drain: function() {
      var self = this;
      var limit = self._pool;
      var cnt = 0;
      var i = 0;

      // If there are less sounds than the max pool size, we are done.
      if (self._sounds.length < limit) {
        return;
      }

      // Count the number of inactive sounds.
      for (i=0; i<self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          cnt++;
        }
      }

      // Remove excess inactive sounds, going in reverse order.
      for (i=self._sounds.length - 1; i>=0; i--) {
        if (cnt <= limit) {
          return;
        }

        if (self._sounds[i]._ended) {
          // Disconnect the audio source when using Web Audio.
          if (self._webAudio && self._sounds[i]._node) {
            self._sounds[i]._node.disconnect(0);
          }

          // Remove sounds until we have the pool size.
          self._sounds.splice(i, 1);
          cnt--;
        }
      }
    },

    /**
     * Get all ID's from the sounds pool.
     * @param  {Number} id Only return one ID if one is passed.
     * @return {Array}    Array of IDs.
     */
    _getSoundIds: function(id) {
      var self = this;

      if (typeof id === 'undefined') {
        var ids = [];
        for (var i=0; i<self._sounds.length; i++) {
          ids.push(self._sounds[i]._id);
        }

        return ids;
      } else {
        return [id];
      }
    },

    /**
     * Load the sound back into the buffer source.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _refreshBuffer: function(sound) {
      var self = this;

      // Setup the buffer source for playback.
      sound._node.bufferSource = Howler.ctx.createBufferSource();
      sound._node.bufferSource.buffer = cache[self._src];

      // Connect to the correct node.
      if (sound._panner) {
        sound._node.bufferSource.connect(sound._panner);
      } else {
        sound._node.bufferSource.connect(sound._node);
      }

      // Setup looping and playback rate.
      sound._node.bufferSource.loop = sound._loop;
      if (sound._loop) {
        sound._node.bufferSource.loopStart = sound._start || 0;
        sound._node.bufferSource.loopEnd = sound._stop || 0;
      }
      sound._node.bufferSource.playbackRate.setValueAtTime(sound._rate, Howler.ctx.currentTime);

      return self;
    },

    /**
     * Prevent memory leaks by cleaning up the buffer source after playback.
     * @param  {Object} node Sound's audio node containing the buffer source.
     * @return {Howl}
     */
    _cleanBuffer: function(node) {
      var self = this;
      var isIOS = Howler._navigator && Howler._navigator.vendor.indexOf('Apple') >= 0;

      if (Howler._scratchBuffer && node.bufferSource) {
        node.bufferSource.onended = null;
        node.bufferSource.disconnect(0);
        if (isIOS) {
          try { node.bufferSource.buffer = Howler._scratchBuffer; } catch(e) {}
        }
      }
      node.bufferSource = null;

      return self;
    }
  };

  /** Single Sound Methods **/
  /***************************************************************************/

  /**
   * Setup the sound object, which each node attached to a Howl group is contained in.
   * @param {Object} howl The Howl parent group.
   */
  var Sound = function(howl) {
    this._parent = howl;
    this.init();
  };
  Sound.prototype = {
    /**
     * Initialize a new Sound object.
     * @return {Sound}
     */
    init: function() {
      var self = this;
      var parent = self._parent;

      // Setup the default parameters.
      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._rate = parent._rate;
      self._seek = 0;
      self._paused = true;
      self._ended = true;
      self._sprite = '__default';

      // Generate a unique ID for this sound.
      self._id = ++Howler._counter;

      // Add itself to the parent's pool.
      parent._sounds.push(self);

      // Create the new node.
      self.create();

      return self;
    },

    /**
     * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
     * @return {Sound}
     */
    create: function() {
      var self = this;
      var parent = self._parent;
      var volume = (Howler._muted || self._muted || self._parent._muted) ? 0 : self._volume;

      if (parent._webAudio) {
        // Create the gain node for controlling volume (the source will connect to this).
        self._node = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
        self._node.gain.setValueAtTime(volume, Howler.ctx.currentTime);
        self._node.paused = true;
        self._node.connect(Howler.masterGain);
      } else {
        // Get an unlocked Audio object from the pool.
        self._node = Howler._obtainHtml5Audio();

        // Listen for errors (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror).
        self._errorFn = self._errorListener.bind(self);
        self._node.addEventListener('error', self._errorFn, false);

        // Listen for 'canplaythrough' event to let us know the sound is ready.
        self._loadFn = self._loadListener.bind(self);
        self._node.addEventListener(Howler._canPlayEvent, self._loadFn, false);

        // Setup the new audio node.
        self._node.src = parent._src;
        self._node.preload = 'auto';
        self._node.volume = volume * Howler.volume();

        // Begin loading the source.
        self._node.load();
      }

      return self;
    },

    /**
     * Reset the parameters of this sound to the original state (for recycle).
     * @return {Sound}
     */
    reset: function() {
      var self = this;
      var parent = self._parent;

      // Reset all of the parameters of this sound.
      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._rate = parent._rate;
      self._seek = 0;
      self._rateSeek = 0;
      self._paused = true;
      self._ended = true;
      self._sprite = '__default';

      // Generate a new ID so that it isn't confused with the previous sound.
      self._id = ++Howler._counter;

      return self;
    },

    /**
     * HTML5 Audio error listener callback.
     */
    _errorListener: function() {
      var self = this;

      // Fire an error event and pass back the code.
      self._parent._emit('loaderror', self._id, self._node.error ? self._node.error.code : 0);

      // Clear the event listener.
      self._node.removeEventListener('error', self._errorFn, false);
    },

    /**
     * HTML5 Audio canplaythrough listener callback.
     */
    _loadListener: function() {
      var self = this;
      var parent = self._parent;

      // Round up the duration to account for the lower precision in HTML5 Audio.
      parent._duration = Math.ceil(self._node.duration * 10) / 10;

      // Setup a sprite if none is defined.
      if (Object.keys(parent._sprite).length === 0) {
        parent._sprite = {__default: [0, parent._duration * 1000]};
      }

      if (parent._state !== 'loaded') {
        parent._state = 'loaded';
        parent._emit('load');
        parent._loadQueue();
      }

      // Clear the event listener.
      self._node.removeEventListener(Howler._canPlayEvent, self._loadFn, false);
    }
  };

  /** Helper Methods **/
  /***************************************************************************/

  var cache = {};

  /**
   * Buffer a sound from URL, Data URI or cache and decode to audio source (Web Audio API).
   * @param  {Howl} self
   */
  var loadBuffer = function(self) {
    var url = self._src;

    // Check if the buffer has already been cached and use it instead.
    if (cache[url]) {
      // Set the duration from the cache.
      self._duration = cache[url].duration;

      // Load the sound into this Howl.
      loadSound(self);

      return;
    }

    if (/^data:[^;]+;base64,/.test(url)) {
      // Decode the base64 data URI without XHR, since some browsers don't support it.
      var data = atob(url.split(',')[1]);
      var dataView = new Uint8Array(data.length);
      for (var i=0; i<data.length; ++i) {
        dataView[i] = data.charCodeAt(i);
      }

      decodeAudioData(dataView.buffer, self);
    } else {
      // Load the buffer from the URL.
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.withCredentials = self._xhrWithCredentials;
      xhr.responseType = 'arraybuffer';
      xhr.onload = function() {
        // Make sure we get a successful response back.
        var code = (xhr.status + '')[0];
        if (code !== '0' && code !== '2' && code !== '3') {
          self._emit('loaderror', null, 'Failed loading audio file with status: ' + xhr.status + '.');
          return;
        }

        decodeAudioData(xhr.response, self);
      };
      xhr.onerror = function() {
        // If there is an error, switch to HTML5 Audio.
        if (self._webAudio) {
          self._html5 = true;
          self._webAudio = false;
          self._sounds = [];
          delete cache[url];
          self.load();
        }
      };
      safeXhrSend(xhr);
    }
  };

  /**
   * Send the XHR request wrapped in a try/catch.
   * @param  {Object} xhr XHR to send.
   */
  var safeXhrSend = function(xhr) {
    try {
      xhr.send();
    } catch (e) {
      xhr.onerror();
    }
  };

  /**
   * Decode audio data from an array buffer.
   * @param  {ArrayBuffer} arraybuffer The audio data.
   * @param  {Howl}        self
   */
  var decodeAudioData = function(arraybuffer, self) {
    // Fire a load error if something broke.
    var error = function() {
      self._emit('loaderror', null, 'Decoding audio data failed.');
    };

    // Load the sound on success.
    var success = function(buffer) {
      if (buffer && self._sounds.length > 0) {
        cache[self._src] = buffer;
        loadSound(self, buffer);
      } else {
        error();
      }
    };

    // Decode the buffer into an audio source.
    if (typeof Promise !== 'undefined' && Howler.ctx.decodeAudioData.length === 1) {
      Howler.ctx.decodeAudioData(arraybuffer).then(success).catch(error);
    } else {
      Howler.ctx.decodeAudioData(arraybuffer, success, error);
    }
  }

  /**
   * Sound is now loaded, so finish setting everything up and fire the loaded event.
   * @param  {Howl} self
   * @param  {Object} buffer The decoded buffer sound source.
   */
  var loadSound = function(self, buffer) {
    // Set the duration.
    if (buffer && !self._duration) {
      self._duration = buffer.duration;
    }

    // Setup a sprite if none is defined.
    if (Object.keys(self._sprite).length === 0) {
      self._sprite = {__default: [0, self._duration * 1000]};
    }

    // Fire the loaded event.
    if (self._state !== 'loaded') {
      self._state = 'loaded';
      self._emit('load');
      self._loadQueue();
    }
  };

  /**
   * Setup the audio context when available, or switch to HTML5 Audio mode.
   */
  var setupAudioContext = function() {
    // If we have already detected that Web Audio isn't supported, don't run this step again.
    if (!Howler.usingWebAudio) {
      return;
    }

    // Check if we are using Web Audio and setup the AudioContext if we are.
    try {
      if (typeof AudioContext !== 'undefined') {
        Howler.ctx = new AudioContext();
      } else if (typeof webkitAudioContext !== 'undefined') {
        Howler.ctx = new webkitAudioContext();
      } else {
        Howler.usingWebAudio = false;
      }
    } catch(e) {
      Howler.usingWebAudio = false;
    }

    // If the audio context creation still failed, set using web audio to false.
    if (!Howler.ctx) {
      Howler.usingWebAudio = false;
    }

    // Check if a webview is being used on iOS8 or earlier (rather than the browser).
    // If it is, disable Web Audio as it causes crashing.
    var iOS = (/iP(hone|od|ad)/.test(Howler._navigator && Howler._navigator.platform));
    var appVersion = Howler._navigator && Howler._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
    var version = appVersion ? parseInt(appVersion[1], 10) : null;
    if (iOS && version && version < 9) {
      var safari = /safari/.test(Howler._navigator && Howler._navigator.userAgent.toLowerCase());
      if (Howler._navigator && Howler._navigator.standalone && !safari || Howler._navigator && !Howler._navigator.standalone && !safari) {
        Howler.usingWebAudio = false;
      }
    }

    // Create and expose the master GainNode when using Web Audio (useful for plugins or advanced usage).
    if (Howler.usingWebAudio) {
      Howler.masterGain = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
      Howler.masterGain.gain.setValueAtTime(Howler._muted ? 0 : 1, Howler.ctx.currentTime);
      Howler.masterGain.connect(Howler.ctx.destination);
    }

    // Re-run the setup on Howler.
    Howler._setup();
  };

  // Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() {
      return {
        Howler: Howler,
        Howl: Howl
      };
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }

  // Add support for CommonJS libraries such as browserify.
  if (true) {
    exports.Howler = Howler;
    exports.Howl = Howl;
  }

  // Define globally in case AMD is not available or unused.
  if (typeof window !== 'undefined') {
    window.HowlerGlobal = HowlerGlobal;
    window.Howler = Howler;
    window.Howl = Howl;
    window.Sound = Sound;
  } else if (typeof global !== 'undefined') { // Add to global in Node.js (for testing, etc).
    global.HowlerGlobal = HowlerGlobal;
    global.Howler = Howler;
    global.Howl = Howl;
    global.Sound = Sound;
  }
})();


/*!
 *  Spatial Plugin - Adds support for stereo and 3D audio where Web Audio is supported.
 *  
 *  howler.js v2.1.1
 *  howlerjs.com
 *
 *  (c) 2013-2018, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {

  'use strict';

  // Setup default properties.
  HowlerGlobal.prototype._pos = [0, 0, 0];
  HowlerGlobal.prototype._orientation = [0, 0, -1, 0, 1, 0];

  /** Global Methods **/
  /***************************************************************************/

  /**
   * Helper method to update the stereo panning position of all current Howls.
   * Future Howls will not use this value unless explicitly set.
   * @param  {Number} pan A value of -1.0 is all the way left and 1.0 is all the way right.
   * @return {Howler/Number}     Self or current stereo panning value.
   */
  HowlerGlobal.prototype.stereo = function(pan) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Loop through all Howls and update their stereo panning.
    for (var i=self._howls.length-1; i>=0; i--) {
      self._howls[i].stereo(pan);
    }

    return self;
  };

  /**
   * Get/set the position of the listener in 3D cartesian space. Sounds using
   * 3D position will be relative to the listener's position.
   * @param  {Number} x The x-position of the listener.
   * @param  {Number} y The y-position of the listener.
   * @param  {Number} z The z-position of the listener.
   * @return {Howler/Array}   Self or current listener position.
   */
  HowlerGlobal.prototype.pos = function(x, y, z) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? self._pos[1] : y;
    z = (typeof z !== 'number') ? self._pos[2] : z;

    if (typeof x === 'number') {
      self._pos = [x, y, z];

      if (typeof self.ctx.listener.positionX !== 'undefined') {
        self.ctx.listener.positionX.setTargetAtTime(self._pos[0], Howler.ctx.currentTime, 0.1);
        self.ctx.listener.positionY.setTargetAtTime(self._pos[1], Howler.ctx.currentTime, 0.1);
        self.ctx.listener.positionZ.setTargetAtTime(self._pos[2], Howler.ctx.currentTime, 0.1);
      } else {
        self.ctx.listener.setPosition(self._pos[0], self._pos[1], self._pos[2]);
      }
    } else {
      return self._pos;
    }

    return self;
  };

  /**
   * Get/set the direction the listener is pointing in the 3D cartesian space.
   * A front and up vector must be provided. The front is the direction the
   * face of the listener is pointing, and up is the direction the top of the
   * listener is pointing. Thus, these values are expected to be at right angles
   * from each other.
   * @param  {Number} x   The x-orientation of the listener.
   * @param  {Number} y   The y-orientation of the listener.
   * @param  {Number} z   The z-orientation of the listener.
   * @param  {Number} xUp The x-orientation of the top of the listener.
   * @param  {Number} yUp The y-orientation of the top of the listener.
   * @param  {Number} zUp The z-orientation of the top of the listener.
   * @return {Howler/Array}     Returns self or the current orientation vectors.
   */
  HowlerGlobal.prototype.orientation = function(x, y, z, xUp, yUp, zUp) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    var or = self._orientation;
    y = (typeof y !== 'number') ? or[1] : y;
    z = (typeof z !== 'number') ? or[2] : z;
    xUp = (typeof xUp !== 'number') ? or[3] : xUp;
    yUp = (typeof yUp !== 'number') ? or[4] : yUp;
    zUp = (typeof zUp !== 'number') ? or[5] : zUp;

    if (typeof x === 'number') {
      self._orientation = [x, y, z, xUp, yUp, zUp];

      if (typeof self.ctx.listener.forwardX !== 'undefined') {
        self.ctx.listener.forwardX.setTargetAtTime(x, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.forwardY.setTargetAtTime(y, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.forwardZ.setTargetAtTime(z, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upX.setTargetAtTime(x, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upY.setTargetAtTime(y, Howler.ctx.currentTime, 0.1);
        self.ctx.listener.upZ.setTargetAtTime(z, Howler.ctx.currentTime, 0.1);
      } else {
        self.ctx.listener.setOrientation(x, y, z, xUp, yUp, zUp);
      }
    } else {
      return or;
    }

    return self;
  };

  /** Group Methods **/
  /***************************************************************************/

  /**
   * Add new properties to the core init.
   * @param  {Function} _super Core init method.
   * @return {Howl}
   */
  Howl.prototype.init = (function(_super) {
    return function(o) {
      var self = this;

      // Setup user-defined default properties.
      self._orientation = o.orientation || [1, 0, 0];
      self._stereo = o.stereo || null;
      self._pos = o.pos || null;
      self._pannerAttr = {
        coneInnerAngle: typeof o.coneInnerAngle !== 'undefined' ? o.coneInnerAngle : 360,
        coneOuterAngle: typeof o.coneOuterAngle !== 'undefined' ? o.coneOuterAngle : 360,
        coneOuterGain: typeof o.coneOuterGain !== 'undefined' ? o.coneOuterGain : 0,
        distanceModel: typeof o.distanceModel !== 'undefined' ? o.distanceModel : 'inverse',
        maxDistance: typeof o.maxDistance !== 'undefined' ? o.maxDistance : 10000,
        panningModel: typeof o.panningModel !== 'undefined' ? o.panningModel : 'HRTF',
        refDistance: typeof o.refDistance !== 'undefined' ? o.refDistance : 1,
        rolloffFactor: typeof o.rolloffFactor !== 'undefined' ? o.rolloffFactor : 1
      };

      // Setup event listeners.
      self._onstereo = o.onstereo ? [{fn: o.onstereo}] : [];
      self._onpos = o.onpos ? [{fn: o.onpos}] : [];
      self._onorientation = o.onorientation ? [{fn: o.onorientation}] : [];

      // Complete initilization with howler.js core's init function.
      return _super.call(this, o);
    };
  })(Howl.prototype.init);

  /**
   * Get/set the stereo panning of the audio source for this sound or all in the group.
   * @param  {Number} pan  A value of -1.0 is all the way left and 1.0 is all the way right.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Number}    Returns self or the current stereo panning value.
   */
  Howl.prototype.stereo = function(pan, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change stereo pan when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'stereo',
        action: function() {
          self.stereo(pan, id);
        }
      });

      return self;
    }

    // Check for PannerStereoNode support and fallback to PannerNode if it doesn't exist.
    var pannerType = (typeof Howler.ctx.createStereoPanner === 'undefined') ? 'spatial' : 'stereo';

    // Setup the group's stereo panning if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's stereo panning if no parameters are passed.
      if (typeof pan === 'number') {
        self._stereo = pan;
        self._pos = [pan, 0, 0];
      } else {
        return self._stereo;
      }
    }

    // Change the streo panning of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof pan === 'number') {
          sound._stereo = pan;
          sound._pos = [pan, 0, 0];

          if (sound._node) {
            // If we are falling back, make sure the panningModel is equalpower.
            sound._pannerAttr.panningModel = 'equalpower';

            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner || !sound._panner.pan) {
              setupPanner(sound, pannerType);
            }

            if (pannerType === 'spatial') {
              if (typeof sound._panner.positionX !== 'undefined') {
                sound._panner.positionX.setValueAtTime(pan, Howler.ctx.currentTime);
                sound._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime);
                sound._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime);
              } else {
                sound._panner.setPosition(pan, 0, 0);
              }
            } else {
              sound._panner.pan.setValueAtTime(pan, Howler.ctx.currentTime);
            }
          }

          self._emit('stereo', sound._id);
        } else {
          return sound._stereo;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the 3D spatial position of the audio source for this sound or group relative to the global listener.
   * @param  {Number} x  The x-position of the audio source.
   * @param  {Number} y  The y-position of the audio source.
   * @param  {Number} z  The z-position of the audio source.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial position: [x, y, z].
   */
  Howl.prototype.pos = function(x, y, z, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change position when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'pos',
        action: function() {
          self.pos(x, y, z, id);
        }
      });

      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? 0 : y;
    z = (typeof z !== 'number') ? -0.5 : z;

    // Setup the group's spatial position if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's spatial position if no parameters are passed.
      if (typeof x === 'number') {
        self._pos = [x, y, z];
      } else {
        return self._pos;
      }
    }

    // Change the spatial position of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof x === 'number') {
          sound._pos = [x, y, z];

          if (sound._node) {
            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner || sound._panner.pan) {
              setupPanner(sound, 'spatial');
            }

            if (typeof sound._panner.positionX !== 'undefined') {
              sound._panner.positionX.setValueAtTime(x, Howler.ctx.currentTime);
              sound._panner.positionY.setValueAtTime(y, Howler.ctx.currentTime);
              sound._panner.positionZ.setValueAtTime(z, Howler.ctx.currentTime);
            } else {
              sound._panner.setPosition(x, y, z);
            }
          }

          self._emit('pos', sound._id);
        } else {
          return sound._pos;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the direction the audio source is pointing in the 3D cartesian coordinate
   * space. Depending on how direction the sound is, based on the `cone` attributes,
   * a sound pointing away from the listener can be quiet or silent.
   * @param  {Number} x  The x-orientation of the source.
   * @param  {Number} y  The y-orientation of the source.
   * @param  {Number} z  The z-orientation of the source.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial orientation: [x, y, z].
   */
  Howl.prototype.orientation = function(x, y, z, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change orientation when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'orientation',
        action: function() {
          self.orientation(x, y, z, id);
        }
      });

      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? self._orientation[1] : y;
    z = (typeof z !== 'number') ? self._orientation[2] : z;

    // Setup the group's spatial orientation if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's spatial orientation if no parameters are passed.
      if (typeof x === 'number') {
        self._orientation = [x, y, z];
      } else {
        return self._orientation;
      }
    }

    // Change the spatial orientation of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof x === 'number') {
          sound._orientation = [x, y, z];

          if (sound._node) {
            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner) {
              // Make sure we have a position to setup the node with.
              if (!sound._pos) {
                sound._pos = self._pos || [0, 0, -0.5];
              }

              setupPanner(sound, 'spatial');
            }

            if (typeof sound._panner.orientationX !== 'undefined') {
              sound._panner.orientationX.setValueAtTime(x, Howler.ctx.currentTime);
              sound._panner.orientationY.setValueAtTime(y, Howler.ctx.currentTime);
              sound._panner.orientationZ.setValueAtTime(z, Howler.ctx.currentTime);
            } else {
              sound._panner.setOrientation(x, y, z);
            }
          }

          self._emit('orientation', sound._id);
        } else {
          return sound._orientation;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the panner node's attributes for a sound or group of sounds.
   * This method can optionall take 0, 1 or 2 arguments.
   *   pannerAttr() -> Returns the group's values.
   *   pannerAttr(id) -> Returns the sound id's values.
   *   pannerAttr(o) -> Set's the values of all sounds in this Howl group.
   *   pannerAttr(o, id) -> Set's the values of passed sound id.
   *
   *   Attributes:
   *     coneInnerAngle - (360 by default) A parameter for directional audio sources, this is an angle, in degrees,
   *                      inside of which there will be no volume reduction.
   *     coneOuterAngle - (360 by default) A parameter for directional audio sources, this is an angle, in degrees,
   *                      outside of which the volume will be reduced to a constant value of `coneOuterGain`.
   *     coneOuterGain - (0 by default) A parameter for directional audio sources, this is the gain outside of the
   *                     `coneOuterAngle`. It is a linear value in the range `[0, 1]`.
   *     distanceModel - ('inverse' by default) Determines algorithm used to reduce volume as audio moves away from
   *                     listener. Can be `linear`, `inverse` or `exponential.
   *     maxDistance - (10000 by default) The maximum distance between source and listener, after which the volume
   *                   will not be reduced any further.
   *     refDistance - (1 by default) A reference distance for reducing volume as source moves further from the listener.
   *                   This is simply a variable of the distance model and has a different effect depending on which model
   *                   is used and the scale of your coordinates. Generally, volume will be equal to 1 at this distance.
   *     rolloffFactor - (1 by default) How quickly the volume reduces as source moves from listener. This is simply a
   *                     variable of the distance model and can be in the range of `[0, 1]` with `linear` and `[0, ∞]`
   *                     with `inverse` and `exponential`.
   *     panningModel - ('HRTF' by default) Determines which spatialization algorithm is used to position audio.
   *                     Can be `HRTF` or `equalpower`.
   *
   * @return {Howl/Object} Returns self or current panner attributes.
   */
  Howl.prototype.pannerAttr = function() {
    var self = this;
    var args = arguments;
    var o, id, sound;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // Determine the values based on arguments.
    if (args.length === 0) {
      // Return the group's panner attribute values.
      return self._pannerAttr;
    } else if (args.length === 1) {
      if (typeof args[0] === 'object') {
        o = args[0];

        // Set the grou's panner attribute values.
        if (typeof id === 'undefined') {
          if (!o.pannerAttr) {
            o.pannerAttr = {
              coneInnerAngle: o.coneInnerAngle,
              coneOuterAngle: o.coneOuterAngle,
              coneOuterGain: o.coneOuterGain,
              distanceModel: o.distanceModel,
              maxDistance: o.maxDistance,
              refDistance: o.refDistance,
              rolloffFactor: o.rolloffFactor,
              panningModel: o.panningModel
            };
          }

          self._pannerAttr = {
            coneInnerAngle: typeof o.pannerAttr.coneInnerAngle !== 'undefined' ? o.pannerAttr.coneInnerAngle : self._coneInnerAngle,
            coneOuterAngle: typeof o.pannerAttr.coneOuterAngle !== 'undefined' ? o.pannerAttr.coneOuterAngle : self._coneOuterAngle,
            coneOuterGain: typeof o.pannerAttr.coneOuterGain !== 'undefined' ? o.pannerAttr.coneOuterGain : self._coneOuterGain,
            distanceModel: typeof o.pannerAttr.distanceModel !== 'undefined' ? o.pannerAttr.distanceModel : self._distanceModel,
            maxDistance: typeof o.pannerAttr.maxDistance !== 'undefined' ? o.pannerAttr.maxDistance : self._maxDistance,
            refDistance: typeof o.pannerAttr.refDistance !== 'undefined' ? o.pannerAttr.refDistance : self._refDistance,
            rolloffFactor: typeof o.pannerAttr.rolloffFactor !== 'undefined' ? o.pannerAttr.rolloffFactor : self._rolloffFactor,
            panningModel: typeof o.pannerAttr.panningModel !== 'undefined' ? o.pannerAttr.panningModel : self._panningModel
          };
        }
      } else {
        // Return this sound's panner attribute values.
        sound = self._soundById(parseInt(args[0], 10));
        return sound ? sound._pannerAttr : self._pannerAttr;
      }
    } else if (args.length === 2) {
      o = args[0];
      id = parseInt(args[1], 10);
    }

    // Update the values of the specified sounds.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      sound = self._soundById(ids[i]);

      if (sound) {
        // Merge the new values into the sound.
        var pa = sound._pannerAttr;
        pa = {
          coneInnerAngle: typeof o.coneInnerAngle !== 'undefined' ? o.coneInnerAngle : pa.coneInnerAngle,
          coneOuterAngle: typeof o.coneOuterAngle !== 'undefined' ? o.coneOuterAngle : pa.coneOuterAngle,
          coneOuterGain: typeof o.coneOuterGain !== 'undefined' ? o.coneOuterGain : pa.coneOuterGain,
          distanceModel: typeof o.distanceModel !== 'undefined' ? o.distanceModel : pa.distanceModel,
          maxDistance: typeof o.maxDistance !== 'undefined' ? o.maxDistance : pa.maxDistance,
          refDistance: typeof o.refDistance !== 'undefined' ? o.refDistance : pa.refDistance,
          rolloffFactor: typeof o.rolloffFactor !== 'undefined' ? o.rolloffFactor : pa.rolloffFactor,
          panningModel: typeof o.panningModel !== 'undefined' ? o.panningModel : pa.panningModel
        };

        // Update the panner values or create a new panner if none exists.
        var panner = sound._panner;
        if (panner) {
          panner.coneInnerAngle = pa.coneInnerAngle;
          panner.coneOuterAngle = pa.coneOuterAngle;
          panner.coneOuterGain = pa.coneOuterGain;
          panner.distanceModel = pa.distanceModel;
          panner.maxDistance = pa.maxDistance;
          panner.refDistance = pa.refDistance;
          panner.rolloffFactor = pa.rolloffFactor;
          panner.panningModel = pa.panningModel;
        } else {
          // Make sure we have a position to setup the node with.
          if (!sound._pos) {
            sound._pos = self._pos || [0, 0, -0.5];
          }

          // Create a new panner node.
          setupPanner(sound, 'spatial');
        }
      }
    }

    return self;
  };

  /** Single Sound Methods **/
  /***************************************************************************/

  /**
   * Add new properties to the core Sound init.
   * @param  {Function} _super Core Sound init method.
   * @return {Sound}
   */
  Sound.prototype.init = (function(_super) {
    return function() {
      var self = this;
      var parent = self._parent;

      // Setup user-defined default properties.
      self._orientation = parent._orientation;
      self._stereo = parent._stereo;
      self._pos = parent._pos;
      self._pannerAttr = parent._pannerAttr;

      // Complete initilization with howler.js core Sound's init function.
      _super.call(this);

      // If a stereo or position was specified, set it up.
      if (self._stereo) {
        parent.stereo(self._stereo);
      } else if (self._pos) {
        parent.pos(self._pos[0], self._pos[1], self._pos[2], self._id);
      }
    };
  })(Sound.prototype.init);

  /**
   * Override the Sound.reset method to clean up properties from the spatial plugin.
   * @param  {Function} _super Sound reset method.
   * @return {Sound}
   */
  Sound.prototype.reset = (function(_super) {
    return function() {
      var self = this;
      var parent = self._parent;

      // Reset all spatial plugin properties on this sound.
      self._orientation = parent._orientation;
      self._stereo = parent._stereo;
      self._pos = parent._pos;
      self._pannerAttr = parent._pannerAttr;

      // If a stereo or position was specified, set it up.
      if (self._stereo) {
        parent.stereo(self._stereo);
      } else if (self._pos) {
        parent.pos(self._pos[0], self._pos[1], self._pos[2], self._id);
      } else if (self._panner) {
        // Disconnect the panner.
        self._panner.disconnect(0);
        self._panner = undefined;
        parent._refreshBuffer(self);
      }

      // Complete resetting of the sound.
      return _super.call(this);
    };
  })(Sound.prototype.reset);

  /** Helper Methods **/
  /***************************************************************************/

  /**
   * Create a new panner node and save it on the sound.
   * @param  {Sound} sound Specific sound to setup panning on.
   * @param {String} type Type of panner to create: 'stereo' or 'spatial'.
   */
  var setupPanner = function(sound, type) {
    type = type || 'spatial';

    // Create the new panner node.
    if (type === 'spatial') {
      sound._panner = Howler.ctx.createPanner();
      sound._panner.coneInnerAngle = sound._pannerAttr.coneInnerAngle;
      sound._panner.coneOuterAngle = sound._pannerAttr.coneOuterAngle;
      sound._panner.coneOuterGain = sound._pannerAttr.coneOuterGain;
      sound._panner.distanceModel = sound._pannerAttr.distanceModel;
      sound._panner.maxDistance = sound._pannerAttr.maxDistance;
      sound._panner.refDistance = sound._pannerAttr.refDistance;
      sound._panner.rolloffFactor = sound._pannerAttr.rolloffFactor;
      sound._panner.panningModel = sound._pannerAttr.panningModel;

      if (typeof sound._panner.positionX !== 'undefined') {
        sound._panner.positionX.setValueAtTime(sound._pos[0], Howler.ctx.currentTime);
        sound._panner.positionY.setValueAtTime(sound._pos[1], Howler.ctx.currentTime);
        sound._panner.positionZ.setValueAtTime(sound._pos[2], Howler.ctx.currentTime);
      } else {
        sound._panner.setPosition(sound._pos[0], sound._pos[1], sound._pos[2]);
      }

      if (typeof sound._panner.orientationX !== 'undefined') {
        sound._panner.orientationX.setValueAtTime(sound._orientation[0], Howler.ctx.currentTime);
        sound._panner.orientationY.setValueAtTime(sound._orientation[1], Howler.ctx.currentTime);
        sound._panner.orientationZ.setValueAtTime(sound._orientation[2], Howler.ctx.currentTime);
      } else {
        sound._panner.setOrientation(sound._orientation[0], sound._orientation[1], sound._orientation[2]);
      }
    } else {
      sound._panner = Howler.ctx.createStereoPanner();
      sound._panner.pan.setValueAtTime(sound._stereo, Howler.ctx.currentTime);
    }

    sound._panner.connect(sound._node);

    // Update the connections.
    if (!sound._paused) {
      sound._parent.pause(sound._id, true).play(sound._id, true);
    }
  };
})();

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/p2/package.json":
/*!**************************************!*\
  !*** ./node_modules/p2/package.json ***!
  \**************************************/
/*! exports provided: _args, _from, _id, _inBundle, _integrity, _location, _phantomChildren, _requested, _requiredBy, _resolved, _spec, _where, author, bugs, dependencies, description, devDependencies, engines, homepage, keywords, licenses, main, name, repository, version, default */
/*! all exports used */
/***/ (function(module) {

module.exports = {"_args":[["p2@0.7.1","D:\\VS_Projects\\SF\\jam_2018"]],"_from":"p2@0.7.1","_id":"p2@0.7.1","_inBundle":false,"_integrity":"sha1-JfJHTZvDptMUCh2iamfJ4RislUM=","_location":"/p2","_phantomChildren":{},"_requested":{"type":"version","registry":true,"raw":"p2@0.7.1","name":"p2","escapedName":"p2","rawSpec":"0.7.1","saveSpec":null,"fetchSpec":"0.7.1"},"_requiredBy":["/"],"_resolved":"https://registry.npmjs.org/p2/-/p2-0.7.1.tgz","_spec":"0.7.1","_where":"D:\\VS_Projects\\SF\\jam_2018","author":{"name":"Stefan Hedman","email":"schteppe@gmail.com","url":"http://steffe.se"},"bugs":{"url":"https://github.com/schteppe/p2.js/issues"},"dependencies":{"poly-decomp":"0.1.1"},"description":"A JavaScript 2D physics engine.","devDependencies":{"grunt":"^0.4.5","grunt-browserify":"~2.0.1","grunt-contrib-concat":"^0.4.0","grunt-contrib-jshint":"^0.11.2","grunt-contrib-nodeunit":"^0.4.1","grunt-contrib-uglify":"~0.4.0","grunt-contrib-watch":"~0.5.0"},"engines":{"node":"*"},"homepage":"https://github.com/schteppe/p2.js#readme","keywords":["p2.js","p2","physics","engine","2d"],"licenses":[{"type":"MIT"}],"main":"./src/p2.js","name":"p2","repository":{"type":"git","url":"git+https://github.com/schteppe/p2.js.git"},"version":"0.7.1"};

/***/ }),

/***/ "./node_modules/p2/src/collision/AABB.js":
/*!***********************************************!*\
  !*** ./node_modules/p2/src/collision/AABB.js ***!
  \***********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,   Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js");

module.exports = AABB;

/**
 * Axis aligned bounding box class.
 * @class AABB
 * @constructor
 * @param {Object}  [options]
 * @param {Array}   [options.upperBound]
 * @param {Array}   [options.lowerBound]
 */
function AABB(options){

    /**
     * The lower bound of the bounding box.
     * @property lowerBound
     * @type {Array}
     */
    this.lowerBound = vec2.create();
    if(options && options.lowerBound){
        vec2.copy(this.lowerBound, options.lowerBound);
    }

    /**
     * The upper bound of the bounding box.
     * @property upperBound
     * @type {Array}
     */
    this.upperBound = vec2.create();
    if(options && options.upperBound){
        vec2.copy(this.upperBound, options.upperBound);
    }
}

var tmp = vec2.create();

/**
 * Set the AABB bounds from a set of points, transformed by the given position and angle.
 * @method setFromPoints
 * @param {Array} points An array of vec2's.
 * @param {Array} position
 * @param {number} angle
 * @param {number} skinSize Some margin to be added to the AABB.
 */
AABB.prototype.setFromPoints = function(points, position, angle, skinSize){
    var l = this.lowerBound,
        u = this.upperBound;

    if(typeof(angle) !== "number"){
        angle = 0;
    }

    // Set to the first point
    if(angle !== 0){
        vec2.rotate(l, points[0], angle);
    } else {
        vec2.copy(l, points[0]);
    }
    vec2.copy(u, l);

    // Compute cosines and sines just once
    var cosAngle = Math.cos(angle),
        sinAngle = Math.sin(angle);
    for(var i = 1; i<points.length; i++){
        var p = points[i];

        if(angle !== 0){
            var x = p[0],
                y = p[1];
            tmp[0] = cosAngle * x -sinAngle * y;
            tmp[1] = sinAngle * x +cosAngle * y;
            p = tmp;
        }

        for(var j=0; j<2; j++){
            if(p[j] > u[j]){
                u[j] = p[j];
            }
            if(p[j] < l[j]){
                l[j] = p[j];
            }
        }
    }

    // Add offset
    if(position){
        vec2.add(this.lowerBound, this.lowerBound, position);
        vec2.add(this.upperBound, this.upperBound, position);
    }

    if(skinSize){
        this.lowerBound[0] -= skinSize;
        this.lowerBound[1] -= skinSize;
        this.upperBound[0] += skinSize;
        this.upperBound[1] += skinSize;
    }
};

/**
 * Copy bounds from an AABB to this AABB
 * @method copy
 * @param  {AABB} aabb
 */
AABB.prototype.copy = function(aabb){
    vec2.copy(this.lowerBound, aabb.lowerBound);
    vec2.copy(this.upperBound, aabb.upperBound);
};

/**
 * Extend this AABB so that it covers the given AABB too.
 * @method extend
 * @param  {AABB} aabb
 */
AABB.prototype.extend = function(aabb){
    // Loop over x and y
    var i = 2;
    while(i--){
        // Extend lower bound
        var l = aabb.lowerBound[i];
        if(this.lowerBound[i] > l){
            this.lowerBound[i] = l;
        }

        // Upper
        var u = aabb.upperBound[i];
        if(this.upperBound[i] < u){
            this.upperBound[i] = u;
        }
    }
};

/**
 * Returns true if the given AABB overlaps this AABB.
 * @method overlaps
 * @param  {AABB} aabb
 * @return {Boolean}
 */
AABB.prototype.overlaps = function(aabb){
    var l1 = this.lowerBound,
        u1 = this.upperBound,
        l2 = aabb.lowerBound,
        u2 = aabb.upperBound;

    //      l2        u2
    //      |---------|
    // |--------|
    // l1       u1

    return ((l2[0] <= u1[0] && u1[0] <= u2[0]) || (l1[0] <= u2[0] && u2[0] <= u1[0])) &&
           ((l2[1] <= u1[1] && u1[1] <= u2[1]) || (l1[1] <= u2[1] && u2[1] <= u1[1]));
};

/**
 * @method containsPoint
 * @param  {Array} point
 * @return {boolean}
 */
AABB.prototype.containsPoint = function(point){
    var l = this.lowerBound,
        u = this.upperBound;
    return l[0] <= point[0] && point[0] <= u[0] && l[1] <= point[1] && point[1] <= u[1];
};

/**
 * Check if the AABB is hit by a ray.
 * @method overlapsRay
 * @param  {Ray} ray
 * @return {number} -1 if no hit, a number between 0 and 1 if hit.
 */
AABB.prototype.overlapsRay = function(ray){
    var t = 0;

    // ray.direction is unit direction vector of ray
    var dirFracX = 1 / ray.direction[0];
    var dirFracY = 1 / ray.direction[1];

    // this.lowerBound is the corner of AABB with minimal coordinates - left bottom, rt is maximal corner
    var t1 = (this.lowerBound[0] - ray.from[0]) * dirFracX;
    var t2 = (this.upperBound[0] - ray.from[0]) * dirFracX;
    var t3 = (this.lowerBound[1] - ray.from[1]) * dirFracY;
    var t4 = (this.upperBound[1] - ray.from[1]) * dirFracY;

    var tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)));
    var tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)));

    // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
    if (tmax < 0){
        //t = tmax;
        return -1;
    }

    // if tmin > tmax, ray doesn't intersect AABB
    if (tmin > tmax){
        //t = tmax;
        return -1;
    }

    return tmin;
};

/***/ }),

/***/ "./node_modules/p2/src/collision/Broadphase.js":
/*!*****************************************************!*\
  !*** ./node_modules/p2/src/collision/Broadphase.js ***!
  \*****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");
var Body = __webpack_require__(/*! ../objects/Body */ "./node_modules/p2/src/objects/Body.js");

module.exports = Broadphase;

/**
 * Base class for broadphase implementations.
 * @class Broadphase
 * @constructor
 */
function Broadphase(type){

    this.type = type;

    /**
     * The resulting overlapping pairs. Will be filled with results during .getCollisionPairs().
     * @property result
     * @type {Array}
     */
    this.result = [];

    /**
     * The world to search for collision pairs in. To change it, use .setWorld()
     * @property world
     * @type {World}
     * @readOnly
     */
    this.world = null;

    /**
     * The bounding volume type to use in the broadphase algorithms. Should be set to Broadphase.AABB or Broadphase.BOUNDING_CIRCLE.
     * @property {Number} boundingVolumeType
     */
    this.boundingVolumeType = Broadphase.AABB;
}

/**
 * Axis aligned bounding box type.
 * @static
 * @property {Number} AABB
 */
Broadphase.AABB = 1;

/**
 * Bounding circle type.
 * @static
 * @property {Number} BOUNDING_CIRCLE
 */
Broadphase.BOUNDING_CIRCLE = 2;

/**
 * Set the world that we are searching for collision pairs in.
 * @method setWorld
 * @param  {World} world
 */
Broadphase.prototype.setWorld = function(world){
    this.world = world;
};

/**
 * Get all potential intersecting body pairs.
 * @method getCollisionPairs
 * @param  {World} world The world to search in.
 * @return {Array} An array of the bodies, ordered in pairs. Example: A result of [a,b,c,d] means that the potential pairs are: (a,b), (c,d).
 */
Broadphase.prototype.getCollisionPairs = function(world){};

var dist = vec2.create();

/**
 * Check whether the bounding radius of two bodies overlap.
 * @method  boundingRadiusCheck
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Broadphase.boundingRadiusCheck = function(bodyA, bodyB){
    vec2.sub(dist, bodyA.position, bodyB.position);
    var d2 = vec2.squaredLength(dist),
        r = bodyA.boundingRadius + bodyB.boundingRadius;
    return d2 <= r*r;
};

/**
 * Check whether the bounding radius of two bodies overlap.
 * @method  boundingRadiusCheck
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Broadphase.aabbCheck = function(bodyA, bodyB){
    return bodyA.getAABB().overlaps(bodyB.getAABB());
};

/**
 * Check whether the bounding radius of two bodies overlap.
 * @method  boundingRadiusCheck
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Broadphase.prototype.boundingVolumeCheck = function(bodyA, bodyB){
    var result;

    switch(this.boundingVolumeType){
    case Broadphase.BOUNDING_CIRCLE:
        result =  Broadphase.boundingRadiusCheck(bodyA,bodyB);
        break;
    case Broadphase.AABB:
        result = Broadphase.aabbCheck(bodyA,bodyB);
        break;
    default:
        throw new Error('Bounding volume type not recognized: '+this.boundingVolumeType);
    }
    return result;
};

/**
 * Check whether two bodies are allowed to collide at all.
 * @method  canCollide
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Broadphase.canCollide = function(bodyA, bodyB){
    var KINEMATIC = Body.KINEMATIC;
    var STATIC = Body.STATIC;

    // Cannot collide static bodies
    if(bodyA.type === STATIC && bodyB.type === STATIC){
        return false;
    }

    // Cannot collide static vs kinematic bodies
    if( (bodyA.type === KINEMATIC && bodyB.type === STATIC) ||
        (bodyA.type === STATIC    && bodyB.type === KINEMATIC)){
        return false;
    }

    // Cannot collide kinematic vs kinematic
    if(bodyA.type === KINEMATIC && bodyB.type === KINEMATIC){
        return false;
    }

    // Cannot collide both sleeping bodies
    if(bodyA.sleepState === Body.SLEEPING && bodyB.sleepState === Body.SLEEPING){
        return false;
    }

    // Cannot collide if one is static and the other is sleeping
    if( (bodyA.sleepState === Body.SLEEPING && bodyB.type === STATIC) ||
        (bodyB.sleepState === Body.SLEEPING && bodyA.type === STATIC)){
        return false;
    }

    return true;
};

Broadphase.NAIVE = 1;
Broadphase.SAP = 2;


/***/ }),

/***/ "./node_modules/p2/src/collision/NaiveBroadphase.js":
/*!**********************************************************!*\
  !*** ./node_modules/p2/src/collision/NaiveBroadphase.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Circle = __webpack_require__(/*! ../shapes/Circle */ "./node_modules/p2/src/shapes/Circle.js"),
    Plane = __webpack_require__(/*! ../shapes/Plane */ "./node_modules/p2/src/shapes/Plane.js"),
    Shape = __webpack_require__(/*! ../shapes/Shape */ "./node_modules/p2/src/shapes/Shape.js"),
    Particle = __webpack_require__(/*! ../shapes/Particle */ "./node_modules/p2/src/shapes/Particle.js"),
    Broadphase = __webpack_require__(/*! ../collision/Broadphase */ "./node_modules/p2/src/collision/Broadphase.js"),
    vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");

module.exports = NaiveBroadphase;

/**
 * Naive broadphase implementation. Does N^2 tests.
 *
 * @class NaiveBroadphase
 * @constructor
 * @extends Broadphase
 */
function NaiveBroadphase(){
    Broadphase.call(this, Broadphase.NAIVE);
}
NaiveBroadphase.prototype = new Broadphase();
NaiveBroadphase.prototype.constructor = NaiveBroadphase;

/**
 * Get the colliding pairs
 * @method getCollisionPairs
 * @param  {World} world
 * @return {Array}
 */
NaiveBroadphase.prototype.getCollisionPairs = function(world){
    var bodies = world.bodies,
        result = this.result;

    result.length = 0;

    for(var i=0, Ncolliding=bodies.length; i!==Ncolliding; i++){
        var bi = bodies[i];

        for(var j=0; j<i; j++){
            var bj = bodies[j];

            if(Broadphase.canCollide(bi,bj) && this.boundingVolumeCheck(bi,bj)){
                result.push(bi,bj);
            }
        }
    }

    return result;
};

/**
 * Returns all the bodies within an AABB.
 * @method aabbQuery
 * @param  {World} world
 * @param  {AABB} aabb
 * @param {array} result An array to store resulting bodies in.
 * @return {array}
 */
NaiveBroadphase.prototype.aabbQuery = function(world, aabb, result){
    result = result || [];

    var bodies = world.bodies;
    for(var i = 0; i < bodies.length; i++){
        var b = bodies[i];

        if(b.aabbNeedsUpdate){
            b.updateAABB();
        }

        if(b.aabb.overlaps(aabb)){
            result.push(b);
        }
    }

    return result;
};

/***/ }),

/***/ "./node_modules/p2/src/collision/Narrowphase.js":
/*!******************************************************!*\
  !*** ./node_modules/p2/src/collision/Narrowphase.js ***!
  \******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,   sub = vec2.sub
,   add = vec2.add
,   dot = vec2.dot
,   Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js")
,   ContactEquationPool = __webpack_require__(/*! ../utils/ContactEquationPool */ "./node_modules/p2/src/utils/ContactEquationPool.js")
,   FrictionEquationPool = __webpack_require__(/*! ../utils/FrictionEquationPool */ "./node_modules/p2/src/utils/FrictionEquationPool.js")
,   TupleDictionary = __webpack_require__(/*! ../utils/TupleDictionary */ "./node_modules/p2/src/utils/TupleDictionary.js")
,   Equation = __webpack_require__(/*! ../equations/Equation */ "./node_modules/p2/src/equations/Equation.js")
,   ContactEquation = __webpack_require__(/*! ../equations/ContactEquation */ "./node_modules/p2/src/equations/ContactEquation.js")
,   FrictionEquation = __webpack_require__(/*! ../equations/FrictionEquation */ "./node_modules/p2/src/equations/FrictionEquation.js")
,   Circle = __webpack_require__(/*! ../shapes/Circle */ "./node_modules/p2/src/shapes/Circle.js")
,   Convex = __webpack_require__(/*! ../shapes/Convex */ "./node_modules/p2/src/shapes/Convex.js")
,   Shape = __webpack_require__(/*! ../shapes/Shape */ "./node_modules/p2/src/shapes/Shape.js")
,   Body = __webpack_require__(/*! ../objects/Body */ "./node_modules/p2/src/objects/Body.js")
,   Box = __webpack_require__(/*! ../shapes/Box */ "./node_modules/p2/src/shapes/Box.js");

module.exports = Narrowphase;

// Temp things
var yAxis = vec2.fromValues(0,1);

var tmp1 = vec2.fromValues(0,0)
,   tmp2 = vec2.fromValues(0,0)
,   tmp3 = vec2.fromValues(0,0)
,   tmp4 = vec2.fromValues(0,0)
,   tmp5 = vec2.fromValues(0,0)
,   tmp6 = vec2.fromValues(0,0)
,   tmp7 = vec2.fromValues(0,0)
,   tmp8 = vec2.fromValues(0,0)
,   tmp9 = vec2.fromValues(0,0)
,   tmp10 = vec2.fromValues(0,0)
,   tmp11 = vec2.fromValues(0,0)
,   tmp12 = vec2.fromValues(0,0)
,   tmp13 = vec2.fromValues(0,0)
,   tmp14 = vec2.fromValues(0,0)
,   tmp15 = vec2.fromValues(0,0)
,   tmp16 = vec2.fromValues(0,0)
,   tmp17 = vec2.fromValues(0,0)
,   tmp18 = vec2.fromValues(0,0)
,   tmpArray = [];

/**
 * Narrowphase. Creates contacts and friction given shapes and transforms.
 * @class Narrowphase
 * @constructor
 */
function Narrowphase(){

    /**
     * @property contactEquations
     * @type {Array}
     */
    this.contactEquations = [];

    /**
     * @property frictionEquations
     * @type {Array}
     */
    this.frictionEquations = [];

    /**
     * Whether to make friction equations in the upcoming contacts.
     * @property enableFriction
     * @type {Boolean}
     */
    this.enableFriction = true;

    /**
     * Whether to make equations enabled in upcoming contacts.
     * @property enabledEquations
     * @type {Boolean}
     */
    this.enabledEquations = true;

    /**
     * The friction slip force to use when creating friction equations.
     * @property slipForce
     * @type {Number}
     */
    this.slipForce = 10.0;

    /**
     * The friction value to use in the upcoming friction equations.
     * @property frictionCoefficient
     * @type {Number}
     */
    this.frictionCoefficient = 0.3;

    /**
     * Will be the .relativeVelocity in each produced FrictionEquation.
     * @property {Number} surfaceVelocity
     */
    this.surfaceVelocity = 0;

    /**
     * Keeps track of the allocated ContactEquations.
     * @property {ContactEquationPool} contactEquationPool
     *
     * @example
     *
     *     // Allocate a few equations before starting the simulation.
     *     // This way, no contact objects need to be created on the fly in the game loop.
     *     world.narrowphase.contactEquationPool.resize(1024);
     *     world.narrowphase.frictionEquationPool.resize(1024);
     */
    this.contactEquationPool = new ContactEquationPool({ size: 32 });

    /**
     * Keeps track of the allocated ContactEquations.
     * @property {FrictionEquationPool} frictionEquationPool
     */
    this.frictionEquationPool = new FrictionEquationPool({ size: 64 });

    /**
     * The restitution value to use in the next contact equations.
     * @property restitution
     * @type {Number}
     */
    this.restitution = 0;

    /**
     * The stiffness value to use in the next contact equations.
     * @property {Number} stiffness
     */
    this.stiffness = Equation.DEFAULT_STIFFNESS;

    /**
     * The stiffness value to use in the next contact equations.
     * @property {Number} stiffness
     */
    this.relaxation = Equation.DEFAULT_RELAXATION;

    /**
     * The stiffness value to use in the next friction equations.
     * @property frictionStiffness
     * @type {Number}
     */
    this.frictionStiffness = Equation.DEFAULT_STIFFNESS;

    /**
     * The relaxation value to use in the next friction equations.
     * @property frictionRelaxation
     * @type {Number}
     */
    this.frictionRelaxation = Equation.DEFAULT_RELAXATION;

    /**
     * Enable reduction of friction equations. If disabled, a box on a plane will generate 2 contact equations and 2 friction equations. If enabled, there will be only one friction equation. Same kind of simplifications are made  for all collision types.
     * @property enableFrictionReduction
     * @type {Boolean}
     * @deprecated This flag will be removed when the feature is stable enough.
     * @default true
     */
    this.enableFrictionReduction = true;

    /**
     * Keeps track of the colliding bodies last step.
     * @private
     * @property collidingBodiesLastStep
     * @type {TupleDictionary}
     */
    this.collidingBodiesLastStep = new TupleDictionary();

    /**
     * Contact skin size value to use in the next contact equations.
     * @property {Number} contactSkinSize
     * @default 0.01
     */
    this.contactSkinSize = 0.01;
}

var bodiesOverlap_shapePositionA = vec2.create();
var bodiesOverlap_shapePositionB = vec2.create();

/**
 * @method bodiesOverlap
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 * @todo shape world transforms are wrong
 */
Narrowphase.prototype.bodiesOverlap = function(bodyA, bodyB){
    var shapePositionA = bodiesOverlap_shapePositionA;
    var shapePositionB = bodiesOverlap_shapePositionB;

    // Loop over all shapes of bodyA
    for(var k=0, Nshapesi=bodyA.shapes.length; k!==Nshapesi; k++){
        var shapeA = bodyA.shapes[k];

        bodyA.toWorldFrame(shapePositionA, shapeA.position);

        // All shapes of body j
        for(var l=0, Nshapesj=bodyB.shapes.length; l!==Nshapesj; l++){
            var shapeB = bodyB.shapes[l];

            bodyB.toWorldFrame(shapePositionB, shapeB.position);

            if(this[shapeA.type | shapeB.type](
                bodyA,
                shapeA,
                shapePositionA,
                shapeA.angle + bodyA.angle,
                bodyB,
                shapeB,
                shapePositionB,
                shapeB.angle + bodyB.angle,
                true
            )){
                return true;
            }
        }
    }

    return false;
};

/**
 * Check if the bodies were in contact since the last reset().
 * @method collidedLastStep
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {Boolean}
 */
Narrowphase.prototype.collidedLastStep = function(bodyA, bodyB){
    var id1 = bodyA.id|0,
        id2 = bodyB.id|0;
    return !!this.collidingBodiesLastStep.get(id1, id2);
};

/**
 * Throws away the old equations and gets ready to create new
 * @method reset
 */
Narrowphase.prototype.reset = function(){
    this.collidingBodiesLastStep.reset();

    var eqs = this.contactEquations;
    var l = eqs.length;
    while(l--){
        var eq = eqs[l],
            id1 = eq.bodyA.id,
            id2 = eq.bodyB.id;
        this.collidingBodiesLastStep.set(id1, id2, true);
    }

    var ce = this.contactEquations,
        fe = this.frictionEquations;
    for(var i=0; i<ce.length; i++){
        this.contactEquationPool.release(ce[i]);
    }
    for(var i=0; i<fe.length; i++){
        this.frictionEquationPool.release(fe[i]);
    }

    // Reset
    this.contactEquations.length = this.frictionEquations.length = 0;
};

/**
 * Creates a ContactEquation, either by reusing an existing object or creating a new one.
 * @method createContactEquation
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {ContactEquation}
 */
Narrowphase.prototype.createContactEquation = function(bodyA, bodyB, shapeA, shapeB){
    var c = this.contactEquationPool.get();
    c.bodyA = bodyA;
    c.bodyB = bodyB;
    c.shapeA = shapeA;
    c.shapeB = shapeB;
    c.restitution = this.restitution;
    c.firstImpact = !this.collidedLastStep(bodyA,bodyB);
    c.stiffness = this.stiffness;
    c.relaxation = this.relaxation;
    c.needsUpdate = true;
    c.enabled = this.enabledEquations;
    c.offset = this.contactSkinSize;

    return c;
};

/**
 * Creates a FrictionEquation, either by reusing an existing object or creating a new one.
 * @method createFrictionEquation
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {FrictionEquation}
 */
Narrowphase.prototype.createFrictionEquation = function(bodyA, bodyB, shapeA, shapeB){
    var c = this.frictionEquationPool.get();
    c.bodyA = bodyA;
    c.bodyB = bodyB;
    c.shapeA = shapeA;
    c.shapeB = shapeB;
    c.setSlipForce(this.slipForce);
    c.frictionCoefficient = this.frictionCoefficient;
    c.relativeVelocity = this.surfaceVelocity;
    c.enabled = this.enabledEquations;
    c.needsUpdate = true;
    c.stiffness = this.frictionStiffness;
    c.relaxation = this.frictionRelaxation;
    c.contactEquations.length = 0;
    return c;
};

/**
 * Creates a FrictionEquation given the data in the ContactEquation. Uses same offset vectors ri and rj, but the tangent vector will be constructed from the collision normal.
 * @method createFrictionFromContact
 * @param  {ContactEquation} contactEquation
 * @return {FrictionEquation}
 */
Narrowphase.prototype.createFrictionFromContact = function(c){
    var eq = this.createFrictionEquation(c.bodyA, c.bodyB, c.shapeA, c.shapeB);
    vec2.copy(eq.contactPointA, c.contactPointA);
    vec2.copy(eq.contactPointB, c.contactPointB);
    vec2.rotate90cw(eq.t, c.normalA);
    eq.contactEquations.push(c);
    return eq;
};

// Take the average N latest contact point on the plane.
Narrowphase.prototype.createFrictionFromAverage = function(numContacts){
    var c = this.contactEquations[this.contactEquations.length - 1];
    var eq = this.createFrictionEquation(c.bodyA, c.bodyB, c.shapeA, c.shapeB);
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    vec2.set(eq.contactPointA, 0, 0);
    vec2.set(eq.contactPointB, 0, 0);
    vec2.set(eq.t, 0, 0);
    for(var i=0; i!==numContacts; i++){
        c = this.contactEquations[this.contactEquations.length - 1 - i];
        if(c.bodyA === bodyA){
            vec2.add(eq.t, eq.t, c.normalA);
            vec2.add(eq.contactPointA, eq.contactPointA, c.contactPointA);
            vec2.add(eq.contactPointB, eq.contactPointB, c.contactPointB);
        } else {
            vec2.sub(eq.t, eq.t, c.normalA);
            vec2.add(eq.contactPointA, eq.contactPointA, c.contactPointB);
            vec2.add(eq.contactPointB, eq.contactPointB, c.contactPointA);
        }
        eq.contactEquations.push(c);
    }

    var invNumContacts = 1/numContacts;
    vec2.scale(eq.contactPointA, eq.contactPointA, invNumContacts);
    vec2.scale(eq.contactPointB, eq.contactPointB, invNumContacts);
    vec2.normalize(eq.t, eq.t);
    vec2.rotate90cw(eq.t, eq.t);
    return eq;
};

/**
 * Convex/line narrowphase
 * @method convexLine
 * @param  {Body}       convexBody
 * @param  {Convex}     convexShape
 * @param  {Array}      convexOffset
 * @param  {Number}     convexAngle
 * @param  {Body}       lineBody
 * @param  {Line}       lineShape
 * @param  {Array}      lineOffset
 * @param  {Number}     lineAngle
 * @param {boolean}     justTest
 * @todo Implement me!
 */
Narrowphase.prototype[Shape.LINE | Shape.CONVEX] =
Narrowphase.prototype.convexLine = function(
    convexBody,
    convexShape,
    convexOffset,
    convexAngle,
    lineBody,
    lineShape,
    lineOffset,
    lineAngle,
    justTest
){
    // TODO
    if(justTest){
        return false;
    } else {
        return 0;
    }
};

/**
 * Line/box narrowphase
 * @method lineBox
 * @param  {Body}       lineBody
 * @param  {Line}       lineShape
 * @param  {Array}      lineOffset
 * @param  {Number}     lineAngle
 * @param  {Body}       boxBody
 * @param  {Box}  boxShape
 * @param  {Array}      boxOffset
 * @param  {Number}     boxAngle
 * @param  {Boolean}    justTest
 * @todo Implement me!
 */
Narrowphase.prototype[Shape.LINE | Shape.BOX] =
Narrowphase.prototype.lineBox = function(
    lineBody,
    lineShape,
    lineOffset,
    lineAngle,
    boxBody,
    boxShape,
    boxOffset,
    boxAngle,
    justTest
){
    // TODO
    if(justTest){
        return false;
    } else {
        return 0;
    }
};

function setConvexToCapsuleShapeMiddle(convexShape, capsuleShape){
    vec2.set(convexShape.vertices[0], -capsuleShape.length * 0.5, -capsuleShape.radius);
    vec2.set(convexShape.vertices[1],  capsuleShape.length * 0.5, -capsuleShape.radius);
    vec2.set(convexShape.vertices[2],  capsuleShape.length * 0.5,  capsuleShape.radius);
    vec2.set(convexShape.vertices[3], -capsuleShape.length * 0.5,  capsuleShape.radius);
}

var convexCapsule_tempRect = new Box({ width: 1, height: 1 }),
    convexCapsule_tempVec = vec2.create();

/**
 * Convex/capsule narrowphase
 * @method convexCapsule
 * @param  {Body}       convexBody
 * @param  {Convex}     convexShape
 * @param  {Array}      convexPosition
 * @param  {Number}     convexAngle
 * @param  {Body}       capsuleBody
 * @param  {Capsule}    capsuleShape
 * @param  {Array}      capsulePosition
 * @param  {Number}     capsuleAngle
 */
Narrowphase.prototype[Shape.CAPSULE | Shape.CONVEX] =
Narrowphase.prototype[Shape.CAPSULE | Shape.BOX] =
Narrowphase.prototype.convexCapsule = function(
    convexBody,
    convexShape,
    convexPosition,
    convexAngle,
    capsuleBody,
    capsuleShape,
    capsulePosition,
    capsuleAngle,
    justTest
){

    // Check the circles
    // Add offsets!
    var circlePos = convexCapsule_tempVec;
    vec2.set(circlePos, capsuleShape.length/2,0);
    vec2.rotate(circlePos,circlePos,capsuleAngle);
    vec2.add(circlePos,circlePos,capsulePosition);
    var result1 = this.circleConvex(capsuleBody,capsuleShape,circlePos,capsuleAngle, convexBody,convexShape,convexPosition,convexAngle, justTest, capsuleShape.radius);

    vec2.set(circlePos,-capsuleShape.length/2, 0);
    vec2.rotate(circlePos,circlePos,capsuleAngle);
    vec2.add(circlePos,circlePos,capsulePosition);
    var result2 = this.circleConvex(capsuleBody,capsuleShape,circlePos,capsuleAngle, convexBody,convexShape,convexPosition,convexAngle, justTest, capsuleShape.radius);

    if(justTest && (result1 || result2)){
        return true;
    }

    // Check center rect
    var r = convexCapsule_tempRect;
    setConvexToCapsuleShapeMiddle(r,capsuleShape);
    var result = this.convexConvex(convexBody,convexShape,convexPosition,convexAngle, capsuleBody,r,capsulePosition,capsuleAngle, justTest);

    return result + result1 + result2;
};

/**
 * Capsule/line narrowphase
 * @method lineCapsule
 * @param  {Body}       lineBody
 * @param  {Line}       lineShape
 * @param  {Array}      linePosition
 * @param  {Number}     lineAngle
 * @param  {Body}       capsuleBody
 * @param  {Capsule}    capsuleShape
 * @param  {Array}      capsulePosition
 * @param  {Number}     capsuleAngle
 * @todo Implement me!
 */
Narrowphase.prototype[Shape.CAPSULE | Shape.LINE] =
Narrowphase.prototype.lineCapsule = function(
    lineBody,
    lineShape,
    linePosition,
    lineAngle,
    capsuleBody,
    capsuleShape,
    capsulePosition,
    capsuleAngle,
    justTest
){
    // TODO
    if(justTest){
        return false;
    } else {
        return 0;
    }
};

var capsuleCapsule_tempVec1 = vec2.create();
var capsuleCapsule_tempVec2 = vec2.create();
var capsuleCapsule_tempRect1 = new Box({ width: 1, height: 1 });

/**
 * Capsule/capsule narrowphase
 * @method capsuleCapsule
 * @param  {Body}       bi
 * @param  {Capsule}    si
 * @param  {Array}      xi
 * @param  {Number}     ai
 * @param  {Body}       bj
 * @param  {Capsule}    sj
 * @param  {Array}      xj
 * @param  {Number}     aj
 */
Narrowphase.prototype[Shape.CAPSULE | Shape.CAPSULE] =
Narrowphase.prototype.capsuleCapsule = function(bi,si,xi,ai, bj,sj,xj,aj, justTest){

    var enableFrictionBefore;

    // Check the circles
    // Add offsets!
    var circlePosi = capsuleCapsule_tempVec1,
        circlePosj = capsuleCapsule_tempVec2;

    var numContacts = 0;


    // Need 4 circle checks, between all
    for(var i=0; i<2; i++){

        vec2.set(circlePosi,(i===0?-1:1)*si.length/2,0);
        vec2.rotate(circlePosi,circlePosi,ai);
        vec2.add(circlePosi,circlePosi,xi);

        for(var j=0; j<2; j++){

            vec2.set(circlePosj,(j===0?-1:1)*sj.length/2, 0);
            vec2.rotate(circlePosj,circlePosj,aj);
            vec2.add(circlePosj,circlePosj,xj);

            // Temporarily turn off friction
            if(this.enableFrictionReduction){
                enableFrictionBefore = this.enableFriction;
                this.enableFriction = false;
            }

            var result = this.circleCircle(bi,si,circlePosi,ai, bj,sj,circlePosj,aj, justTest, si.radius, sj.radius);

            if(this.enableFrictionReduction){
                this.enableFriction = enableFrictionBefore;
            }

            if(justTest && result){
                return true;
            }

            numContacts += result;
        }
    }

    if(this.enableFrictionReduction){
        // Temporarily turn off friction
        enableFrictionBefore = this.enableFriction;
        this.enableFriction = false;
    }

    // Check circles against the center boxs
    var rect = capsuleCapsule_tempRect1;
    setConvexToCapsuleShapeMiddle(rect,si);
    var result1 = this.convexCapsule(bi,rect,xi,ai, bj,sj,xj,aj, justTest);

    if(this.enableFrictionReduction){
        this.enableFriction = enableFrictionBefore;
    }

    if(justTest && result1){
        return true;
    }
    numContacts += result1;

    if(this.enableFrictionReduction){
        // Temporarily turn off friction
        var enableFrictionBefore = this.enableFriction;
        this.enableFriction = false;
    }

    setConvexToCapsuleShapeMiddle(rect,sj);
    var result2 = this.convexCapsule(bj,rect,xj,aj, bi,si,xi,ai, justTest);

    if(this.enableFrictionReduction){
        this.enableFriction = enableFrictionBefore;
    }

    if(justTest && result2){
        return true;
    }
    numContacts += result2;

    if(this.enableFrictionReduction){
        if(numContacts && this.enableFriction){
            this.frictionEquations.push(this.createFrictionFromAverage(numContacts));
        }
    }

    return numContacts;
};

/**
 * Line/line narrowphase
 * @method lineLine
 * @param  {Body}       bodyA
 * @param  {Line}       shapeA
 * @param  {Array}      positionA
 * @param  {Number}     angleA
 * @param  {Body}       bodyB
 * @param  {Line}       shapeB
 * @param  {Array}      positionB
 * @param  {Number}     angleB
 * @todo Implement me!
 */
Narrowphase.prototype[Shape.LINE | Shape.LINE] =
Narrowphase.prototype.lineLine = function(
    bodyA,
    shapeA,
    positionA,
    angleA,
    bodyB,
    shapeB,
    positionB,
    angleB,
    justTest
){
    // TODO
    if(justTest){
        return false;
    } else {
        return 0;
    }
};

/**
 * Plane/line Narrowphase
 * @method planeLine
 * @param  {Body}   planeBody
 * @param  {Plane}  planeShape
 * @param  {Array}  planeOffset
 * @param  {Number} planeAngle
 * @param  {Body}   lineBody
 * @param  {Line}   lineShape
 * @param  {Array}  lineOffset
 * @param  {Number} lineAngle
 */
Narrowphase.prototype[Shape.PLANE | Shape.LINE] =
Narrowphase.prototype.planeLine = function(planeBody, planeShape, planeOffset, planeAngle,
                                           lineBody,  lineShape,  lineOffset,  lineAngle, justTest){
    var worldVertex0 = tmp1,
        worldVertex1 = tmp2,
        worldVertex01 = tmp3,
        worldVertex11 = tmp4,
        worldEdge = tmp5,
        worldEdgeUnit = tmp6,
        dist = tmp7,
        worldNormal = tmp8,
        worldTangent = tmp9,
        verts = tmpArray,
        numContacts = 0;

    // Get start and end points
    vec2.set(worldVertex0, -lineShape.length/2, 0);
    vec2.set(worldVertex1,  lineShape.length/2, 0);

    // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.
    vec2.rotate(worldVertex01, worldVertex0, lineAngle);
    vec2.rotate(worldVertex11, worldVertex1, lineAngle);

    add(worldVertex01, worldVertex01, lineOffset);
    add(worldVertex11, worldVertex11, lineOffset);

    vec2.copy(worldVertex0,worldVertex01);
    vec2.copy(worldVertex1,worldVertex11);

    // Get vector along the line
    sub(worldEdge, worldVertex1, worldVertex0);
    vec2.normalize(worldEdgeUnit, worldEdge);

    // Get tangent to the edge.
    vec2.rotate90cw(worldTangent, worldEdgeUnit);

    vec2.rotate(worldNormal, yAxis, planeAngle);

    // Check line ends
    verts[0] = worldVertex0;
    verts[1] = worldVertex1;
    for(var i=0; i<verts.length; i++){
        var v = verts[i];

        sub(dist, v, planeOffset);

        var d = dot(dist,worldNormal);

        if(d < 0){

            if(justTest){
                return true;
            }

            var c = this.createContactEquation(planeBody,lineBody,planeShape,lineShape);
            numContacts++;

            vec2.copy(c.normalA, worldNormal);
            vec2.normalize(c.normalA,c.normalA);

            // distance vector along plane normal
            vec2.scale(dist, worldNormal, d);

            // Vector from plane center to contact
            sub(c.contactPointA, v, dist);
            sub(c.contactPointA, c.contactPointA, planeBody.position);

            // From line center to contact
            sub(c.contactPointB, v,    lineOffset);
            add(c.contactPointB, c.contactPointB, lineOffset);
            sub(c.contactPointB, c.contactPointB, lineBody.position);

            this.contactEquations.push(c);

            if(!this.enableFrictionReduction){
                if(this.enableFriction){
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }
            }
        }
    }

    if(justTest){
        return false;
    }

    if(!this.enableFrictionReduction){
        if(numContacts && this.enableFriction){
            this.frictionEquations.push(this.createFrictionFromAverage(numContacts));
        }
    }

    return numContacts;
};

Narrowphase.prototype[Shape.PARTICLE | Shape.CAPSULE] =
Narrowphase.prototype.particleCapsule = function(
    particleBody,
    particleShape,
    particlePosition,
    particleAngle,
    capsuleBody,
    capsuleShape,
    capsulePosition,
    capsuleAngle,
    justTest
){
    return this.circleLine(particleBody,particleShape,particlePosition,particleAngle, capsuleBody,capsuleShape,capsulePosition,capsuleAngle, justTest, capsuleShape.radius, 0);
};

/**
 * Circle/line Narrowphase
 * @method circleLine
 * @param  {Body} circleBody
 * @param  {Circle} circleShape
 * @param  {Array} circleOffset
 * @param  {Number} circleAngle
 * @param  {Body} lineBody
 * @param  {Line} lineShape
 * @param  {Array} lineOffset
 * @param  {Number} lineAngle
 * @param {Boolean} justTest If set to true, this function will return the result (intersection or not) without adding equations.
 * @param {Number} lineRadius Radius to add to the line. Can be used to test Capsules.
 * @param {Number} circleRadius If set, this value overrides the circle shape radius.
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.LINE] =
Narrowphase.prototype.circleLine = function(
    circleBody,
    circleShape,
    circleOffset,
    circleAngle,
    lineBody,
    lineShape,
    lineOffset,
    lineAngle,
    justTest,
    lineRadius,
    circleRadius
){
    var lineRadius = lineRadius || 0,
        circleRadius = typeof(circleRadius)!=="undefined" ? circleRadius : circleShape.radius,

        orthoDist = tmp1,
        lineToCircleOrthoUnit = tmp2,
        projectedPoint = tmp3,
        centerDist = tmp4,
        worldTangent = tmp5,
        worldEdge = tmp6,
        worldEdgeUnit = tmp7,
        worldVertex0 = tmp8,
        worldVertex1 = tmp9,
        worldVertex01 = tmp10,
        worldVertex11 = tmp11,
        dist = tmp12,
        lineToCircle = tmp13,
        lineEndToLineRadius = tmp14,

        verts = tmpArray;

    // Get start and end points
    vec2.set(worldVertex0, -lineShape.length/2, 0);
    vec2.set(worldVertex1,  lineShape.length/2, 0);

    // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.
    vec2.rotate(worldVertex01, worldVertex0, lineAngle);
    vec2.rotate(worldVertex11, worldVertex1, lineAngle);

    add(worldVertex01, worldVertex01, lineOffset);
    add(worldVertex11, worldVertex11, lineOffset);

    vec2.copy(worldVertex0,worldVertex01);
    vec2.copy(worldVertex1,worldVertex11);

    // Get vector along the line
    sub(worldEdge, worldVertex1, worldVertex0);
    vec2.normalize(worldEdgeUnit, worldEdge);

    // Get tangent to the edge.
    vec2.rotate90cw(worldTangent, worldEdgeUnit);

    // Check distance from the plane spanned by the edge vs the circle
    sub(dist, circleOffset, worldVertex0);
    var d = dot(dist, worldTangent); // Distance from center of line to circle center
    sub(centerDist, worldVertex0, lineOffset);

    sub(lineToCircle, circleOffset, lineOffset);

    var radiusSum = circleRadius + lineRadius;

    if(Math.abs(d) < radiusSum){

        // Now project the circle onto the edge
        vec2.scale(orthoDist, worldTangent, d);
        sub(projectedPoint, circleOffset, orthoDist);

        // Add the missing line radius
        vec2.scale(lineToCircleOrthoUnit, worldTangent, dot(worldTangent, lineToCircle));
        vec2.normalize(lineToCircleOrthoUnit,lineToCircleOrthoUnit);
        vec2.scale(lineToCircleOrthoUnit, lineToCircleOrthoUnit, lineRadius);
        add(projectedPoint,projectedPoint,lineToCircleOrthoUnit);

        // Check if the point is within the edge span
        var pos =  dot(worldEdgeUnit, projectedPoint);
        var pos0 = dot(worldEdgeUnit, worldVertex0);
        var pos1 = dot(worldEdgeUnit, worldVertex1);

        if(pos > pos0 && pos < pos1){
            // We got contact!

            if(justTest){
                return true;
            }

            var c = this.createContactEquation(circleBody,lineBody,circleShape,lineShape);

            vec2.scale(c.normalA, orthoDist, -1);
            vec2.normalize(c.normalA, c.normalA);

            vec2.scale( c.contactPointA, c.normalA,  circleRadius);
            add(c.contactPointA, c.contactPointA, circleOffset);
            sub(c.contactPointA, c.contactPointA, circleBody.position);

            sub(c.contactPointB, projectedPoint, lineOffset);
            add(c.contactPointB, c.contactPointB, lineOffset);
            sub(c.contactPointB, c.contactPointB, lineBody.position);

            this.contactEquations.push(c);

            if(this.enableFriction){
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }

            return 1;
        }
    }

    // Add corner
    verts[0] = worldVertex0;
    verts[1] = worldVertex1;

    for(var i=0; i<verts.length; i++){
        var v = verts[i];

        sub(dist, v, circleOffset);

        if(vec2.squaredLength(dist) < Math.pow(radiusSum, 2)){

            if(justTest){
                return true;
            }

            var c = this.createContactEquation(circleBody,lineBody,circleShape,lineShape);

            vec2.copy(c.normalA, dist);
            vec2.normalize(c.normalA,c.normalA);

            // Vector from circle to contact point is the normal times the circle radius
            vec2.scale(c.contactPointA, c.normalA, circleRadius);
            add(c.contactPointA, c.contactPointA, circleOffset);
            sub(c.contactPointA, c.contactPointA, circleBody.position);

            sub(c.contactPointB, v, lineOffset);
            vec2.scale(lineEndToLineRadius, c.normalA, -lineRadius);
            add(c.contactPointB, c.contactPointB, lineEndToLineRadius);
            add(c.contactPointB, c.contactPointB, lineOffset);
            sub(c.contactPointB, c.contactPointB, lineBody.position);

            this.contactEquations.push(c);

            if(this.enableFriction){
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }

            return 1;
        }
    }

    return 0;
};

/**
 * Circle/capsule Narrowphase
 * @method circleCapsule
 * @param  {Body}   bi
 * @param  {Circle} si
 * @param  {Array}  xi
 * @param  {Number} ai
 * @param  {Body}   bj
 * @param  {Line}   sj
 * @param  {Array}  xj
 * @param  {Number} aj
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.CAPSULE] =
Narrowphase.prototype.circleCapsule = function(bi,si,xi,ai, bj,sj,xj,aj, justTest){
    return this.circleLine(bi,si,xi,ai, bj,sj,xj,aj, justTest, sj.radius);
};

/**
 * Circle/convex Narrowphase.
 * @method circleConvex
 * @param  {Body} circleBody
 * @param  {Circle} circleShape
 * @param  {Array} circleOffset
 * @param  {Number} circleAngle
 * @param  {Body} convexBody
 * @param  {Convex} convexShape
 * @param  {Array} convexOffset
 * @param  {Number} convexAngle
 * @param  {Boolean} justTest
 * @param  {Number} circleRadius
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.CONVEX] =
Narrowphase.prototype[Shape.CIRCLE | Shape.BOX] =
Narrowphase.prototype.circleConvex = function(
    circleBody,
    circleShape,
    circleOffset,
    circleAngle,
    convexBody,
    convexShape,
    convexOffset,
    convexAngle,
    justTest,
    circleRadius
){
    var circleRadius = typeof(circleRadius)==="number" ? circleRadius : circleShape.radius;

    var worldVertex0 = tmp1,
        worldVertex1 = tmp2,
        worldEdge = tmp3,
        worldEdgeUnit = tmp4,
        worldNormal = tmp5,
        centerDist = tmp6,
        convexToCircle = tmp7,
        orthoDist = tmp8,
        projectedPoint = tmp9,
        dist = tmp10,
        worldVertex = tmp11,

        closestEdge = -1,
        closestEdgeDistance = null,
        closestEdgeOrthoDist = tmp12,
        closestEdgeProjectedPoint = tmp13,
        candidate = tmp14,
        candidateDist = tmp15,
        minCandidate = tmp16,

        found = false,
        minCandidateDistance = Number.MAX_VALUE;

    var numReported = 0;

    // New algorithm:
    // 1. Check so center of circle is not inside the polygon. If it is, this wont work...
    // 2. For each edge
    // 2. 1. Get point on circle that is closest to the edge (scale normal with -radius)
    // 2. 2. Check if point is inside.

    var verts = convexShape.vertices;

    // Check all edges first
    for(var i=0; i!==verts.length+1; i++){
        var v0 = verts[i%verts.length],
            v1 = verts[(i+1)%verts.length];

        vec2.rotate(worldVertex0, v0, convexAngle);
        vec2.rotate(worldVertex1, v1, convexAngle);
        add(worldVertex0, worldVertex0, convexOffset);
        add(worldVertex1, worldVertex1, convexOffset);
        sub(worldEdge, worldVertex1, worldVertex0);

        vec2.normalize(worldEdgeUnit, worldEdge);

        // Get tangent to the edge. Points out of the Convex
        vec2.rotate90cw(worldNormal, worldEdgeUnit);

        // Get point on circle, closest to the polygon
        vec2.scale(candidate,worldNormal,-circleShape.radius);
        add(candidate,candidate,circleOffset);

        if(pointInConvex(candidate,convexShape,convexOffset,convexAngle)){

            vec2.sub(candidateDist,worldVertex0,candidate);
            var candidateDistance = Math.abs(vec2.dot(candidateDist,worldNormal));

            if(candidateDistance < minCandidateDistance){
                vec2.copy(minCandidate,candidate);
                minCandidateDistance = candidateDistance;
                vec2.scale(closestEdgeProjectedPoint,worldNormal,candidateDistance);
                vec2.add(closestEdgeProjectedPoint,closestEdgeProjectedPoint,candidate);
                found = true;
            }
        }
    }

    if(found){

        if(justTest){
            return true;
        }

        var c = this.createContactEquation(circleBody,convexBody,circleShape,convexShape);
        vec2.sub(c.normalA, minCandidate, circleOffset);
        vec2.normalize(c.normalA, c.normalA);

        vec2.scale(c.contactPointA,  c.normalA, circleRadius);
        add(c.contactPointA, c.contactPointA, circleOffset);
        sub(c.contactPointA, c.contactPointA, circleBody.position);

        sub(c.contactPointB, closestEdgeProjectedPoint, convexOffset);
        add(c.contactPointB, c.contactPointB, convexOffset);
        sub(c.contactPointB, c.contactPointB, convexBody.position);

        this.contactEquations.push(c);

        if(this.enableFriction){
            this.frictionEquations.push( this.createFrictionFromContact(c) );
        }

        return 1;
    }

    // Check all vertices
    if(circleRadius > 0){
        for(var i=0; i<verts.length; i++){
            var localVertex = verts[i];
            vec2.rotate(worldVertex, localVertex, convexAngle);
            add(worldVertex, worldVertex, convexOffset);

            sub(dist, worldVertex, circleOffset);
            if(vec2.squaredLength(dist) < Math.pow(circleRadius, 2)){

                if(justTest){
                    return true;
                }

                var c = this.createContactEquation(circleBody,convexBody,circleShape,convexShape);

                vec2.copy(c.normalA, dist);
                vec2.normalize(c.normalA,c.normalA);

                // Vector from circle to contact point is the normal times the circle radius
                vec2.scale(c.contactPointA, c.normalA, circleRadius);
                add(c.contactPointA, c.contactPointA, circleOffset);
                sub(c.contactPointA, c.contactPointA, circleBody.position);

                sub(c.contactPointB, worldVertex, convexOffset);
                add(c.contactPointB, c.contactPointB, convexOffset);
                sub(c.contactPointB, c.contactPointB, convexBody.position);

                this.contactEquations.push(c);

                if(this.enableFriction){
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }

                return 1;
            }
        }
    }

    return 0;
};

var pic_worldVertex0 = vec2.create(),
    pic_worldVertex1 = vec2.create(),
    pic_r0 = vec2.create(),
    pic_r1 = vec2.create();

/*
 * Check if a point is in a polygon
 */
function pointInConvex(worldPoint,convexShape,convexOffset,convexAngle){
    var worldVertex0 = pic_worldVertex0,
        worldVertex1 = pic_worldVertex1,
        r0 = pic_r0,
        r1 = pic_r1,
        point = worldPoint,
        verts = convexShape.vertices,
        lastCross = null;
    for(var i=0; i!==verts.length+1; i++){
        var v0 = verts[i%verts.length],
            v1 = verts[(i+1)%verts.length];

        // Transform vertices to world
        // @todo The point should be transformed to local coordinates in the convex, no need to transform each vertex
        vec2.rotate(worldVertex0, v0, convexAngle);
        vec2.rotate(worldVertex1, v1, convexAngle);
        add(worldVertex0, worldVertex0, convexOffset);
        add(worldVertex1, worldVertex1, convexOffset);

        sub(r0, worldVertex0, point);
        sub(r1, worldVertex1, point);
        var cross = vec2.crossLength(r0,r1);

        if(lastCross===null){
            lastCross = cross;
        }

        // If we got a different sign of the distance vector, the point is out of the polygon
        if(cross*lastCross <= 0){
            return false;
        }
        lastCross = cross;
    }
    return true;
}

/**
 * Particle/convex Narrowphase
 * @method particleConvex
 * @param  {Body} particleBody
 * @param  {Particle} particleShape
 * @param  {Array} particleOffset
 * @param  {Number} particleAngle
 * @param  {Body} convexBody
 * @param  {Convex} convexShape
 * @param  {Array} convexOffset
 * @param  {Number} convexAngle
 * @param {Boolean} justTest
 * @todo use pointInConvex and code more similar to circleConvex
 * @todo don't transform each vertex, but transform the particle position to convex-local instead
 */
Narrowphase.prototype[Shape.PARTICLE | Shape.CONVEX] =
Narrowphase.prototype[Shape.PARTICLE | Shape.BOX] =
Narrowphase.prototype.particleConvex = function(
    particleBody,
    particleShape,
    particleOffset,
    particleAngle,
    convexBody,
    convexShape,
    convexOffset,
    convexAngle,
    justTest
){
    var worldVertex0 = tmp1,
        worldVertex1 = tmp2,
        worldEdge = tmp3,
        worldEdgeUnit = tmp4,
        worldTangent = tmp5,
        centerDist = tmp6,
        convexToparticle = tmp7,
        orthoDist = tmp8,
        projectedPoint = tmp9,
        dist = tmp10,
        worldVertex = tmp11,
        closestEdge = -1,
        closestEdgeDistance = null,
        closestEdgeOrthoDist = tmp12,
        closestEdgeProjectedPoint = tmp13,
        r0 = tmp14, // vector from particle to vertex0
        r1 = tmp15,
        localPoint = tmp16,
        candidateDist = tmp17,
        minEdgeNormal = tmp18,
        minCandidateDistance = Number.MAX_VALUE;

    var numReported = 0,
        found = false,
        verts = convexShape.vertices;

    // Check if the particle is in the polygon at all
    if(!pointInConvex(particleOffset,convexShape,convexOffset,convexAngle)){
        return 0;
    }

    if(justTest){
        return true;
    }

    // Check edges first
    var lastCross = null;
    for(var i=0; i!==verts.length+1; i++){
        var v0 = verts[i%verts.length],
            v1 = verts[(i+1)%verts.length];

        // Transform vertices to world
        vec2.rotate(worldVertex0, v0, convexAngle);
        vec2.rotate(worldVertex1, v1, convexAngle);
        add(worldVertex0, worldVertex0, convexOffset);
        add(worldVertex1, worldVertex1, convexOffset);

        // Get world edge
        sub(worldEdge, worldVertex1, worldVertex0);
        vec2.normalize(worldEdgeUnit, worldEdge);

        // Get tangent to the edge. Points out of the Convex
        vec2.rotate90cw(worldTangent, worldEdgeUnit);

        // Check distance from the infinite line (spanned by the edge) to the particle
        sub(dist, particleOffset, worldVertex0);
        var d = dot(dist, worldTangent);
        sub(centerDist, worldVertex0, convexOffset);

        sub(convexToparticle, particleOffset, convexOffset);

        vec2.sub(candidateDist,worldVertex0,particleOffset);
        var candidateDistance = Math.abs(vec2.dot(candidateDist,worldTangent));

        if(candidateDistance < minCandidateDistance){
            minCandidateDistance = candidateDistance;
            vec2.scale(closestEdgeProjectedPoint,worldTangent,candidateDistance);
            vec2.add(closestEdgeProjectedPoint,closestEdgeProjectedPoint,particleOffset);
            vec2.copy(minEdgeNormal,worldTangent);
            found = true;
        }
    }

    if(found){
        var c = this.createContactEquation(particleBody,convexBody,particleShape,convexShape);

        vec2.scale(c.normalA, minEdgeNormal, -1);
        vec2.normalize(c.normalA, c.normalA);

        // Particle has no extent to the contact point
        vec2.set(c.contactPointA,  0, 0);
        add(c.contactPointA, c.contactPointA, particleOffset);
        sub(c.contactPointA, c.contactPointA, particleBody.position);

        // From convex center to point
        sub(c.contactPointB, closestEdgeProjectedPoint, convexOffset);
        add(c.contactPointB, c.contactPointB, convexOffset);
        sub(c.contactPointB, c.contactPointB, convexBody.position);

        this.contactEquations.push(c);

        if(this.enableFriction){
            this.frictionEquations.push( this.createFrictionFromContact(c) );
        }

        return 1;
    }


    return 0;
};

/**
 * Circle/circle Narrowphase
 * @method circleCircle
 * @param  {Body} bodyA
 * @param  {Circle} shapeA
 * @param  {Array} offsetA
 * @param  {Number} angleA
 * @param  {Body} bodyB
 * @param  {Circle} shapeB
 * @param  {Array} offsetB
 * @param  {Number} angleB
 * @param {Boolean} justTest
 * @param {Number} [radiusA] Optional radius to use for shapeA
 * @param {Number} [radiusB] Optional radius to use for shapeB
 */
Narrowphase.prototype[Shape.CIRCLE] =
Narrowphase.prototype.circleCircle = function(
    bodyA,
    shapeA,
    offsetA,
    angleA,
    bodyB,
    shapeB,
    offsetB,
    angleB,
    justTest,
    radiusA,
    radiusB
){

    var dist = tmp1,
        radiusA = radiusA || shapeA.radius,
        radiusB = radiusB || shapeB.radius;

    sub(dist,offsetA,offsetB);
    var r = radiusA + radiusB;
    if(vec2.squaredLength(dist) > Math.pow(r,2)){
        return 0;
    }

    if(justTest){
        return true;
    }

    var c = this.createContactEquation(bodyA,bodyB,shapeA,shapeB);
    sub(c.normalA, offsetB, offsetA);
    vec2.normalize(c.normalA,c.normalA);

    vec2.scale( c.contactPointA, c.normalA,  radiusA);
    vec2.scale( c.contactPointB, c.normalA, -radiusB);

    add(c.contactPointA, c.contactPointA, offsetA);
    sub(c.contactPointA, c.contactPointA, bodyA.position);

    add(c.contactPointB, c.contactPointB, offsetB);
    sub(c.contactPointB, c.contactPointB, bodyB.position);

    this.contactEquations.push(c);

    if(this.enableFriction){
        this.frictionEquations.push(this.createFrictionFromContact(c));
    }
    return 1;
};

/**
 * Plane/Convex Narrowphase
 * @method planeConvex
 * @param  {Body} planeBody
 * @param  {Plane} planeShape
 * @param  {Array} planeOffset
 * @param  {Number} planeAngle
 * @param  {Body} convexBody
 * @param  {Convex} convexShape
 * @param  {Array} convexOffset
 * @param  {Number} convexAngle
 * @param {Boolean} justTest
 */
Narrowphase.prototype[Shape.PLANE | Shape.CONVEX] =
Narrowphase.prototype[Shape.PLANE | Shape.BOX] =
Narrowphase.prototype.planeConvex = function(
    planeBody,
    planeShape,
    planeOffset,
    planeAngle,
    convexBody,
    convexShape,
    convexOffset,
    convexAngle,
    justTest
){
    var worldVertex = tmp1,
        worldNormal = tmp2,
        dist = tmp3;

    var numReported = 0;
    vec2.rotate(worldNormal, yAxis, planeAngle);

    for(var i=0; i!==convexShape.vertices.length; i++){
        var v = convexShape.vertices[i];
        vec2.rotate(worldVertex, v, convexAngle);
        add(worldVertex, worldVertex, convexOffset);

        sub(dist, worldVertex, planeOffset);

        if(dot(dist,worldNormal) <= 0){

            if(justTest){
                return true;
            }

            // Found vertex
            numReported++;

            var c = this.createContactEquation(planeBody,convexBody,planeShape,convexShape);

            sub(dist, worldVertex, planeOffset);

            vec2.copy(c.normalA, worldNormal);

            var d = dot(dist, c.normalA);
            vec2.scale(dist, c.normalA, d);

            // rj is from convex center to contact
            sub(c.contactPointB, worldVertex, convexBody.position);


            // ri is from plane center to contact
            sub( c.contactPointA, worldVertex, dist);
            sub( c.contactPointA, c.contactPointA, planeBody.position);

            this.contactEquations.push(c);

            if(!this.enableFrictionReduction){
                if(this.enableFriction){
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }
            }
        }
    }

    if(this.enableFrictionReduction){
        if(this.enableFriction && numReported){
            this.frictionEquations.push(this.createFrictionFromAverage(numReported));
        }
    }

    return numReported;
};

/**
 * Narrowphase for particle vs plane
 * @method particlePlane
 * @param  {Body}       particleBody
 * @param  {Particle}   particleShape
 * @param  {Array}      particleOffset
 * @param  {Number}     particleAngle
 * @param  {Body}       planeBody
 * @param  {Plane}      planeShape
 * @param  {Array}      planeOffset
 * @param  {Number}     planeAngle
 * @param {Boolean}     justTest
 */
Narrowphase.prototype[Shape.PARTICLE | Shape.PLANE] =
Narrowphase.prototype.particlePlane = function(
    particleBody,
    particleShape,
    particleOffset,
    particleAngle,
    planeBody,
    planeShape,
    planeOffset,
    planeAngle,
    justTest
){
    var dist = tmp1,
        worldNormal = tmp2;

    planeAngle = planeAngle || 0;

    sub(dist, particleOffset, planeOffset);
    vec2.rotate(worldNormal, yAxis, planeAngle);

    var d = dot(dist, worldNormal);

    if(d > 0){
        return 0;
    }
    if(justTest){
        return true;
    }

    var c = this.createContactEquation(planeBody,particleBody,planeShape,particleShape);

    vec2.copy(c.normalA, worldNormal);
    vec2.scale( dist, c.normalA, d );
    // dist is now the distance vector in the normal direction

    // ri is the particle position projected down onto the plane, from the plane center
    sub( c.contactPointA, particleOffset, dist);
    sub( c.contactPointA, c.contactPointA, planeBody.position);

    // rj is from the body center to the particle center
    sub( c.contactPointB, particleOffset, particleBody.position );

    this.contactEquations.push(c);

    if(this.enableFriction){
        this.frictionEquations.push(this.createFrictionFromContact(c));
    }
    return 1;
};

/**
 * Circle/Particle Narrowphase
 * @method circleParticle
 * @param  {Body} circleBody
 * @param  {Circle} circleShape
 * @param  {Array} circleOffset
 * @param  {Number} circleAngle
 * @param  {Body} particleBody
 * @param  {Particle} particleShape
 * @param  {Array} particleOffset
 * @param  {Number} particleAngle
 * @param  {Boolean} justTest
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.PARTICLE] =
Narrowphase.prototype.circleParticle = function(
    circleBody,
    circleShape,
    circleOffset,
    circleAngle,
    particleBody,
    particleShape,
    particleOffset,
    particleAngle,
    justTest
){
    var dist = tmp1;

    sub(dist, particleOffset, circleOffset);
    if(vec2.squaredLength(dist) > Math.pow(circleShape.radius, 2)){
        return 0;
    }
    if(justTest){
        return true;
    }

    var c = this.createContactEquation(circleBody,particleBody,circleShape,particleShape);
    vec2.copy(c.normalA, dist);
    vec2.normalize(c.normalA,c.normalA);

    // Vector from circle to contact point is the normal times the circle radius
    vec2.scale(c.contactPointA, c.normalA, circleShape.radius);
    add(c.contactPointA, c.contactPointA, circleOffset);
    sub(c.contactPointA, c.contactPointA, circleBody.position);

    // Vector from particle center to contact point is zero
    sub(c.contactPointB, particleOffset, particleBody.position);

    this.contactEquations.push(c);

    if(this.enableFriction){
        this.frictionEquations.push(this.createFrictionFromContact(c));
    }

    return 1;
};

var planeCapsule_tmpCircle = new Circle({ radius: 1 }),
    planeCapsule_tmp1 = vec2.create(),
    planeCapsule_tmp2 = vec2.create(),
    planeCapsule_tmp3 = vec2.create();

/**
 * @method planeCapsule
 * @param  {Body} planeBody
 * @param  {Circle} planeShape
 * @param  {Array} planeOffset
 * @param  {Number} planeAngle
 * @param  {Body} capsuleBody
 * @param  {Particle} capsuleShape
 * @param  {Array} capsuleOffset
 * @param  {Number} capsuleAngle
 * @param {Boolean} justTest
 */
Narrowphase.prototype[Shape.PLANE | Shape.CAPSULE] =
Narrowphase.prototype.planeCapsule = function(
    planeBody,
    planeShape,
    planeOffset,
    planeAngle,
    capsuleBody,
    capsuleShape,
    capsuleOffset,
    capsuleAngle,
    justTest
){
    var end1 = planeCapsule_tmp1,
        end2 = planeCapsule_tmp2,
        circle = planeCapsule_tmpCircle,
        dst = planeCapsule_tmp3;

    // Compute world end positions
    vec2.set(end1, -capsuleShape.length/2, 0);
    vec2.rotate(end1,end1,capsuleAngle);
    add(end1,end1,capsuleOffset);

    vec2.set(end2,  capsuleShape.length/2, 0);
    vec2.rotate(end2,end2,capsuleAngle);
    add(end2,end2,capsuleOffset);

    circle.radius = capsuleShape.radius;

    var enableFrictionBefore;

    // Temporarily turn off friction
    if(this.enableFrictionReduction){
        enableFrictionBefore = this.enableFriction;
        this.enableFriction = false;
    }

    // Do Narrowphase as two circles
    var numContacts1 = this.circlePlane(capsuleBody,circle,end1,0, planeBody,planeShape,planeOffset,planeAngle, justTest),
        numContacts2 = this.circlePlane(capsuleBody,circle,end2,0, planeBody,planeShape,planeOffset,planeAngle, justTest);

    // Restore friction
    if(this.enableFrictionReduction){
        this.enableFriction = enableFrictionBefore;
    }

    if(justTest){
        return numContacts1 || numContacts2;
    } else {
        var numTotal = numContacts1 + numContacts2;
        if(this.enableFrictionReduction){
            if(numTotal){
                this.frictionEquations.push(this.createFrictionFromAverage(numTotal));
            }
        }
        return numTotal;
    }
};

/**
 * Creates ContactEquations and FrictionEquations for a collision.
 * @method circlePlane
 * @param  {Body}    bi     The first body that should be connected to the equations.
 * @param  {Circle}  si     The circle shape participating in the collision.
 * @param  {Array}   xi     Extra offset to take into account for the Shape, in addition to the one in circleBody.position. Will *not* be rotated by circleBody.angle (maybe it should, for sake of homogenity?). Set to null if none.
 * @param  {Body}    bj     The second body that should be connected to the equations.
 * @param  {Plane}   sj     The Plane shape that is participating
 * @param  {Array}   xj     Extra offset for the plane shape.
 * @param  {Number}  aj     Extra angle to apply to the plane
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.PLANE] =
Narrowphase.prototype.circlePlane = function(   bi,si,xi,ai, bj,sj,xj,aj, justTest ){
    var circleBody = bi,
        circleShape = si,
        circleOffset = xi, // Offset from body center, rotated!
        planeBody = bj,
        shapeB = sj,
        planeOffset = xj,
        planeAngle = aj;

    planeAngle = planeAngle || 0;

    // Vector from plane to circle
    var planeToCircle = tmp1,
        worldNormal = tmp2,
        temp = tmp3;

    sub(planeToCircle, circleOffset, planeOffset);

    // World plane normal
    vec2.rotate(worldNormal, yAxis, planeAngle);

    // Normal direction distance
    var d = dot(worldNormal, planeToCircle);

    if(d > circleShape.radius){
        return 0; // No overlap. Abort.
    }

    if(justTest){
        return true;
    }

    // Create contact
    var contact = this.createContactEquation(planeBody,circleBody,sj,si);

    // ni is the plane world normal
    vec2.copy(contact.normalA, worldNormal);

    // rj is the vector from circle center to the contact point
    vec2.scale(contact.contactPointB, contact.normalA, -circleShape.radius);
    add(contact.contactPointB, contact.contactPointB, circleOffset);
    sub(contact.contactPointB, contact.contactPointB, circleBody.position);

    // ri is the distance from plane center to contact.
    vec2.scale(temp, contact.normalA, d);
    sub(contact.contactPointA, planeToCircle, temp ); // Subtract normal distance vector from the distance vector
    add(contact.contactPointA, contact.contactPointA, planeOffset);
    sub(contact.contactPointA, contact.contactPointA, planeBody.position);

    this.contactEquations.push(contact);

    if(this.enableFriction){
        this.frictionEquations.push( this.createFrictionFromContact(contact) );
    }

    return 1;
};

/**
 * Convex/convex Narrowphase.See <a href="http://www.altdevblogaday.com/2011/05/13/contact-generation-between-3d-convex-meshes/">this article</a> for more info.
 * @method convexConvex
 * @param  {Body} bi
 * @param  {Convex} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Convex} sj
 * @param  {Array} xj
 * @param  {Number} aj
 */
Narrowphase.prototype[Shape.CONVEX] =
Narrowphase.prototype[Shape.CONVEX | Shape.BOX] =
Narrowphase.prototype[Shape.BOX] =
Narrowphase.prototype.convexConvex = function(  bi,si,xi,ai, bj,sj,xj,aj, justTest, precision ){
    var sepAxis = tmp1,
        worldPoint = tmp2,
        worldPoint0 = tmp3,
        worldPoint1 = tmp4,
        worldEdge = tmp5,
        projected = tmp6,
        penetrationVec = tmp7,
        dist = tmp8,
        worldNormal = tmp9,
        numContacts = 0,
        precision = typeof(precision) === 'number' ? precision : 0;

    var found = Narrowphase.findSeparatingAxis(si,xi,ai,sj,xj,aj,sepAxis);
    if(!found){
        return 0;
    }

    // Make sure the separating axis is directed from shape i to shape j
    sub(dist,xj,xi);
    if(dot(sepAxis,dist) > 0){
        vec2.scale(sepAxis,sepAxis,-1);
    }

    // Find edges with normals closest to the separating axis
    var closestEdge1 = Narrowphase.getClosestEdge(si,ai,sepAxis,true), // Flipped axis
        closestEdge2 = Narrowphase.getClosestEdge(sj,aj,sepAxis);

    if(closestEdge1 === -1 || closestEdge2 === -1){
        return 0;
    }

    // Loop over the shapes
    for(var k=0; k<2; k++){

        var closestEdgeA = closestEdge1,
            closestEdgeB = closestEdge2,
            shapeA =  si, shapeB =  sj,
            offsetA = xi, offsetB = xj,
            angleA = ai, angleB = aj,
            bodyA = bi, bodyB = bj;

        if(k === 0){
            // Swap!
            var tmp;
            tmp = closestEdgeA;
            closestEdgeA = closestEdgeB;
            closestEdgeB = tmp;

            tmp = shapeA;
            shapeA = shapeB;
            shapeB = tmp;

            tmp = offsetA;
            offsetA = offsetB;
            offsetB = tmp;

            tmp = angleA;
            angleA = angleB;
            angleB = tmp;

            tmp = bodyA;
            bodyA = bodyB;
            bodyB = tmp;
        }

        // Loop over 2 points in convex B
        for(var j=closestEdgeB; j<closestEdgeB+2; j++){

            // Get world point
            var v = shapeB.vertices[(j+shapeB.vertices.length)%shapeB.vertices.length];
            vec2.rotate(worldPoint, v, angleB);
            add(worldPoint, worldPoint, offsetB);

            var insideNumEdges = 0;

            // Loop over the 3 closest edges in convex A
            for(var i=closestEdgeA-1; i<closestEdgeA+2; i++){

                var v0 = shapeA.vertices[(i  +shapeA.vertices.length)%shapeA.vertices.length],
                    v1 = shapeA.vertices[(i+1+shapeA.vertices.length)%shapeA.vertices.length];

                // Construct the edge
                vec2.rotate(worldPoint0, v0, angleA);
                vec2.rotate(worldPoint1, v1, angleA);
                add(worldPoint0, worldPoint0, offsetA);
                add(worldPoint1, worldPoint1, offsetA);

                sub(worldEdge, worldPoint1, worldPoint0);

                vec2.rotate90cw(worldNormal, worldEdge); // Normal points out of convex 1
                vec2.normalize(worldNormal,worldNormal);

                sub(dist, worldPoint, worldPoint0);

                var d = dot(worldNormal,dist);

                if((i === closestEdgeA && d <= precision) || (i !== closestEdgeA && d <= 0)){
                    insideNumEdges++;
                }
            }

            if(insideNumEdges >= 3){

                if(justTest){
                    return true;
                }

                // worldPoint was on the "inside" side of each of the 3 checked edges.
                // Project it to the center edge and use the projection direction as normal

                // Create contact
                var c = this.createContactEquation(bodyA,bodyB,shapeA,shapeB);
                numContacts++;

                // Get center edge from body A
                var v0 = shapeA.vertices[(closestEdgeA)   % shapeA.vertices.length],
                    v1 = shapeA.vertices[(closestEdgeA+1) % shapeA.vertices.length];

                // Construct the edge
                vec2.rotate(worldPoint0, v0, angleA);
                vec2.rotate(worldPoint1, v1, angleA);
                add(worldPoint0, worldPoint0, offsetA);
                add(worldPoint1, worldPoint1, offsetA);

                sub(worldEdge, worldPoint1, worldPoint0);

                vec2.rotate90cw(c.normalA, worldEdge); // Normal points out of convex A
                vec2.normalize(c.normalA,c.normalA);

                sub(dist, worldPoint, worldPoint0); // From edge point to the penetrating point
                var d = dot(c.normalA,dist);             // Penetration
                vec2.scale(penetrationVec, c.normalA, d);     // Vector penetration

                sub(c.contactPointA, worldPoint, offsetA);
                sub(c.contactPointA, c.contactPointA, penetrationVec);
                add(c.contactPointA, c.contactPointA, offsetA);
                sub(c.contactPointA, c.contactPointA, bodyA.position);

                sub(c.contactPointB, worldPoint, offsetB);
                add(c.contactPointB, c.contactPointB, offsetB);
                sub(c.contactPointB, c.contactPointB, bodyB.position);

                this.contactEquations.push(c);

                // Todo reduce to 1 friction equation if we have 2 contact points
                if(!this.enableFrictionReduction){
                    if(this.enableFriction){
                        this.frictionEquations.push(this.createFrictionFromContact(c));
                    }
                }
            }
        }
    }

    if(this.enableFrictionReduction){
        if(this.enableFriction && numContacts){
            this.frictionEquations.push(this.createFrictionFromAverage(numContacts));
        }
    }

    return numContacts;
};

// .projectConvex is called by other functions, need local tmp vectors
var pcoa_tmp1 = vec2.fromValues(0,0);

/**
 * Project a Convex onto a world-oriented axis
 * @method projectConvexOntoAxis
 * @static
 * @param  {Convex} convexShape
 * @param  {Array} convexOffset
 * @param  {Number} convexAngle
 * @param  {Array} worldAxis
 * @param  {Array} result
 */
Narrowphase.projectConvexOntoAxis = function(convexShape, convexOffset, convexAngle, worldAxis, result){
    var max=null,
        min=null,
        v,
        value,
        localAxis = pcoa_tmp1;

    // Convert the axis to local coords of the body
    vec2.rotate(localAxis, worldAxis, -convexAngle);

    // Get projected position of all vertices
    for(var i=0; i<convexShape.vertices.length; i++){
        v = convexShape.vertices[i];
        value = dot(v,localAxis);
        if(max === null || value > max){
            max = value;
        }
        if(min === null || value < min){
            min = value;
        }
    }

    if(min > max){
        var t = min;
        min = max;
        max = t;
    }

    // Project the position of the body onto the axis - need to add this to the result
    var offset = dot(convexOffset, worldAxis);

    vec2.set( result, min + offset, max + offset);
};

// .findSeparatingAxis is called by other functions, need local tmp vectors
var fsa_tmp1 = vec2.fromValues(0,0)
,   fsa_tmp2 = vec2.fromValues(0,0)
,   fsa_tmp3 = vec2.fromValues(0,0)
,   fsa_tmp4 = vec2.fromValues(0,0)
,   fsa_tmp5 = vec2.fromValues(0,0)
,   fsa_tmp6 = vec2.fromValues(0,0);

/**
 * Find a separating axis between the shapes, that maximizes the separating distance between them.
 * @method findSeparatingAxis
 * @static
 * @param  {Convex}     c1
 * @param  {Array}      offset1
 * @param  {Number}     angle1
 * @param  {Convex}     c2
 * @param  {Array}      offset2
 * @param  {Number}     angle2
 * @param  {Array}      sepAxis     The resulting axis
 * @return {Boolean}                Whether the axis could be found.
 */
Narrowphase.findSeparatingAxis = function(c1,offset1,angle1,c2,offset2,angle2,sepAxis){
    var maxDist = null,
        overlap = false,
        found = false,
        edge = fsa_tmp1,
        worldPoint0 = fsa_tmp2,
        worldPoint1 = fsa_tmp3,
        normal = fsa_tmp4,
        span1 = fsa_tmp5,
        span2 = fsa_tmp6;

    if(c1 instanceof Box && c2 instanceof Box){

        for(var j=0; j!==2; j++){
            var c = c1,
                angle = angle1;
            if(j===1){
                c = c2;
                angle = angle2;
            }

            for(var i=0; i!==2; i++){

                // Get the world edge
                if(i === 0){
                    vec2.set(normal, 0, 1);
                } else if(i === 1) {
                    vec2.set(normal, 1, 0);
                }
                if(angle !== 0){
                    vec2.rotate(normal, normal, angle);
                }

                // Project hulls onto that normal
                Narrowphase.projectConvexOntoAxis(c1,offset1,angle1,normal,span1);
                Narrowphase.projectConvexOntoAxis(c2,offset2,angle2,normal,span2);

                // Order by span position
                var a=span1,
                    b=span2,
                    swapped = false;
                if(span1[0] > span2[0]){
                    b=span1;
                    a=span2;
                    swapped = true;
                }

                // Get separating distance
                var dist = b[0] - a[1];
                overlap = (dist <= 0);

                if(maxDist===null || dist > maxDist){
                    vec2.copy(sepAxis, normal);
                    maxDist = dist;
                    found = overlap;
                }
            }
        }

    } else {

        for(var j=0; j!==2; j++){
            var c = c1,
                angle = angle1;
            if(j===1){
                c = c2;
                angle = angle2;
            }

            for(var i=0; i!==c.vertices.length; i++){
                // Get the world edge
                vec2.rotate(worldPoint0, c.vertices[i], angle);
                vec2.rotate(worldPoint1, c.vertices[(i+1)%c.vertices.length], angle);

                sub(edge, worldPoint1, worldPoint0);

                // Get normal - just rotate 90 degrees since vertices are given in CCW
                vec2.rotate90cw(normal, edge);
                vec2.normalize(normal,normal);

                // Project hulls onto that normal
                Narrowphase.projectConvexOntoAxis(c1,offset1,angle1,normal,span1);
                Narrowphase.projectConvexOntoAxis(c2,offset2,angle2,normal,span2);

                // Order by span position
                var a=span1,
                    b=span2,
                    swapped = false;
                if(span1[0] > span2[0]){
                    b=span1;
                    a=span2;
                    swapped = true;
                }

                // Get separating distance
                var dist = b[0] - a[1];
                overlap = (dist <= 0);

                if(maxDist===null || dist > maxDist){
                    vec2.copy(sepAxis, normal);
                    maxDist = dist;
                    found = overlap;
                }
            }
        }
    }


    /*
    // Needs to be tested some more
    for(var j=0; j!==2; j++){
        var c = c1,
            angle = angle1;
        if(j===1){
            c = c2;
            angle = angle2;
        }

        for(var i=0; i!==c.axes.length; i++){

            var normal = c.axes[i];

            // Project hulls onto that normal
            Narrowphase.projectConvexOntoAxis(c1, offset1, angle1, normal, span1);
            Narrowphase.projectConvexOntoAxis(c2, offset2, angle2, normal, span2);

            // Order by span position
            var a=span1,
                b=span2,
                swapped = false;
            if(span1[0] > span2[0]){
                b=span1;
                a=span2;
                swapped = true;
            }

            // Get separating distance
            var dist = b[0] - a[1];
            overlap = (dist <= Narrowphase.convexPrecision);

            if(maxDist===null || dist > maxDist){
                vec2.copy(sepAxis, normal);
                maxDist = dist;
                found = overlap;
            }
        }
    }
    */

    return found;
};

// .getClosestEdge is called by other functions, need local tmp vectors
var gce_tmp1 = vec2.fromValues(0,0)
,   gce_tmp2 = vec2.fromValues(0,0)
,   gce_tmp3 = vec2.fromValues(0,0);

/**
 * Get the edge that has a normal closest to an axis.
 * @method getClosestEdge
 * @static
 * @param  {Convex}     c
 * @param  {Number}     angle
 * @param  {Array}      axis
 * @param  {Boolean}    flip
 * @return {Number}             Index of the edge that is closest. This index and the next spans the resulting edge. Returns -1 if failed.
 */
Narrowphase.getClosestEdge = function(c,angle,axis,flip){
    var localAxis = gce_tmp1,
        edge = gce_tmp2,
        normal = gce_tmp3;

    // Convert the axis to local coords of the body
    vec2.rotate(localAxis, axis, -angle);
    if(flip){
        vec2.scale(localAxis,localAxis,-1);
    }

    var closestEdge = -1,
        N = c.vertices.length,
        maxDot = -1;
    for(var i=0; i!==N; i++){
        // Get the edge
        sub(edge, c.vertices[(i+1)%N], c.vertices[i%N]);

        // Get normal - just rotate 90 degrees since vertices are given in CCW
        vec2.rotate90cw(normal, edge);
        vec2.normalize(normal,normal);

        var d = dot(normal,localAxis);
        if(closestEdge === -1 || d > maxDot){
            closestEdge = i % N;
            maxDot = d;
        }
    }

    return closestEdge;
};

var circleHeightfield_candidate = vec2.create(),
    circleHeightfield_dist = vec2.create(),
    circleHeightfield_v0 = vec2.create(),
    circleHeightfield_v1 = vec2.create(),
    circleHeightfield_minCandidate = vec2.create(),
    circleHeightfield_worldNormal = vec2.create(),
    circleHeightfield_minCandidateNormal = vec2.create();

/**
 * @method circleHeightfield
 * @param  {Body}           bi
 * @param  {Circle}         si
 * @param  {Array}          xi
 * @param  {Body}           bj
 * @param  {Heightfield}    sj
 * @param  {Array}          xj
 * @param  {Number}         aj
 */
Narrowphase.prototype[Shape.CIRCLE | Shape.HEIGHTFIELD] =
Narrowphase.prototype.circleHeightfield = function( circleBody,circleShape,circlePos,circleAngle,
                                                    hfBody,hfShape,hfPos,hfAngle, justTest, radius ){
    var data = hfShape.heights,
        radius = radius || circleShape.radius,
        w = hfShape.elementWidth,
        dist = circleHeightfield_dist,
        candidate = circleHeightfield_candidate,
        minCandidate = circleHeightfield_minCandidate,
        minCandidateNormal = circleHeightfield_minCandidateNormal,
        worldNormal = circleHeightfield_worldNormal,
        v0 = circleHeightfield_v0,
        v1 = circleHeightfield_v1;

    // Get the index of the points to test against
    var idxA = Math.floor( (circlePos[0] - radius - hfPos[0]) / w ),
        idxB = Math.ceil(  (circlePos[0] + radius - hfPos[0]) / w );

    /*if(idxB < 0 || idxA >= data.length)
        return justTest ? false : 0;*/

    if(idxA < 0){
        idxA = 0;
    }
    if(idxB >= data.length){
        idxB = data.length-1;
    }

    // Get max and min
    var max = data[idxA],
        min = data[idxB];
    for(var i=idxA; i<idxB; i++){
        if(data[i] < min){
            min = data[i];
        }
        if(data[i] > max){
            max = data[i];
        }
    }

    if(circlePos[1]-radius > max){
        return justTest ? false : 0;
    }

    /*
    if(circlePos[1]+radius < min){
        // Below the minimum point... We can just guess.
        // TODO
    }
    */

    // 1. Check so center of circle is not inside the field. If it is, this wont work...
    // 2. For each edge
    // 2. 1. Get point on circle that is closest to the edge (scale normal with -radius)
    // 2. 2. Check if point is inside.

    var found = false;

    // Check all edges first
    for(var i=idxA; i<idxB; i++){

        // Get points
        vec2.set(v0,     i*w, data[i]  );
        vec2.set(v1, (i+1)*w, data[i+1]);
        vec2.add(v0,v0,hfPos);
        vec2.add(v1,v1,hfPos);

        // Get normal
        vec2.sub(worldNormal, v1, v0);
        vec2.rotate(worldNormal, worldNormal, Math.PI/2);
        vec2.normalize(worldNormal,worldNormal);

        // Get point on circle, closest to the edge
        vec2.scale(candidate,worldNormal,-radius);
        vec2.add(candidate,candidate,circlePos);

        // Distance from v0 to the candidate point
        vec2.sub(dist,candidate,v0);

        // Check if it is in the element "stick"
        var d = vec2.dot(dist,worldNormal);
        if(candidate[0] >= v0[0] && candidate[0] < v1[0] && d <= 0){

            if(justTest){
                return true;
            }

            found = true;

            // Store the candidate point, projected to the edge
            vec2.scale(dist,worldNormal,-d);
            vec2.add(minCandidate,candidate,dist);
            vec2.copy(minCandidateNormal,worldNormal);

            var c = this.createContactEquation(hfBody,circleBody,hfShape,circleShape);

            // Normal is out of the heightfield
            vec2.copy(c.normalA, minCandidateNormal);

            // Vector from circle to heightfield
            vec2.scale(c.contactPointB,  c.normalA, -radius);
            add(c.contactPointB, c.contactPointB, circlePos);
            sub(c.contactPointB, c.contactPointB, circleBody.position);

            vec2.copy(c.contactPointA, minCandidate);
            vec2.sub(c.contactPointA, c.contactPointA, hfBody.position);

            this.contactEquations.push(c);

            if(this.enableFriction){
                this.frictionEquations.push( this.createFrictionFromContact(c) );
            }
        }
    }

    // Check all vertices
    found = false;
    if(radius > 0){
        for(var i=idxA; i<=idxB; i++){

            // Get point
            vec2.set(v0, i*w, data[i]);
            vec2.add(v0,v0,hfPos);

            vec2.sub(dist, circlePos, v0);

            if(vec2.squaredLength(dist) < Math.pow(radius, 2)){

                if(justTest){
                    return true;
                }

                found = true;

                var c = this.createContactEquation(hfBody,circleBody,hfShape,circleShape);

                // Construct normal - out of heightfield
                vec2.copy(c.normalA, dist);
                vec2.normalize(c.normalA,c.normalA);

                vec2.scale(c.contactPointB, c.normalA, -radius);
                add(c.contactPointB, c.contactPointB, circlePos);
                sub(c.contactPointB, c.contactPointB, circleBody.position);

                sub(c.contactPointA, v0, hfPos);
                add(c.contactPointA, c.contactPointA, hfPos);
                sub(c.contactPointA, c.contactPointA, hfBody.position);

                this.contactEquations.push(c);

                if(this.enableFriction){
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }
            }
        }
    }

    if(found){
        return 1;
    }

    return 0;

};

var convexHeightfield_v0 = vec2.create(),
    convexHeightfield_v1 = vec2.create(),
    convexHeightfield_tilePos = vec2.create(),
    convexHeightfield_tempConvexShape = new Convex({ vertices: [vec2.create(),vec2.create(),vec2.create(),vec2.create()] });
/**
 * @method circleHeightfield
 * @param  {Body}           bi
 * @param  {Circle}         si
 * @param  {Array}          xi
 * @param  {Body}           bj
 * @param  {Heightfield}    sj
 * @param  {Array}          xj
 * @param  {Number}         aj
 */
Narrowphase.prototype[Shape.BOX | Shape.HEIGHTFIELD] =
Narrowphase.prototype[Shape.CONVEX | Shape.HEIGHTFIELD] =
Narrowphase.prototype.convexHeightfield = function( convexBody,convexShape,convexPos,convexAngle,
                                                    hfBody,hfShape,hfPos,hfAngle, justTest ){
    var data = hfShape.heights,
        w = hfShape.elementWidth,
        v0 = convexHeightfield_v0,
        v1 = convexHeightfield_v1,
        tilePos = convexHeightfield_tilePos,
        tileConvex = convexHeightfield_tempConvexShape;

    // Get the index of the points to test against
    var idxA = Math.floor( (convexBody.aabb.lowerBound[0] - hfPos[0]) / w ),
        idxB = Math.ceil(  (convexBody.aabb.upperBound[0] - hfPos[0]) / w );

    if(idxA < 0){
        idxA = 0;
    }
    if(idxB >= data.length){
        idxB = data.length-1;
    }

    // Get max and min
    var max = data[idxA],
        min = data[idxB];
    for(var i=idxA; i<idxB; i++){
        if(data[i] < min){
            min = data[i];
        }
        if(data[i] > max){
            max = data[i];
        }
    }

    if(convexBody.aabb.lowerBound[1] > max){
        return justTest ? false : 0;
    }

    var found = false;
    var numContacts = 0;

    // Loop over all edges
    // TODO: If possible, construct a convex from several data points (need o check if the points make a convex shape)
    for(var i=idxA; i<idxB; i++){

        // Get points
        vec2.set(v0,     i*w, data[i]  );
        vec2.set(v1, (i+1)*w, data[i+1]);
        vec2.add(v0,v0,hfPos);
        vec2.add(v1,v1,hfPos);

        // Construct a convex
        var tileHeight = 100; // todo
        vec2.set(tilePos, (v1[0] + v0[0])*0.5, (v1[1] + v0[1] - tileHeight)*0.5);

        vec2.sub(tileConvex.vertices[0], v1, tilePos);
        vec2.sub(tileConvex.vertices[1], v0, tilePos);
        vec2.copy(tileConvex.vertices[2], tileConvex.vertices[1]);
        vec2.copy(tileConvex.vertices[3], tileConvex.vertices[0]);
        tileConvex.vertices[2][1] -= tileHeight;
        tileConvex.vertices[3][1] -= tileHeight;

        // Do convex collision
        numContacts += this.convexConvex(   convexBody, convexShape, convexPos, convexAngle,
                                            hfBody, tileConvex, tilePos, 0, justTest);
    }

    return numContacts;
};

/***/ }),

/***/ "./node_modules/p2/src/collision/Ray.js":
/*!**********************************************!*\
  !*** ./node_modules/p2/src/collision/Ray.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = Ray;

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");
var RaycastResult = __webpack_require__(/*! ../collision/RaycastResult */ "./node_modules/p2/src/collision/RaycastResult.js");
var Shape = __webpack_require__(/*! ../shapes/Shape */ "./node_modules/p2/src/shapes/Shape.js");
var AABB = __webpack_require__(/*! ../collision/AABB */ "./node_modules/p2/src/collision/AABB.js");

/**
 * A line with a start and end point that is used to intersect shapes. For an example, see {{#crossLink "World/raycast:method"}}World.raycast{{/crossLink}}
 * @class Ray
 * @constructor
 * @param {object} [options]
 * @param {array} [options.from]
 * @param {array} [options.to]
 * @param {boolean} [options.checkCollisionResponse=true]
 * @param {boolean} [options.skipBackfaces=false]
 * @param {number} [options.collisionMask=-1]
 * @param {number} [options.collisionGroup=-1]
 * @param {number} [options.mode=Ray.ANY]
 * @param {number} [options.callback]
 */
function Ray(options){
    options = options || {};

    /**
     * Ray start point.
     * @property {array} from
     */
    this.from = options.from ? vec2.fromValues(options.from[0], options.from[1]) : vec2.create();

    /**
     * Ray end point
     * @property {array} to
     */
    this.to = options.to ? vec2.fromValues(options.to[0], options.to[1]) : vec2.create();

    /**
     * Set to true if you want the Ray to take .collisionResponse flags into account on bodies and shapes.
     * @property {Boolean} checkCollisionResponse
     */
    this.checkCollisionResponse = options.checkCollisionResponse !== undefined ? options.checkCollisionResponse : true;

    /**
     * If set to true, the ray skips any hits with normal.dot(rayDirection) < 0.
     * @property {Boolean} skipBackfaces
     */
    this.skipBackfaces = !!options.skipBackfaces;

    /**
     * @property {number} collisionMask
     * @default -1
     */
    this.collisionMask = options.collisionMask !== undefined ? options.collisionMask : -1;

    /**
     * @property {number} collisionGroup
     * @default -1
     */
    this.collisionGroup = options.collisionGroup !== undefined ? options.collisionGroup : -1;

    /**
     * The intersection mode. Should be {{#crossLink "Ray/ANY:property"}}Ray.ANY{{/crossLink}}, {{#crossLink "Ray/ALL:property"}}Ray.ALL{{/crossLink}} or {{#crossLink "Ray/CLOSEST:property"}}Ray.CLOSEST{{/crossLink}}.
     * @property {number} mode
     */
    this.mode = options.mode !== undefined ? options.mode : Ray.ANY;

    /**
     * Current, user-provided result callback. Will be used if mode is Ray.ALL.
     * @property {Function} callback
     */
    this.callback = options.callback || function(result){};

    /**
     * @readOnly
     * @property {array} direction
     */
    this.direction = vec2.create();

    /**
     * Length of the ray
     * @readOnly
     * @property {number} length
     */
    this.length = 1;

    this.update();
}
Ray.prototype.constructor = Ray;

/**
 * This raycasting mode will make the Ray traverse through all intersection points and only return the closest one.
 * @static
 * @property {Number} CLOSEST
 */
Ray.CLOSEST = 1;

/**
 * This raycasting mode will make the Ray stop when it finds the first intersection point.
 * @static
 * @property {Number} ANY
 */
Ray.ANY = 2;

/**
 * This raycasting mode will traverse all intersection points and executes a callback for each one.
 * @static
 * @property {Number} ALL
 */
Ray.ALL = 4;

/**
 * Should be called if you change the from or to point.
 * @method update
 */
Ray.prototype.update = function(){

    // Update .direction and .length
    var d = this.direction;
    vec2.sub(d, this.to, this.from);
    this.length = vec2.length(d);
    vec2.normalize(d, d);

};

/**
 * @method intersectBodies
 * @param {Array} bodies An array of Body objects.
 */
Ray.prototype.intersectBodies = function (result, bodies) {
    for (var i = 0, l = bodies.length; !result.shouldStop(this) && i < l; i++) {
        var body = bodies[i];
        var aabb = body.getAABB();
        if(aabb.overlapsRay(this) >= 0 || aabb.containsPoint(this.from)){
            this.intersectBody(result, body);
        }
    }
};

var intersectBody_worldPosition = vec2.create();

/**
 * Shoot a ray at a body, get back information about the hit.
 * @method intersectBody
 * @private
 * @param {Body} body
 */
Ray.prototype.intersectBody = function (result, body) {
    var checkCollisionResponse = this.checkCollisionResponse;

    if(checkCollisionResponse && !body.collisionResponse){
        return;
    }

    var worldPosition = intersectBody_worldPosition;

    for (var i = 0, N = body.shapes.length; i < N; i++) {
        var shape = body.shapes[i];

        if(checkCollisionResponse && !shape.collisionResponse){
            continue; // Skip
        }

        if((this.collisionGroup & shape.collisionMask) === 0 || (shape.collisionGroup & this.collisionMask) === 0){
            continue;
        }

        // Get world angle and position of the shape
        vec2.rotate(worldPosition, shape.position, body.angle);
        vec2.add(worldPosition, worldPosition, body.position);
        var worldAngle = shape.angle + body.angle;

        this.intersectShape(
            result,
            shape,
            worldAngle,
            worldPosition,
            body
        );

        if(result.shouldStop(this)){
            break;
        }
    }
};

/**
 * @method intersectShape
 * @private
 * @param {Shape} shape
 * @param {number} angle
 * @param {array} position
 * @param {Body} body
 */
Ray.prototype.intersectShape = function(result, shape, angle, position, body){
    var from = this.from;

    // Checking radius
    var distance = distanceFromIntersectionSquared(from, this.direction, position);
    if (distance > shape.boundingRadius * shape.boundingRadius) {
        return;
    }

    this._currentBody = body;
    this._currentShape = shape;

    shape.raycast(result, this, position, angle);

    this._currentBody = this._currentShape = null;
};

/**
 * Get the AABB of the ray.
 * @method getAABB
 * @param  {AABB} aabb
 */
Ray.prototype.getAABB = function(result){
    var to = this.to;
    var from = this.from;
    vec2.set(
        result.lowerBound,
        Math.min(to[0], from[0]),
        Math.min(to[1], from[1])
    );
    vec2.set(
        result.upperBound,
        Math.max(to[0], from[0]),
        Math.max(to[1], from[1])
    );
};

var hitPointWorld = vec2.create();

/**
 * @method reportIntersection
 * @private
 * @param  {number} fraction
 * @param  {array} normal
 * @param  {number} [faceIndex=-1]
 * @return {boolean} True if the intersections should continue
 */
Ray.prototype.reportIntersection = function(result, fraction, normal, faceIndex){
    var from = this.from;
    var to = this.to;
    var shape = this._currentShape;
    var body = this._currentBody;

    // Skip back faces?
    if(this.skipBackfaces && vec2.dot(normal, this.direction) > 0){
        return;
    }

    switch(this.mode){

    case Ray.ALL:
        result.set(
            normal,
            shape,
            body,
            fraction,
            faceIndex
        );
        this.callback(result);
        break;

    case Ray.CLOSEST:

        // Store if closer than current closest
        if(fraction < result.fraction || !result.hasHit()){
            result.set(
                normal,
                shape,
                body,
                fraction,
                faceIndex
            );
        }
        break;

    case Ray.ANY:

        // Report and stop.
        result.set(
            normal,
            shape,
            body,
            fraction,
            faceIndex
        );
        break;
    }
};

var v0 = vec2.create(),
    intersect = vec2.create();
function distanceFromIntersectionSquared(from, direction, position) {

    // v0 is vector from from to position
    vec2.sub(v0, position, from);
    var dot = vec2.dot(v0, direction);

    // intersect = direction * dot + from
    vec2.scale(intersect, direction, dot);
    vec2.add(intersect, intersect, from);

    return vec2.squaredDistance(position, intersect);
}



/***/ }),

/***/ "./node_modules/p2/src/collision/RaycastResult.js":
/*!********************************************************!*\
  !*** ./node_modules/p2/src/collision/RaycastResult.js ***!
  \********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");
var Ray = __webpack_require__(/*! ../collision/Ray */ "./node_modules/p2/src/collision/Ray.js");

module.exports = RaycastResult;

/**
 * Storage for Ray casting hit data.
 * @class RaycastResult
 * @constructor
 */
function RaycastResult(){

	/**
	 * The normal of the hit, oriented in world space.
	 * @property {array} normal
	 */
	this.normal = vec2.create();

	/**
	 * The hit shape, or null.
	 * @property {Shape} shape
	 */
	this.shape = null;

	/**
	 * The hit body, or null.
	 * @property {Body} body
	 */
	this.body = null;

	/**
	 * The index of the hit triangle, if the hit shape was indexable.
	 * @property {number} faceIndex
	 * @default -1
	 */
	this.faceIndex = -1;

	/**
	 * Distance to the hit, as a fraction. 0 is at the "from" point, 1 is at the "to" point. Will be set to -1 if there was no hit yet.
	 * @property {number} fraction
	 * @default -1
	 */
	this.fraction = -1;

	/**
	 * If the ray should stop traversing.
	 * @readonly
	 * @property {Boolean} isStopped
	 */
	this.isStopped = false;
}

/**
 * Reset all result data. Must be done before re-using the result object.
 * @method reset
 */
RaycastResult.prototype.reset = function () {
	vec2.set(this.normal, 0, 0);
	this.shape = null;
	this.body = null;
	this.faceIndex = -1;
	this.fraction = -1;
	this.isStopped = false;
};

/**
 * Get the distance to the hit point.
 * @method getHitDistance
 * @param {Ray} ray
 */
RaycastResult.prototype.getHitDistance = function (ray) {
	return vec2.distance(ray.from, ray.to) * this.fraction;
};

/**
 * Returns true if the ray hit something since the last reset().
 * @method hasHit
 */
RaycastResult.prototype.hasHit = function () {
	return this.fraction !== -1;
};

/**
 * Get world hit point.
 * @method getHitPoint
 * @param {array} out
 * @param {Ray} ray
 */
RaycastResult.prototype.getHitPoint = function (out, ray) {
	vec2.lerp(out, ray.from, ray.to, this.fraction);
};

/**
 * Can be called while iterating over hits to stop searching for hit points.
 * @method stop
 */
RaycastResult.prototype.stop = function(){
	this.isStopped = true;
};

/**
 * @method shouldStop
 * @private
 * @param {Ray} ray
 * @return {boolean}
 */
RaycastResult.prototype.shouldStop = function(ray){
	return this.isStopped || (this.fraction !== -1 && ray.mode === Ray.ANY);
};

/**
 * @method set
 * @private
 * @param {array} normal
 * @param {Shape} shape
 * @param {Body} body
 * @param {number} fraction
 */
RaycastResult.prototype.set = function(
	normal,
	shape,
	body,
	fraction,
	faceIndex
){
	vec2.copy(this.normal, normal);
	this.shape = shape;
	this.body = body;
	this.fraction = fraction;
	this.faceIndex = faceIndex;
};

/***/ }),

/***/ "./node_modules/p2/src/collision/SAPBroadphase.js":
/*!********************************************************!*\
  !*** ./node_modules/p2/src/collision/SAPBroadphase.js ***!
  \********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js")
,   Broadphase = __webpack_require__(/*! ../collision/Broadphase */ "./node_modules/p2/src/collision/Broadphase.js");

module.exports = SAPBroadphase;

/**
 * Sweep and prune broadphase along one axis.
 *
 * @class SAPBroadphase
 * @constructor
 * @extends Broadphase
 */
function SAPBroadphase(){
    Broadphase.call(this,Broadphase.SAP);

    /**
     * List of bodies currently in the broadphase.
     * @property axisList
     * @type {Array}
     */
    this.axisList = [];

    /**
     * The axis to sort along. 0 means x-axis and 1 y-axis. If your bodies are more spread out over the X axis, set axisIndex to 0, and you will gain some performance.
     * @property axisIndex
     * @type {Number}
     */
    this.axisIndex = 0;

    var that = this;
    this._addBodyHandler = function(e){
        that.axisList.push(e.body);
    };

    this._removeBodyHandler = function(e){
        // Remove from list
        var idx = that.axisList.indexOf(e.body);
        if(idx !== -1){
            that.axisList.splice(idx,1);
        }
    };
}
SAPBroadphase.prototype = new Broadphase();
SAPBroadphase.prototype.constructor = SAPBroadphase;

/**
 * Change the world
 * @method setWorld
 * @param {World} world
 */
SAPBroadphase.prototype.setWorld = function(world){
    // Clear the old axis array
    this.axisList.length = 0;

    // Add all bodies from the new world
    Utils.appendArray(this.axisList, world.bodies);

    // Remove old handlers, if any
    world
        .off("addBody",this._addBodyHandler)
        .off("removeBody",this._removeBodyHandler);

    // Add handlers to update the list of bodies.
    world.on("addBody",this._addBodyHandler).on("removeBody",this._removeBodyHandler);

    this.world = world;
};

/**
 * Sorts bodies along an axis.
 * @method sortAxisList
 * @param {Array} a
 * @param {number} axisIndex
 * @return {Array}
 */
SAPBroadphase.sortAxisList = function(a, axisIndex){
    axisIndex = axisIndex|0;
    for(var i=1,l=a.length; i<l; i++) {
        var v = a[i];
        for(var j=i - 1;j>=0;j--) {
            if(a[j].aabb.lowerBound[axisIndex] <= v.aabb.lowerBound[axisIndex]){
                break;
            }
            a[j+1] = a[j];
        }
        a[j+1] = v;
    }
    return a;
};

SAPBroadphase.prototype.sortList = function(){
    var bodies = this.axisList,
    axisIndex = this.axisIndex;

    // Sort the lists
    SAPBroadphase.sortAxisList(bodies, axisIndex);
};

/**
 * Get the colliding pairs
 * @method getCollisionPairs
 * @param  {World} world
 * @return {Array}
 */
SAPBroadphase.prototype.getCollisionPairs = function(world){
    var bodies = this.axisList,
        result = this.result,
        axisIndex = this.axisIndex;

    result.length = 0;

    // Update all AABBs if needed
    var l = bodies.length;
    while(l--){
        var b = bodies[l];
        if(b.aabbNeedsUpdate){
            b.updateAABB();
        }
    }

    // Sort the lists
    this.sortList();

    // Look through the X list
    for(var i=0, N=bodies.length|0; i!==N; i++){
        var bi = bodies[i];

        for(var j=i+1; j<N; j++){
            var bj = bodies[j];

            // Bounds overlap?
            var overlaps = (bj.aabb.lowerBound[axisIndex] <= bi.aabb.upperBound[axisIndex]);
            if(!overlaps){
                break;
            }

            if(Broadphase.canCollide(bi,bj) && this.boundingVolumeCheck(bi,bj)){
                result.push(bi,bj);
            }
        }
    }

    return result;
};

/**
 * Returns all the bodies within an AABB.
 * @method aabbQuery
 * @param  {World} world
 * @param  {AABB} aabb
 * @param {array} result An array to store resulting bodies in.
 * @return {array}
 */
SAPBroadphase.prototype.aabbQuery = function(world, aabb, result){
    result = result || [];

    this.sortList();

    var axisIndex = this.axisIndex;
    var axis = 'x';
    if(axisIndex === 1){ axis = 'y'; }
    if(axisIndex === 2){ axis = 'z'; }

    var axisList = this.axisList;
    var lower = aabb.lowerBound[axis];
    var upper = aabb.upperBound[axis];
    for(var i = 0; i < axisList.length; i++){
        var b = axisList[i];

        if(b.aabbNeedsUpdate){
            b.updateAABB();
        }

        if(b.aabb.overlaps(aabb)){
            result.push(b);
        }
    }

    return result;
};

/***/ }),

/***/ "./node_modules/p2/src/constraints/Constraint.js":
/*!*******************************************************!*\
  !*** ./node_modules/p2/src/constraints/Constraint.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = Constraint;

var Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js");

/**
 * Base constraint class.
 *
 * @class Constraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Number} type
 * @param {Object} [options]
 * @param {Object} [options.collideConnected=true]
 */
function Constraint(bodyA, bodyB, type, options){

    /**
     * The type of constraint. May be one of Constraint.DISTANCE, Constraint.GEAR, Constraint.LOCK, Constraint.PRISMATIC or Constraint.REVOLUTE.
     * @property {number} type
     */
    this.type = type;

    options = Utils.defaults(options,{
        collideConnected : true,
        wakeUpBodies : true,
    });

    /**
     * Equations to be solved in this constraint
     *
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * First body participating in the constraint.
     * @property bodyA
     * @type {Body}
     */
    this.bodyA = bodyA;

    /**
     * Second body participating in the constraint.
     * @property bodyB
     * @type {Body}
     */
    this.bodyB = bodyB;

    /**
     * Set to true if you want the connected bodies to collide.
     * @property collideConnected
     * @type {Boolean}
     * @default true
     */
    this.collideConnected = options.collideConnected;

    // Wake up bodies when connected
    if(options.wakeUpBodies){
        if(bodyA){
            bodyA.wakeUp();
        }
        if(bodyB){
            bodyB.wakeUp();
        }
    }
}

/**
 * Updates the internal constraint parameters before solve.
 * @method update
 */
Constraint.prototype.update = function(){
    throw new Error("method update() not implmemented in this Constraint subclass!");
};

/**
 * @static
 * @property {number} DISTANCE
 */
Constraint.DISTANCE = 1;

/**
 * @static
 * @property {number} GEAR
 */
Constraint.GEAR = 2;

/**
 * @static
 * @property {number} LOCK
 */
Constraint.LOCK = 3;

/**
 * @static
 * @property {number} PRISMATIC
 */
Constraint.PRISMATIC = 4;

/**
 * @static
 * @property {number} REVOLUTE
 */
Constraint.REVOLUTE = 5;

/**
 * Set stiffness for this constraint.
 * @method setStiffness
 * @param {Number} stiffness
 */
Constraint.prototype.setStiffness = function(stiffness){
    var eqs = this.equations;
    for(var i=0; i !== eqs.length; i++){
        var eq = eqs[i];
        eq.stiffness = stiffness;
        eq.needsUpdate = true;
    }
};

/**
 * Set relaxation for this constraint.
 * @method setRelaxation
 * @param {Number} relaxation
 */
Constraint.prototype.setRelaxation = function(relaxation){
    var eqs = this.equations;
    for(var i=0; i !== eqs.length; i++){
        var eq = eqs[i];
        eq.relaxation = relaxation;
        eq.needsUpdate = true;
    }
};


/***/ }),

/***/ "./node_modules/p2/src/constraints/DistanceConstraint.js":
/*!***************************************************************!*\
  !*** ./node_modules/p2/src/constraints/DistanceConstraint.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Constraint = __webpack_require__(/*! ./Constraint */ "./node_modules/p2/src/constraints/Constraint.js")
,   Equation = __webpack_require__(/*! ../equations/Equation */ "./node_modules/p2/src/equations/Equation.js")
,   vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,   Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js");

module.exports = DistanceConstraint;

/**
 * Constraint that tries to keep the distance between two bodies constant.
 *
 * @class DistanceConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {object} [options]
 * @param {number} [options.distance] The distance to keep between the anchor points. Defaults to the current distance between the bodies.
 * @param {Array} [options.localAnchorA] The anchor point for bodyA, defined locally in bodyA frame. Defaults to [0,0].
 * @param {Array} [options.localAnchorB] The anchor point for bodyB, defined locally in bodyB frame. Defaults to [0,0].
 * @param {object} [options.maxForce=Number.MAX_VALUE] Maximum force to apply.
 * @extends Constraint
 *
 * @example
 *     // If distance is not given as an option, then the current distance between the bodies is used.
 *     // In this example, the bodies will be constrained to have a distance of 2 between their centers.
 *     var bodyA = new Body({ mass: 1, position: [-1, 0] });
 *     var bodyB = new Body({ mass: 1, position: [1, 0] });
 *     var constraint = new DistanceConstraint(bodyA, bodyB);
 *     world.addConstraint(constraint);
 *
 * @example
 *     // Manually set the distance and anchors
 *     var constraint = new DistanceConstraint(bodyA, bodyB, {
 *         distance: 1,          // Distance to keep between the points
 *         localAnchorA: [1, 0], // Point on bodyA
 *         localAnchorB: [-1, 0] // Point on bodyB
 *     });
 *     world.addConstraint(constraint);
 */
function DistanceConstraint(bodyA,bodyB,options){
    options = Utils.defaults(options,{
        localAnchorA:[0,0],
        localAnchorB:[0,0]
    });

    Constraint.call(this,bodyA,bodyB,Constraint.DISTANCE,options);

    /**
     * Local anchor in body A.
     * @property localAnchorA
     * @type {Array}
     */
    this.localAnchorA = vec2.fromValues(options.localAnchorA[0], options.localAnchorA[1]);

    /**
     * Local anchor in body B.
     * @property localAnchorB
     * @type {Array}
     */
    this.localAnchorB = vec2.fromValues(options.localAnchorB[0], options.localAnchorB[1]);

    var localAnchorA = this.localAnchorA;
    var localAnchorB = this.localAnchorB;

    /**
     * The distance to keep.
     * @property distance
     * @type {Number}
     */
    this.distance = 0;

    if(typeof(options.distance) === 'number'){
        this.distance = options.distance;
    } else {
        // Use the current world distance between the world anchor points.
        var worldAnchorA = vec2.create(),
            worldAnchorB = vec2.create(),
            r = vec2.create();

        // Transform local anchors to world
        vec2.rotate(worldAnchorA, localAnchorA, bodyA.angle);
        vec2.rotate(worldAnchorB, localAnchorB, bodyB.angle);

        vec2.add(r, bodyB.position, worldAnchorB);
        vec2.sub(r, r, worldAnchorA);
        vec2.sub(r, r, bodyA.position);

        this.distance = vec2.length(r);
    }

    var maxForce;
    if(typeof(options.maxForce)==="undefined" ){
        maxForce = Number.MAX_VALUE;
    } else {
        maxForce = options.maxForce;
    }

    var normal = new Equation(bodyA,bodyB,-maxForce,maxForce); // Just in the normal direction
    this.equations = [ normal ];

    /**
     * Max force to apply.
     * @property {number} maxForce
     */
    this.maxForce = maxForce;

    // g = (xi - xj).dot(n)
    // dg/dt = (vi - vj).dot(n) = G*W = [n 0 -n 0] * [vi wi vj wj]'

    // ...and if we were to include offset points:
    // g =
    //      (xj + rj - xi - ri).dot(n) - distance
    //
    // dg/dt =
    //      (vj + wj x rj - vi - wi x ri).dot(n) =
    //      { term 2 is near zero } =
    //      [-n   -ri x n   n   rj x n] * [vi wi vj wj]' =
    //      G * W
    //
    // => G = [-n -rixn n rjxn]

    var r = vec2.create();
    var ri = vec2.create(); // worldAnchorA
    var rj = vec2.create(); // worldAnchorB
    var that = this;
    normal.computeGq = function(){
        var bodyA = this.bodyA,
            bodyB = this.bodyB,
            xi = bodyA.position,
            xj = bodyB.position;

        // Transform local anchors to world
        vec2.rotate(ri, localAnchorA, bodyA.angle);
        vec2.rotate(rj, localAnchorB, bodyB.angle);

        vec2.add(r, xj, rj);
        vec2.sub(r, r, ri);
        vec2.sub(r, r, xi);

        //vec2.sub(r, bodyB.position, bodyA.position);
        return vec2.length(r) - that.distance;
    };

    // Make the contact constraint bilateral
    this.setMaxForce(maxForce);

    /**
     * If the upper limit is enabled or not.
     * @property {Boolean} upperLimitEnabled
     */
    this.upperLimitEnabled = false;

    /**
     * The upper constraint limit.
     * @property {number} upperLimit
     */
    this.upperLimit = 1;

    /**
     * If the lower limit is enabled or not.
     * @property {Boolean} lowerLimitEnabled
     */
    this.lowerLimitEnabled = false;

    /**
     * The lower constraint limit.
     * @property {number} lowerLimit
     */
    this.lowerLimit = 0;

    /**
     * Current constraint position. This is equal to the current distance between the world anchor points.
     * @property {number} position
     */
    this.position = 0;
}
DistanceConstraint.prototype = new Constraint();
DistanceConstraint.prototype.constructor = DistanceConstraint;

/**
 * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
 * @method update
 */
var n = vec2.create();
var ri = vec2.create(); // worldAnchorA
var rj = vec2.create(); // worldAnchorB
DistanceConstraint.prototype.update = function(){
    var normal = this.equations[0],
        bodyA = this.bodyA,
        bodyB = this.bodyB,
        distance = this.distance,
        xi = bodyA.position,
        xj = bodyB.position,
        normalEquation = this.equations[0],
        G = normal.G;

    // Transform local anchors to world
    vec2.rotate(ri, this.localAnchorA, bodyA.angle);
    vec2.rotate(rj, this.localAnchorB, bodyB.angle);

    // Get world anchor points and normal
    vec2.add(n, xj, rj);
    vec2.sub(n, n, ri);
    vec2.sub(n, n, xi);
    this.position = vec2.length(n);

    var violating = false;
    if(this.upperLimitEnabled){
        if(this.position > this.upperLimit){
            normalEquation.maxForce = 0;
            normalEquation.minForce = -this.maxForce;
            this.distance = this.upperLimit;
            violating = true;
        }
    }

    if(this.lowerLimitEnabled){
        if(this.position < this.lowerLimit){
            normalEquation.maxForce = this.maxForce;
            normalEquation.minForce = 0;
            this.distance = this.lowerLimit;
            violating = true;
        }
    }

    if((this.lowerLimitEnabled || this.upperLimitEnabled) && !violating){
        // No constraint needed.
        normalEquation.enabled = false;
        return;
    }

    normalEquation.enabled = true;

    vec2.normalize(n,n);

    // Caluclate cross products
    var rixn = vec2.crossLength(ri, n),
        rjxn = vec2.crossLength(rj, n);

    // G = [-n -rixn n rjxn]
    G[0] = -n[0];
    G[1] = -n[1];
    G[2] = -rixn;
    G[3] = n[0];
    G[4] = n[1];
    G[5] = rjxn;
};

/**
 * Set the max force to be used
 * @method setMaxForce
 * @param {Number} maxForce
 */
DistanceConstraint.prototype.setMaxForce = function(maxForce){
    var normal = this.equations[0];
    normal.minForce = -maxForce;
    normal.maxForce =  maxForce;
};

/**
 * Get the max force
 * @method getMaxForce
 * @return {Number}
 */
DistanceConstraint.prototype.getMaxForce = function(){
    var normal = this.equations[0];
    return normal.maxForce;
};


/***/ }),

/***/ "./node_modules/p2/src/constraints/GearConstraint.js":
/*!***********************************************************!*\
  !*** ./node_modules/p2/src/constraints/GearConstraint.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Constraint = __webpack_require__(/*! ./Constraint */ "./node_modules/p2/src/constraints/Constraint.js")
,   Equation = __webpack_require__(/*! ../equations/Equation */ "./node_modules/p2/src/equations/Equation.js")
,   AngleLockEquation = __webpack_require__(/*! ../equations/AngleLockEquation */ "./node_modules/p2/src/equations/AngleLockEquation.js")
,   vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");

module.exports = GearConstraint;

/**
 * Constrains the angle of two bodies to each other to be equal. If a gear ratio is not one, the angle of bodyA must be a multiple of the angle of bodyB.
 * @class GearConstraint
 * @constructor
 * @author schteppe
 * @param {Body}            bodyA
 * @param {Body}            bodyB
 * @param {Object}          [options]
 * @param {Number}          [options.angle=0] Relative angle between the bodies. Will be set to the current angle between the bodies (the gear ratio is accounted for).
 * @param {Number}          [options.ratio=1] Gear ratio.
 * @param {Number}          [options.maxTorque] Maximum torque to apply.
 * @extends Constraint
 *
 * @example
 *     var constraint = new GearConstraint(bodyA, bodyB);
 *     world.addConstraint(constraint);
 *
 * @example
 *     var constraint = new GearConstraint(bodyA, bodyB, {
 *         ratio: 2,
 *         maxTorque: 1000
 *     });
 *     world.addConstraint(constraint);
 */
function GearConstraint(bodyA, bodyB, options){
    options = options || {};

    Constraint.call(this, bodyA, bodyB, Constraint.GEAR, options);

    /**
     * The gear ratio.
     * @property ratio
     * @type {Number}
     */
    this.ratio = options.ratio !== undefined ? options.ratio : 1;

    /**
     * The relative angle
     * @property angle
     * @type {Number}
     */
    this.angle = options.angle !== undefined ? options.angle : bodyB.angle - this.ratio * bodyA.angle;

    // Send same parameters to the equation
    options.angle = this.angle;
    options.ratio = this.ratio;

    this.equations = [
        new AngleLockEquation(bodyA,bodyB,options),
    ];

    // Set max torque
    if(options.maxTorque !== undefined){
        this.setMaxTorque(options.maxTorque);
    }
}
GearConstraint.prototype = new Constraint();
GearConstraint.prototype.constructor = GearConstraint;

GearConstraint.prototype.update = function(){
    var eq = this.equations[0];
    if(eq.ratio !== this.ratio){
        eq.setRatio(this.ratio);
    }
    eq.angle = this.angle;
};

/**
 * Set the max torque for the constraint.
 * @method setMaxTorque
 * @param {Number} torque
 */
GearConstraint.prototype.setMaxTorque = function(torque){
    this.equations[0].setMaxTorque(torque);
};

/**
 * Get the max torque for the constraint.
 * @method getMaxTorque
 * @return {Number}
 */
GearConstraint.prototype.getMaxTorque = function(torque){
    return this.equations[0].maxForce;
};

/***/ }),

/***/ "./node_modules/p2/src/constraints/LockConstraint.js":
/*!***********************************************************!*\
  !*** ./node_modules/p2/src/constraints/LockConstraint.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Constraint = __webpack_require__(/*! ./Constraint */ "./node_modules/p2/src/constraints/Constraint.js")
,   vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,   Equation = __webpack_require__(/*! ../equations/Equation */ "./node_modules/p2/src/equations/Equation.js");

module.exports = LockConstraint;

/**
 * Locks the relative position and rotation between two bodies.
 *
 * @class LockConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {Array}  [options.localOffsetB] The offset of bodyB in bodyA's frame. If not given the offset is computed from current positions.
 * @param {number} [options.localAngleB] The angle of bodyB in bodyA's frame. If not given, the angle is computed from current angles.
 * @param {number} [options.maxForce]
 * @extends Constraint
 *
 * @example
 *     // Locks the relative position and rotation between bodyA and bodyB
 *     var constraint = new LockConstraint(bodyA, bodyB);
 *     world.addConstraint(constraint);
 */
function LockConstraint(bodyA, bodyB, options){
    options = options || {};

    Constraint.call(this,bodyA,bodyB,Constraint.LOCK,options);

    var maxForce = ( typeof(options.maxForce)==="undefined" ? Number.MAX_VALUE : options.maxForce );

    var localAngleB = options.localAngleB || 0;

    // Use 3 equations:
    // gx =   (xj - xi - l) * xhat = 0
    // gy =   (xj - xi - l) * yhat = 0
    // gr =   (xi - xj + r) * that = 0
    //
    // ...where:
    //   l is the localOffsetB vector rotated to world in bodyA frame
    //   r is the same vector but reversed and rotated from bodyB frame
    //   xhat, yhat are world axis vectors
    //   that is the tangent of r
    //
    // For the first two constraints, we get
    // G*W = (vj - vi - ldot  ) * xhat
    //     = (vj - vi - wi x l) * xhat
    //
    // Since (wi x l) * xhat = (l x xhat) * wi, we get
    // G*W = [ -1   0   (-l x xhat)  1   0   0] * [vi wi vj wj]
    //
    // The last constraint gives
    // GW = (vi - vj + wj x r) * that
    //    = [  that   0  -that  (r x t) ]

    var x =     new Equation(bodyA,bodyB,-maxForce,maxForce),
        y =     new Equation(bodyA,bodyB,-maxForce,maxForce),
        rot =   new Equation(bodyA,bodyB,-maxForce,maxForce);

    var l = vec2.create(),
        g = vec2.create(),
        that = this;
    x.computeGq = function(){
        vec2.rotate(l, that.localOffsetB, bodyA.angle);
        vec2.sub(g, bodyB.position, bodyA.position);
        vec2.sub(g, g, l);
        return g[0];
    };
    y.computeGq = function(){
        vec2.rotate(l, that.localOffsetB, bodyA.angle);
        vec2.sub(g, bodyB.position, bodyA.position);
        vec2.sub(g, g, l);
        return g[1];
    };
    var r = vec2.create(),
        t = vec2.create();
    rot.computeGq = function(){
        vec2.rotate(r, that.localOffsetB, bodyB.angle - that.localAngleB);
        vec2.scale(r,r,-1);
        vec2.sub(g,bodyA.position,bodyB.position);
        vec2.add(g,g,r);
        vec2.rotate(t,r,-Math.PI/2);
        vec2.normalize(t,t);
        return vec2.dot(g,t);
    };

    /**
     * The offset of bodyB in bodyA's frame.
     * @property {Array} localOffsetB
     */
    this.localOffsetB = vec2.create();
    if(options.localOffsetB){
        vec2.copy(this.localOffsetB, options.localOffsetB);
    } else {
        // Construct from current positions
        vec2.sub(this.localOffsetB, bodyB.position, bodyA.position);
        vec2.rotate(this.localOffsetB, this.localOffsetB, -bodyA.angle);
    }

    /**
     * The offset angle of bodyB in bodyA's frame.
     * @property {Number} localAngleB
     */
    this.localAngleB = 0;
    if(typeof(options.localAngleB) === 'number'){
        this.localAngleB = options.localAngleB;
    } else {
        // Construct
        this.localAngleB = bodyB.angle - bodyA.angle;
    }

    this.equations.push(x, y, rot);
    this.setMaxForce(maxForce);
}
LockConstraint.prototype = new Constraint();
LockConstraint.prototype.constructor = LockConstraint;

/**
 * Set the maximum force to be applied.
 * @method setMaxForce
 * @param {Number} force
 */
LockConstraint.prototype.setMaxForce = function(force){
    var eqs = this.equations;
    for(var i=0; i<this.equations.length; i++){
        eqs[i].maxForce =  force;
        eqs[i].minForce = -force;
    }
};

/**
 * Get the max force.
 * @method getMaxForce
 * @return {Number}
 */
LockConstraint.prototype.getMaxForce = function(){
    return this.equations[0].maxForce;
};

var l = vec2.create();
var r = vec2.create();
var t = vec2.create();
var xAxis = vec2.fromValues(1,0);
var yAxis = vec2.fromValues(0,1);
LockConstraint.prototype.update = function(){
    var x =   this.equations[0],
        y =   this.equations[1],
        rot = this.equations[2],
        bodyA = this.bodyA,
        bodyB = this.bodyB;

    vec2.rotate(l,this.localOffsetB,bodyA.angle);
    vec2.rotate(r,this.localOffsetB,bodyB.angle - this.localAngleB);
    vec2.scale(r,r,-1);

    vec2.rotate(t,r,Math.PI/2);
    vec2.normalize(t,t);

    x.G[0] = -1;
    x.G[1] =  0;
    x.G[2] = -vec2.crossLength(l,xAxis);
    x.G[3] =  1;

    y.G[0] =  0;
    y.G[1] = -1;
    y.G[2] = -vec2.crossLength(l,yAxis);
    y.G[4] =  1;

    rot.G[0] =  -t[0];
    rot.G[1] =  -t[1];
    rot.G[3] =  t[0];
    rot.G[4] =  t[1];
    rot.G[5] =  vec2.crossLength(r,t);
};


/***/ }),

/***/ "./node_modules/p2/src/constraints/PrismaticConstraint.js":
/*!****************************************************************!*\
  !*** ./node_modules/p2/src/constraints/PrismaticConstraint.js ***!
  \****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Constraint = __webpack_require__(/*! ./Constraint */ "./node_modules/p2/src/constraints/Constraint.js")
,   ContactEquation = __webpack_require__(/*! ../equations/ContactEquation */ "./node_modules/p2/src/equations/ContactEquation.js")
,   Equation = __webpack_require__(/*! ../equations/Equation */ "./node_modules/p2/src/equations/Equation.js")
,   vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,   RotationalLockEquation = __webpack_require__(/*! ../equations/RotationalLockEquation */ "./node_modules/p2/src/equations/RotationalLockEquation.js");

module.exports = PrismaticConstraint;

/**
 * Constraint that only allows bodies to move along a line, relative to each other. See <a href="http://www.iforce2d.net/b2dtut/joints-prismatic">this tutorial</a>. Also called "slider constraint".
 *
 * @class PrismaticConstraint
 * @constructor
 * @extends Constraint
 * @author schteppe
 * @param {Body}    bodyA
 * @param {Body}    bodyB
 * @param {Object}  [options]
 * @param {Number}  [options.maxForce]                Max force to be applied by the constraint
 * @param {Array}   [options.localAnchorA]            Body A's anchor point, defined in its own local frame.
 * @param {Array}   [options.localAnchorB]            Body B's anchor point, defined in its own local frame.
 * @param {Array}   [options.localAxisA]              An axis, defined in body A frame, that body B's anchor point may slide along.
 * @param {Boolean} [options.disableRotationalLock]   If set to true, bodyB will be free to rotate around its anchor point.
 * @param {Number}  [options.upperLimit]
 * @param {Number}  [options.lowerLimit]
 * @todo Ability to create using only a point and a worldAxis
 */
function PrismaticConstraint(bodyA, bodyB, options){
    options = options || {};
    Constraint.call(this,bodyA,bodyB,Constraint.PRISMATIC,options);

    // Get anchors
    var localAnchorA = vec2.fromValues(0,0),
        localAxisA = vec2.fromValues(1,0),
        localAnchorB = vec2.fromValues(0,0);
    if(options.localAnchorA){ vec2.copy(localAnchorA, options.localAnchorA); }
    if(options.localAxisA){ vec2.copy(localAxisA,   options.localAxisA); }
    if(options.localAnchorB){ vec2.copy(localAnchorB, options.localAnchorB); }

    /**
     * @property localAnchorA
     * @type {Array}
     */
    this.localAnchorA = localAnchorA;

    /**
     * @property localAnchorB
     * @type {Array}
     */
    this.localAnchorB = localAnchorB;

    /**
     * @property localAxisA
     * @type {Array}
     */
    this.localAxisA = localAxisA;

    /*

    The constraint violation for the common axis point is

        g = ( xj + rj - xi - ri ) * t   :=  gg*t

    where r are body-local anchor points, and t is a tangent to the constraint axis defined in body i frame.

        gdot =  ( vj + wj x rj - vi - wi x ri ) * t + ( xj + rj - xi - ri ) * ( wi x t )

    Note the use of the chain rule. Now we identify the jacobian

        G*W = [ -t      -ri x t + t x gg     t    rj x t ] * [vi wi vj wj]

    The rotational part is just a rotation lock.

     */

    var maxForce = this.maxForce = typeof(options.maxForce)!=="undefined" ? options.maxForce : Number.MAX_VALUE;

    // Translational part
    var trans = new Equation(bodyA,bodyB,-maxForce,maxForce);
    var ri = new vec2.create(),
        rj = new vec2.create(),
        gg = new vec2.create(),
        t =  new vec2.create();
    trans.computeGq = function(){
        // g = ( xj + rj - xi - ri ) * t
        return vec2.dot(gg,t);
    };
    trans.updateJacobian = function(){
        var G = this.G,
            xi = bodyA.position,
            xj = bodyB.position;
        vec2.rotate(ri,localAnchorA,bodyA.angle);
        vec2.rotate(rj,localAnchorB,bodyB.angle);
        vec2.add(gg,xj,rj);
        vec2.sub(gg,gg,xi);
        vec2.sub(gg,gg,ri);
        vec2.rotate(t,localAxisA,bodyA.angle+Math.PI/2);

        G[0] = -t[0];
        G[1] = -t[1];
        G[2] = -vec2.crossLength(ri,t) + vec2.crossLength(t,gg);
        G[3] = t[0];
        G[4] = t[1];
        G[5] = vec2.crossLength(rj,t);
    };
    this.equations.push(trans);

    // Rotational part
    if(!options.disableRotationalLock){
        var rot = new RotationalLockEquation(bodyA,bodyB,-maxForce,maxForce);
        this.equations.push(rot);
    }

    /**
     * The position of anchor A relative to anchor B, along the constraint axis.
     * @property position
     * @type {Number}
     */
    this.position = 0;

    // Is this one used at all?
    this.velocity = 0;

    /**
     * Set to true to enable lower limit.
     * @property lowerLimitEnabled
     * @type {Boolean}
     */
    this.lowerLimitEnabled = typeof(options.lowerLimit)!=="undefined" ? true : false;

    /**
     * Set to true to enable upper limit.
     * @property upperLimitEnabled
     * @type {Boolean}
     */
    this.upperLimitEnabled = typeof(options.upperLimit)!=="undefined" ? true : false;

    /**
     * Lower constraint limit. The constraint position is forced to be larger than this value.
     * @property lowerLimit
     * @type {Number}
     */
    this.lowerLimit = typeof(options.lowerLimit)!=="undefined" ? options.lowerLimit : 0;

    /**
     * Upper constraint limit. The constraint position is forced to be smaller than this value.
     * @property upperLimit
     * @type {Number}
     */
    this.upperLimit = typeof(options.upperLimit)!=="undefined" ? options.upperLimit : 1;

    // Equations used for limits
    this.upperLimitEquation = new ContactEquation(bodyA,bodyB);
    this.lowerLimitEquation = new ContactEquation(bodyA,bodyB);

    // Set max/min forces
    this.upperLimitEquation.minForce = this.lowerLimitEquation.minForce = 0;
    this.upperLimitEquation.maxForce = this.lowerLimitEquation.maxForce = maxForce;

    /**
     * Equation used for the motor.
     * @property motorEquation
     * @type {Equation}
     */
    this.motorEquation = new Equation(bodyA,bodyB);

    /**
     * The current motor state. Enable or disable the motor using .enableMotor
     * @property motorEnabled
     * @type {Boolean}
     */
    this.motorEnabled = false;

    /**
     * Set the target speed for the motor.
     * @property motorSpeed
     * @type {Number}
     */
    this.motorSpeed = 0;

    var that = this;
    var motorEquation = this.motorEquation;
    var old = motorEquation.computeGW;
    motorEquation.computeGq = function(){ return 0; };
    motorEquation.computeGW = function(){
        var G = this.G,
            bi = this.bodyA,
            bj = this.bodyB,
            vi = bi.velocity,
            vj = bj.velocity,
            wi = bi.angularVelocity,
            wj = bj.angularVelocity;
        return this.gmult(G,vi,wi,vj,wj) + that.motorSpeed;
    };
}

PrismaticConstraint.prototype = new Constraint();
PrismaticConstraint.prototype.constructor = PrismaticConstraint;

var worldAxisA = vec2.create(),
    worldAnchorA = vec2.create(),
    worldAnchorB = vec2.create(),
    orientedAnchorA = vec2.create(),
    orientedAnchorB = vec2.create(),
    tmp = vec2.create();

/**
 * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
 * @method update
 */
PrismaticConstraint.prototype.update = function(){
    var eqs = this.equations,
        trans = eqs[0],
        upperLimit = this.upperLimit,
        lowerLimit = this.lowerLimit,
        upperLimitEquation = this.upperLimitEquation,
        lowerLimitEquation = this.lowerLimitEquation,
        bodyA = this.bodyA,
        bodyB = this.bodyB,
        localAxisA = this.localAxisA,
        localAnchorA = this.localAnchorA,
        localAnchorB = this.localAnchorB;

    trans.updateJacobian();

    // Transform local things to world
    vec2.rotate(worldAxisA,      localAxisA,      bodyA.angle);
    vec2.rotate(orientedAnchorA, localAnchorA,    bodyA.angle);
    vec2.add(worldAnchorA,       orientedAnchorA, bodyA.position);
    vec2.rotate(orientedAnchorB, localAnchorB,    bodyB.angle);
    vec2.add(worldAnchorB,       orientedAnchorB, bodyB.position);

    var relPosition = this.position = vec2.dot(worldAnchorB,worldAxisA) - vec2.dot(worldAnchorA,worldAxisA);

    // Motor
    if(this.motorEnabled){
        // G = [ a     a x ri   -a   -a x rj ]
        var G = this.motorEquation.G;
        G[0] = worldAxisA[0];
        G[1] = worldAxisA[1];
        G[2] = vec2.crossLength(worldAxisA,orientedAnchorB);
        G[3] = -worldAxisA[0];
        G[4] = -worldAxisA[1];
        G[5] = -vec2.crossLength(worldAxisA,orientedAnchorA);
    }

    /*
        Limits strategy:
        Add contact equation, with normal along the constraint axis.
        min/maxForce is set so the constraint is repulsive in the correct direction.
        Some offset is added to either equation.contactPointA or .contactPointB to get the correct upper/lower limit.

                 ^
                 |
      upperLimit x
                 |    ------
         anchorB x<---|  B |
                 |    |    |
        ------   |    ------
        |    |   |
        |  A |-->x anchorA
        ------   |
                 x lowerLimit
                 |
                axis
     */


    if(this.upperLimitEnabled && relPosition > upperLimit){
        // Update contact constraint normal, etc
        vec2.scale(upperLimitEquation.normalA, worldAxisA, -1);
        vec2.sub(upperLimitEquation.contactPointA, worldAnchorA, bodyA.position);
        vec2.sub(upperLimitEquation.contactPointB, worldAnchorB, bodyB.position);
        vec2.scale(tmp,worldAxisA,upperLimit);
        vec2.add(upperLimitEquation.contactPointA,upperLimitEquation.contactPointA,tmp);
        if(eqs.indexOf(upperLimitEquation) === -1){
            eqs.push(upperLimitEquation);
        }
    } else {
        var idx = eqs.indexOf(upperLimitEquation);
        if(idx !== -1){
            eqs.splice(idx,1);
        }
    }

    if(this.lowerLimitEnabled && relPosition < lowerLimit){
        // Update contact constraint normal, etc
        vec2.scale(lowerLimitEquation.normalA, worldAxisA, 1);
        vec2.sub(lowerLimitEquation.contactPointA, worldAnchorA, bodyA.position);
        vec2.sub(lowerLimitEquation.contactPointB, worldAnchorB, bodyB.position);
        vec2.scale(tmp,worldAxisA,lowerLimit);
        vec2.sub(lowerLimitEquation.contactPointB,lowerLimitEquation.contactPointB,tmp);
        if(eqs.indexOf(lowerLimitEquation) === -1){
            eqs.push(lowerLimitEquation);
        }
    } else {
        var idx = eqs.indexOf(lowerLimitEquation);
        if(idx !== -1){
            eqs.splice(idx,1);
        }
    }
};

/**
 * Enable the motor
 * @method enableMotor
 */
PrismaticConstraint.prototype.enableMotor = function(){
    if(this.motorEnabled){
        return;
    }
    this.equations.push(this.motorEquation);
    this.motorEnabled = true;
};

/**
 * Disable the rotational motor
 * @method disableMotor
 */
PrismaticConstraint.prototype.disableMotor = function(){
    if(!this.motorEnabled){
        return;
    }
    var i = this.equations.indexOf(this.motorEquation);
    this.equations.splice(i,1);
    this.motorEnabled = false;
};

/**
 * Set the constraint limits.
 * @method setLimits
 * @param {number} lower Lower limit.
 * @param {number} upper Upper limit.
 */
PrismaticConstraint.prototype.setLimits = function (lower, upper) {
    if(typeof(lower) === 'number'){
        this.lowerLimit = lower;
        this.lowerLimitEnabled = true;
    } else {
        this.lowerLimit = lower;
        this.lowerLimitEnabled = false;
    }

    if(typeof(upper) === 'number'){
        this.upperLimit = upper;
        this.upperLimitEnabled = true;
    } else {
        this.upperLimit = upper;
        this.upperLimitEnabled = false;
    }
};



/***/ }),

/***/ "./node_modules/p2/src/constraints/RevoluteConstraint.js":
/*!***************************************************************!*\
  !*** ./node_modules/p2/src/constraints/RevoluteConstraint.js ***!
  \***************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Constraint = __webpack_require__(/*! ./Constraint */ "./node_modules/p2/src/constraints/Constraint.js")
,   Equation = __webpack_require__(/*! ../equations/Equation */ "./node_modules/p2/src/equations/Equation.js")
,   RotationalVelocityEquation = __webpack_require__(/*! ../equations/RotationalVelocityEquation */ "./node_modules/p2/src/equations/RotationalVelocityEquation.js")
,   RotationalLockEquation = __webpack_require__(/*! ../equations/RotationalLockEquation */ "./node_modules/p2/src/equations/RotationalLockEquation.js")
,   vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");

module.exports = RevoluteConstraint;

var worldPivotA = vec2.create(),
    worldPivotB = vec2.create(),
    xAxis = vec2.fromValues(1,0),
    yAxis = vec2.fromValues(0,1),
    g = vec2.create();

/**
 * Connects two bodies at given offset points, letting them rotate relative to each other around this point.
 * @class RevoluteConstraint
 * @constructor
 * @author schteppe
 * @param {Body}    bodyA
 * @param {Body}    bodyB
 * @param {Object}  [options]
 * @param {Array}   [options.worldPivot] A pivot point given in world coordinates. If specified, localPivotA and localPivotB are automatically computed from this value.
 * @param {Array}   [options.localPivotA] The point relative to the center of mass of bodyA which bodyA is constrained to.
 * @param {Array}   [options.localPivotB] See localPivotA.
 * @param {Number}  [options.maxForce] The maximum force that should be applied to constrain the bodies.
 * @extends Constraint
 *
 * @example
 *     // This will create a revolute constraint between two bodies with pivot point in between them.
 *     var bodyA = new Body({ mass: 1, position: [-1, 0] });
 *     var bodyB = new Body({ mass: 1, position: [1, 0] });
 *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
 *         worldPivot: [0, 0]
 *     });
 *     world.addConstraint(constraint);
 *
 *     // Using body-local pivot points, the constraint could have been constructed like this:
 *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
 *         localPivotA: [1, 0],
 *         localPivotB: [-1, 0]
 *     });
 */
function RevoluteConstraint(bodyA, bodyB, options){
    options = options || {};
    Constraint.call(this,bodyA,bodyB,Constraint.REVOLUTE,options);

    var maxForce = this.maxForce = typeof(options.maxForce) !== "undefined" ? options.maxForce : Number.MAX_VALUE;

    /**
     * @property {Array} pivotA
     */
    this.pivotA = vec2.create();

    /**
     * @property {Array} pivotB
     */
    this.pivotB = vec2.create();

    if(options.worldPivot){
        // Compute pivotA and pivotB
        vec2.sub(this.pivotA, options.worldPivot, bodyA.position);
        vec2.sub(this.pivotB, options.worldPivot, bodyB.position);
        // Rotate to local coordinate system
        vec2.rotate(this.pivotA, this.pivotA, -bodyA.angle);
        vec2.rotate(this.pivotB, this.pivotB, -bodyB.angle);
    } else {
        // Get pivotA and pivotB
        vec2.copy(this.pivotA, options.localPivotA);
        vec2.copy(this.pivotB, options.localPivotB);
    }

    // Equations to be fed to the solver
    var eqs = this.equations = [
        new Equation(bodyA,bodyB,-maxForce,maxForce),
        new Equation(bodyA,bodyB,-maxForce,maxForce),
    ];

    var x = eqs[0];
    var y = eqs[1];
    var that = this;

    x.computeGq = function(){
        vec2.rotate(worldPivotA, that.pivotA, bodyA.angle);
        vec2.rotate(worldPivotB, that.pivotB, bodyB.angle);
        vec2.add(g, bodyB.position, worldPivotB);
        vec2.sub(g, g, bodyA.position);
        vec2.sub(g, g, worldPivotA);
        return vec2.dot(g,xAxis);
    };

    y.computeGq = function(){
        vec2.rotate(worldPivotA, that.pivotA, bodyA.angle);
        vec2.rotate(worldPivotB, that.pivotB, bodyB.angle);
        vec2.add(g, bodyB.position, worldPivotB);
        vec2.sub(g, g, bodyA.position);
        vec2.sub(g, g, worldPivotA);
        return vec2.dot(g,yAxis);
    };

    y.minForce = x.minForce = -maxForce;
    y.maxForce = x.maxForce =  maxForce;

    this.motorEquation = new RotationalVelocityEquation(bodyA,bodyB);

    /**
     * Indicates whether the motor is enabled. Use .enableMotor() to enable the constraint motor.
     * @property {Boolean} motorEnabled
     * @readOnly
     */
    this.motorEnabled = false;

    /**
     * The constraint position.
     * @property angle
     * @type {Number}
     * @readOnly
     */
    this.angle = 0;

    /**
     * Set to true to enable lower limit
     * @property lowerLimitEnabled
     * @type {Boolean}
     */
    this.lowerLimitEnabled = false;

    /**
     * Set to true to enable upper limit
     * @property upperLimitEnabled
     * @type {Boolean}
     */
    this.upperLimitEnabled = false;

    /**
     * The lower limit on the constraint angle.
     * @property lowerLimit
     * @type {Boolean}
     */
    this.lowerLimit = 0;

    /**
     * The upper limit on the constraint angle.
     * @property upperLimit
     * @type {Boolean}
     */
    this.upperLimit = 0;

    this.upperLimitEquation = new RotationalLockEquation(bodyA,bodyB);
    this.lowerLimitEquation = new RotationalLockEquation(bodyA,bodyB);
    this.upperLimitEquation.minForce = 0;
    this.lowerLimitEquation.maxForce = 0;
}
RevoluteConstraint.prototype = new Constraint();
RevoluteConstraint.prototype.constructor = RevoluteConstraint;

/**
 * Set the constraint angle limits.
 * @method setLimits
 * @param {number} lower Lower angle limit.
 * @param {number} upper Upper angle limit.
 */
RevoluteConstraint.prototype.setLimits = function (lower, upper) {
    if(typeof(lower) === 'number'){
        this.lowerLimit = lower;
        this.lowerLimitEnabled = true;
    } else {
        this.lowerLimit = lower;
        this.lowerLimitEnabled = false;
    }

    if(typeof(upper) === 'number'){
        this.upperLimit = upper;
        this.upperLimitEnabled = true;
    } else {
        this.upperLimit = upper;
        this.upperLimitEnabled = false;
    }
};

RevoluteConstraint.prototype.update = function(){
    var bodyA =  this.bodyA,
        bodyB =  this.bodyB,
        pivotA = this.pivotA,
        pivotB = this.pivotB,
        eqs =    this.equations,
        normal = eqs[0],
        tangent= eqs[1],
        x = eqs[0],
        y = eqs[1],
        upperLimit = this.upperLimit,
        lowerLimit = this.lowerLimit,
        upperLimitEquation = this.upperLimitEquation,
        lowerLimitEquation = this.lowerLimitEquation;

    var relAngle = this.angle = bodyB.angle - bodyA.angle;

    if(this.upperLimitEnabled && relAngle > upperLimit){
        upperLimitEquation.angle = upperLimit;
        if(eqs.indexOf(upperLimitEquation) === -1){
            eqs.push(upperLimitEquation);
        }
    } else {
        var idx = eqs.indexOf(upperLimitEquation);
        if(idx !== -1){
            eqs.splice(idx,1);
        }
    }

    if(this.lowerLimitEnabled && relAngle < lowerLimit){
        lowerLimitEquation.angle = lowerLimit;
        if(eqs.indexOf(lowerLimitEquation) === -1){
            eqs.push(lowerLimitEquation);
        }
    } else {
        var idx = eqs.indexOf(lowerLimitEquation);
        if(idx !== -1){
            eqs.splice(idx,1);
        }
    }

    /*

    The constraint violation is

        g = xj + rj - xi - ri

    ...where xi and xj are the body positions and ri and rj world-oriented offset vectors. Differentiate:

        gdot = vj + wj x rj - vi - wi x ri

    We split this into x and y directions. (let x and y be unit vectors along the respective axes)

        gdot * x = ( vj + wj x rj - vi - wi x ri ) * x
                 = ( vj*x + (wj x rj)*x -vi*x -(wi x ri)*x
                 = ( vj*x + (rj x x)*wj -vi*x -(ri x x)*wi
                 = [ -x   -(ri x x)   x   (rj x x)] * [vi wi vj wj]
                 = G*W

    ...and similar for y. We have then identified the jacobian entries for x and y directions:

        Gx = [ x   (rj x x)   -x   -(ri x x)]
        Gy = [ y   (rj x y)   -y   -(ri x y)]

     */

    vec2.rotate(worldPivotA, pivotA, bodyA.angle);
    vec2.rotate(worldPivotB, pivotB, bodyB.angle);

    // todo: these are a bit sparse. We could save some computations on making custom eq.computeGW functions, etc

    x.G[0] = -1;
    x.G[1] =  0;
    x.G[2] = -vec2.crossLength(worldPivotA,xAxis);
    x.G[3] =  1;
    x.G[4] =  0;
    x.G[5] =  vec2.crossLength(worldPivotB,xAxis);

    y.G[0] =  0;
    y.G[1] = -1;
    y.G[2] = -vec2.crossLength(worldPivotA,yAxis);
    y.G[3] =  0;
    y.G[4] =  1;
    y.G[5] =  vec2.crossLength(worldPivotB,yAxis);
};

/**
 * Enable the rotational motor
 * @method enableMotor
 */
RevoluteConstraint.prototype.enableMotor = function(){
    if(this.motorEnabled){
        return;
    }
    this.equations.push(this.motorEquation);
    this.motorEnabled = true;
};

/**
 * Disable the rotational motor
 * @method disableMotor
 */
RevoluteConstraint.prototype.disableMotor = function(){
    if(!this.motorEnabled){
        return;
    }
    var i = this.equations.indexOf(this.motorEquation);
    this.equations.splice(i,1);
    this.motorEnabled = false;
};

/**
 * Check if the motor is enabled.
 * @method motorIsEnabled
 * @deprecated use property motorEnabled instead.
 * @return {Boolean}
 */
RevoluteConstraint.prototype.motorIsEnabled = function(){
    return !!this.motorEnabled;
};

/**
 * Set the speed of the rotational constraint motor
 * @method setMotorSpeed
 * @param  {Number} speed
 */
RevoluteConstraint.prototype.setMotorSpeed = function(speed){
    if(!this.motorEnabled){
        return;
    }
    var i = this.equations.indexOf(this.motorEquation);
    this.equations[i].relativeVelocity = speed;
};

/**
 * Get the speed of the rotational constraint motor
 * @method getMotorSpeed
 * @return {Number} The current speed, or false if the motor is not enabled.
 */
RevoluteConstraint.prototype.getMotorSpeed = function(){
    if(!this.motorEnabled){
        return false;
    }
    return this.motorEquation.relativeVelocity;
};


/***/ }),

/***/ "./node_modules/p2/src/equations/AngleLockEquation.js":
/*!************************************************************!*\
  !*** ./node_modules/p2/src/equations/AngleLockEquation.js ***!
  \************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Equation = __webpack_require__(/*! ./Equation */ "./node_modules/p2/src/equations/Equation.js"),
    vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");

module.exports = AngleLockEquation;

/**
 * Locks the relative angle between two bodies. The constraint tries to keep the dot product between two vectors, local in each body, to zero. The local angle in body i is a parameter.
 *
 * @class AngleLockEquation
 * @constructor
 * @extends Equation
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {Number} [options.angle] Angle to add to the local vector in body A.
 * @param {Number} [options.ratio] Gear ratio
 */
function AngleLockEquation(bodyA, bodyB, options){
    options = options || {};
    Equation.call(this,bodyA,bodyB,-Number.MAX_VALUE,Number.MAX_VALUE);
    this.angle = options.angle || 0;

    /**
     * The gear ratio.
     * @property {Number} ratio
     * @private
     * @see setRatio
     */
    this.ratio = typeof(options.ratio)==="number" ? options.ratio : 1;

    this.setRatio(this.ratio);
}
AngleLockEquation.prototype = new Equation();
AngleLockEquation.prototype.constructor = AngleLockEquation;

AngleLockEquation.prototype.computeGq = function(){
    return this.ratio * this.bodyA.angle - this.bodyB.angle + this.angle;
};

/**
 * Set the gear ratio for this equation
 * @method setRatio
 * @param {Number} ratio
 */
AngleLockEquation.prototype.setRatio = function(ratio){
    var G = this.G;
    G[2] =  ratio;
    G[5] = -1;
    this.ratio = ratio;
};

/**
 * Set the max force for the equation.
 * @method setMaxTorque
 * @param {Number} torque
 */
AngleLockEquation.prototype.setMaxTorque = function(torque){
    this.maxForce =  torque;
    this.minForce = -torque;
};


/***/ }),

/***/ "./node_modules/p2/src/equations/ContactEquation.js":
/*!**********************************************************!*\
  !*** ./node_modules/p2/src/equations/ContactEquation.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Equation = __webpack_require__(/*! ./Equation */ "./node_modules/p2/src/equations/Equation.js"),
    vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");

module.exports = ContactEquation;

/**
 * Non-penetration constraint equation. Tries to make the contactPointA and contactPointB vectors coincide, while keeping the applied force repulsive.
 *
 * @class ContactEquation
 * @constructor
 * @extends Equation
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
function ContactEquation(bodyA, bodyB){
    Equation.call(this, bodyA, bodyB, 0, Number.MAX_VALUE);

    /**
     * Vector from body i center of mass to the contact point.
     * @property contactPointA
     * @type {Array}
     */
    this.contactPointA = vec2.create();
    this.penetrationVec = vec2.create();

    /**
     * World-oriented vector from body A center of mass to the contact point.
     * @property contactPointB
     * @type {Array}
     */
    this.contactPointB = vec2.create();

    /**
     * The normal vector, pointing out of body i
     * @property normalA
     * @type {Array}
     */
    this.normalA = vec2.create();

    /**
     * The restitution to use (0=no bounciness, 1=max bounciness).
     * @property restitution
     * @type {Number}
     */
    this.restitution = 0;

    /**
     * This property is set to true if this is the first impact between the bodies (not persistant contact).
     * @property firstImpact
     * @type {Boolean}
     * @readOnly
     */
    this.firstImpact = false;

    /**
     * The shape in body i that triggered this contact.
     * @property shapeA
     * @type {Shape}
     */
    this.shapeA = null;

    /**
     * The shape in body j that triggered this contact.
     * @property shapeB
     * @type {Shape}
     */
    this.shapeB = null;
}
ContactEquation.prototype = new Equation();
ContactEquation.prototype.constructor = ContactEquation;
ContactEquation.prototype.computeB = function(a,b,h){
    var bi = this.bodyA,
        bj = this.bodyB,
        ri = this.contactPointA,
        rj = this.contactPointB,
        xi = bi.position,
        xj = bj.position;

    var penetrationVec = this.penetrationVec,
        n = this.normalA,
        G = this.G;

    // Caluclate cross products
    var rixn = vec2.crossLength(ri,n),
        rjxn = vec2.crossLength(rj,n);

    // G = [-n -rixn n rjxn]
    G[0] = -n[0];
    G[1] = -n[1];
    G[2] = -rixn;
    G[3] = n[0];
    G[4] = n[1];
    G[5] = rjxn;

    // Calculate q = xj+rj -(xi+ri) i.e. the penetration vector
    vec2.add(penetrationVec,xj,rj);
    vec2.sub(penetrationVec,penetrationVec,xi);
    vec2.sub(penetrationVec,penetrationVec,ri);

    // Compute iteration
    var GW, Gq;
    if(this.firstImpact && this.restitution !== 0){
        Gq = 0;
        GW = (1/b)*(1+this.restitution) * this.computeGW();
    } else {
        Gq = vec2.dot(n,penetrationVec) + this.offset;
        GW = this.computeGW();
    }

    var GiMf = this.computeGiMf();
    var B = - Gq * a - GW * b - h*GiMf;

    return B;
};

var vi = vec2.create();
var vj = vec2.create();
var relVel = vec2.create();

/**
 * Get the relative velocity along the normal vector.
 * @return {number}
 */
ContactEquation.prototype.getVelocityAlongNormal = function(){

    this.bodyA.getVelocityAtPoint(vi, this.contactPointA);
    this.bodyB.getVelocityAtPoint(vj, this.contactPointB);

    vec2.subtract(relVel, vi, vj);

    return vec2.dot(this.normalA, relVel);
};

/***/ }),

/***/ "./node_modules/p2/src/equations/Equation.js":
/*!***************************************************!*\
  !*** ./node_modules/p2/src/equations/Equation.js ***!
  \***************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = Equation;

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js"),
    Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js"),
    Body = __webpack_require__(/*! ../objects/Body */ "./node_modules/p2/src/objects/Body.js");

/**
 * Base class for constraint equations.
 * @class Equation
 * @constructor
 * @param {Body} bodyA First body participating in the equation
 * @param {Body} bodyB Second body participating in the equation
 * @param {number} minForce Minimum force to apply. Default: -Number.MAX_VALUE
 * @param {number} maxForce Maximum force to apply. Default: Number.MAX_VALUE
 */
function Equation(bodyA, bodyB, minForce, maxForce){

    /**
     * Minimum force to apply when solving.
     * @property minForce
     * @type {Number}
     */
    this.minForce = typeof(minForce)==="undefined" ? -Number.MAX_VALUE : minForce;

    /**
     * Max force to apply when solving.
     * @property maxForce
     * @type {Number}
     */
    this.maxForce = typeof(maxForce)==="undefined" ? Number.MAX_VALUE : maxForce;

    /**
     * First body participating in the constraint
     * @property bodyA
     * @type {Body}
     */
    this.bodyA = bodyA;

    /**
     * Second body participating in the constraint
     * @property bodyB
     * @type {Body}
     */
    this.bodyB = bodyB;

    /**
     * The stiffness of this equation. Typically chosen to a large number (~1e7), but can be chosen somewhat freely to get a stable simulation.
     * @property stiffness
     * @type {Number}
     */
    this.stiffness = Equation.DEFAULT_STIFFNESS;

    /**
     * The number of time steps needed to stabilize the constraint equation. Typically between 3 and 5 time steps.
     * @property relaxation
     * @type {Number}
     */
    this.relaxation = Equation.DEFAULT_RELAXATION;

    /**
     * The Jacobian entry of this equation. 6 numbers, 3 per body (x,y,angle).
     * @property G
     * @type {Array}
     */
    this.G = new Utils.ARRAY_TYPE(6);
    for(var i=0; i<6; i++){
        this.G[i]=0;
    }

    this.offset = 0;

    this.a = 0;
    this.b = 0;
    this.epsilon = 0;
    this.timeStep = 1/60;

    /**
     * Indicates if stiffness or relaxation was changed.
     * @property {Boolean} needsUpdate
     */
    this.needsUpdate = true;

    /**
     * The resulting constraint multiplier from the last solve. This is mostly equivalent to the force produced by the constraint.
     * @property multiplier
     * @type {Number}
     */
    this.multiplier = 0;

    /**
     * Relative velocity.
     * @property {Number} relativeVelocity
     */
    this.relativeVelocity = 0;

    /**
     * Whether this equation is enabled or not. If true, it will be added to the solver.
     * @property {Boolean} enabled
     */
    this.enabled = true;
}
Equation.prototype.constructor = Equation;

/**
 * The default stiffness when creating a new Equation.
 * @static
 * @property {Number} DEFAULT_STIFFNESS
 * @default 1e6
 */
Equation.DEFAULT_STIFFNESS = 1e6;

/**
 * The default relaxation when creating a new Equation.
 * @static
 * @property {Number} DEFAULT_RELAXATION
 * @default 4
 */
Equation.DEFAULT_RELAXATION = 4;

/**
 * Compute SPOOK parameters .a, .b and .epsilon according to the current parameters. See equations 9, 10 and 11 in the <a href="http://www8.cs.umu.se/kurser/5DV058/VT09/lectures/spooknotes.pdf">SPOOK notes</a>.
 * @method update
 */
Equation.prototype.update = function(){
    var k = this.stiffness,
        d = this.relaxation,
        h = this.timeStep;

    this.a = 4.0 / (h * (1 + 4 * d));
    this.b = (4.0 * d) / (1 + 4 * d);
    this.epsilon = 4.0 / (h * h * k * (1 + 4 * d));

    this.needsUpdate = false;
};

/**
 * Multiply a jacobian entry with corresponding positions or velocities
 * @method gmult
 * @return {Number}
 */
Equation.prototype.gmult = function(G,vi,wi,vj,wj){
    return  G[0] * vi[0] +
            G[1] * vi[1] +
            G[2] * wi +
            G[3] * vj[0] +
            G[4] * vj[1] +
            G[5] * wj;
};

/**
 * Computes the RHS of the SPOOK equation
 * @method computeB
 * @return {Number}
 */
Equation.prototype.computeB = function(a,b,h){
    var GW = this.computeGW();
    var Gq = this.computeGq();
    var GiMf = this.computeGiMf();
    return - Gq * a - GW * b - GiMf*h;
};

/**
 * Computes G\*q, where q are the generalized body coordinates
 * @method computeGq
 * @return {Number}
 */
var qi = vec2.create(),
    qj = vec2.create();
Equation.prototype.computeGq = function(){
    var G = this.G,
        bi = this.bodyA,
        bj = this.bodyB,
        xi = bi.position,
        xj = bj.position,
        ai = bi.angle,
        aj = bj.angle;

    return this.gmult(G, qi, ai, qj, aj) + this.offset;
};

/**
 * Computes G\*W, where W are the body velocities
 * @method computeGW
 * @return {Number}
 */
Equation.prototype.computeGW = function(){
    var G = this.G,
        bi = this.bodyA,
        bj = this.bodyB,
        vi = bi.velocity,
        vj = bj.velocity,
        wi = bi.angularVelocity,
        wj = bj.angularVelocity;
    return this.gmult(G,vi,wi,vj,wj) + this.relativeVelocity;
};

/**
 * Computes G\*Wlambda, where W are the body velocities
 * @method computeGWlambda
 * @return {Number}
 */
Equation.prototype.computeGWlambda = function(){
    var G = this.G,
        bi = this.bodyA,
        bj = this.bodyB,
        vi = bi.vlambda,
        vj = bj.vlambda,
        wi = bi.wlambda,
        wj = bj.wlambda;
    return this.gmult(G,vi,wi,vj,wj);
};

/**
 * Computes G\*inv(M)\*f, where M is the mass matrix with diagonal blocks for each body, and f are the forces on the bodies.
 * @method computeGiMf
 * @return {Number}
 */
var iMfi = vec2.create(),
    iMfj = vec2.create();
Equation.prototype.computeGiMf = function(){
    var bi = this.bodyA,
        bj = this.bodyB,
        fi = bi.force,
        ti = bi.angularForce,
        fj = bj.force,
        tj = bj.angularForce,
        invMassi = bi.invMassSolve,
        invMassj = bj.invMassSolve,
        invIi = bi.invInertiaSolve,
        invIj = bj.invInertiaSolve,
        G = this.G;

    vec2.scale(iMfi, fi, invMassi);
    vec2.multiply(iMfi, bi.massMultiplier, iMfi);
    vec2.scale(iMfj, fj,invMassj);
    vec2.multiply(iMfj, bj.massMultiplier, iMfj);

    return this.gmult(G,iMfi,ti*invIi,iMfj,tj*invIj);
};

/**
 * Computes G\*inv(M)\*G'
 * @method computeGiMGt
 * @return {Number}
 */
Equation.prototype.computeGiMGt = function(){
    var bi = this.bodyA,
        bj = this.bodyB,
        invMassi = bi.invMassSolve,
        invMassj = bj.invMassSolve,
        invIi = bi.invInertiaSolve,
        invIj = bj.invInertiaSolve,
        G = this.G;

    return  G[0] * G[0] * invMassi * bi.massMultiplier[0] +
            G[1] * G[1] * invMassi * bi.massMultiplier[1] +
            G[2] * G[2] *    invIi +
            G[3] * G[3] * invMassj * bj.massMultiplier[0] +
            G[4] * G[4] * invMassj * bj.massMultiplier[1] +
            G[5] * G[5] *    invIj;
};

var addToWlambda_temp = vec2.create(),
    addToWlambda_Gi = vec2.create(),
    addToWlambda_Gj = vec2.create(),
    addToWlambda_ri = vec2.create(),
    addToWlambda_rj = vec2.create(),
    addToWlambda_Mdiag = vec2.create();

/**
 * Add constraint velocity to the bodies.
 * @method addToWlambda
 * @param {Number} deltalambda
 */
Equation.prototype.addToWlambda = function(deltalambda){
    var bi = this.bodyA,
        bj = this.bodyB,
        temp = addToWlambda_temp,
        Gi = addToWlambda_Gi,
        Gj = addToWlambda_Gj,
        ri = addToWlambda_ri,
        rj = addToWlambda_rj,
        invMassi = bi.invMassSolve,
        invMassj = bj.invMassSolve,
        invIi = bi.invInertiaSolve,
        invIj = bj.invInertiaSolve,
        Mdiag = addToWlambda_Mdiag,
        G = this.G;

    Gi[0] = G[0];
    Gi[1] = G[1];
    Gj[0] = G[3];
    Gj[1] = G[4];

    // Add to linear velocity
    // v_lambda += inv(M) * delta_lamba * G
    vec2.scale(temp, Gi, invMassi*deltalambda);
    vec2.multiply(temp, temp, bi.massMultiplier);
    vec2.add( bi.vlambda, bi.vlambda, temp);
    // This impulse is in the offset frame
    // Also add contribution to angular
    //bi.wlambda -= vec2.crossLength(temp,ri);
    bi.wlambda += invIi * G[2] * deltalambda;


    vec2.scale(temp, Gj, invMassj*deltalambda);
    vec2.multiply(temp, temp, bj.massMultiplier);
    vec2.add( bj.vlambda, bj.vlambda, temp);
    //bj.wlambda -= vec2.crossLength(temp,rj);
    bj.wlambda += invIj * G[5] * deltalambda;
};

/**
 * Compute the denominator part of the SPOOK equation: C = G\*inv(M)\*G' + eps
 * @method computeInvC
 * @param  {Number} eps
 * @return {Number}
 */
Equation.prototype.computeInvC = function(eps){
    return 1.0 / (this.computeGiMGt() + eps);
};


/***/ }),

/***/ "./node_modules/p2/src/equations/FrictionEquation.js":
/*!***********************************************************!*\
  !*** ./node_modules/p2/src/equations/FrictionEquation.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,   Equation = __webpack_require__(/*! ./Equation */ "./node_modules/p2/src/equations/Equation.js")
,   Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js");

module.exports = FrictionEquation;

/**
 * Constrains the slipping in a contact along a tangent
 *
 * @class FrictionEquation
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Number} slipForce
 * @extends Equation
 */
function FrictionEquation(bodyA, bodyB, slipForce){
    Equation.call(this, bodyA, bodyB, -slipForce, slipForce);

    /**
     * Relative vector from center of body A to the contact point, world oriented.
     * @property contactPointA
     * @type {Array}
     */
    this.contactPointA = vec2.create();

    /**
     * Relative vector from center of body B to the contact point, world oriented.
     * @property contactPointB
     * @type {Array}
     */
    this.contactPointB = vec2.create();

    /**
     * Tangent vector that the friction force will act along. World oriented.
     * @property t
     * @type {Array}
     */
    this.t = vec2.create();

    /**
     * ContactEquations connected to this friction equation. The contact equations can be used to rescale the max force for the friction. If more than one contact equation is given, then the max force can be set to the average.
     * @property contactEquations
     * @type {ContactEquation}
     */
    this.contactEquations = [];

    /**
     * The shape in body i that triggered this friction.
     * @property shapeA
     * @type {Shape}
     * @todo Needed? The shape can be looked up via contactEquation.shapeA...
     */
    this.shapeA = null;

    /**
     * The shape in body j that triggered this friction.
     * @property shapeB
     * @type {Shape}
     * @todo Needed? The shape can be looked up via contactEquation.shapeB...
     */
    this.shapeB = null;

    /**
     * The friction coefficient to use.
     * @property frictionCoefficient
     * @type {Number}
     */
    this.frictionCoefficient = 0.3;
}
FrictionEquation.prototype = new Equation();
FrictionEquation.prototype.constructor = FrictionEquation;

/**
 * Set the slipping condition for the constraint. The friction force cannot be
 * larger than this value.
 * @method setSlipForce
 * @param  {Number} slipForce
 */
FrictionEquation.prototype.setSlipForce = function(slipForce){
    this.maxForce = slipForce;
    this.minForce = -slipForce;
};

/**
 * Get the max force for the constraint.
 * @method getSlipForce
 * @return {Number}
 */
FrictionEquation.prototype.getSlipForce = function(){
    return this.maxForce;
};

FrictionEquation.prototype.computeB = function(a,b,h){
    var bi = this.bodyA,
        bj = this.bodyB,
        ri = this.contactPointA,
        rj = this.contactPointB,
        t = this.t,
        G = this.G;

    // G = [-t -rixt t rjxt]
    // And remember, this is a pure velocity constraint, g is always zero!
    G[0] = -t[0];
    G[1] = -t[1];
    G[2] = -vec2.crossLength(ri,t);
    G[3] = t[0];
    G[4] = t[1];
    G[5] = vec2.crossLength(rj,t);

    var GW = this.computeGW(),
        GiMf = this.computeGiMf();

    var B = /* - g * a  */ - GW * b - h*GiMf;

    return B;
};


/***/ }),

/***/ "./node_modules/p2/src/equations/RotationalLockEquation.js":
/*!*****************************************************************!*\
  !*** ./node_modules/p2/src/equations/RotationalLockEquation.js ***!
  \*****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Equation = __webpack_require__(/*! ./Equation */ "./node_modules/p2/src/equations/Equation.js"),
    vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");

module.exports = RotationalLockEquation;

/**
 * Locks the relative angle between two bodies. The constraint tries to keep the dot product between two vectors, local in each body, to zero. The local angle in body i is a parameter.
 *
 * @class RotationalLockEquation
 * @constructor
 * @extends Equation
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {Number} [options.angle] Angle to add to the local vector in bodyA.
 */
function RotationalLockEquation(bodyA, bodyB, options){
    options = options || {};
    Equation.call(this, bodyA, bodyB, -Number.MAX_VALUE, Number.MAX_VALUE);

    /**
     * @property {number} angle
     */
    this.angle = options.angle || 0;

    var G = this.G;
    G[2] =  1;
    G[5] = -1;
}
RotationalLockEquation.prototype = new Equation();
RotationalLockEquation.prototype.constructor = RotationalLockEquation;

var worldVectorA = vec2.create(),
    worldVectorB = vec2.create(),
    xAxis = vec2.fromValues(1,0),
    yAxis = vec2.fromValues(0,1);
RotationalLockEquation.prototype.computeGq = function(){
    vec2.rotate(worldVectorA,xAxis,this.bodyA.angle+this.angle);
    vec2.rotate(worldVectorB,yAxis,this.bodyB.angle);
    return vec2.dot(worldVectorA,worldVectorB);
};


/***/ }),

/***/ "./node_modules/p2/src/equations/RotationalVelocityEquation.js":
/*!*********************************************************************!*\
  !*** ./node_modules/p2/src/equations/RotationalVelocityEquation.js ***!
  \*********************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Equation = __webpack_require__(/*! ./Equation */ "./node_modules/p2/src/equations/Equation.js"),
    vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");

module.exports = RotationalVelocityEquation;

/**
 * Syncs rotational velocity of two bodies, or sets a relative velocity (motor).
 *
 * @class RotationalVelocityEquation
 * @constructor
 * @extends Equation
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
function RotationalVelocityEquation(bodyA, bodyB){
    Equation.call(this, bodyA, bodyB, -Number.MAX_VALUE, Number.MAX_VALUE);
    this.relativeVelocity = 1;
    this.ratio = 1;
}
RotationalVelocityEquation.prototype = new Equation();
RotationalVelocityEquation.prototype.constructor = RotationalVelocityEquation;
RotationalVelocityEquation.prototype.computeB = function(a,b,h){
    var G = this.G;
    G[2] = -1;
    G[5] = this.ratio;

    var GiMf = this.computeGiMf();
    var GW = this.computeGW();
    var B = - GW * b - h*GiMf;

    return B;
};


/***/ }),

/***/ "./node_modules/p2/src/events/EventEmitter.js":
/*!****************************************************!*\
  !*** ./node_modules/p2/src/events/EventEmitter.js ***!
  \****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

/**
 * Base class for objects that dispatches events.
 * @class EventEmitter
 * @constructor
 */
var EventEmitter = function () {};

module.exports = EventEmitter;

EventEmitter.prototype = {
    constructor: EventEmitter,

    /**
     * Add an event listener
     * @method on
     * @param  {String} type
     * @param  {Function} listener
     * @return {EventEmitter} The self object, for chainability.
     */
    on: function ( type, listener, context ) {
        listener.context = context || this;
        if ( this._listeners === undefined ){
            this._listeners = {};
        }
        var listeners = this._listeners;
        if ( listeners[ type ] === undefined ) {
            listeners[ type ] = [];
        }
        if ( listeners[ type ].indexOf( listener ) === - 1 ) {
            listeners[ type ].push( listener );
        }
        return this;
    },

    /**
     * Check if an event listener is added
     * @method has
     * @param  {String} type
     * @param  {Function} listener
     * @return {Boolean}
     */
    has: function ( type, listener ) {
        if ( this._listeners === undefined ){
            return false;
        }
        var listeners = this._listeners;
        if(listener){
            if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {
                return true;
            }
        } else {
            if ( listeners[ type ] !== undefined ) {
                return true;
            }
        }

        return false;
    },

    /**
     * Remove an event listener
     * @method off
     * @param  {String} type
     * @param  {Function} listener
     * @return {EventEmitter} The self object, for chainability.
     */
    off: function ( type, listener ) {
        if ( this._listeners === undefined ){
            return this;
        }
        var listeners = this._listeners;
        var index = listeners[ type ].indexOf( listener );
        if ( index !== - 1 ) {
            listeners[ type ].splice( index, 1 );
        }
        return this;
    },

    /**
     * Emit an event.
     * @method emit
     * @param  {Object} event
     * @param  {String} event.type
     * @return {EventEmitter} The self object, for chainability.
     */
    emit: function ( event ) {
        if ( this._listeners === undefined ){
            return this;
        }
        var listeners = this._listeners;
        var listenerArray = listeners[ event.type ];
        if ( listenerArray !== undefined ) {
            event.target = this;
            for ( var i = 0, l = listenerArray.length; i < l; i ++ ) {
                var listener = listenerArray[ i ];
                listener.call( listener.context, event );
            }
        }
        return this;
    }
};


/***/ }),

/***/ "./node_modules/p2/src/material/ContactMaterial.js":
/*!*********************************************************!*\
  !*** ./node_modules/p2/src/material/ContactMaterial.js ***!
  \*********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Material = __webpack_require__(/*! ./Material */ "./node_modules/p2/src/material/Material.js");
var Equation = __webpack_require__(/*! ../equations/Equation */ "./node_modules/p2/src/equations/Equation.js");

module.exports = ContactMaterial;

/**
 * Defines what happens when two materials meet, such as what friction coefficient to use. You can also set other things such as restitution, surface velocity and constraint parameters.
 * @class ContactMaterial
 * @constructor
 * @param {Material} materialA
 * @param {Material} materialB
 * @param {Object}   [options]
 * @param {Number}   [options.friction=0.3]       Friction coefficient.
 * @param {Number}   [options.restitution=0]      Restitution coefficient aka "bounciness".
 * @param {Number}   [options.stiffness]          ContactEquation stiffness.
 * @param {Number}   [options.relaxation]         ContactEquation relaxation.
 * @param {Number}   [options.frictionStiffness]  FrictionEquation stiffness.
 * @param {Number}   [options.frictionRelaxation] FrictionEquation relaxation.
 * @param {Number}   [options.surfaceVelocity=0]  Surface velocity.
 * @author schteppe
 */
function ContactMaterial(materialA, materialB, options){
    options = options || {};

    if(!(materialA instanceof Material) || !(materialB instanceof Material)){
        throw new Error("First two arguments must be Material instances.");
    }

    /**
     * The contact material identifier
     * @property id
     * @type {Number}
     */
    this.id = ContactMaterial.idCounter++;

    /**
     * First material participating in the contact material
     * @property materialA
     * @type {Material}
     */
    this.materialA = materialA;

    /**
     * Second material participating in the contact material
     * @property materialB
     * @type {Material}
     */
    this.materialB = materialB;

    /**
     * Friction coefficient to use in the contact of these two materials. Friction = 0 will make the involved objects super slippery, and friction = 1 will make it much less slippery. A friction coefficient larger than 1 will allow for very large friction forces, which can be convenient for preventing car tires not slip on the ground.
     * @property friction
     * @type {Number}
     * @default 0.3
     */
    this.friction = typeof(options.friction) !== "undefined" ? Number(options.friction) : 0.3;

    /**
     * Restitution, or "bounciness" to use in the contact of these two materials. A restitution of 0 will make no bounce, while restitution=1 will approximately bounce back with the same velocity the object came with.
     * @property restitution
     * @type {Number}
     * @default 0
     */
    this.restitution = typeof(options.restitution) !== "undefined" ? Number(options.restitution) : 0;

    /**
     * Hardness of the contact. Less stiffness will make the objects penetrate more, and will make the contact act more like a spring than a contact force. Default value is {{#crossLink "Equation/DEFAULT_STIFFNESS:property"}}Equation.DEFAULT_STIFFNESS{{/crossLink}}.
     * @property stiffness
     * @type {Number}
     */
    this.stiffness = typeof(options.stiffness) !== "undefined" ? Number(options.stiffness) : Equation.DEFAULT_STIFFNESS;

    /**
     * Relaxation of the resulting ContactEquation that this ContactMaterial generate. Default value is {{#crossLink "Equation/DEFAULT_RELAXATION:property"}}Equation.DEFAULT_RELAXATION{{/crossLink}}.
     * @property relaxation
     * @type {Number}
     */
    this.relaxation = typeof(options.relaxation) !== "undefined" ? Number(options.relaxation) : Equation.DEFAULT_RELAXATION;

    /**
     * Stiffness of the resulting friction force. For most cases, the value of this property should be a large number. I cannot think of any case where you would want less frictionStiffness. Default value is {{#crossLink "Equation/DEFAULT_STIFFNESS:property"}}Equation.DEFAULT_STIFFNESS{{/crossLink}}.
     * @property frictionStiffness
     * @type {Number}
     */
    this.frictionStiffness = typeof(options.frictionStiffness) !== "undefined" ? Number(options.frictionStiffness) : Equation.DEFAULT_STIFFNESS;

    /**
     * Relaxation of the resulting friction force. The default value should be good for most simulations. Default value is {{#crossLink "Equation/DEFAULT_RELAXATION:property"}}Equation.DEFAULT_RELAXATION{{/crossLink}}.
     * @property frictionRelaxation
     * @type {Number}
     */
    this.frictionRelaxation = typeof(options.frictionRelaxation) !== "undefined" ? Number(options.frictionRelaxation)  : Equation.DEFAULT_RELAXATION;

    /**
     * Will add surface velocity to this material. If bodyA rests on top if bodyB, and the surface velocity is positive, bodyA will slide to the right.
     * @property {Number} surfaceVelocity
     * @default 0
     */
    this.surfaceVelocity = typeof(options.surfaceVelocity) !== "undefined" ? Number(options.surfaceVelocity) : 0;

    /**
     * Offset to be set on ContactEquations. A positive value will make the bodies penetrate more into each other. Can be useful in scenes where contacts need to be more persistent, for example when stacking. Aka "cure for nervous contacts".
     * @property contactSkinSize
     * @type {Number}
     */
    this.contactSkinSize = 0.005;
}

ContactMaterial.idCounter = 0;


/***/ }),

/***/ "./node_modules/p2/src/material/Material.js":
/*!**************************************************!*\
  !*** ./node_modules/p2/src/material/Material.js ***!
  \**************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = Material;

/**
 * Defines a physics material.
 * @class Material
 * @constructor
 * @param {number} id Material identifier
 * @author schteppe
 */
function Material(id){
    /**
     * The material identifier
     * @property id
     * @type {Number}
     */
    this.id = id || Material.idCounter++;
}

Material.idCounter = 0;


/***/ }),

/***/ "./node_modules/p2/src/math/polyk.js":
/*!*******************************************!*\
  !*** ./node_modules/p2/src/math/polyk.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {


    /*
        PolyK library
        url: http://polyk.ivank.net
        Released under MIT licence.

        Copyright (c) 2012 Ivan Kuckir

        Permission is hereby granted, free of charge, to any person
        obtaining a copy of this software and associated documentation
        files (the "Software"), to deal in the Software without
        restriction, including without limitation the rights to use,
        copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the
        Software is furnished to do so, subject to the following
        conditions:

        The above copyright notice and this permission notice shall be
        included in all copies or substantial portions of the Software.

        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
        EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
        OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
        NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
        HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
        WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
        FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
        OTHER DEALINGS IN THE SOFTWARE.
    */

    var PolyK = {};

    /*
        Is Polygon self-intersecting?

        O(n^2)
    */
    /*
    PolyK.IsSimple = function(p)
    {
        var n = p.length>>1;
        if(n<4) return true;
        var a1 = new PolyK._P(), a2 = new PolyK._P();
        var b1 = new PolyK._P(), b2 = new PolyK._P();
        var c = new PolyK._P();

        for(var i=0; i<n; i++)
        {
            a1.x = p[2*i  ];
            a1.y = p[2*i+1];
            if(i==n-1)  { a2.x = p[0    ];  a2.y = p[1    ]; }
            else        { a2.x = p[2*i+2];  a2.y = p[2*i+3]; }

            for(var j=0; j<n; j++)
            {
                if(Math.abs(i-j) < 2) continue;
                if(j==n-1 && i==0) continue;
                if(i==n-1 && j==0) continue;

                b1.x = p[2*j  ];
                b1.y = p[2*j+1];
                if(j==n-1)  { b2.x = p[0    ];  b2.y = p[1    ]; }
                else        { b2.x = p[2*j+2];  b2.y = p[2*j+3]; }

                if(PolyK._GetLineIntersection(a1,a2,b1,b2,c) != null) return false;
            }
        }
        return true;
    }

    PolyK.IsConvex = function(p)
    {
        if(p.length<6) return true;
        var l = p.length - 4;
        for(var i=0; i<l; i+=2)
            if(!PolyK._convex(p[i], p[i+1], p[i+2], p[i+3], p[i+4], p[i+5])) return false;
        if(!PolyK._convex(p[l  ], p[l+1], p[l+2], p[l+3], p[0], p[1])) return false;
        if(!PolyK._convex(p[l+2], p[l+3], p[0  ], p[1  ], p[2], p[3])) return false;
        return true;
    }
    */
    PolyK.GetArea = function(p)
    {
        if(p.length <6) return 0;
        var l = p.length - 2;
        var sum = 0;
        for(var i=0; i<l; i+=2)
            sum += (p[i+2]-p[i]) * (p[i+1]+p[i+3]);
        sum += (p[0]-p[l]) * (p[l+1]+p[1]);
        return - sum * 0.5;
    }
    /*
    PolyK.GetAABB = function(p)
    {
        var minx = Infinity;
        var miny = Infinity;
        var maxx = -minx;
        var maxy = -miny;
        for(var i=0; i<p.length; i+=2)
        {
            minx = Math.min(minx, p[i  ]);
            maxx = Math.max(maxx, p[i  ]);
            miny = Math.min(miny, p[i+1]);
            maxy = Math.max(maxy, p[i+1]);
        }
        return {x:minx, y:miny, width:maxx-minx, height:maxy-miny};
    }
    */

    PolyK.Triangulate = function(p)
    {
        var n = p.length>>1;
        if(n<3) return [];
        var tgs = [];
        var avl = [];
        for(var i=0; i<n; i++) avl.push(i);

        var i = 0;
        var al = n;
        while(al > 3)
        {
            var i0 = avl[(i+0)%al];
            var i1 = avl[(i+1)%al];
            var i2 = avl[(i+2)%al];

            var ax = p[2*i0],  ay = p[2*i0+1];
            var bx = p[2*i1],  by = p[2*i1+1];
            var cx = p[2*i2],  cy = p[2*i2+1];

            var earFound = false;
            if(PolyK._convex(ax, ay, bx, by, cx, cy))
            {
                earFound = true;
                for(var j=0; j<al; j++)
                {
                    var vi = avl[j];
                    if(vi==i0 || vi==i1 || vi==i2) continue;
                    if(PolyK._PointInTriangle(p[2*vi], p[2*vi+1], ax, ay, bx, by, cx, cy)) {earFound = false; break;}
                }
            }
            if(earFound)
            {
                tgs.push(i0, i1, i2);
                avl.splice((i+1)%al, 1);
                al--;
                i= 0;
            }
            else if(i++ > 3*al) break;      // no convex angles :(
        }
        tgs.push(avl[0], avl[1], avl[2]);
        return tgs;
    }
    /*
    PolyK.ContainsPoint = function(p, px, py)
    {
        var n = p.length>>1;
        var ax, ay, bx = p[2*n-2]-px, by = p[2*n-1]-py;
        var depth = 0;
        for(var i=0; i<n; i++)
        {
            ax = bx;  ay = by;
            bx = p[2*i  ] - px;
            by = p[2*i+1] - py;
            if(ay< 0 && by< 0) continue;    // both "up" or both "donw"
            if(ay>=0 && by>=0) continue;    // both "up" or both "donw"
            if(ax< 0 && bx< 0) continue;

            var lx = ax + (bx-ax)*(-ay)/(by-ay);
            if(lx>0) depth++;
        }
        return (depth & 1) == 1;
    }

    PolyK.Slice = function(p, ax, ay, bx, by)
    {
        if(PolyK.ContainsPoint(p, ax, ay) || PolyK.ContainsPoint(p, bx, by)) return [p.slice(0)];

        var a = new PolyK._P(ax, ay);
        var b = new PolyK._P(bx, by);
        var iscs = [];  // intersections
        var ps = [];    // points
        for(var i=0; i<p.length; i+=2) ps.push(new PolyK._P(p[i], p[i+1]));

        for(var i=0; i<ps.length; i++)
        {
            var isc = new PolyK._P(0,0);
            isc = PolyK._GetLineIntersection(a, b, ps[i], ps[(i+1)%ps.length], isc);

            if(isc)
            {
                isc.flag = true;
                iscs.push(isc);
                ps.splice(i+1,0,isc);
                i++;
            }
        }
        if(iscs.length == 0) return [p.slice(0)];
        var comp = function(u,v) {return PolyK._P.dist(a,u) - PolyK._P.dist(a,v); }
        iscs.sort(comp);

        var pgs = [];
        var dir = 0;
        while(iscs.length > 0)
        {
            var n = ps.length;
            var i0 = iscs[0];
            var i1 = iscs[1];
            var ind0 = ps.indexOf(i0);
            var ind1 = ps.indexOf(i1);
            var solved = false;

            if(PolyK._firstWithFlag(ps, ind0) == ind1) solved = true;
            else
            {
                i0 = iscs[1];
                i1 = iscs[0];
                ind0 = ps.indexOf(i0);
                ind1 = ps.indexOf(i1);
                if(PolyK._firstWithFlag(ps, ind0) == ind1) solved = true;
            }
            if(solved)
            {
                dir--;
                var pgn = PolyK._getPoints(ps, ind0, ind1);
                pgs.push(pgn);
                ps = PolyK._getPoints(ps, ind1, ind0);
                i0.flag = i1.flag = false;
                iscs.splice(0,2);
                if(iscs.length == 0) pgs.push(ps);
            }
            else { dir++; iscs.reverse(); }
            if(dir>1) break;
        }
        var result = [];
        for(var i=0; i<pgs.length; i++)
        {
            var pg = pgs[i];
            var npg = [];
            for(var j=0; j<pg.length; j++) npg.push(pg[j].x, pg[j].y);
            result.push(npg);
        }
        return result;
    }

    PolyK.Raycast = function(p, x, y, dx, dy, isc)
    {
        var l = p.length - 2;
        var tp = PolyK._tp;
        var a1 = tp[0], a2 = tp[1],
        b1 = tp[2], b2 = tp[3], c = tp[4];
        a1.x = x; a1.y = y;
        a2.x = x+dx; a2.y = y+dy;

        if(isc==null) isc = {dist:0, edge:0, norm:{x:0, y:0}, refl:{x:0, y:0}};
        isc.dist = Infinity;

        for(var i=0; i<l; i+=2)
        {
            b1.x = p[i  ];  b1.y = p[i+1];
            b2.x = p[i+2];  b2.y = p[i+3];
            var nisc = PolyK._RayLineIntersection(a1, a2, b1, b2, c);
            if(nisc) PolyK._updateISC(dx, dy, a1, b1, b2, c, i/2, isc);
        }
        b1.x = b2.x;  b1.y = b2.y;
        b2.x = p[0];  b2.y = p[1];
        var nisc = PolyK._RayLineIntersection(a1, a2, b1, b2, c);
        if(nisc) PolyK._updateISC(dx, dy, a1, b1, b2, c, p.length/2, isc);

        return (isc.dist != Infinity) ? isc : null;
    }

    PolyK.ClosestEdge = function(p, x, y, isc)
    {
        var l = p.length - 2;
        var tp = PolyK._tp;
        var a1 = tp[0],
        b1 = tp[2], b2 = tp[3], c = tp[4];
        a1.x = x; a1.y = y;

        if(isc==null) isc = {dist:0, edge:0, point:{x:0, y:0}, norm:{x:0, y:0}};
        isc.dist = Infinity;

        for(var i=0; i<l; i+=2)
        {
            b1.x = p[i  ];  b1.y = p[i+1];
            b2.x = p[i+2];  b2.y = p[i+3];
            PolyK._pointLineDist(a1, b1, b2, i>>1, isc);
        }
        b1.x = b2.x;  b1.y = b2.y;
        b2.x = p[0];  b2.y = p[1];
        PolyK._pointLineDist(a1, b1, b2, l>>1, isc);

        var idst = 1/isc.dist;
        isc.norm.x = (x-isc.point.x)*idst;
        isc.norm.y = (y-isc.point.y)*idst;
        return isc;
    }

    PolyK._pointLineDist = function(p, a, b, edge, isc)
    {
        var x = p.x, y = p.y, x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;

        var A = x - x1;
        var B = y - y1;
        var C = x2 - x1;
        var D = y2 - y1;

        var dot = A * C + B * D;
        var len_sq = C * C + D * D;
        var param = dot / len_sq;

        var xx, yy;

        if (param < 0 || (x1 == x2 && y1 == y2)) {
            xx = x1;
            yy = y1;
        }
        else if (param > 1) {
            xx = x2;
            yy = y2;
        }
        else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        var dx = x - xx;
        var dy = y - yy;
        var dst = Math.sqrt(dx * dx + dy * dy);
        if(dst<isc.dist)
        {
            isc.dist = dst;
            isc.edge = edge;
            isc.point.x = xx;
            isc.point.y = yy;
        }
    }

    PolyK._updateISC = function(dx, dy, a1, b1, b2, c, edge, isc)
    {
        var nrl = PolyK._P.dist(a1, c);
        if(nrl<isc.dist)
        {
            var ibl = 1/PolyK._P.dist(b1, b2);
            var nx = -(b2.y-b1.y)*ibl;
            var ny =  (b2.x-b1.x)*ibl;
            var ddot = 2*(dx*nx+dy*ny);
            isc.dist = nrl;
            isc.norm.x = nx;
            isc.norm.y = ny;
            isc.refl.x = -ddot*nx+dx;
            isc.refl.y = -ddot*ny+dy;
            isc.edge = edge;
        }
    }

    PolyK._getPoints = function(ps, ind0, ind1)
    {
        var n = ps.length;
        var nps = [];
        if(ind1<ind0) ind1 += n;
        for(var i=ind0; i<= ind1; i++) nps.push(ps[i%n]);
        return nps;
    }

    PolyK._firstWithFlag = function(ps, ind)
    {
        var n = ps.length;
        while(true)
        {
            ind = (ind+1)%n;
            if(ps[ind].flag) return ind;
        }
    }
    */
    PolyK._PointInTriangle = function(px, py, ax, ay, bx, by, cx, cy)
    {
        var v0x = cx-ax;
        var v0y = cy-ay;
        var v1x = bx-ax;
        var v1y = by-ay;
        var v2x = px-ax;
        var v2y = py-ay;

        var dot00 = v0x*v0x+v0y*v0y;
        var dot01 = v0x*v1x+v0y*v1y;
        var dot02 = v0x*v2x+v0y*v2y;
        var dot11 = v1x*v1x+v1y*v1y;
        var dot12 = v1x*v2x+v1y*v2y;

        var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

        // Check if point is in triangle
        return (u >= 0) && (v >= 0) && (u + v < 1);
    }
    /*
    PolyK._RayLineIntersection = function(a1, a2, b1, b2, c)
    {
        var dax = (a1.x-a2.x), dbx = (b1.x-b2.x);
        var day = (a1.y-a2.y), dby = (b1.y-b2.y);

        var Den = dax*dby - day*dbx;
        if (Den == 0) return null;  // parallel

        var A = (a1.x * a2.y - a1.y * a2.x);
        var B = (b1.x * b2.y - b1.y * b2.x);

        var I = c;
        var iDen = 1/Den;
        I.x = ( A*dbx - dax*B ) * iDen;
        I.y = ( A*dby - day*B ) * iDen;

        if(!PolyK._InRect(I, b1, b2)) return null;
        if((day>0 && I.y>a1.y) || (day<0 && I.y<a1.y)) return null;
        if((dax>0 && I.x>a1.x) || (dax<0 && I.x<a1.x)) return null;
        return I;
    }

    PolyK._GetLineIntersection = function(a1, a2, b1, b2, c)
    {
        var dax = (a1.x-a2.x), dbx = (b1.x-b2.x);
        var day = (a1.y-a2.y), dby = (b1.y-b2.y);

        var Den = dax*dby - day*dbx;
        if (Den == 0) return null;  // parallel

        var A = (a1.x * a2.y - a1.y * a2.x);
        var B = (b1.x * b2.y - b1.y * b2.x);

        var I = c;
        I.x = ( A*dbx - dax*B ) / Den;
        I.y = ( A*dby - day*B ) / Den;

        if(PolyK._InRect(I, a1, a2) && PolyK._InRect(I, b1, b2)) return I;
        return null;
    }

    PolyK._InRect = function(a, b, c)
    {
        if  (b.x == c.x) return (a.y>=Math.min(b.y, c.y) && a.y<=Math.max(b.y, c.y));
        if  (b.y == c.y) return (a.x>=Math.min(b.x, c.x) && a.x<=Math.max(b.x, c.x));

        if(a.x >= Math.min(b.x, c.x) && a.x <= Math.max(b.x, c.x)
        && a.y >= Math.min(b.y, c.y) && a.y <= Math.max(b.y, c.y))
        return true;
        return false;
    }
    */
    PolyK._convex = function(ax, ay, bx, by, cx, cy)
    {
        return (ay-by)*(cx-bx) + (bx-ax)*(cy-by) >= 0;
    }
    /*
    PolyK._P = function(x,y)
    {
        this.x = x;
        this.y = y;
        this.flag = false;
    }
    PolyK._P.prototype.toString = function()
    {
        return "Point ["+this.x+", "+this.y+"]";
    }
    PolyK._P.dist = function(a,b)
    {
        var dx = b.x-a.x;
        var dy = b.y-a.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    PolyK._tp = [];
    for(var i=0; i<10; i++) PolyK._tp.push(new PolyK._P(0,0));
        */

module.exports = PolyK;


/***/ }),

/***/ "./node_modules/p2/src/math/vec2.js":
/*!******************************************!*\
  !*** ./node_modules/p2/src/math/vec2.js ***!
  \******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * The vec2 object from glMatrix, with some extensions and some removed methods. See http://glmatrix.net.
 * @class vec2
 */

var vec2 = module.exports = {};

var Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js");

/**
 * Make a cross product and only return the z component
 * @method crossLength
 * @static
 * @param  {Array} a
 * @param  {Array} b
 * @return {Number}
 */
vec2.crossLength = function(a,b){
    return a[0] * b[1] - a[1] * b[0];
};

/**
 * Cross product between a vector and the Z component of a vector
 * @method crossVZ
 * @static
 * @param  {Array} out
 * @param  {Array} vec
 * @param  {Number} zcomp
 * @return {Number}
 */
vec2.crossVZ = function(out, vec, zcomp){
    vec2.rotate(out,vec,-Math.PI/2);// Rotate according to the right hand rule
    vec2.scale(out,out,zcomp);      // Scale with z
    return out;
};

/**
 * Cross product between a vector and the Z component of a vector
 * @method crossZV
 * @static
 * @param  {Array} out
 * @param  {Number} zcomp
 * @param  {Array} vec
 * @return {Number}
 */
vec2.crossZV = function(out, zcomp, vec){
    vec2.rotate(out,vec,Math.PI/2); // Rotate according to the right hand rule
    vec2.scale(out,out,zcomp);      // Scale with z
    return out;
};

/**
 * Rotate a vector by an angle
 * @method rotate
 * @static
 * @param  {Array} out
 * @param  {Array} a
 * @param  {Number} angle
 */
vec2.rotate = function(out,a,angle){
    if(angle !== 0){
        var c = Math.cos(angle),
            s = Math.sin(angle),
            x = a[0],
            y = a[1];
        out[0] = c*x -s*y;
        out[1] = s*x +c*y;
    } else {
        out[0] = a[0];
        out[1] = a[1];
    }
};

/**
 * Rotate a vector 90 degrees clockwise
 * @method rotate90cw
 * @static
 * @param  {Array} out
 * @param  {Array} a
 * @param  {Number} angle
 */
vec2.rotate90cw = function(out, a) {
    var x = a[0];
    var y = a[1];
    out[0] = y;
    out[1] = -x;
};

/**
 * Transform a point position to local frame.
 * @method toLocalFrame
 * @param  {Array} out
 * @param  {Array} worldPoint
 * @param  {Array} framePosition
 * @param  {Number} frameAngle
 */
vec2.toLocalFrame = function(out, worldPoint, framePosition, frameAngle){
    vec2.copy(out, worldPoint);
    vec2.sub(out, out, framePosition);
    vec2.rotate(out, out, -frameAngle);
};

/**
 * Transform a point position to global frame.
 * @method toGlobalFrame
 * @param  {Array} out
 * @param  {Array} localPoint
 * @param  {Array} framePosition
 * @param  {Number} frameAngle
 */
vec2.toGlobalFrame = function(out, localPoint, framePosition, frameAngle){
    vec2.copy(out, localPoint);
    vec2.rotate(out, out, frameAngle);
    vec2.add(out, out, framePosition);
};

/**
 * Transform a vector to local frame.
 * @method vectorToLocalFrame
 * @param  {Array} out
 * @param  {Array} worldVector
 * @param  {Number} frameAngle
 */
vec2.vectorToLocalFrame = function(out, worldVector, frameAngle){
    vec2.rotate(out, worldVector, -frameAngle);
};

/**
 * Transform a point position to global frame.
 * @method toGlobalFrame
 * @param  {Array} out
 * @param  {Array} localVector
 * @param  {Number} frameAngle
 */
vec2.vectorToGlobalFrame = function(out, localVector, frameAngle){
    vec2.rotate(out, localVector, frameAngle);
};

/**
 * Compute centroid of a triangle spanned by vectors a,b,c. See http://easycalculation.com/analytical/learn-centroid.php
 * @method centroid
 * @static
 * @param  {Array} out
 * @param  {Array} a
 * @param  {Array} b
 * @param  {Array} c
 * @return  {Array} The out object
 */
vec2.centroid = function(out, a, b, c){
    vec2.add(out, a, b);
    vec2.add(out, out, c);
    vec2.scale(out, out, 1/3);
    return out;
};

/**
 * Creates a new, empty vec2
 * @static
 * @method create
 * @return {Array} a new 2D vector
 */
vec2.create = function() {
    var out = new Utils.ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 * @static
 * @method clone
 * @param {Array} a vector to clone
 * @return {Array} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new Utils.ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 * @static
 * @method fromValues
 * @param {Number} x X component
 * @param {Number} y Y component
 * @return {Array} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new Utils.ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 * @static
 * @method copy
 * @param {Array} out the receiving vector
 * @param {Array} a the source vector
 * @return {Array} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 * @static
 * @method set
 * @param {Array} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @return {Array} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 * @static
 * @method add
 * @param {Array} out the receiving vector
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Array} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts two vec2's
 * @static
 * @method subtract
 * @param {Array} out the receiving vector
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Array} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for vec2.subtract
 * @static
 * @method sub
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 * @static
 * @method multiply
 * @param {Array} out the receiving vector
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Array} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for vec2.multiply
 * @static
 * @method mul
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 * @static
 * @method divide
 * @param {Array} out the receiving vector
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Array} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for vec2.divide
 * @static
 * @method div
 */
vec2.div = vec2.divide;

/**
 * Scales a vec2 by a scalar number
 * @static
 * @method scale
 * @param {Array} out the receiving vector
 * @param {Array} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @return {Array} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 * @static
 * @method distance
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for vec2.distance
 * @static
 * @method dist
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 * @static
 * @method squaredDistance
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for vec2.squaredDistance
 * @static
 * @method sqrDist
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 * @static
 * @method length
 * @param {Array} a vector to calculate length of
 * @return {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for vec2.length
 * @method len
 * @static
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 * @static
 * @method squaredLength
 * @param {Array} a vector to calculate squared length of
 * @return {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for vec2.squaredLength
 * @static
 * @method sqrLen
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 * @static
 * @method negate
 * @param {Array} out the receiving vector
 * @param {Array} a vector to negate
 * @return {Array} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Normalize a vec2
 * @static
 * @method normalize
 * @param {Array} out the receiving vector
 * @param {Array} a vector to normalize
 * @return {Array} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 * @static
 * @method dot
 * @param {Array} a the first operand
 * @param {Array} b the second operand
 * @return {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Returns a string representation of a vector
 * @static
 * @method str
 * @param {Array} vec vector to represent as a string
 * @return {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

/**
 * Linearly interpolate/mix two vectors.
 * @static
 * @method lerp
 * @param {Array} out
 * @param {Array} a First vector
 * @param {Array} b Second vector
 * @param {number} t Lerp factor
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Reflect a vector along a normal.
 * @static
 * @method reflect
 * @param {Array} out
 * @param {Array} vector
 * @param {Array} normal
 */
vec2.reflect = function(out, vector, normal){
    var dot = vector[0] * normal[0] + vector[1] * normal[1];
    out[0] = vector[0] - 2 * normal[0] * dot;
    out[1] = vector[1] - 2 * normal[1] * dot;
};

/**
 * Get the intersection point between two line segments.
 * @static
 * @method getLineSegmentsIntersection
 * @param  {Array} out
 * @param  {Array} p0
 * @param  {Array} p1
 * @param  {Array} p2
 * @param  {Array} p3
 * @return {boolean} True if there was an intersection, otherwise false.
 */
vec2.getLineSegmentsIntersection = function(out, p0, p1, p2, p3) {
    var t = vec2.getLineSegmentsIntersectionFraction(p0, p1, p2, p3);
    if(t < 0){
        return false;
    } else {
        out[0] = p0[0] + (t * (p1[0] - p0[0]));
        out[1] = p0[1] + (t * (p1[1] - p0[1]));
        return true;
    }
};

/**
 * Get the intersection fraction between two line segments. If successful, the intersection is at p0 + t * (p1 - p0)
 * @static
 * @method getLineSegmentsIntersectionFraction
 * @param  {Array} p0
 * @param  {Array} p1
 * @param  {Array} p2
 * @param  {Array} p3
 * @return {number} A number between 0 and 1 if there was an intersection, otherwise -1.
 */
vec2.getLineSegmentsIntersectionFraction = function(p0, p1, p2, p3) {
    var s1_x = p1[0] - p0[0];
    var s1_y = p1[1] - p0[1];
    var s2_x = p3[0] - p2[0];
    var s2_y = p3[1] - p2[1];

    var s, t;
    s = (-s1_y * (p0[0] - p2[0]) + s1_x * (p0[1] - p2[1])) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0[1] - p2[1]) - s2_y * (p0[0] - p2[0])) / (-s2_x * s1_y + s1_x * s2_y);
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) { // Collision detected
        return t;
    }
    return -1; // No collision
};


/***/ }),

/***/ "./node_modules/p2/src/objects/Body.js":
/*!*********************************************!*\
  !*** ./node_modules/p2/src/objects/Body.js ***!
  \*********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,   decomp = __webpack_require__(/*! poly-decomp */ "./node_modules/poly-decomp/src/index.js")
,   Convex = __webpack_require__(/*! ../shapes/Convex */ "./node_modules/p2/src/shapes/Convex.js")
,   RaycastResult = __webpack_require__(/*! ../collision/RaycastResult */ "./node_modules/p2/src/collision/RaycastResult.js")
,   Ray = __webpack_require__(/*! ../collision/Ray */ "./node_modules/p2/src/collision/Ray.js")
,   AABB = __webpack_require__(/*! ../collision/AABB */ "./node_modules/p2/src/collision/AABB.js")
,   EventEmitter = __webpack_require__(/*! ../events/EventEmitter */ "./node_modules/p2/src/events/EventEmitter.js");

module.exports = Body;

/**
 * A rigid body. Has got a center of mass, position, velocity and a number of
 * shapes that are used for collisions.
 *
 * @class Body
 * @constructor
 * @extends EventEmitter
 * @param {Object} [options]
 * @param {Array} [options.force]
 * @param {Array} [options.position]
 * @param {Array} [options.velocity]
 * @param {Boolean} [options.allowSleep]
 * @param {Boolean} [options.collisionResponse]
 * @param {Number} [options.angle=0]
 * @param {Number} [options.angularForce=0]
 * @param {Number} [options.angularVelocity=0]
 * @param {Number} [options.ccdIterations=10]
 * @param {Number} [options.ccdSpeedThreshold=-1]
 * @param {Number} [options.fixedRotation=false]
 * @param {Number} [options.gravityScale]
 * @param {Number} [options.id]
 * @param {Number} [options.mass=0] A number >= 0. If zero, the .type will be set to Body.STATIC.
 * @param {Number} [options.sleepSpeedLimit]
 * @param {Number} [options.sleepTimeLimit]
 *
 * @example
 *
 *     // Create a typical dynamic body
 *     var body = new Body({
 *         mass: 1,
 *         position: [0, 0],
 *         angle: 0,
 *         velocity: [0, 0],
 *         angularVelocity: 0
 *     });
 *
 *     // Add a circular shape to the body
 *     body.addShape(new Circle({ radius: 1 }));
 *
 *     // Add the body to the world
 *     world.addBody(body);
 */
function Body(options){
    options = options || {};

    EventEmitter.call(this);

    /**
     * The body identifyer
     * @property id
     * @type {Number}
     */
    this.id = options.id || ++Body._idCounter;

    /**
     * The world that this body is added to. This property is set to NULL if the body is not added to any world.
     * @property world
     * @type {World}
     */
    this.world = null;

    /**
     * The shapes of the body.
     *
     * @property shapes
     * @type {Array}
     */
    this.shapes = [];

    /**
     * The mass of the body.
     * @property mass
     * @type {number}
     */
    this.mass = options.mass || 0;

    /**
     * The inverse mass of the body.
     * @property invMass
     * @type {number}
     */
    this.invMass = 0;

    /**
     * The inertia of the body around the Z axis.
     * @property inertia
     * @type {number}
     */
    this.inertia = 0;

    /**
     * The inverse inertia of the body.
     * @property invInertia
     * @type {number}
     */
    this.invInertia = 0;

    this.invMassSolve = 0;
    this.invInertiaSolve = 0;

    /**
     * Set to true if you want to fix the rotation of the body.
     * @property fixedRotation
     * @type {Boolean}
     */
    this.fixedRotation = !!options.fixedRotation;

    /**
     * Set to true if you want to fix the body movement along the X axis. The body will still be able to move along Y.
     * @property {Boolean} fixedX
     */
    this.fixedX = !!options.fixedX;

    /**
     * Set to true if you want to fix the body movement along the Y axis. The body will still be able to move along X.
     * @property {Boolean} fixedY
     */
    this.fixedY = !!options.fixedY;

    /**
     * @private
     * @property {array} massMultiplier
     */
    this.massMultiplier = vec2.create();

    /**
     * The position of the body
     * @property position
     * @type {Array}
     */
    this.position = vec2.fromValues(0,0);
    if(options.position){
        vec2.copy(this.position, options.position);
    }

    /**
     * The interpolated position of the body. Use this for rendering.
     * @property interpolatedPosition
     * @type {Array}
     */
    this.interpolatedPosition = vec2.fromValues(0,0);

    /**
     * The interpolated angle of the body. Use this for rendering.
     * @property interpolatedAngle
     * @type {Number}
     */
    this.interpolatedAngle = 0;

    /**
     * The previous position of the body.
     * @property previousPosition
     * @type {Array}
     */
    this.previousPosition = vec2.fromValues(0,0);

    /**
     * The previous angle of the body.
     * @property previousAngle
     * @type {Number}
     */
    this.previousAngle = 0;

    /**
     * The current velocity of the body.
     * @property velocity
     * @type {Array}
     */
    this.velocity = vec2.fromValues(0,0);
    if(options.velocity){
        vec2.copy(this.velocity, options.velocity);
    }

    /**
     * Constraint velocity that was added to the body during the last step.
     * @property vlambda
     * @type {Array}
     */
    this.vlambda = vec2.fromValues(0,0);

    /**
     * Angular constraint velocity that was added to the body during last step.
     * @property wlambda
     * @type {Array}
     */
    this.wlambda = 0;

    /**
     * The angle of the body, in radians.
     * @property angle
     * @type {number}
     * @example
     *     // The angle property is not normalized to the interval 0 to 2*pi, it can be any value.
     *     // If you need a value between 0 and 2*pi, use the following function to normalize it.
     *     function normalizeAngle(angle){
     *         angle = angle % (2*Math.PI);
     *         if(angle < 0){
     *             angle += (2*Math.PI);
     *         }
     *         return angle;
     *     }
     */
    this.angle = options.angle || 0;

    /**
     * The angular velocity of the body, in radians per second.
     * @property angularVelocity
     * @type {number}
     */
    this.angularVelocity = options.angularVelocity || 0;

    /**
     * The force acting on the body. Since the body force (and {{#crossLink "Body/angularForce:property"}}{{/crossLink}}) will be zeroed after each step, so you need to set the force before each step.
     * @property force
     * @type {Array}
     *
     * @example
     *     // This produces a forcefield of 1 Newton in the positive x direction.
     *     for(var i=0; i<numSteps; i++){
     *         body.force[0] = 1;
     *         world.step(1/60);
     *     }
     *
     * @example
     *     // This will apply a rotational force on the body
     *     for(var i=0; i<numSteps; i++){
     *         body.angularForce = -3;
     *         world.step(1/60);
     *     }
     */
    this.force = vec2.create();
    if(options.force){
        vec2.copy(this.force, options.force);
    }

    /**
     * The angular force acting on the body. See {{#crossLink "Body/force:property"}}{{/crossLink}}.
     * @property angularForce
     * @type {number}
     */
    this.angularForce = options.angularForce || 0;

    /**
     * The linear damping acting on the body in the velocity direction. Should be a value between 0 and 1.
     * @property damping
     * @type {Number}
     * @default 0.1
     */
    this.damping = typeof(options.damping) === "number" ? options.damping : 0.1;

    /**
     * The angular force acting on the body. Should be a value between 0 and 1.
     * @property angularDamping
     * @type {Number}
     * @default 0.1
     */
    this.angularDamping = typeof(options.angularDamping) === "number" ? options.angularDamping : 0.1;

    /**
     * The type of motion this body has. Should be one of: {{#crossLink "Body/STATIC:property"}}Body.STATIC{{/crossLink}}, {{#crossLink "Body/DYNAMIC:property"}}Body.DYNAMIC{{/crossLink}} and {{#crossLink "Body/KINEMATIC:property"}}Body.KINEMATIC{{/crossLink}}.
     *
     * * Static bodies do not move, and they do not respond to forces or collision.
     * * Dynamic bodies body can move and respond to collisions and forces.
     * * Kinematic bodies only moves according to its .velocity, and does not respond to collisions or force.
     *
     * @property type
     * @type {number}
     *
     * @example
     *     // Bodies are static by default. Static bodies will never move.
     *     var body = new Body();
     *     console.log(body.type == Body.STATIC); // true
     *
     * @example
     *     // By setting the mass of a body to a nonzero number, the body
     *     // will become dynamic and will move and interact with other bodies.
     *     var dynamicBody = new Body({
     *         mass : 1
     *     });
     *     console.log(dynamicBody.type == Body.DYNAMIC); // true
     *
     * @example
     *     // Kinematic bodies will only move if you change their velocity.
     *     var kinematicBody = new Body({
     *         type: Body.KINEMATIC // Type can be set via the options object.
     *     });
     */
    this.type = Body.STATIC;

    if(typeof(options.type) !== 'undefined'){
        this.type = options.type;
    } else if(!options.mass){
        this.type = Body.STATIC;
    } else {
        this.type = Body.DYNAMIC;
    }

    /**
     * Bounding circle radius.
     * @property boundingRadius
     * @type {Number}
     */
    this.boundingRadius = 0;

    /**
     * Bounding box of this body.
     * @property aabb
     * @type {AABB}
     */
    this.aabb = new AABB();

    /**
     * Indicates if the AABB needs update. Update it with {{#crossLink "Body/updateAABB:method"}}.updateAABB(){{/crossLink}}.
     * @property aabbNeedsUpdate
     * @type {Boolean}
     * @see updateAABB
     *
     * @example
     *     // Force update the AABB
     *     body.aabbNeedsUpdate = true;
     *     body.updateAABB();
     *     console.log(body.aabbNeedsUpdate); // false
     */
    this.aabbNeedsUpdate = true;

    /**
     * If true, the body will automatically fall to sleep. Note that you need to enable sleeping in the {{#crossLink "World"}}{{/crossLink}} before anything will happen.
     * @property allowSleep
     * @type {Boolean}
     * @default true
     */
    this.allowSleep = options.allowSleep !== undefined ? options.allowSleep : true;

    this.wantsToSleep = false;

    /**
     * One of {{#crossLink "Body/AWAKE:property"}}Body.AWAKE{{/crossLink}}, {{#crossLink "Body/SLEEPY:property"}}Body.SLEEPY{{/crossLink}} and {{#crossLink "Body/SLEEPING:property"}}Body.SLEEPING{{/crossLink}}.
     *
     * The body is initially Body.AWAKE. If its velocity norm is below .sleepSpeedLimit, the sleepState will become Body.SLEEPY. If the body continues to be Body.SLEEPY for .sleepTimeLimit seconds, it will fall asleep (Body.SLEEPY).
     *
     * @property sleepState
     * @type {Number}
     * @default Body.AWAKE
     */
    this.sleepState = Body.AWAKE;

    /**
     * If the speed (the norm of the velocity) is smaller than this value, the body is considered sleepy.
     * @property sleepSpeedLimit
     * @type {Number}
     * @default 0.2
     */
    this.sleepSpeedLimit = options.sleepSpeedLimit !== undefined ? options.sleepSpeedLimit : 0.2;

    /**
     * If the body has been sleepy for this sleepTimeLimit seconds, it is considered sleeping.
     * @property sleepTimeLimit
     * @type {Number}
     * @default 1
     */
    this.sleepTimeLimit = options.sleepTimeLimit !== undefined ? options.sleepTimeLimit : 1;

    /**
     * Gravity scaling factor. If you want the body to ignore gravity, set this to zero. If you want to reverse gravity, set it to -1.
     * @property {Number} gravityScale
     * @default 1
     */
    this.gravityScale = options.gravityScale !== undefined ? options.gravityScale : 1;

    /**
     * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled. That means that this body will move through other bodies, but it will still trigger contact events, etc.
     * @property {Boolean} collisionResponse
     */
    this.collisionResponse = options.collisionResponse !== undefined ? options.collisionResponse : true;

    /**
     * How long the body has been sleeping.
     * @property {Number} idleTime
     */
    this.idleTime = 0;

    /**
     * The last time when the body went to SLEEPY state.
     * @property {Number} timeLastSleepy
     * @private
     */
    this.timeLastSleepy = 0;

    /**
     * If the body speed exceeds this threshold, CCD (continuous collision detection) will be enabled. Set it to a negative number to disable CCD completely for this body.
     * @property {number} ccdSpeedThreshold
     * @default -1
     */
    this.ccdSpeedThreshold = options.ccdSpeedThreshold !== undefined ? options.ccdSpeedThreshold : -1;

    /**
     * The number of iterations that should be used when searching for the time of impact during CCD. A larger number will assure that there's a small penetration on CCD collision, but a small number will give more performance.
     * @property {number} ccdIterations
     * @default 10
     */
    this.ccdIterations = options.ccdIterations !== undefined ? options.ccdIterations : 10;

    this.concavePath = null;

    this._wakeUpAfterNarrowphase = false;

    this.updateMassProperties();
}
Body.prototype = new EventEmitter();
Body.prototype.constructor = Body;

Body._idCounter = 0;

/**
 * @private
 * @method updateSolveMassProperties
 */
Body.prototype.updateSolveMassProperties = function(){
    if(this.sleepState === Body.SLEEPING || this.type === Body.KINEMATIC){
        this.invMassSolve = 0;
        this.invInertiaSolve = 0;
    } else {
        this.invMassSolve = this.invMass;
        this.invInertiaSolve = this.invInertia;
    }
};

/**
 * Set the total density of the body
 * @method setDensity
 * @param {number} density
 */
Body.prototype.setDensity = function(density) {
    var totalArea = this.getArea();
    this.mass = totalArea * density;
    this.updateMassProperties();
};

/**
 * Get the total area of all shapes in the body
 * @method getArea
 * @return {Number}
 */
Body.prototype.getArea = function() {
    var totalArea = 0;
    for(var i=0; i<this.shapes.length; i++){
        totalArea += this.shapes[i].area;
    }
    return totalArea;
};

/**
 * Get the AABB from the body. The AABB is updated if necessary.
 * @method getAABB
 * @return {AABB} The AABB instance (this.aabb)
 */
Body.prototype.getAABB = function(){
    if(this.aabbNeedsUpdate){
        this.updateAABB();
    }
    return this.aabb;
};

var shapeAABB = new AABB(),
    tmp = vec2.create();

/**
 * Updates the AABB of the Body, and set .aabbNeedsUpdate = false.
 * @method updateAABB
 */
Body.prototype.updateAABB = function() {
    var shapes = this.shapes,
        N = shapes.length,
        offset = tmp,
        bodyAngle = this.angle;

    for(var i=0; i!==N; i++){
        var shape = shapes[i],
            angle = shape.angle + bodyAngle;

        // Get shape world offset
        vec2.rotate(offset, shape.position, bodyAngle);
        vec2.add(offset, offset, this.position);

        // Get shape AABB
        shape.computeAABB(shapeAABB, offset, angle);

        if(i===0){
            this.aabb.copy(shapeAABB);
        } else {
            this.aabb.extend(shapeAABB);
        }
    }

    this.aabbNeedsUpdate = false;
};

/**
 * Update the bounding radius of the body (this.boundingRadius). Should be done if any of the shape dimensions or positions are changed.
 * @method updateBoundingRadius
 */
Body.prototype.updateBoundingRadius = function(){
    var shapes = this.shapes,
        N = shapes.length,
        radius = 0;

    for(var i=0; i!==N; i++){
        var shape = shapes[i],
            offset = vec2.length(shape.position),
            r = shape.boundingRadius;
        if(offset + r > radius){
            radius = offset + r;
        }
    }

    this.boundingRadius = radius;
};

/**
 * Add a shape to the body. You can pass a local transform when adding a shape,
 * so that the shape gets an offset and angle relative to the body center of mass.
 * Will automatically update the mass properties and bounding radius.
 *
 * @method addShape
 * @param  {Shape}              shape
 * @param  {Array} [offset] Local body offset of the shape.
 * @param  {Number}             [angle]  Local body angle.
 *
 * @example
 *     var body = new Body(),
 *         shape = new Circle({ radius: 1 });
 *
 *     // Add the shape to the body, positioned in the center
 *     body.addShape(shape);
 *
 *     // Add another shape to the body, positioned 1 unit length from the body center of mass along the local x-axis.
 *     body.addShape(shape,[1,0]);
 *
 *     // Add another shape to the body, positioned 1 unit length from the body center of mass along the local y-axis, and rotated 90 degrees CCW.
 *     body.addShape(shape,[0,1],Math.PI/2);
 */
Body.prototype.addShape = function(shape, offset, angle){
    if(shape.body){
        throw new Error('A shape can only be added to one body.');
    }
    shape.body = this;

    // Copy the offset vector
    if(offset){
        vec2.copy(shape.position, offset);
    } else {
        vec2.set(shape.position, 0, 0);
    }

    shape.angle = angle || 0;

    this.shapes.push(shape);
    this.updateMassProperties();
    this.updateBoundingRadius();

    this.aabbNeedsUpdate = true;
};

/**
 * Remove a shape
 * @method removeShape
 * @param  {Shape} shape
 * @return {Boolean} True if the shape was found and removed, else false.
 */
Body.prototype.removeShape = function(shape){
    var idx = this.shapes.indexOf(shape);

    if(idx !== -1){
        this.shapes.splice(idx,1);
        this.aabbNeedsUpdate = true;
        shape.body = null;
        return true;
    } else {
        return false;
    }
};

/**
 * Updates .inertia, .invMass, .invInertia for this Body. Should be called when
 * changing the structure or mass of the Body.
 *
 * @method updateMassProperties
 *
 * @example
 *     body.mass += 1;
 *     body.updateMassProperties();
 */
Body.prototype.updateMassProperties = function(){
    if(this.type === Body.STATIC || this.type === Body.KINEMATIC){

        this.mass = Number.MAX_VALUE;
        this.invMass = 0;
        this.inertia = Number.MAX_VALUE;
        this.invInertia = 0;

    } else {

        var shapes = this.shapes,
            N = shapes.length,
            m = this.mass / N,
            I = 0;

        if(!this.fixedRotation){
            for(var i=0; i<N; i++){
                var shape = shapes[i],
                    r2 = vec2.squaredLength(shape.position),
                    Icm = shape.computeMomentOfInertia(m);
                I += Icm + m*r2;
            }
            this.inertia = I;
            this.invInertia = I>0 ? 1/I : 0;

        } else {
            this.inertia = Number.MAX_VALUE;
            this.invInertia = 0;
        }

        // Inverse mass properties are easy
        this.invMass = 1 / this.mass;

        vec2.set(
            this.massMultiplier,
            this.fixedX ? 0 : 1,
            this.fixedY ? 0 : 1
        );
    }
};

var Body_applyForce_r = vec2.create();

/**
 * Apply force to a point relative to the center of mass of the body. This could for example be a point on the RigidBody surface. Applying force this way will add to Body.force and Body.angularForce. If relativePoint is zero, the force will be applied directly on the center of mass, and the torque produced will be zero.
 * @method applyForce
 * @param {Array} force The force to add.
 * @param {Array} [relativePoint] A world point to apply the force on.
 */
Body.prototype.applyForce = function(force, relativePoint){

    // Add linear force
    vec2.add(this.force, this.force, force);

    if(relativePoint){

        // Compute produced rotational force
        var rotForce = vec2.crossLength(relativePoint,force);

        // Add rotational force
        this.angularForce += rotForce;
    }
};

/**
 * Apply force to a body-local point.
 * @method applyForceLocal
 * @param  {Array} localForce The force vector to add, oriented in local body space.
 * @param  {Array} [localPoint] A point relative to the body in world space. If not given, it is set to zero and all of the impulse will be excerted on the center of mass.
 */
var Body_applyForce_forceWorld = vec2.create();
var Body_applyForce_pointWorld = vec2.create();
var Body_applyForce_pointLocal = vec2.create();
Body.prototype.applyForceLocal = function(localForce, localPoint){
    localPoint = localPoint || Body_applyForce_pointLocal;
    var worldForce = Body_applyForce_forceWorld;
    var worldPoint = Body_applyForce_pointWorld;
    this.vectorToWorldFrame(worldForce, localForce);
    this.vectorToWorldFrame(worldPoint, localPoint);
    this.applyForce(worldForce, worldPoint);
};

/**
 * Apply impulse to a point relative to the body. This could for example be a point on the Body surface. An impulse is a force added to a body during a short period of time (impulse = force * time). Impulses will be added to Body.velocity and Body.angularVelocity.
 * @method applyImpulse
 * @param  {Array} impulse The impulse vector to add, oriented in world space.
 * @param  {Array} [relativePoint] A point relative to the body in world space. If not given, it is set to zero and all of the impulse will be excerted on the center of mass.
 */
var Body_applyImpulse_velo = vec2.create();
Body.prototype.applyImpulse = function(impulseVector, relativePoint){
    if(this.type !== Body.DYNAMIC){
        return;
    }

    // Compute produced central impulse velocity
    var velo = Body_applyImpulse_velo;
    vec2.scale(velo, impulseVector, this.invMass);
    vec2.multiply(velo, this.massMultiplier, velo);

    // Add linear impulse
    vec2.add(this.velocity, velo, this.velocity);

    if(relativePoint){
        // Compute produced rotational impulse velocity
        var rotVelo = vec2.crossLength(relativePoint, impulseVector);
        rotVelo *= this.invInertia;

        // Add rotational Impulse
        this.angularVelocity += rotVelo;
    }
};

/**
 * Apply impulse to a point relative to the body. This could for example be a point on the Body surface. An impulse is a force added to a body during a short period of time (impulse = force * time). Impulses will be added to Body.velocity and Body.angularVelocity.
 * @method applyImpulseLocal
 * @param  {Array} impulse The impulse vector to add, oriented in world space.
 * @param  {Array} [relativePoint] A point relative to the body in world space. If not given, it is set to zero and all of the impulse will be excerted on the center of mass.
 */
var Body_applyImpulse_impulseWorld = vec2.create();
var Body_applyImpulse_pointWorld = vec2.create();
var Body_applyImpulse_pointLocal = vec2.create();
Body.prototype.applyImpulseLocal = function(localImpulse, localPoint){
    localPoint = localPoint || Body_applyImpulse_pointLocal;
    var worldImpulse = Body_applyImpulse_impulseWorld;
    var worldPoint = Body_applyImpulse_pointWorld;
    this.vectorToWorldFrame(worldImpulse, localImpulse);
    this.vectorToWorldFrame(worldPoint, localPoint);
    this.applyImpulse(worldImpulse, worldPoint);
};

/**
 * Transform a world point to local body frame.
 * @method toLocalFrame
 * @param  {Array} out          The vector to store the result in
 * @param  {Array} worldPoint   The input world point
 */
Body.prototype.toLocalFrame = function(out, worldPoint){
    vec2.toLocalFrame(out, worldPoint, this.position, this.angle);
};

/**
 * Transform a local point to world frame.
 * @method toWorldFrame
 * @param  {Array} out          The vector to store the result in
 * @param  {Array} localPoint   The input local point
 */
Body.prototype.toWorldFrame = function(out, localPoint){
    vec2.toGlobalFrame(out, localPoint, this.position, this.angle);
};

/**
 * Transform a world point to local body frame.
 * @method vectorToLocalFrame
 * @param  {Array} out          The vector to store the result in
 * @param  {Array} worldVector  The input world vector
 */
Body.prototype.vectorToLocalFrame = function(out, worldVector){
    vec2.vectorToLocalFrame(out, worldVector, this.angle);
};

/**
 * Transform a local point to world frame.
 * @method vectorToWorldFrame
 * @param  {Array} out          The vector to store the result in
 * @param  {Array} localVector  The input local vector
 */
Body.prototype.vectorToWorldFrame = function(out, localVector){
    vec2.vectorToGlobalFrame(out, localVector, this.angle);
};

/**
 * Reads a polygon shape path, and assembles convex shapes from that and puts them at proper offset points.
 * @method fromPolygon
 * @param {Array} path An array of 2d vectors, e.g. [[0,0],[0,1],...] that resembles a concave or convex polygon. The shape must be simple and without holes.
 * @param {Object} [options]
 * @param {Boolean} [options.optimalDecomp=false]   Set to true if you need optimal decomposition. Warning: very slow for polygons with more than 10 vertices.
 * @param {Boolean} [options.skipSimpleCheck=false] Set to true if you already know that the path is not intersecting itself.
 * @param {Boolean|Number} [options.removeCollinearPoints=false] Set to a number (angle threshold value) to remove collinear points, or false to keep all points.
 * @return {Boolean} True on success, else false.
 */
Body.prototype.fromPolygon = function(path,options){
    options = options || {};

    // Remove all shapes
    for(var i=this.shapes.length; i>=0; --i){
        this.removeShape(this.shapes[i]);
    }

    var p = new decomp.Polygon();
    p.vertices = path;

    // Make it counter-clockwise
    p.makeCCW();

    if(typeof(options.removeCollinearPoints) === "number"){
        p.removeCollinearPoints(options.removeCollinearPoints);
    }

    // Check if any line segment intersects the path itself
    if(typeof(options.skipSimpleCheck) === "undefined"){
        if(!p.isSimple()){
            return false;
        }
    }

    // Save this path for later
    this.concavePath = p.vertices.slice(0);
    for(var i=0; i<this.concavePath.length; i++){
        var v = [0,0];
        vec2.copy(v,this.concavePath[i]);
        this.concavePath[i] = v;
    }

    // Slow or fast decomp?
    var convexes;
    if(options.optimalDecomp){
        convexes = p.decomp();
    } else {
        convexes = p.quickDecomp();
    }

    var cm = vec2.create();

    // Add convexes
    for(var i=0; i!==convexes.length; i++){
        // Create convex
        var c = new Convex({ vertices: convexes[i].vertices });

        // Move all vertices so its center of mass is in the local center of the convex
        for(var j=0; j!==c.vertices.length; j++){
            var v = c.vertices[j];
            vec2.sub(v,v,c.centerOfMass);
        }

        vec2.scale(cm,c.centerOfMass,1);
        c.updateTriangles();
        c.updateCenterOfMass();
        c.updateBoundingRadius();

        // Add the shape
        this.addShape(c,cm);
    }

    this.adjustCenterOfMass();

    this.aabbNeedsUpdate = true;

    return true;
};

var adjustCenterOfMass_tmp1 = vec2.fromValues(0,0),
    adjustCenterOfMass_tmp2 = vec2.fromValues(0,0),
    adjustCenterOfMass_tmp3 = vec2.fromValues(0,0),
    adjustCenterOfMass_tmp4 = vec2.fromValues(0,0);

/**
 * Moves the shape offsets so their center of mass becomes the body center of mass.
 * @method adjustCenterOfMass
 */
Body.prototype.adjustCenterOfMass = function(){
    var offset_times_area = adjustCenterOfMass_tmp2,
        sum =               adjustCenterOfMass_tmp3,
        cm =                adjustCenterOfMass_tmp4,
        totalArea =         0;
    vec2.set(sum,0,0);

    for(var i=0; i!==this.shapes.length; i++){
        var s = this.shapes[i];
        vec2.scale(offset_times_area, s.position, s.area);
        vec2.add(sum, sum, offset_times_area);
        totalArea += s.area;
    }

    vec2.scale(cm,sum,1/totalArea);

    // Now move all shapes
    for(var i=0; i!==this.shapes.length; i++){
        var s = this.shapes[i];
        vec2.sub(s.position, s.position, cm);
    }

    // Move the body position too
    vec2.add(this.position,this.position,cm);

    // And concave path
    for(var i=0; this.concavePath && i<this.concavePath.length; i++){
        vec2.sub(this.concavePath[i], this.concavePath[i], cm);
    }

    this.updateMassProperties();
    this.updateBoundingRadius();
};

/**
 * Sets the force on the body to zero.
 * @method setZeroForce
 */
Body.prototype.setZeroForce = function(){
    vec2.set(this.force,0.0,0.0);
    this.angularForce = 0.0;
};

Body.prototype.resetConstraintVelocity = function(){
    var b = this,
        vlambda = b.vlambda;
    vec2.set(vlambda,0,0);
    b.wlambda = 0;
};

Body.prototype.addConstraintVelocity = function(){
    var b = this,
        v = b.velocity;
    vec2.add( v, v, b.vlambda);
    b.angularVelocity += b.wlambda;
};

/**
 * Apply damping, see <a href="http://code.google.com/p/bullet/issues/detail?id=74">this</a> for details.
 * @method applyDamping
 * @param  {number} dt Current time step
 */
Body.prototype.applyDamping = function(dt){
    if(this.type === Body.DYNAMIC){ // Only for dynamic bodies
        var v = this.velocity;
        vec2.scale(v, v, Math.pow(1.0 - this.damping,dt));
        this.angularVelocity *= Math.pow(1.0 - this.angularDamping,dt);
    }
};

/**
 * Wake the body up. Normally you should not need this, as the body is automatically awoken at events such as collisions.
 * Sets the sleepState to {{#crossLink "Body/AWAKE:property"}}Body.AWAKE{{/crossLink}} and emits the wakeUp event if the body wasn't awake before.
 * @method wakeUp
 */
Body.prototype.wakeUp = function(){
    var s = this.sleepState;
    this.sleepState = Body.AWAKE;
    this.idleTime = 0;
    if(s !== Body.AWAKE){
        this.emit(Body.wakeUpEvent);
    }
};

/**
 * Force body sleep
 * @method sleep
 */
Body.prototype.sleep = function(){
    this.sleepState = Body.SLEEPING;
    this.angularVelocity = 0;
    this.angularForce = 0;
    vec2.set(this.velocity,0,0);
    vec2.set(this.force,0,0);
    this.emit(Body.sleepEvent);
};

/**
 * Called every timestep to update internal sleep timer and change sleep state if needed.
 * @method sleepTick
 * @param {number} time The world time in seconds
 * @param {boolean} dontSleep
 * @param {number} dt
 */
Body.prototype.sleepTick = function(time, dontSleep, dt){
    if(!this.allowSleep || this.type === Body.SLEEPING){
        return;
    }

    this.wantsToSleep = false;

    var sleepState = this.sleepState,
        speedSquared = vec2.squaredLength(this.velocity) + Math.pow(this.angularVelocity,2),
        speedLimitSquared = Math.pow(this.sleepSpeedLimit,2);

    // Add to idle time
    if(speedSquared >= speedLimitSquared){
        this.idleTime = 0;
        this.sleepState = Body.AWAKE;
    } else {
        this.idleTime += dt;
        this.sleepState = Body.SLEEPY;
    }
    if(this.idleTime > this.sleepTimeLimit){
        if(!dontSleep){
            this.sleep();
        } else {
            this.wantsToSleep = true;
        }
    }
};

/**
 * Check if the body is overlapping another body. Note that this method only works if the body was added to a World and if at least one step was taken.
 * @method overlaps
 * @param  {Body} body
 * @return {boolean}
 */
Body.prototype.overlaps = function(body){
    return this.world.overlapKeeper.bodiesAreOverlapping(this, body);
};

var integrate_fhMinv = vec2.create();
var integrate_velodt = vec2.create();

/**
 * Move the body forward in time given its current velocity.
 * @method integrate
 * @param  {Number} dt
 */
Body.prototype.integrate = function(dt){
    var minv = this.invMass,
        f = this.force,
        pos = this.position,
        velo = this.velocity;

    // Save old position
    vec2.copy(this.previousPosition, this.position);
    this.previousAngle = this.angle;

    // Velocity update
    if(!this.fixedRotation){
        this.angularVelocity += this.angularForce * this.invInertia * dt;
    }
    vec2.scale(integrate_fhMinv, f, dt * minv);
    vec2.multiply(integrate_fhMinv, this.massMultiplier, integrate_fhMinv);
    vec2.add(velo, integrate_fhMinv, velo);

    // CCD
    if(!this.integrateToTimeOfImpact(dt)){

        // Regular position update
        vec2.scale(integrate_velodt, velo, dt);
        vec2.add(pos, pos, integrate_velodt);
        if(!this.fixedRotation){
            this.angle += this.angularVelocity * dt;
        }
    }

    this.aabbNeedsUpdate = true;
};

var result = new RaycastResult();
var ray = new Ray({
    mode: Ray.ALL
});
var direction = vec2.create();
var end = vec2.create();
var startToEnd = vec2.create();
var rememberPosition = vec2.create();
Body.prototype.integrateToTimeOfImpact = function(dt){

    if(this.ccdSpeedThreshold < 0 || vec2.squaredLength(this.velocity) < Math.pow(this.ccdSpeedThreshold, 2)){
        return false;
    }

    vec2.normalize(direction, this.velocity);

    vec2.scale(end, this.velocity, dt);
    vec2.add(end, end, this.position);

    vec2.sub(startToEnd, end, this.position);
    var startToEndAngle = this.angularVelocity * dt;
    var len = vec2.length(startToEnd);

    var timeOfImpact = 1;

    var hit;
    var that = this;
    result.reset();
    ray.callback = function (result) {
        if(result.body === that){
            return;
        }
        hit = result.body;
        result.getHitPoint(end, ray);
        vec2.sub(startToEnd, end, that.position);
        timeOfImpact = vec2.length(startToEnd) / len;
        result.stop();
    };
    vec2.copy(ray.from, this.position);
    vec2.copy(ray.to, end);
    ray.update();
    this.world.raycast(result, ray);

    if(!hit){
        return false;
    }

    var rememberAngle = this.angle;
    vec2.copy(rememberPosition, this.position);

    // Got a start and end point. Approximate time of impact using binary search
    var iter = 0;
    var tmin = 0;
    var tmid = 0;
    var tmax = timeOfImpact;
    while (tmax >= tmin && iter < this.ccdIterations) {
        iter++;

        // calculate the midpoint
        tmid = (tmax - tmin) / 2;

        // Move the body to that point
        vec2.scale(integrate_velodt, startToEnd, timeOfImpact);
        vec2.add(this.position, rememberPosition, integrate_velodt);
        this.angle = rememberAngle + startToEndAngle * timeOfImpact;
        this.updateAABB();

        // check overlap
        var overlaps = this.aabb.overlaps(hit.aabb) && this.world.narrowphase.bodiesOverlap(this, hit);

        if (overlaps) {
            // change min to search upper interval
            tmin = tmid;
        } else {
            // change max to search lower interval
            tmax = tmid;
        }
    }

    timeOfImpact = tmid;

    vec2.copy(this.position, rememberPosition);
    this.angle = rememberAngle;

    // move to TOI
    vec2.scale(integrate_velodt, startToEnd, timeOfImpact);
    vec2.add(this.position, this.position, integrate_velodt);
    if(!this.fixedRotation){
        this.angle += startToEndAngle * timeOfImpact;
    }

    return true;
};

/**
 * Get velocity of a point in the body.
 * @method getVelocityAtPoint
 * @param  {Array} result A vector to store the result in
 * @param  {Array} relativePoint A world oriented vector, indicating the position of the point to get the velocity from
 * @return {Array} The result vector
 */
Body.prototype.getVelocityAtPoint = function(result, relativePoint){
    vec2.crossVZ(result, relativePoint, this.angularVelocity);
    vec2.subtract(result, this.velocity, result);
    return result;
};

/**
 * @event sleepy
 */
Body.sleepyEvent = {
    type: "sleepy"
};

/**
 * @event sleep
 */
Body.sleepEvent = {
    type: "sleep"
};

/**
 * @event wakeup
 */
Body.wakeUpEvent = {
    type: "wakeup"
};

/**
 * Dynamic body.
 * @property DYNAMIC
 * @type {Number}
 * @static
 */
Body.DYNAMIC = 1;

/**
 * Static body.
 * @property STATIC
 * @type {Number}
 * @static
 */
Body.STATIC = 2;

/**
 * Kinematic body.
 * @property KINEMATIC
 * @type {Number}
 * @static
 */
Body.KINEMATIC = 4;

/**
 * @property AWAKE
 * @type {Number}
 * @static
 */
Body.AWAKE = 0;

/**
 * @property SLEEPY
 * @type {Number}
 * @static
 */
Body.SLEEPY = 1;

/**
 * @property SLEEPING
 * @type {Number}
 * @static
 */
Body.SLEEPING = 2;



/***/ }),

/***/ "./node_modules/p2/src/objects/LinearSpring.js":
/*!*****************************************************!*\
  !*** ./node_modules/p2/src/objects/LinearSpring.js ***!
  \*****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");
var Spring = __webpack_require__(/*! ./Spring */ "./node_modules/p2/src/objects/Spring.js");
var Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js");

module.exports = LinearSpring;

/**
 * A spring, connecting two bodies.
 *
 * The Spring explicitly adds force and angularForce to the bodies.
 *
 * @class LinearSpring
 * @extends Spring
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {number} [options.restLength]   A number > 0. Default is the current distance between the world anchor points.
 * @param {number} [options.stiffness=100]  Spring constant (see Hookes Law). A number >= 0.
 * @param {number} [options.damping=1]      A number >= 0. Default: 1
 * @param {Array}  [options.worldAnchorA]   Where to hook the spring to body A, in world coordinates. Overrides the option "localAnchorA" if given.
 * @param {Array}  [options.worldAnchorB]
 * @param {Array}  [options.localAnchorA]   Where to hook the spring to body A, in local body coordinates. Defaults to the body center.
 * @param {Array}  [options.localAnchorB]
 */
function LinearSpring(bodyA,bodyB,options){
    options = options || {};

    Spring.call(this, bodyA, bodyB, options);

    /**
     * Anchor for bodyA in local bodyA coordinates.
     * @property localAnchorA
     * @type {Array}
     */
    this.localAnchorA = vec2.fromValues(0,0);

    /**
     * Anchor for bodyB in local bodyB coordinates.
     * @property localAnchorB
     * @type {Array}
     */
    this.localAnchorB = vec2.fromValues(0,0);

    if(options.localAnchorA){ vec2.copy(this.localAnchorA, options.localAnchorA); }
    if(options.localAnchorB){ vec2.copy(this.localAnchorB, options.localAnchorB); }
    if(options.worldAnchorA){ this.setWorldAnchorA(options.worldAnchorA); }
    if(options.worldAnchorB){ this.setWorldAnchorB(options.worldAnchorB); }

    var worldAnchorA = vec2.create();
    var worldAnchorB = vec2.create();
    this.getWorldAnchorA(worldAnchorA);
    this.getWorldAnchorB(worldAnchorB);
    var worldDistance = vec2.distance(worldAnchorA, worldAnchorB);

    /**
     * Rest length of the spring.
     * @property restLength
     * @type {number}
     */
    this.restLength = typeof(options.restLength) === "number" ? options.restLength : worldDistance;
}
LinearSpring.prototype = new Spring();
LinearSpring.prototype.constructor = LinearSpring;

/**
 * Set the anchor point on body A, using world coordinates.
 * @method setWorldAnchorA
 * @param {Array} worldAnchorA
 */
LinearSpring.prototype.setWorldAnchorA = function(worldAnchorA){
    this.bodyA.toLocalFrame(this.localAnchorA, worldAnchorA);
};

/**
 * Set the anchor point on body B, using world coordinates.
 * @method setWorldAnchorB
 * @param {Array} worldAnchorB
 */
LinearSpring.prototype.setWorldAnchorB = function(worldAnchorB){
    this.bodyB.toLocalFrame(this.localAnchorB, worldAnchorB);
};

/**
 * Get the anchor point on body A, in world coordinates.
 * @method getWorldAnchorA
 * @param {Array} result The vector to store the result in.
 */
LinearSpring.prototype.getWorldAnchorA = function(result){
    this.bodyA.toWorldFrame(result, this.localAnchorA);
};

/**
 * Get the anchor point on body B, in world coordinates.
 * @method getWorldAnchorB
 * @param {Array} result The vector to store the result in.
 */
LinearSpring.prototype.getWorldAnchorB = function(result){
    this.bodyB.toWorldFrame(result, this.localAnchorB);
};

var applyForce_r =              vec2.create(),
    applyForce_r_unit =         vec2.create(),
    applyForce_u =              vec2.create(),
    applyForce_f =              vec2.create(),
    applyForce_worldAnchorA =   vec2.create(),
    applyForce_worldAnchorB =   vec2.create(),
    applyForce_ri =             vec2.create(),
    applyForce_rj =             vec2.create(),
    applyForce_tmp =            vec2.create();

/**
 * Apply the spring force to the connected bodies.
 * @method applyForce
 */
LinearSpring.prototype.applyForce = function(){
    var k = this.stiffness,
        d = this.damping,
        l = this.restLength,
        bodyA = this.bodyA,
        bodyB = this.bodyB,
        r = applyForce_r,
        r_unit = applyForce_r_unit,
        u = applyForce_u,
        f = applyForce_f,
        tmp = applyForce_tmp;

    var worldAnchorA = applyForce_worldAnchorA,
        worldAnchorB = applyForce_worldAnchorB,
        ri = applyForce_ri,
        rj = applyForce_rj;

    // Get world anchors
    this.getWorldAnchorA(worldAnchorA);
    this.getWorldAnchorB(worldAnchorB);

    // Get offset points
    vec2.sub(ri, worldAnchorA, bodyA.position);
    vec2.sub(rj, worldAnchorB, bodyB.position);

    // Compute distance vector between world anchor points
    vec2.sub(r, worldAnchorB, worldAnchorA);
    var rlen = vec2.len(r);
    vec2.normalize(r_unit,r);

    //console.log(rlen)
    //console.log("A",vec2.str(worldAnchorA),"B",vec2.str(worldAnchorB))

    // Compute relative velocity of the anchor points, u
    vec2.sub(u, bodyB.velocity, bodyA.velocity);
    vec2.crossZV(tmp, bodyB.angularVelocity, rj);
    vec2.add(u, u, tmp);
    vec2.crossZV(tmp, bodyA.angularVelocity, ri);
    vec2.sub(u, u, tmp);

    // F = - k * ( x - L ) - D * ( u )
    vec2.scale(f, r_unit, -k*(rlen-l) - d*vec2.dot(u,r_unit));

    // Add forces to bodies
    vec2.sub( bodyA.force, bodyA.force, f);
    vec2.add( bodyB.force, bodyB.force, f);

    // Angular force
    var ri_x_f = vec2.crossLength(ri, f);
    var rj_x_f = vec2.crossLength(rj, f);
    bodyA.angularForce -= ri_x_f;
    bodyB.angularForce += rj_x_f;
};


/***/ }),

/***/ "./node_modules/p2/src/objects/RotationalSpring.js":
/*!*********************************************************!*\
  !*** ./node_modules/p2/src/objects/RotationalSpring.js ***!
  \*********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");
var Spring = __webpack_require__(/*! ./Spring */ "./node_modules/p2/src/objects/Spring.js");

module.exports = RotationalSpring;

/**
 * A rotational spring, connecting two bodies rotation. This spring explicitly adds angularForce (torque) to the bodies.
 *
 * The spring can be combined with a {{#crossLink "RevoluteConstraint"}}{{/crossLink}} to make, for example, a mouse trap.
 *
 * @class RotationalSpring
 * @extends Spring
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {number} [options.restAngle] The relative angle of bodies at which the spring is at rest. If not given, it's set to the current relative angle between the bodies.
 * @param {number} [options.stiffness=100] Spring constant (see Hookes Law). A number >= 0.
 * @param {number} [options.damping=1] A number >= 0.
 */
function RotationalSpring(bodyA, bodyB, options){
    options = options || {};

    Spring.call(this, bodyA, bodyB, options);

    /**
     * Rest angle of the spring.
     * @property restAngle
     * @type {number}
     */
    this.restAngle = typeof(options.restAngle) === "number" ? options.restAngle : bodyB.angle - bodyA.angle;
}
RotationalSpring.prototype = new Spring();
RotationalSpring.prototype.constructor = RotationalSpring;

/**
 * Apply the spring force to the connected bodies.
 * @method applyForce
 */
RotationalSpring.prototype.applyForce = function(){
    var k = this.stiffness,
        d = this.damping,
        l = this.restAngle,
        bodyA = this.bodyA,
        bodyB = this.bodyB,
        x = bodyB.angle - bodyA.angle,
        u = bodyB.angularVelocity - bodyA.angularVelocity;

    var torque = - k * (x - l) - d * u * 0;

    bodyA.angularForce -= torque;
    bodyB.angularForce += torque;
};


/***/ }),

/***/ "./node_modules/p2/src/objects/Spring.js":
/*!***********************************************!*\
  !*** ./node_modules/p2/src/objects/Spring.js ***!
  \***********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");
var Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js");

module.exports = Spring;

/**
 * A spring, connecting two bodies. The Spring explicitly adds force and angularForce to the bodies and does therefore not put load on the constraint solver.
 *
 * @class Spring
 * @constructor
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Object} [options]
 * @param {number} [options.stiffness=100]  Spring constant (see Hookes Law). A number >= 0.
 * @param {number} [options.damping=1]      A number >= 0. Default: 1
 * @param {Array}  [options.localAnchorA]   Where to hook the spring to body A, in local body coordinates. Defaults to the body center.
 * @param {Array}  [options.localAnchorB]
 * @param {Array}  [options.worldAnchorA]   Where to hook the spring to body A, in world coordinates. Overrides the option "localAnchorA" if given.
 * @param {Array}  [options.worldAnchorB]
 */
function Spring(bodyA, bodyB, options){
    options = Utils.defaults(options,{
        stiffness: 100,
        damping: 1,
    });

    /**
     * Stiffness of the spring.
     * @property stiffness
     * @type {number}
     */
    this.stiffness = options.stiffness;

    /**
     * Damping of the spring.
     * @property damping
     * @type {number}
     */
    this.damping = options.damping;

    /**
     * First connected body.
     * @property bodyA
     * @type {Body}
     */
    this.bodyA = bodyA;

    /**
     * Second connected body.
     * @property bodyB
     * @type {Body}
     */
    this.bodyB = bodyB;
}

/**
 * Apply the spring force to the connected bodies.
 * @method applyForce
 */
Spring.prototype.applyForce = function(){
    // To be implemented by subclasses
};


/***/ }),

/***/ "./node_modules/p2/src/objects/TopDownVehicle.js":
/*!*******************************************************!*\
  !*** ./node_modules/p2/src/objects/TopDownVehicle.js ***!
  \*******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");
var Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js");
var Constraint = __webpack_require__(/*! ../constraints/Constraint */ "./node_modules/p2/src/constraints/Constraint.js");
var FrictionEquation = __webpack_require__(/*! ../equations/FrictionEquation */ "./node_modules/p2/src/equations/FrictionEquation.js");
var Body = __webpack_require__(/*! ../objects/Body */ "./node_modules/p2/src/objects/Body.js");

module.exports = TopDownVehicle;

/**
 * @class TopDownVehicle
 * @constructor
 * @param {Body} chassisBody A dynamic body, already added to the world.
 * @param {Object} [options]
 *
 * @example
 *
 *     // Create a dynamic body for the chassis
 *     var chassisBody = new Body({
 *         mass: 1
 *     });
 *     var boxShape = new Box({ width: 0.5, height: 1 });
 *     chassisBody.addShape(boxShape);
 *     world.addBody(chassisBody);
 *
 *     // Create the vehicle
 *     var vehicle = new TopDownVehicle(chassisBody);
 *
 *     // Add one front wheel and one back wheel - we don't actually need four :)
 *     var frontWheel = vehicle.addWheel({
 *         localPosition: [0, 0.5] // front
 *     });
 *     frontWheel.setSideFriction(4);
 *
 *     // Back wheel
 *     var backWheel = vehicle.addWheel({
 *         localPosition: [0, -0.5] // back
 *     });
 *     backWheel.setSideFriction(3); // Less side friction on back wheel makes it easier to drift
 *     vehicle.addToWorld(world);
 *
 *     // Steer value zero means straight forward. Positive is left and negative right.
 *     frontWheel.steerValue = Math.PI / 16;
 *
 *     // Engine force forward
 *     backWheel.engineForce = 10;
 *     backWheel.setBrakeForce(0);
 */
function TopDownVehicle(chassisBody, options){
    options = options || {};

    /**
     * @property {Body} chassisBody
     */
    this.chassisBody = chassisBody;

    /**
     * @property {Array} wheels
     */
    this.wheels = [];

    // A dummy body to constrain the chassis to
    this.groundBody = new Body({ mass: 0 });

    this.world = null;

    var that = this;
    this.preStepCallback = function(){
        that.update();
    };
}

/**
 * @method addToWorld
 * @param {World} world
 */
TopDownVehicle.prototype.addToWorld = function(world){
    this.world = world;
    world.addBody(this.groundBody);
    world.on('preStep', this.preStepCallback);
    for (var i = 0; i < this.wheels.length; i++) {
        var wheel = this.wheels[i];
        world.addConstraint(wheel);
    }
};

/**
 * @method removeFromWorld
 * @param {World} world
 */
TopDownVehicle.prototype.removeFromWorld = function(){
    var world = this.world;
    world.removeBody(this.groundBody);
    world.off('preStep', this.preStepCallback);
    for (var i = 0; i < this.wheels.length; i++) {
        var wheel = this.wheels[i];
        world.removeConstraint(wheel);
    }
    this.world = null;
};

/**
 * @method addWheel
 * @param {object} [wheelOptions]
 * @return {WheelConstraint}
 */
TopDownVehicle.prototype.addWheel = function(wheelOptions){
    var wheel = new WheelConstraint(this,wheelOptions);
    this.wheels.push(wheel);
    return wheel;
};

/**
 * @method update
 */
TopDownVehicle.prototype.update = function(){
    for (var i = 0; i < this.wheels.length; i++) {
        this.wheels[i].update();
    }
};

/**
 * @class WheelConstraint
 * @constructor
 * @extends {Constraint}
 * @param {Vehicle} vehicle
 * @param {object} [options]
 * @param {Array} [options.localForwardVector]The local wheel forward vector in local body space. Default is zero.
 * @param {Array} [options.localPosition] The local position of the wheen in the chassis body. Default is zero - the center of the body.
 * @param {Array} [options.sideFriction=5] The max friction force in the sideways direction.
 */
function WheelConstraint(vehicle, options){
    options = options || {};

    this.vehicle = vehicle;

    this.forwardEquation = new FrictionEquation(vehicle.chassisBody, vehicle.groundBody);

    this.sideEquation = new FrictionEquation(vehicle.chassisBody, vehicle.groundBody);

    /**
     * @property {number} steerValue
     */
    this.steerValue = 0;

    /**
     * @property {number} engineForce
     */
    this.engineForce = 0;

    this.setSideFriction(options.sideFriction !== undefined ? options.sideFriction : 5);

    /**
     * @property {Array} localForwardVector
     */
    this.localForwardVector = vec2.fromValues(0, 1);
    if(options.localForwardVector){
        vec2.copy(this.localForwardVector, options.localForwardVector);
    }

    /**
     * @property {Array} localPosition
     */
    this.localPosition = vec2.fromValues(0, 0);
    if(options.localPosition){
        vec2.copy(this.localPosition, options.localPosition);
    }

    Constraint.apply(this, vehicle.chassisBody, vehicle.groundBody);

    this.equations.push(
        this.forwardEquation,
        this.sideEquation
    );

    this.setBrakeForce(0);
}
WheelConstraint.prototype = new Constraint();

/**
 * @method setForwardFriction
 */
WheelConstraint.prototype.setBrakeForce = function(force){
    this.forwardEquation.setSlipForce(force);
};

/**
 * @method setSideFriction
 */
WheelConstraint.prototype.setSideFriction = function(force){
    this.sideEquation.setSlipForce(force);
};

var worldVelocity = vec2.create();
var relativePoint = vec2.create();

/**
 * @method getSpeed
 */
WheelConstraint.prototype.getSpeed = function(){
    this.vehicle.chassisBody.vectorToWorldFrame(relativePoint, this.localForwardVector);
    this.vehicle.chassisBody.getVelocityAtPoint(worldVelocity, relativePoint);
    return vec2.dot(worldVelocity, relativePoint);
};

var tmpVec = vec2.create();

/**
 * @method update
 */
WheelConstraint.prototype.update = function(){

    // Directional
    this.vehicle.chassisBody.vectorToWorldFrame(this.forwardEquation.t, this.localForwardVector);
    vec2.rotate(this.sideEquation.t, this.localForwardVector, Math.PI / 2);
    this.vehicle.chassisBody.vectorToWorldFrame(this.sideEquation.t, this.sideEquation.t);

    vec2.rotate(this.forwardEquation.t, this.forwardEquation.t, this.steerValue);
    vec2.rotate(this.sideEquation.t, this.sideEquation.t, this.steerValue);

    // Attachment point
    this.vehicle.chassisBody.toWorldFrame(this.forwardEquation.contactPointB, this.localPosition);
    vec2.copy(this.sideEquation.contactPointB, this.forwardEquation.contactPointB);

    this.vehicle.chassisBody.vectorToWorldFrame(this.forwardEquation.contactPointA, this.localPosition);
    vec2.copy(this.sideEquation.contactPointA, this.forwardEquation.contactPointA);

    // Add engine force
    vec2.normalize(tmpVec, this.forwardEquation.t);
    vec2.scale(tmpVec, tmpVec, this.engineForce);

    this.vehicle.chassisBody.applyForce(tmpVec, this.forwardEquation.contactPointA);
};

/***/ }),

/***/ "./node_modules/p2/src/p2.js":
/*!***********************************!*\
  !*** ./node_modules/p2/src/p2.js ***!
  \***********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// Export p2 classes
var p2 = module.exports = {
    AABB :                          __webpack_require__(/*! ./collision/AABB */ "./node_modules/p2/src/collision/AABB.js"),
    AngleLockEquation :             __webpack_require__(/*! ./equations/AngleLockEquation */ "./node_modules/p2/src/equations/AngleLockEquation.js"),
    Body :                          __webpack_require__(/*! ./objects/Body */ "./node_modules/p2/src/objects/Body.js"),
    Broadphase :                    __webpack_require__(/*! ./collision/Broadphase */ "./node_modules/p2/src/collision/Broadphase.js"),
    Capsule :                       __webpack_require__(/*! ./shapes/Capsule */ "./node_modules/p2/src/shapes/Capsule.js"),
    Circle :                        __webpack_require__(/*! ./shapes/Circle */ "./node_modules/p2/src/shapes/Circle.js"),
    Constraint :                    __webpack_require__(/*! ./constraints/Constraint */ "./node_modules/p2/src/constraints/Constraint.js"),
    ContactEquation :               __webpack_require__(/*! ./equations/ContactEquation */ "./node_modules/p2/src/equations/ContactEquation.js"),
    ContactEquationPool :           __webpack_require__(/*! ./utils/ContactEquationPool */ "./node_modules/p2/src/utils/ContactEquationPool.js"),
    ContactMaterial :               __webpack_require__(/*! ./material/ContactMaterial */ "./node_modules/p2/src/material/ContactMaterial.js"),
    Convex :                        __webpack_require__(/*! ./shapes/Convex */ "./node_modules/p2/src/shapes/Convex.js"),
    DistanceConstraint :            __webpack_require__(/*! ./constraints/DistanceConstraint */ "./node_modules/p2/src/constraints/DistanceConstraint.js"),
    Equation :                      __webpack_require__(/*! ./equations/Equation */ "./node_modules/p2/src/equations/Equation.js"),
    EventEmitter :                  __webpack_require__(/*! ./events/EventEmitter */ "./node_modules/p2/src/events/EventEmitter.js"),
    FrictionEquation :              __webpack_require__(/*! ./equations/FrictionEquation */ "./node_modules/p2/src/equations/FrictionEquation.js"),
    FrictionEquationPool :          __webpack_require__(/*! ./utils/FrictionEquationPool */ "./node_modules/p2/src/utils/FrictionEquationPool.js"),
    GearConstraint :                __webpack_require__(/*! ./constraints/GearConstraint */ "./node_modules/p2/src/constraints/GearConstraint.js"),
    GSSolver :                      __webpack_require__(/*! ./solver/GSSolver */ "./node_modules/p2/src/solver/GSSolver.js"),
    Heightfield :                   __webpack_require__(/*! ./shapes/Heightfield */ "./node_modules/p2/src/shapes/Heightfield.js"),
    Line :                          __webpack_require__(/*! ./shapes/Line */ "./node_modules/p2/src/shapes/Line.js"),
    LockConstraint :                __webpack_require__(/*! ./constraints/LockConstraint */ "./node_modules/p2/src/constraints/LockConstraint.js"),
    Material :                      __webpack_require__(/*! ./material/Material */ "./node_modules/p2/src/material/Material.js"),
    Narrowphase :                   __webpack_require__(/*! ./collision/Narrowphase */ "./node_modules/p2/src/collision/Narrowphase.js"),
    NaiveBroadphase :               __webpack_require__(/*! ./collision/NaiveBroadphase */ "./node_modules/p2/src/collision/NaiveBroadphase.js"),
    Particle :                      __webpack_require__(/*! ./shapes/Particle */ "./node_modules/p2/src/shapes/Particle.js"),
    Plane :                         __webpack_require__(/*! ./shapes/Plane */ "./node_modules/p2/src/shapes/Plane.js"),
    Pool :                          __webpack_require__(/*! ./utils/Pool */ "./node_modules/p2/src/utils/Pool.js"),
    RevoluteConstraint :            __webpack_require__(/*! ./constraints/RevoluteConstraint */ "./node_modules/p2/src/constraints/RevoluteConstraint.js"),
    PrismaticConstraint :           __webpack_require__(/*! ./constraints/PrismaticConstraint */ "./node_modules/p2/src/constraints/PrismaticConstraint.js"),
    Ray :                           __webpack_require__(/*! ./collision/Ray */ "./node_modules/p2/src/collision/Ray.js"),
    RaycastResult :                 __webpack_require__(/*! ./collision/RaycastResult */ "./node_modules/p2/src/collision/RaycastResult.js"),
    Box :                           __webpack_require__(/*! ./shapes/Box */ "./node_modules/p2/src/shapes/Box.js"),
    RotationalVelocityEquation :    __webpack_require__(/*! ./equations/RotationalVelocityEquation */ "./node_modules/p2/src/equations/RotationalVelocityEquation.js"),
    SAPBroadphase :                 __webpack_require__(/*! ./collision/SAPBroadphase */ "./node_modules/p2/src/collision/SAPBroadphase.js"),
    Shape :                         __webpack_require__(/*! ./shapes/Shape */ "./node_modules/p2/src/shapes/Shape.js"),
    Solver :                        __webpack_require__(/*! ./solver/Solver */ "./node_modules/p2/src/solver/Solver.js"),
    Spring :                        __webpack_require__(/*! ./objects/Spring */ "./node_modules/p2/src/objects/Spring.js"),
    TopDownVehicle :                __webpack_require__(/*! ./objects/TopDownVehicle */ "./node_modules/p2/src/objects/TopDownVehicle.js"),
    LinearSpring :                  __webpack_require__(/*! ./objects/LinearSpring */ "./node_modules/p2/src/objects/LinearSpring.js"),
    RotationalSpring :              __webpack_require__(/*! ./objects/RotationalSpring */ "./node_modules/p2/src/objects/RotationalSpring.js"),
    Utils :                         __webpack_require__(/*! ./utils/Utils */ "./node_modules/p2/src/utils/Utils.js"),
    World :                         __webpack_require__(/*! ./world/World */ "./node_modules/p2/src/world/World.js"),
    vec2 :                          __webpack_require__(/*! ./math/vec2 */ "./node_modules/p2/src/math/vec2.js"),
    version :                       __webpack_require__(/*! ../package.json */ "./node_modules/p2/package.json").version,
};

Object.defineProperty(p2, 'Rectangle', {
    get: function() {
        console.warn('The Rectangle class has been renamed to Box.');
        return this.Box;
    }
});

/***/ }),

/***/ "./node_modules/p2/src/shapes/Box.js":
/*!*******************************************!*\
  !*** ./node_modules/p2/src/shapes/Box.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,   Shape = __webpack_require__(/*! ./Shape */ "./node_modules/p2/src/shapes/Shape.js")
,   Convex = __webpack_require__(/*! ./Convex */ "./node_modules/p2/src/shapes/Convex.js");

module.exports = Box;

/**
 * Box shape class.
 * @class Box
 * @constructor
 * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
 * @param {Number} [options.width=1] Total width of the box
 * @param {Number} [options.height=1] Total height of the box
 * @extends Convex
 */
function Box(options){
    if(typeof(arguments[0]) === 'number' && typeof(arguments[1]) === 'number'){
        options = {
            width: arguments[0],
            height: arguments[1]
        };
        console.warn('The Rectangle has been renamed to Box and its constructor signature has changed. Please use the following format: new Box({ width: 1, height: 1, ... })');
    }
    options = options || {};

    /**
     * Total width of the box
     * @property width
     * @type {Number}
     */
    var width = this.width = options.width || 1;

    /**
     * Total height of the box
     * @property height
     * @type {Number}
     */
    var height = this.height = options.height || 1;

    var verts = [
        vec2.fromValues(-width/2, -height/2),
        vec2.fromValues( width/2, -height/2),
        vec2.fromValues( width/2,  height/2),
        vec2.fromValues(-width/2,  height/2)
    ];
    var axes = [
        vec2.fromValues(1, 0),
        vec2.fromValues(0, 1)
    ];

    options.vertices = verts;
    options.axes = axes;
    options.type = Shape.BOX;
    Convex.call(this, options);
}
Box.prototype = new Convex();
Box.prototype.constructor = Box;

/**
 * Compute moment of inertia
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 */
Box.prototype.computeMomentOfInertia = function(mass){
    var w = this.width,
        h = this.height;
    return mass * (h*h + w*w) / 12;
};

/**
 * Update the bounding radius
 * @method updateBoundingRadius
 */
Box.prototype.updateBoundingRadius = function(){
    var w = this.width,
        h = this.height;
    this.boundingRadius = Math.sqrt(w*w + h*h) / 2;
};

var corner1 = vec2.create(),
    corner2 = vec2.create(),
    corner3 = vec2.create(),
    corner4 = vec2.create();

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Box.prototype.computeAABB = function(out, position, angle){
    out.setFromPoints(this.vertices,position,angle,0);
};

Box.prototype.updateArea = function(){
    this.area = this.width * this.height;
};



/***/ }),

/***/ "./node_modules/p2/src/shapes/Capsule.js":
/*!***********************************************!*\
  !*** ./node_modules/p2/src/shapes/Capsule.js ***!
  \***********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Shape = __webpack_require__(/*! ./Shape */ "./node_modules/p2/src/shapes/Shape.js")
,   vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");

module.exports = Capsule;

/**
 * Capsule shape class.
 * @class Capsule
 * @constructor
 * @extends Shape
 * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
 * @param {Number} [options.length=1] The distance between the end points
 * @param {Number} [options.radius=1] Radius of the capsule
 * @example
 *     var capsuleShape = new Capsule({
 *         length: 1,
 *         radius: 2
 *     });
 *     body.addShape(capsuleShape);
 */
function Capsule(options){
    if(typeof(arguments[0]) === 'number' && typeof(arguments[1]) === 'number'){
        options = {
            length: arguments[0],
            radius: arguments[1]
        };
        console.warn('The Capsule constructor signature has changed. Please use the following format: new Capsule({ radius: 1, length: 1 })');
    }
    options = options || {};

    /**
     * The distance between the end points.
     * @property {Number} length
     */
    this.length = options.length || 1;

    /**
     * The radius of the capsule.
     * @property {Number} radius
     */
    this.radius = options.radius || 1;

    options.type = Shape.CAPSULE;
    Shape.call(this, options);
}
Capsule.prototype = new Shape();
Capsule.prototype.constructor = Capsule;

/**
 * Compute the mass moment of inertia of the Capsule.
 * @method conputeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 * @todo
 */
Capsule.prototype.computeMomentOfInertia = function(mass){
    // Approximate with rectangle
    var r = this.radius,
        w = this.length + r, // 2*r is too much, 0 is too little
        h = r*2;
    return mass * (h*h + w*w) / 12;
};

/**
 * @method updateBoundingRadius
 */
Capsule.prototype.updateBoundingRadius = function(){
    this.boundingRadius = this.radius + this.length/2;
};

/**
 * @method updateArea
 */
Capsule.prototype.updateArea = function(){
    this.area = Math.PI * this.radius * this.radius + this.radius * 2 * this.length;
};

var r = vec2.create();

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Capsule.prototype.computeAABB = function(out, position, angle){
    var radius = this.radius;

    // Compute center position of one of the the circles, world oriented, but with local offset
    vec2.set(r,this.length / 2,0);
    if(angle !== 0){
        vec2.rotate(r,r,angle);
    }

    // Get bounds
    vec2.set(out.upperBound,  Math.max(r[0]+radius, -r[0]+radius),
                              Math.max(r[1]+radius, -r[1]+radius));
    vec2.set(out.lowerBound,  Math.min(r[0]-radius, -r[0]-radius),
                              Math.min(r[1]-radius, -r[1]-radius));

    // Add offset
    vec2.add(out.lowerBound, out.lowerBound, position);
    vec2.add(out.upperBound, out.upperBound, position);
};

var intersectCapsule_hitPointWorld = vec2.create();
var intersectCapsule_normal = vec2.create();
var intersectCapsule_l0 = vec2.create();
var intersectCapsule_l1 = vec2.create();
var intersectCapsule_unit_y = vec2.fromValues(0,1);

/**
 * @method raycast
 * @param  {RaycastResult} result
 * @param  {Ray} ray
 * @param  {array} position
 * @param  {number} angle
 */
Capsule.prototype.raycast = function(result, ray, position, angle){
    var from = ray.from;
    var to = ray.to;
    var direction = ray.direction;

    var hitPointWorld = intersectCapsule_hitPointWorld;
    var normal = intersectCapsule_normal;
    var l0 = intersectCapsule_l0;
    var l1 = intersectCapsule_l1;

    // The sides
    var halfLen = this.length / 2;
    for(var i=0; i<2; i++){

        // get start and end of the line
        var y = this.radius * (i*2-1);
        vec2.set(l0, -halfLen, y);
        vec2.set(l1, halfLen, y);
        vec2.toGlobalFrame(l0, l0, position, angle);
        vec2.toGlobalFrame(l1, l1, position, angle);

        var delta = vec2.getLineSegmentsIntersectionFraction(from, to, l0, l1);
        if(delta >= 0){
            vec2.rotate(normal, intersectCapsule_unit_y, angle);
            vec2.scale(normal, normal, (i*2-1));
            ray.reportIntersection(result, delta, normal, -1);
            if(result.shouldStop(ray)){
                return;
            }
        }
    }

    // Circles
    var diagonalLengthSquared = Math.pow(this.radius, 2) + Math.pow(halfLen, 2);
    for(var i=0; i<2; i++){
        vec2.set(l0, halfLen * (i*2-1), 0);
        vec2.toGlobalFrame(l0, l0, position, angle);

        var a = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
        var b = 2 * ((to[0] - from[0]) * (from[0] - l0[0]) + (to[1] - from[1]) * (from[1] - l0[1]));
        var c = Math.pow(from[0] - l0[0], 2) + Math.pow(from[1] - l0[1], 2) - Math.pow(this.radius, 2);
        var delta = Math.pow(b, 2) - 4 * a * c;

        if(delta < 0){
            // No intersection
            continue;

        } else if(delta === 0){
            // single intersection point
            vec2.lerp(hitPointWorld, from, to, delta);

            if(vec2.squaredDistance(hitPointWorld, position) > diagonalLengthSquared){
                vec2.sub(normal, hitPointWorld, l0);
                vec2.normalize(normal,normal);
                ray.reportIntersection(result, delta, normal, -1);
                if(result.shouldStop(ray)){
                    return;
                }
            }

        } else {
            var sqrtDelta = Math.sqrt(delta);
            var inv2a = 1 / (2 * a);
            var d1 = (- b - sqrtDelta) * inv2a;
            var d2 = (- b + sqrtDelta) * inv2a;

            if(d1 >= 0 && d1 <= 1){
                vec2.lerp(hitPointWorld, from, to, d1);
                if(vec2.squaredDistance(hitPointWorld, position) > diagonalLengthSquared){
                    vec2.sub(normal, hitPointWorld, l0);
                    vec2.normalize(normal,normal);
                    ray.reportIntersection(result, d1, normal, -1);
                    if(result.shouldStop(ray)){
                        return;
                    }
                }
            }

            if(d2 >= 0 && d2 <= 1){
                vec2.lerp(hitPointWorld, from, to, d2);
                if(vec2.squaredDistance(hitPointWorld, position) > diagonalLengthSquared){
                    vec2.sub(normal, hitPointWorld, l0);
                    vec2.normalize(normal,normal);
                    ray.reportIntersection(result, d2, normal, -1);
                    if(result.shouldStop(ray)){
                        return;
                    }
                }
            }
        }
    }
};

/***/ }),

/***/ "./node_modules/p2/src/shapes/Circle.js":
/*!**********************************************!*\
  !*** ./node_modules/p2/src/shapes/Circle.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Shape = __webpack_require__(/*! ./Shape */ "./node_modules/p2/src/shapes/Shape.js")
,    vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");

module.exports = Circle;

/**
 * Circle shape class.
 * @class Circle
 * @extends Shape
 * @constructor
 * @param {options} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
 * @param {number} [options.radius=1] The radius of this circle
 *
 * @example
 *     var circleShape = new Circle({ radius: 1 });
 *     body.addShape(circleShape);
 */
function Circle(options){
    if(typeof(arguments[0]) === 'number'){
        options = {
            radius: arguments[0]
        };
        console.warn('The Circle constructor signature has changed. Please use the following format: new Circle({ radius: 1 })');
    }
    options = options || {};

    /**
     * The radius of the circle.
     * @property radius
     * @type {number}
     */
    this.radius = options.radius || 1;

    options.type = Shape.CIRCLE;
    Shape.call(this, options);
}
Circle.prototype = new Shape();
Circle.prototype.constructor = Circle;

/**
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 */
Circle.prototype.computeMomentOfInertia = function(mass){
    var r = this.radius;
    return mass * r * r / 2;
};

/**
 * @method updateBoundingRadius
 * @return {Number}
 */
Circle.prototype.updateBoundingRadius = function(){
    this.boundingRadius = this.radius;
};

/**
 * @method updateArea
 * @return {Number}
 */
Circle.prototype.updateArea = function(){
    this.area = Math.PI * this.radius * this.radius;
};

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Circle.prototype.computeAABB = function(out, position, angle){
    var r = this.radius;
    vec2.set(out.upperBound,  r,  r);
    vec2.set(out.lowerBound, -r, -r);
    if(position){
        vec2.add(out.lowerBound, out.lowerBound, position);
        vec2.add(out.upperBound, out.upperBound, position);
    }
};

var Ray_intersectSphere_intersectionPoint = vec2.create();
var Ray_intersectSphere_normal = vec2.create();

/**
 * @method raycast
 * @param  {RaycastResult} result
 * @param  {Ray} ray
 * @param  {array} position
 * @param  {number} angle
 */
Circle.prototype.raycast = function(result, ray, position, angle){
    var from = ray.from,
        to = ray.to,
        r = this.radius;

    var a = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
    var b = 2 * ((to[0] - from[0]) * (from[0] - position[0]) + (to[1] - from[1]) * (from[1] - position[1]));
    var c = Math.pow(from[0] - position[0], 2) + Math.pow(from[1] - position[1], 2) - Math.pow(r, 2);
    var delta = Math.pow(b, 2) - 4 * a * c;

    var intersectionPoint = Ray_intersectSphere_intersectionPoint;
    var normal = Ray_intersectSphere_normal;

    if(delta < 0){
        // No intersection
        return;

    } else if(delta === 0){
        // single intersection point
        vec2.lerp(intersectionPoint, from, to, delta);

        vec2.sub(normal, intersectionPoint, position);
        vec2.normalize(normal,normal);

        ray.reportIntersection(result, delta, normal, -1);

    } else {
        var sqrtDelta = Math.sqrt(delta);
        var inv2a = 1 / (2 * a);
        var d1 = (- b - sqrtDelta) * inv2a;
        var d2 = (- b + sqrtDelta) * inv2a;

        if(d1 >= 0 && d1 <= 1){
            vec2.lerp(intersectionPoint, from, to, d1);

            vec2.sub(normal, intersectionPoint, position);
            vec2.normalize(normal,normal);

            ray.reportIntersection(result, d1, normal, -1);

            if(result.shouldStop(ray)){
                return;
            }
        }

        if(d2 >= 0 && d2 <= 1){
            vec2.lerp(intersectionPoint, from, to, d2);

            vec2.sub(normal, intersectionPoint, position);
            vec2.normalize(normal,normal);

            ray.reportIntersection(result, d2, normal, -1);
        }
    }
};

/***/ }),

/***/ "./node_modules/p2/src/shapes/Convex.js":
/*!**********************************************!*\
  !*** ./node_modules/p2/src/shapes/Convex.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Shape = __webpack_require__(/*! ./Shape */ "./node_modules/p2/src/shapes/Shape.js")
,   vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,   polyk = __webpack_require__(/*! ../math/polyk */ "./node_modules/p2/src/math/polyk.js")
,   decomp = __webpack_require__(/*! poly-decomp */ "./node_modules/poly-decomp/src/index.js");

module.exports = Convex;

/**
 * Convex shape class.
 * @class Convex
 * @constructor
 * @extends Shape
 * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
 * @param {Array} [options.vertices] An array of vertices that span this shape. Vertices are given in counter-clockwise (CCW) direction.
 * @param {Array} [options.axes] An array of unit length vectors, representing the symmetry axes in the convex.
 * @example
 *     // Create a box
 *     var vertices = [[-1,-1], [1,-1], [1,1], [-1,1]];
 *     var convexShape = new Convex({ vertices: vertices });
 *     body.addShape(convexShape);
 */
function Convex(options){
    if(Array.isArray(arguments[0])){
        options = {
            vertices: arguments[0],
            axes: arguments[1]
        };
        console.warn('The Convex constructor signature has changed. Please use the following format: new Convex({ vertices: [...], ... })');
    }
    options = options || {};

    /**
     * Vertices defined in the local frame.
     * @property vertices
     * @type {Array}
     */
    this.vertices = [];

    // Copy the verts
    var vertices = options.vertices !== undefined ? options.vertices : [];
    for(var i=0; i < vertices.length; i++){
        var v = vec2.create();
        vec2.copy(v, vertices[i]);
        this.vertices.push(v);
    }

    /**
     * Axes defined in the local frame.
     * @property axes
     * @type {Array}
     */
    this.axes = [];

    if(options.axes){

        // Copy the axes
        for(var i=0; i < options.axes.length; i++){
            var axis = vec2.create();
            vec2.copy(axis, options.axes[i]);
            this.axes.push(axis);
        }

    } else {

        // Construct axes from the vertex data
        for(var i = 0; i < this.vertices.length; i++){
            // Get the world edge
            var worldPoint0 = this.vertices[i];
            var worldPoint1 = this.vertices[(i+1) % this.vertices.length];

            var normal = vec2.create();
            vec2.sub(normal, worldPoint1, worldPoint0);

            // Get normal - just rotate 90 degrees since vertices are given in CCW
            vec2.rotate90cw(normal, normal);
            vec2.normalize(normal, normal);

            this.axes.push(normal);
        }

    }

    /**
     * The center of mass of the Convex
     * @property centerOfMass
     * @type {Array}
     */
    this.centerOfMass = vec2.fromValues(0,0);

    /**
     * Triangulated version of this convex. The structure is Array of 3-Arrays, and each subarray contains 3 integers, referencing the vertices.
     * @property triangles
     * @type {Array}
     */
    this.triangles = [];

    if(this.vertices.length){
        this.updateTriangles();
        this.updateCenterOfMass();
    }

    /**
     * The bounding radius of the convex
     * @property boundingRadius
     * @type {Number}
     */
    this.boundingRadius = 0;

    options.type = Shape.CONVEX;
    Shape.call(this, options);

    this.updateBoundingRadius();
    this.updateArea();
    if(this.area < 0){
        throw new Error("Convex vertices must be given in conter-clockwise winding.");
    }
}
Convex.prototype = new Shape();
Convex.prototype.constructor = Convex;

var tmpVec1 = vec2.create();
var tmpVec2 = vec2.create();

/**
 * Project a Convex onto a world-oriented axis
 * @method projectOntoAxis
 * @static
 * @param  {Array} offset
 * @param  {Array} localAxis
 * @param  {Array} result
 */
Convex.prototype.projectOntoLocalAxis = function(localAxis, result){
    var max=null,
        min=null,
        v,
        value,
        localAxis = tmpVec1;

    // Get projected position of all vertices
    for(var i=0; i<this.vertices.length; i++){
        v = this.vertices[i];
        value = vec2.dot(v, localAxis);
        if(max === null || value > max){
            max = value;
        }
        if(min === null || value < min){
            min = value;
        }
    }

    if(min > max){
        var t = min;
        min = max;
        max = t;
    }

    vec2.set(result, min, max);
};

Convex.prototype.projectOntoWorldAxis = function(localAxis, shapeOffset, shapeAngle, result){
    var worldAxis = tmpVec2;

    this.projectOntoLocalAxis(localAxis, result);

    // Project the position of the body onto the axis - need to add this to the result
    if(shapeAngle !== 0){
        vec2.rotate(worldAxis, localAxis, shapeAngle);
    } else {
        worldAxis = localAxis;
    }
    var offset = vec2.dot(shapeOffset, worldAxis);

    vec2.set(result, result[0] + offset, result[1] + offset);
};


/**
 * Update the .triangles property
 * @method updateTriangles
 */
Convex.prototype.updateTriangles = function(){

    this.triangles.length = 0;

    // Rewrite on polyk notation, array of numbers
    var polykVerts = [];
    for(var i=0; i<this.vertices.length; i++){
        var v = this.vertices[i];
        polykVerts.push(v[0],v[1]);
    }

    // Triangulate
    var triangles = polyk.Triangulate(polykVerts);

    // Loop over all triangles, add their inertia contributions to I
    for(var i=0; i<triangles.length; i+=3){
        var id1 = triangles[i],
            id2 = triangles[i+1],
            id3 = triangles[i+2];

        // Add to triangles
        this.triangles.push([id1,id2,id3]);
    }
};

var updateCenterOfMass_centroid = vec2.create(),
    updateCenterOfMass_centroid_times_mass = vec2.create(),
    updateCenterOfMass_a = vec2.create(),
    updateCenterOfMass_b = vec2.create(),
    updateCenterOfMass_c = vec2.create(),
    updateCenterOfMass_ac = vec2.create(),
    updateCenterOfMass_ca = vec2.create(),
    updateCenterOfMass_cb = vec2.create(),
    updateCenterOfMass_n = vec2.create();

/**
 * Update the .centerOfMass property.
 * @method updateCenterOfMass
 */
Convex.prototype.updateCenterOfMass = function(){
    var triangles = this.triangles,
        verts = this.vertices,
        cm = this.centerOfMass,
        centroid = updateCenterOfMass_centroid,
        n = updateCenterOfMass_n,
        a = updateCenterOfMass_a,
        b = updateCenterOfMass_b,
        c = updateCenterOfMass_c,
        ac = updateCenterOfMass_ac,
        ca = updateCenterOfMass_ca,
        cb = updateCenterOfMass_cb,
        centroid_times_mass = updateCenterOfMass_centroid_times_mass;

    vec2.set(cm,0,0);
    var totalArea = 0;

    for(var i=0; i!==triangles.length; i++){
        var t = triangles[i],
            a = verts[t[0]],
            b = verts[t[1]],
            c = verts[t[2]];

        vec2.centroid(centroid,a,b,c);

        // Get mass for the triangle (density=1 in this case)
        // http://math.stackexchange.com/questions/80198/area-of-triangle-via-vectors
        var m = Convex.triangleArea(a,b,c);
        totalArea += m;

        // Add to center of mass
        vec2.scale(centroid_times_mass, centroid, m);
        vec2.add(cm, cm, centroid_times_mass);
    }

    vec2.scale(cm,cm,1/totalArea);
};

/**
 * Compute the mass moment of inertia of the Convex.
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 * @see http://www.gamedev.net/topic/342822-moment-of-inertia-of-a-polygon-2d/
 */
Convex.prototype.computeMomentOfInertia = function(mass){
    var denom = 0.0,
        numer = 0.0,
        N = this.vertices.length;
    for(var j = N-1, i = 0; i < N; j = i, i ++){
        var p0 = this.vertices[j];
        var p1 = this.vertices[i];
        var a = Math.abs(vec2.crossLength(p0,p1));
        var b = vec2.dot(p1,p1) + vec2.dot(p1,p0) + vec2.dot(p0,p0);
        denom += a * b;
        numer += a;
    }
    return (mass / 6.0) * (denom / numer);
};

/**
 * Updates the .boundingRadius property
 * @method updateBoundingRadius
 */
Convex.prototype.updateBoundingRadius = function(){
    var verts = this.vertices,
        r2 = 0;

    for(var i=0; i!==verts.length; i++){
        var l2 = vec2.squaredLength(verts[i]);
        if(l2 > r2){
            r2 = l2;
        }
    }

    this.boundingRadius = Math.sqrt(r2);
};

/**
 * Get the area of the triangle spanned by the three points a, b, c. The area is positive if the points are given in counter-clockwise order, otherwise negative.
 * @static
 * @method triangleArea
 * @param {Array} a
 * @param {Array} b
 * @param {Array} c
 * @return {Number}
 */
Convex.triangleArea = function(a,b,c){
    return (((b[0] - a[0])*(c[1] - a[1]))-((c[0] - a[0])*(b[1] - a[1]))) * 0.5;
};

/**
 * Update the .area
 * @method updateArea
 */
Convex.prototype.updateArea = function(){
    this.updateTriangles();
    this.area = 0;

    var triangles = this.triangles,
        verts = this.vertices;
    for(var i=0; i!==triangles.length; i++){
        var t = triangles[i],
            a = verts[t[0]],
            b = verts[t[1]],
            c = verts[t[2]];

        // Get mass for the triangle (density=1 in this case)
        var m = Convex.triangleArea(a,b,c);
        this.area += m;
    }
};

/**
 * @method computeAABB
 * @param  {AABB}   out
 * @param  {Array}  position
 * @param  {Number} angle
 */
Convex.prototype.computeAABB = function(out, position, angle){
    out.setFromPoints(this.vertices, position, angle, 0);
};

var intersectConvex_rayStart = vec2.create();
var intersectConvex_rayEnd = vec2.create();
var intersectConvex_normal = vec2.create();

/**
 * @method raycast
 * @param  {RaycastResult} result
 * @param  {Ray} ray
 * @param  {array} position
 * @param  {number} angle
 */
Convex.prototype.raycast = function(result, ray, position, angle){
    var rayStart = intersectConvex_rayStart;
    var rayEnd = intersectConvex_rayEnd;
    var normal = intersectConvex_normal;
    var vertices = this.vertices;

    // Transform to local shape space
    vec2.toLocalFrame(rayStart, ray.from, position, angle);
    vec2.toLocalFrame(rayEnd, ray.to, position, angle);

    var n = vertices.length;

    for (var i = 0; i < n && !result.shouldStop(ray); i++) {
        var q1 = vertices[i];
        var q2 = vertices[(i+1) % n];
        var delta = vec2.getLineSegmentsIntersectionFraction(rayStart, rayEnd, q1, q2);

        if(delta >= 0){
            vec2.sub(normal, q2, q1);
            vec2.rotate(normal, normal, -Math.PI / 2 + angle);
            vec2.normalize(normal, normal);
            ray.reportIntersection(result, delta, normal, i);
        }
    }
};


/***/ }),

/***/ "./node_modules/p2/src/shapes/Heightfield.js":
/*!***************************************************!*\
  !*** ./node_modules/p2/src/shapes/Heightfield.js ***!
  \***************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Shape = __webpack_require__(/*! ./Shape */ "./node_modules/p2/src/shapes/Shape.js")
,    vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,    Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js");

module.exports = Heightfield;

/**
 * Heightfield shape class. Height data is given as an array. These data points are spread out evenly with a distance "elementWidth".
 * @class Heightfield
 * @extends Shape
 * @constructor
 * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
 * @param {array} [options.heights] An array of Y values that will be used to construct the terrain.
 * @param {Number} [options.minValue] Minimum value of the data points in the data array. Will be computed automatically if not given.
 * @param {Number} [options.maxValue] Maximum value.
 * @param {Number} [options.elementWidth=0.1] World spacing between the data points in X direction.
 *
 * @example
 *     // Generate some height data (y-values).
 *     var heights = [];
 *     for(var i = 0; i < 1000; i++){
 *         var y = 0.5 * Math.cos(0.2 * i);
 *         heights.push(y);
 *     }
 *
 *     // Create the heightfield shape
 *     var heightfieldShape = new Heightfield({
 *         heights: heights,
 *         elementWidth: 1 // Distance between the data points in X direction
 *     });
 *     var heightfieldBody = new Body();
 *     heightfieldBody.addShape(heightfieldShape);
 *     world.addBody(heightfieldBody);
 *
 * @todo Should use a scale property with X and Y direction instead of just elementWidth
 */
function Heightfield(options){
    if(Array.isArray(arguments[0])){
        options = {
            heights: arguments[0]
        };

        if(typeof(arguments[1]) === 'object'){
            for(var key in arguments[1]){
                options[key] = arguments[1][key];
            }
        }

        console.warn('The Heightfield constructor signature has changed. Please use the following format: new Heightfield({ heights: [...], ... })');
    }
    options = options || {};

    /**
     * An array of numbers, or height values, that are spread out along the x axis.
     * @property {array} heights
     */
    this.heights = options.heights ? options.heights.slice(0) : [];

    /**
     * Max value of the heights
     * @property {number} maxValue
     */
    this.maxValue = options.maxValue || null;

    /**
     * Max value of the heights
     * @property {number} minValue
     */
    this.minValue = options.minValue || null;

    /**
     * The width of each element
     * @property {number} elementWidth
     */
    this.elementWidth = options.elementWidth || 0.1;

    if(options.maxValue === undefined || options.minValue === undefined){
        this.updateMaxMinValues();
    }

    options.type = Shape.HEIGHTFIELD;
    Shape.call(this, options);
}
Heightfield.prototype = new Shape();
Heightfield.prototype.constructor = Heightfield;

/**
 * Update the .minValue and the .maxValue
 * @method updateMaxMinValues
 */
Heightfield.prototype.updateMaxMinValues = function(){
    var data = this.heights;
    var maxValue = data[0];
    var minValue = data[0];
    for(var i=0; i !== data.length; i++){
        var v = data[i];
        if(v > maxValue){
            maxValue = v;
        }
        if(v < minValue){
            minValue = v;
        }
    }
    this.maxValue = maxValue;
    this.minValue = minValue;
};

/**
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number}
 */
Heightfield.prototype.computeMomentOfInertia = function(mass){
    return Number.MAX_VALUE;
};

Heightfield.prototype.updateBoundingRadius = function(){
    this.boundingRadius = Number.MAX_VALUE;
};

Heightfield.prototype.updateArea = function(){
    var data = this.heights,
        area = 0;
    for(var i=0; i<data.length-1; i++){
        area += (data[i]+data[i+1]) / 2 * this.elementWidth;
    }
    this.area = area;
};

var points = [
    vec2.create(),
    vec2.create(),
    vec2.create(),
    vec2.create()
];

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Heightfield.prototype.computeAABB = function(out, position, angle){
    vec2.set(points[0], 0, this.maxValue);
    vec2.set(points[1], this.elementWidth * this.heights.length, this.maxValue);
    vec2.set(points[2], this.elementWidth * this.heights.length, this.minValue);
    vec2.set(points[3], 0, this.minValue);
    out.setFromPoints(points, position, angle);
};

/**
 * Get a line segment in the heightfield
 * @method getLineSegment
 * @param  {array} start Where to store the resulting start point
 * @param  {array} end Where to store the resulting end point
 * @param  {number} i
 */
Heightfield.prototype.getLineSegment = function(start, end, i){
    var data = this.heights;
    var width = this.elementWidth;
    vec2.set(start, i * width, data[i]);
    vec2.set(end, (i + 1) * width, data[i + 1]);
};

Heightfield.prototype.getSegmentIndex = function(position){
    return Math.floor(position[0] / this.elementWidth);
};

Heightfield.prototype.getClampedSegmentIndex = function(position){
    var i = this.getSegmentIndex(position);
    i = Math.min(this.heights.length, Math.max(i, 0)); // clamp
    return i;
};

var intersectHeightfield_hitPointWorld = vec2.create();
var intersectHeightfield_worldNormal = vec2.create();
var intersectHeightfield_l0 = vec2.create();
var intersectHeightfield_l1 = vec2.create();
var intersectHeightfield_localFrom = vec2.create();
var intersectHeightfield_localTo = vec2.create();
var intersectHeightfield_unit_y = vec2.fromValues(0,1);

// Returns 1 if the lines intersect, otherwise 0.
function getLineSegmentsIntersection (out, p0, p1, p2, p3) {

    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1[0] - p0[0];
    s1_y = p1[1] - p0[1];
    s2_x = p3[0] - p2[0];
    s2_y = p3[1] - p2[1];

    var s, t;
    s = (-s1_y * (p0[0] - p2[0]) + s1_x * (p0[1] - p2[1])) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0[1] - p2[1]) - s2_y * (p0[0] - p2[0])) / (-s2_x * s1_y + s1_x * s2_y);
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) { // Collision detected
        var intX = p0[0] + (t * s1_x);
        var intY = p0[1] + (t * s1_y);
        out[0] = intX;
        out[1] = intY;
        return t;
    }
    return -1; // No collision
}

/**
 * @method raycast
 * @param  {RayResult} result
 * @param  {Ray} ray
 * @param  {array} position
 * @param  {number} angle
 */
Heightfield.prototype.raycast = function(result, ray, position, angle){
    var from = ray.from;
    var to = ray.to;
    var direction = ray.direction;

    var hitPointWorld = intersectHeightfield_hitPointWorld;
    var worldNormal = intersectHeightfield_worldNormal;
    var l0 = intersectHeightfield_l0;
    var l1 = intersectHeightfield_l1;
    var localFrom = intersectHeightfield_localFrom;
    var localTo = intersectHeightfield_localTo;

    // get local ray start and end
    vec2.toLocalFrame(localFrom, from, position, angle);
    vec2.toLocalFrame(localTo, to, position, angle);

    // Get the segment range
    var i0 = this.getClampedSegmentIndex(localFrom);
    var i1 = this.getClampedSegmentIndex(localTo);
    if(i0 > i1){
        var tmp = i0;
        i0 = i1;
        i1 = tmp;
    }

    // The segments
    for(var i=0; i<this.heights.length - 1; i++){
        this.getLineSegment(l0, l1, i);
        var t = vec2.getLineSegmentsIntersectionFraction(localFrom, localTo, l0, l1);
        if(t >= 0){
            vec2.sub(worldNormal, l1, l0);
            vec2.rotate(worldNormal, worldNormal, angle + Math.PI / 2);
            vec2.normalize(worldNormal, worldNormal);
            ray.reportIntersection(result, t, worldNormal, -1);
            if(result.shouldStop(ray)){
                return;
            }
        }
    }
};

/***/ }),

/***/ "./node_modules/p2/src/shapes/Line.js":
/*!********************************************!*\
  !*** ./node_modules/p2/src/shapes/Line.js ***!
  \********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Shape = __webpack_require__(/*! ./Shape */ "./node_modules/p2/src/shapes/Shape.js")
,   vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");

module.exports = Line;

/**
 * Line shape class. The line shape is along the x direction, and stretches from [-length/2, 0] to [length/2,0].
 * @class Line
 * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
 * @param {Number} [options.length=1] The total length of the line
 * @extends Shape
 * @constructor
 */
function Line(options){
    if(typeof(arguments[0]) === 'number'){
        options = {
            length: arguments[0]
        };
        console.warn('The Line constructor signature has changed. Please use the following format: new Line({ length: 1, ... })');
    }
    options = options || {};

    /**
     * Length of this line
     * @property {Number} length
     * @default 1
     */
    this.length = options.length || 1;

    options.type = Shape.LINE;
    Shape.call(this, options);
}
Line.prototype = new Shape();
Line.prototype.constructor = Line;

Line.prototype.computeMomentOfInertia = function(mass){
    return mass * Math.pow(this.length,2) / 12;
};

Line.prototype.updateBoundingRadius = function(){
    this.boundingRadius = this.length/2;
};

var points = [vec2.create(),vec2.create()];

/**
 * @method computeAABB
 * @param  {AABB}   out      The resulting AABB.
 * @param  {Array}  position
 * @param  {Number} angle
 */
Line.prototype.computeAABB = function(out, position, angle){
    var l2 = this.length / 2;
    vec2.set(points[0], -l2,  0);
    vec2.set(points[1],  l2,  0);
    out.setFromPoints(points,position,angle,0);
};

var raycast_hitPoint = vec2.create();
var raycast_normal = vec2.create();
var raycast_l0 = vec2.create();
var raycast_l1 = vec2.create();
var raycast_unit_y = vec2.fromValues(0,1);

/**
 * @method raycast
 * @param  {RaycastResult} result
 * @param  {Ray} ray
 * @param  {number} angle
 * @param  {array} position
 */
Line.prototype.raycast = function(result, ray, position, angle){
    var from = ray.from;
    var to = ray.to;

    var l0 = raycast_l0;
    var l1 = raycast_l1;

    // get start and end of the line
    var halfLen = this.length / 2;
    vec2.set(l0, -halfLen, 0);
    vec2.set(l1, halfLen, 0);
    vec2.toGlobalFrame(l0, l0, position, angle);
    vec2.toGlobalFrame(l1, l1, position, angle);

    var fraction = vec2.getLineSegmentsIntersectionFraction(l0, l1, from, to);
    if(fraction >= 0){
        var normal = raycast_normal;
        vec2.rotate(normal, raycast_unit_y, angle); // todo: this should depend on which side the ray comes from
        ray.reportIntersection(result, fraction, normal, -1);
    }
};

/***/ }),

/***/ "./node_modules/p2/src/shapes/Particle.js":
/*!************************************************!*\
  !*** ./node_modules/p2/src/shapes/Particle.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Shape = __webpack_require__(/*! ./Shape */ "./node_modules/p2/src/shapes/Shape.js")
,   vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");

module.exports = Particle;

/**
 * Particle shape class.
 * @class Particle
 * @constructor
 * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
 * @extends Shape
 */
function Particle(options){
    options = options || {};
	options.type = Shape.PARTICLE;
    Shape.call(this, options);
}
Particle.prototype = new Shape();
Particle.prototype.constructor = Particle;

Particle.prototype.computeMomentOfInertia = function(mass){
    return 0; // Can't rotate a particle
};

Particle.prototype.updateBoundingRadius = function(){
    this.boundingRadius = 0;
};

/**
 * @method computeAABB
 * @param  {AABB}   out
 * @param  {Array}  position
 * @param  {Number} angle
 */
Particle.prototype.computeAABB = function(out, position, angle){
    vec2.copy(out.lowerBound, position);
    vec2.copy(out.upperBound, position);
};


/***/ }),

/***/ "./node_modules/p2/src/shapes/Plane.js":
/*!*********************************************!*\
  !*** ./node_modules/p2/src/shapes/Plane.js ***!
  \*********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Shape =  __webpack_require__(/*! ./Shape */ "./node_modules/p2/src/shapes/Shape.js")
,    vec2 =  __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,    Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js");

module.exports = Plane;

/**
 * Plane shape class. The plane is facing in the Y direction.
 * @class Plane
 * @extends Shape
 * @constructor
 * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
 */
function Plane(options){
    options = options || {};
    options.type = Shape.PLANE;
    Shape.call(this, options);
}
Plane.prototype = new Shape();
Plane.prototype.constructor = Plane;

/**
 * Compute moment of inertia
 * @method computeMomentOfInertia
 */
Plane.prototype.computeMomentOfInertia = function(mass){
    return 0; // Plane is infinite. The inertia should therefore be infinty but by convention we set 0 here
};

/**
 * Update the bounding radius
 * @method updateBoundingRadius
 */
Plane.prototype.updateBoundingRadius = function(){
    this.boundingRadius = Number.MAX_VALUE;
};

/**
 * @method computeAABB
 * @param  {AABB}   out
 * @param  {Array}  position
 * @param  {Number} angle
 */
Plane.prototype.computeAABB = function(out, position, angle){
    var a = angle % (2 * Math.PI);
    var set = vec2.set;
    var max = 1e7;
    var lowerBound = out.lowerBound;
    var upperBound = out.upperBound;

    // Set max bounds
    set(lowerBound, -max, -max);
    set(upperBound,  max,  max);

    if(a === 0){
        // y goes from -inf to 0
        upperBound[1] = 0;
        // set(lowerBound, -max, -max);
        // set(upperBound,  max,  0);

    } else if(a === Math.PI / 2){

        // x goes from 0 to inf
        lowerBound[0] = 0;
        // set(lowerBound, 0, -max);
        // set(upperBound,      max,  max);

    } else if(a === Math.PI){

        // y goes from 0 to inf
        lowerBound[1] = 0;
        // set(lowerBound, -max, 0);
        // set(upperBound,  max, max);

    } else if(a === 3*Math.PI/2){

        // x goes from -inf to 0
        upperBound[0] = 0;
        // set(lowerBound, -max,     -max);
        // set(upperBound,  0,  max);

    }
};

Plane.prototype.updateArea = function(){
    this.area = Number.MAX_VALUE;
};

var intersectPlane_planePointToFrom = vec2.create();
var intersectPlane_dir_scaled_with_t = vec2.create();
var intersectPlane_hitPoint = vec2.create();
var intersectPlane_normal = vec2.create();
var intersectPlane_len = vec2.create();

/**
 * @method raycast
 * @param  {RayResult} result
 * @param  {Ray} ray
 * @param  {array} position
 * @param  {number} angle
 */
Plane.prototype.raycast = function(result, ray, position, angle){
    var from = ray.from;
    var to = ray.to;
    var direction = ray.direction;
    var planePointToFrom = intersectPlane_planePointToFrom;
    var dir_scaled_with_t = intersectPlane_dir_scaled_with_t;
    var hitPoint = intersectPlane_hitPoint;
    var normal = intersectPlane_normal;
    var len = intersectPlane_len;

    // Get plane normal
    vec2.set(normal, 0, 1);
    vec2.rotate(normal, normal, angle);

    vec2.sub(len, from, position);
    var planeToFrom = vec2.dot(len, normal);
    vec2.sub(len, to, position);
    var planeToTo = vec2.dot(len, normal);

    if(planeToFrom * planeToTo > 0){
        // "from" and "to" are on the same side of the plane... bail out
        return;
    }

    if(vec2.squaredDistance(from, to) < planeToFrom * planeToFrom){
        return;
    }

    var n_dot_dir = vec2.dot(normal, direction);

    vec2.sub(planePointToFrom, from, position);
    var t = -vec2.dot(normal, planePointToFrom) / n_dot_dir / ray.length;

    ray.reportIntersection(result, t, normal, -1);
};

/***/ }),

/***/ "./node_modules/p2/src/shapes/Shape.js":
/*!*********************************************!*\
  !*** ./node_modules/p2/src/shapes/Shape.js ***!
  \*********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = Shape;

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js");

/**
 * Base class for shapes.
 * @class Shape
 * @constructor
 * @param {object} [options]
 * @param {array} [options.position]
 * @param {number} [options.angle=0]
 * @param {number} [options.collisionGroup=1]
 * @param {number} [options.collisionMask=1]
 * @param {boolean} [options.sensor=false]
 * @param {boolean} [options.collisionResponse=true]
 * @param {object} [options.type=0]
 */
function Shape(options){
    options = options || {};

    /**
     * The body this shape is attached to. A shape can only be attached to a single body.
     * @property {Body} body
     */
    this.body = null;

    /**
     * Body-local position of the shape.
     * @property {Array} position
     */
    this.position = vec2.fromValues(0,0);
    if(options.position){
        vec2.copy(this.position, options.position);
    }

    /**
     * Body-local angle of the shape.
     * @property {number} angle
     */
    this.angle = options.angle || 0;

    /**
     * The type of the shape. One of:
     *
     * * {{#crossLink "Shape/CIRCLE:property"}}Shape.CIRCLE{{/crossLink}}
     * * {{#crossLink "Shape/PARTICLE:property"}}Shape.PARTICLE{{/crossLink}}
     * * {{#crossLink "Shape/PLANE:property"}}Shape.PLANE{{/crossLink}}
     * * {{#crossLink "Shape/CONVEX:property"}}Shape.CONVEX{{/crossLink}}
     * * {{#crossLink "Shape/LINE:property"}}Shape.LINE{{/crossLink}}
     * * {{#crossLink "Shape/BOX:property"}}Shape.BOX{{/crossLink}}
     * * {{#crossLink "Shape/CAPSULE:property"}}Shape.CAPSULE{{/crossLink}}
     * * {{#crossLink "Shape/HEIGHTFIELD:property"}}Shape.HEIGHTFIELD{{/crossLink}}
     *
     * @property {number} type
     */
    this.type = options.type || 0;

    /**
     * Shape object identifier.
     * @type {Number}
     * @property id
     */
    this.id = Shape.idCounter++;

    /**
     * Bounding circle radius of this shape
     * @property boundingRadius
     * @type {Number}
     */
    this.boundingRadius = 0;

    /**
     * Collision group that this shape belongs to (bit mask). See <a href="http://www.aurelienribon.com/blog/2011/07/box2d-tutorial-collision-filtering/">this tutorial</a>.
     * @property collisionGroup
     * @type {Number}
     * @example
     *     // Setup bits for each available group
     *     var PLAYER = Math.pow(2,0),
     *         ENEMY =  Math.pow(2,1),
     *         GROUND = Math.pow(2,2)
     *
     *     // Put shapes into their groups
     *     player1Shape.collisionGroup = PLAYER;
     *     player2Shape.collisionGroup = PLAYER;
     *     enemyShape  .collisionGroup = ENEMY;
     *     groundShape .collisionGroup = GROUND;
     *
     *     // Assign groups that each shape collide with.
     *     // Note that the players can collide with ground and enemies, but not with other players.
     *     player1Shape.collisionMask = ENEMY | GROUND;
     *     player2Shape.collisionMask = ENEMY | GROUND;
     *     enemyShape  .collisionMask = PLAYER | GROUND;
     *     groundShape .collisionMask = PLAYER | ENEMY;
     *
     * @example
     *     // How collision check is done
     *     if(shapeA.collisionGroup & shapeB.collisionMask)!=0 && (shapeB.collisionGroup & shapeA.collisionMask)!=0){
     *         // The shapes will collide
     *     }
     */
    this.collisionGroup = options.collisionGroup !== undefined ? options.collisionGroup : 1;

    /**
     * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled. That means that this shape will move through other body shapes, but it will still trigger contact events, etc.
     * @property {Boolean} collisionResponse
     */
    this.collisionResponse = options.collisionResponse !== undefined ? options.collisionResponse : true;

    /**
     * Collision mask of this shape. See .collisionGroup.
     * @property collisionMask
     * @type {Number}
     */
    this.collisionMask = options.collisionMask !== undefined ? options.collisionMask : 1;

    /**
     * Material to use in collisions for this Shape. If this is set to null, the world will use default material properties instead.
     * @property material
     * @type {Material}
     */
    this.material = options.material || null;

    /**
     * Area of this shape.
     * @property area
     * @type {Number}
     */
    this.area = 0;

    /**
     * Set to true if you want this shape to be a sensor. A sensor does not generate contacts, but it still reports contact events. This is good if you want to know if a shape is overlapping another shape, without them generating contacts.
     * @property {Boolean} sensor
     */
    this.sensor = options.sensor !== undefined ? options.sensor : false;

    if(this.type){
        this.updateBoundingRadius();
    }

    this.updateArea();
}

Shape.idCounter = 0;

/**
 * @static
 * @property {Number} CIRCLE
 */
Shape.CIRCLE =      1;

/**
 * @static
 * @property {Number} PARTICLE
 */
Shape.PARTICLE =    2;

/**
 * @static
 * @property {Number} PLANE
 */
Shape.PLANE =       4;

/**
 * @static
 * @property {Number} CONVEX
 */
Shape.CONVEX =      8;

/**
 * @static
 * @property {Number} LINE
 */
Shape.LINE =        16;

/**
 * @static
 * @property {Number} BOX
 */
Shape.BOX =   32;

Object.defineProperty(Shape, 'RECTANGLE', {
    get: function() {
        console.warn('Shape.RECTANGLE is deprecated, use Shape.BOX instead.');
        return Shape.BOX;
    }
});

/**
 * @static
 * @property {Number} CAPSULE
 */
Shape.CAPSULE =     64;

/**
 * @static
 * @property {Number} HEIGHTFIELD
 */
Shape.HEIGHTFIELD = 128;

/**
 * Should return the moment of inertia around the Z axis of the body given the total mass. See <a href="http://en.wikipedia.org/wiki/List_of_moments_of_inertia">Wikipedia's list of moments of inertia</a>.
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number} If the inertia is infinity or if the object simply isn't possible to rotate, return 0.
 */
Shape.prototype.computeMomentOfInertia = function(mass){};

/**
 * Returns the bounding circle radius of this shape.
 * @method updateBoundingRadius
 * @return {Number}
 */
Shape.prototype.updateBoundingRadius = function(){};

/**
 * Update the .area property of the shape.
 * @method updateArea
 */
Shape.prototype.updateArea = function(){
    // To be implemented in all subclasses
};

/**
 * Compute the world axis-aligned bounding box (AABB) of this shape.
 * @method computeAABB
 * @param  {AABB} out The resulting AABB.
 * @param  {Array} position World position of the shape.
 * @param  {Number} angle World angle of the shape.
 */
Shape.prototype.computeAABB = function(out, position, angle){
    // To be implemented in each subclass
};

/**
 * Perform raycasting on this shape.
 * @method raycast
 * @param  {RayResult} result Where to store the resulting data.
 * @param  {Ray} ray The Ray that you want to use for raycasting.
 * @param  {array} position World position of the shape (the .position property will be ignored).
 * @param  {number} angle World angle of the shape (the .angle property will be ignored).
 */
Shape.prototype.raycast = function(result, ray, position, angle){
    // To be implemented in each subclass
};

/***/ }),

/***/ "./node_modules/p2/src/solver/GSSolver.js":
/*!************************************************!*\
  !*** ./node_modules/p2/src/solver/GSSolver.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,   Solver = __webpack_require__(/*! ./Solver */ "./node_modules/p2/src/solver/Solver.js")
,   Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js")
,   FrictionEquation = __webpack_require__(/*! ../equations/FrictionEquation */ "./node_modules/p2/src/equations/FrictionEquation.js");

module.exports = GSSolver;

/**
 * Iterative Gauss-Seidel constraint equation solver.
 *
 * @class GSSolver
 * @constructor
 * @extends Solver
 * @param {Object} [options]
 * @param {Number} [options.iterations=10]
 * @param {Number} [options.tolerance=0]
 */
function GSSolver(options){
    Solver.call(this,options,Solver.GS);
    options = options || {};

    /**
     * The max number of iterations to do when solving. More gives better results, but is more expensive.
     * @property iterations
     * @type {Number}
     */
    this.iterations = options.iterations || 10;

    /**
     * The error tolerance, per constraint. If the total error is below this limit, the solver will stop iterating. Set to zero for as good solution as possible, but to something larger than zero to make computations faster.
     * @property tolerance
     * @type {Number}
     * @default 1e-7
     */
    this.tolerance = options.tolerance || 1e-7;

    this.arrayStep = 30;
    this.lambda = new Utils.ARRAY_TYPE(this.arrayStep);
    this.Bs =     new Utils.ARRAY_TYPE(this.arrayStep);
    this.invCs =  new Utils.ARRAY_TYPE(this.arrayStep);

    /**
     * Set to true to set all right hand side terms to zero when solving. Can be handy for a few applications.
     * @property useZeroRHS
     * @type {Boolean}
     * @todo Remove, not used
     */
    this.useZeroRHS = false;

    /**
     * Number of solver iterations that are used to approximate normal forces used for friction (F_friction = mu * F_normal). These friction forces will override any other friction forces that are set. If you set frictionIterations = 0, then this feature will be disabled.
     *
     * Use only frictionIterations > 0 if the approximated normal force (F_normal = mass * gravity) is not good enough. Examples of where it can happen is in space games where gravity is zero, or in tall stacks where the normal force is large at bottom but small at top.
     *
     * @property frictionIterations
     * @type {Number}
     * @default 0
     */
    this.frictionIterations = options.frictionIterations !== undefined ? 0 : options.frictionIterations;

    /**
     * The number of iterations that were made during the last solve. If .tolerance is zero, this value will always be equal to .iterations, but if .tolerance is larger than zero, and the solver can quit early, then this number will be somewhere between 1 and .iterations.
     * @property {Number} usedIterations
     */
    this.usedIterations = 0;
}
GSSolver.prototype = new Solver();
GSSolver.prototype.constructor = GSSolver;

function setArrayZero(array){
    var l = array.length;
    while(l--){
        array[l] = +0.0;
    }
}

/**
 * Solve the system of equations
 * @method solve
 * @param  {Number}  h       Time step
 * @param  {World}   world    World to solve
 */
GSSolver.prototype.solve = function(h, world){

    this.sortEquations();

    var iter = 0,
        maxIter = this.iterations,
        maxFrictionIter = this.frictionIterations,
        equations = this.equations,
        Neq = equations.length,
        tolSquared = Math.pow(this.tolerance*Neq, 2),
        bodies = world.bodies,
        Nbodies = world.bodies.length,
        add = vec2.add,
        set = vec2.set,
        useZeroRHS = this.useZeroRHS,
        lambda = this.lambda;

    this.usedIterations = 0;

    if(Neq){
        for(var i=0; i!==Nbodies; i++){
            var b = bodies[i];

            // Update solve mass
            b.updateSolveMassProperties();
        }
    }

    // Things that does not change during iteration can be computed once
    if(lambda.length < Neq){
        lambda = this.lambda =  new Utils.ARRAY_TYPE(Neq + this.arrayStep);
        this.Bs =               new Utils.ARRAY_TYPE(Neq + this.arrayStep);
        this.invCs =            new Utils.ARRAY_TYPE(Neq + this.arrayStep);
    }
    setArrayZero(lambda);
    var invCs = this.invCs,
        Bs = this.Bs,
        lambda = this.lambda;

    for(var i=0; i!==equations.length; i++){
        var c = equations[i];
        if(c.timeStep !== h || c.needsUpdate){
            c.timeStep = h;
            c.update();
        }
        Bs[i] =     c.computeB(c.a,c.b,h);
        invCs[i] =  c.computeInvC(c.epsilon);
    }

    var q, B, c, deltalambdaTot,i,j;

    if(Neq !== 0){

        for(i=0; i!==Nbodies; i++){
            var b = bodies[i];

            // Reset vlambda
            b.resetConstraintVelocity();
        }

        if(maxFrictionIter){
            // Iterate over contact equations to get normal forces
            for(iter=0; iter!==maxFrictionIter; iter++){

                // Accumulate the total error for each iteration.
                deltalambdaTot = 0.0;

                for(j=0; j!==Neq; j++){
                    c = equations[j];

                    var deltalambda = GSSolver.iterateEquation(j,c,c.epsilon,Bs,invCs,lambda,useZeroRHS,h,iter);
                    deltalambdaTot += Math.abs(deltalambda);
                }

                this.usedIterations++;

                // If the total error is small enough - stop iterate
                if(deltalambdaTot*deltalambdaTot <= tolSquared){
                    break;
                }
            }

            GSSolver.updateMultipliers(equations, lambda, 1/h);

            // Set computed friction force
            for(j=0; j!==Neq; j++){
                var eq = equations[j];
                if(eq instanceof FrictionEquation){
                    var f = 0.0;
                    for(var k=0; k!==eq.contactEquations.length; k++){
                        f += eq.contactEquations[k].multiplier;
                    }
                    f *= eq.frictionCoefficient / eq.contactEquations.length;
                    eq.maxForce =  f;
                    eq.minForce = -f;
                }
            }
        }

        // Iterate over all equations
        for(iter=0; iter!==maxIter; iter++){

            // Accumulate the total error for each iteration.
            deltalambdaTot = 0.0;

            for(j=0; j!==Neq; j++){
                c = equations[j];

                var deltalambda = GSSolver.iterateEquation(j,c,c.epsilon,Bs,invCs,lambda,useZeroRHS,h,iter);
                deltalambdaTot += Math.abs(deltalambda);
            }

            this.usedIterations++;

            // If the total error is small enough - stop iterate
            if(deltalambdaTot*deltalambdaTot <= tolSquared){
                break;
            }
        }

        // Add result to velocity
        for(i=0; i!==Nbodies; i++){
            bodies[i].addConstraintVelocity();
        }

        GSSolver.updateMultipliers(equations, lambda, 1/h);
    }
};

// Sets the .multiplier property of each equation
GSSolver.updateMultipliers = function(equations, lambda, invDt){
    // Set the .multiplier property of each equation
    var l = equations.length;
    while(l--){
        equations[l].multiplier = lambda[l] * invDt;
    }
};

GSSolver.iterateEquation = function(j,eq,eps,Bs,invCs,lambda,useZeroRHS,dt,iter){
    // Compute iteration
    var B = Bs[j],
        invC = invCs[j],
        lambdaj = lambda[j],
        GWlambda = eq.computeGWlambda();

    var maxForce = eq.maxForce,
        minForce = eq.minForce;

    if(useZeroRHS){
        B = 0;
    }

    var deltalambda = invC * ( B - GWlambda - eps * lambdaj );

    // Clamp if we are not within the min/max interval
    var lambdaj_plus_deltalambda = lambdaj + deltalambda;
    if(lambdaj_plus_deltalambda < minForce*dt){
        deltalambda = minForce*dt - lambdaj;
    } else if(lambdaj_plus_deltalambda > maxForce*dt){
        deltalambda = maxForce*dt - lambdaj;
    }
    lambda[j] += deltalambda;
    eq.addToWlambda(deltalambda);

    return deltalambda;
};


/***/ }),

/***/ "./node_modules/p2/src/solver/Solver.js":
/*!**********************************************!*\
  !*** ./node_modules/p2/src/solver/Solver.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js")
,   EventEmitter = __webpack_require__(/*! ../events/EventEmitter */ "./node_modules/p2/src/events/EventEmitter.js");

module.exports = Solver;

/**
 * Base class for constraint solvers.
 * @class Solver
 * @constructor
 * @extends EventEmitter
 */
function Solver(options,type){
    options = options || {};

    EventEmitter.call(this);

    this.type = type;

    /**
     * Current equations in the solver.
     *
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * Function that is used to sort all equations before each solve.
     * @property equationSortFunction
     * @type {function|boolean}
     */
    this.equationSortFunction = options.equationSortFunction || false;
}
Solver.prototype = new EventEmitter();
Solver.prototype.constructor = Solver;

/**
 * Method to be implemented in each subclass
 * @method solve
 * @param  {Number} dt
 * @param  {World} world
 */
Solver.prototype.solve = function(dt,world){
    throw new Error("Solver.solve should be implemented by subclasses!");
};

var mockWorld = {bodies:[]};

/**
 * Solves all constraints in an island.
 * @method solveIsland
 * @param  {Number} dt
 * @param  {Island} island
 */
Solver.prototype.solveIsland = function(dt,island){

    this.removeAllEquations();

    if(island.equations.length){
        // Add equations to solver
        this.addEquations(island.equations);
        mockWorld.bodies.length = 0;
        island.getBodies(mockWorld.bodies);

        // Solve
        if(mockWorld.bodies.length){
            this.solve(dt,mockWorld);
        }
    }
};

/**
 * Sort all equations using the .equationSortFunction. Should be called by subclasses before solving.
 * @method sortEquations
 */
Solver.prototype.sortEquations = function(){
    if(this.equationSortFunction){
        this.equations.sort(this.equationSortFunction);
    }
};

/**
 * Add an equation to be solved.
 *
 * @method addEquation
 * @param {Equation} eq
 */
Solver.prototype.addEquation = function(eq){
    if(eq.enabled){
        this.equations.push(eq);
    }
};

/**
 * Add equations. Same as .addEquation, but this time the argument is an array of Equations
 *
 * @method addEquations
 * @param {Array} eqs
 */
Solver.prototype.addEquations = function(eqs){
    //Utils.appendArray(this.equations,eqs);
    for(var i=0, N=eqs.length; i!==N; i++){
        var eq = eqs[i];
        if(eq.enabled){
            this.equations.push(eq);
        }
    }
};

/**
 * Remove an equation.
 *
 * @method removeEquation
 * @param {Equation} eq
 */
Solver.prototype.removeEquation = function(eq){
    var i = this.equations.indexOf(eq);
    if(i !== -1){
        this.equations.splice(i,1);
    }
};

/**
 * Remove all currently added equations.
 *
 * @method removeAllEquations
 */
Solver.prototype.removeAllEquations = function(){
    this.equations.length=0;
};

Solver.GS = 1;
Solver.ISLAND = 2;


/***/ }),

/***/ "./node_modules/p2/src/utils/ContactEquationPool.js":
/*!**********************************************************!*\
  !*** ./node_modules/p2/src/utils/ContactEquationPool.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var ContactEquation = __webpack_require__(/*! ../equations/ContactEquation */ "./node_modules/p2/src/equations/ContactEquation.js");
var Pool = __webpack_require__(/*! ./Pool */ "./node_modules/p2/src/utils/Pool.js");

module.exports = ContactEquationPool;

/**
 * @class
 */
function ContactEquationPool() {
	Pool.apply(this, arguments);
}
ContactEquationPool.prototype = new Pool();
ContactEquationPool.prototype.constructor = ContactEquationPool;

/**
 * @method create
 * @return {ContactEquation}
 */
ContactEquationPool.prototype.create = function () {
	return new ContactEquation();
};

/**
 * @method destroy
 * @param {ContactEquation} equation
 * @return {ContactEquationPool}
 */
ContactEquationPool.prototype.destroy = function (equation) {
	equation.bodyA = equation.bodyB = null;
	return this;
};


/***/ }),

/***/ "./node_modules/p2/src/utils/FrictionEquationPool.js":
/*!***********************************************************!*\
  !*** ./node_modules/p2/src/utils/FrictionEquationPool.js ***!
  \***********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var FrictionEquation = __webpack_require__(/*! ../equations/FrictionEquation */ "./node_modules/p2/src/equations/FrictionEquation.js");
var Pool = __webpack_require__(/*! ./Pool */ "./node_modules/p2/src/utils/Pool.js");

module.exports = FrictionEquationPool;

/**
 * @class
 */
function FrictionEquationPool() {
	Pool.apply(this, arguments);
}
FrictionEquationPool.prototype = new Pool();
FrictionEquationPool.prototype.constructor = FrictionEquationPool;

/**
 * @method create
 * @return {FrictionEquation}
 */
FrictionEquationPool.prototype.create = function () {
	return new FrictionEquation();
};

/**
 * @method destroy
 * @param {FrictionEquation} equation
 * @return {FrictionEquationPool}
 */
FrictionEquationPool.prototype.destroy = function (equation) {
	equation.bodyA = equation.bodyB = null;
	return this;
};


/***/ }),

/***/ "./node_modules/p2/src/utils/IslandNodePool.js":
/*!*****************************************************!*\
  !*** ./node_modules/p2/src/utils/IslandNodePool.js ***!
  \*****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var IslandNode = __webpack_require__(/*! ../world/IslandNode */ "./node_modules/p2/src/world/IslandNode.js");
var Pool = __webpack_require__(/*! ./Pool */ "./node_modules/p2/src/utils/Pool.js");

module.exports = IslandNodePool;

/**
 * @class
 */
function IslandNodePool() {
	Pool.apply(this, arguments);
}
IslandNodePool.prototype = new Pool();
IslandNodePool.prototype.constructor = IslandNodePool;

/**
 * @method create
 * @return {IslandNode}
 */
IslandNodePool.prototype.create = function () {
	return new IslandNode();
};

/**
 * @method destroy
 * @param {IslandNode} node
 * @return {IslandNodePool}
 */
IslandNodePool.prototype.destroy = function (node) {
	node.reset();
	return this;
};


/***/ }),

/***/ "./node_modules/p2/src/utils/IslandPool.js":
/*!*************************************************!*\
  !*** ./node_modules/p2/src/utils/IslandPool.js ***!
  \*************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Island = __webpack_require__(/*! ../world/Island */ "./node_modules/p2/src/world/Island.js");
var Pool = __webpack_require__(/*! ./Pool */ "./node_modules/p2/src/utils/Pool.js");

module.exports = IslandPool;

/**
 * @class
 */
function IslandPool() {
	Pool.apply(this, arguments);
}
IslandPool.prototype = new Pool();
IslandPool.prototype.constructor = IslandPool;

/**
 * @method create
 * @return {Island}
 */
IslandPool.prototype.create = function () {
	return new Island();
};

/**
 * @method destroy
 * @param {Island} island
 * @return {IslandPool}
 */
IslandPool.prototype.destroy = function (island) {
	island.reset();
	return this;
};


/***/ }),

/***/ "./node_modules/p2/src/utils/OverlapKeeper.js":
/*!****************************************************!*\
  !*** ./node_modules/p2/src/utils/OverlapKeeper.js ***!
  \****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var TupleDictionary = __webpack_require__(/*! ./TupleDictionary */ "./node_modules/p2/src/utils/TupleDictionary.js");
var OverlapKeeperRecord = __webpack_require__(/*! ./OverlapKeeperRecord */ "./node_modules/p2/src/utils/OverlapKeeperRecord.js");
var OverlapKeeperRecordPool = __webpack_require__(/*! ./OverlapKeeperRecordPool */ "./node_modules/p2/src/utils/OverlapKeeperRecordPool.js");
var Utils = __webpack_require__(/*! ./Utils */ "./node_modules/p2/src/utils/Utils.js");

module.exports = OverlapKeeper;

/**
 * Keeps track of overlaps in the current state and the last step state.
 * @class OverlapKeeper
 * @constructor
 */
function OverlapKeeper() {
    this.overlappingShapesLastState = new TupleDictionary();
    this.overlappingShapesCurrentState = new TupleDictionary();
    this.recordPool = new OverlapKeeperRecordPool({ size: 16 });
    this.tmpDict = new TupleDictionary();
    this.tmpArray1 = [];
}

/**
 * Ticks one step forward in time. This will move the current overlap state to the "old" overlap state, and create a new one as current.
 * @method tick
 */
OverlapKeeper.prototype.tick = function() {
    var last = this.overlappingShapesLastState;
    var current = this.overlappingShapesCurrentState;

    // Save old objects into pool
    var l = last.keys.length;
    while(l--){
        var key = last.keys[l];
        var lastObject = last.getByKey(key);
        var currentObject = current.getByKey(key);
        if(lastObject){
            // The record is only used in the "last" dict, and will be removed. We might as well pool it.
            this.recordPool.release(lastObject);
        }
    }

    // Clear last object
    last.reset();

    // Transfer from new object to old
    last.copy(current);

    // Clear current object
    current.reset();
};

/**
 * @method setOverlapping
 * @param {Body} bodyA
 * @param {Body} shapeA
 * @param {Body} bodyB
 * @param {Body} shapeB
 */
OverlapKeeper.prototype.setOverlapping = function(bodyA, shapeA, bodyB, shapeB) {
    var last = this.overlappingShapesLastState;
    var current = this.overlappingShapesCurrentState;

    // Store current contact state
    if(!current.get(shapeA.id, shapeB.id)){
        var data = this.recordPool.get();
        data.set(bodyA, shapeA, bodyB, shapeB);
        current.set(shapeA.id, shapeB.id, data);
    }
};

OverlapKeeper.prototype.getNewOverlaps = function(result){
    return this.getDiff(this.overlappingShapesLastState, this.overlappingShapesCurrentState, result);
};

OverlapKeeper.prototype.getEndOverlaps = function(result){
    return this.getDiff(this.overlappingShapesCurrentState, this.overlappingShapesLastState, result);
};

/**
 * Checks if two bodies are currently overlapping.
 * @method bodiesAreOverlapping
 * @param  {Body} bodyA
 * @param  {Body} bodyB
 * @return {boolean}
 */
OverlapKeeper.prototype.bodiesAreOverlapping = function(bodyA, bodyB){
    var current = this.overlappingShapesCurrentState;
    var l = current.keys.length;
    while(l--){
        var key = current.keys[l];
        var data = current.data[key];
        if((data.bodyA === bodyA && data.bodyB === bodyB) || data.bodyA === bodyB && data.bodyB === bodyA){
            return true;
        }
    }
    return false;
};

OverlapKeeper.prototype.getDiff = function(dictA, dictB, result){
    var result = result || [];
    var last = dictA;
    var current = dictB;

    result.length = 0;

    var l = current.keys.length;
    while(l--){
        var key = current.keys[l];
        var data = current.data[key];

        if(!data){
            throw new Error('Key '+key+' had no data!');
        }

        var lastData = last.data[key];
        if(!lastData){
            // Not overlapping in last state, but in current.
            result.push(data);
        }
    }

    return result;
};

OverlapKeeper.prototype.isNewOverlap = function(shapeA, shapeB){
    var idA = shapeA.id|0,
        idB = shapeB.id|0;
    var last = this.overlappingShapesLastState;
    var current = this.overlappingShapesCurrentState;
    // Not in last but in new
    return !!!last.get(idA, idB) && !!current.get(idA, idB);
};

OverlapKeeper.prototype.getNewBodyOverlaps = function(result){
    this.tmpArray1.length = 0;
    var overlaps = this.getNewOverlaps(this.tmpArray1);
    return this.getBodyDiff(overlaps, result);
};

OverlapKeeper.prototype.getEndBodyOverlaps = function(result){
    this.tmpArray1.length = 0;
    var overlaps = this.getEndOverlaps(this.tmpArray1);
    return this.getBodyDiff(overlaps, result);
};

OverlapKeeper.prototype.getBodyDiff = function(overlaps, result){
    result = result || [];
    var accumulator = this.tmpDict;

    var l = overlaps.length;

    while(l--){
        var data = overlaps[l];

        // Since we use body id's for the accumulator, these will be a subset of the original one
        accumulator.set(data.bodyA.id|0, data.bodyB.id|0, data);
    }

    l = accumulator.keys.length;
    while(l--){
        var data = accumulator.getByKey(accumulator.keys[l]);
        if(data){
            result.push(data.bodyA, data.bodyB);
        }
    }

    accumulator.reset();

    return result;
};


/***/ }),

/***/ "./node_modules/p2/src/utils/OverlapKeeperRecord.js":
/*!**********************************************************!*\
  !*** ./node_modules/p2/src/utils/OverlapKeeperRecord.js ***!
  \**********************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = OverlapKeeperRecord;

/**
 * Overlap data container for the OverlapKeeper
 * @class OverlapKeeperRecord
 * @constructor
 * @param {Body} bodyA
 * @param {Shape} shapeA
 * @param {Body} bodyB
 * @param {Shape} shapeB
 */
function OverlapKeeperRecord(bodyA, shapeA, bodyB, shapeB){
    /**
     * @property {Shape} shapeA
     */
    this.shapeA = shapeA;
    /**
     * @property {Shape} shapeB
     */
    this.shapeB = shapeB;
    /**
     * @property {Body} bodyA
     */
    this.bodyA = bodyA;
    /**
     * @property {Body} bodyB
     */
    this.bodyB = bodyB;
}

/**
 * Set the data for the record
 * @method set
 * @param {Body} bodyA
 * @param {Shape} shapeA
 * @param {Body} bodyB
 * @param {Shape} shapeB
 */
OverlapKeeperRecord.prototype.set = function(bodyA, shapeA, bodyB, shapeB){
    OverlapKeeperRecord.call(this, bodyA, shapeA, bodyB, shapeB);
};


/***/ }),

/***/ "./node_modules/p2/src/utils/OverlapKeeperRecordPool.js":
/*!**************************************************************!*\
  !*** ./node_modules/p2/src/utils/OverlapKeeperRecordPool.js ***!
  \**************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var OverlapKeeperRecord = __webpack_require__(/*! ./OverlapKeeperRecord */ "./node_modules/p2/src/utils/OverlapKeeperRecord.js");
var Pool = __webpack_require__(/*! ./Pool */ "./node_modules/p2/src/utils/Pool.js");

module.exports = OverlapKeeperRecordPool;

/**
 * @class
 */
function OverlapKeeperRecordPool() {
	Pool.apply(this, arguments);
}
OverlapKeeperRecordPool.prototype = new Pool();
OverlapKeeperRecordPool.prototype.constructor = OverlapKeeperRecordPool;

/**
 * @method create
 * @return {OverlapKeeperRecord}
 */
OverlapKeeperRecordPool.prototype.create = function () {
	return new OverlapKeeperRecord();
};

/**
 * @method destroy
 * @param {OverlapKeeperRecord} record
 * @return {OverlapKeeperRecordPool}
 */
OverlapKeeperRecordPool.prototype.destroy = function (record) {
	record.bodyA = record.bodyB = record.shapeA = record.shapeB = null;
	return this;
};


/***/ }),

/***/ "./node_modules/p2/src/utils/Pool.js":
/*!*******************************************!*\
  !*** ./node_modules/p2/src/utils/Pool.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = Pool;

/**
 * @class Object pooling utility.
 */
function Pool(options) {
	options = options || {};

	/**
	 * @property {Array} objects
	 * @type {Array}
	 */
	this.objects = [];

	if(options.size !== undefined){
		this.resize(options.size);
	}
}

/**
 * @method resize
 * @param {number} size
 * @return {Pool} Self, for chaining
 */
Pool.prototype.resize = function (size) {
	var objects = this.objects;

	while (objects.length > size) {
		objects.pop();
	}

	while (objects.length < size) {
		objects.push(this.create());
	}

	return this;
};

/**
 * Get an object from the pool or create a new instance.
 * @method get
 * @return {Object}
 */
Pool.prototype.get = function () {
	var objects = this.objects;
	return objects.length ? objects.pop() : this.create();
};

/**
 * Clean up and put the object back into the pool for later use.
 * @method release
 * @param {Object} object
 * @return {Pool} Self for chaining
 */
Pool.prototype.release = function (object) {
	this.destroy(object);
	this.objects.push(object);
	return this;
};


/***/ }),

/***/ "./node_modules/p2/src/utils/TupleDictionary.js":
/*!******************************************************!*\
  !*** ./node_modules/p2/src/utils/TupleDictionary.js ***!
  \******************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Utils = __webpack_require__(/*! ./Utils */ "./node_modules/p2/src/utils/Utils.js");

module.exports = TupleDictionary;

/**
 * @class TupleDictionary
 * @constructor
 */
function TupleDictionary() {

    /**
     * The data storage
     * @property data
     * @type {Object}
     */
    this.data = {};

    /**
     * Keys that are currently used.
     * @property {Array} keys
     */
    this.keys = [];
}

/**
 * Generate a key given two integers
 * @method getKey
 * @param  {number} i
 * @param  {number} j
 * @return {string}
 */
TupleDictionary.prototype.getKey = function(id1, id2) {
    id1 = id1|0;
    id2 = id2|0;

    if ( (id1|0) === (id2|0) ){
        return -1;
    }

    // valid for values < 2^16
    return ((id1|0) > (id2|0) ?
        (id1 << 16) | (id2 & 0xFFFF) :
        (id2 << 16) | (id1 & 0xFFFF))|0
        ;
};

/**
 * @method getByKey
 * @param  {Number} key
 * @return {Object}
 */
TupleDictionary.prototype.getByKey = function(key) {
    key = key|0;
    return this.data[key];
};

/**
 * @method get
 * @param  {Number} i
 * @param  {Number} j
 * @return {Number}
 */
TupleDictionary.prototype.get = function(i, j) {
    return this.data[this.getKey(i, j)];
};

/**
 * Set a value.
 * @method set
 * @param  {Number} i
 * @param  {Number} j
 * @param {Number} value
 */
TupleDictionary.prototype.set = function(i, j, value) {
    if(!value){
        throw new Error("No data!");
    }

    var key = this.getKey(i, j);

    // Check if key already exists
    if(!this.data[key]){
        this.keys.push(key);
    }

    this.data[key] = value;

    return key;
};

/**
 * Remove all data.
 * @method reset
 */
TupleDictionary.prototype.reset = function() {
    var data = this.data,
        keys = this.keys;

    var l = keys.length;
    while(l--) {
        delete data[keys[l]];
    }

    keys.length = 0;
};

/**
 * Copy another TupleDictionary. Note that all data in this dictionary will be removed.
 * @method copy
 * @param {TupleDictionary} dict The TupleDictionary to copy into this one.
 */
TupleDictionary.prototype.copy = function(dict) {
    this.reset();
    Utils.appendArray(this.keys, dict.keys);
    var l = dict.keys.length;
    while(l--){
        var key = dict.keys[l];
        this.data[key] = dict.data[key];
    }
};


/***/ }),

/***/ "./node_modules/p2/src/utils/Utils.js":
/*!********************************************!*\
  !*** ./node_modules/p2/src/utils/Utils.js ***!
  \********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

/* global P2_ARRAY_TYPE */

module.exports = Utils;

/**
 * Misc utility functions
 * @class Utils
 * @constructor
 */
function Utils(){}

/**
 * Append the values in array b to the array a. See <a href="http://stackoverflow.com/questions/1374126/how-to-append-an-array-to-an-existing-javascript-array/1374131#1374131">this</a> for an explanation.
 * @method appendArray
 * @static
 * @param  {Array} a
 * @param  {Array} b
 */
Utils.appendArray = function(a,b){
    if (b.length < 150000) {
        a.push.apply(a, b);
    } else {
        for (var i = 0, len = b.length; i !== len; ++i) {
            a.push(b[i]);
        }
    }
};

/**
 * Garbage free Array.splice(). Does not allocate a new array.
 * @method splice
 * @static
 * @param  {Array} array
 * @param  {Number} index
 * @param  {Number} howmany
 */
Utils.splice = function(array,index,howmany){
    howmany = howmany || 1;
    for (var i=index, len=array.length-howmany; i < len; i++){
        array[i] = array[i + howmany];
    }
    array.length = len;
};

/**
 * The array type to use for internal numeric computations throughout the library. Float32Array is used if it is available, but falls back on Array. If you want to set array type manually, inject it via the global variable P2_ARRAY_TYPE. See example below.
 * @static
 * @property {function} ARRAY_TYPE
 * @example
 *     <script>
 *         <!-- Inject your preferred array type before loading p2.js -->
 *         P2_ARRAY_TYPE = Array;
 *     </script>
 *     <script src="p2.js"></script>
 */
if(typeof P2_ARRAY_TYPE !== 'undefined') {
    Utils.ARRAY_TYPE = P2_ARRAY_TYPE;
} else if (typeof Float32Array !== 'undefined'){
    Utils.ARRAY_TYPE = Float32Array;
} else {
    Utils.ARRAY_TYPE = Array;
}

/**
 * Extend an object with the properties of another
 * @static
 * @method extend
 * @param  {object} a
 * @param  {object} b
 */
Utils.extend = function(a,b){
    for(var key in b){
        a[key] = b[key];
    }
};

/**
 * Extend an options object with default values.
 * @static
 * @method defaults
 * @param  {object} options The options object. May be falsy: in this case, a new object is created and returned.
 * @param  {object} defaults An object containing default values.
 * @return {object} The modified options object.
 */
Utils.defaults = function(options, defaults){
    options = options || {};
    for(var key in defaults){
        if(!(key in options)){
            options[key] = defaults[key];
        }
    }
    return options;
};


/***/ }),

/***/ "./node_modules/p2/src/world/Island.js":
/*!*********************************************!*\
  !*** ./node_modules/p2/src/world/Island.js ***!
  \*********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Body = __webpack_require__(/*! ../objects/Body */ "./node_modules/p2/src/objects/Body.js");

module.exports = Island;

/**
 * An island of bodies connected with equations.
 * @class Island
 * @constructor
 */
function Island(){

    /**
     * Current equations in this island.
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * Current bodies in this island.
     * @property bodies
     * @type {Array}
     */
    this.bodies = [];
}

/**
 * Clean this island from bodies and equations.
 * @method reset
 */
Island.prototype.reset = function(){
    this.equations.length = this.bodies.length = 0;
};

var bodyIds = [];

/**
 * Get all unique bodies in this island.
 * @method getBodies
 * @return {Array} An array of Body
 */
Island.prototype.getBodies = function(result){
    var bodies = result || [],
        eqs = this.equations;
    bodyIds.length = 0;
    for(var i=0; i!==eqs.length; i++){
        var eq = eqs[i];
        if(bodyIds.indexOf(eq.bodyA.id)===-1){
            bodies.push(eq.bodyA);
            bodyIds.push(eq.bodyA.id);
        }
        if(bodyIds.indexOf(eq.bodyB.id)===-1){
            bodies.push(eq.bodyB);
            bodyIds.push(eq.bodyB.id);
        }
    }
    return bodies;
};

/**
 * Check if the entire island wants to sleep.
 * @method wantsToSleep
 * @return {Boolean}
 */
Island.prototype.wantsToSleep = function(){
    for(var i=0; i<this.bodies.length; i++){
        var b = this.bodies[i];
        if(b.type === Body.DYNAMIC && !b.wantsToSleep){
            return false;
        }
    }
    return true;
};

/**
 * Make all bodies in the island sleep.
 * @method sleep
 */
Island.prototype.sleep = function(){
    for(var i=0; i<this.bodies.length; i++){
        var b = this.bodies[i];
        b.sleep();
    }
    return true;
};


/***/ }),

/***/ "./node_modules/p2/src/world/IslandManager.js":
/*!****************************************************!*\
  !*** ./node_modules/p2/src/world/IslandManager.js ***!
  \****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,   Island = __webpack_require__(/*! ./Island */ "./node_modules/p2/src/world/Island.js")
,   IslandNode = __webpack_require__(/*! ./IslandNode */ "./node_modules/p2/src/world/IslandNode.js")
,   IslandNodePool = __webpack_require__(/*! ./../utils/IslandNodePool */ "./node_modules/p2/src/utils/IslandNodePool.js")
,   IslandPool = __webpack_require__(/*! ./../utils/IslandPool */ "./node_modules/p2/src/utils/IslandPool.js")
,   Body = __webpack_require__(/*! ../objects/Body */ "./node_modules/p2/src/objects/Body.js");

module.exports = IslandManager;

/**
 * Splits the system of bodies and equations into independent islands
 *
 * @class IslandManager
 * @constructor
 * @param {Object} [options]
 * @extends Solver
 */
function IslandManager(options){

    /**
     * @property nodePool
     * @type {IslandNodePool}
     */
    this.nodePool = new IslandNodePool({ size: 16 });

    /**
     * @property islandPool
     * @type {IslandPool}
     */
    this.islandPool = new IslandPool({ size: 8 });

    /**
     * The equations to split. Manually fill this array before running .split().
     * @property {Array} equations
     */
    this.equations = [];

    /**
     * The resulting {{#crossLink "Island"}}{{/crossLink}}s.
     * @property {Array} islands
     */
    this.islands = [];

    /**
     * The resulting graph nodes.
     * @property {Array} nodes
     */
    this.nodes = [];

    /**
     * The node queue, used when traversing the graph of nodes.
     * @private
     * @property {Array} queue
     */
    this.queue = [];
}

/**
 * Get an unvisited node from a list of nodes.
 * @static
 * @method getUnvisitedNode
 * @param  {Array} nodes
 * @return {IslandNode|boolean} The node if found, else false.
 */
IslandManager.getUnvisitedNode = function(nodes){
    var Nnodes = nodes.length;
    for(var i=0; i!==Nnodes; i++){
        var node = nodes[i];
        if(!node.visited && node.body.type === Body.DYNAMIC){
            return node;
        }
    }
    return false;
};

/**
 * Visit a node.
 * @method visit
 * @param  {IslandNode} node
 * @param  {Array} bds
 * @param  {Array} eqs
 */
IslandManager.prototype.visit = function (node,bds,eqs){
    bds.push(node.body);
    var Neqs = node.equations.length;
    for(var i=0; i!==Neqs; i++){
        var eq = node.equations[i];
        if(eqs.indexOf(eq) === -1){ // Already added?
            eqs.push(eq);
        }
    }
};

/**
 * Runs the search algorithm, starting at a root node. The resulting bodies and equations will be stored in the provided arrays.
 * @method bfs
 * @param  {IslandNode} root The node to start from
 * @param  {Array} bds  An array to append resulting Bodies to.
 * @param  {Array} eqs  An array to append resulting Equations to.
 */
IslandManager.prototype.bfs = function(root,bds,eqs){

    // Reset the visit queue
    var queue = this.queue;
    queue.length = 0;

    // Add root node to queue
    queue.push(root);
    root.visited = true;
    this.visit(root,bds,eqs);

    // Process all queued nodes
    while(queue.length) {

        // Get next node in the queue
        var node = queue.pop();

        // Visit unvisited neighboring nodes
        var child;
        while((child = IslandManager.getUnvisitedNode(node.neighbors))) {
            child.visited = true;
            this.visit(child,bds,eqs);

            // Only visit the children of this node if it's dynamic
            if(child.body.type === Body.DYNAMIC){
                queue.push(child);
            }
        }
    }
};

/**
 * Split the world into independent islands. The result is stored in .islands.
 * @method split
 * @param  {World} world
 * @return {Array} The generated islands
 */
IslandManager.prototype.split = function(world){
    var bodies = world.bodies,
        nodes = this.nodes,
        equations = this.equations;

    // Move old nodes to the node pool
    while(nodes.length){
        this.nodePool.release(nodes.pop());
    }

    // Create needed nodes, reuse if possible
    for(var i=0; i!==bodies.length; i++){
        var node = this.nodePool.get();
        node.body = bodies[i];
        nodes.push(node);
        // if(this.nodePool.length){
        //     var node = this.nodePool.pop();
        //     node.reset();
        //     node.body = bodies[i];
        //     nodes.push(node);
        // } else {
        //     nodes.push(new IslandNode(bodies[i]));
        // }
    }

    // Add connectivity data. Each equation connects 2 bodies.
    for(var k=0; k!==equations.length; k++){
        var eq=equations[k],
            i=bodies.indexOf(eq.bodyA),
            j=bodies.indexOf(eq.bodyB),
            ni=nodes[i],
            nj=nodes[j];
        ni.neighbors.push(nj);
        nj.neighbors.push(ni);
        ni.equations.push(eq);
        nj.equations.push(eq);
    }

    // Move old islands to the island pool
    var islands = this.islands;
    for(var i=0; i<islands.length; i++){
        this.islandPool.release(islands[i]);
    }
    islands.length = 0;

    // Get islands
    var child;
    while((child = IslandManager.getUnvisitedNode(nodes))){

        // Create new island
        var island = this.islandPool.get();

        // Get all equations and bodies in this island
        this.bfs(child, island.bodies, island.equations);

        islands.push(island);
    }

    return islands;
};


/***/ }),

/***/ "./node_modules/p2/src/world/IslandNode.js":
/*!*************************************************!*\
  !*** ./node_modules/p2/src/world/IslandNode.js ***!
  \*************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = IslandNode;

/**
 * Holds a body and keeps track of some additional properties needed for graph traversal.
 * @class IslandNode
 * @constructor
 * @param {Body} body
 */
function IslandNode(body){

	/**
	 * The body that is contained in this node.
	 * @property {Body} body
	 */
    this.body = body;

    /**
     * Neighboring IslandNodes
     * @property {Array} neighbors
     */
    this.neighbors = [];

    /**
     * Equations connected to this node.
     * @property {Array} equations
     */
    this.equations = [];

    /**
     * If this node was visiting during the graph traversal.
     * @property visited
     * @type {Boolean}
     */
    this.visited = false;
}

/**
 * Clean this node from bodies and equations.
 * @method reset
 */
IslandNode.prototype.reset = function(){
    this.equations.length = 0;
    this.neighbors.length = 0;
    this.visited = false;
    this.body = null;
};


/***/ }),

/***/ "./node_modules/p2/src/world/World.js":
/*!********************************************!*\
  !*** ./node_modules/p2/src/world/World.js ***!
  \********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var  GSSolver = __webpack_require__(/*! ../solver/GSSolver */ "./node_modules/p2/src/solver/GSSolver.js")
,    Solver = __webpack_require__(/*! ../solver/Solver */ "./node_modules/p2/src/solver/Solver.js")
,    Ray = __webpack_require__(/*! ../collision/Ray */ "./node_modules/p2/src/collision/Ray.js")
,    vec2 = __webpack_require__(/*! ../math/vec2 */ "./node_modules/p2/src/math/vec2.js")
,    Circle = __webpack_require__(/*! ../shapes/Circle */ "./node_modules/p2/src/shapes/Circle.js")
,    Convex = __webpack_require__(/*! ../shapes/Convex */ "./node_modules/p2/src/shapes/Convex.js")
,    Line = __webpack_require__(/*! ../shapes/Line */ "./node_modules/p2/src/shapes/Line.js")
,    Plane = __webpack_require__(/*! ../shapes/Plane */ "./node_modules/p2/src/shapes/Plane.js")
,    Capsule = __webpack_require__(/*! ../shapes/Capsule */ "./node_modules/p2/src/shapes/Capsule.js")
,    Particle = __webpack_require__(/*! ../shapes/Particle */ "./node_modules/p2/src/shapes/Particle.js")
,    EventEmitter = __webpack_require__(/*! ../events/EventEmitter */ "./node_modules/p2/src/events/EventEmitter.js")
,    Body = __webpack_require__(/*! ../objects/Body */ "./node_modules/p2/src/objects/Body.js")
,    Shape = __webpack_require__(/*! ../shapes/Shape */ "./node_modules/p2/src/shapes/Shape.js")
,    LinearSpring = __webpack_require__(/*! ../objects/LinearSpring */ "./node_modules/p2/src/objects/LinearSpring.js")
,    Material = __webpack_require__(/*! ../material/Material */ "./node_modules/p2/src/material/Material.js")
,    ContactMaterial = __webpack_require__(/*! ../material/ContactMaterial */ "./node_modules/p2/src/material/ContactMaterial.js")
,    DistanceConstraint = __webpack_require__(/*! ../constraints/DistanceConstraint */ "./node_modules/p2/src/constraints/DistanceConstraint.js")
,    Constraint = __webpack_require__(/*! ../constraints/Constraint */ "./node_modules/p2/src/constraints/Constraint.js")
,    LockConstraint = __webpack_require__(/*! ../constraints/LockConstraint */ "./node_modules/p2/src/constraints/LockConstraint.js")
,    RevoluteConstraint = __webpack_require__(/*! ../constraints/RevoluteConstraint */ "./node_modules/p2/src/constraints/RevoluteConstraint.js")
,    PrismaticConstraint = __webpack_require__(/*! ../constraints/PrismaticConstraint */ "./node_modules/p2/src/constraints/PrismaticConstraint.js")
,    GearConstraint = __webpack_require__(/*! ../constraints/GearConstraint */ "./node_modules/p2/src/constraints/GearConstraint.js")
,    pkg = __webpack_require__(/*! ../../package.json */ "./node_modules/p2/package.json")
,    Broadphase = __webpack_require__(/*! ../collision/Broadphase */ "./node_modules/p2/src/collision/Broadphase.js")
,    AABB = __webpack_require__(/*! ../collision/AABB */ "./node_modules/p2/src/collision/AABB.js")
,    SAPBroadphase = __webpack_require__(/*! ../collision/SAPBroadphase */ "./node_modules/p2/src/collision/SAPBroadphase.js")
,    Narrowphase = __webpack_require__(/*! ../collision/Narrowphase */ "./node_modules/p2/src/collision/Narrowphase.js")
,    Utils = __webpack_require__(/*! ../utils/Utils */ "./node_modules/p2/src/utils/Utils.js")
,    OverlapKeeper = __webpack_require__(/*! ../utils/OverlapKeeper */ "./node_modules/p2/src/utils/OverlapKeeper.js")
,    IslandManager = __webpack_require__(/*! ./IslandManager */ "./node_modules/p2/src/world/IslandManager.js")
,    RotationalSpring = __webpack_require__(/*! ../objects/RotationalSpring */ "./node_modules/p2/src/objects/RotationalSpring.js");

module.exports = World;

/**
 * The dynamics world, where all bodies and constraints live.
 *
 * @class World
 * @constructor
 * @param {Object} [options]
 * @param {Solver} [options.solver] Defaults to GSSolver.
 * @param {Array} [options.gravity] Defaults to y=-9.78.
 * @param {Broadphase} [options.broadphase] Defaults to SAPBroadphase
 * @param {Boolean} [options.islandSplit=true]
 * @extends EventEmitter
 *
 * @example
 *     var world = new World({
 *         gravity: [0, -10],
 *         broadphase: new SAPBroadphase()
 *     });
 *     world.addBody(new Body());
 */
function World(options){
    EventEmitter.apply(this);

    options = options || {};

    /**
     * All springs in the world. To add a spring to the world, use {{#crossLink "World/addSpring:method"}}{{/crossLink}}.
     *
     * @property springs
     * @type {Array}
     */
    this.springs = [];

    /**
     * All bodies in the world. To add a body to the world, use {{#crossLink "World/addBody:method"}}{{/crossLink}}.
     * @property {Array} bodies
     */
    this.bodies = [];

    /**
     * Disabled body collision pairs. See {{#crossLink "World/disableBodyCollision:method"}}.
     * @private
     * @property {Array} disabledBodyCollisionPairs
     */
    this.disabledBodyCollisionPairs = [];

    /**
     * The solver used to satisfy constraints and contacts. Default is {{#crossLink "GSSolver"}}{{/crossLink}}.
     * @property {Solver} solver
     */
    this.solver = options.solver || new GSSolver();

    /**
     * The narrowphase to use to generate contacts.
     *
     * @property narrowphase
     * @type {Narrowphase}
     */
    this.narrowphase = new Narrowphase(this);

    /**
     * The island manager of this world.
     * @property {IslandManager} islandManager
     */
    this.islandManager = new IslandManager();

    /**
     * Gravity in the world. This is applied on all bodies in the beginning of each step().
     *
     * @property gravity
     * @type {Array}
     */
    this.gravity = vec2.fromValues(0, -9.78);
    if(options.gravity){
        vec2.copy(this.gravity, options.gravity);
    }

    /**
     * Gravity to use when approximating the friction max force (mu*mass*gravity).
     * @property {Number} frictionGravity
     */
    this.frictionGravity = vec2.length(this.gravity) || 10;

    /**
     * Set to true if you want .frictionGravity to be automatically set to the length of .gravity.
     * @property {Boolean} useWorldGravityAsFrictionGravity
     * @default true
     */
    this.useWorldGravityAsFrictionGravity = true;

    /**
     * If the length of .gravity is zero, and .useWorldGravityAsFrictionGravity=true, then switch to using .frictionGravity for friction instead. This fallback is useful for gravityless games.
     * @property {Boolean} useFrictionGravityOnZeroGravity
     * @default true
     */
    this.useFrictionGravityOnZeroGravity = true;

    /**
     * The broadphase algorithm to use.
     *
     * @property broadphase
     * @type {Broadphase}
     */
    this.broadphase = options.broadphase || new SAPBroadphase();
    this.broadphase.setWorld(this);

    /**
     * User-added constraints.
     *
     * @property constraints
     * @type {Array}
     */
    this.constraints = [];

    /**
     * Dummy default material in the world, used in .defaultContactMaterial
     * @property {Material} defaultMaterial
     */
    this.defaultMaterial = new Material();

    /**
     * The default contact material to use, if no contact material was set for the colliding materials.
     * @property {ContactMaterial} defaultContactMaterial
     */
    this.defaultContactMaterial = new ContactMaterial(this.defaultMaterial,this.defaultMaterial);

    /**
     * For keeping track of what time step size we used last step
     * @property lastTimeStep
     * @type {Number}
     */
    this.lastTimeStep = 1/60;

    /**
     * Enable to automatically apply spring forces each step.
     * @property applySpringForces
     * @type {Boolean}
     * @default true
     */
    this.applySpringForces = true;

    /**
     * Enable to automatically apply body damping each step.
     * @property applyDamping
     * @type {Boolean}
     * @default true
     */
    this.applyDamping = true;

    /**
     * Enable to automatically apply gravity each step.
     * @property applyGravity
     * @type {Boolean}
     * @default true
     */
    this.applyGravity = true;

    /**
     * Enable/disable constraint solving in each step.
     * @property solveConstraints
     * @type {Boolean}
     * @default true
     */
    this.solveConstraints = true;

    /**
     * The ContactMaterials added to the World.
     * @property contactMaterials
     * @type {Array}
     */
    this.contactMaterials = [];

    /**
     * World time.
     * @property time
     * @type {Number}
     */
    this.time = 0.0;
    this.accumulator = 0;

    /**
     * Is true during step().
     * @property {Boolean} stepping
     */
    this.stepping = false;

    /**
     * Bodies that are scheduled to be removed at the end of the step.
     * @property {Array} bodiesToBeRemoved
     * @private
     */
    this.bodiesToBeRemoved = [];

    /**
     * Whether to enable island splitting. Island splitting can be an advantage for both precision and performance. See {{#crossLink "IslandManager"}}{{/crossLink}}.
     * @property {Boolean} islandSplit
     * @default true
     */
    this.islandSplit = typeof(options.islandSplit)!=="undefined" ? !!options.islandSplit : true;

    /**
     * Set to true if you want to the world to emit the "impact" event. Turning this off could improve performance.
     * @property emitImpactEvent
     * @type {Boolean}
     * @default true
     */
    this.emitImpactEvent = true;

    // Id counters
    this._constraintIdCounter = 0;
    this._bodyIdCounter = 0;

    /**
     * Fired after the step().
     * @event postStep
     */
    this.postStepEvent = {
        type : "postStep"
    };

    /**
     * Fired when a body is added to the world.
     * @event addBody
     * @param {Body} body
     */
    this.addBodyEvent = {
        type : "addBody",
        body : null
    };

    /**
     * Fired when a body is removed from the world.
     * @event removeBody
     * @param {Body} body
     */
    this.removeBodyEvent = {
        type : "removeBody",
        body : null
    };

    /**
     * Fired when a spring is added to the world.
     * @event addSpring
     * @param {Spring} spring
     */
    this.addSpringEvent = {
        type : "addSpring",
        spring : null
    };

    /**
     * Fired when a first contact is created between two bodies. This event is fired after the step has been done.
     * @event impact
     * @param {Body} bodyA
     * @param {Body} bodyB
     */
    this.impactEvent = {
        type: "impact",
        bodyA : null,
        bodyB : null,
        shapeA : null,
        shapeB : null,
        contactEquation : null
    };

    /**
     * Fired after the Broadphase has collected collision pairs in the world.
     * Inside the event handler, you can modify the pairs array as you like, to
     * prevent collisions between objects that you don't want.
     * @event postBroadphase
     * @param {Array} pairs An array of collision pairs. If this array is [body1,body2,body3,body4], then the body pairs 1,2 and 3,4 would advance to narrowphase.
     */
    this.postBroadphaseEvent = {
        type: "postBroadphase",
        pairs: null
    };

    /**
     * How to deactivate bodies during simulation. Possible modes are: {{#crossLink "World/NO_SLEEPING:property"}}World.NO_SLEEPING{{/crossLink}}, {{#crossLink "World/BODY_SLEEPING:property"}}World.BODY_SLEEPING{{/crossLink}} and {{#crossLink "World/ISLAND_SLEEPING:property"}}World.ISLAND_SLEEPING{{/crossLink}}.
     * If sleeping is enabled, you might need to {{#crossLink "Body/wakeUp:method"}}wake up{{/crossLink}} the bodies if they fall asleep when they shouldn't. If you want to enable sleeping in the world, but want to disable it for a particular body, see {{#crossLink "Body/allowSleep:property"}}Body.allowSleep{{/crossLink}}.
     * @property sleepMode
     * @type {number}
     * @default World.NO_SLEEPING
     */
    this.sleepMode = World.NO_SLEEPING;

    /**
     * Fired when two shapes starts start to overlap. Fired in the narrowphase, during step.
     * @event beginContact
     * @param {Shape} shapeA
     * @param {Shape} shapeB
     * @param {Body}  bodyA
     * @param {Body}  bodyB
     * @param {Array} contactEquations
     */
    this.beginContactEvent = {
        type: "beginContact",
        shapeA: null,
        shapeB: null,
        bodyA: null,
        bodyB: null,
        contactEquations: []
    };

    /**
     * Fired when two shapes stop overlapping, after the narrowphase (during step).
     * @event endContact
     * @param {Shape} shapeA
     * @param {Shape} shapeB
     * @param {Body}  bodyA
     * @param {Body}  bodyB
     */
    this.endContactEvent = {
        type: "endContact",
        shapeA: null,
        shapeB: null,
        bodyA: null,
        bodyB: null
    };

    /**
     * Fired just before equations are added to the solver to be solved. Can be used to control what equations goes into the solver.
     * @event preSolve
     * @param {Array} contactEquations  An array of contacts to be solved.
     * @param {Array} frictionEquations An array of friction equations to be solved.
     */
    this.preSolveEvent = {
        type: "preSolve",
        contactEquations: null,
        frictionEquations: null
    };

    // For keeping track of overlapping shapes
    this.overlappingShapesLastState = { keys:[] };
    this.overlappingShapesCurrentState = { keys:[] };

    /**
     * @property {OverlapKeeper} overlapKeeper
     */
    this.overlapKeeper = new OverlapKeeper();
}
World.prototype = new Object(EventEmitter.prototype);
World.prototype.constructor = World;

/**
 * Never deactivate bodies.
 * @static
 * @property {number} NO_SLEEPING
 */
World.NO_SLEEPING = 1;

/**
 * Deactivate individual bodies if they are sleepy.
 * @static
 * @property {number} BODY_SLEEPING
 */
World.BODY_SLEEPING = 2;

/**
 * Deactivates bodies that are in contact, if all of them are sleepy. Note that you must enable {{#crossLink "World/islandSplit:property"}}.islandSplit{{/crossLink}} for this to work.
 * @static
 * @property {number} ISLAND_SLEEPING
 */
World.ISLAND_SLEEPING = 4;

/**
 * Add a constraint to the simulation.
 *
 * @method addConstraint
 * @param {Constraint} constraint
 * @example
 *     var constraint = new LockConstraint(bodyA, bodyB);
 *     world.addConstraint(constraint);
 */
World.prototype.addConstraint = function(constraint){
    this.constraints.push(constraint);
};

/**
 * Add a ContactMaterial to the simulation.
 * @method addContactMaterial
 * @param {ContactMaterial} contactMaterial
 */
World.prototype.addContactMaterial = function(contactMaterial){
    this.contactMaterials.push(contactMaterial);
};

/**
 * Removes a contact material
 *
 * @method removeContactMaterial
 * @param {ContactMaterial} cm
 */
World.prototype.removeContactMaterial = function(cm){
    var idx = this.contactMaterials.indexOf(cm);
    if(idx!==-1){
        Utils.splice(this.contactMaterials,idx,1);
    }
};

/**
 * Get a contact material given two materials
 * @method getContactMaterial
 * @param {Material} materialA
 * @param {Material} materialB
 * @return {ContactMaterial} The matching ContactMaterial, or false on fail.
 * @todo Use faster hash map to lookup from material id's
 */
World.prototype.getContactMaterial = function(materialA,materialB){
    var cmats = this.contactMaterials;
    for(var i=0, N=cmats.length; i!==N; i++){
        var cm = cmats[i];
        if( (cm.materialA.id === materialA.id) && (cm.materialB.id === materialB.id) ||
            (cm.materialA.id === materialB.id) && (cm.materialB.id === materialA.id) ){
            return cm;
        }
    }
    return false;
};

/**
 * Removes a constraint
 *
 * @method removeConstraint
 * @param {Constraint} constraint
 */
World.prototype.removeConstraint = function(constraint){
    var idx = this.constraints.indexOf(constraint);
    if(idx!==-1){
        Utils.splice(this.constraints,idx,1);
    }
};

var step_r = vec2.create(),
    step_runit = vec2.create(),
    step_u = vec2.create(),
    step_f = vec2.create(),
    step_fhMinv = vec2.create(),
    step_velodt = vec2.create(),
    step_mg = vec2.create(),
    xiw = vec2.fromValues(0,0),
    xjw = vec2.fromValues(0,0),
    zero = vec2.fromValues(0,0),
    interpvelo = vec2.fromValues(0,0);

/**
 * Step the physics world forward in time.
 *
 * There are two modes. The simple mode is fixed timestepping without interpolation. In this case you only use the first argument. The second case uses interpolation. In that you also provide the time since the function was last used, as well as the maximum fixed timesteps to take.
 *
 * @method step
 * @param {Number} dt                       The fixed time step size to use.
 * @param {Number} [timeSinceLastCalled=0]  The time elapsed since the function was last called.
 * @param {Number} [maxSubSteps=10]         Maximum number of fixed steps to take per function call.
 *
 * @example
 *     // Simple fixed timestepping without interpolation
 *     var fixedTimeStep = 1 / 60;
 *     var world = new World();
 *     var body = new Body({ mass: 1 });
 *     world.addBody(body);
 *
 *     function animate(){
 *         requestAnimationFrame(animate);
 *         world.step(fixedTimeStep);
 *         renderBody(body.position, body.angle);
 *     }
 *
 *     // Start animation loop
 *     requestAnimationFrame(animate);
 *
 * @example
 *     // Fixed timestepping with interpolation
 *     var maxSubSteps = 10;
 *     var lastTimeSeconds;
 *
 *     function animate(t){
 *         requestAnimationFrame(animate);
 *         timeSeconds = t / 1000;
 *         lastTimeSeconds = lastTimeSeconds || timeSeconds;
 *
 *         deltaTime = timeSeconds - lastTimeSeconds;
 *         world.step(fixedTimeStep, deltaTime, maxSubSteps);
 *
 *         renderBody(body.interpolatedPosition, body.interpolatedAngle);
 *     }
 *
 *     // Start animation loop
 *     requestAnimationFrame(animate);
 *
 * @see http://bulletphysics.org/mediawiki-1.5.8/index.php/Stepping_The_World
 */
World.prototype.step = function(dt,timeSinceLastCalled,maxSubSteps){
    maxSubSteps = maxSubSteps || 10;
    timeSinceLastCalled = timeSinceLastCalled || 0;

    if(timeSinceLastCalled === 0){ // Fixed, simple stepping

        this.internalStep(dt);

        // Increment time
        this.time += dt;

    } else {

        this.accumulator += timeSinceLastCalled;
        var substeps = 0;
        while (this.accumulator >= dt && substeps < maxSubSteps) {
            // Do fixed steps to catch up
            this.internalStep(dt);
            this.time += dt;
            this.accumulator -= dt;
            substeps++;
        }

        var t = (this.accumulator % dt) / dt;
        for(var j=0; j!==this.bodies.length; j++){
            var b = this.bodies[j];
            vec2.lerp(b.interpolatedPosition, b.previousPosition, b.position, t);
            b.interpolatedAngle = b.previousAngle + t * (b.angle - b.previousAngle);
        }
    }
};

var endOverlaps = [];

/**
 * Make a fixed step.
 * @method internalStep
 * @param  {number} dt
 * @private
 */
World.prototype.internalStep = function(dt){
    this.stepping = true;

    var that = this,
        Nsprings = this.springs.length,
        springs = this.springs,
        bodies = this.bodies,
        g = this.gravity,
        solver = this.solver,
        Nbodies = this.bodies.length,
        broadphase = this.broadphase,
        np = this.narrowphase,
        constraints = this.constraints,
        t0, t1,
        fhMinv = step_fhMinv,
        velodt = step_velodt,
        mg = step_mg,
        scale = vec2.scale,
        add = vec2.add,
        rotate = vec2.rotate,
        islandManager = this.islandManager;

    this.overlapKeeper.tick();

    this.lastTimeStep = dt;

    // Update approximate friction gravity.
    if(this.useWorldGravityAsFrictionGravity){
        var gravityLen = vec2.length(this.gravity);
        if(!(gravityLen === 0 && this.useFrictionGravityOnZeroGravity)){
            // Nonzero gravity. Use it.
            this.frictionGravity = gravityLen;
        }
    }

    // Add gravity to bodies
    if(this.applyGravity){
        for(var i=0; i!==Nbodies; i++){
            var b = bodies[i],
                fi = b.force;
            if(b.type !== Body.DYNAMIC || b.sleepState === Body.SLEEPING){
                continue;
            }
            vec2.scale(mg,g,b.mass*b.gravityScale); // F=m*g
            add(fi,fi,mg);
        }
    }

    // Add spring forces
    if(this.applySpringForces){
        for(var i=0; i!==Nsprings; i++){
            var s = springs[i];
            s.applyForce();
        }
    }

    if(this.applyDamping){
        for(var i=0; i!==Nbodies; i++){
            var b = bodies[i];
            if(b.type === Body.DYNAMIC){
                b.applyDamping(dt);
            }
        }
    }

    // Broadphase
    var result = broadphase.getCollisionPairs(this);

    // Remove ignored collision pairs
    var ignoredPairs = this.disabledBodyCollisionPairs;
    for(var i=ignoredPairs.length-2; i>=0; i-=2){
        for(var j=result.length-2; j>=0; j-=2){
            if( (ignoredPairs[i]   === result[j] && ignoredPairs[i+1] === result[j+1]) ||
                (ignoredPairs[i+1] === result[j] && ignoredPairs[i]   === result[j+1])){
                result.splice(j,2);
            }
        }
    }

    // Remove constrained pairs with collideConnected == false
    var Nconstraints = constraints.length;
    for(i=0; i!==Nconstraints; i++){
        var c = constraints[i];
        if(!c.collideConnected){
            for(var j=result.length-2; j>=0; j-=2){
                if( (c.bodyA === result[j] && c.bodyB === result[j+1]) ||
                    (c.bodyB === result[j] && c.bodyA === result[j+1])){
                    result.splice(j,2);
                }
            }
        }
    }

    // postBroadphase event
    this.postBroadphaseEvent.pairs = result;
    this.emit(this.postBroadphaseEvent);
    this.postBroadphaseEvent.pairs = null;

    // Narrowphase
    np.reset(this);
    for(var i=0, Nresults=result.length; i!==Nresults; i+=2){
        var bi = result[i],
            bj = result[i+1];

        // Loop over all shapes of body i
        for(var k=0, Nshapesi=bi.shapes.length; k!==Nshapesi; k++){
            var si = bi.shapes[k],
                xi = si.position,
                ai = si.angle;

            // All shapes of body j
            for(var l=0, Nshapesj=bj.shapes.length; l!==Nshapesj; l++){
                var sj = bj.shapes[l],
                    xj = sj.position,
                    aj = sj.angle;

                var cm = this.defaultContactMaterial;
                if(si.material && sj.material){
                    var tmp = this.getContactMaterial(si.material,sj.material);
                    if(tmp){
                        cm = tmp;
                    }
                }

                this.runNarrowphase(np,bi,si,xi,ai,bj,sj,xj,aj,cm,this.frictionGravity);
            }
        }
    }

    // Wake up bodies
    for(var i=0; i!==Nbodies; i++){
        var body = bodies[i];
        if(body._wakeUpAfterNarrowphase){
            body.wakeUp();
            body._wakeUpAfterNarrowphase = false;
        }
    }

    // Emit end overlap events
    if(this.has('endContact')){
        this.overlapKeeper.getEndOverlaps(endOverlaps);
        var e = this.endContactEvent;
        var l = endOverlaps.length;
        while(l--){
            var data = endOverlaps[l];
            e.shapeA = data.shapeA;
            e.shapeB = data.shapeB;
            e.bodyA = data.bodyA;
            e.bodyB = data.bodyB;
            this.emit(e);
        }
        endOverlaps.length = 0;
    }

    var preSolveEvent = this.preSolveEvent;
    preSolveEvent.contactEquations = np.contactEquations;
    preSolveEvent.frictionEquations = np.frictionEquations;
    this.emit(preSolveEvent);
    preSolveEvent.contactEquations = preSolveEvent.frictionEquations = null;

    // update constraint equations
    var Nconstraints = constraints.length;
    for(i=0; i!==Nconstraints; i++){
        constraints[i].update();
    }

    if(np.contactEquations.length || np.frictionEquations.length || Nconstraints){
        if(this.islandSplit){
            // Split into islands
            islandManager.equations.length = 0;
            Utils.appendArray(islandManager.equations, np.contactEquations);
            Utils.appendArray(islandManager.equations, np.frictionEquations);
            for(i=0; i!==Nconstraints; i++){
                Utils.appendArray(islandManager.equations, constraints[i].equations);
            }
            islandManager.split(this);

            for(var i=0; i!==islandManager.islands.length; i++){
                var island = islandManager.islands[i];
                if(island.equations.length){
                    solver.solveIsland(dt,island);
                }
            }

        } else {

            // Add contact equations to solver
            solver.addEquations(np.contactEquations);
            solver.addEquations(np.frictionEquations);

            // Add user-defined constraint equations
            for(i=0; i!==Nconstraints; i++){
                solver.addEquations(constraints[i].equations);
            }

            if(this.solveConstraints){
                solver.solve(dt,this);
            }

            solver.removeAllEquations();
        }
    }

    // Step forward
    for(var i=0; i!==Nbodies; i++){
        var body = bodies[i];

        // if(body.sleepState !== Body.SLEEPING && body.type !== Body.STATIC){
        body.integrate(dt);
        // }
    }

    // Reset force
    for(var i=0; i!==Nbodies; i++){
        bodies[i].setZeroForce();
    }

    // Emit impact event
    if(this.emitImpactEvent && this.has('impact')){
        var ev = this.impactEvent;
        for(var i=0; i!==np.contactEquations.length; i++){
            var eq = np.contactEquations[i];
            if(eq.firstImpact){
                ev.bodyA = eq.bodyA;
                ev.bodyB = eq.bodyB;
                ev.shapeA = eq.shapeA;
                ev.shapeB = eq.shapeB;
                ev.contactEquation = eq;
                this.emit(ev);
            }
        }
    }

    // Sleeping update
    if(this.sleepMode === World.BODY_SLEEPING){
        for(i=0; i!==Nbodies; i++){
            bodies[i].sleepTick(this.time, false, dt);
        }
    } else if(this.sleepMode === World.ISLAND_SLEEPING && this.islandSplit){

        // Tell all bodies to sleep tick but dont sleep yet
        for(i=0; i!==Nbodies; i++){
            bodies[i].sleepTick(this.time, true, dt);
        }

        // Sleep islands
        for(var i=0; i<this.islandManager.islands.length; i++){
            var island = this.islandManager.islands[i];
            if(island.wantsToSleep()){
                island.sleep();
            }
        }
    }

    this.stepping = false;

    // Remove bodies that are scheduled for removal
    var bodiesToBeRemoved = this.bodiesToBeRemoved;
    for(var i=0; i!==bodiesToBeRemoved.length; i++){
        this.removeBody(bodiesToBeRemoved[i]);
    }
    bodiesToBeRemoved.length = 0;

    this.emit(this.postStepEvent);
};

/**
 * Runs narrowphase for the shape pair i and j.
 * @method runNarrowphase
 * @param  {Narrowphase} np
 * @param  {Body} bi
 * @param  {Shape} si
 * @param  {Array} xi
 * @param  {Number} ai
 * @param  {Body} bj
 * @param  {Shape} sj
 * @param  {Array} xj
 * @param  {Number} aj
 * @param  {Number} mu
 */
World.prototype.runNarrowphase = function(np,bi,si,xi,ai,bj,sj,xj,aj,cm,glen){

    // Check collision groups and masks
    if(!((si.collisionGroup & sj.collisionMask) !== 0 && (sj.collisionGroup & si.collisionMask) !== 0)){
        return;
    }

    // Get world position and angle of each shape
    vec2.rotate(xiw, xi, bi.angle);
    vec2.rotate(xjw, xj, bj.angle);
    vec2.add(xiw, xiw, bi.position);
    vec2.add(xjw, xjw, bj.position);
    var aiw = ai + bi.angle;
    var ajw = aj + bj.angle;

    np.enableFriction = cm.friction > 0;
    np.frictionCoefficient = cm.friction;
    var reducedMass;
    if(bi.type === Body.STATIC || bi.type === Body.KINEMATIC){
        reducedMass = bj.mass;
    } else if(bj.type === Body.STATIC || bj.type === Body.KINEMATIC){
        reducedMass = bi.mass;
    } else {
        reducedMass = (bi.mass*bj.mass)/(bi.mass+bj.mass);
    }
    np.slipForce = cm.friction*glen*reducedMass;
    np.restitution = cm.restitution;
    np.surfaceVelocity = cm.surfaceVelocity;
    np.frictionStiffness = cm.frictionStiffness;
    np.frictionRelaxation = cm.frictionRelaxation;
    np.stiffness = cm.stiffness;
    np.relaxation = cm.relaxation;
    np.contactSkinSize = cm.contactSkinSize;
    np.enabledEquations = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;

    var resolver = np[si.type | sj.type],
        numContacts = 0;
    if (resolver) {
        var sensor = si.sensor || sj.sensor;
        var numFrictionBefore = np.frictionEquations.length;
        if (si.type < sj.type) {
            numContacts = resolver.call(np, bi,si,xiw,aiw, bj,sj,xjw,ajw, sensor);
        } else {
            numContacts = resolver.call(np, bj,sj,xjw,ajw, bi,si,xiw,aiw, sensor);
        }
        var numFrictionEquations = np.frictionEquations.length - numFrictionBefore;

        if(numContacts){

            if( bi.allowSleep &&
                bi.type === Body.DYNAMIC &&
                bi.sleepState  === Body.SLEEPING &&
                bj.sleepState  === Body.AWAKE &&
                bj.type !== Body.STATIC
            ){
                var speedSquaredB = vec2.squaredLength(bj.velocity) + Math.pow(bj.angularVelocity,2);
                var speedLimitSquaredB = Math.pow(bj.sleepSpeedLimit,2);
                if(speedSquaredB >= speedLimitSquaredB*2){
                    bi._wakeUpAfterNarrowphase = true;
                }
            }

            if( bj.allowSleep &&
                bj.type === Body.DYNAMIC &&
                bj.sleepState  === Body.SLEEPING &&
                bi.sleepState  === Body.AWAKE &&
                bi.type !== Body.STATIC
            ){
                var speedSquaredA = vec2.squaredLength(bi.velocity) + Math.pow(bi.angularVelocity,2);
                var speedLimitSquaredA = Math.pow(bi.sleepSpeedLimit,2);
                if(speedSquaredA >= speedLimitSquaredA*2){
                    bj._wakeUpAfterNarrowphase = true;
                }
            }

            this.overlapKeeper.setOverlapping(bi, si, bj, sj);
            if(this.has('beginContact') && this.overlapKeeper.isNewOverlap(si, sj)){

                // Report new shape overlap
                var e = this.beginContactEvent;
                e.shapeA = si;
                e.shapeB = sj;
                e.bodyA = bi;
                e.bodyB = bj;

                // Reset contact equations
                e.contactEquations.length = 0;

                if(typeof(numContacts)==="number"){
                    for(var i=np.contactEquations.length-numContacts; i<np.contactEquations.length; i++){
                        e.contactEquations.push(np.contactEquations[i]);
                    }
                }

                this.emit(e);
            }

            // divide the max friction force by the number of contacts
            if(typeof(numContacts)==="number" && numFrictionEquations > 1){ // Why divide by 1?
                for(var i=np.frictionEquations.length-numFrictionEquations; i<np.frictionEquations.length; i++){
                    var f = np.frictionEquations[i];
                    f.setSlipForce(f.getSlipForce() / numFrictionEquations);
                }
            }
        }
    }

};

/**
 * Add a spring to the simulation
 *
 * @method addSpring
 * @param {Spring} spring
 */
World.prototype.addSpring = function(spring){
    this.springs.push(spring);
    var evt = this.addSpringEvent;
    evt.spring = spring;
    this.emit(evt);
    evt.spring = null;
};

/**
 * Remove a spring
 *
 * @method removeSpring
 * @param {Spring} spring
 */
World.prototype.removeSpring = function(spring){
    var idx = this.springs.indexOf(spring);
    if(idx !== -1){
        Utils.splice(this.springs,idx,1);
    }
};

/**
 * Add a body to the simulation
 *
 * @method addBody
 * @param {Body} body
 *
 * @example
 *     var world = new World(),
 *         body = new Body();
 *     world.addBody(body);
 * @todo What if this is done during step?
 */
World.prototype.addBody = function(body){
    if(this.bodies.indexOf(body) === -1){
        this.bodies.push(body);
        body.world = this;
        var evt = this.addBodyEvent;
        evt.body = body;
        this.emit(evt);
        evt.body = null;
    }
};

/**
 * Remove a body from the simulation. If this method is called during step(), the body removal is scheduled to after the step.
 *
 * @method removeBody
 * @param {Body} body
 */
World.prototype.removeBody = function(body){
    if(this.stepping){
        this.bodiesToBeRemoved.push(body);
    } else {
        body.world = null;
        var idx = this.bodies.indexOf(body);
        if(idx!==-1){
            Utils.splice(this.bodies,idx,1);
            this.removeBodyEvent.body = body;
            body.resetConstraintVelocity();
            this.emit(this.removeBodyEvent);
            this.removeBodyEvent.body = null;
        }
    }
};

/**
 * Get a body by its id.
 * @method getBodyById
 * @param {number} id
 * @return {Body} The body, or false if it was not found.
 */
World.prototype.getBodyById = function(id){
    var bodies = this.bodies;
    for(var i=0; i<bodies.length; i++){
        var b = bodies[i];
        if(b.id === id){
            return b;
        }
    }
    return false;
};

/**
 * Disable collision between two bodies
 * @method disableBodyCollision
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
World.prototype.disableBodyCollision = function(bodyA,bodyB){
    this.disabledBodyCollisionPairs.push(bodyA,bodyB);
};

/**
 * Enable collisions between the given two bodies
 * @method enableBodyCollision
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
World.prototype.enableBodyCollision = function(bodyA,bodyB){
    var pairs = this.disabledBodyCollisionPairs;
    for(var i=0; i<pairs.length; i+=2){
        if((pairs[i] === bodyA && pairs[i+1] === bodyB) || (pairs[i+1] === bodyA && pairs[i] === bodyB)){
            pairs.splice(i,2);
            return;
        }
    }
};

/**
 * Resets the World, removes all bodies, constraints and springs.
 *
 * @method clear
 */
World.prototype.clear = function(){

    this.time = 0;

    // Remove all solver equations
    if(this.solver && this.solver.equations.length){
        this.solver.removeAllEquations();
    }

    // Remove all constraints
    var cs = this.constraints;
    for(var i=cs.length-1; i>=0; i--){
        this.removeConstraint(cs[i]);
    }

    // Remove all bodies
    var bodies = this.bodies;
    for(var i=bodies.length-1; i>=0; i--){
        this.removeBody(bodies[i]);
    }

    // Remove all springs
    var springs = this.springs;
    for(var i=springs.length-1; i>=0; i--){
        this.removeSpring(springs[i]);
    }

    // Remove all contact materials
    var cms = this.contactMaterials;
    for(var i=cms.length-1; i>=0; i--){
        this.removeContactMaterial(cms[i]);
    }

    World.apply(this);
};

var hitTest_tmp1 = vec2.create(),
    hitTest_zero = vec2.fromValues(0,0),
    hitTest_tmp2 = vec2.fromValues(0,0);

/**
 * Test if a world point overlaps bodies
 * @method hitTest
 * @param  {Array}  worldPoint  Point to use for intersection tests
 * @param  {Array}  bodies      A list of objects to check for intersection
 * @param  {Number} precision   Used for matching against particles and lines. Adds some margin to these infinitesimal objects.
 * @return {Array}              Array of bodies that overlap the point
 * @todo Should use an api similar to the raycast function
 * @todo Should probably implement a .containsPoint method for all shapes. Would be more efficient
 * @todo Should use the broadphase
 */
World.prototype.hitTest = function(worldPoint,bodies,precision){
    precision = precision || 0;

    // Create a dummy particle body with a particle shape to test against the bodies
    var pb = new Body({ position:worldPoint }),
        ps = new Particle(),
        px = worldPoint,
        pa = 0,
        x = hitTest_tmp1,
        zero = hitTest_zero,
        tmp = hitTest_tmp2;
    pb.addShape(ps);

    var n = this.narrowphase,
        result = [];

    // Check bodies
    for(var i=0, N=bodies.length; i!==N; i++){
        var b = bodies[i];

        for(var j=0, NS=b.shapes.length; j!==NS; j++){
            var s = b.shapes[j];

            // Get shape world position + angle
            vec2.rotate(x, s.position, b.angle);
            vec2.add(x, x, b.position);
            var a = s.angle + b.angle;

            if( (s instanceof Circle    && n.circleParticle  (b,s,x,a,     pb,ps,px,pa, true)) ||
                (s instanceof Convex    && n.particleConvex  (pb,ps,px,pa, b,s,x,a,     true)) ||
                (s instanceof Plane     && n.particlePlane   (pb,ps,px,pa, b,s,x,a,     true)) ||
                (s instanceof Capsule   && n.particleCapsule (pb,ps,px,pa, b,s,x,a,     true)) ||
                (s instanceof Particle  && vec2.squaredLength(vec2.sub(tmp,x,worldPoint)) < precision*precision)
                ){
                result.push(b);
            }
        }
    }

    return result;
};

/**
 * Set the stiffness for all equations and contact materials.
 * @method setGlobalStiffness
 * @param {Number} stiffness
 */
World.prototype.setGlobalStiffness = function(stiffness){

    // Set for all constraints
    var constraints = this.constraints;
    for(var i=0; i !== constraints.length; i++){
        var c = constraints[i];
        for(var j=0; j !== c.equations.length; j++){
            var eq = c.equations[j];
            eq.stiffness = stiffness;
            eq.needsUpdate = true;
        }
    }

    // Set for all contact materials
    var contactMaterials = this.contactMaterials;
    for(var i=0; i !== contactMaterials.length; i++){
        var c = contactMaterials[i];
        c.stiffness = c.frictionStiffness = stiffness;
    }

    // Set for default contact material
    var c = this.defaultContactMaterial;
    c.stiffness = c.frictionStiffness = stiffness;
};

/**
 * Set the relaxation for all equations and contact materials.
 * @method setGlobalRelaxation
 * @param {Number} relaxation
 */
World.prototype.setGlobalRelaxation = function(relaxation){

    // Set for all constraints
    for(var i=0; i !== this.constraints.length; i++){
        var c = this.constraints[i];
        for(var j=0; j !== c.equations.length; j++){
            var eq = c.equations[j];
            eq.relaxation = relaxation;
            eq.needsUpdate = true;
        }
    }

    // Set for all contact materials
    for(var i=0; i !== this.contactMaterials.length; i++){
        var c = this.contactMaterials[i];
        c.relaxation = c.frictionRelaxation = relaxation;
    }

    // Set for default contact material
    var c = this.defaultContactMaterial;
    c.relaxation = c.frictionRelaxation = relaxation;
};

var tmpAABB = new AABB();
var tmpArray = [];

/**
 * Ray cast against all bodies in the world.
 * @method raycast
 * @param  {RaycastResult} result
 * @param  {Ray} ray
 * @return {boolean} True if any body was hit.
 *
 * @example
 *     var ray = new Ray({
 *         mode: Ray.CLOSEST, // or ANY
 *         from: [0, 0],
 *         to: [10, 0],
 *     });
 *     var result = new RaycastResult();
 *     world.raycast(result, ray);
 *
 *     // Get the hit point
 *     var hitPoint = vec2.create();
 *     result.getHitPoint(hitPoint, ray);
 *     console.log('Hit point: ', hitPoint[0], hitPoint[1], ' at distance ' + result.getHitDistance(ray));
 *
 * @example
 *     var ray = new Ray({
 *         mode: Ray.ALL,
 *         from: [0, 0],
 *         to: [10, 0],
 *         callback: function(result){
 *
 *             // Print some info about the hit
 *             console.log('Hit body and shape: ', result.body, result.shape);
 *
 *             // Get the hit point
 *             var hitPoint = vec2.create();
 *             result.getHitPoint(hitPoint, ray);
 *             console.log('Hit point: ', hitPoint[0], hitPoint[1], ' at distance ' + result.getHitDistance(ray));
 *
 *             // If you are happy with the hits you got this far, you can stop the traversal here:
 *             result.stop();
 *         }
 *     });
 *     var result = new RaycastResult();
 *     world.raycast(result, ray);
 */
World.prototype.raycast = function(result, ray){

    // Get all bodies within the ray AABB
    ray.getAABB(tmpAABB);
    this.broadphase.aabbQuery(this, tmpAABB, tmpArray);
    ray.intersectBodies(result, tmpArray);
    tmpArray.length = 0;

    return result.hasHit();
};


/***/ }),

/***/ "./node_modules/pixi-particles/dist/pixi-particles.min.js":
/*!****************************************************************!*\
  !*** ./node_modules/pixi-particles/dist/pixi-particles.min.js ***!
  \****************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var require;var require;/*!
 * pixi-particles - v3.1.0
 * Compiled Wed, 29 Aug 2018 15:47:46 UTC
 *
 * pixi-particles is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
!function(t){if(true)module.exports=t();else { var e; }}(function(){return function(){function t(e,i,s){function a(n,o){if(!i[n]){if(!e[n]){var h="function"==typeof require&&require;if(!o&&h)return require(n,!0);if(r)return r(n,!0);var l=new Error("Cannot find module '"+n+"'");throw l.code="MODULE_NOT_FOUND",l}var p=i[n]={exports:{}};e[n][0].call(p.exports,function(t){var i=e[n][1][t];return a(i||t)},p,p.exports,t,e,i,s)}return i[n].exports}for(var r="function"==typeof require&&require,n=0;n<s.length;n++)a(s[n]);return a}return t}()({1:[function(t,e,i){"use strict";var s=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i])};return function(e,i){function s(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(s.prototype=i.prototype,new s)}}();Object.defineProperty(i,"__esModule",{value:!0});var a=t("./Particle"),r=PIXI.Texture,n=function(t){function e(e){var i=t.call(this,e)||this;return i.textures=null,i.duration=0,i.framerate=0,i.elapsed=0,i.loop=!1,i}return s(e,t),e.prototype.init=function(){this.Particle_init(),this.elapsed=0,this.framerate<0&&(this.duration=this.maxLife,this.framerate=this.textures.length/this.duration)},e.prototype.applyArt=function(t){this.textures=t.textures,this.framerate=t.framerate,this.duration=t.duration,this.loop=t.loop},e.prototype.update=function(t){var e=this.Particle_update(t);if(e>=0){this.elapsed+=t,this.elapsed>this.duration&&(this.loop?this.elapsed=this.elapsed%this.duration:this.elapsed=this.duration-1e-6);var i=this.elapsed*this.framerate+1e-7|0;this.texture=this.textures[i]||PIXI.Texture.EMPTY}return e},e.prototype.destroy=function(){this.Particle_destroy(),this.textures=null},e.parseArt=function(t){for(var e,i,s,a,n,o=[],h=0;h<t.length;++h){e=t[h],o[h]=i={},i.textures=n=[],s=e.textures;for(var l=0;l<s.length;++l)if("string"==typeof(a=s[l]))n.push(r.fromImage(a));else if(a instanceof r)n.push(a);else{var p=a.count||1;for(a="string"==typeof a.texture?r.fromImage(a.texture):a.texture;p>0;--p)n.push(a)}"matchLife"==e.framerate?(i.framerate=-1,i.duration=0,i.loop=!1):(i.loop=!!e.loop,i.framerate=e.framerate>0?e.framerate:60,i.duration=n.length/i.framerate)}return o},e}(a.default);i.default=n},{"./Particle":3}],2:[function(t,e,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var s=t("./ParticleUtils"),a=t("./Particle"),r=t("./PropertyNode"),n=PIXI.ticker.shared,o=new PIXI.Point,h=function(){function t(t,e,i){this._particleConstructor=a.default,this.particleImages=null,this.startAlpha=null,this.startSpeed=null,this.minimumSpeedMultiplier=1,this.acceleration=null,this.maxSpeed=NaN,this.startScale=null,this.minimumScaleMultiplier=1,this.startColor=null,this.minLifetime=0,this.maxLifetime=0,this.minStartRotation=0,this.maxStartRotation=0,this.noRotation=!1,this.minRotationSpeed=0,this.maxRotationSpeed=0,this.particleBlendMode=0,this.customEase=null,this.extraData=null,this._frequency=1,this.spawnChance=1,this.maxParticles=1e3,this.emitterLifetime=-1,this.spawnPos=null,this.spawnType=null,this._spawnFunc=null,this.spawnRect=null,this.spawnCircle=null,this.particlesPerWave=1,this.particleSpacing=0,this.angleStart=0,this.rotation=0,this.ownerPos=null,this._prevEmitterPos=null,this._prevPosIsValid=!1,this._posChanged=!1,this._parent=null,this.addAtBack=!1,this.particleCount=0,this._emit=!1,this._spawnTimer=0,this._emitterLife=-1,this._activeParticlesFirst=null,this._activeParticlesLast=null,this._poolFirst=null,this._origConfig=null,this._origArt=null,this._autoUpdate=!1,this._destroyWhenComplete=!1,this._completeCallback=null,this.parent=t,e&&i&&this.init(e,i),this.recycle=this.recycle,this.update=this.update,this.rotate=this.rotate,this.updateSpawnPos=this.updateSpawnPos,this.updateOwnerPos=this.updateOwnerPos}return Object.defineProperty(t.prototype,"frequency",{get:function(){return this._frequency},set:function(t){this._frequency="number"==typeof t&&t>0?t:1},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"particleConstructor",{get:function(){return this._particleConstructor},set:function(t){if(t!=this._particleConstructor){this._particleConstructor=t,this.cleanup();for(var e=this._poolFirst;e;e=e.next)e.destroy();this._poolFirst=null,this._origConfig&&this._origArt&&this.init(this._origArt,this._origConfig)}},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"parent",{get:function(){return this._parent},set:function(t){this.cleanup(),this._parent=t},enumerable:!0,configurable:!0}),t.prototype.init=function(t,e){if(t&&e){this.cleanup(),this._origConfig=e,this._origArt=t,t=Array.isArray(t)?t.slice():[t];var i=this._particleConstructor;this.particleImages=i.parseArt?i.parseArt(t):t,e.alpha?this.startAlpha=r.default.createList(e.alpha):this.startAlpha=new r.default(1,0),e.speed?(this.startSpeed=r.default.createList(e.speed),this.minimumSpeedMultiplier=e.speed.minimumSpeedMultiplier||1):(this.minimumSpeedMultiplier=1,this.startSpeed=new r.default(0,0));var a=e.acceleration;a&&(a.x||a.y)?(this.startSpeed.next=null,this.acceleration=new PIXI.Point(a.x,a.y),this.maxSpeed=e.maxSpeed||NaN):this.acceleration=new PIXI.Point,e.scale?(this.startScale=r.default.createList(e.scale),this.minimumScaleMultiplier=e.scale.minimumScaleMultiplier||1):(this.startScale=new r.default(1,0),this.minimumScaleMultiplier=1),e.color?this.startColor=r.default.createList(e.color):this.startColor=new r.default({r:255,g:255,b:255},0),e.startRotation?(this.minStartRotation=e.startRotation.min,this.maxStartRotation=e.startRotation.max):this.minStartRotation=this.maxStartRotation=0,e.noRotation&&(this.minStartRotation||this.maxStartRotation)?this.noRotation=!!e.noRotation:this.noRotation=!1,e.rotationSpeed?(this.minRotationSpeed=e.rotationSpeed.min,this.maxRotationSpeed=e.rotationSpeed.max):this.minRotationSpeed=this.maxRotationSpeed=0,this.minLifetime=e.lifetime.min,this.maxLifetime=e.lifetime.max,this.particleBlendMode=s.default.getBlendMode(e.blendMode),e.ease?this.customEase="function"==typeof e.ease?e.ease:s.default.generateEase(e.ease):this.customEase=null,i.parseData?this.extraData=i.parseData(e.extraData):this.extraData=e.extraData||null,this.spawnRect=this.spawnCircle=null,this.particlesPerWave=1,e.particlesPerWave&&e.particlesPerWave>1&&(this.particlesPerWave=e.particlesPerWave),this.particleSpacing=0,this.angleStart=0;var n;switch(e.spawnType){case"rect":this.spawnType="rect",this._spawnFunc=this._spawnRect;var o=e.spawnRect;this.spawnRect=new PIXI.Rectangle(o.x,o.y,o.w,o.h);break;case"circle":this.spawnType="circle",this._spawnFunc=this._spawnCircle,n=e.spawnCircle,this.spawnCircle=new PIXI.Circle(n.x,n.y,n.r);break;case"ring":this.spawnType="ring",this._spawnFunc=this._spawnRing,n=e.spawnCircle,this.spawnCircle=new PIXI.Circle(n.x,n.y,n.r),this.spawnCircle.minRadius=n.minR;break;case"burst":this.spawnType="burst",this._spawnFunc=this._spawnBurst,this.particleSpacing=e.particleSpacing,this.angleStart=e.angleStart?e.angleStart:0;break;case"point":default:this.spawnType="point",this._spawnFunc=this._spawnPoint}this.frequency=e.frequency,this.spawnChance="number"==typeof e.spawnChance&&e.spawnChance>0?e.spawnChance:1,this.emitterLifetime=e.emitterLifetime||-1,this.maxParticles=e.maxParticles>0?e.maxParticles:1e3,this.addAtBack=!!e.addAtBack,this.rotation=0,this.ownerPos=new PIXI.Point,this.spawnPos=new PIXI.Point(e.pos.x,e.pos.y),this._prevEmitterPos=this.spawnPos.clone(),this._prevPosIsValid=!1,this._spawnTimer=0,this.emit=void 0===e.emit||!!e.emit,this.autoUpdate=void 0!==e.autoUpdate&&!!e.autoUpdate}},t.prototype.recycle=function(t){t.next&&(t.next.prev=t.prev),t.prev&&(t.prev.next=t.next),t==this._activeParticlesLast&&(this._activeParticlesLast=t.prev),t==this._activeParticlesFirst&&(this._activeParticlesFirst=t.next),t.prev=null,t.next=this._poolFirst,this._poolFirst=t,t.parent&&t.parent.removeChild(t),--this.particleCount},t.prototype.rotate=function(t){if(this.rotation!=t){var e=t-this.rotation;this.rotation=t,s.default.rotatePoint(e,this.spawnPos),this._posChanged=!0}},t.prototype.updateSpawnPos=function(t,e){this._posChanged=!0,this.spawnPos.x=t,this.spawnPos.y=e},t.prototype.updateOwnerPos=function(t,e){this._posChanged=!0,this.ownerPos.x=t,this.ownerPos.y=e},t.prototype.resetPositionTracking=function(){this._prevPosIsValid=!1},Object.defineProperty(t.prototype,"emit",{get:function(){return this._emit},set:function(t){this._emit=!!t,this._emitterLife=this.emitterLifetime},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"autoUpdate",{get:function(){return this._autoUpdate},set:function(t){this._autoUpdate&&!t?n.remove(this.update,this):!this._autoUpdate&&t&&n.add(this.update,this),this._autoUpdate=!!t},enumerable:!0,configurable:!0}),t.prototype.playOnceAndDestroy=function(t){this.autoUpdate=!0,this.emit=!0,this._destroyWhenComplete=!0,this._completeCallback=t},t.prototype.playOnce=function(t){this.emit=!0,this._completeCallback=t},t.prototype.update=function(t){if(this._autoUpdate&&(t=t/PIXI.settings.TARGET_FPMS/1e3),this._parent){var e,i,s;for(i=this._activeParticlesFirst;i;i=s)s=i.next,i.update(t);var a,r;this._prevPosIsValid&&(a=this._prevEmitterPos.x,r=this._prevEmitterPos.y);var n=this.ownerPos.x+this.spawnPos.x,o=this.ownerPos.y+this.spawnPos.y;if(this._emit)for(this._spawnTimer-=t<0?0:t;this._spawnTimer<=0;){if(this._emitterLife>0&&(this._emitterLife-=this._frequency,this._emitterLife<=0)){this._spawnTimer=0,this._emitterLife=0,this.emit=!1;break}if(this.particleCount>=this.maxParticles)this._spawnTimer+=this._frequency;else{var h=void 0;if(h=this.minLifetime==this.maxLifetime?this.minLifetime:Math.random()*(this.maxLifetime-this.minLifetime)+this.minLifetime,-this._spawnTimer<h){var l=void 0,p=void 0;if(this._prevPosIsValid&&this._posChanged){var c=1+this._spawnTimer/t;l=(n-a)*c+a,p=(o-r)*c+r}else l=n,p=o;e=0;for(var u=Math.min(this.particlesPerWave,this.maxParticles-this.particleCount);e<u;++e)if(!(this.spawnChance<1&&Math.random()>=this.spawnChance)){var d=void 0;if(this._poolFirst?(d=this._poolFirst,this._poolFirst=this._poolFirst.next,d.next=null):d=new this.particleConstructor(this),this.particleImages.length>1?d.applyArt(this.particleImages[Math.floor(Math.random()*this.particleImages.length)]):d.applyArt(this.particleImages[0]),d.alphaList.reset(this.startAlpha),1!=this.minimumSpeedMultiplier&&(d.speedMultiplier=Math.random()*(1-this.minimumSpeedMultiplier)+this.minimumSpeedMultiplier),d.speedList.reset(this.startSpeed),d.acceleration.x=this.acceleration.x,d.acceleration.y=this.acceleration.y,d.maxSpeed=this.maxSpeed,1!=this.minimumScaleMultiplier&&(d.scaleMultiplier=Math.random()*(1-this.minimumScaleMultiplier)+this.minimumScaleMultiplier),d.scaleList.reset(this.startScale),d.colorList.reset(this.startColor),this.minRotationSpeed==this.maxRotationSpeed?d.rotationSpeed=this.minRotationSpeed:d.rotationSpeed=Math.random()*(this.maxRotationSpeed-this.minRotationSpeed)+this.minRotationSpeed,d.noRotation=this.noRotation,d.maxLife=h,d.blendMode=this.particleBlendMode,d.ease=this.customEase,d.extraData=this.extraData,this._spawnFunc(d,l,p,e),d.init(),d.update(-this._spawnTimer),d.parent){var f=this._parent.children;if(f[0]==d)f.shift();else if(f[f.length-1]==d)f.pop();else{var m=f.indexOf(d);f.splice(m,1)}this.addAtBack?f.unshift(d):f.push(d)}else this.addAtBack?this._parent.addChildAt(d,0):this._parent.addChild(d);this._activeParticlesLast?(this._activeParticlesLast.next=d,d.prev=this._activeParticlesLast,this._activeParticlesLast=d):this._activeParticlesLast=this._activeParticlesFirst=d,++this.particleCount}}this._spawnTimer+=this._frequency}}this._posChanged&&(this._prevEmitterPos.x=n,this._prevEmitterPos.y=o,this._prevPosIsValid=!0,this._posChanged=!1),this._emit||this._activeParticlesFirst||(this._completeCallback&&this._completeCallback(),this._destroyWhenComplete&&this.destroy())}},t.prototype._spawnPoint=function(t,e,i){this.minStartRotation==this.maxStartRotation?t.rotation=this.minStartRotation+this.rotation:t.rotation=Math.random()*(this.maxStartRotation-this.minStartRotation)+this.minStartRotation+this.rotation,t.position.x=e,t.position.y=i},t.prototype._spawnRect=function(t,e,i){this.minStartRotation==this.maxStartRotation?t.rotation=this.minStartRotation+this.rotation:t.rotation=Math.random()*(this.maxStartRotation-this.minStartRotation)+this.minStartRotation+this.rotation,o.x=Math.random()*this.spawnRect.width+this.spawnRect.x,o.y=Math.random()*this.spawnRect.height+this.spawnRect.y,0!==this.rotation&&s.default.rotatePoint(this.rotation,o),t.position.x=e+o.x,t.position.y=i+o.y},t.prototype._spawnCircle=function(t,e,i){this.minStartRotation==this.maxStartRotation?t.rotation=this.minStartRotation+this.rotation:t.rotation=Math.random()*(this.maxStartRotation-this.minStartRotation)+this.minStartRotation+this.rotation,o.x=Math.random()*this.spawnCircle.radius,o.y=0,s.default.rotatePoint(360*Math.random(),o),o.x+=this.spawnCircle.x,o.y+=this.spawnCircle.y,0!==this.rotation&&s.default.rotatePoint(this.rotation,o),t.position.x=e+o.x,t.position.y=i+o.y},t.prototype._spawnRing=function(t,e,i){var a=this.spawnCircle;this.minStartRotation==this.maxStartRotation?t.rotation=this.minStartRotation+this.rotation:t.rotation=Math.random()*(this.maxStartRotation-this.minStartRotation)+this.minStartRotation+this.rotation,a.minRadius!==a.radius?o.x=Math.random()*(a.radius-a.minRadius)+a.minRadius:o.x=a.radius,o.y=0;var r=360*Math.random();t.rotation+=r,s.default.rotatePoint(r,o),o.x+=this.spawnCircle.x,o.y+=this.spawnCircle.y,0!==this.rotation&&s.default.rotatePoint(this.rotation,o),t.position.x=e+o.x,t.position.y=i+o.y},t.prototype._spawnBurst=function(t,e,i,s){0===this.particleSpacing?t.rotation=360*Math.random():t.rotation=this.angleStart+this.particleSpacing*s+this.rotation,t.position.x=e,t.position.y=i},t.prototype.cleanup=function(){var t,e;for(t=this._activeParticlesFirst;t;t=e)e=t.next,this.recycle(t),t.parent&&t.parent.removeChild(t);this._activeParticlesFirst=this._activeParticlesLast=null,this.particleCount=0},t.prototype.destroy=function(){this.autoUpdate=!1,this.cleanup();for(var t,e=this._poolFirst;e;e=t)t=e.next,e.destroy();this._poolFirst=this._parent=this.particleImages=this.spawnPos=this.ownerPos=this.startColor=this.startScale=this.startAlpha=this.startSpeed=this.customEase=this._completeCallback=null},t}();i.default=h},{"./Particle":3,"./ParticleUtils":4,"./PropertyNode":7}],3:[function(t,e,i){"use strict";var s=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i])};return function(e,i){function s(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(s.prototype=i.prototype,new s)}}();Object.defineProperty(i,"__esModule",{value:!0});var a=t("./ParticleUtils"),r=t("./PropertyList"),n=PIXI.Sprite,o=function(t){function e(i){var s=t.call(this)||this;return s.emitter=i,s.anchor.x=s.anchor.y=.5,s.velocity=new PIXI.Point,s.maxLife=0,s.age=0,s.ease=null,s.extraData=null,s.alphaList=new r.default,s.speedList=new r.default,s.speedMultiplier=1,s.acceleration=new PIXI.Point,s.maxSpeed=NaN,s.scaleList=new r.default,s.scaleMultiplier=1,s.colorList=new r.default(!0),s._doAlpha=!1,s._doScale=!1,s._doSpeed=!1,s._doAcceleration=!1,s._doColor=!1,s._doNormalMovement=!1,s._oneOverLife=0,s.next=null,s.prev=null,s.init=s.init,s.Particle_init=e.prototype.init,s.update=s.update,s.Particle_update=e.prototype.update,s.Sprite_destroy=t.prototype.destroy,s.Particle_destroy=e.prototype.destroy,s.applyArt=s.applyArt,s.kill=s.kill,s}return s(e,t),e.prototype.init=function(){this.age=0,this.velocity.x=this.speedList.current.value*this.speedMultiplier,this.velocity.y=0,a.default.rotatePoint(this.rotation,this.velocity),this.noRotation?this.rotation=0:this.rotation*=a.default.DEG_TO_RADS,this.rotationSpeed*=a.default.DEG_TO_RADS,this.alpha=this.alphaList.current.value,this.scale.x=this.scale.y=this.scaleList.current.value,this._doAlpha=!!this.alphaList.current.next,this._doSpeed=!!this.speedList.current.next,this._doScale=!!this.scaleList.current.next,this._doColor=!!this.colorList.current.next,this._doAcceleration=0!==this.acceleration.x||0!==this.acceleration.y,this._doNormalMovement=this._doSpeed||0!==this.speedList.current.value||this._doAcceleration,this._oneOverLife=1/this.maxLife;var t=this.colorList.current.value;this.tint=a.default.combineRGBComponents(t.r,t.g,t.b),this.visible=!0},e.prototype.applyArt=function(t){this.texture=t||PIXI.Texture.EMPTY},e.prototype.update=function(t){if(this.age+=t,this.age>=this.maxLife||this.age<0)return this.kill(),-1;var e=this.age*this._oneOverLife;if(this.ease&&(e=4==this.ease.length?this.ease(e,0,1,1):this.ease(e)),this._doAlpha&&(this.alpha=this.alphaList.interpolate(e)),this._doScale){var i=this.scaleList.interpolate(e)*this.scaleMultiplier;this.scale.x=this.scale.y=i}if(this._doNormalMovement){if(this._doSpeed){var s=this.speedList.interpolate(e)*this.speedMultiplier;a.default.normalize(this.velocity),a.default.scaleBy(this.velocity,s)}else if(this._doAcceleration&&(this.velocity.x+=this.acceleration.x*t,this.velocity.y+=this.acceleration.y*t,this.maxSpeed)){var r=a.default.length(this.velocity);r>this.maxSpeed&&a.default.scaleBy(this.velocity,this.maxSpeed/r)}this.position.x+=this.velocity.x*t,this.position.y+=this.velocity.y*t}return this._doColor&&(this.tint=this.colorList.interpolate(e)),0!==this.rotationSpeed?this.rotation+=this.rotationSpeed*t:this.acceleration&&!this.noRotation&&(this.rotation=Math.atan2(this.velocity.y,this.velocity.x)),e},e.prototype.kill=function(){this.emitter.recycle(this)},e.prototype.destroy=function(){this.parent&&this.parent.removeChild(this),this.Sprite_destroy(),this.emitter=this.velocity=this.colorList=this.scaleList=this.alphaList=this.speedList=this.ease=this.next=this.prev=null},e.parseArt=function(t){var e;for(e=t.length;e>=0;--e)"string"==typeof t[e]&&(t[e]=PIXI.Texture.fromImage(t[e]));if(a.default.verbose)for(e=t.length-1;e>0;--e)if(t[e].baseTexture!=t[e-1].baseTexture){window.console&&console.warn("PixiParticles: using particle textures from different images may hinder performance in WebGL");break}return t},e.parseData=function(t){return t},e}(n);i.default=o},{"./ParticleUtils":4,"./PropertyList":6}],4:[function(t,e,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var s=PIXI.BLEND_MODES,a=t("./PropertyNode"),r={verbose:!1,DEG_TO_RADS:Math.PI/180,rotatePoint:function(t,e){if(t){t*=r.DEG_TO_RADS;var i=Math.sin(t),s=Math.cos(t),a=e.x*s-e.y*i,n=e.x*i+e.y*s;e.x=a,e.y=n}},combineRGBComponents:function(t,e,i){return t<<16|e<<8|i},normalize:function(t){var e=1/r.length(t);t.x*=e,t.y*=e},scaleBy:function(t,e){t.x*=e,t.y*=e},length:function(t){return Math.sqrt(t.x*t.x+t.y*t.y)},hexToRGB:function(t,e){e||(e={}),"#"==t.charAt(0)?t=t.substr(1):0===t.indexOf("0x")&&(t=t.substr(2));var i;return 8==t.length&&(i=t.substr(0,2),t=t.substr(2)),e.r=parseInt(t.substr(0,2),16),e.g=parseInt(t.substr(2,2),16),e.b=parseInt(t.substr(4,2),16),i&&(e.a=parseInt(i,16)),e},generateEase:function(t){var e=t.length,i=1/e;return function(s){var a,r,n=e*s|0;return a=(s-n*i)*e,r=t[n]||t[e-1],r.s+a*(2*(1-a)*(r.cp-r.s)+a*(r.e-r.s))}},getBlendMode:function(t){if(!t)return s.NORMAL;for(t=t.toUpperCase();t.indexOf(" ")>=0;)t=t.replace(" ","_");return s[t]||s.NORMAL},createSteppedGradient:function(t,e){void 0===e&&(e=10),("number"!=typeof e||e<=0)&&(e=10);var i=new a.default(t[0].value,t[0].time);i.isStepped=!0;for(var s=i,n=t[0],o=1,h=t[o],l=1;l<e;++l){for(var p=l/e;p>h.time;)n=h,h=t[++o];p=(p-n.time)/(h.time-n.time);var c=r.hexToRGB(n.value),u=r.hexToRGB(h.value),d={};d.r=(u.r-c.r)*p+c.r,d.g=(u.g-c.g)*p+c.g,d.b=(u.b-c.b)*p+c.b,s.next=new a.default(d,l/e),s=s.next}return i}};i.default=r},{"./PropertyNode":7}],5:[function(t,e,i){"use strict";var s=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i])};return function(e,i){function s(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(s.prototype=i.prototype,new s)}}();Object.defineProperty(i,"__esModule",{value:!0});var a=t("./ParticleUtils"),r=t("./Particle"),n=new PIXI.Point,o=["pow","sqrt","abs","floor","round","ceil","E","PI","sin","cos","tan","asin","acos","atan","atan2","log"],h=new RegExp(["[01234567890\\.\\*\\-\\+\\/\\(\\)x ,]"].concat(o).join("|"),"g"),l=function(t){for(var e=t.match(h),i=e.length-1;i>=0;--i)o.indexOf(e[i])>=0&&(e[i]="Math."+e[i]);return t=e.join(""),new Function("x","return "+t+";")},p=function(t){function e(e){var i=t.call(this,e)||this;return i.path=null,i.initialRotation=0,i.initialPosition=new PIXI.Point,i.movement=0,i}return s(e,t),e.prototype.init=function(){this.initialRotation=this.rotation,this.Particle_init(),this.path=this.extraData.path,this._doNormalMovement=!this.path,this.movement=0,this.initialPosition.x=this.position.x,this.initialPosition.y=this.position.y},e.prototype.update=function(t){var e=this.Particle_update(t);if(e>=0&&this.path){var i=this.speedList.interpolate(e)*this.speedMultiplier;this.movement+=i*t,n.x=this.movement,n.y=this.path(this.movement),a.default.rotatePoint(this.initialRotation,n),this.position.x=this.initialPosition.x+n.x,this.position.y=this.initialPosition.y+n.y}return e},e.prototype.destroy=function(){this.Particle_destroy(),this.path=this.initialPosition=null},e.parseArt=function(t){return r.default.parseArt(t)},e.parseData=function(t){var e={};if(t&&t.path)try{e.path=l(t.path)}catch(t){a.default.verbose&&console.error("PathParticle: error in parsing path expression"),e.path=null}else a.default.verbose&&console.error("PathParticle requires a path string in extraData!"),e.path=null;return e},e}(r.default);i.default=p},{"./Particle":3,"./ParticleUtils":4}],6:[function(t,e,i){"use strict";function s(t){return this.ease&&(t=this.ease(t)),(this.next.value-this.current.value)*t+this.current.value}function a(t){this.ease&&(t=this.ease(t));var e=this.current.value,i=this.next.value,s=(i.r-e.r)*t+e.r,a=(i.g-e.g)*t+e.g,r=(i.b-e.b)*t+e.b;return l.default.combineRGBComponents(s,a,r)}function r(t){for(this.ease&&(t=this.ease(t));t>this.next.time;)this.current=this.next,this.next=this.next.next;return t=(t-this.current.time)/(this.next.time-this.current.time),(this.next.value-this.current.value)*t+this.current.value}function n(t){for(this.ease&&(t=this.ease(t));t>this.next.time;)this.current=this.next,this.next=this.next.next;t=(t-this.current.time)/(this.next.time-this.current.time);var e=this.current.value,i=this.next.value,s=(i.r-e.r)*t+e.r,a=(i.g-e.g)*t+e.g,r=(i.b-e.b)*t+e.b;return l.default.combineRGBComponents(s,a,r)}function o(t){for(this.ease&&(t=this.ease(t));this.next&&t>this.next.time;)this.current=this.next,this.next=this.next.next;return this.current.value}function h(t){for(this.ease&&(t=this.ease(t));this.next&&t>this.next.time;)this.current=this.next,this.next=this.next.next;var e=this.current.value;return l.default.combineRGBComponents(e.r,e.g,e.b)}Object.defineProperty(i,"__esModule",{value:!0});var l=t("./ParticleUtils"),p=function(){function t(t){void 0===t&&(t=!1),this.current=null,this.next=null,this.isColor=!!t,this.interpolate=null,this.ease=null}return t.prototype.reset=function(t){this.current=t,this.next=t.next,this.next&&this.next.time>=1?this.interpolate=this.isColor?a:s:t.isStepped?this.interpolate=this.isColor?h:o:this.interpolate=this.isColor?n:r,this.ease=this.current.ease},t}();i.default=p},{"./ParticleUtils":4}],7:[function(t,e,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var s=t("./ParticleUtils"),a=function(){function t(t,e,i){this.value="string"==typeof t?s.default.hexToRGB(t):t,this.time=e,this.next=null,this.isStepped=!1,this.ease=i?"function"==typeof i?i:s.default.generateEase(i):null}return t.createList=function(e){if(Array.isArray(e.list)){var i=e.list,s=void 0,a=void 0;if(a=s=new t(i[0].value,i[0].time,e.ease),i.length>2||2===i.length&&i[1].value!==i[0].value)for(var r=1;r<i.length;++r)s.next=new t(i[r].value,i[r].time),s=s.next;return a.isStepped=!!e.isStepped,a}var n=new t(e.start,0);return e.end!==e.start&&(n.next=new t(e.end,1)),n},t}();i.default=a},{"./ParticleUtils":4}],8:[function(t,e,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var s=t("./ParticleUtils.js");i.ParticleUtils=s.default;var a=t("./Particle.js");i.Particle=a.default;var r=t("./Emitter.js");i.Emitter=r.default;var n=t("./PathParticle.js");i.PathParticle=n.default;var o=t("./AnimatedParticle.js");i.AnimatedParticle=o.default},{"./AnimatedParticle.js":1,"./Emitter.js":2,"./Particle.js":3,"./ParticleUtils.js":4,"./PathParticle.js":5}],9:[function(t,e,i){"use strict";if(Object.defineProperty(i,"__esModule",{value:!0}),"undefined"==typeof PIXI)throw"pixi-particles requires pixi.js to be loaded first";PIXI.particles||(PIXI.particles={});var s=t("./particles");for(var a in s)PIXI.particles[a]=s[a];void 0!==e&&e.exports&&(e.exports=s)},{"./particles":8}]},{},[9])(9)});


/***/ }),

/***/ "./node_modules/poly-decomp/src/Line.js":
/*!**********************************************!*\
  !*** ./node_modules/poly-decomp/src/Line.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Scalar = __webpack_require__(/*! ./Scalar */ "./node_modules/poly-decomp/src/Scalar.js");

module.exports = Line;

/**
 * Container for line-related functions
 * @class Line
 */
function Line(){};

/**
 * Compute the intersection between two lines.
 * @static
 * @method lineInt
 * @param  {Array}  l1          Line vector 1
 * @param  {Array}  l2          Line vector 2
 * @param  {Number} precision   Precision to use when checking if the lines are parallel
 * @return {Array}              The intersection point.
 */
Line.lineInt = function(l1,l2,precision){
    precision = precision || 0;
    var i = [0,0]; // point
    var a1, b1, c1, a2, b2, c2, det; // scalars
    a1 = l1[1][1] - l1[0][1];
    b1 = l1[0][0] - l1[1][0];
    c1 = a1 * l1[0][0] + b1 * l1[0][1];
    a2 = l2[1][1] - l2[0][1];
    b2 = l2[0][0] - l2[1][0];
    c2 = a2 * l2[0][0] + b2 * l2[0][1];
    det = a1 * b2 - a2*b1;
    if (!Scalar.eq(det, 0, precision)) { // lines are not parallel
        i[0] = (b2 * c1 - b1 * c2) / det;
        i[1] = (a1 * c2 - a2 * c1) / det;
    }
    return i;
};

/**
 * Checks if two line segments intersects.
 * @method segmentsIntersect
 * @param {Array} p1 The start vertex of the first line segment.
 * @param {Array} p2 The end vertex of the first line segment.
 * @param {Array} q1 The start vertex of the second line segment.
 * @param {Array} q2 The end vertex of the second line segment.
 * @return {Boolean} True if the two line segments intersect
 */
Line.segmentsIntersect = function(p1, p2, q1, q2){
   var dx = p2[0] - p1[0];
   var dy = p2[1] - p1[1];
   var da = q2[0] - q1[0];
   var db = q2[1] - q1[1];

   // segments are parallel
   if(da*dy - db*dx == 0)
      return false;

   var s = (dx * (q1[1] - p1[1]) + dy * (p1[0] - q1[0])) / (da * dy - db * dx)
   var t = (da * (p1[1] - q1[1]) + db * (q1[0] - p1[0])) / (db * dx - da * dy)

   return (s>=0 && s<=1 && t>=0 && t<=1);
};



/***/ }),

/***/ "./node_modules/poly-decomp/src/Point.js":
/*!***********************************************!*\
  !*** ./node_modules/poly-decomp/src/Point.js ***!
  \***********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = Point;

/**
 * Point related functions
 * @class Point
 */
function Point(){};

/**
 * Get the area of a triangle spanned by the three given points. Note that the area will be negative if the points are not given in counter-clockwise order.
 * @static
 * @method area
 * @param  {Array} a
 * @param  {Array} b
 * @param  {Array} c
 * @return {Number}
 */
Point.area = function(a,b,c){
    return (((b[0] - a[0])*(c[1] - a[1]))-((c[0] - a[0])*(b[1] - a[1])));
};

Point.left = function(a,b,c){
    return Point.area(a,b,c) > 0;
};

Point.leftOn = function(a,b,c) {
    return Point.area(a, b, c) >= 0;
};

Point.right = function(a,b,c) {
    return Point.area(a, b, c) < 0;
};

Point.rightOn = function(a,b,c) {
    return Point.area(a, b, c) <= 0;
};

var tmpPoint1 = [],
    tmpPoint2 = [];

/**
 * Check if three points are collinear
 * @method collinear
 * @param  {Array} a
 * @param  {Array} b
 * @param  {Array} c
 * @param  {Number} [thresholdAngle=0] Threshold angle to use when comparing the vectors. The function will return true if the angle between the resulting vectors is less than this value. Use zero for max precision.
 * @return {Boolean}
 */
Point.collinear = function(a,b,c,thresholdAngle) {
    if(!thresholdAngle)
        return Point.area(a, b, c) == 0;
    else {
        var ab = tmpPoint1,
            bc = tmpPoint2;

        ab[0] = b[0]-a[0];
        ab[1] = b[1]-a[1];
        bc[0] = c[0]-b[0];
        bc[1] = c[1]-b[1];

        var dot = ab[0]*bc[0] + ab[1]*bc[1],
            magA = Math.sqrt(ab[0]*ab[0] + ab[1]*ab[1]),
            magB = Math.sqrt(bc[0]*bc[0] + bc[1]*bc[1]),
            angle = Math.acos(dot/(magA*magB));
        return angle < thresholdAngle;
    }
};

Point.sqdist = function(a,b){
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    return dx * dx + dy * dy;
};


/***/ }),

/***/ "./node_modules/poly-decomp/src/Polygon.js":
/*!*************************************************!*\
  !*** ./node_modules/poly-decomp/src/Polygon.js ***!
  \*************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var Line = __webpack_require__(/*! ./Line */ "./node_modules/poly-decomp/src/Line.js")
,   Point = __webpack_require__(/*! ./Point */ "./node_modules/poly-decomp/src/Point.js")
,   Scalar = __webpack_require__(/*! ./Scalar */ "./node_modules/poly-decomp/src/Scalar.js")

module.exports = Polygon;

/**
 * Polygon class.
 * @class Polygon
 * @constructor
 */
function Polygon(){

    /**
     * Vertices that this polygon consists of. An array of array of numbers, example: [[0,0],[1,0],..]
     * @property vertices
     * @type {Array}
     */
    this.vertices = [];
}

/**
 * Get a vertex at position i. It does not matter if i is out of bounds, this function will just cycle.
 * @method at
 * @param  {Number} i
 * @return {Array}
 */
Polygon.prototype.at = function(i){
    var v = this.vertices,
        s = v.length;
    return v[i < 0 ? i % s + s : i % s];
};

/**
 * Get first vertex
 * @method first
 * @return {Array}
 */
Polygon.prototype.first = function(){
    return this.vertices[0];
};

/**
 * Get last vertex
 * @method last
 * @return {Array}
 */
Polygon.prototype.last = function(){
    return this.vertices[this.vertices.length-1];
};

/**
 * Clear the polygon data
 * @method clear
 * @return {Array}
 */
Polygon.prototype.clear = function(){
    this.vertices.length = 0;
};

/**
 * Append points "from" to "to"-1 from an other polygon "poly" onto this one.
 * @method append
 * @param {Polygon} poly The polygon to get points from.
 * @param {Number}  from The vertex index in "poly".
 * @param {Number}  to The end vertex index in "poly". Note that this vertex is NOT included when appending.
 * @return {Array}
 */
Polygon.prototype.append = function(poly,from,to){
    if(typeof(from) == "undefined") throw new Error("From is not given!");
    if(typeof(to) == "undefined")   throw new Error("To is not given!");

    if(to-1 < from)                 throw new Error("lol1");
    if(to > poly.vertices.length)   throw new Error("lol2");
    if(from < 0)                    throw new Error("lol3");

    for(var i=from; i<to; i++){
        this.vertices.push(poly.vertices[i]);
    }
};

/**
 * Make sure that the polygon vertices are ordered counter-clockwise.
 * @method makeCCW
 */
Polygon.prototype.makeCCW = function(){
    var br = 0,
        v = this.vertices;

    // find bottom right point
    for (var i = 1; i < this.vertices.length; ++i) {
        if (v[i][1] < v[br][1] || (v[i][1] == v[br][1] && v[i][0] > v[br][0])) {
            br = i;
        }
    }

    // reverse poly if clockwise
    if (!Point.left(this.at(br - 1), this.at(br), this.at(br + 1))) {
        this.reverse();
    }
};

/**
 * Reverse the vertices in the polygon
 * @method reverse
 */
Polygon.prototype.reverse = function(){
    var tmp = [];
    for(var i=0, N=this.vertices.length; i!==N; i++){
        tmp.push(this.vertices.pop());
    }
    this.vertices = tmp;
};

/**
 * Check if a point in the polygon is a reflex point
 * @method isReflex
 * @param  {Number}  i
 * @return {Boolean}
 */
Polygon.prototype.isReflex = function(i){
    return Point.right(this.at(i - 1), this.at(i), this.at(i + 1));
};

var tmpLine1=[],
    tmpLine2=[];

/**
 * Check if two vertices in the polygon can see each other
 * @method canSee
 * @param  {Number} a Vertex index 1
 * @param  {Number} b Vertex index 2
 * @return {Boolean}
 */
Polygon.prototype.canSee = function(a,b) {
    var p, dist, l1=tmpLine1, l2=tmpLine2;

    if (Point.leftOn(this.at(a + 1), this.at(a), this.at(b)) && Point.rightOn(this.at(a - 1), this.at(a), this.at(b))) {
        return false;
    }
    dist = Point.sqdist(this.at(a), this.at(b));
    for (var i = 0; i !== this.vertices.length; ++i) { // for each edge
        if ((i + 1) % this.vertices.length === a || i === a) // ignore incident edges
            continue;
        if (Point.leftOn(this.at(a), this.at(b), this.at(i + 1)) && Point.rightOn(this.at(a), this.at(b), this.at(i))) { // if diag intersects an edge
            l1[0] = this.at(a);
            l1[1] = this.at(b);
            l2[0] = this.at(i);
            l2[1] = this.at(i + 1);
            p = Line.lineInt(l1,l2);
            if (Point.sqdist(this.at(a), p) < dist) { // if edge is blocking visibility to b
                return false;
            }
        }
    }

    return true;
};

/**
 * Copy the polygon from vertex i to vertex j.
 * @method copy
 * @param  {Number} i
 * @param  {Number} j
 * @param  {Polygon} [targetPoly]   Optional target polygon to save in.
 * @return {Polygon}                The resulting copy.
 */
Polygon.prototype.copy = function(i,j,targetPoly){
    var p = targetPoly || new Polygon();
    p.clear();
    if (i < j) {
        // Insert all vertices from i to j
        for(var k=i; k<=j; k++)
            p.vertices.push(this.vertices[k]);

    } else {

        // Insert vertices 0 to j
        for(var k=0; k<=j; k++)
            p.vertices.push(this.vertices[k]);

        // Insert vertices i to end
        for(var k=i; k<this.vertices.length; k++)
            p.vertices.push(this.vertices[k]);
    }

    return p;
};

/**
 * Decomposes the polygon into convex pieces. Returns a list of edges [[p1,p2],[p2,p3],...] that cuts the polygon.
 * Note that this algorithm has complexity O(N^4) and will be very slow for polygons with many vertices.
 * @method getCutEdges
 * @return {Array}
 */
Polygon.prototype.getCutEdges = function() {
    var min=[], tmp1=[], tmp2=[], tmpPoly = new Polygon();
    var nDiags = Number.MAX_VALUE;

    for (var i = 0; i < this.vertices.length; ++i) {
        if (this.isReflex(i)) {
            for (var j = 0; j < this.vertices.length; ++j) {
                if (this.canSee(i, j)) {
                    tmp1 = this.copy(i, j, tmpPoly).getCutEdges();
                    tmp2 = this.copy(j, i, tmpPoly).getCutEdges();

                    for(var k=0; k<tmp2.length; k++)
                        tmp1.push(tmp2[k]);

                    if (tmp1.length < nDiags) {
                        min = tmp1;
                        nDiags = tmp1.length;
                        min.push([this.at(i), this.at(j)]);
                    }
                }
            }
        }
    }

    return min;
};

/**
 * Decomposes the polygon into one or more convex sub-Polygons.
 * @method decomp
 * @return {Array} An array or Polygon objects.
 */
Polygon.prototype.decomp = function(){
    var edges = this.getCutEdges();
    if(edges.length > 0)
        return this.slice(edges);
    else
        return [this];
};

/**
 * Slices the polygon given one or more cut edges. If given one, this function will return two polygons (false on failure). If many, an array of polygons.
 * @method slice
 * @param {Array} cutEdges A list of edges, as returned by .getCutEdges()
 * @return {Array}
 */
Polygon.prototype.slice = function(cutEdges){
    if(cutEdges.length == 0) return [this];
    if(cutEdges instanceof Array && cutEdges.length && cutEdges[0] instanceof Array && cutEdges[0].length==2 && cutEdges[0][0] instanceof Array){

        var polys = [this];

        for(var i=0; i<cutEdges.length; i++){
            var cutEdge = cutEdges[i];
            // Cut all polys
            for(var j=0; j<polys.length; j++){
                var poly = polys[j];
                var result = poly.slice(cutEdge);
                if(result){
                    // Found poly! Cut and quit
                    polys.splice(j,1);
                    polys.push(result[0],result[1]);
                    break;
                }
            }
        }

        return polys;
    } else {

        // Was given one edge
        var cutEdge = cutEdges;
        var i = this.vertices.indexOf(cutEdge[0]);
        var j = this.vertices.indexOf(cutEdge[1]);

        if(i != -1 && j != -1){
            return [this.copy(i,j),
                    this.copy(j,i)];
        } else {
            return false;
        }
    }
};

/**
 * Checks that the line segments of this polygon do not intersect each other.
 * @method isSimple
 * @param  {Array} path An array of vertices e.g. [[0,0],[0,1],...]
 * @return {Boolean}
 * @todo Should it check all segments with all others?
 */
Polygon.prototype.isSimple = function(){
    var path = this.vertices;
    // Check
    for(var i=0; i<path.length-1; i++){
        for(var j=0; j<i-1; j++){
            if(Line.segmentsIntersect(path[i], path[i+1], path[j], path[j+1] )){
                return false;
            }
        }
    }

    // Check the segment between the last and the first point to all others
    for(var i=1; i<path.length-2; i++){
        if(Line.segmentsIntersect(path[0], path[path.length-1], path[i], path[i+1] )){
            return false;
        }
    }

    return true;
};

function getIntersectionPoint(p1, p2, q1, q2, delta){
    delta = delta || 0;
   var a1 = p2[1] - p1[1];
   var b1 = p1[0] - p2[0];
   var c1 = (a1 * p1[0]) + (b1 * p1[1]);
   var a2 = q2[1] - q1[1];
   var b2 = q1[0] - q2[0];
   var c2 = (a2 * q1[0]) + (b2 * q1[1]);
   var det = (a1 * b2) - (a2 * b1);

   if(!Scalar.eq(det,0,delta))
      return [((b2 * c1) - (b1 * c2)) / det, ((a1 * c2) - (a2 * c1)) / det]
   else
      return [0,0]
}

/**
 * Quickly decompose the Polygon into convex sub-polygons.
 * @method quickDecomp
 * @param  {Array} result
 * @param  {Array} [reflexVertices]
 * @param  {Array} [steinerPoints]
 * @param  {Number} [delta]
 * @param  {Number} [maxlevel]
 * @param  {Number} [level]
 * @return {Array}
 */
Polygon.prototype.quickDecomp = function(result,reflexVertices,steinerPoints,delta,maxlevel,level){
    maxlevel = maxlevel || 100;
    level = level || 0;
    delta = delta || 25;
    result = typeof(result)!="undefined" ? result : [];
    reflexVertices = reflexVertices || [];
    steinerPoints = steinerPoints || [];

    var upperInt=[0,0], lowerInt=[0,0], p=[0,0]; // Points
    var upperDist=0, lowerDist=0, d=0, closestDist=0; // scalars
    var upperIndex=0, lowerIndex=0, closestIndex=0; // Integers
    var lowerPoly=new Polygon(), upperPoly=new Polygon(); // polygons
    var poly = this,
        v = this.vertices;

    if(v.length < 3) return result;

    level++;
    if(level > maxlevel){
        console.warn("quickDecomp: max level ("+maxlevel+") reached.");
        return result;
    }

    for (var i = 0; i < this.vertices.length; ++i) {
        if (poly.isReflex(i)) {
            reflexVertices.push(poly.vertices[i]);
            upperDist = lowerDist = Number.MAX_VALUE;


            for (var j = 0; j < this.vertices.length; ++j) {
                if (Point.left(poly.at(i - 1), poly.at(i), poly.at(j))
                        && Point.rightOn(poly.at(i - 1), poly.at(i), poly.at(j - 1))) { // if line intersects with an edge
                    p = getIntersectionPoint(poly.at(i - 1), poly.at(i), poly.at(j), poly.at(j - 1)); // find the point of intersection
                    if (Point.right(poly.at(i + 1), poly.at(i), p)) { // make sure it's inside the poly
                        d = Point.sqdist(poly.vertices[i], p);
                        if (d < lowerDist) { // keep only the closest intersection
                            lowerDist = d;
                            lowerInt = p;
                            lowerIndex = j;
                        }
                    }
                }
                if (Point.left(poly.at(i + 1), poly.at(i), poly.at(j + 1))
                        && Point.rightOn(poly.at(i + 1), poly.at(i), poly.at(j))) {
                    p = getIntersectionPoint(poly.at(i + 1), poly.at(i), poly.at(j), poly.at(j + 1));
                    if (Point.left(poly.at(i - 1), poly.at(i), p)) {
                        d = Point.sqdist(poly.vertices[i], p);
                        if (d < upperDist) {
                            upperDist = d;
                            upperInt = p;
                            upperIndex = j;
                        }
                    }
                }
            }

            // if there are no vertices to connect to, choose a point in the middle
            if (lowerIndex == (upperIndex + 1) % this.vertices.length) {
                //console.log("Case 1: Vertex("+i+"), lowerIndex("+lowerIndex+"), upperIndex("+upperIndex+"), poly.size("+this.vertices.length+")");
                p[0] = (lowerInt[0] + upperInt[0]) / 2;
                p[1] = (lowerInt[1] + upperInt[1]) / 2;
                steinerPoints.push(p);

                if (i < upperIndex) {
                    //lowerPoly.insert(lowerPoly.end(), poly.begin() + i, poly.begin() + upperIndex + 1);
                    lowerPoly.append(poly, i, upperIndex+1);
                    lowerPoly.vertices.push(p);
                    upperPoly.vertices.push(p);
                    if (lowerIndex != 0){
                        //upperPoly.insert(upperPoly.end(), poly.begin() + lowerIndex, poly.end());
                        upperPoly.append(poly,lowerIndex,poly.vertices.length);
                    }
                    //upperPoly.insert(upperPoly.end(), poly.begin(), poly.begin() + i + 1);
                    upperPoly.append(poly,0,i+1);
                } else {
                    if (i != 0){
                        //lowerPoly.insert(lowerPoly.end(), poly.begin() + i, poly.end());
                        lowerPoly.append(poly,i,poly.vertices.length);
                    }
                    //lowerPoly.insert(lowerPoly.end(), poly.begin(), poly.begin() + upperIndex + 1);
                    lowerPoly.append(poly,0,upperIndex+1);
                    lowerPoly.vertices.push(p);
                    upperPoly.vertices.push(p);
                    //upperPoly.insert(upperPoly.end(), poly.begin() + lowerIndex, poly.begin() + i + 1);
                    upperPoly.append(poly,lowerIndex,i+1);
                }
            } else {
                // connect to the closest point within the triangle
                //console.log("Case 2: Vertex("+i+"), closestIndex("+closestIndex+"), poly.size("+this.vertices.length+")\n");

                if (lowerIndex > upperIndex) {
                    upperIndex += this.vertices.length;
                }
                closestDist = Number.MAX_VALUE;

                if(upperIndex < lowerIndex){
                    return result;
                }

                for (var j = lowerIndex; j <= upperIndex; ++j) {
                    if (Point.leftOn(poly.at(i - 1), poly.at(i), poly.at(j))
                            && Point.rightOn(poly.at(i + 1), poly.at(i), poly.at(j))) {
                        d = Point.sqdist(poly.at(i), poly.at(j));
                        if (d < closestDist) {
                            closestDist = d;
                            closestIndex = j % this.vertices.length;
                        }
                    }
                }

                if (i < closestIndex) {
                    lowerPoly.append(poly,i,closestIndex+1);
                    if (closestIndex != 0){
                        upperPoly.append(poly,closestIndex,v.length);
                    }
                    upperPoly.append(poly,0,i+1);
                } else {
                    if (i != 0){
                        lowerPoly.append(poly,i,v.length);
                    }
                    lowerPoly.append(poly,0,closestIndex+1);
                    upperPoly.append(poly,closestIndex,i+1);
                }
            }

            // solve smallest poly first
            if (lowerPoly.vertices.length < upperPoly.vertices.length) {
                lowerPoly.quickDecomp(result,reflexVertices,steinerPoints,delta,maxlevel,level);
                upperPoly.quickDecomp(result,reflexVertices,steinerPoints,delta,maxlevel,level);
            } else {
                upperPoly.quickDecomp(result,reflexVertices,steinerPoints,delta,maxlevel,level);
                lowerPoly.quickDecomp(result,reflexVertices,steinerPoints,delta,maxlevel,level);
            }

            return result;
        }
    }
    result.push(this);

    return result;
};

/**
 * Remove collinear points in the polygon.
 * @method removeCollinearPoints
 * @param  {Number} [precision] The threshold angle to use when determining whether two edges are collinear. Use zero for finest precision.
 * @return {Number}           The number of points removed
 */
Polygon.prototype.removeCollinearPoints = function(precision){
    var num = 0;
    for(var i=this.vertices.length-1; this.vertices.length>3 && i>=0; --i){
        if(Point.collinear(this.at(i-1),this.at(i),this.at(i+1),precision)){
            // Remove the middle point
            this.vertices.splice(i%this.vertices.length,1);
            i--; // Jump one point forward. Otherwise we may get a chain removal
            num++;
        }
    }
    return num;
};


/***/ }),

/***/ "./node_modules/poly-decomp/src/Scalar.js":
/*!************************************************!*\
  !*** ./node_modules/poly-decomp/src/Scalar.js ***!
  \************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = Scalar;

/**
 * Scalar functions
 * @class Scalar
 */
function Scalar(){}

/**
 * Check if two scalars are equal
 * @static
 * @method eq
 * @param  {Number} a
 * @param  {Number} b
 * @param  {Number} [precision]
 * @return {Boolean}
 */
Scalar.eq = function(a,b,precision){
    precision = precision || 0;
    return Math.abs(a-b) < precision;
};


/***/ }),

/***/ "./node_modules/poly-decomp/src/index.js":
/*!***********************************************!*\
  !*** ./node_modules/poly-decomp/src/index.js ***!
  \***********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
    Polygon : __webpack_require__(/*! ./Polygon */ "./node_modules/poly-decomp/src/Polygon.js"),
    Point : __webpack_require__(/*! ./Point */ "./node_modules/poly-decomp/src/Point.js"),
};


/***/ }),

/***/ "./node_modules/tslib/tslib.es6.js":
/*!*****************************************!*\
  !*** ./node_modules/tslib/tslib.es6.js ***!
  \*****************************************/
/*! exports provided: __extends, __assign, __rest, __decorate, __param, __metadata, __awaiter, __generator, __exportStar, __values, __read, __spread, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__extends", function() { return __extends; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__assign", function() { return __assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__rest", function() { return __rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__decorate", function() { return __decorate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__param", function() { return __param; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__metadata", function() { return __metadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__awaiter", function() { return __awaiter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__generator", function() { return __generator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__exportStar", function() { return __exportStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__values", function() { return __values; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__read", function() { return __read; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spread", function() { return __spread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__await", function() { return __await; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncGenerator", function() { return __asyncGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncDelegator", function() { return __asyncDelegator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncValues", function() { return __asyncValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__makeTemplateObject", function() { return __makeTemplateObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importStar", function() { return __importStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importDefault", function() { return __importDefault; });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __exportStar(m, exports) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}


/***/ })

}]);