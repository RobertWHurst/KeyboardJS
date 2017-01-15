
import Locale from './locale';
import KeyCombo from './key-combo';


class Keyboard {
  constructor(targetWindow, targetElement, platform, userAgent) {
    this._locale               = null;
    this._currentContext       = null;
    this._contexts             = {};
    this._listeners            = [];
    this._appliedListeners     = [];
    this._locales              = {};
    this._targetElement        = null;
    this._targetWindow         = null;
    this._targetPlatform       = '';
    this._targetUserAgent      = '';
    this._isModernBrowser      = false;
    this._targetKeyDownBinding = null;
    this._targetKeyUpBinding   = null;
    this._targetResetBinding   = null;
    this._paused               = false;

    this.setContext('global');
    this.watch(targetWindow, targetElement, platform, userAgent);
  }

  setLocale(localeName, localeBuilder) {
    let locale = null;
    if (typeof localeName === 'string') {

      if (localeBuilder) {
        locale = new Locale(localeName);
        localeBuilder(locale, this._targetPlatform, this._targetUserAgent);
      } else {
        locale = this._locales[localeName] || null;
      }
    } else {
      locale     = localeName;
      localeName = locale._localeName;
    }

    this._locale              = locale;
    this._locales[localeName] = locale;
    if (locale) {
      this._locale.pressedKeys = locale.pressedKeys;
    }
  }

  getLocale(localName) {
    localName || (localName = this._locale.localeName);
    return this._locales[localName] || null;
  }

  bind(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault) {
    if (keyComboStr === null || typeof keyComboStr === 'function') {
      preventRepeatByDefault = releaseHandler;
      releaseHandler         = pressHandler;
      pressHandler           = keyComboStr;
      keyComboStr            = null;
    }

    if (
      keyComboStr &&
      typeof keyComboStr === 'object' &&
      typeof keyComboStr.length === 'number'
    ) {
      for (let i = 0; i < keyComboStr.length; i += 1) {
        this.bind(keyComboStr[i], pressHandler, releaseHandler);
      }
      return;
    }

    this._listeners.push({
      keyCombo               : keyComboStr ? new KeyCombo(keyComboStr) : null,
      pressHandler           : pressHandler           || null,
      releaseHandler         : releaseHandler         || null,
      preventRepeat          : preventRepeatByDefault || false,
      preventRepeatByDefault : preventRepeatByDefault || false
    });
  }

  unbind(keyComboStr, pressHandler, releaseHandler) {
    if (keyComboStr === null || typeof keyComboStr === 'function') {
      releaseHandler = pressHandler;
      pressHandler   = keyComboStr;
      keyComboStr = null;
    }

    if (
      keyComboStr &&
      typeof keyComboStr === 'object' &&
      typeof keyComboStr.length === 'number'
    ) {
      for (var i = 0; i < keyComboStr.length; i += 1) {
        this.unbind(keyComboStr[i], pressHandler, releaseHandler);
      }
      return;
    }

    for (var i = 0; i < this._listeners.length; i += 1) {
      const listener = this._listeners[i];

      const comboMatches          = !keyComboStr && !listener.keyCombo ||
                                  listener.keyCombo && listener.keyCombo.isEqual(keyComboStr);
      const pressHandlerMatches   = !pressHandler && !releaseHandler ||
                                  !pressHandler && !listener.pressHandler ||
                                  pressHandler === listener.pressHandler;
      const releaseHandlerMatches = !pressHandler && !releaseHandler ||
                                  !releaseHandler && !listener.releaseHandler ||
                                  releaseHandler === listener.releaseHandler;

      if (comboMatches && pressHandlerMatches && releaseHandlerMatches) {
        this._listeners.splice(i, 1);
        i -= 1;
      }
    }
  }

  setContext(contextName) {
    if(this._locale) { this.releaseAllKeys(); }

    if (!this._contexts[contextName]) {
      this._contexts[contextName] = [];
    }
    this._listeners      = this._contexts[contextName];
    this._currentContext = contextName;
  }

