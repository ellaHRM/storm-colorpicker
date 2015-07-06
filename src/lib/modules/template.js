// lib/modules/template.js

/**
 * Template class
 * @constructor
 */
function SCPTemplate() {
  SCPEventDispatcher.call(this);

  var self = this,
    defaults = {
      theme: 'dark',
      size: 'full'
    },
    sizes = {
      full: {
        w: 500,
        h: 500
      },
      medium: {
        w: 300,
        h: 300
      },
      small: {
        w: 150,
        h: 150
      }
    },
    themes = {
      dark: {
        bgColor: 'brown'
      },
      light: {
        bgColor: 'white'
      }
    };

  /**
   * Returns size obj
   * @param size
   * @returns {*}
   */
  self.getSize = function (size) {
    return (sizes.hasOwnProperty(size)) ? sizes[size] : sizes[defaults.size];
  };

  /**
   * Set template's size
   * @param size
   */
  self.setSize = function (size) {
    if (sizes.hasOwnProperty(size)) {
      self.size = self.getSize(sizes[size]);
    }
  };

  /**
   * Returns theme object
   * @param tName
   * @returns {*}
   */
  self.getTheme = function (tName) {
    return (themes.hasOwnProperty(tName)) ? themes[tName] : themes[defaults.theme];
  };

  /**
   * Add theme @tName with set of parameters @config
   * @param tName
   * @param config
   */
  self.addTheme = function (tName, config) {
    tName = tName.trim();
    if (!tName) throw new SCPError(SCP.errMsg.INVALID_THEME_NAME);

    themes[tName] = {
      bgColor: config.bgColor || themes[defaults.theme].bgColor
    };
  };

  /**
   * Edit theme @tName. @property also can be an object with parameters
   * @param tName
   * @param property
   * @param value
   */
  self.configTheme = function (tName, property, value) {
    if (themes.hasOwnProperty(tName)) {
      if (arguments.length === 2 && SCP.utils.isObj(property)) {
        SCP.utils.mapObj(property, function (propVal, propName) {
          themes[tName][propName] = propVal;
        });
      } else if (arguments.length === 3) {
        themes[tName][property] = value;
      }
    }
  };

  self.build = function () {
    // dummy
    var template = '';
  };

  self.render = function ($container) {
    // dummy
  };

  self.theme = self.getTheme(defaults.theme);
  self.size = self.getSize(defaults.size);
  self.$tpl = '';
  self.colorWheel = new SCPColorWheel();
}
SCPTemplate.prototype = new SCPEventDispatcher();

// end lib/modules/template.js
