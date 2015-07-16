This brunch consists components for "Storm colorpicker"

# Slider component

![](../components/src/components/slider/slider.gif)

## Install

Download `slider` folder
Build `slider.less` with [less](http://lesscss.org/)
Include `slider.js` and `slider.css` into html file

## How to use

Init `Slider` object:

	var vSlider = new Slider('#slider-h');

Constructor accepts 3 parameters:

	Slider(attachTo, direction, caption)

| Parameter  | Mandatory | Type | Default | Description
| ------------- | ------------- | ------------- | ------------- | ------------- |
| attachTo  | +  | string\|HTMLElement |  | Element to which append Slider. If put a string, then element will be selected via `querySelector`, else element will be itself. |
| direction  | -  | string | horizontal | Slider's direction. Can be `horizontal` or `vertical` |
| caption | - | string | null | If `captions` is presented, tip will be shown during capturing and sliding, else nothing will be shown. Supports parametric expression `{$n}` to display current value |
| value | - | int | null | Sets a start value of slider |
| thumbDirection | - | string | left or top, depends on `direction` | Accepts values: `top`, `bottom`, `left`, `right`. Indicates, where is display the tip with `caption`. By default `left` for `vertical` direction and `top` for `horizontal` direction |
| min | - | int | 0 | Sets minimum value of slider. Negative values also accepted |
| max | - | int | 100 | Sets maximum value of slider. Negative values also accepted. If max value more then min, `Slider` will be mirrored (higher value first) |

Also it's possible to put 2nd parameter as object with same optional parameters:

```JavaScript
new Slider('#slider-h', {
    direction: 'horizontal',
    caption: 'Opacity: {$n}',
    value: 50,
    thumbDirection: 'top',
    min: 0,
    max: 255
  });
```

## Methods

```JavaScript
setValue(val) - set value
getValue() - get value
showTip() - show a tip programatically
hideTip() - hide tip programatically
setCaption(caption) - change caption on the fly
on(evt, fnCallback) - event`change` is going to fire when value on slider changes
```

## Examples

```JavaScript
// #1
var hSlider = new Slider('#slider-h', {
    direction: 'horizontal',
    value: 105,
    caption: 'Opacity: {$n}',
    min: 0,
    max: 255,
    thumbDirection: 'top'
  });
  hSlider.on('change', function (val) {
    console.log(val);
    console.log(this.hideTip());
    // this reffers to Slider's object
  });
```

```JavaScript
// #2
var vSlider = new Slider('#slider-vertical', 'vertical', 'Brightness: {$n}');
  vSlider.setValue(88);
```
