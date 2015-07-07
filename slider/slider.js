(function (window) {
  var uniqueId = 0;
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
   * @param startValue
   * @constructor
   */
  function Slider(attachTo, direction, startValue) {
    var self = this,
      C = {
        DIR_HORIZONTAL: 'horizontal',
        DIR_VERTICAL: 'vertical',
        MAX_VALUE: 255
      },
      sliderRect = {},
      thumbRect = {},
      sliderLength,
      ratio = 1;

    self.thumbState = {
      captured: false,
      slides: false
    };

    self.uniqueId = uniqueId;

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

    /*********
     * Events
     ********/
    self.bindEvents = function () {
      function onThumbCaptured(e) {
        capturedThumb = e.target;
        self.thumbState.captured = true;
        if (e.target instanceof HTMLDivElement) {
          self.moveThumb(e.offsetX || e.clientX, e.offsetY || e.clientY, true);
        }
        self.showTip();
      }

      function onThumbSlides(e) {
        if (!self.thumbState.slides && self.thumbState.captured === true) {
          self.thumbState.slides = true;
        }
        if (self.thumbState.slides) {
          self.moveThumb(e.offsetX || e.clientX, e.offsetY || e.clientY);
          self.showTip();
        }
      }

      function onThumbReleases() {
        capturedThumb = false;
        self.thumbState.captured = false;
        self.thumbState.slides = false;
        self.hideTip();
      }

      document.addEventListener('mousemove-' + self.uniqueId, onThumbSlides);
      document.addEventListener('mouseup-' + self.uniqueId, onThumbReleases);
      self.$thumb.addEventListener('mousedown', onThumbCaptured);
      self.$track.addEventListener('mousedown', onThumbCaptured);
    };

    /**
     * (Re)setup variables
     */
    self.setupVariables = function() {
      sliderLength = direction === C.DIR_HORIZONTAL ? self.$track.clientWidth : self.$track.clientHeight;
      sliderRect = self.$track.getBoundingClientRect();
      thumbRect = self.$thumb.getBoundingClientRect();
      ratio = C.MAX_VALUE / sliderLength;
      self.value = (startValue === undefined) ? (C.MAX_VALUE / 2) : startValue;

      // move thumb to initial position
      self.moveThumb(getRelVal(self.value), getRelVal(self.value), true);
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
        sliderOffsetTop = sliderRect.top,
        sliderOffsetLeft = sliderRect.left;

      if (ignoreOffset) {
        sliderOffsetTop = 0;
        sliderOffsetLeft = 0;
      }

      switch (direction) {
        // vertical slider
        case C.DIR_VERTICAL:
          if (posY > (sliderOffsetTop + sliderLength)) {
            // further
            thumbPos = sliderLength;
          } else if (posY < sliderOffsetTop) {
            // before
            thumbPos = 0;
          } else {
            // between
            thumbPos = posY - sliderOffsetTop;
          }
          // absolute value relative to parent
          self.$thumb.style.top = thumbPos - (thumbRect.height / 2) + 'px';

          // 15 is magic number to properly align tip's top position
          self.$tip.style.top = thumbPos - 15 + 'px';

          break;

        // horizontal slider
        case C.DIR_HORIZONTAL:
          if (posX > (sliderOffsetLeft + sliderLength)) {
            // further
            thumbPos = sliderLength;
          } else if (posX < sliderOffsetLeft) {
            // before
            thumbPos = 0;
          } else {
            // between
            thumbPos = posX - sliderOffsetLeft;
          }
          // absolute value relative to parent
          self.$thumb.style.left = thumbPos - (thumbRect.height / 2) + 'px';
          self.$tip.style.left = thumbPos;

          // 60 is magic number to properly align tip's left position
          self.$tip.style.left = thumbPos - 60 + 'px';

          break;
      }

      self.value = Math.floor(thumbPos * ratio);
      self.$tip.innerText = 'Brightness: ' + self.value;

      if (direction == C.DIR_VERTICAL) {
        if (self.value >= 100) {
          // add left margin if value higher then 100
          self.$tip.style.marginLeft = -8 + 'px';
        } else {
          self.$tip.style.marginLeft = 0;
        }
      }
      // TODO auto align
    };

    /**
     *
     * @param val
     */
    self.setValue = function(val) {
      self.moveThumb(getRelVal(val), getRelVal(val), true);
    };

    self.init();
    self.setupVariables();

    uniqueId++;

    //return {
      // TODO
    //}
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
