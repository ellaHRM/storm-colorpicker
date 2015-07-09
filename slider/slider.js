(function (window) {
  var uniqueId = 0;
  // TODO not so elegant way to determine active thumb, although ...
  var capturedThumb;

  /**
   *
   * @param e
   * @param eventName
   */
  function delegateEvt(e, eventName) {
    if (capturedThumb) {
      var evt,
        evtType = eventName + '-' + capturedThumb.parentElement.getAttribute('unique-id');

      try {
        evt = new MouseEvent(evtType, e);
      } catch (err) {
        evt = document.createEvent("MouseEvents");
        // IE compatibility
        evt.initMouseEvent(evtType, true, true, "window", e.detail, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
      }
      document.dispatchEvent(evt);
    }
  }

  /**
   *
   * @param attachTo
   * @param direction
   * @returns {{setValue: (Function), showTip: (Function), hideTip: (Function)}}
   * @constructor
   * @param caption
   */
  function Slider(attachTo, direction, caption) {
    var self = this,
      C = {
        DIR_HORIZONTAL: 'horizontal',
        DIR_VERTICAL: 'vertical',
        MAX_VALUE: 255
      },
      trackRect = {},
      thumbRect = {},
      thumbHalfWidth,
      thumbHalfHeight,
      sliderLength,
      ratio,
      // offset between tip and thumb (just custom value)
      tipThumbOffset = 3;

    self.value = 0;

    self.thumbState = {
      captured: false,
      slides: false
    };

    self.uniqueId = uniqueId;
    self.subscribers = {
      change: []
    };

    /**
     * Parse and set defaults for constructor. First action
     * @param args
     */
    function parseArguments(args) {
      var opts = {};

      if (args.length === 2 && typeof direction === 'object') {
        opts = Object.create(direction);

        // direction
        direction = opts.direction ? opts.direction : C.DIR_HORIZONTAL;
        // value
        if (opts.value) {
          self.value = (opts.value < 0 || opts.value > C.MAX_VALUE) ? (C.MAX_VALUE / 2) : opts.value;
        }
        // caption
        caption = opts.caption || '';
      }

      // thumb direction
      self.thumbDirection = opts.thumbDirection ? opts.thumbDirection : (direction === C.DIR_HORIZONTAL) ? 'top' : 'left';
    }

    /**
     * Init module
     */
    self.init = function() {
      self.buildSlider();
      self.buildTrack();
      self.buildThumb();
      self.bindEvents();
      self.buildTip();
      self.glueComponents();
    };

    /**
     * Creates and sets up slider element
     */
    self.buildSlider = function () {
      self.$slider = document.createElement('div');
      self.$slider.classList.add('slider');
      self.$slider.setAttribute('unique-id', self.uniqueId);
      self.$slider.classList.add(direction === C.DIR_HORIZONTAL ? C.DIR_HORIZONTAL : C.DIR_VERTICAL);
    };

    /**
     * Creates and sets up track element
     */
    self.buildTrack = function () {
      self.$track = document.createElement('div');
      self.$track.classList.add('track');
    };

    /**
     * Creates and sets up thumb element
     */
    self.buildThumb = function () {
      self.$thumb = document.createElement('span');
      self.$thumb.classList.add('thumb');
      self.$thumb.classList.add('thumb-' + self.thumbDirection);
    };

    /**
     * Creates and sets up tip element
     */
    self.buildTip = function () {
      self.$tip = document.createElement('span');
      self.$tip.classList.add('tip');
      self.$tip.classList.add('hide');
    };

    /**
     * Glue elements
     */
    self.glueComponents = function () {
      self.$slider.appendChild(self.$track);
      self.$slider.appendChild(self.$thumb);
      self.$slider.appendChild(self.$tip);
      attachTo.appendChild(self.$slider);
    };

    /**
     * Shows tip
     */
    self.showTip = function() {
      self.$tip.classList.remove('hide');
    };

    /**
     * Hides tip
     */
    self.hideTip = function() {
      self.$tip.classList.add('hide');
    };

    /**
     * Returns if the tip is shown
     * @returns {boolean}
     */
    self.isTipShown = function() {
      return self.$tip.style.visibility !== 'hidden';
    };

    /*********
     * Events
     ********/
    self.bindEvents = function () {
      /**
       * Fires when thumb is captured by mouse (tap)
       * ------>o<----------
       * @param e
       */
      function onThumbCaptured(e) {
        capturedThumb = e.target;
        self.thumbState.captured = true;
        if (e.target instanceof HTMLDivElement) {
          self.moveThumb(e.offsetX || e.clientX, e.offsetY || e.clientY, true);
        }
        self.showTip();
      }

      /**
       * Fires when thumb slides over the track
       * ------o->->->------
       * @param e
       */
      function onThumbSlides(e) {
        // TODO weak place: each time regenerates variables
        self.setupVariables();
        if (!self.thumbState.slides && self.thumbState.captured === true) {
          self.thumbState.slides = true;
        }
        if (self.thumbState.slides) {
          self.moveThumb(e.offsetX || e.clientX, e.offsetY || e.clientY);
        }
      }

      /**
       * Fires when thumb is pressed away
       * ------o------------
       */
      function onThumbReleases() {
        capturedThumb = false;
        self.thumbState.captured = false;
        self.thumbState.slides = false;
        self.hideTip();
      }

      // Bind events
      document.addEventListener('mousemove-' + self.uniqueId, onThumbSlides);
      document.addEventListener('mouseup-' + self.uniqueId, onThumbReleases);
      self.$thumb.addEventListener('mousedown', onThumbCaptured);
      self.$track.addEventListener('mousedown', onThumbCaptured);
    };

    /**
     * (Re)setup variables
     */
    self.setupVariables = function() {
      sliderLength = (direction === C.DIR_HORIZONTAL) ? self.$track.clientWidth : self.$track.clientHeight;
      trackRect = self.$track.getBoundingClientRect();
      thumbRect = self.$thumb.getBoundingClientRect();
      thumbHalfWidth = thumbRect.width / 2;
      thumbHalfHeight = thumbRect.height / 2;
      ratio = C.MAX_VALUE / sliderLength;
    };

    /**
     * Returns relative value
     * @param val
     * @returns {number}
     */
    function getRelVal(val) {
      return Math.floor(val / ratio);
    }

    /**
     * Move thumb to specified position
     * @param posX
     * @param posY
     * @param ignoreOffset
     */
    self.moveThumb = function(posX, posY, ignoreOffset) {
      var thumbPos,
        trackOffsetTop = trackRect.top,
        trackOffsetLeft = trackRect.left,
        value;

      if (ignoreOffset) {
        trackOffsetTop = 0;
        trackOffsetLeft = 0;
      }

      switch (direction) {
        // vertical slider
        case C.DIR_VERTICAL:
          if (posY > (trackOffsetTop + sliderLength)) {
            // further
            thumbPos = sliderLength;
          } else if (posY < trackOffsetTop) {
            // before
            thumbPos = 0;
          } else {
            // between
            thumbPos = posY - trackOffsetTop;
          }
          // absolute value relative to parent
          self.$thumb.style.top = thumbPos - thumbHalfHeight + 'px';

          break;

        // horizontal slider
        case C.DIR_HORIZONTAL:
          if (posX > (trackOffsetLeft + sliderLength)) {
            // further
            thumbPos = sliderLength;
          } else if (posX < trackOffsetLeft) {
            // before
            thumbPos = 0;
          } else {
            // between
            thumbPos = posX - trackOffsetLeft;
          }
          // absolute value relative to parent
          self.$thumb.style.left = thumbPos - thumbHalfWidth + 'px';

          break;
      }

      value = Math.ceil(thumbPos * ratio);
      if (value !== self.value) {
        self.releaseSubscriber('change', value);
      }
      self.value = value;
      self.$tip.innerText = caption ? caption + self.value : self.value;

      self.alignTip(thumbPos);
    };

    /**
     * Align tip relatively to thumb
     * @param relativePos
     */
    self.alignTip = function(relativePos) {
      var tipLen,
        leftOffset,
        topOffset;

      if (direction === C.DIR_VERTICAL) {
        tipLen = self.$tip.offsetHeight;
        topOffset = relativePos - (tipLen / 2);
        if (self.thumbDirection === 'left') {
          leftOffset = -self.$tip.offsetWidth - thumbHalfWidth - tipThumbOffset;
        } else {
          leftOffset = trackRect.width + thumbHalfWidth + tipThumbOffset;
        }
      } else {
        tipLen = self.$tip.offsetWidth;
        if (self.thumbDirection === 'top') {
          topOffset = -self.$tip.offsetHeight - thumbHalfHeight - tipThumbOffset;
        } else {
          topOffset = trackRect.height + thumbHalfHeight + tipThumbOffset;
        }
        leftOffset = relativePos - (tipLen / 2);
      }

      self.$tip.style.left = leftOffset + 'px';
      self.$tip.style.top = topOffset + 'px';
    };

    /**
     * Sets value value of slider
     * @param val
     */
    self.setValue = function(val) {
      self.moveThumb(getRelVal(val), getRelVal(val), true);
    };

    /**
     * Returns value of slider
     * @returns {*}
     */
    self.getValue = function () {
      return self.value;
    };

    /**
     * Releases specific @evt
     * @param evt
     */
    self.releaseSubscriber = function(evt) {
      var args = Array.prototype.splice.call(arguments, 1);
      self.subscribers[evt].map(function (fn) {
        fn.apply(this, args);
      });
    };

    // parse constructor's arguments
    parseArguments(arguments);
    // init components (templates)
    self.init();
    self.setupVariables();

    // move thumb to initial position
    self.moveThumb(getRelVal(self.value), getRelVal(self.value), true);

    uniqueId++;

    return {
      setValue: self.setValue,
      getValue: self.getValue,
      showTip: self.showTip,
      hideTip: self.hideTip,
      on: function(evt, fn) {
        if (self.subscribers.hasOwnProperty(evt)) {
          self.subscribers[evt].push(fn);
        }
      }
    };
  }

  // delegation global events to Slider-s
  document.addEventListener('mouseup', function (e) {
    delegateEvt(e, 'mouseup');
  });
  document.addEventListener('mousemove', function (e) {
    delegateEvt(e, 'mousemove');
  });

  window.Slider = Slider;
}(window));
