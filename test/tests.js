var expect = chai.expect;
// create container to append color picker
var containerEl = document.createElement('div');
containerEl.id = 'container';
document.body.appendChild(containerEl);
// end create container to append color picker

describe('StormColorPicker', function () {

  describe('#Initializing', function () {
    it('Should throw a SCPError if container is not found', function () {
      expect(function () {
        var opts = {
          container: '#hello'
        };

        new StormColorPicker(opts);
      }).to.throw(SCPError);
    });

    it('Should not throw an error if container is found', function () {
      expect(function () {
        var opts = {
          container: '#container'
        };

        new StormColorPicker(opts);
      }).to.not.throw();
    });
  });

});