  getContext() {
    return this._currentContext;
  }

  withContext(contextName, callback) {
    const previousContextName = this.getContext();
    this.setContext(contextName);

    callback();

    this.setContext(previousContextName);
  }

  watch(targetWindow, targetElement, targetPlatform, targetUserAgent) {
    this.stop();

    if (!targetWindow) {
      if (!global.addEventListener && !global.attachEvent) {
        throw new Error('Cannot find global functions addEventListener or attachEvent.');
      }
      targetWindow = global;
    }

    if (typeof targetWindow.nodeType === 'number') {
      targetUserAgent = targetPlatform;
      targetPlatform  = targetElement;
      targetElement   = targetWindow;
      targetWindow    = global;
    }

    if (!targetWindow.addEventListener && !targetWindow.attachEvent) {
      throw new Error('Cannot find addEventListener or attachEvent methods on targetWindow.');
    }

    this._isModernBrowser = !!targetWindow.addEventListener;

    const userAgent = targetWindow.navigator && targetWindow.navigator.userAgent || '';
    const platform  = targetWindow.navigator && targetWindow.navigator.platform  || '';

    targetElement   && targetElement   !== null || (targetElement   = targetWindow.document);
    targetPlatform  && targetPlatform  !== null || (targetPlatform  = platform);
    targetUserAgent && targetUserAgent !== null || (targetUserAgent = userAgent);

    this._targetKeyDownBinding = event => {
      this.pressKey(event.keyCode, event);
    };
    this._targetKeyUpBinding = event => {
      this.releaseKey(event.keyCode, event);
    };
    this._targetResetBinding = event => {
      this.releaseAllKeys(event)
    };

    this._bindEvent(targetElement, 'keydown', this._targetKeyDownBinding);
    this._bindEvent(targetElement, 'keyup',   this._targetKeyUpBinding);
    this._bindEvent(targetWindow,  'focus',   this._targetResetBinding);
    this._bindEvent(targetWindow,  'blur',    this._targetResetBinding);

    this._targetElement   = targetElement;
    this._targetWindow    = targetWindow;
    this._targetPlatform  = targetPlatform;
    this._targetUserAgent = targetUserAgent;
  }

  stop() {
    if (!this._targetElement || !this._targetWindow) { return; }

    this._unbindEvent(this._targetElement, 'keydown', this._targetKeyDownBinding);
    this._unbindEvent(this._targetElement, 'keyup',   this._targetKeyUpBinding);
    this._unbindEvent(this._targetWindow,  'focus',   this._targetResetBinding);
    this._unbindEvent(this._targetWindow,  'blur',    this._targetResetBinding);

    this._targetWindow  = null;
    this._targetElement = null;
  }

  pressKey(keyCode, event) {
    if (this._paused) { return; }
    if (!this._locale) { throw new Error('Locale not set'); }

    this._locale.pressKey(keyCode);
    this._applyBindings(event);
  }

  releaseKey(keyCode, event) {
    if (this._paused) { return; }
    if (!this._locale) { throw new Error('Locale not set'); }

    this._locale.releaseKey(keyCode);
    this._clearBindings(event);
  }

  releaseAllKeys(event) {
    if (this._paused) { return; }
    if (!this._locale) { throw new Error('Locale not set'); }

    this._locale.pressedKeys.length = 0;
    this._clearBindings(event);
  }

  pause() {
    if (this._paused) { return; }
    if (this._locale) { this.releaseAllKeys(); }
    this._paused = true;
  }

  resume() {
    this._paused = false;
  }

  reset() {
    this.releaseAllKeys();
    this._listeners.length = 0;
  }

  _bindEvent(targetElement, eventName, handler) {
    return this._isModernBrowser ?
      targetElement.addEventListener(eventName, handler, false) :
      targetElement.attachEvent(`on${eventName}`, handler);
  }

