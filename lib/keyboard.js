import { Locale } from './locale';
import { KeyCombo } from './key-combo';


export class Keyboard {
  constructor(targetWindow, targetElement, targetPlatform, targetUserAgent) {
    this._locale               = null;
    this._currentContext       = '';
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

    this._contexts.global = {
      listeners: this._listeners,
      targetWindow,
      targetElement,
      targetPlatform,
      targetUserAgent
    };

    this.setContext('global');
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

    return this;
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
      return this;
    }

    this._listeners.push({
      keyCombo              : keyComboStr ? new KeyCombo(keyComboStr) : null,
      pressHandler          : pressHandler           || null,
      releaseHandler        : releaseHandler         || null,
      preventRepeat         : false,
      preventRepeatByDefault: preventRepeatByDefault || false,
      executingHandler      : false
    });

    return this;
  }

  addListener(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault) {
    return this.bind(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault);
  }

  on(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault) {
    return this.bind(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault);
  }

  bindPress(keyComboStr, pressHandler, preventRepeatByDefault) {
    return this.bind(keyComboStr, pressHandler, null, preventRepeatByDefault);
  }

  bindRelease(keyComboStr, releaseHandler) {
    return this.bind(keyComboStr, null, releaseHandler, preventRepeatByDefault);
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
      for (let i = 0; i < keyComboStr.length; i += 1) {
        this.unbind(keyComboStr[i], pressHandler, releaseHandler);
      }
      return this;
    }

    for (let i = 0; i < this._listeners.length; i += 1) {
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

    return this;
  }

  removeListener(keyComboStr, pressHandler, releaseHandler) {
    return this.unbind(keyComboStr, pressHandler, releaseHandler);
  }

  off(keyComboStr, pressHandler, releaseHandler) {
    return this.unbind(keyComboStr, pressHandler, releaseHandler);
  }

  setContext(contextName) {
    if(this._locale) { this.releaseAllKeys(); }

    if (!this._contexts[contextName]) {
      const globalContext = this._contexts.global;
      this._contexts[contextName] = {
        listeners      : [],
        targetWindow   : globalContext.targetWindow,
        targetElement  : globalContext.targetElement,
        targetPlatform : globalContext.targetPlatform,
        targetUserAgent: globalContext.targetUserAgent
      };
    }

    const context        = this._contexts[contextName];
    this._currentContext = contextName;
    this._listeners      = context.listeners;

    this.stop();
    this.watch(
      context.targetWindow,
      context.targetElement,
      context.targetPlatform,
      context.targetUserAgent
    );

    return this;
  }

  getContext() {
    return this._currentContext;
  }

  withContext(contextName, callback) {
    const previousContextName = this.getContext();
    this.setContext(contextName);

    callback();

    this.setContext(previousContextName);

    return this;
  }

  watch(targetWindow, targetElement, targetPlatform, targetUserAgent) {
    this.stop();

    const win = typeof globalThis !== 'undefined' ? globalThis :
                typeof global !== 'undefined' ? global :
                typeof window !== 'undefined' ? window :
                {};

    if (!targetWindow) {
      if (!win.addEventListener && !win.attachEvent) {
        // This was added so when using things like JSDOM watch can be used to configure watch
        // for the global namespace manually.
        if (this._currentContext === 'global') {
          return
        }
        throw new Error('Cannot find window functions addEventListener or attachEvent.');
      }
      targetWindow = win;
    }

    // Handle element bindings where a target window is not passed
    if (typeof targetWindow.nodeType === 'number') {
      targetUserAgent = targetPlatform;
      targetPlatform  = targetElement;
      targetElement   = targetWindow;
      targetWindow    = win;
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

    this._targetKeyDownBinding = (event) => {
      this.pressKey(event.keyCode, event);
      this._handleCommandBug(event, platform);
    };
    this._targetKeyUpBinding = (event) => {
      this.releaseKey(event.keyCode, event);
    };
    this._targetResetBinding = (event) => {
      this.releaseAllKeys(event);
    };

    this._bindEvent(targetElement, 'keydown', this._targetKeyDownBinding);
    this._bindEvent(targetElement, 'keyup',   this._targetKeyUpBinding);
    this._bindEvent(targetWindow,  'focus',   this._targetResetBinding);
    this._bindEvent(targetWindow,  'blur',    this._targetResetBinding);

    this._targetElement   = targetElement;
    this._targetWindow    = targetWindow;
    this._targetPlatform  = targetPlatform;
    this._targetUserAgent = targetUserAgent;

    const currentContext           = this._contexts[this._currentContext];
    currentContext.targetWindow    = this._targetWindow;
    currentContext.targetElement   = this._targetElement;
    currentContext.targetPlatform  = this._targetPlatform;
    currentContext.targetUserAgent = this._targetUserAgent;

    return this;
  }

  stop() {
    if (!this._targetElement || !this._targetWindow) { return; }

    this._unbindEvent(this._targetElement, 'keydown', this._targetKeyDownBinding);
    this._unbindEvent(this._targetElement, 'keyup',   this._targetKeyUpBinding);
    this._unbindEvent(this._targetWindow,  'focus',   this._targetResetBinding);
    this._unbindEvent(this._targetWindow,  'blur',    this._targetResetBinding);

    this._targetWindow  = null;
    this._targetElement = null;

    return this;
  }

  pressKey(keyCode, event) {
    if (this._paused) { return this; }
    if (!this._locale) { throw new Error('Locale not set'); }

    this._locale.pressKey(keyCode);
    this._applyBindings(event);

    return this;
  }

  releaseKey(keyCode, event) {
    if (this._paused) { return this; }
    if (!this._locale) { throw new Error('Locale not set'); }

    this._locale.releaseKey(keyCode);
    this._clearBindings(event);

    return this;
  }

  releaseAllKeys(event) {
    if (this._paused) { return this; }
    if (!this._locale) { throw new Error('Locale not set'); }

    this._locale.pressedKeys.length = 0;
    this._clearBindings(event);

    return this;
  }

  pause() {
    if (this._paused) { return this; }
    if (this._locale) { this.releaseAllKeys(); }
    this._paused = true;

    return this;
  }

  resume() {
    this._paused = false;

    return this;
  }

  reset() {
    this.releaseAllKeys();
    this._listeners.length = 0;

    return this;
  }

  _bindEvent(targetElement, eventName, handler) {
    return this._isModernBrowser ?
      targetElement.addEventListener(eventName, handler, false) :
      targetElement.attachEvent('on' + eventName, handler);
  }

  _unbindEvent(targetElement, eventName, handler) {
    return this._isModernBrowser ?
      targetElement.removeEventListener(eventName, handler, false) :
      targetElement.detachEvent('on' + eventName, handler);
  }

  _getGroupedListeners() {
    const listenerGroups   = [];
    const listenerGroupMap = [];

    let listeners = this._listeners;
    if (this._currentContext !== 'global') {
      listeners = [...listeners, ...this._contexts.global.listeners];
    }

    listeners.sort(
      (a, b) =>
        (b.keyCombo ? b.keyCombo.keyNames.length : 0) -
        (a.keyCombo ? a.keyCombo.keyNames.length : 0)
    ).forEach((l) => {
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

    const activeTargetKeys = this._locale.activeTargetKeys;
    const pressedKeys      = this._locale.pressedKeys.slice(0);
    const listenerGroups   = this._getGroupedListeners();

    for (let i = 0; i < listenerGroups.length; i += 1) {
      const listeners = listenerGroups[i];
      const keyCombo  = listeners[0].keyCombo;

      if (
        keyCombo === null ||
        keyCombo.check(pressedKeys) &&
        activeTargetKeys.some(k => keyCombo.keyNames.includes(k))
      ) {
        for (let j = 0; j < listeners.length; j += 1) {
          let listener = listeners[j];

          if (!listener.executingHandler && listener.pressHandler && !listener.preventRepeat) {
            listener.executingHandler = true;
            listener.pressHandler.call(this, event);
            listener.executingHandler = false;

            if (preventRepeat || listener.preventRepeatByDefault) {
              listener.preventRepeat = true;
              preventRepeat          = false;
            }
          }

          if (this._appliedListeners.indexOf(listener) === -1) {
            this._appliedListeners.push(listener);
          }
        }

        if (keyCombo) {
          for (let j = 0; j < keyCombo.keyNames.length; j += 1) {
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
    event.pressedKeys = this._locale.pressedKeys.slice(0);

    for (let i = 0; i < this._appliedListeners.length; i += 1) {
      const listener = this._appliedListeners[i];
      const keyCombo = listener.keyCombo;
      if (keyCombo === null || !keyCombo.check(this._locale.pressedKeys)) {
        listener.preventRepeat = false;
        if (keyCombo !== null || event.pressedKeys.length === 0) {
          this._appliedListeners.splice(i, 1);
          i -= 1;
        }
        if (!listener.executingHandler && listener.releaseHandler) {
          listener.executingHandler = true;
          listener.releaseHandler.call(this, event);
          listener.executingHandler = false;
        }
      }
    }
  }

  _handleCommandBug(event, platform) {
    // On Mac when the command key is kept pressed, keyup is not triggered for any other key.
    // In this case force a keyup for non-modifier keys directly after the keypress.
    const modifierKeys = ["shift", "ctrl", "alt", "capslock", "tab", "command"];
    if (platform.match("Mac") && this._locale.pressedKeys.includes("command") &&
        !modifierKeys.includes(this._locale.getKeyNames(event.keyCode)[0])) {
      this._targetKeyUpBinding(event);
    }
  }
}
