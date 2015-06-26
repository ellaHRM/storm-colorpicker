document.addEventListener('DOMContentLoaded', ready);

function ready() {
  var a = 4;
  var b = 3;
  var c = 5;
  var seglen;
  var div1 = document.querySelector('#result1');
  var div2 = document.querySelector('#result2');

// #1 ----- Find triangle's angle -----

  var acb = getAbcAngle(a, c, b);
  var cab = getAbcAngle(c, a, b);
  var abc = getAbcAngle(a, b, c);

  console.log(acb);
  console.log(cab);
  console.log(abc);
  div1.innerText = 'abc: ' + abc + ', acb: ' + acb + ', cab: ' + cab;

  function getAbcAngle(aLen, bLen, cLen, precision) {
    return parseFloat((Math.acos((aLen * aLen + cLen * cLen - bLen * bLen) / (2 * aLen * cLen)) / Math.PI * 180).toFixed(0 || precision));
  }

// #2 ----- Find segment's length -----

  /*
   Formula:
   x1, y1 - start coords
   x2, y2 - end coords
   L - sqrt(pow(x2-x1)+pow(y2-y1))
   */

  var segLen = calcSegmentLen(0, 0, 3, 4);
  console.log(segLen);
  div2.innerText = 'segment length: ' + segLen;

  function calcSegmentLen(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
  var canvas = document.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var lightness = document.querySelector('#lightness');
  var hue;
  var saturation;
  var brightness;
  var light;
  var mousedown = false;

  function drawCircle() {
    ctx.beginPath();
    ctx.arc(150, 150, 150, 0, 2 * Math.PI);
    ctx.stroke();
  }

  function valToPercent(val, percent) {
    return function (num) {
      return Math.round(percent / val * num);
    }
  }

  function drawTriangle(ax, ay, bx, by, cx, cy) {
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(cx, cy);
    ctx.lineTo(ax, ay);
    ctx.stroke();
  }

  function paintBg(h, s, l, ss, bb) {
    var hsl = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
    var hsb = 'hsb(' + h + ', ' + ss + '%, ' + bb + '%)';
    document.body.style.backgroundColor = hsl;
    div2.innerHTML = 'hsl: ' + hsl + '<br>' + 'hsb: ' + hsb;
  }

  canvas.addEventListener('mousedown', function () {
    mousedown = true;
  });

  canvas.addEventListener('mouseleave', function () {
    mousedown = false;
  });
  canvas.addEventListener('mouseup', function () {
    mousedown = false;
  });
  var c150to100 = valToPercent(150, 100);
  var c255to100 = valToPercent(255, 100);

  canvas.addEventListener('mousemove', function (e) {
    if (mousedown) {
      // hue from 1 to 360
      var x = Math.abs(e.offsetX);
      var y = Math.abs(e.offsetY);
      var mX = 150;
      var mY = 150;
      var cab;

      var ab = calcSegmentLen(mX, mY, mX + 150, mY);
      var bc = calcSegmentLen(mX + 150, mY, x, y);
      var ca = calcSegmentLen(mX, mY, x, y);
      console.log(x, y);

      var A1x = mX;
      var A1y = mY;
      var B1x = mX + 150;
      var B1y = mY;
      var A2x = A1x;
      var A2y = A1y;
      var B2x = x;
      var B2y = y;

      var vA = {
        x: B1x - A1x,
        y: B1y - A1y
      };
      var vB = {
        x: B2x - A2x,
        y: B2y - A2y
      };

      var angle = parseFloat((Math.acos(Math.abs(vA.x * vB.x + vA.y * vB.y) / (Math.sqrt(Math.pow(vA.x, 2) + Math.pow(vA.y, 2)) * Math.sqrt(Math.pow(vB.x, 2) + Math.pow(vB.y, 2)))) / Math.PI * 180));
      //console.log(angle);

      ctx.clearRect(0, 0, 300, 300);
      drawCircle();
      //drawTriangle(mX, mY, mX + 150, mY, x, y);

      cab = getAbcAngle(ab, bc, ca);
      if (y < 150) {
        cab = (360 - cab);
      }

      hue = 360 - cab;
      // hue end

      console.log(Math.round(ca));
      // saturation
      saturation = c150to100(Math.round(ca));
      brightness = c255to100(lightness.value);
      // saturation end
      //hsbToHsl(hue, saturation, lightness.value);
      var hsl = calculateHSL(hue, saturation, brightness);

      paintBg(hsl.h, hsl.s, hsl.l, saturation, brightness);
    }
  });

  lightness.addEventListener('input', function () {
    brightness = c255to100(lightness.value);
    var hsl = calculateHSL(hue, saturation, brightness);

    paintBg(hsl.h, hsl.s, hsl.l, saturation, brightness);
  });

  function hsbToHsl(h, s, b) {
    //var c1to100 = valToPercent(255, 100);
    //b = c1to100(b) / 100;
    b = b / 100;
    s = s / 100;
    var ll = (b / 2) * (2 - s);
    var ss = (b * s) / (1 - Math.abs(2 * ll - 1));
    hue = h;
    saturation = Math.round(ss * 100);
    light = Math.round(ll * 100);
  }

  hsbToHsl(52, 26, 34);
  //console.log(hue, saturation, light);

  drawCircle();

}


//function hsbToHsl(h, s, b) {
//  // s and b [0, 1]
//  b = b / 100;
//  s = s / 100;
//  var l = (b / 2) * (2 - s);
//  var ss = (b * s) / (1 - Math.abs(2 * l - 1));
//  ss = Math.round(ss * 100);
//  l = Math.round(l * 100);
//
//  console.log('hsbToHsl: ', h, ss, l);
//}

function calculateHSL(h, s, b) {
  // determine the lightness in the range [0,100]
  var l = (2 - s / 100) * b / 2;
  var ss = s * b / (l < 50 ? l * 2 : 200 - l * 2);

  // store the HSL components
  var hsl =
  {
    h : h,
    s : Math.floor(ss),
    l : Math.floor(l)
  };

  // correct a division-by-zero error
  if (isNaN(hsl.s)) hsl.s = 0;
  //console.log('calculateHSL: ', hsl);

  return hsl;
}

//hsbToHsl(49, 100, 100);
console.log(calculateHSL(331, 68, 100));

var la = getLineAngle(150, 150, 82, 270);
console.log(la);

function getLineAngle(x0, y0, len, angle) {
  return {
    x: x0 - len * parseInt(Math.cos(angle * Math.PI/180).toFixed(20)),
    y: y0 - len * parseInt(Math.sin(angle * Math.PI/180).toFixed(20))
  }
}
