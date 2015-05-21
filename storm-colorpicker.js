(function (glob) {

  var utils = {
    relElementCoords: function (el, e) {
      if (e) {
        // webkit
        if (e.offsetX !== undefined && e.offsetY !== undefined) {
          return {x: e.offsetX, y: e.offsetY};
        }
        // gecko
        if (e.layerX !== undefined && e.layerY !== undefined) {
          return {x: e.layerX, y: e.layerY};
        }
      }

      var left = 0,
        top = 0;

      if (el.offsetParent) {
        do {
          left += el.offsetLeft;
          top += el.offsetTop;
        } while (el = el.offsetParent);
      }

      return {x: left, y: top};
    },
    rgbToHex: function (r, g, b) {
      if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
      return ((r << 16) | (g << 8) | b).toString(16);
    },
    addClass: function (className, obj) {
      className.split(' ').map(function(el) {
        obj.classList.add(el);
      });
    },
    removeClass: function (className, obj) {
      className.split(' ').map(function(el) {
        obj.classList.remove(el);
      });
    },
    hasClass: function (className, obj) {
      return !!obj.classList.indexOf(className);
    },
    convertTo100percent: function(relNum) {
      return function(num) {
        return Math.round(100 / relNum * num);
      }
    }
  };

  /**
   * Represents color wheel image
   * @param canvasEl
   * @constructor
   */
  function ColorWheel(canvasEl) {
    var self = this;

    if (!(canvasEl instanceof HTMLCanvasElement)) {
      throw new TypeError('Invalid 2d context');
    }

    self.canvas = canvasEl;
    self.context2d = canvasEl.getContext('2d');
    self.image = new Image();
    self.image.src = (new Base64Images().colorWheel);
    self.picking = false;
    self.cursorPos = {x: 0, y: 0};
    self.c255to100 = utils.convertTo100percent(255);
    self.picker = new Picker();
    document.documentElement.appendChild(self.picker.valueOf());

    self.bindEvents();
  }

  /**
   * Returns wheel's middle coordinates
   * @returns {{x: number, y: number}}
   */
  ColorWheel.prototype.getMiddleCoordinates = function() {
    return {
      x: Math.round(this.image.width / 2),
      y: Math.round(this.image.height / 2)
    }
  };

  ColorWheel.prototype.bindEvents = function() {
    var self = this;

    document.body.addEventListener('mouseup', function () {
      self.picking = false;
      utils.removeClass('color-selecting', self.canvas);
    });

    document.addEventListener('mousemove', function (e) {
      var x = e.pageX || event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
      var y = e.pageY || event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

      self.cursorPos = {x: x, y: y};
    });

    self.image.addEventListener('load', function () {
      self.draw();
    });

    self.canvas.addEventListener('mousedown', function () {
      self.picking = true;
      utils.addClass('color-selecting', self.canvas);
    });

    self.canvas.addEventListener('mousemove', function (e) {
      if (self.picking) {
        var pos = self.getRelativeCursorPos(this),
          pixel = self.getPixelAt(pos),
        //hex,
          rgba;

        //self.cursorToCoords(e.x, e.y);
        self.picker.move(e.x, e.y);

        // check for alpha > 0
        // TODO cursor inside wheel
        if (pixel.a != 0) {
          //hex = "#" + ("000000" + utils.rgbToHex(pixel.r, pixel.g, pixel.b)).slice(-6);
          rgba = 'rgba(' + pixel.r + ',' + pixel.g + ',' + pixel.b + ',' + pixel.a + ')';
        }

        //document.body.style.background = hex;
        document.body.style.background = rgba;
      }
    });
  };

  ColorWheel.prototype.getPixelAt = function(x, y) {
    var self = this,
      pixel;

    if (arguments.length == 1 && typeof arguments == 'object') {
      y = x.y;
      x = x.x;
    }

    pixel = self.context2d.getImageData(x, y, 1, 1).data;

    return {
      r: pixel[0] || 0,
      g: pixel[1] || 0,
      b: pixel[2] || 0,
      a: self.c255to100(pixel[3] || 0)
    };
  };

  ColorWheel.prototype.draw = function () {
    this.context2d.drawImage(this.image, 0, 0);
  };

  /**
   * Returns cursor offset based on element's event
   * @param e
   * @returns {{x: number, y: number}}
   */
  ColorWheel.prototype.getCursorOffset = function(e) {
    // webkit
    if (e.offsetX !== undefined && e.offsetY !== undefined) {
      return {x: e.offsetX, y: e.offsetY};
    }

    // gecko
    if (e.layerX !== undefined && e.layerY !== undefined) {
      return {x: e.layerX, y: e.layerY};
    }

    return {x: 0, y: 0};
  };

  /**
   * Returns cursor pos relatively to element
   * @param el
   * @returns {{x: number, y: number}}
   */
  ColorWheel.prototype.getRelativeCursorPos = function (el) {
    var left = 0,
      top = 0;

    if (el.offsetParent) {
      do {
        left += el.offsetLeft;
        top += el.offsetTop;
      } while (el = el.offsetParent);
    }

    return {
      x: this.cursorPos.x - left,
      y: this.cursorPos.y - top
    }
  };

  function Picker() {
    this.cursorImage = document.createElement('img');

    this.cursorImage.src = (new Base64Images().picker);
    this.cursorImage.style.cursor = 'default';
    this.cursorImage.style.position = 'absolute';

    // disable cursor selection
    this.cursorImage.style.WebkitTouchCallout = 'none';
    this.cursorImage.style.WebkitUserSelect = 'none';
    this.cursorImage.style.KhtmlUserSelect = 'none';
    this.cursorImage.style.MozUserSelect = 'none';
    this.cursorImage.style.MsUserSelect = 'none';
    this.cursorImage.style.userSelect = 'none';
    // end disable cursor selection
  }

  Picker.prototype.move = function(x, y) {
    var cursorRadius = Math.round(this.cursorImage.width / 2);

    this.cursorImage.style.left = x - cursorRadius + 'px';
    this.cursorImage.style.top = y - cursorRadius + 'px';
  };

  Picker.prototype.valueOf = function() {
    return this.cursorImage;
  };

  function StormColorPicker(canvasEl) {
    this.cursorSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAQAAABKxSfDAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQffBRUGCCKZr5vZAAAAOUlEQVQI11XMsREAIAgEwR8jA0P6w660DJojYuBN8eKdA6acHTvkYGJdI5NpXBfqZFQUqT7Q+1gfPL6lJA0QGyUNAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE1LTA1LTIxVDA2OjA4OjM0LTA0OjAw5efscAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNS0wNS0yMVQwNjowODozNC0wNDowMJS6VMwAAAAASUVORK5CYII=';
    this.canvas = document.querySelectorAll(canvasEl)[0];
    this.context2d = this.canvas.getContext('2d');
    this.mouseDown = false;
    this.c255to100 = utils.convertTo100percent(255);
    this.wheelImage = new Image();
    //this.cursorImage = new Image();
    this.lastOffset = {x: 0, y: 0};
    this.cursorImage = document.createElement('img');
    this.canvasMouseMoveEvt = {};

    this.colorWheel = new ColorWheel(this.canvas);

    this.setupCanvas();
    this.initEvents();
    //this.initWheel();
    //this.initCursor();
  }

  //StormColorPicker.prototype.initCursor = function() {
  //  var self = this;
	//
  //  self.cursorImage.src = self.cursorSrc;
  //  self.cursorImage.style.cursor = 'default';
  //  self.cursorImage.style.position = 'absolute';
	//
  //  // disable cursor selection
  //  self.cursorImage.style.WebkitTouchCallout = 'none';
  //  self.cursorImage.style.WebkitUserSelect = 'none';
  //  self.cursorImage.style.KhtmlUserSelect = 'none';
  //  self.cursorImage.style.MozUserSelect = 'none';
  //  self.cursorImage.style.MsUserSelect = 'none';
  //  self.cursorImage.style.userSelect = 'none';
  //  // end disable cursor selection
	//
  //  document.body.appendChild(self.cursorImage);
	//
  //  /**
  //   *     -webkit-touch-callout: none;
  //         -webkit-user-select: none;
  //         -khtml-user-select: none;
  //         -moz-user-select: none;
  //         -ms-user-select: none;
  //         user-select: none;
  //   */
	//
  //  self.cursorImage.addEventListener('mousedown', function(e) {
  //    e.preventDefault();
  //    self.canvas.dispatchEvent(new Event('mousedown'));
  //  });
	//
  //  self.cursorImage.addEventListener('mousemove', function(e) {
  //    e.preventDefault();
  //    var curPos = utils.relElementCoords(self.cursorImage),
  //      evt = new Event('mousemove');
	//
  //    evt.offsetX = curPos.x + e.offsetX;
  //    evt.offsetY = curPos.y + e.offsetY;
  //    self.canvas.dispatchEvent(evt);
  //  }, false);
	//
  //  self.cursorImage.addEventListener('load', function() {
  //    var wheelCoords = utils.relElementCoords(self.canvas),
  //      wheelMiddle = {
  //        x: wheelCoords.x + Math.round(self.wheelImage.width / 2),
  //        y: wheelCoords.y + Math.round(self.wheelImage.height / 2)
  //      };
	//
  //    self.cursorToCoords(wheelMiddle.x, wheelMiddle.y);
  //  });
  //};

  StormColorPicker.prototype.cursorToCoords = function(x, y) {
    var cursorRadius = Math.round(this.cursorImage.width / 2);

    this.cursorImage.style.left = x - cursorRadius + 'px';
    this.cursorImage.style.top = y - cursorRadius + 'px';
  };

  StormColorPicker.prototype.getPixelColorAt = function(x, y) {

  };

  StormColorPicker.prototype.initEvents = function () {

  };

  StormColorPicker.prototype.getPixelAt = function(x, y) {
    var self = this;

    if (arguments.length == 1 && typeof arguments == 'object') {
      y = x.y;
      x = x.x;
    }
    var pixel = self.context2d.getImageData(x, y, 1, 1).data;

    return {
      r: pixel[0] || 0,
      g: pixel[1] || 0,
      b: pixel[2] || 0,
      a: self.c255to100(pixel[3] || 0)
    };
  };

  StormColorPicker.prototype.setupCanvas = function() {
    this.canvas.style.cursor = 'default';
    this.canvas.style.position = 'relative';
  };

  StormColorPicker.prototype.drawFrame = function() {
    this.context2d.clearRect(0, 0, this.wheelImage.width, this.wheelImage.height);
    this.draw();
  };

  glob.StormColorPicker = StormColorPicker;

})((eval, this));
