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
    if (!tName) throw new SCPError('Invalid theme name');

    themes[tName] = {
      bgColor: config.bgColor || themes[defaults.theme].bgColor
    };
  };

  self.theme = self.getTheme(defaults.theme);
  self.size = self.getSize(defaults.size);
}
SCPTemplate.prototype = new SCPEventDispatcher();

// end lib/modules/template.js
