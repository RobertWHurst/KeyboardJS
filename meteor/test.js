'use strict';

Tinytest.addAsync('To pass this test, press "k"', function (test, done) {
  KeyboardJS.on('k', function() {
    test.ok({message: 'Test passed by pressing "m". Just kidding, by pressing "k".'});
    done();
  });

});
