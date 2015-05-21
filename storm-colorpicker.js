(function (glob) {

  var utils = {
    /**
     * Returns cursor's offset based on element's event
     * @param e
     * @returns {{x: number, y: number}}
     */
    getCursorOffset: function(e) {
      // webkit
      if (e.offsetX !== undefined && e.offsetY !== undefined) {
        return {x: e.offsetX, y: e.offsetY};
      }

      // gecko
      if (e.layerX !== undefined && e.layerY !== undefined) {
        return {x: e.layerX, y: e.layerY};
      }

      return {x: 0, y: 0};
    },
    isInCircle: function(x, y, cX, cY, r) {
      return (((x - cX) * (x - cX) + (y - cY) * (y - cY)) <= r * r);
    },
    /**
     * Returns cursor pos relatively to element
     * @param el
     * @returns {{x: number, y: number}}
     */
    getRelativeElementsOffset: function(el) {
      var left = 0,
        top = 0;

      if (el.offsetParent) {
        do {
          left += el.offsetLeft;
          top += el.offsetTop;
        } while (el = el.offsetParent);
      }

      return {
        x: left,
        y: top
      }
    },
    rgbToHex: function (r, g, b) {
      if (r > 255 || g > 255 || b > 255) throw "Invalid color component";

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
    self.canvasPos = {x: 0, y: 0};
    self.updatePos();
    self.context2d = canvasEl.getContext('2d');
    self.image = new Image();
    self.image.src = (new Base64Images().colorWheel);
    self.picking = false;
    self.color = {
      rgba: '',
      hex: ''
    };
    self.cursorPos = {x: 0, y: 0};
    self.c255to100 = utils.convertTo100percent(255);
    self.picker = new Picker();
    self.subscribers = {};
    document.documentElement.appendChild(self.picker.valueOf());

    self.bindEvents();
  }

  ColorWheel.prototype.updatePos = function() {
    this.canvasPos = utils.getRelativeElementsOffset(this.canvas);
  };

  ColorWheel.prototype.subscribe = function(subscribers) {
    this.subscribers = subscribers;
  };

  ColorWheel.prototype.notify = function(evt) {
    var fnArgs = Array.prototype.slice.call(arguments, 1);

    if (evt in this.subscribers) {
      this.subscribers[evt].map(function(fn) {
        fn.apply(null, fnArgs);
      });
    }
  };

  /**
   * Returns wheel's middle coordinates
   * @returns {{x: number, y: number}}
   */
  ColorWheel.prototype.getMiddleCoords = function() {
    return {
      x: Math.round(this.image.width / 2),
      y: Math.round(this.image.height / 2)
    }
  };

  ColorWheel.prototype.getOuterMiddleCoords = function() {
    var middleCoords = this.getMiddleCoords();

    return {
      x: this.canvasPos.x + middleCoords.x,
      y: this.canvasPos.y + middleCoords.y
    }
  };

  /**
   *
   * @param rgba
   * @param hex
   */
  ColorWheel.prototype.setColor = function(rgba, hex) {
    this.color = {
      rgba: rgba,
      hex: hex
    };

    this.notify('pick', this.color);
  };

  /**
   *
   * @param x
   * @param y
   */
  ColorWheel.prototype.pickColor = function(x, y) {
    if (arguments.length == 1 && typeof x == 'object') {
      y = x.y;
      x = x.x;
    }

    var pixel = this.getPixelAt(x, y),
      cursorPosX = this.cursorPos.x,
      cursorPosY = this.cursorPos.y,
      outerMiddle = this.getOuterMiddleCoords(),
      isInCircle,
      hex,
      rgba;

    /** TODO check if picker inside the wheel and then move
     * if cursor not inside the circle, then move it to point of intersection with arc and line from middle of
     * circle to cursor*/
    isInCircle = utils.isInCircle(
      this.canvasPos.x + x,
      this.canvasPos.y + y,
      outerMiddle.x,
      outerMiddle.y,
      this.image.width / 2
    );

    if (isInCircle) {
      if (!cursorPosX && !cursorPosY) {
        this.picker.move(this.canvasPos.x + x, this.canvasPos.y + y);
      } else {
        this.picker.move(cursorPosX, cursorPosY);
      }
    } else {
      /* Find intersection between cursor and circle's middle
       x1, y1 - cursor's coords
       x2, y2 - middle's coords
       L - sqrt(pow(x2-x1)+pow(y2-y1))
       x = x1 + r*(x2-x1)/L
       y = y1 + r*(y2-y1)/L
       this.picker.move(x, y);
       */
    }

    // check for alpha > 0
    if (pixel.a != 0) {
      hex = "#" + ("000000" + utils.rgbToHex(pixel.r, pixel.g, pixel.b)).slice(-6);
      rgba = 'rgba(' + pixel.r + ',' + pixel.g + ',' + pixel.b + ',' + pixel.a + ')';
      this.setColor(rgba, hex);
    }
  };

  /**
   *
   */
  ColorWheel.prototype.bindEvents = function() {
    var self = this,
      eventBus = {
        onSelectEnds: function() {
          self.picking = false;
          //utils.removeClass('color-selecting', self.canvas);
        },
        onSelectStarts: function(e) {
          e.preventDefault();
          self.updatePos();
          self.picking = true;
          self.pickColor(self.getCursorPos());
          //utils.addClass('color-selecting', self.canvas);
        },
        onCursorMoves: function(e) {
          var x = e.pageX || event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
          var y = e.pageY || event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

          self.cursorPos = {x: x, y: y};
        },
        onImageLoads: function() {
          self.draw();
          // move to mid
          self.pickColor(self.getMiddleCoords());
        },
        onSelecting: function() {
          if (self.picking) {
            self.pickColor(self.getCursorPos());
          }
        }
      };

    document.addEventListener('mouseup', eventBus.onSelectEnds);
    document.addEventListener('mousemove', eventBus.onCursorMoves);

    self.picker.valueOf().addEventListener('mouseup', eventBus.onSelectEnds);
    self.picker.valueOf().addEventListener('mousemove', eventBus.onSelecting);
    self.picker.valueOf().addEventListener('mousedown', eventBus.onSelectStarts);

    self.image.addEventListener('load', eventBus.onImageLoads);

    //self.canvas.addEventListener('mousedown', eventBus.onSelectStarts);
    document.addEventListener('mousedown', eventBus.onSelectStarts);
    //self.canvas.addEventListener('mousemove', eventBus.onSelecting);
    document.addEventListener('mousemove', eventBus.onSelecting);
  };

  ColorWheel.prototype.getCursorPos = function() {
    return this.getRelativeCursorPos(this.canvasPos.x, this.canvasPos.y);
  };

  /**
   *
   * @param x
   * @param y
   * @returns {{r: (*|number), g: (*|number), b: (*|number), a: *}}
   */
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

  /**
   *
   */
  ColorWheel.prototype.draw = function () {
    this.context2d.drawImage(this.image, 0, 0);
  };

  /**
   *
   * @param elLeft
   * @param elTop
   * @returns {{x: number, y: number}}
   */
  ColorWheel.prototype.getRelativeCursorPos = function(elLeft, elTop) {
    return {
      x: this.cursorPos.x + (this.cursorPos.x > 0 ? -elLeft : elLeft),
      y: this.cursorPos.y + (this.cursorPos.y > 0 ? -elTop : elTop)
    }
  };

  function Picker() {
    this.cursorImage = document.createElement('img');
    this.x = 0;
    this.y = 0;

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

    this.bindEvents();
  }

  Picker.prototype.bindEvents = function() {
    this.cursorImage.addEventListener('mousedown', function(e) {
      e.preventDefault();
    });
  };

  Picker.prototype.move = function(x, y) {
    var cursorRadius = Math.round(this.cursorImage.width / 2);

    if (arguments.length == 1 && typeof x == 'object') {
      y = x.y;
      x = x.x;
    }
    this.x = x - cursorRadius;
    this.y = y - cursorRadius;
    this.updateElementPosition();
  };

  Picker.prototype.updateElementPosition = function() {
    this.cursorImage.style.left = this.x + 'px';
    this.cursorImage.style.top = this.y + 'px';
  };

  Picker.prototype.valueOf = function() {
    return this.cursorImage;
  };

  function StormColorPicker(canvasEl) {
    this.canvas = document.querySelectorAll(canvasEl)[0];
    this.context2d = this.canvas.getContext('2d');
    this.c255to100 = utils.convertTo100percent(255);
    this.wheelImage = new Image();
    this.cursorImage = document.createElement('img');
    this.colorWheel = new ColorWheel(this.canvas);

    this.apiSubscribers = {
      // fired when color picked
      pick: []
    };

    this.colorWheel.subscribe(this.apiSubscribers);
    this.setupCanvas();
  }

  StormColorPicker.prototype.on = function(evt, fn) {
    if (evt in this.apiSubscribers !== -1) {
      this.apiSubscribers[evt].push(fn);
    }
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
