// lib/modules/template.js

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

  self.getSize = function(size) {
    return (sizes.hasOwnProperty(size)) ? sizes[size] : sizes[defaults.size];
  };

  self.getTheme = function(tName) {
    return (themes.hasOwnProperty(tName)) ? themes[tName] : themes[defaults.theme];
  };

  self.addTheme = function(tName, config) {
    tName = tName.trim();
    if (!tName) throw new SCPError(SCP.errMsg.INVALID_THEME_NAME);

    themes[tName] = {
      bgColor: config.bgColor || themes[defaults.theme].bgColor
    };
  };

  self.configTheme = function(tName, property, value) {
    if (themes.hasOwnProperty(tName)) {
      if (arguments.length === 2 && SCP.utils.isObj(property)) {
        SCP.utils.mapObj(property, function(propVal, propName) {
          themes[tName][propName] = propVal;
        });
      } else if (arguments.length === 3) {
        themes[tName][property] = value;
      }
    }
  };

  self.build = function() {

  };

  self.render = function($container) {

  };

  self.theme = self.getTheme(defaults.theme);
  self.size = self.getSize(defaults.size);
  self.$tpl = '';
  self.colorWheel = new SCPColorWheel();
}
SCPTemplate.prototype = new SCPEventDispatcher();

// end lib/modules/template.js
