/**
 *
 * @type {{getVal: Function}}
 */
SCP.utils =  {
  getVal: function (obj, initial) {
    return obj !== undefined ? obj : (initial !== undefined ? initial : null);
  }
};
