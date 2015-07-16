// lib/modules/template.js

/**
 * Template class
 * @param container
 * @constructor
 */
function SCPTemplate(container) {
  SCPEventDispatcher.call(this);

  var self = this,
    defaults = {
      theme: 'dark',
      attach: 'inner'
    },
    themes = ['dark', 'light'];

  /**
   *
   * @param html
   */
  self.setUpTplContainer = function(html) {
    switch (self.attach) {
      case 'inner':
        self.cpContainer.classList.add('cp-embedded');
        self.cpContainer.innerHTML = html;
        break;
    }

    self.cpContainer.classList.add('cp-theme-' + self.theme);
    self.container.appendChild(self.cpContainer);

    // attach sliders
    self.bSlider = new Slider(self.cpContainer.querySelector('.cp-slider-right'), {
      direction: 'vertical',
      caption: 'Brightness: {$n}',
      max: 255
    });
    self.oSlider = new Slider(self.cpContainer.querySelector('.cp-slider-bottom'), {
      direction: 'horizontal',
      caption: 'Opacity: {$n}',
      max: 255
    });
  };

  /**
   * Returns current theme
   * @returns {*}
   */
  self.getTheme = function () {
    return self.theme;
  };

  self.switchTheme = function(tName) {
    self.theme = tName;
  };

  self.build = function () {
    // dummy
    var tpl = '';
    //=include ./../../components/template/tpl.html */
    self.setUpTplContainer(tpl);
  };

  self.render = function ($container) {
    // dummy
  };

  self.container = container;
  self.theme = themes[0];
  self.attach = defaults.attach;
  self.cpContainer = document.createElement('div');
  self.colorWheel = new SCPColorWheel();
  self.bSlider = {};
  self.oSlider = {};

  self.build();
}
SCPTemplate.prototype = new SCPEventDispatcher();

// end lib/modules/template.js
