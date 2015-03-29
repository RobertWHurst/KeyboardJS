
var sinon = require('sinon');


module.exports = {
  addEventListener    : sinon.stub(),
  removeEventListener : sinon.stub(),
  navigator: {
    platform  : 'test-platform',
    userAgent : 'test-user-agent'
  }
};
