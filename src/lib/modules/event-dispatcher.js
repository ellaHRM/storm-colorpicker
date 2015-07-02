// lib/event-dispatcher.js

/**
 *
 * @returns {publicApi}
 * @constructor
 */
function SCPEventDispatcher() {
  var events = {},
    publicApi,
    protectedApi;

  publicApi = {
    /**
     * Subscribe @fn to @evt
     * @param evt
     * @param fn
     * @returns {on}
     */
    on: function (evt, fn) {
      if (!SCP.utils.isStr(evt) || !SCP.utils.isFunc(fn)) {
        throw new SCPError(SCP.errMsg.INVALID_EVENT_DECLARATION);
      }

      evt = evt.trim();
      evt.split(' ').map(function (ev) {
        if (!events.hasOwnProperty(ev)) {
          events[ev] = [];
        }
        events[ev].push(fn);
      });

      return this;
    },
    /**
     * Dispatches @evt
     * @param evt
     * @param (args)
     */
    toggle: function (evt, args) {
      var fnArgs = Array.prototype.slice.call(arguments, 1);
      if (SCP.utils.isStr(evt)) {
        evt = evt.trim();
        evt.split(' ').map(function (ev) {
          if (events.hasOwnProperty(ev)) {
            events[ev].map(function (fn) {
              fn.apply(this, fnArgs);
            });
          }
        });
      }
    }
  };

  protectedApi = {
    /**
     * Events object
     */
    events: {writable: false, value: events}
  };

  return Object.create(publicApi, protectedApi);
}

// end lib/event-dispatcher.js
