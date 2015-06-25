(function (glob) {

  var utils = {
    /**
     * Returns cursor's offset based on element's event
     * @param e
     * @returns {{x: number, y: number}}
     */
    getCursorOffset: function (e) {
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
    calcSegmentLen: function (x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    getAbcAngle: function (aLen, bLen, cLen, precision) {
      return (Math.acos((aLen * aLen + cLen * cLen - bLen * bLen) / (2 * aLen * cLen)) / Math.PI * 180).toFixed(0 || precision);
    },
    isInCircle: function (x, y, cX, cY, r) {
      return (((x - cX) * (x - cX) + (y - cY) * (y - cY)) <= r * r);
    },
    /**
     * Returns cursor pos relatively to element
     * @param el
     * @returns {{x: number, y: number}}
     */
    getRelativeElementsOffset: function (el) {
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
    rgbToHsl: function (r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;

      if (max == min) {
        h = s = 0; // achromatic
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      return [h, s, l];
    },
    addClass: function (className, obj) {
      className.split(' ').map(function (el) {
        obj.classList.add(el);
      });
    },
    removeClass: function (className, obj) {
      className.split(' ').map(function (el) {
        obj.classList.remove(el);
      });
    },
    hasClass: function (className, obj) {
      return !!obj.classList.indexOf(className);
    },
    convertTo100percent: function (relNum) {
      return function (num) {
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
    self.radius = 150;
    self.diameter = self.radius * 2;
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

  ColorWheel.prototype.updatePos = function () {
    this.canvasPos = utils.getRelativeElementsOffset(this.canvas);
  };

  ColorWheel.prototype.subscribe = function (subscribers) {
    this.subscribers = subscribers;
  };

  ColorWheel.prototype.notify = function (evt) {
    var fnArgs = Array.prototype.slice.call(arguments, 1);

    if (evt in this.subscribers) {
      this.subscribers[evt].map(function (fn) {
        fn.apply(null, fnArgs);
      });
    }
  };

  /**
   * Returns wheel's middle coordinates
   * @returns {{x: number, y: number}}
   */
  ColorWheel.prototype.getMiddleCoords = function () {
    return {
      x: Math.round(this.radius),
      y: Math.round(this.radius)
    }
  };

  ColorWheel.prototype.getOuterMiddleCoords = function () {
    var middleCoords = this.getMiddleCoords();

    return {
      x: this.canvasPos.x + middleCoords.x,
      y: this.canvasPos.y + middleCoords.y
    }
  };

  /**
   *
   * @param r
   * @param g
   * @param b
   * @param a
   */
  ColorWheel.prototype.setColor = function (r, g, b, a) {
    var hex = "#" + ("000000" + utils.rgbToHex(r, g, b)).slice(-6);
    var rgba = 'rgba(' + r + ',' + g + ',' + b + ',' + a / 100 + ')';
    var hsl = utils.rgbToHsl(r, g, b);

    // TODO wrap with Color object, that returns different variations of color
    this.color = {
      rgba: rgba,
      hex: hex,
      hsl: hsl
    };

    this.notify('pick', this.color);
  };

  ColorWheel.prototype.findColor = function(r, g, b) {
    var imgd = this.context2d.getImageData(0, 0, this.diameter, this.diameter),
      pix = imgd.data,
      x = 0,
      y = 0;

    for (var i = 0, n = pix.length; i < n; i += 4) {
      //pix[i  ] = 255 - pix[i  ]; // red
      //pix[i+1] = 255 - pix[i+1]; // green
      //pix[i+2] = 255 - pix[i+2]; // blue
      // i+3 is alpha (the fourth element)
      if (pix[i] == r && pix[i + 1] == g && pix[i + 2] == b) {
        this.pickColor(x, y);
        return true;
      }
      if (i % 4 === 0) {
        x++;
      }
      if (x >= this.diameter) {
        x = 0;
        y++;
      }

    }

    return false;
  };

  /**
   *
   * @param x
   * @param y
   */
  ColorWheel.prototype.pickColor = function (x, y) {
    if (arguments.length == 1 && typeof x == 'object') {
      y = x.y;
      x = x.x;
    }

    var middleCoords = this.getMiddleCoords();
    var a = utils.calcSegmentLen(middleCoords.x, middleCoords.y, middleCoords.x + 150, middleCoords.y);
    var b = utils.calcSegmentLen(middleCoords.x, middleCoords.y, x, y);
    var c = utils.calcSegmentLen(middleCoords.x + 150, middleCoords.y, x, y);
    console.log(a,b,c);

    var px = {x: 0, y: 0},
      cursorPosX = this.cursorPos.x,
      cursorPosY = this.cursorPos.y,
      outerMiddle = this.getOuterMiddleCoords(),
      isInCircle,
      secantsIntersection,
      offset,
      offsetX,
      offsetY;

    /**
     * if cursor not inside the circle, then move it to point of intersection with arc and line from middle of
     * circle to cursor*/
    isInCircle = utils.isInCircle(
      this.canvasPos.x + x,
      this.canvasPos.y + y,
      outerMiddle.x,
      outerMiddle.y,
      this.radius
    );

    if (isInCircle) {
      px = this.getPixelAt(x, y);
      if (!cursorPosX && !cursorPosY) {
        this.picker.move(this.canvasPos.x + x, this.canvasPos.y + y);
      } else {
        this.picker.move(cursorPosX, cursorPosY);
      }
    } else {
      secantsIntersection = this.getSecantsIntersection(cursorPosX, cursorPosY);
      // move picker relatively to wheel's middle
      this.picker.move(outerMiddle.x + secantsIntersection.x, outerMiddle.y + secantsIntersection.y);
      // offset to prevent "broken" pixels
      offset = 1;
      offsetX = secantsIntersection.x >= 0 ? -offset : offset;
      offsetY = secantsIntersection.y >= 0 ? -offset : offset;
      // pick color relatively to wheel's middle
      px = this.getPixelAt(secantsIntersection.x + this.radius + offsetX, secantsIntersection.y + this.radius + offsetY);
    }

    // check for alpha > 0
    //if (px.a != 0) {
      this.setColor(px.r, px.g, px.b, px.a);
    //}
  };

  /**
   * Returns coordinates of intersection between wheel's center and secant's start coordinates
   * @param secantsX
   * @param secantsY
   * @returns {{x: (number|*), y: (number|*)}}
   */
  ColorWheel.prototype.getSecantsIntersection = function (secantsX, secantsY) {
    var outerMiddle = this.getOuterMiddleCoords(),
      L,
      iX,
      iY;
    /* Find intersection between cursor and circle's middle
     x1, y1 - cursor's coords
     x2, y2 - middle's coords
     L - sqrt(pow(x2-x1)+pow(y2-y1))
     x = x1 + r*(x2-x1)/L
     y = y1 + r*(y2-y1)/L
     x, y - coordinates of intersection
     */
    // line's length from wheel's middle to cursor's position
    L = Math.sqrt(Math.pow(outerMiddle.x - secantsX, 2) + Math.pow(outerMiddle.y - secantsY, 2));
    // intersection's coordinates
    iX = -1 * (this.radius * (outerMiddle.x - secantsX) / L);
    iY = -1 * (this.radius * (outerMiddle.y - secantsY) / L);

    return {
      x: iX,
      y: iY
    }
  };

  /**
   *
   */
  ColorWheel.prototype.bindEvents = function () {
    var self = this,
      eventBus = {
        onSelectEnds: function () {
          self.picking = false;
          //utils.removeClass('color-selecting', self.canvas);
          self.canvas.style.cursor = 'default';
          self.picker.valueOf().style.cursor = 'default';
        },
        onSelectStarts: function (e) {
          e.preventDefault();
          self.updatePos();
          self.picking = true;
          self.pickColor(self.getCursorPos());
          //utils.addClass('color-selecting', self.canvas);
          self.canvas.style.cursor = 'none';
          self.picker.valueOf().style.cursor = 'none';
        },
        onCursorMoves: function (e) {
          var x = e.pageX || event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
          var y = e.pageY || event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);

          self.cursorPos = {x: x, y: y};
        },
        onImageLoads: function () {
          self.draw();
          // move to mid
          self.pickColor(self.getMiddleCoords());
          console.log(self.findColor(64,126,62));
          console.log(self.findColor(255,2,255));
        },
        onSelecting: function () {
          if (self.picking) {
            self.pickColor(self.getCursorPos());
          }
        }
      };

    document.addEventListener('mouseup', eventBus.onSelectEnds);
    document.addEventListener('mousemove', eventBus.onCursorMoves);
    document.addEventListener('mousemove', eventBus.onSelecting);

    self.picker.valueOf().addEventListener('mouseup', eventBus.onSelectEnds);
    self.picker.valueOf().addEventListener('mousemove', eventBus.onSelecting);
    self.picker.valueOf().addEventListener('mousedown', eventBus.onSelectStarts);

    self.image.addEventListener('load', eventBus.onImageLoads);

    self.canvas.addEventListener('mousedown', eventBus.onSelectStarts);
  };

  ColorWheel.prototype.getColorBrightness = function(r,g,b) {
    return Math.sqrt(r * r * .241 + g * g * .691 + b * b * .068);
  };

  ColorWheel.prototype.getCursorPos = function () {
    return this.getRelativeCursorPos(this.canvasPos.x, this.canvasPos.y);
  };

  /**
   *
   * @param x
   * @param y
   * @returns {{r: (*|number), g: (*|number), b: (*|number), a: *}}
   */
  ColorWheel.prototype.getPixelAt = function (x, y) {
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
    // #1
    //this.context2d.drawImage(this.image, 0, 0, this.radius * 2, this.radius * 2);

    // #2
    //var context = this.context2d;
    //var canvas = this.canvas;
    //var x = canvas.width / 2;
    //var y = canvas.height / 2;
    //var radius = 150;
    //var counterClockwise = false;
    //
    //for(var angle=0; angle<=360; angle+=1){
    //  var startAngle = (angle-2)*Math.PI/180;
    //  var endAngle = angle * Math.PI/180;
    //  context.beginPath();
    //  context.moveTo(x, y);
    //  context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
    //  context.closePath();
    //  var gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    //  gradient.addColorStop(0,'hsl('+angle+', 10%, 100%)');
    //  gradient.addColorStop(1,'hsl('+-180+angle+', 100%, 50%)');
    //  context.fillStyle = gradient;
    //  context.fill();
    //}

    // #3
    var steps = 360;
    var colorCallback = function(ctx, angle) {
      var gradient = ctx.createRadialGradient(1, 1, 1, 1, 1, 0);
      gradient.addColorStop(0, 'hsl(' + (360 - angle) + ', 100%, 50%)');
      gradient.addColorStop(1, "#FFFFFF");

      ctx.fillStyle = gradient;
      ctx.fill();
    };
    var x = 150, // coordinate on x-axis
      y = 150, // coordinate on y-axis
      a = 150, // radius on x-axis
      b = 150, // radius on y-axis
      angle = 360,
      coef = Math.PI / 180,
      ctx = this.context2d;

    ctx.save();
    ctx.translate(x - a, y - b);
    ctx.scale(a, b);

    steps = (angle / steps) || 360;

    for (; angle > 0 ; angle -= steps){
      ctx.beginPath();
      if (steps !== 360) ctx.moveTo(1, 1); // stroke
      ctx.arc(1, 1, 1,
        (angle - (steps / 2) - 1) * coef,
        (angle + (steps  / 2) + 1) * coef);

      if (colorCallback) {
        colorCallback(ctx, angle);
      } else {
        ctx.fillStyle = 'black';
        ctx.fill();
      }
    }
    ctx.restore();
  };

  /**
   *
   * @param elLeft
   * @param elTop
   * @returns {{x: number, y: number}}
   */
  ColorWheel.prototype.getRelativeCursorPos = function (elLeft, elTop) {
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

  Picker.prototype.bindEvents = function () {
    this.cursorImage.addEventListener('mousedown', function (e) {
      e.preventDefault();
    });
  };

  Picker.prototype.move = function (x, y) {
    var cursorRadius = Math.round(this.cursorImage.width / 2);

    if (arguments.length == 1 && typeof x == 'object') {
      y = x.y;
      x = x.x;
    }
    this.x = x - cursorRadius;
    this.y = y - cursorRadius;
    this.updateElementPosition();
  };

  Picker.prototype.updateElementPosition = function () {
    this.cursorImage.style.left = this.x + 'px';
    this.cursorImage.style.top = this.y + 'px';
  };

  Picker.prototype.valueOf = function () {
    return this.cursorImage;
  };

  /**
   *
   * @param canvasEl
   * @constructor
   */
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

  /**
   * Event subscriber
   * @param evt
   * @param fn
   */
  StormColorPicker.prototype.on = function (evt, fn) {
    if (evt in this.apiSubscribers !== -1) {
      this.apiSubscribers[evt].push(fn);
    }
  };

  StormColorPicker.prototype.setupCanvas = function () {
    this.canvas.style.cursor = 'default';
    this.canvas.style.position = 'relative';
  };

  StormColorPicker.prototype.drawFrame = function () {
    this.context2d.clearRect(0, 0, this.wheelImage.width, this.wheelImage.height);
    this.draw();
  };

  glob.StormColorPicker = StormColorPicker;

})((eval, this));
