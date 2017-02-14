
import sinon from 'sinon';
import assert from 'assert';
import Keyboard from '../lib/keyboard';
import KeyCombo from '../lib/key-combo';
import Locale from '../lib/locale';
import doc from './fixtures/document';
import win from './fixtures/window';


describe('Keyboard', () => {

  let keyboard;
  beforeEach(() => {
    keyboard = new Keyboard(win, doc);
  });


  describe('#setLocale', () => {

    it('creates and sets a locale', () => {
      keyboard.setLocale('testName', (locale, platform, userAgent) => {
        assert.equal(platform,  'test-platform');
        assert.equal(userAgent, 'test-user-agent');

        locale.test = 1;
      });

      assert.equal(keyboard._locale.test, 1);
      assert.equal(keyboard._locales.testName.test, 1);
    });

    it('sets a locale', () => {
      keyboard._locales.testName = { test: 2 };

      keyboard.setLocale('testName');

      assert.equal(keyboard._locale.test, 2);
    });

    it('accepts locale instance and sets it', () => {
      keyboard.setLocale({
        localeName: 'testName',
        test: 3
      });

      assert.equal(keyboard._locale.test, 3);
    });
  });


  describe('#getLocale', () => {

    it('returns the current locale', () => {
      keyboard._locales.testName = { test: 4, localeName: 'testName' };
      keyboard._locale = keyboard._locales.testName;

      const locale = keyboard.getLocale();

      assert.equal(locale.test, 4);
    });

    it('returns the a locale by name', () => {
      keyboard._locales.testName = { test: 5 };
      keyboard._locale = keyboard._locales.testName;

      const locale = keyboard.getLocale('testName');

      assert.equal(locale.test, 5);
    });
  });


  describe('#bind', () => {

    it('binds a combo to press handler and release handlers', () => {
      const pressHandler = () => {};
      const releaseHandler = () => {};

      keyboard.bind('a', pressHandler, releaseHandler);

      assert.equal(keyboard._listeners[0].keyCombo.sourceStr, 'a');
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
    });

    it('binds a combo to a press handler', () => {
      const pressHandler = () => {};

      keyboard.bind('a', pressHandler);

      assert.equal(keyboard._listeners[0].keyCombo.sourceStr, 'a');
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, null);
    });

    it('binds a combo to a release handler', () => {
      const releaseHandler = () => {};

      keyboard.bind('a', null, releaseHandler);

      assert.equal(keyboard._listeners[0].keyCombo.sourceStr, 'a');
      assert.equal(keyboard._listeners[0].pressHandler, null);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
    });

    it('binds several combos to press and release handlers', () => {
      const pressHandler = () => {};
      const releaseHandler = () => {};

      keyboard.bind(['a', 'b'], pressHandler, releaseHandler);

      assert.equal(keyboard._listeners[0].keyCombo.sourceStr, 'a');
      assert.equal(keyboard._listeners[1].keyCombo.sourceStr, 'b');
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[1].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[1].releaseHandler, releaseHandler);
    });

    it('binds press and release handlers to any keypress', () => {
      const pressHandler = () => {};
      const releaseHandler = () => {};

      keyboard.bind(pressHandler, releaseHandler);

      assert.equal(keyboard._listeners[0].keyCombo, null);
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
    });

    it('accepts preventRepeat as a final argument', () => {
      const pressHandler = () => {};
      const releaseHandler = () => {};

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


  describe('#addListener', () => {

    it('is an alias for bind', () => {
      assert.equal(keyboard.addListener, keyboard.bind);
    });
  });


  describe('#on', () => {

    it('is an alias for bind', () => {
      assert.equal(keyboard.on, keyboard.bind);
    });
  });

  describe('#unbind', () => {

    const pressHandler = () => {};
    const releaseHandler = () => {};
    beforeEach(() => {
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler,
        releaseHandler,
        preventRepeat: false
      });
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: null,
        releaseHandler,
        preventRepeat: false
      });
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler,
        releaseHandler: null,
        preventRepeat: false
      });
    });

    afterEach(() => {
      keyboard._listeners.length = 0;
    });

    it('unbinds a combo from press handler and release handlers', () => {
      keyboard.unbind('a', pressHandler, releaseHandler);

      assert.equal(keyboard._listeners.length, 2);
      assert.equal(keyboard._listeners[0].pressHandler, null);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[1].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[1].releaseHandler, null);
    });

    it('unbinds a combo from a press handler', () => {
      keyboard.unbind('a', pressHandler);

      assert.equal(keyboard._listeners.length, 2);
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[1].pressHandler, null);
      assert.equal(keyboard._listeners[1].releaseHandler, releaseHandler);
    });

    it('unbinds a combo from a release handler', () => {
      keyboard.unbind('a', null, releaseHandler);

      assert.equal(keyboard._listeners.length, 2);
      assert.equal(keyboard._listeners[0].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[1].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[1].releaseHandler, null);
    });

    it('unbinds a several combos from press and release handlers', () => {
      keyboard._listeners.push({
        keyCombo: new KeyCombo('b'),
        pressHandler,
        releaseHandler,
        preventRepeat: false
      });

      keyboard.unbind(['a', 'b'], pressHandler, releaseHandler);

      assert.equal(keyboard._listeners.length, 2);
      assert.equal(keyboard._listeners[0].pressHandler, null);
      assert.equal(keyboard._listeners[0].releaseHandler, releaseHandler);
      assert.equal(keyboard._listeners[1].pressHandler, pressHandler);
      assert.equal(keyboard._listeners[1].releaseHandler, null);
    });

    it('unbinds press and release handlers bound to any key press', () => {
      keyboard._listeners.push({
        keyCombo: null,
        pressHandler,
        releaseHandler,
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


  describe('#removeListener', () => {

    it('is an alias for unbind', () => {
      assert.equal(keyboard.removeListener, keyboard.unbind);
    });
  });


  describe('#off', () => {

    it('is an alias for unbind', () => {
      assert.equal(keyboard.off, keyboard.unbind);
    });
  });


  describe('#setContext', () => {

    it('releases all keys before setting the context', () => {
      keyboard._locale = {};
      sinon.stub(keyboard, 'releaseAllKeys');

      keyboard.setContext('myContext');

      assert.ok(keyboard.releaseAllKeys.calledOnce);

      keyboard.releaseAllKeys.restore();
    });

    it('creates a new context with the given name if it doesn\'t exist.', () => {
      keyboard.setContext('myContext');

      assert.ok(keyboard._contexts.myContext);
      assert.equal(keyboard._currentContext, 'myContext');
    });

    it('applies an existing context if one with the given name already exists', () => {
      keyboard._contexts.myContext = [1];

      keyboard.setContext('myContext');

      assert.equal(keyboard._currentContext, 'myContext');
      assert.equal(keyboard._contexts[keyboard._currentContext][0], 1);
    });
  });


  describe('#getContext', () => {

    it('returns the current context', () => {
      keyboard._currentContext = 'myContext';

      assert.equal(keyboard.getContext(), 'myContext');
    });
  });


  describe('#watch', () => {

    it('calls stop', () => {
      sinon.stub(keyboard, 'stop');

      keyboard.watch(win, doc);

      assert.ok(keyboard.stop.calledOnce);
      keyboard.stop.restore();
    });

    it('attaches to a given window and document', () => {
      const win = { addEventListener: sinon.stub() };
      const doc = { addEventListener: sinon.stub() };

      keyboard.watch(win, doc);

      assert.equal(keyboard._isModernBrowser, true);
      assert.equal(keyboard._targetWindow, win);
      assert.equal(keyboard._targetElement, doc);
      assert.ok(win.addEventListener.firstCall.args[0], 'focus');
      assert.ok(win.addEventListener.secondCall.args[0], 'blur');
      assert.ok(doc.addEventListener.firstCall.args[0], 'keydown');
      assert.ok(doc.addEventListener.secondCall.args[0], 'keyup');
    });

    it('attaches to a given window and document (Legacy IE)', () => {
      const win = { attachEvent: sinon.stub() };
      const doc = { attachEvent: sinon.stub() };

      keyboard.watch(win, doc);

      assert.equal(keyboard._isModernBrowser, false);
      assert.equal(keyboard._targetWindow, win);
      assert.equal(keyboard._targetElement, doc);
      assert.ok(win.attachEvent.firstCall.args[0], 'onfocus');
      assert.ok(win.attachEvent.secondCall.args[0], 'onblur');
      assert.ok(doc.attachEvent.firstCall.args[0], 'onkeydown');
      assert.ok(doc.attachEvent.secondCall.args[0], 'onkeyup');
    });
    
    it('attaches to the global namespace if a window and document is not given', () => {
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
    
    it('throws is error if the target window does not have the nessisary methods', () => {
      const win = {};
      const doc = {};
      
      assert.throws(() => {
        keyboard.watch(win, doc);
      }, /^(?=.*targetWindow)(?=.*addEventListener)(?=.*attachEvent).*$/);
    });
    
    it('throws is error a target window was not given and if the global does contain the nessisary functions', () => {
      assert.throws(() => {
        keyboard.watch();
      }, /^(?=.*global)(?=.*addEventListener)(?=.*attachEvent).*$/);
    });
  });


  describe('#stop', () => {

    it('dettaches from the currently attached window and document', () => {
      const doc = keyboard._targetElement = { removeEventListener: sinon.stub() };
      const win = keyboard._targetWindow  = { removeEventListener: sinon.stub() };

      keyboard.stop();

      assert.equal(keyboard._targetWindow, null);
      assert.equal(keyboard._targetElement, null);
      assert.ok(win.removeEventListener.firstCall.args[0], 'focus');
      assert.ok(win.removeEventListener.secondCall.args[0], 'blur');
      assert.ok(doc.removeEventListener.firstCall.args[0], 'keydown');
      assert.ok(doc.removeEventListener.secondCall.args[0], 'keyup');
    });

    it('dettaches from the currently attached window and document (Legacy IE)', () => {
      const doc = { detachEvent: sinon.stub() };
      const win = { detachEvent: sinon.stub() };

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


  describe('#pressKey', () => {

    let locale;
    beforeEach(() => {
      locale = new Locale('test');
      locale.bindKeyCode(0, 'a');
      locale.bindKeyCode(1, 'b');
      keyboard._locale = locale;
    });

    it('calls pressKey on the locale', () => {
      sinon.stub(locale, 'pressKey');

      keyboard.pressKey('a');

      assert.equal(locale.pressKey.lastCall.args[0], 'a');

      locale.pressKey.restore();
    });

    it('executes bindings with a combo matching the pressed keys within the locale', () => {
      const pressHandler = sinon.stub();
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler,
        releaseHandler: null,
        preventRepeat: false
      });

      keyboard.pressKey('a');

      assert.ok(pressHandler.calledOnce);
    });

    it('executes bindings without a combo', () => {
      const pressHandler = sinon.stub();
      keyboard._listeners.push({
        keyCombo: null,
        pressHandler,
        releaseHandler: null,
        preventRepeat: false
      });

      keyboard.pressKey('a');
      keyboard.pressKey('b');

      assert.ok(pressHandler.calledTwice);
    });

    it('prevents combo overlap by marking off keys once they have been used by a combo', () => {
      const aPressHandler  = sinon.stub();
      const aBPressHandler = sinon.stub();
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

    it('allows any number of identical bindings to fire without inhibiting each other', () => {
      const a1PressHandler = sinon.stub();
      const a2PressHandler = sinon.stub();
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

    it('does nothing when paused', () => {
      sinon.stub(locale, 'pressKey');
      keyboard._paused = true;

      keyboard.pressKey('a');

      assert.equal(locale.pressKey.called, false);
      assert.equal(locale.pressedKeys.length, 0);

      locale.pressKey.restore();
    });
  });


  describe('#releaseKey', () => {

    let locale;
    beforeEach(() => {
      locale = new Locale('test');
      locale.bindKeyCode(0, 'a');
      keyboard._locale = locale;
    });

    it('calls releaseKey on the locale', () => {
      sinon.stub(locale, 'releaseKey');

      keyboard.releaseKey('a');

      assert.equal(locale.releaseKey.lastCall.args[0], 'a');

      locale.releaseKey.restore();
    });

    it('will not execute a binding\'s releaseHandler unless it was triggered first by a press', () => {
      const releaseHandler = sinon.stub();
      keyboard.pressKey('a');
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: null,
        releaseHandler,
        preventRepeat: false
      });

      keyboard.releaseKey('a');

      assert.equal(releaseHandler.calledOnce, false);
    });

    it('executes the releaseHandler of active bindings that no longer match the pressed keys', () => {
      const releaseHandler = sinon.stub();
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: null,
        releaseHandler,
        preventRepeat: false
      });
      keyboard.pressKey('a');

      keyboard.releaseKey('a');

      assert.ok(releaseHandler.calledOnce);
    });

    it('executes the releaseHandler without a combo', () => {
      const releaseHandler = sinon.stub();
      keyboard._listeners.push({
        keyCombo: null,
        pressHandler: null,
        releaseHandler,
        preventRepeat: false
      });
      keyboard.pressKey('a');
      keyboard.pressKey('b');

      keyboard.releaseKey('a');
      keyboard.releaseKey('b');

      assert.ok(releaseHandler.calledTwice);
    });
  });


  describe('#releaseAllKeys', () => {

    let locale;
    beforeEach(() => {
      locale = new Locale('test');
      locale.bindKeyCode(0, 'a');
      keyboard._locale = locale;
    });

    it('clears pressedKeys on the locale', () => {
      keyboard.releaseAllKeys();

      assert.equal(locale.pressedKeys.length, 0);
    });

    it('will not execute a binding\'s releaseHandler unless it was triggered first by a press', () => {
      const releaseHandler = sinon.stub();
      keyboard.pressKey('a');
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: null,
        releaseHandler,
        preventRepeat: false
      });

      keyboard.releaseAllKeys();

      assert.equal(releaseHandler.calledOnce, false);
    });

    it('executes the releaseHandler of active bindings that no longer match the pressed keys', () => {
      const releaseHandler = sinon.stub();
      keyboard._listeners.push({
        keyCombo: new KeyCombo('a'),
        pressHandler: null,
        releaseHandler,
        preventRepeat: false
      });
      keyboard.pressKey('a');

      keyboard.releaseAllKeys();

      assert.ok(releaseHandler.calledOnce);
    });
  });


  describe('#pause', () => {

    it('pauses the instance', () => {
      keyboard.pause();

      assert.ok(keyboard._paused);
    });
  });


  describe('#resume', () => {

    it('resumes the instance', () => {
      keyboard.resume();

      assert.equal(keyboard._paused, false);
    });
  });


  describe('#reset', () => {

    it('calls releaseAllKeys', () => {
      sinon.stub(keyboard, 'releaseAllKeys');

      keyboard.reset();

      assert.ok(keyboard.releaseAllKeys.calledOnce);

      keyboard.releaseAllKeys.reset();
    });

    it('clears all listeners', () => {
      sinon.stub(keyboard, 'releaseAllKeys');
      keyboard._listeners = [1];

      keyboard.reset();

      assert.equal(keyboard._listeners.length, 0);

      keyboard.releaseAllKeys.reset();
    });
  });
});