  _unbindEvent(targetElement, eventName, handler) {
    return this._isModernBrowser ?
      targetElement.removeEventListener(eventName, handler, false) :
      targetElement.detachEvent(`on${eventName}`, handler);
  }

  _getGroupedListeners() {
    const listenerGroups   = [];
    const listenerGroupMap = [];

    let listeners = this._listeners;
    if (this._currentContext !== 'global') {
      listeners = [].concat(listeners, this._contexts.global);
    }

    listeners
      .sort((a, b) => (b.keyCombo ? b.keyCombo.keyNames.length : 0) - (a.keyCombo ? a.keyCombo.keyNames.length : 0))
      .forEach(l => {
        let mapIndex = -1;
        for (let i = 0; i < listenerGroupMap.length; i += 1) {
          if (listenerGroupMap[i] === null && l.keyCombo === null ||
              listenerGroupMap[i] !== null && listenerGroupMap[i].isEqual(l.keyCombo)) {
            mapIndex = i;
          }
        }
        if (mapIndex === -1) {
          mapIndex = listenerGroupMap.length;
          listenerGroupMap.push(l.keyCombo);
        }
        if (!listenerGroups[mapIndex]) {
          listenerGroups[mapIndex] = [];
        }
        listenerGroups[mapIndex].push(l);
      });
    return listenerGroups;
  }

  _applyBindings(event) {
    let preventRepeat = false;

    event || (event = {});
    event.preventRepeat = () => { preventRepeat = true; };
    event.pressedKeys   = this._locale.pressedKeys.slice(0);

    const pressedKeys    = this._locale.pressedKeys.slice(0);
    const listenerGroups = this._getGroupedListeners();


    for (let i = 0; i < listenerGroups.length; i += 1) {
      const listeners = listenerGroups[i];
      const keyCombo  = listeners[0].keyCombo;

      if (keyCombo === null || keyCombo.check(pressedKeys)) {
        for (var j = 0; j < listeners.length; j += 1) {
          let listener = listeners[j];

          if (keyCombo === null) {
            listener = {
              keyCombo               : new KeyCombo(pressedKeys.join('+')),
              pressHandler           : listener.pressHandler,
              releaseHandler         : listener.releaseHandler,
              preventRepeat          : listener.preventRepeat,
              preventRepeatByDefault : listener.preventRepeatByDefault
            };
          }

          if (listener.pressHandler && !listener.preventRepeat) {
            listener.pressHandler.call(this, event);
            if (preventRepeat) {
              listener.preventRepeat = preventRepeat;
              preventRepeat          = false;
            }
          }

          if (listener.releaseHandler && !this._appliedListeners.includes(listener)) {
            this._appliedListeners.push(listener);
          }
        }

        if (keyCombo) {
          for (var j = 0; j < keyCombo.keyNames.length; j += 1) {
            const index = pressedKeys.indexOf(keyCombo.keyNames[j]);
            if (index !== -1) {
              pressedKeys.splice(index, 1);
              j -= 1;
            }
          }
        }
      }
    }
  }

  _clearBindings(event) {
    event || (event = {});

    for (let i = 0; i < this._appliedListeners.length; i += 1) {
      const listener = this._appliedListeners[i];
      const keyCombo = listener.keyCombo;
      if (keyCombo === null || !keyCombo.check(this._locale.pressedKeys)) {
        listener.preventRepeat = listener.preventRepeatByDefault;
        listener.releaseHandler.call(this, event);
        this._appliedListeners.splice(i, 1);
        i -= 1;
      }
    }
  }
}

Keyboard.prototype.addListener = Keyboard.prototype.bind;
Keyboard.prototype.on          = Keyboard.prototype.bind;

Keyboard.prototype.removeListener = Keyboard.prototype.unbind;
Keyboard.prototype.off            = Keyboard.prototype.unbind;

export default Keyboard;
