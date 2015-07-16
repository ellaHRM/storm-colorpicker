(function (window) {

  // global object
  var SCP = {};

  // global configuration
  SCP.config = {
    debug: false
  };

  SCP.evt = {
    SELECT: 'select',
    SELECTING: 'selecting',
    BEFORE_SHOW: 'beforeShow',
    AFTER_SHOW: 'afterShow',
    BEFORE_CLOSE: 'beforeClose',
    AFTER_CLOSE: 'afterClose'
  };

  //= include ./lib/utils.js
  //= include ./lib/modules/error.js
  //= include ./lib/modules/err-msg.js
  //= include ./lib/modules/recent-colors.js
  //= include ./lib/modules/template.js
  //= include ./lib/modules/event-dispatcher.js
  //= include ./lib/modules/color-wheel.js

  //= include ./components/slider/slider.js

  function StormColorPicker(options) {
    SCPEventDispatcher.call(this);

    var self = this,
      events = [
        'select',
        'selecting',
        'beforeShow',
        'afterShow',
        'beforeClose',
        'afterClose'
      ],
      defaultOptions = {
        theme: 'dark',
        container: '',
        attach: 'inner',
        hideOnSelect: false,
        hide: 'click',
        show: 'always',
        format: 'hex'
      },
      scpColorWheel = new SCPColorWheel();

    // public
    self.opts = SCP.utils.extends(defaultOptions, options);
    self.scpTemplate = new SCPTemplate(self.opts.container);
    self.scpRecent = new SCPRecentColors();

    scpColorWheel.on(SCP.evt.SELECT, function () {
      self.toggle(SCP.evt.SELECT);
    });

    scpColorWheel.on(SCP.evt.SELECTING, function () {
      self.toggle(SCP.evt.SELECTING);
    });

    self.scpTemplate.on(SCP.evt.BEFORE_SHOW, function() {
      self.toggle(SCP.evt.BEFORE_SHOW);
    });

    self.scpTemplate.on(SCP.evt.AFTER_SHOW, function () {
      self.toggle(SCP.evt.AFTER_SHOW);
    });

    self.scpTemplate.on(SCP.evt.BEFORE_CLOSE, function () {
      self.toggle(SCP.evt.BEFORE_CLOSE);
    });

    self.scpTemplate.on(SCP.evt.AFTER_CLOSE, function () {
      self.toggle(SCP.evt.AFTER_CLOSE);
    });
  }
  StormColorPicker.prototype = new SCPEventDispatcher();

  window.StormColorPicker = StormColorPicker;
  window.SCPError = SCPError;

}(window));
