
  var utils = SCP.utils,
    getVal = utils.getVal;

  function ColorWheel(options) {
    var self = this;

    self.setContainer(getVal(options.container));
  }

  ColorWheel.prototype.setContainer = function(selector) {
    var el = document.querySelector(selector);

    if (this.validate.isContainer(el)) {
      this.container = el;
    }
  };

  ColorWheel.prototype.validate = {
    isContainer: function(el) {
      if (!el || el.length === 0) {
        throw TypeError('Couldn\'t find a container element');
      }

      return true;
    }
  };

  window.ColorWheel = ColorWheel;
