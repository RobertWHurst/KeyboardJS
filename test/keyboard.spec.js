
var sinon    = require('sinon');
var assert   = require('assert');
var Keyboard = require('../lib/keyboard');
var KeyCombo = require('../lib/key-combo');
var Locale   = require('../lib/locale');
var doc      = require('./fixtures/document');
var win      = require('./fixtures/window');


describe('Keyboard', function() {

  var keyboard;
  beforeEach(function() {
    keyboard = new Keyboard(win, doc);
  });


  describe('#setLocale', function() {

    it('creates and sets a locale', function() {
      keyboard.setLocale('testName', function(locale, platform, userAgent) {
        assert.equal(platform,  'test-platform');
        assert.equal(userAgent, 'test-user-agent');

        locale.test = 1;
      });

      assert.equal(keyboard._locale.test, 1);
      assert.equal(keyboard._locales.testName.test, 1);
    });

    it('sets a locale', function() {
      keyboard._locales.testName = { test: 2 };

      keyboard.setLocale('testName');

      assert.equal(keyboard._locale.test, 2);
    });

    it('accepts locale instance and sets it', function() {
      keyboard.setLocale({
        localeName: 'testName',
        test: 3
      });

      assert.equal(keyboard._locale.test, 3);
    });
  });


  describe('#getLocale', function() {

    it('returns the current locale', function() {
      keyboard._locales.testName = { test: 4, localeName: 'testName' };
      keyboard._locale = keyboard._locales.testName;

      var locale = keyboard.getLocale();

      assert.equal(locale.test, 4);
    });

    it('returns the a locale by name', function() {
      keyboard._locales.testName = { test: 5 };
      keyboard._locale = keyboard._locales.testName;

      var locale = keyboard.getLocale('testName');

      assert.equal(locale.test, 5);
    });
  });


  describe('#bind', function() {

    it('binds a combo to press handler and release handlers', function() {
      var pressHandler = function() {};
      var releaseHandler = function() {};

      keyboard.bind('a', pressHandler, releaseHandler);

      assert.equal(keyboard._listeners[0].keyCombo.sourceStr, 'a');
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
    });

    it('binds a combo to a press handler', function() {
      var pressHandler = function() {};

      keyboard.bind('a', pressHandler);

      assert.equal(keyboard._listeners[0].keyCombo.sourceStr, 'a');
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, null);
    });

    it('binds a combo to a release handler', function() {
      var releaseHandler = function() {};

      keyboard.bind('a', null, releaseHandler);

      assert.equal(keyboard._listeners[0].keyCombo.sourceStr, 'a');
      assert.equal(keyboard._listeners[0].pressHandler, null);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
    });

    it('binds several combos to press and release handlers', function() {
      var pressHandler = function() {};
      var releaseHandler = function() {};

      keyboard.bind(['a', 'b'], pressHandler, releaseHandler);

      assert.equal(keyboard._listeners[0].keyCombo.sourceStr, 'a');
      assert.equal(keyboard._listeners[1].keyCombo.sourceStr, 'b');
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[1].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[1].releaseHandler, releaseHandler);
    });

    it('binds press and release handlers to any keypress', function() {
      var pressHandler = function() {};
      var releaseHandler = function() {};

      keyboard.bind(pressHandler, releaseHandler);

      assert.equal(keyboard._listeners[0].keyCombo, null);
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
    });

    it('accepts preventRepeat as a final argument', function() {
      var pressHandler = function() {};
      var releaseHandler = function() {};

      keyboard.bind('a', pressHandler, releaseHandler, true);
      keyboard.bind(pressHandler, releaseHandler, true);

      assert.equal(keyboard._listeners[0].keyCombo.sourceStr, 'a');
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[0].preventRepeat, true);
      assert.equal(keyboard._listeners[1].keyCombo, null);
      assert.equal(keyboard._listeners[1].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[1].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[1].preventRepeat, true);
    });
  });


  describe('#addListener', function() {

    it('is an alias for bind', function() {
      assert.equal(keyboard.addListener, keyboard.bind);
    });
  });


  describe('#on', function() {

    it('is an alias for bind', function() {
      assert.equal(keyboard.on, keyboard.bind);
    });
  });

  describe('#unbind', function() {

    var pressHandler = function() {};
    var releaseHandler = function() {};
    beforeEach(function() {
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: pressHandler,
        releaseHandler: releaseHandler,
        preventRepeat: false
      });
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: null,
        releaseHandler: releaseHandler,
        preventRepeat: false
      });
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: pressHandler,
        releaseHandler: null,
        preventRepeat: false
      });
    });

    afterEach(function() {
      keyboard._listeners.length = 0;
    });

    it('unbinds a combo from press handler and release handlers', function() {
      keyboard.unbind('a', pressHandler, releaseHandler);

      assert.equal(keyboard._listeners.length, 2);
      assert.equal(keyboard._listeners[0].pressHandler, null);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[1].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[1].releaseHandler, null);
    });

    it('unbinds a combo from a press handler', function() {
      keyboard.unbind('a', pressHandler);

      assert.equal(keyboard._listeners.length, 2);
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[1].pressHandler, null);
      assert.equal(keyboard._listeners[1].releaseHandler, releaseHandler);
    });

    it('unbinds a combo from a release handler', function() {
      keyboard.unbind('a', null, releaseHandler);

      assert.equal(keyboard._listeners.length, 2);
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[1].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[1].releaseHandler, null);
    });

    it('unbinds a several combos from press and release handlers', function() {
      keyboard._listeners.push({
        keyCombo: new KeyCombo('b'),
        pressHandler: pressHandler,
        releaseHandler: releaseHandler,
        preventRepeat: false
      });

      keyboard.unbind(['a', 'b'], pressHandler, releaseHandler);

      assert.equal(keyboard._listeners.length, 2);
      assert.equal(keyboard._listeners[0].pressHandler, null);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[1].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[1].releaseHandler, null);
    });

    it('unbinds press and release handlers bound to any key press', function() {
      keyboard._listeners.push({
        keyCombo: null,
        pressHandler: pressHandler,
        releaseHandler: releaseHandler,
        preventRepeat: false
      });


      keyboard.unbind(pressHandler, releaseHandler);

      assert.equal(keyboard._listeners.length, 3);
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[1].pressHandler, null);
      assert.equal(keyboard._listeners[1].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[2].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[2].releaseHandler, null);
    });
  });


  describe('#removeListener', function() {

    it('is an alias for unbind', function() {
      assert.equal(keyboard.removeListener, keyboard.unbind);
    });
  });


  describe('#off', function() {

    it('is an alias for unbind', function() {
      assert.equal(keyboard.off, keyboard.unbind);
    });
  });


  describe('#setContext', function() {

    it('releases all keys before setting the context', function() {
      keyboard._locale = {};
      sinon.stub(keyboard, 'releaseAllKeys');

      keyboard.setContext('myContext');

      assert.ok(keyboard.releaseAllKeys.calledOnce);

      keyboard.releaseAllKeys.restore();
    });

    it('creates a new context with the given name if it doesn\'t exist.', function() {
      keyboard.setContext('myContext');

      assert.ok(keyboard._contexts.myContext);
      assert.equal(keyboard._currentContext, 'myContext');
    });

    it('applies an existing context if one with the given name already exists', function() {
      keyboard._contexts.myContext = [1];

      keyboard.setContext('myContext');

      assert.equal(keyboard._currentContext, 'myContext');
      assert.equal(keyboard._contexts[keyboard._currentContext][0], 1);
    });
  });


  describe('#getContext', function() {

    it('returns the current context', function() {
      keyboard._currentContext = 'myContext';

      assert.equal(keyboard.getContext(), 'myContext');
    });
  });


  describe('#watch', function() {

    it('calls stop', function() {
      sinon.stub(keyboard, 'stop');

      keyboard.watch(win, doc);

      assert.ok(keyboard.stop.calledOnce);
      keyboard.stop.restore();
    });

    it('attaches to a given window and document', function() {
      var win = { addEventListener: sinon.stub() };
      var doc = { addEventListener: sinon.stub() };

      keyboard.watch(win, doc);

      assert.equal(keyboard._isModernBrowser, true);
      assert.equal(keyboard._targetWindow, win);
      assert.equal(keyboard._targetElement, doc);
      assert.ok(win.addEventListener.firstCall.args[0], 'focus');
      assert.ok(win.addEventListener.secondCall.args[0], 'blur');
      assert.ok(doc.addEventListener.firstCall.args[0], 'keydown');
      assert.ok(doc.addEventListener.secondCall.args[0], 'keyup');
    });

    it('attaches to a given window and document (Legacy IE)', function() {
      var win = { attachEvent: sinon.stub() };
      var doc = { attachEvent: sinon.stub() };

      keyboard.watch(win, doc);

      assert.equal(keyboard._isModernBrowser, false);
      assert.equal(keyboard._targetWindow, win);
      assert.equal(keyboard._targetElement, doc);
      assert.ok(win.attachEvent.firstCall.args[0], 'onfocus');
      assert.ok(win.attachEvent.secondCall.args[0], 'onblur');
      assert.ok(doc.attachEvent.firstCall.args[0], 'onkeydown');
      assert.ok(doc.attachEvent.secondCall.args[0], 'onkeyup');
    });
    
    it('attaches to the global namespace if a window and document is not given', function() {
      global.addEventListener = sinon.stub();
      global.document         = { addEventListener: sinon.stub() };

      keyboard.watch();

      assert.equal(keyboard._isModernBrowser, true);
      assert.equal(keyboard._targetWindow, global);
      assert.equal(keyboard._targetElement, global.document);
      assert.ok(global.addEventListener.firstCall.args[0], 'focus');
      assert.ok(global.addEventListener.secondCall.args[0], 'blur');
      assert.ok(global.document.addEventListener.firstCall.args[0], 'keydown');
      assert.ok(global.document.addEventListener.secondCall.args[0], 'keyup');
      
      delete global.addEventListener;
      delete global.document;
    });
    
    it('throws is error if the target window does not have the nessisary methods', function() {
      var win = {};
      var doc = {};
      
      assert.throws(function() {
        keyboard.watch(win, doc);
      }, /^(?=.*targetWindow)(?=.*addEventListener)(?=.*attachEvent).*$/);
    });
    
    it('throws is error a target window was not given and if the global does contain the nessisary functions', function() {
      assert.throws(function() {
        keyboard.watch();
      }, /^(?=.*global)(?=.*addEventListener)(?=.*attachEvent).*$/);
    });
  });


  describe('#stop', function() {

    it('dettaches from the currently attached window and document', function() {
      var doc = keyboard._targetElement = { removeEventListener: sinon.stub() };
      var win = keyboard._targetWindow  = { removeEventListener: sinon.stub() };

      keyboard.stop();

      assert.equal(keyboard._targetWindow, null);
      assert.equal(keyboard._targetElement, null);
      assert.ok(win.removeEventListener.firstCall.args[0], 'focus');
      assert.ok(win.removeEventListener.secondCall.args[0], 'blur');
      assert.ok(doc.removeEventListener.firstCall.args[0], 'keydown');
      assert.ok(doc.removeEventListener.secondCall.args[0], 'keyup');
    });

    it('dettaches from the currently attached window and document (Legacy IE)', function() {
      var doc = { detachEvent: sinon.stub() };
      var win = { detachEvent: sinon.stub() };

      keyboard._isModernBrowser = false;
      keyboard._targetElement   = doc;
      keyboard._targetWindow    = win;

      keyboard.stop();

      assert.equal(keyboard._targetWindow, null);
      assert.equal(keyboard._targetElement, null);
      assert.ok(win.detachEvent.firstCall.args[0], 'onfocus');
      assert.ok(win.detachEvent.secondCall.args[0], 'onblur');
      assert.ok(doc.detachEvent.firstCall.args[0], 'onkeydown');
      assert.ok(doc.detachEvent.secondCall.args[0], 'onkeyup');
    });
  });


  describe('#pressKey', function() {

    var locale;
    beforeEach(function() {
      locale = new Locale('test');
      locale.bindKeyCode(0, 'a');
      locale.bindKeyCode(1, 'b');
      keyboard._locale = locale;
    });

    it('calls pressKey on the locale', function() {
      sinon.stub(locale, 'pressKey');

      keyboard.pressKey('a');

      assert.equal(locale.pressKey.lastCall.args[0], 'a');

      locale.pressKey.restore();
    });

    it('executes bindings with a combo matching the pressed keys within the locale', function() {
      var pressHandler = sinon.stub();
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: pressHandler,
        releaseHandler: null,
        preventRepeat: false
      });

      keyboard.pressKey('a');

      assert.ok(pressHandler.calledOnce);
    });

    it('executes bindings without a combo', function() {
      var pressHandler = sinon.stub();
      keyboard._listeners.push({
        keyCombo: null,
        pressHandler: pressHandler,
        releaseHandler: null,
        preventRepeat: false
      });

      keyboard.pressKey('a');
      keyboard.pressKey('b');

      assert.ok(pressHandler.calledTwice);
    });

    it('prevents combo overlap by marking off keys once they have been used by a combo', function() {
      var aPressHandler  = sinon.stub();
      var aBPressHandler = sinon.stub();
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: aPressHandler,
        releaseHandler: null,
        preventRepeat: false
      });
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a + b'),
        pressHandler: aBPressHandler,
        releaseHandler: null,
        preventRepeat: false
      });

      keyboard.pressKey('a'); // combo a fires
      keyboard.pressKey('b'); // combo a + b fires, but not combo a because the
                              // a key has been consumed by combo a + b

      assert.ok(aPressHandler.calledOnce);
      assert.ok(aBPressHandler.calledOnce);
    });

    it('allows any number of identical bindings to fire without inhibiting each other', function() {
      var a1PressHandler = sinon.stub();
      var a2PressHandler = sinon.stub();
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: a1PressHandler,
        releaseHandler: null,
        preventRepeat: false
      });
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: a2PressHandler,
        releaseHandler: null,
        preventRepeat: false
      });

      keyboard.pressKey('a'); // combo a1 and a2 fires

      assert.ok(a1PressHandler.calledOnce);
      assert.ok(a2PressHandler.calledOnce);
    });

    it('does nothing when paused', function() {
      sinon.stub(locale, 'pressKey');
      keyboard._paused = true;

      keyboard.pressKey('a');

      assert.equal(locale.pressKey.called, false);
      assert.equal(locale.pressedKeys.length, 0);

      locale.pressKey.restore();
    });
  });


  describe('#releaseKey', function() {

    var locale;
    beforeEach(function() {
      locale = new Locale('test');
      locale.bindKeyCode(0, 'a');
      keyboard._locale = locale;
    });

    it('calls releaseKey on the locale', function() {
      sinon.stub(locale, 'releaseKey');

      keyboard.releaseKey('a');

      assert.equal(locale.releaseKey.lastCall.args[0], 'a');

      locale.releaseKey.restore();
    });

    it('will not execute a binding\'s releaseHandler unless it was triggered first by a press', function() {
      var releaseHandler = sinon.stub();
      keyboard.pressKey('a');
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: null,
        releaseHandler: releaseHandler,
        preventRepeat: false
      });

      keyboard.releaseKey('a');

      assert.equal(releaseHandler.calledOnce, false);
    });

    it('executes the releaseHandler of active bindings that no longer match the pressed keys', function() {
      var releaseHandler = sinon.stub();
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: null,
        releaseHandler: releaseHandler,
        preventRepeat: false
      });
      keyboard.pressKey('a');

      keyboard.releaseKey('a');

      assert.ok(releaseHandler.calledOnce);
    });

    it('executes the releaseHandler without a combo', function() {
      var releaseHandler = sinon.stub();
      keyboard._listeners.push({
        keyCombo: null,
        pressHandler: null,
        releaseHandler: releaseHandler,
        preventRepeat: false
      });
      keyboard.pressKey('a');
      keyboard.pressKey('b');

      keyboard.releaseKey('a');
      keyboard.releaseKey('b');

      assert.ok(releaseHandler.calledTwice);
    });
  });


  describe('#releaseAllKeys', function() {

    var locale;
    beforeEach(function() {
      locale = new Locale('test');
      locale.bindKeyCode(0, 'a');
      keyboard._locale = locale;
    });

    it('clears pressedKeys on the locale', function() {
      keyboard.releaseAllKeys();

      assert.equal(locale.pressedKeys.length, 0);
    });

    it('will not execute a binding\'s releaseHandler unless it was triggered first by a press', function() {
      var releaseHandler = sinon.stub();
      keyboard.pressKey('a');
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: null,
        releaseHandler: releaseHandler,
        preventRepeat: false
      });

      keyboard.releaseAllKeys();

      assert.equal(releaseHandler.calledOnce, false);
    });

    it('executes the releaseHandler of active bindings that no longer match the pressed keys', function() {
      var releaseHandler = sinon.stub();
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: null,
        releaseHandler: releaseHandler,
        preventRepeat: false
      });
      keyboard.pressKey('a');

      keyboard.releaseAllKeys();

      assert.ok(releaseHandler.calledOnce);
    });
  });


  describe('#pause', function() {

    it('pauses the instance', function() {
      keyboard.pause();

      assert.ok(keyboard._paused);
    });
  });


  describe('#resume', function() {

    it('resumes the instance', function() {
      keyboard.resume();

      assert.equal(keyboard._paused, false);
    });
  });


  describe('#reset', function() {

    it('calls releaseAllKeys', function() {
      sinon.stub(keyboard, 'releaseAllKeys');

      keyboard.reset();

      assert.ok(keyboard.releaseAllKeys.calledOnce);

      keyboard.releaseAllKeys.reset();
    });

    it('clears all listeners', function() {
      sinon.stub(keyboard, 'releaseAllKeys');
      keyboard._listeners = [1];

      keyboard.reset();

      assert.equal(keyboard._listeners.length, 0);

      keyboard.releaseAllKeys.reset();
    });
  });
});
