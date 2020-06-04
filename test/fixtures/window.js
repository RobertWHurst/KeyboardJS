import sinon from 'sinon';


export const window = {
  addEventListener    : sinon.stub(),
  removeEventListener : sinon.stub(),
  navigator: {
    platform  : 'test-platform',
    userAgent : 'test-user-agent'
  }
};
