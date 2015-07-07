(function (window) {
  var id = 0;
  var capturedThumb;

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

  function Slider(attachTo, direction, startValue) {
    var self = this,
      C = {
        DIR_HORIZONTAL: 'horizontal',
        DIR_VERTICAL: 'vertical'
      },
      sliderRect = {},
      thumbRect = {},
      sliderLength,
      ratio = 1;

    self.thumbState = {
      captured: false,
      slides: false
    };

    self.uniqueId = id;

    self.init = function () {
      self.buildSlider();
      self.buildTrack();
      self.buildThumb();
      self.bindEvents();
      self.buildTip();
      self.glueComponents();
    };

    self.buildSlider = function () {
      self.$slider = document.createElement('div');
      self.$slider.classList.add('slider');
      self.$slider.setAttribute('unique-id', self.uniqueId);
      self.$slider.classList.add(direction === C.DIR_HORIZONTAL ? C.DIR_HORIZONTAL : C.DIR_VERTICAL);
    };

    self.buildTrack = function () {
      self.$track = document.createElement('div');
      self.$track.classList.add('track');
    };

    self.buildThumb = function () {
      self.$thumb = document.createElement('span');
      self.$thumb.classList.add('thumb');
    };

    self.buildTip = function () {
      self.$tip = document.createElement('span');
      self.$tip.classList.add('tip');
    };

    self.glueComponents = function () {
      self.$slider.appendChild(self.$track);
      self.$slider.appendChild(self.$thumb);
      self.$slider.appendChild(self.$tip);
      attachTo.appendChild(self.$slider);
    };

    self.bindEvents = function () {
      function onThumbCaptured(e) {
        capturedThumb = e.target;
        self.thumbState.captured = true;
        if (e.target instanceof HTMLDivElement) {
          moveThumb(e, true);
        }
      }

      function onThumbSlides(e) {
        if (!self.thumbState.slides && self.thumbState.captured === true) {
          self.thumbState.slides = true;
        }
        if (self.thumbState.slides) {
          moveThumb(e);
        }
      }

      function onThumbReleases() {
        capturedThumb = false;
        self.thumbState.captured = false;
        self.thumbState.slides = false;
      }

      document.addEventListener('mousemove-' + self.uniqueId, onThumbSlides);
      document.addEventListener('mouseup-' + self.uniqueId, onThumbReleases);
      self.$thumb.addEventListener('mousedown', onThumbCaptured);
      self.$track.addEventListener('mousedown', onThumbCaptured);
    };

    self.init();

    sliderLength = direction === C.DIR_HORIZONTAL ? self.$track.clientWidth : self.$track.clientHeight;
    sliderRect = self.$track.getBoundingClientRect();
    thumbRect = self.$thumb.getBoundingClientRect();

    ratio = 255 / sliderLength;
    self.value = (startValue === undefined) ? (sliderLength / 2) : startValue;

    moveThumb({
      offsetX: Math.floor(startValue / ratio),
      offsetY: Math.floor(startValue / ratio)
    }, true);

    id++;

    function moveThumb(e, ignoreOffset) {
      var offsetX = e.offsetX || e.clientX,
        offsetY = e.offsetY || e.clientY,
        thumbPos,
        sliderOffsetTop = sliderRect.top,
        sliderOffsetLeft = sliderRect.left;

      if (ignoreOffset) {
        sliderOffsetTop = 0;
        sliderOffsetLeft = 0;
      }

      switch (direction) {
        // vertical slider
        case C.DIR_VERTICAL:
          if (offsetY > (sliderOffsetTop + sliderLength)) {
            // further
            thumbPos = sliderLength;
          } else if (offsetY < sliderOffsetTop) {
            // before
            thumbPos = 1;
          } else {
            // between
            thumbPos = offsetY - sliderOffsetTop;
          }
          // absolute value relative to parent
          self.$thumb.style.top = thumbPos - (thumbRect.height / 2) + 'px';

          // TODO tip
          self.$tip.style.top = thumbPos - 8 + 'px';
          self.$tip.style.left = -110 + 'px';

          break;

        // horizontal slider
        case C.DIR_HORIZONTAL:
          if (offsetX > (sliderOffsetLeft + sliderLength)) {
            // further
            thumbPos = sliderLength;
          } else if (offsetX < sliderOffsetLeft) {
            // before
            thumbPos = 1;
          } else {
            // between
            thumbPos = offsetX - sliderOffsetLeft;
          }
          // absolute value relative to parent
          self.$thumb.style.left = thumbPos - (thumbRect.height / 2) + 'px';
          self.$tip.style.left = thumbPos;

          // TODO tip
          self.$tip.style.left = thumbPos - 48 + 'px';
          self.$tip.style.top = -32 + 'px';

          break;
      }

      self.value = Math.floor(thumbPos * ratio);
      self.$tip.innerText = 'Brightness: ' + self.value;
    }
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
