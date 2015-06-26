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
      if (!SCP.utils.isString(evt) || !SCP.utils.isFunction(fn)) {
        throw new SCPError('Event name must be a string and handler must be a callable function');
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
     * @returns {dispatch}
     */
    dispatch: function (evt, args) {
      var fnArgs = Array.prototype.slice.call(arguments, 1);
      if (SCP.utils.isString(evt)) {
        evt = evt.trim();
        evt.split(' ').map(function (ev) {
          if (events.hasOwnProperty(ev)) {
            events[ev].map(function (fn) {
              fn.apply(this, fnArgs);
            });
          }
        });
      }

      return this;

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
