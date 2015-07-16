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
        self.tplContainer.classList.add('cp-embedded');
        self.tplContainer.innerHTML = html;
        break;
    }

    self.tplContainer.classList.add('cp-theme-' + self.theme);
    self.container.appendChild(self.tplContainer);
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
  self.tplContainer = document.createElement('div');
  self.colorWheel = new SCPColorWheel();

  self.build();
}
SCPTemplate.prototype = new SCPEventDispatcher();

// end lib/modules/template.js
