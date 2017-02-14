
import sinon from 'sinon';

export default {
  addEventListener    : sinon.stub(),
  removeEventListener : sinon.stub(),
  navigator: {
    platform  : 'test-platform',
    userAgent : 'test-user-agent'
  }
};
