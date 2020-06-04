(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.keyboardJS = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var KeyCombo = /*#__PURE__*/function () {
    function KeyCombo(keyComboStr) {
      _classCallCheck(this, KeyCombo);

      this.sourceStr = keyComboStr;
      this.subCombos = KeyCombo.parseComboStr(keyComboStr);
      this.keyNames = this.subCombos.reduce(function (memo, nextSubCombo) {
        return memo.concat(nextSubCombo);
      }, []);
    }

    _createClass(KeyCombo, [{
      key: "check",
      value: function check(pressedKeyNames) {
        var startingKeyNameIndex = 0;

        for (var i = 0; i < this.subCombos.length; i += 1) {
          startingKeyNameIndex = this._checkSubCombo(this.subCombos[i], startingKeyNameIndex, pressedKeyNames);

          if (startingKeyNameIndex === -1) {
            return false;
          }
        }

        return true;
      }
    }, {
      key: "isEqual",
      value: function isEqual(otherKeyCombo) {
        if (!otherKeyCombo || typeof otherKeyCombo !== 'string' && _typeof(otherKeyCombo) !== 'object') {
          return false;
        }

        if (typeof otherKeyCombo === 'string') {
          otherKeyCombo = new KeyCombo(otherKeyCombo);
        }

        if (this.subCombos.length !== otherKeyCombo.subCombos.length) {
          return false;
        }

        for (var i = 0; i < this.subCombos.length; i += 1) {
          if (this.subCombos[i].length !== otherKeyCombo.subCombos[i].length) {
            return false;
          }
        }

        for (var _i = 0; _i < this.subCombos.length; _i += 1) {
          var subCombo = this.subCombos[_i];

          var otherSubCombo = otherKeyCombo.subCombos[_i].slice(0);

          for (var j = 0; j < subCombo.length; j += 1) {
            var keyName = subCombo[j];
            var index = otherSubCombo.indexOf(keyName);

            if (index > -1) {
              otherSubCombo.splice(index, 1);
            }
          }

          if (otherSubCombo.length !== 0) {
            return false;
          }
        }

        return true;
      }
    }, {
      key: "_checkSubCombo",
      value: function _checkSubCombo(subCombo, startingKeyNameIndex, pressedKeyNames) {
        subCombo = subCombo.slice(0);
        pressedKeyNames = pressedKeyNames.slice(startingKeyNameIndex);
        var endIndex = startingKeyNameIndex;

        for (var i = 0; i < subCombo.length; i += 1) {
          var keyName = subCombo[i];

          if (keyName[0] === '\\') {
            var escapedKeyName = keyName.slice(1);

            if (escapedKeyName === KeyCombo.comboDeliminator || escapedKeyName === KeyCombo.keyDeliminator) {
              keyName = escapedKeyName;
            }
          }

          var index = pressedKeyNames.indexOf(keyName);

          if (index > -1) {
            subCombo.splice(i, 1);
            i -= 1;

            if (index > endIndex) {
              endIndex = index;
            }

            if (subCombo.length === 0) {
              return endIndex;
            }
          }
        }

        return -1;
      }
    }]);

    return KeyCombo;
  }();
  KeyCombo.comboDeliminator = '>';
  KeyCombo.keyDeliminator = '+';

  KeyCombo.parseComboStr = function (keyComboStr) {
    var subComboStrs = KeyCombo._splitStr(keyComboStr, KeyCombo.comboDeliminator);

    var combo = [];

    for (var i = 0; i < subComboStrs.length; i += 1) {
      combo.push(KeyCombo._splitStr(subComboStrs[i], KeyCombo.keyDeliminator));
    }

    return combo;
  };

  KeyCombo._splitStr = function (str, deliminator) {
    var s = str;
    var d = deliminator;
    var c = '';
    var ca = [];

    for (var ci = 0; ci < s.length; ci += 1) {
      if (ci > 0 && s[ci] === d && s[ci - 1] !== '\\') {
        ca.push(c.trim());
        c = '';
        ci += 1;
      }

      c += s[ci];
    }

    if (c) {
      ca.push(c.trim());
    }

    return ca;
  };

  var Locale = /*#__PURE__*/function () {
    function Locale(name) {
      _classCallCheck(this, Locale);

      this.localeName = name;
      this.pressedKeys = [];
      this._appliedMacros = [];
      this._keyMap = {};
      this._killKeyCodes = [];
      this._macros = [];
    }

    _createClass(Locale, [{
      key: "bindKeyCode",
      value: function bindKeyCode(keyCode, keyNames) {
        if (typeof keyNames === 'string') {
          keyNames = [keyNames];
        }

        this._keyMap[keyCode] = keyNames;
      }
    }, {
      key: "bindMacro",
      value: function bindMacro(keyComboStr, keyNames) {
        if (typeof keyNames === 'string') {
          keyNames = [keyNames];
        }

        var handler = null;

        if (typeof keyNames === 'function') {
          handler = keyNames;
          keyNames = null;
        }

        var macro = {
          keyCombo: new KeyCombo(keyComboStr),
          keyNames: keyNames,
          handler: handler
        };

        this._macros.push(macro);
      }
    }, {
      key: "getKeyCodes",
      value: function getKeyCodes(keyName) {
        var keyCodes = [];

        for (var keyCode in this._keyMap) {
          var index = this._keyMap[keyCode].indexOf(keyName);

          if (index > -1) {
            keyCodes.push(keyCode | 0);
          }
        }

        return keyCodes;
      }
    }, {
      key: "getKeyNames",
      value: function getKeyNames(keyCode) {
        return this._keyMap[keyCode] || [];
      }
    }, {
      key: "setKillKey",
      value: function setKillKey(keyCode) {
        if (typeof keyCode === 'string') {
          var keyCodes = this.getKeyCodes(keyCode);

          for (var i = 0; i < keyCodes.length; i += 1) {
            this.setKillKey(keyCodes[i]);
          }

          return;
        }

        this._killKeyCodes.push(keyCode);
      }
    }, {
      key: "pressKey",
      value: function pressKey(keyCode) {
        if (typeof keyCode === 'string') {
          var keyCodes = this.getKeyCodes(keyCode);

          for (var i = 0; i < keyCodes.length; i += 1) {
            this.pressKey(keyCodes[i]);
          }

          return;
        }

        var keyNames = this.getKeyNames(keyCode);

        for (var _i = 0; _i < keyNames.length; _i += 1) {
          if (this.pressedKeys.indexOf(keyNames[_i]) === -1) {
            this.pressedKeys.push(keyNames[_i]);
          }
        }

        this._applyMacros();
      }
    }, {
      key: "releaseKey",
      value: function releaseKey(keyCode) {
        if (typeof keyCode === 'string') {
          var keyCodes = this.getKeyCodes(keyCode);

          for (var i = 0; i < keyCodes.length; i += 1) {
            this.releaseKey(keyCodes[i]);
          }
        } else {
          var keyNames = this.getKeyNames(keyCode);

          var killKeyCodeIndex = this._killKeyCodes.indexOf(keyCode);

          if (killKeyCodeIndex > -1) {
            this.pressedKeys.length = 0;
          } else {
            for (var _i2 = 0; _i2 < keyNames.length; _i2 += 1) {
              var index = this.pressedKeys.indexOf(keyNames[_i2]);

              if (index > -1) {
                this.pressedKeys.splice(index, 1);
              }
            }
          }

          this._clearMacros();
        }
      }
    }, {
      key: "_applyMacros",
      value: function _applyMacros() {
        var macros = this._macros.slice(0);

        for (var i = 0; i < macros.length; i += 1) {
          var macro = macros[i];

          if (macro.keyCombo.check(this.pressedKeys)) {
            if (macro.handler) {
              macro.keyNames = macro.handler(this.pressedKeys);
            }

            for (var j = 0; j < macro.keyNames.length; j += 1) {
              if (this.pressedKeys.indexOf(macro.keyNames[j]) === -1) {
                this.pressedKeys.push(macro.keyNames[j]);
              }
            }

            this._appliedMacros.push(macro);
          }
        }
      }
    }, {
      key: "_clearMacros",
      value: function _clearMacros() {
        for (var i = 0; i < this._appliedMacros.length; i += 1) {
          var macro = this._appliedMacros[i];

          if (!macro.keyCombo.check(this.pressedKeys)) {
            for (var j = 0; j < macro.keyNames.length; j += 1) {
              var index = this.pressedKeys.indexOf(macro.keyNames[j]);

              if (index > -1) {
                this.pressedKeys.splice(index, 1);
              }
            }

            if (macro.handler) {
              macro.keyNames = null;
            }

            this._appliedMacros.splice(i, 1);

            i -= 1;
          }
        }
      }
    }]);

    return Locale;
  }();

  var Keyboard = /*#__PURE__*/function () {
    function Keyboard(targetWindow, targetElement, platform, userAgent) {
      _classCallCheck(this, Keyboard);

      this._locale = null;
      this._currentContext = null;
      this._contexts = {};
      this._listeners = [];
      this._appliedListeners = [];
      this._locales = {};
      this._targetElement = null;
      this._targetWindow = null;
      this._targetPlatform = '';
      this._targetUserAgent = '';
      this._isModernBrowser = false;
      this._targetKeyDownBinding = null;
      this._targetKeyUpBinding = null;
      this._targetResetBinding = null;
      this._paused = false;
      this._callerHandler = null;
      this.setContext('global');
      this.watch(targetWindow, targetElement, platform, userAgent);
    }

    _createClass(Keyboard, [{
      key: "setLocale",
      value: function setLocale(localeName, localeBuilder) {
        var locale = null;

        if (typeof localeName === 'string') {
          if (localeBuilder) {
            locale = new Locale(localeName);
            localeBuilder(locale, this._targetPlatform, this._targetUserAgent);
          } else {
            locale = this._locales[localeName] || null;
          }
        } else {
          locale = localeName;
          localeName = locale._localeName;
        }

        this._locale = locale;
        this._locales[localeName] = locale;

        if (locale) {
          this._locale.pressedKeys = locale.pressedKeys;
        }

        return this;
      }
    }, {
      key: "getLocale",
      value: function getLocale(localName) {
        localName || (localName = this._locale.localeName);
        return this._locales[localName] || null;
      }
    }, {
      key: "bind",
      value: function bind(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault) {
        if (keyComboStr === null || typeof keyComboStr === 'function') {
          preventRepeatByDefault = releaseHandler;
          releaseHandler = pressHandler;
          pressHandler = keyComboStr;
          keyComboStr = null;
        }

        if (keyComboStr && _typeof(keyComboStr) === 'object' && typeof keyComboStr.length === 'number') {
          for (var i = 0; i < keyComboStr.length; i += 1) {
            this.bind(keyComboStr[i], pressHandler, releaseHandler);
          }

          return this;
        }

        this._listeners.push({
          keyCombo: keyComboStr ? new KeyCombo(keyComboStr) : null,
          pressHandler: pressHandler || null,
          releaseHandler: releaseHandler || null,
          preventRepeat: preventRepeatByDefault || false,
          preventRepeatByDefault: preventRepeatByDefault || false
        });

        return this;
      }
    }, {
      key: "addListener",
      value: function addListener(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault) {
        return this.bind(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault);
      }
    }, {
      key: "on",
      value: function on(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault) {
        return this.bind(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault);
      }
    }, {
      key: "bindPress",
      value: function bindPress(keyComboStr, pressHandler, preventRepeatByDefault) {
        return this.bind(keyComboStr, pressHandler, null, preventRepeatByDefault);
      }
    }, {
      key: "bindRelease",
      value: function bindRelease(keyComboStr, releaseHandler) {
        return this.bind(keyComboStr, null, releaseHandler, preventRepeatByDefault);
      }
    }, {
      key: "unbind",
      value: function unbind(keyComboStr, pressHandler, releaseHandler) {
        if (keyComboStr === null || typeof keyComboStr === 'function') {
          releaseHandler = pressHandler;
          pressHandler = keyComboStr;
          keyComboStr = null;
        }

        if (keyComboStr && _typeof(keyComboStr) === 'object' && typeof keyComboStr.length === 'number') {
          for (var i = 0; i < keyComboStr.length; i += 1) {
            this.unbind(keyComboStr[i], pressHandler, releaseHandler);
          }

          return this;
        }

        for (var _i = 0; _i < this._listeners.length; _i += 1) {
          var listener = this._listeners[_i];
          var comboMatches = !keyComboStr && !listener.keyCombo || listener.keyCombo && listener.keyCombo.isEqual(keyComboStr);
          var pressHandlerMatches = !pressHandler && !releaseHandler || !pressHandler && !listener.pressHandler || pressHandler === listener.pressHandler;
          var releaseHandlerMatches = !pressHandler && !releaseHandler || !releaseHandler && !listener.releaseHandler || releaseHandler === listener.releaseHandler;

          if (comboMatches && pressHandlerMatches && releaseHandlerMatches) {
            this._listeners.splice(_i, 1);

            _i -= 1;
          }
        }

        return this;
      }
    }, {
      key: "removeListener",
      value: function removeListener(keyComboStr, pressHandler, releaseHandler) {
        return this.unbind(keyComboStr, pressHandler, releaseHandler);
      }
    }, {
      key: "off",
      value: function off(keyComboStr, pressHandler, releaseHandler) {
        return this.unbind(keyComboStr, pressHandler, releaseHandler);
      }
    }, {
      key: "setContext",
      value: function setContext(contextName) {
        if (this._locale) {
          this.releaseAllKeys();
        }

        if (!this._contexts[contextName]) {
          this._contexts[contextName] = [];
        }

        this._listeners = this._contexts[contextName];
        this._currentContext = contextName;
        return this;
      }
    }, {
      key: "getContext",
      value: function getContext() {
        return this._currentContext;
      }
    }, {
      key: "withContext",
      value: function withContext(contextName, callback) {
        var previousContextName = this.getContext();
        this.setContext(contextName);
        callback();
        this.setContext(previousContextName);
        return this;
      }
    }, {
      key: "watch",
      value: function watch(targetWindow, targetElement, targetPlatform, targetUserAgent) {
        var _this = this;

        this.stop();
        var win = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : {};

        if (!targetWindow) {
          if (!win.addEventListener && !win.attachEvent) {
            throw new Error('Cannot find window functions addEventListener or attachEvent.');
          }

          targetWindow = win;
        } // Handle element bindings where a target window is not passed


        if (typeof targetWindow.nodeType === 'number') {
          targetUserAgent = targetPlatform;
          targetPlatform = targetElement;
          targetElement = targetWindow;
          targetWindow = win;
        }

        if (!targetWindow.addEventListener && !targetWindow.attachEvent) {
          throw new Error('Cannot find addEventListener or attachEvent methods on targetWindow.');
        }

        this._isModernBrowser = !!targetWindow.addEventListener;
        var userAgent = targetWindow.navigator && targetWindow.navigator.userAgent || '';
        var platform = targetWindow.navigator && targetWindow.navigator.platform || '';
        targetElement && targetElement !== null || (targetElement = targetWindow.document);
        targetPlatform && targetPlatform !== null || (targetPlatform = platform);
        targetUserAgent && targetUserAgent !== null || (targetUserAgent = userAgent);

        this._targetKeyDownBinding = function (event) {
          _this.pressKey(event.keyCode, event);

          _this._handleCommandBug(event, platform);
        };

        this._targetKeyUpBinding = function (event) {
          _this.releaseKey(event.keyCode, event);
        };

        this._targetResetBinding = function (event) {
          _this.releaseAllKeys(event);
        };

        this._bindEvent(targetElement, 'keydown', this._targetKeyDownBinding);

        this._bindEvent(targetElement, 'keyup', this._targetKeyUpBinding);

        this._bindEvent(targetWindow, 'focus', this._targetResetBinding);

        this._bindEvent(targetWindow, 'blur', this._targetResetBinding);

        this._targetElement = targetElement;
        this._targetWindow = targetWindow;
        this._targetPlatform = targetPlatform;
        this._targetUserAgent = targetUserAgent;
        return this;
      }
    }, {
      key: "stop",
      value: function stop() {
        if (!this._targetElement || !this._targetWindow) {
          return;
        }

        this._unbindEvent(this._targetElement, 'keydown', this._targetKeyDownBinding);

        this._unbindEvent(this._targetElement, 'keyup', this._targetKeyUpBinding);

        this._unbindEvent(this._targetWindow, 'focus', this._targetResetBinding);

        this._unbindEvent(this._targetWindow, 'blur', this._targetResetBinding);

        this._targetWindow = null;
        this._targetElement = null;
        return this;
      }
    }, {
      key: "pressKey",
      value: function pressKey(keyCode, event) {
        if (this._paused) {
          return;
        }

        if (!this._locale) {
          throw new Error('Locale not set');
        }

        this._locale.pressKey(keyCode);

        this._applyBindings(event);

        return this;
      }
    }, {
      key: "releaseKey",
      value: function releaseKey(keyCode, event) {
        if (this._paused) {
          return this;
        }

        if (!this._locale) {
          throw new Error('Locale not set');
        }

        this._locale.releaseKey(keyCode);

        this._clearBindings(event);

        return this;
      }
    }, {
      key: "releaseAllKeys",
      value: function releaseAllKeys(event) {
        if (this._paused) {
          return this;
        }

        if (!this._locale) {
          throw new Error('Locale not set');
        }

        this._locale.pressedKeys.length = 0;

        this._clearBindings(event);

        return this;
      }
    }, {
      key: "pause",
      value: function pause() {
        if (this._paused) {
          return this;
        }

        if (this._locale) {
          this.releaseAllKeys();
        }

        this._paused = true;
        return this;
      }
    }, {
      key: "resume",
      value: function resume() {
        this._paused = false;
        return this;
      }
    }, {
      key: "reset",
      value: function reset() {
        this.releaseAllKeys();
        this._listeners.length = 0;
        return this;
      }
    }, {
      key: "_bindEvent",
      value: function _bindEvent(targetElement, eventName, handler) {
        return this._isModernBrowser ? targetElement.addEventListener(eventName, handler, false) : targetElement.attachEvent('on' + eventName, handler);
      }
    }, {
      key: "_unbindEvent",
      value: function _unbindEvent(targetElement, eventName, handler) {
        return this._isModernBrowser ? targetElement.removeEventListener(eventName, handler, false) : targetElement.detachEvent('on' + eventName, handler);
      }
    }, {
      key: "_getGroupedListeners",
      value: function _getGroupedListeners() {
        var listenerGroups = [];
        var listenerGroupMap = [];
        var listeners = this._listeners;

        if (this._currentContext !== 'global') {
          listeners = [].concat(_toConsumableArray(listeners), _toConsumableArray(this._contexts.global));
        }

        listeners.sort(function (a, b) {
          return (b.keyCombo ? b.keyCombo.keyNames.length : 0) - (a.keyCombo ? a.keyCombo.keyNames.length : 0);
        }).forEach(function (l) {
          var mapIndex = -1;

          for (var i = 0; i < listenerGroupMap.length; i += 1) {
            if (listenerGroupMap[i] === null && l.keyCombo === null || listenerGroupMap[i] !== null && listenerGroupMap[i].isEqual(l.keyCombo)) {
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
    }, {
      key: "_applyBindings",
      value: function _applyBindings(event) {
        var preventRepeat = false;
        event || (event = {});

        event.preventRepeat = function () {
          preventRepeat = true;
        };

        event.pressedKeys = this._locale.pressedKeys.slice(0);

        var pressedKeys = this._locale.pressedKeys.slice(0);

        var listenerGroups = this._getGroupedListeners();

        for (var i = 0; i < listenerGroups.length; i += 1) {
          var listeners = listenerGroups[i];
          var keyCombo = listeners[0].keyCombo;

          if (keyCombo === null || keyCombo.check(pressedKeys)) {
            for (var j = 0; j < listeners.length; j += 1) {
              var listener = listeners[j];

              if (listener.pressHandler && !listener.preventRepeat) {
                listener.pressHandler.call(this, event);

                if (preventRepeat) {
                  listener.preventRepeat = preventRepeat;
                  preventRepeat = false;
                }
              }

              if (listener.releaseHandler && this._appliedListeners.indexOf(listener) === -1) {
                this._appliedListeners.push(listener);
              }
            }

            if (keyCombo) {
              for (var _j = 0; _j < keyCombo.keyNames.length; _j += 1) {
                var index = pressedKeys.indexOf(keyCombo.keyNames[_j]);

                if (index !== -1) {
                  pressedKeys.splice(index, 1);
                  _j -= 1;
                }
              }
            }
          }
        }
      }
    }, {
      key: "_clearBindings",
      value: function _clearBindings(event) {
        event || (event = {});
        event.pressedKeys = this._locale.pressedKeys.slice(0);

        for (var i = 0; i < this._appliedListeners.length; i += 1) {
          var listener = this._appliedListeners[i];
          var keyCombo = listener.keyCombo;

          if (keyCombo === null || !keyCombo.check(this._locale.pressedKeys)) {
            if (this._callerHandler !== listener.releaseHandler) {
              var oldCaller = this._callerHandler;
              this._callerHandler = listener.releaseHandler;
              listener.preventRepeat = listener.preventRepeatByDefault;
              listener.releaseHandler.call(this, event);
              this._callerHandler = oldCaller;
            }

            if (keyCombo !== null || event.pressedKeys.length === 0) {
              this._appliedListeners.splice(i, 1);

              i -= 1;
            }
          }
        }
      }
    }, {
      key: "_handleCommandBug",
      value: function _handleCommandBug(event, platform) {
        // On Mac when the command key is kept pressed, keyup is not triggered for any other key.
        // In this case force a keyup for non-modifier keys directly after the keypress.
        var modifierKeys = ["shift", "ctrl", "alt", "capslock", "tab", "command"];

        if (platform.match("Mac") && this._locale.pressedKeys.includes("command") && !modifierKeys.includes(this._locale.getKeyNames(event.keyCode)[0])) {
          this._targetKeyUpBinding(event);
        }
      }
    }]);

    return Keyboard;
  }();

  function us(locale, platform, userAgent) {
    // general
    locale.bindKeyCode(3, ['cancel']);
    locale.bindKeyCode(8, ['backspace']);
    locale.bindKeyCode(9, ['tab']);
    locale.bindKeyCode(12, ['clear']);
    locale.bindKeyCode(13, ['enter']);
    locale.bindKeyCode(16, ['shift']);
    locale.bindKeyCode(17, ['ctrl']);
    locale.bindKeyCode(18, ['alt', 'menu']);
    locale.bindKeyCode(19, ['pause', 'break']);
    locale.bindKeyCode(20, ['capslock']);
    locale.bindKeyCode(27, ['escape', 'esc']);
    locale.bindKeyCode(32, ['space', 'spacebar']);
    locale.bindKeyCode(33, ['pageup']);
    locale.bindKeyCode(34, ['pagedown']);
    locale.bindKeyCode(35, ['end']);
    locale.bindKeyCode(36, ['home']);
    locale.bindKeyCode(37, ['left']);
    locale.bindKeyCode(38, ['up']);
    locale.bindKeyCode(39, ['right']);
    locale.bindKeyCode(40, ['down']);
    locale.bindKeyCode(41, ['select']);
    locale.bindKeyCode(42, ['printscreen']);
    locale.bindKeyCode(43, ['execute']);
    locale.bindKeyCode(44, ['snapshot']);
    locale.bindKeyCode(45, ['insert', 'ins']);
    locale.bindKeyCode(46, ['delete', 'del']);
    locale.bindKeyCode(47, ['help']);
    locale.bindKeyCode(145, ['scrolllock', 'scroll']);
    locale.bindKeyCode(188, ['comma', ',']);
    locale.bindKeyCode(190, ['period', '.']);
    locale.bindKeyCode(191, ['slash', 'forwardslash', '/']);
    locale.bindKeyCode(192, ['graveaccent', '`']);
    locale.bindKeyCode(219, ['openbracket', '[']);
    locale.bindKeyCode(220, ['backslash', '\\']);
    locale.bindKeyCode(221, ['closebracket', ']']);
    locale.bindKeyCode(222, ['apostrophe', '\'']); // 0-9

    locale.bindKeyCode(48, ['zero', '0']);
    locale.bindKeyCode(49, ['one', '1']);
    locale.bindKeyCode(50, ['two', '2']);
    locale.bindKeyCode(51, ['three', '3']);
    locale.bindKeyCode(52, ['four', '4']);
    locale.bindKeyCode(53, ['five', '5']);
    locale.bindKeyCode(54, ['six', '6']);
    locale.bindKeyCode(55, ['seven', '7']);
    locale.bindKeyCode(56, ['eight', '8']);
    locale.bindKeyCode(57, ['nine', '9']); // numpad

    locale.bindKeyCode(96, ['numzero', 'num0']);
    locale.bindKeyCode(97, ['numone', 'num1']);
    locale.bindKeyCode(98, ['numtwo', 'num2']);
    locale.bindKeyCode(99, ['numthree', 'num3']);
    locale.bindKeyCode(100, ['numfour', 'num4']);
    locale.bindKeyCode(101, ['numfive', 'num5']);
    locale.bindKeyCode(102, ['numsix', 'num6']);
    locale.bindKeyCode(103, ['numseven', 'num7']);
    locale.bindKeyCode(104, ['numeight', 'num8']);
    locale.bindKeyCode(105, ['numnine', 'num9']);
    locale.bindKeyCode(106, ['nummultiply', 'num*']);
    locale.bindKeyCode(107, ['numadd', 'num+']);
    locale.bindKeyCode(108, ['numenter']);
    locale.bindKeyCode(109, ['numsubtract', 'num-']);
    locale.bindKeyCode(110, ['numdecimal', 'num.']);
    locale.bindKeyCode(111, ['numdivide', 'num/']);
    locale.bindKeyCode(144, ['numlock', 'num']); // function keys

    locale.bindKeyCode(112, ['f1']);
    locale.bindKeyCode(113, ['f2']);
    locale.bindKeyCode(114, ['f3']);
    locale.bindKeyCode(115, ['f4']);
    locale.bindKeyCode(116, ['f5']);
    locale.bindKeyCode(117, ['f6']);
    locale.bindKeyCode(118, ['f7']);
    locale.bindKeyCode(119, ['f8']);
    locale.bindKeyCode(120, ['f9']);
    locale.bindKeyCode(121, ['f10']);
    locale.bindKeyCode(122, ['f11']);
    locale.bindKeyCode(123, ['f12']);
    locale.bindKeyCode(124, ['f13']);
    locale.bindKeyCode(125, ['f14']);
    locale.bindKeyCode(126, ['f15']);
    locale.bindKeyCode(127, ['f16']);
    locale.bindKeyCode(128, ['f17']);
    locale.bindKeyCode(129, ['f18']);
    locale.bindKeyCode(130, ['f19']);
    locale.bindKeyCode(131, ['f20']);
    locale.bindKeyCode(132, ['f21']);
    locale.bindKeyCode(133, ['f22']);
    locale.bindKeyCode(134, ['f23']);
    locale.bindKeyCode(135, ['f24']); // secondary key symbols

    locale.bindMacro('shift + `', ['tilde', '~']);
    locale.bindMacro('shift + 1', ['exclamation', 'exclamationpoint', '!']);
    locale.bindMacro('shift + 2', ['at', '@']);
    locale.bindMacro('shift + 3', ['number', '#']);
    locale.bindMacro('shift + 4', ['dollar', 'dollars', 'dollarsign', '$']);
    locale.bindMacro('shift + 5', ['percent', '%']);
    locale.bindMacro('shift + 6', ['caret', '^']);
    locale.bindMacro('shift + 7', ['ampersand', 'and', '&']);
    locale.bindMacro('shift + 8', ['asterisk', '*']);
    locale.bindMacro('shift + 9', ['openparen', '(']);
    locale.bindMacro('shift + 0', ['closeparen', ')']);
    locale.bindMacro('shift + -', ['underscore', '_']);
    locale.bindMacro('shift + =', ['plus', '+']);
    locale.bindMacro('shift + [', ['opencurlybrace', 'opencurlybracket', '{']);
    locale.bindMacro('shift + ]', ['closecurlybrace', 'closecurlybracket', '}']);
    locale.bindMacro('shift + \\', ['verticalbar', '|']);
    locale.bindMacro('shift + ;', ['colon', ':']);
    locale.bindMacro('shift + \'', ['quotationmark', '\'']);
    locale.bindMacro('shift + !,', ['openanglebracket', '<']);
    locale.bindMacro('shift + .', ['closeanglebracket', '>']);
    locale.bindMacro('shift + /', ['questionmark', '?']);

    if (platform.match('Mac')) {
      locale.bindMacro('command', ['mod', 'modifier']);
    } else {
      locale.bindMacro('ctrl', ['mod', 'modifier']);
    } //a-z and A-Z


    for (var keyCode = 65; keyCode <= 90; keyCode += 1) {
      var keyName = String.fromCharCode(keyCode + 32);
      var capitalKeyName = String.fromCharCode(keyCode);
      locale.bindKeyCode(keyCode, keyName);
      locale.bindMacro('shift + ' + keyName, capitalKeyName);
      locale.bindMacro('capslock + ' + keyName, capitalKeyName);
    } // browser caveats


    var semicolonKeyCode = userAgent.match('Firefox') ? 59 : 186;
    var dashKeyCode = userAgent.match('Firefox') ? 173 : 189;
    var equalKeyCode = userAgent.match('Firefox') ? 61 : 187;
    var leftCommandKeyCode;
    var rightCommandKeyCode;

    if (platform.match('Mac') && (userAgent.match('Safari') || userAgent.match('Chrome'))) {
      leftCommandKeyCode = 91;
      rightCommandKeyCode = 93;
    } else if (platform.match('Mac') && userAgent.match('Opera')) {
      leftCommandKeyCode = 17;
      rightCommandKeyCode = 17;
    } else if (platform.match('Mac') && userAgent.match('Firefox')) {
      leftCommandKeyCode = 224;
      rightCommandKeyCode = 224;
    }

    locale.bindKeyCode(semicolonKeyCode, ['semicolon', ';']);
    locale.bindKeyCode(dashKeyCode, ['dash', '-']);
    locale.bindKeyCode(equalKeyCode, ['equal', 'equalsign', '=']);
    locale.bindKeyCode(leftCommandKeyCode, ['command', 'windows', 'win', 'super', 'leftcommand', 'leftwindows', 'leftwin', 'leftsuper']);
    locale.bindKeyCode(rightCommandKeyCode, ['command', 'windows', 'win', 'super', 'rightcommand', 'rightwindows', 'rightwin', 'rightsuper']); // kill keys

    locale.setKillKey('command');
  }

  var keyboard = new Keyboard();
  keyboard.setLocale('us', us);
  keyboard.Keyboard = Keyboard;
  keyboard.Locale = Locale;
  keyboard.KeyCombo = KeyCombo;

  return keyboard;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9rZXktY29tYm8uanMiLCIuLi9saWIvbG9jYWxlLmpzIiwiLi4vbGliL2tleWJvYXJkLmpzIiwiLi4vbG9jYWxlcy91cy5qcyIsIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuZXhwb3J0IGNsYXNzIEtleUNvbWJvIHtcbiAgY29uc3RydWN0b3Ioa2V5Q29tYm9TdHIpIHtcbiAgICB0aGlzLnNvdXJjZVN0ciA9IGtleUNvbWJvU3RyO1xuICAgIHRoaXMuc3ViQ29tYm9zID0gS2V5Q29tYm8ucGFyc2VDb21ib1N0cihrZXlDb21ib1N0cik7XG4gICAgdGhpcy5rZXlOYW1lcyAgPSB0aGlzLnN1YkNvbWJvcy5yZWR1Y2UoKG1lbW8sIG5leHRTdWJDb21ibykgPT5cbiAgICAgIG1lbW8uY29uY2F0KG5leHRTdWJDb21ibyksIFtdKTtcbiAgfVxuXG4gIGNoZWNrKHByZXNzZWRLZXlOYW1lcykge1xuICAgIGxldCBzdGFydGluZ0tleU5hbWVJbmRleCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSB0aGlzLl9jaGVja1N1YkNvbWJvKFxuICAgICAgICB0aGlzLnN1YkNvbWJvc1tpXSxcbiAgICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXgsXG4gICAgICAgIHByZXNzZWRLZXlOYW1lc1xuICAgICAgKTtcbiAgICAgIGlmIChzdGFydGluZ0tleU5hbWVJbmRleCA9PT0gLTEpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIGlzRXF1YWwob3RoZXJLZXlDb21ibykge1xuICAgIGlmIChcbiAgICAgICFvdGhlcktleUNvbWJvIHx8XG4gICAgICB0eXBlb2Ygb3RoZXJLZXlDb21ibyAhPT0gJ3N0cmluZycgJiZcbiAgICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnb2JqZWN0J1xuICAgICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIGlmICh0eXBlb2Ygb3RoZXJLZXlDb21ibyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG90aGVyS2V5Q29tYm8gPSBuZXcgS2V5Q29tYm8ob3RoZXJLZXlDb21ibyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3ViQ29tYm9zLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3MubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmICh0aGlzLnN1YkNvbWJvc1tpXS5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3Qgc3ViQ29tYm8gICAgICA9IHRoaXMuc3ViQ29tYm9zW2ldO1xuICAgICAgY29uc3Qgb3RoZXJTdWJDb21ibyA9IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLnNsaWNlKDApO1xuXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHN1YkNvbWJvLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGNvbnN0IGtleU5hbWUgPSBzdWJDb21ib1tqXTtcbiAgICAgICAgY29uc3QgaW5kZXggICA9IG90aGVyU3ViQ29tYm8uaW5kZXhPZihrZXlOYW1lKTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIG90aGVyU3ViQ29tYm8uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG90aGVyU3ViQ29tYm8ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBfY2hlY2tTdWJDb21ibyhzdWJDb21ibywgc3RhcnRpbmdLZXlOYW1lSW5kZXgsIHByZXNzZWRLZXlOYW1lcykge1xuICAgIHN1YkNvbWJvID0gc3ViQ29tYm8uc2xpY2UoMCk7XG4gICAgcHJlc3NlZEtleU5hbWVzID0gcHJlc3NlZEtleU5hbWVzLnNsaWNlKHN0YXJ0aW5nS2V5TmFtZUluZGV4KTtcblxuICAgIGxldCBlbmRJbmRleCA9IHN0YXJ0aW5nS2V5TmFtZUluZGV4O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3ViQ29tYm8ubGVuZ3RoOyBpICs9IDEpIHtcblxuICAgICAgbGV0IGtleU5hbWUgPSBzdWJDb21ib1tpXTtcbiAgICAgIGlmIChrZXlOYW1lWzBdID09PSAnXFxcXCcpIHtcbiAgICAgICAgY29uc3QgZXNjYXBlZEtleU5hbWUgPSBrZXlOYW1lLnNsaWNlKDEpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgfHxcbiAgICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3JcbiAgICAgICAgKSB7XG4gICAgICAgICAga2V5TmFtZSA9IGVzY2FwZWRLZXlOYW1lO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gcHJlc3NlZEtleU5hbWVzLmluZGV4T2Yoa2V5TmFtZSk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBzdWJDb21iby5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGkgLT0gMTtcbiAgICAgICAgaWYgKGluZGV4ID4gZW5kSW5kZXgpIHtcbiAgICAgICAgICBlbmRJbmRleCA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdWJDb21iby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gZW5kSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xufVxuXG5LZXlDb21iby5jb21ib0RlbGltaW5hdG9yID0gJz4nO1xuS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IgICA9ICcrJztcblxuS2V5Q29tYm8ucGFyc2VDb21ib1N0ciA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyKSB7XG4gIGNvbnN0IHN1YkNvbWJvU3RycyA9IEtleUNvbWJvLl9zcGxpdFN0cihrZXlDb21ib1N0ciwgS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvcik7XG4gIGNvbnN0IGNvbWJvICAgICAgICA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwIDsgaSA8IHN1YkNvbWJvU3Rycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGNvbWJvLnB1c2goS2V5Q29tYm8uX3NwbGl0U3RyKHN1YkNvbWJvU3Ryc1tpXSwgS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IpKTtcbiAgfVxuICByZXR1cm4gY29tYm87XG59XG5cbktleUNvbWJvLl9zcGxpdFN0ciA9IGZ1bmN0aW9uKHN0ciwgZGVsaW1pbmF0b3IpIHtcbiAgY29uc3QgcyAgPSBzdHI7XG4gIGNvbnN0IGQgID0gZGVsaW1pbmF0b3I7XG4gIGxldCBjICA9ICcnO1xuICBjb25zdCBjYSA9IFtdO1xuXG4gIGZvciAobGV0IGNpID0gMDsgY2kgPCBzLmxlbmd0aDsgY2kgKz0gMSkge1xuICAgIGlmIChjaSA+IDAgJiYgc1tjaV0gPT09IGQgJiYgc1tjaSAtIDFdICE9PSAnXFxcXCcpIHtcbiAgICAgIGNhLnB1c2goYy50cmltKCkpO1xuICAgICAgYyA9ICcnO1xuICAgICAgY2kgKz0gMTtcbiAgICB9XG4gICAgYyArPSBzW2NpXTtcbiAgfVxuICBpZiAoYykgeyBjYS5wdXNoKGMudHJpbSgpKTsgfVxuXG4gIHJldHVybiBjYTtcbn07XG4iLCJpbXBvcnQgeyBLZXlDb21ibyB9IGZyb20gJy4va2V5LWNvbWJvJztcblxuXG5leHBvcnQgY2xhc3MgTG9jYWxlIHtcbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHRoaXMubG9jYWxlTmFtZSAgICAgPSBuYW1lO1xuICAgIHRoaXMucHJlc3NlZEtleXMgICAgPSBbXTtcbiAgICB0aGlzLl9hcHBsaWVkTWFjcm9zID0gW107XG4gICAgdGhpcy5fa2V5TWFwICAgICAgICA9IHt9O1xuICAgIHRoaXMuX2tpbGxLZXlDb2RlcyAgPSBbXTtcbiAgICB0aGlzLl9tYWNyb3MgICAgICAgID0gW107XG4gIH1cblxuICBiaW5kS2V5Q29kZShrZXlDb2RlLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFtrZXlOYW1lc107XG4gICAgfVxuXG4gICAgdGhpcy5fa2V5TWFwW2tleUNvZGVdID0ga2V5TmFtZXM7XG4gIH07XG5cbiAgYmluZE1hY3JvKGtleUNvbWJvU3RyLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFsga2V5TmFtZXMgXTtcbiAgICB9XG5cbiAgICBsZXQgaGFuZGxlciA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaGFuZGxlciA9IGtleU5hbWVzO1xuICAgICAga2V5TmFtZXMgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1hY3JvID0ge1xuICAgICAga2V5Q29tYm8gOiBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpLFxuICAgICAga2V5TmFtZXMgOiBrZXlOYW1lcyxcbiAgICAgIGhhbmRsZXIgIDogaGFuZGxlclxuICAgIH07XG5cbiAgICB0aGlzLl9tYWNyb3MucHVzaChtYWNybyk7XG4gIH07XG5cbiAgZ2V0S2V5Q29kZXMoa2V5TmFtZSkge1xuICAgIGNvbnN0IGtleUNvZGVzID0gW107XG4gICAgZm9yIChjb25zdCBrZXlDb2RlIGluIHRoaXMuX2tleU1hcCkge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9rZXlNYXBba2V5Q29kZV0uaW5kZXhPZihrZXlOYW1lKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7IGtleUNvZGVzLnB1c2goa2V5Q29kZXwwKTsgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5Q29kZXM7XG4gIH07XG5cbiAgZ2V0S2V5TmFtZXMoa2V5Q29kZSkge1xuICAgIHJldHVybiB0aGlzLl9rZXlNYXBba2V5Q29kZV0gfHwgW107XG4gIH07XG5cbiAgc2V0S2lsbEtleShrZXlDb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3Qga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLnNldEtpbGxLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2tpbGxLZXlDb2Rlcy5wdXNoKGtleUNvZGUpO1xuICB9O1xuXG4gIHByZXNzS2V5KGtleUNvZGUpIHtcbiAgICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMucHJlc3NLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGtleU5hbWVzID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKGtleU5hbWVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9hcHBseU1hY3JvcygpO1xuICB9O1xuXG4gIHJlbGVhc2VLZXkoa2V5Q29kZSkge1xuICAgIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlS2V5KGtleUNvZGVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGtleU5hbWVzICAgICAgICAgPSB0aGlzLmdldEtleU5hbWVzKGtleUNvZGUpO1xuICAgICAgY29uc3Qga2lsbEtleUNvZGVJbmRleCA9IHRoaXMuX2tpbGxLZXlDb2Rlcy5pbmRleE9mKGtleUNvZGUpO1xuXG4gICAgICBpZiAoa2lsbEtleUNvZGVJbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSk7XG4gICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5fY2xlYXJNYWNyb3MoKTtcbiAgICB9XG4gIH07XG5cbiAgX2FwcGx5TWFjcm9zKCkge1xuICAgIGNvbnN0IG1hY3JvcyA9IHRoaXMuX21hY3Jvcy5zbGljZSgwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgbWFjcm8gPSBtYWNyb3NbaV07XG4gICAgICBpZiAobWFjcm8ua2V5Q29tYm8uY2hlY2sodGhpcy5wcmVzc2VkS2V5cykpIHtcbiAgICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcbiAgICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG1hY3JvLmhhbmRsZXIodGhpcy5wcmVzc2VkS2V5cyk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBtYWNyby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgIGlmICh0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKG1hY3JvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5wdXNoKG1hY3JvKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgX2NsZWFyTWFjcm9zKCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fYXBwbGllZE1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgbWFjcm8gPSB0aGlzLl9hcHBsaWVkTWFjcm9zW2ldO1xuICAgICAgaWYgKCFtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChtYWNyby5oYW5kbGVyKSB7XG4gICAgICAgICAgbWFjcm8ua2V5TmFtZXMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2FwcGxpZWRNYWNyb3Muc3BsaWNlKGksIDEpO1xuICAgICAgICBpIC09IDE7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBMb2NhbGUgfSBmcm9tICcuL2xvY2FsZSc7XG5pbXBvcnQgeyBLZXlDb21ibyB9IGZyb20gJy4va2V5LWNvbWJvJztcblxuXG5leHBvcnQgY2xhc3MgS2V5Ym9hcmQge1xuICBjb25zdHJ1Y3Rvcih0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcbiAgICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgICA9IG51bGw7XG4gICAgdGhpcy5fY3VycmVudENvbnRleHQgICAgICAgPSBudWxsO1xuICAgIHRoaXMuX2NvbnRleHRzICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fbGlzdGVuZXJzICAgICAgICAgICAgPSBbXTtcbiAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzICAgICA9IFtdO1xuICAgIHRoaXMuX2xvY2FsZXMgICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgICAgICAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldFdpbmRvdyAgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgICAgICA9ICcnO1xuICAgIHRoaXMuX3RhcmdldFVzZXJBZ2VudCAgICAgID0gJyc7XG4gICAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyICAgICAgPSBmYWxzZTtcbiAgICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IG51bGw7XG4gICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nICAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyAgID0gbnVsbDtcbiAgICB0aGlzLl9wYXVzZWQgICAgICAgICAgICAgICA9IGZhbHNlO1xuICAgIHRoaXMuX2NhbGxlckhhbmRsZXIgICAgICAgID0gbnVsbDtcblxuICAgIHRoaXMuc2V0Q29udGV4dCgnZ2xvYmFsJyk7XG4gICAgdGhpcy53YXRjaCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpO1xuICB9XG5cbiAgc2V0TG9jYWxlKGxvY2FsZU5hbWUsIGxvY2FsZUJ1aWxkZXIpIHtcbiAgICBsZXQgbG9jYWxlID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIGxvY2FsZU5hbWUgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgIGlmIChsb2NhbGVCdWlsZGVyKSB7XG4gICAgICAgIGxvY2FsZSA9IG5ldyBMb2NhbGUobG9jYWxlTmFtZSk7XG4gICAgICAgIGxvY2FsZUJ1aWxkZXIobG9jYWxlLCB0aGlzLl90YXJnZXRQbGF0Zm9ybSwgdGhpcy5fdGFyZ2V0VXNlckFnZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvY2FsZSA9IHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gfHwgbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbG9jYWxlICAgICA9IGxvY2FsZU5hbWU7XG4gICAgICBsb2NhbGVOYW1lID0gbG9jYWxlLl9sb2NhbGVOYW1lO1xuICAgIH1cblxuICAgIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgPSBsb2NhbGU7XG4gICAgdGhpcy5fbG9jYWxlc1tsb2NhbGVOYW1lXSA9IGxvY2FsZTtcbiAgICBpZiAobG9jYWxlKSB7XG4gICAgICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMgPSBsb2NhbGUucHJlc3NlZEtleXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXRMb2NhbGUobG9jYWxOYW1lKSB7XG4gICAgbG9jYWxOYW1lIHx8IChsb2NhbE5hbWUgPSB0aGlzLl9sb2NhbGUubG9jYWxlTmFtZSk7XG4gICAgcmV0dXJuIHRoaXMuX2xvY2FsZXNbbG9jYWxOYW1lXSB8fCBudWxsO1xuICB9XG5cbiAgYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCkge1xuICAgIGlmIChrZXlDb21ib1N0ciA9PT0gbnVsbCB8fCB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgPSByZWxlYXNlSGFuZGxlcjtcbiAgICAgIHJlbGVhc2VIYW5kbGVyICAgICAgICAgPSBwcmVzc0hhbmRsZXI7XG4gICAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgID0ga2V5Q29tYm9TdHI7XG4gICAgICBrZXlDb21ib1N0ciAgICAgICAgICAgID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBrZXlDb21ib1N0ciAmJlxuICAgICAgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcbiAgICApIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5Q29tYm9TdHIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX2xpc3RlbmVycy5wdXNoKHtcbiAgICAgIGtleUNvbWJvICAgICAgICAgICAgICAgOiBrZXlDb21ib1N0ciA/IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0cikgOiBudWxsLFxuICAgICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA6IHByZXNzSGFuZGxlciAgICAgICAgICAgfHwgbnVsbCxcbiAgICAgIHJlbGVhc2VIYW5kbGVyICAgICAgICAgOiByZWxlYXNlSGFuZGxlciAgICAgICAgIHx8IG51bGwsXG4gICAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgIDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZSxcbiAgICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgOiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFkZExpc3RlbmVyKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XG4gICAgcmV0dXJuIHRoaXMuYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCk7XG4gIH1cblxuICBvbihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCkge1xuICAgIHJldHVybiB0aGlzLmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpO1xuICB9XG5cbiAgYmluZFByZXNzKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIG51bGwsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpO1xuICB9XG5cbiAgYmluZFJlbGVhc2Uoa2V5Q29tYm9TdHIsIHJlbGVhc2VIYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuYmluZChrZXlDb21ib1N0ciwgbnVsbCwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpO1xuICB9XG5cbiAgdW5iaW5kKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKSB7XG4gICAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVsZWFzZUhhbmRsZXIgPSBwcmVzc0hhbmRsZXI7XG4gICAgICBwcmVzc0hhbmRsZXIgICA9IGtleUNvbWJvU3RyO1xuICAgICAga2V5Q29tYm9TdHIgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIGtleUNvbWJvU3RyICYmXG4gICAgICB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Yga2V5Q29tYm9TdHIubGVuZ3RoID09PSAnbnVtYmVyJ1xuICAgICkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlDb21ib1N0ci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLnVuYmluZChrZXlDb21ib1N0cltpXSwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2xpc3RlbmVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lcnNbaV07XG5cbiAgICAgIGNvbnN0IGNvbWJvTWF0Y2hlcyAgICAgICAgICA9ICFrZXlDb21ib1N0ciAmJiAhbGlzdGVuZXIua2V5Q29tYm8gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5rZXlDb21ibyAmJiBsaXN0ZW5lci5rZXlDb21iby5pc0VxdWFsKGtleUNvbWJvU3RyKTtcbiAgICAgIGNvbnN0IHByZXNzSGFuZGxlck1hdGNoZXMgICA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJlc3NIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlc3NIYW5kbGVyID09PSBsaXN0ZW5lci5wcmVzc0hhbmRsZXI7XG4gICAgICBjb25zdCByZWxlYXNlSGFuZGxlck1hdGNoZXMgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFyZWxlYXNlSGFuZGxlciAmJiAhbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxlYXNlSGFuZGxlciA9PT0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXI7XG5cbiAgICAgIGlmIChjb21ib01hdGNoZXMgJiYgcHJlc3NIYW5kbGVyTWF0Y2hlcyAmJiByZWxlYXNlSGFuZGxlck1hdGNoZXMpIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgaSAtPSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVtb3ZlTGlzdGVuZXIoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy51bmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICB9XG5cbiAgb2ZmKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMudW5iaW5kKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgfVxuXG4gIHNldENvbnRleHQoY29udGV4dE5hbWUpIHtcbiAgICBpZih0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XG5cbiAgICBpZiAoIXRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXSkge1xuICAgICAgdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdID0gW107XG4gICAgfVxuICAgIHRoaXMuX2xpc3RlbmVycyAgICAgID0gdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdO1xuICAgIHRoaXMuX2N1cnJlbnRDb250ZXh0ID0gY29udGV4dE5hbWU7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldENvbnRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRDb250ZXh0O1xuICB9XG5cbiAgd2l0aENvbnRleHQoY29udGV4dE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgcHJldmlvdXNDb250ZXh0TmFtZSA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuICAgIHRoaXMuc2V0Q29udGV4dChjb250ZXh0TmFtZSk7XG5cbiAgICBjYWxsYmFjaygpO1xuXG4gICAgdGhpcy5zZXRDb250ZXh0KHByZXZpb3VzQ29udGV4dE5hbWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB3YXRjaCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHRhcmdldFBsYXRmb3JtLCB0YXJnZXRVc2VyQWdlbnQpIHtcbiAgICB0aGlzLnN0b3AoKTtcblxuICAgIGNvbnN0IHdpbiA9IHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbFRoaXMgOlxuICAgICAgICAgICAgICAgIHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDpcbiAgICAgICAgICAgICAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6XG4gICAgICAgICAgICAgICAge307XG5cbiAgICBpZiAoIXRhcmdldFdpbmRvdykge1xuICAgICAgaWYgKCF3aW4uYWRkRXZlbnRMaXN0ZW5lciAmJiAhd2luLmF0dGFjaEV2ZW50KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgd2luZG93IGZ1bmN0aW9ucyBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50LicpO1xuICAgICAgfVxuICAgICAgdGFyZ2V0V2luZG93ID0gd2luO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBlbGVtZW50IGJpbmRpbmdzIHdoZXJlIGEgdGFyZ2V0IHdpbmRvdyBpcyBub3QgcGFzc2VkXG4gICAgaWYgKHR5cGVvZiB0YXJnZXRXaW5kb3cubm9kZVR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICB0YXJnZXRVc2VyQWdlbnQgPSB0YXJnZXRQbGF0Zm9ybTtcbiAgICAgIHRhcmdldFBsYXRmb3JtICA9IHRhcmdldEVsZW1lbnQ7XG4gICAgICB0YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRXaW5kb3c7XG4gICAgICB0YXJnZXRXaW5kb3cgICAgPSB3aW47XG4gICAgfVxuXG4gICAgaWYgKCF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAmJiAhdGFyZ2V0V2luZG93LmF0dGFjaEV2ZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQgbWV0aG9kcyBvbiB0YXJnZXRXaW5kb3cuJyk7XG4gICAgfVxuXG4gICAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyID0gISF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcblxuICAgIGNvbnN0IHVzZXJBZ2VudCA9IHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IgJiYgdGFyZ2V0V2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQgfHwgJyc7XG4gICAgY29uc3QgcGxhdGZvcm0gID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtICB8fCAnJztcblxuICAgIHRhcmdldEVsZW1lbnQgICAmJiB0YXJnZXRFbGVtZW50ICAgIT09IG51bGwgfHwgKHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdy5kb2N1bWVudCk7XG4gICAgdGFyZ2V0UGxhdGZvcm0gICYmIHRhcmdldFBsYXRmb3JtICAhPT0gbnVsbCB8fCAodGFyZ2V0UGxhdGZvcm0gID0gcGxhdGZvcm0pO1xuICAgIHRhcmdldFVzZXJBZ2VudCAmJiB0YXJnZXRVc2VyQWdlbnQgIT09IG51bGwgfHwgKHRhcmdldFVzZXJBZ2VudCA9IHVzZXJBZ2VudCk7XG5cbiAgICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy5wcmVzc0tleShldmVudC5rZXlDb2RlLCBldmVudCk7XG4gICAgICB0aGlzLl9oYW5kbGVDb21tYW5kQnVnKGV2ZW50LCBwbGF0Zm9ybSk7XG4gICAgfTtcbiAgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcgPSAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMucmVsZWFzZUtleShldmVudC5rZXlDb2RlLCBldmVudCk7XG4gICAgfTtcbiAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcgPSAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMucmVsZWFzZUFsbEtleXMoZXZlbnQpO1xuICAgIH07XG5cbiAgICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XG4gICAgdGhpcy5fYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcbiAgICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuICAgIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG5cbiAgICB0aGlzLl90YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRFbGVtZW50O1xuICAgIHRoaXMuX3RhcmdldFdpbmRvdyAgICA9IHRhcmdldFdpbmRvdztcbiAgICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRQbGF0Zm9ybTtcbiAgICB0aGlzLl90YXJnZXRVc2VyQWdlbnQgPSB0YXJnZXRVc2VyQWdlbnQ7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgaWYgKCF0aGlzLl90YXJnZXRFbGVtZW50IHx8ICF0aGlzLl90YXJnZXRXaW5kb3cpIHsgcmV0dXJuOyB9XG5cbiAgICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5dXAnLCAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyk7XG4gICAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuICAgIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICAgIHRoaXMuX3RhcmdldFdpbmRvdyAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldEVsZW1lbnQgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwcmVzc0tleShrZXlDb2RlLCBldmVudCkge1xuICAgIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gICAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgICB0aGlzLl9sb2NhbGUucHJlc3NLZXkoa2V5Q29kZSk7XG4gICAgdGhpcy5fYXBwbHlCaW5kaW5ncyhldmVudCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbGVhc2VLZXkoa2V5Q29kZSwgZXZlbnQpIHtcbiAgICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybiB0aGlzOyB9XG4gICAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgICB0aGlzLl9sb2NhbGUucmVsZWFzZUtleShrZXlDb2RlKTtcbiAgICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVsZWFzZUFsbEtleXMoZXZlbnQpIHtcbiAgICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybiB0aGlzOyB9XG4gICAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcGF1c2UoKSB7XG4gICAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm4gdGhpczsgfVxuICAgIGlmICh0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XG4gICAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVzdW1lKCkge1xuICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XG4gICAgICB0YXJnZXRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxuICAgICAgdGFyZ2V0RWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgfVxuXG4gIF91bmJpbmRFdmVudCh0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5faXNNb2Rlcm5Ccm93c2VyID9cbiAgICAgIHRhcmdldEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XG4gICAgICB0YXJnZXRFbGVtZW50LmRldGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xuICB9XG5cbiAgX2dldEdyb3VwZWRMaXN0ZW5lcnMoKSB7XG4gICAgY29uc3QgbGlzdGVuZXJHcm91cHMgICA9IFtdO1xuICAgIGNvbnN0IGxpc3RlbmVyR3JvdXBNYXAgPSBbXTtcblxuICAgIGxldCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRDb250ZXh0ICE9PSAnZ2xvYmFsJykge1xuICAgICAgbGlzdGVuZXJzID0gWy4uLmxpc3RlbmVycywgLi4udGhpcy5fY29udGV4dHMuZ2xvYmFsXTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuc29ydChcbiAgICAgIChhLCBiKSA9PlxuICAgICAgICAoYi5rZXlDb21ibyA/IGIua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMCkgLVxuICAgICAgICAoYS5rZXlDb21ibyA/IGEua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMClcbiAgICApLmZvckVhY2goKGwpID0+IHtcbiAgICAgIGxldCBtYXBJbmRleCA9IC0xO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lckdyb3VwTWFwLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChsaXN0ZW5lckdyb3VwTWFwW2ldID09PSBudWxsICYmIGwua2V5Q29tYm8gPT09IG51bGwgfHxcbiAgICAgICAgICAgIGxpc3RlbmVyR3JvdXBNYXBbaV0gIT09IG51bGwgJiYgbGlzdGVuZXJHcm91cE1hcFtpXS5pc0VxdWFsKGwua2V5Q29tYm8pKSB7XG4gICAgICAgICAgbWFwSW5kZXggPSBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWFwSW5kZXggPT09IC0xKSB7XG4gICAgICAgIG1hcEluZGV4ID0gbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7XG4gICAgICAgIGxpc3RlbmVyR3JvdXBNYXAucHVzaChsLmtleUNvbWJvKTtcbiAgICAgIH1cbiAgICAgIGlmICghbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdKSB7XG4gICAgICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSA9IFtdO1xuICAgICAgfVxuICAgICAgbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdLnB1c2gobCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbGlzdGVuZXJHcm91cHM7XG4gIH1cblxuICBfYXBwbHlCaW5kaW5ncyhldmVudCkge1xuICAgIGxldCBwcmV2ZW50UmVwZWF0ID0gZmFsc2U7XG5cbiAgICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG4gICAgZXZlbnQucHJldmVudFJlcGVhdCA9ICgpID0+IHsgcHJldmVudFJlcGVhdCA9IHRydWU7IH07XG4gICAgZXZlbnQucHJlc3NlZEtleXMgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcblxuICAgIGNvbnN0IHByZXNzZWRLZXlzICAgID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xuICAgIGNvbnN0IGxpc3RlbmVyR3JvdXBzID0gdGhpcy5fZ2V0R3JvdXBlZExpc3RlbmVycygpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lckdyb3Vwcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgbGlzdGVuZXJzID0gbGlzdGVuZXJHcm91cHNbaV07XG4gICAgICBjb25zdCBrZXlDb21ibyAgPSBsaXN0ZW5lcnNbMF0ua2V5Q29tYm87XG5cbiAgICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCB8fCBrZXlDb21iby5jaGVjayhwcmVzc2VkS2V5cykpIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBsaXN0ZW5lcnMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICBsZXQgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbal07XG5cbiAgICAgICAgICBpZiAobGlzdGVuZXIucHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmV2ZW50UmVwZWF0KSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5wcmVzc0hhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgICBpZiAocHJldmVudFJlcGVhdCkge1xuICAgICAgICAgICAgICBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0ID0gcHJldmVudFJlcGVhdDtcbiAgICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChsaXN0ZW5lci5yZWxlYXNlSGFuZGxlciAmJiB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5Q29tYm8pIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGtleUNvbWJvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHByZXNzZWRLZXlzLmluZGV4T2Yoa2V5Q29tYm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICBwcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICBqIC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyQmluZGluZ3MoZXZlbnQpIHtcbiAgICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG4gICAgZXZlbnQucHJlc3NlZEtleXMgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5fYXBwbGllZExpc3RlbmVyc1tpXTtcbiAgICAgIGNvbnN0IGtleUNvbWJvID0gbGlzdGVuZXIua2V5Q29tYm87XG4gICAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwgIWtleUNvbWJvLmNoZWNrKHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cykpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NhbGxlckhhbmRsZXIgIT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyKSB7XG4gICAgICAgICAgY29uc3Qgb2xkQ2FsbGVyID0gdGhpcy5fY2FsbGVySGFuZGxlcjtcbiAgICAgICAgICB0aGlzLl9jYWxsZXJIYW5kbGVyID0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXI7XG4gICAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IGxpc3RlbmVyLnByZXZlbnRSZXBlYXRCeURlZmF1bHQ7XG4gICAgICAgICAgbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgdGhpcy5fY2FsbGVySGFuZGxlciA9IG9sZENhbGxlcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5Q29tYm8gIT09IG51bGwgfHwgZXZlbnQucHJlc3NlZEtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUNvbW1hbmRCdWcoZXZlbnQsIHBsYXRmb3JtKSB7XG4gICAgLy8gT24gTWFjIHdoZW4gdGhlIGNvbW1hbmQga2V5IGlzIGtlcHQgcHJlc3NlZCwga2V5dXAgaXMgbm90IHRyaWdnZXJlZCBmb3IgYW55IG90aGVyIGtleS5cbiAgICAvLyBJbiB0aGlzIGNhc2UgZm9yY2UgYSBrZXl1cCBmb3Igbm9uLW1vZGlmaWVyIGtleXMgZGlyZWN0bHkgYWZ0ZXIgdGhlIGtleXByZXNzLlxuICAgIGNvbnN0IG1vZGlmaWVyS2V5cyA9IFtcInNoaWZ0XCIsIFwiY3RybFwiLCBcImFsdFwiLCBcImNhcHNsb2NrXCIsIFwidGFiXCIsIFwiY29tbWFuZFwiXTtcbiAgICBpZiAocGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgJiYgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLmluY2x1ZGVzKFwiY29tbWFuZFwiKSAmJlxuICAgICAgICAhbW9kaWZpZXJLZXlzLmluY2x1ZGVzKHRoaXMuX2xvY2FsZS5nZXRLZXlOYW1lcyhldmVudC5rZXlDb2RlKVswXSkpIHtcbiAgICAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyhldmVudCk7XG4gICAgfVxuICB9XG59XG4iLCJcbmV4cG9ydCBmdW5jdGlvbiB1cyhsb2NhbGUsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcblxuICAvLyBnZW5lcmFsXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzLCAgIFsnY2FuY2VsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOCwgICBbJ2JhY2tzcGFjZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDksICAgWyd0YWInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMiwgIFsnY2xlYXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMywgIFsnZW50ZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNiwgIFsnc2hpZnQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNywgIFsnY3RybCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4LCAgWydhbHQnLCAnbWVudSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5LCAgWydwYXVzZScsICdicmVhayddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIwLCAgWydjYXBzbG9jayddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDI3LCAgWydlc2NhcGUnLCAnZXNjJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzIsICBbJ3NwYWNlJywgJ3NwYWNlYmFyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzMsICBbJ3BhZ2V1cCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM0LCAgWydwYWdlZG93biddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM1LCAgWydlbmQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNiwgIFsnaG9tZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM3LCAgWydsZWZ0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzgsICBbJ3VwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzksICBbJ3JpZ2h0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDAsICBbJ2Rvd24nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MSwgIFsnc2VsZWN0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDIsICBbJ3ByaW50c2NyZWVuJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDMsICBbJ2V4ZWN1dGUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NCwgIFsnc25hcHNob3QnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NSwgIFsnaW5zZXJ0JywgJ2lucyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ2LCAgWydkZWxldGUnLCAnZGVsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDcsICBbJ2hlbHAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNDUsIFsnc2Nyb2xsbG9jaycsICdzY3JvbGwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxODgsIFsnY29tbWEnLCAnLCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MCwgWydwZXJpb2QnLCAnLiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MSwgWydzbGFzaCcsICdmb3J3YXJkc2xhc2gnLCAnLyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MiwgWydncmF2ZWFjY2VudCcsICdgJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjE5LCBbJ29wZW5icmFja2V0JywgJ1snXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjAsIFsnYmFja3NsYXNoJywgJ1xcXFwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjEsIFsnY2xvc2VicmFja2V0JywgJ10nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjIsIFsnYXBvc3Ryb3BoZScsICdcXCcnXSk7XG5cbiAgLy8gMC05XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OCwgWyd6ZXJvJywgJzAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OSwgWydvbmUnLCAnMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUwLCBbJ3R3bycsICcyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTEsIFsndGhyZWUnLCAnMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUyLCBbJ2ZvdXInLCAnNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUzLCBbJ2ZpdmUnLCAnNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU0LCBbJ3NpeCcsICc2J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTUsIFsnc2V2ZW4nLCAnNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU2LCBbJ2VpZ2h0JywgJzgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NywgWyduaW5lJywgJzknXSk7XG5cbiAgLy8gbnVtcGFkXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NiwgWydudW16ZXJvJywgJ251bTAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NywgWydudW1vbmUnLCAnbnVtMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk4LCBbJ251bXR3bycsICdudW0yJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTksIFsnbnVtdGhyZWUnLCAnbnVtMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMCwgWydudW1mb3VyJywgJ251bTQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDEsIFsnbnVtZml2ZScsICdudW01J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAyLCBbJ251bXNpeCcsICdudW02J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAzLCBbJ251bXNldmVuJywgJ251bTcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDQsIFsnbnVtZWlnaHQnLCAnbnVtOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNSwgWydudW1uaW5lJywgJ251bTknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDYsIFsnbnVtbXVsdGlwbHknLCAnbnVtKiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNywgWydudW1hZGQnLCAnbnVtKyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOCwgWydudW1lbnRlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOSwgWydudW1zdWJ0cmFjdCcsICdudW0tJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEwLCBbJ251bWRlY2ltYWwnLCAnbnVtLiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMSwgWydudW1kaXZpZGUnLCAnbnVtLyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE0NCwgWydudW1sb2NrJywgJ251bSddKTtcblxuICAvLyBmdW5jdGlvbiBrZXlzXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTIsIFsnZjEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTMsIFsnZjInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTQsIFsnZjMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTUsIFsnZjQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTYsIFsnZjUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTcsIFsnZjYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTgsIFsnZjcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTksIFsnZjgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjAsIFsnZjknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjEsIFsnZjEwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIyLCBbJ2YxMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMywgWydmMTInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjQsIFsnZjEzJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI1LCBbJ2YxNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyNiwgWydmMTUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjcsIFsnZjE2J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI4LCBbJ2YxNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyOSwgWydmMTgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzAsIFsnZjE5J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMxLCBbJ2YyMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzMiwgWydmMjEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzMsIFsnZjIyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTM0LCBbJ2YyMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzNSwgWydmMjQnXSk7XG5cbiAgLy8gc2Vjb25kYXJ5IGtleSBzeW1ib2xzXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgYCcsIFsndGlsZGUnLCAnfiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAxJywgWydleGNsYW1hdGlvbicsICdleGNsYW1hdGlvbnBvaW50JywgJyEnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMicsIFsnYXQnLCAnQCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAzJywgWydudW1iZXInLCAnIyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA0JywgWydkb2xsYXInLCAnZG9sbGFycycsICdkb2xsYXJzaWduJywgJyQnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNScsIFsncGVyY2VudCcsICclJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDYnLCBbJ2NhcmV0JywgJ14nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNycsIFsnYW1wZXJzYW5kJywgJ2FuZCcsICcmJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDgnLCBbJ2FzdGVyaXNrJywgJyonXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOScsIFsnb3BlbnBhcmVuJywgJygnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMCcsIFsnY2xvc2VwYXJlbicsICcpJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC0nLCBbJ3VuZGVyc2NvcmUnLCAnXyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA9JywgWydwbHVzJywgJysnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgWycsIFsnb3BlbmN1cmx5YnJhY2UnLCAnb3BlbmN1cmx5YnJhY2tldCcsICd7J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIF0nLCBbJ2Nsb3NlY3VybHlicmFjZScsICdjbG9zZWN1cmx5YnJhY2tldCcsICd9J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFxcXFwnLCBbJ3ZlcnRpY2FsYmFyJywgJ3wnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOycsIFsnY29sb24nLCAnOiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBcXCcnLCBbJ3F1b3RhdGlvbm1hcmsnLCAnXFwnJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArICEsJywgWydvcGVuYW5nbGVicmFja2V0JywgJzwnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLicsIFsnY2xvc2VhbmdsZWJyYWNrZXQnLCAnPiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAvJywgWydxdWVzdGlvbm1hcmsnLCAnPyddKTtcblxuICBpZiAocGxhdGZvcm0ubWF0Y2goJ01hYycpKSB7XG4gICAgbG9jYWxlLmJpbmRNYWNybygnY29tbWFuZCcsIFsnbW9kJywgJ21vZGlmaWVyJ10pO1xuICB9IGVsc2Uge1xuICAgIGxvY2FsZS5iaW5kTWFjcm8oJ2N0cmwnLCBbJ21vZCcsICdtb2RpZmllciddKTtcbiAgfVxuXG4gIC8vYS16IGFuZCBBLVpcbiAgZm9yIChsZXQga2V5Q29kZSA9IDY1OyBrZXlDb2RlIDw9IDkwOyBrZXlDb2RlICs9IDEpIHtcbiAgICB2YXIga2V5TmFtZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5Q29kZSArIDMyKTtcbiAgICB2YXIgY2FwaXRhbEtleU5hbWUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleUNvZGUpO1xuICBcdGxvY2FsZS5iaW5kS2V5Q29kZShrZXlDb2RlLCBrZXlOYW1lKTtcbiAgXHRsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArICcgKyBrZXlOYW1lLCBjYXBpdGFsS2V5TmFtZSk7XG4gIFx0bG9jYWxlLmJpbmRNYWNybygnY2Fwc2xvY2sgKyAnICsga2V5TmFtZSwgY2FwaXRhbEtleU5hbWUpO1xuICB9XG5cbiAgLy8gYnJvd3NlciBjYXZlYXRzXG4gIGNvbnN0IHNlbWljb2xvbktleUNvZGUgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDU5ICA6IDE4NjtcbiAgY29uc3QgZGFzaEtleUNvZGUgICAgICA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gMTczIDogMTg5O1xuICBjb25zdCBlcXVhbEtleUNvZGUgICAgID0gdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykgPyA2MSAgOiAxODc7XG4gIGxldCBsZWZ0Q29tbWFuZEtleUNvZGU7XG4gIGxldCByaWdodENvbW1hbmRLZXlDb2RlO1xuICBpZiAocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmICh1c2VyQWdlbnQubWF0Y2goJ1NhZmFyaScpIHx8IHVzZXJBZ2VudC5tYXRjaCgnQ2hyb21lJykpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDkxO1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSA5MztcbiAgfSBlbHNlIGlmKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiB1c2VyQWdlbnQubWF0Y2goJ09wZXJhJykpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gMTc7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDE3O1xuICB9IGVsc2UgaWYocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmIHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDIyNDtcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gMjI0O1xuICB9XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShzZW1pY29sb25LZXlDb2RlLCAgICBbJ3NlbWljb2xvbicsICc7J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoZGFzaEtleUNvZGUsICAgICAgICAgWydkYXNoJywgJy0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShlcXVhbEtleUNvZGUsICAgICAgICBbJ2VxdWFsJywgJ2VxdWFsc2lnbicsICc9J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUobGVmdENvbW1hbmRLZXlDb2RlLCAgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ2xlZnRjb21tYW5kJywgJ2xlZnR3aW5kb3dzJywgJ2xlZnR3aW4nLCAnbGVmdHN1cGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUocmlnaHRDb21tYW5kS2V5Q29kZSwgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ3JpZ2h0Y29tbWFuZCcsICdyaWdodHdpbmRvd3MnLCAncmlnaHR3aW4nLCAncmlnaHRzdXBlciddKTtcblxuICAvLyBraWxsIGtleXNcbiAgbG9jYWxlLnNldEtpbGxLZXkoJ2NvbW1hbmQnKTtcbn07XG4iLCJpbXBvcnQgeyBLZXlib2FyZCB9IGZyb20gJy4vbGliL2tleWJvYXJkJztcbmltcG9ydCB7IExvY2FsZSB9IGZyb20gJy4vbGliL2xvY2FsZSc7XG5pbXBvcnQgeyBLZXlDb21ibyB9IGZyb20gJy4vbGliL2tleS1jb21ibyc7XG5pbXBvcnQgeyB1cyB9IGZyb20gJy4vbG9jYWxlcy91cyc7XG5cbmNvbnN0IGtleWJvYXJkID0gbmV3IEtleWJvYXJkKCk7XG5cbmtleWJvYXJkLnNldExvY2FsZSgndXMnLCB1cyk7XG5cbmtleWJvYXJkLktleWJvYXJkID0gS2V5Ym9hcmQ7XG5rZXlib2FyZC5Mb2NhbGUgPSBMb2NhbGU7XG5rZXlib2FyZC5LZXlDb21ibyA9IEtleUNvbWJvO1xuXG5leHBvcnQgZGVmYXVsdCBrZXlib2FyZDtcbiJdLCJuYW1lcyI6WyJLZXlDb21ibyIsImtleUNvbWJvU3RyIiwic291cmNlU3RyIiwic3ViQ29tYm9zIiwicGFyc2VDb21ib1N0ciIsImtleU5hbWVzIiwicmVkdWNlIiwibWVtbyIsIm5leHRTdWJDb21ibyIsImNvbmNhdCIsInByZXNzZWRLZXlOYW1lcyIsInN0YXJ0aW5nS2V5TmFtZUluZGV4IiwiaSIsImxlbmd0aCIsIl9jaGVja1N1YkNvbWJvIiwib3RoZXJLZXlDb21ibyIsInN1YkNvbWJvIiwib3RoZXJTdWJDb21ibyIsInNsaWNlIiwiaiIsImtleU5hbWUiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJlbmRJbmRleCIsImVzY2FwZWRLZXlOYW1lIiwiY29tYm9EZWxpbWluYXRvciIsImtleURlbGltaW5hdG9yIiwic3ViQ29tYm9TdHJzIiwiX3NwbGl0U3RyIiwiY29tYm8iLCJwdXNoIiwic3RyIiwiZGVsaW1pbmF0b3IiLCJzIiwiZCIsImMiLCJjYSIsImNpIiwidHJpbSIsIkxvY2FsZSIsIm5hbWUiLCJsb2NhbGVOYW1lIiwicHJlc3NlZEtleXMiLCJfYXBwbGllZE1hY3JvcyIsIl9rZXlNYXAiLCJfa2lsbEtleUNvZGVzIiwiX21hY3JvcyIsImtleUNvZGUiLCJoYW5kbGVyIiwibWFjcm8iLCJrZXlDb21ibyIsImtleUNvZGVzIiwiZ2V0S2V5Q29kZXMiLCJzZXRLaWxsS2V5IiwicHJlc3NLZXkiLCJnZXRLZXlOYW1lcyIsIl9hcHBseU1hY3JvcyIsInJlbGVhc2VLZXkiLCJraWxsS2V5Q29kZUluZGV4IiwiX2NsZWFyTWFjcm9zIiwibWFjcm9zIiwiY2hlY2siLCJLZXlib2FyZCIsInRhcmdldFdpbmRvdyIsInRhcmdldEVsZW1lbnQiLCJwbGF0Zm9ybSIsInVzZXJBZ2VudCIsIl9sb2NhbGUiLCJfY3VycmVudENvbnRleHQiLCJfY29udGV4dHMiLCJfbGlzdGVuZXJzIiwiX2FwcGxpZWRMaXN0ZW5lcnMiLCJfbG9jYWxlcyIsIl90YXJnZXRFbGVtZW50IiwiX3RhcmdldFdpbmRvdyIsIl90YXJnZXRQbGF0Zm9ybSIsIl90YXJnZXRVc2VyQWdlbnQiLCJfaXNNb2Rlcm5Ccm93c2VyIiwiX3RhcmdldEtleURvd25CaW5kaW5nIiwiX3RhcmdldEtleVVwQmluZGluZyIsIl90YXJnZXRSZXNldEJpbmRpbmciLCJfcGF1c2VkIiwiX2NhbGxlckhhbmRsZXIiLCJzZXRDb250ZXh0Iiwid2F0Y2giLCJsb2NhbGVCdWlsZGVyIiwibG9jYWxlIiwiX2xvY2FsZU5hbWUiLCJsb2NhbE5hbWUiLCJwcmVzc0hhbmRsZXIiLCJyZWxlYXNlSGFuZGxlciIsInByZXZlbnRSZXBlYXRCeURlZmF1bHQiLCJiaW5kIiwicHJldmVudFJlcGVhdCIsInVuYmluZCIsImxpc3RlbmVyIiwiY29tYm9NYXRjaGVzIiwiaXNFcXVhbCIsInByZXNzSGFuZGxlck1hdGNoZXMiLCJyZWxlYXNlSGFuZGxlck1hdGNoZXMiLCJjb250ZXh0TmFtZSIsInJlbGVhc2VBbGxLZXlzIiwiY2FsbGJhY2siLCJwcmV2aW91c0NvbnRleHROYW1lIiwiZ2V0Q29udGV4dCIsInRhcmdldFBsYXRmb3JtIiwidGFyZ2V0VXNlckFnZW50Iiwic3RvcCIsIndpbiIsImdsb2JhbFRoaXMiLCJnbG9iYWwiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiYXR0YWNoRXZlbnQiLCJFcnJvciIsIm5vZGVUeXBlIiwibmF2aWdhdG9yIiwiZG9jdW1lbnQiLCJldmVudCIsIl9oYW5kbGVDb21tYW5kQnVnIiwiX2JpbmRFdmVudCIsIl91bmJpbmRFdmVudCIsIl9hcHBseUJpbmRpbmdzIiwiX2NsZWFyQmluZGluZ3MiLCJldmVudE5hbWUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZGV0YWNoRXZlbnQiLCJsaXN0ZW5lckdyb3VwcyIsImxpc3RlbmVyR3JvdXBNYXAiLCJsaXN0ZW5lcnMiLCJzb3J0IiwiYSIsImIiLCJmb3JFYWNoIiwibCIsIm1hcEluZGV4IiwiX2dldEdyb3VwZWRMaXN0ZW5lcnMiLCJjYWxsIiwib2xkQ2FsbGVyIiwibW9kaWZpZXJLZXlzIiwibWF0Y2giLCJpbmNsdWRlcyIsInVzIiwiYmluZEtleUNvZGUiLCJiaW5kTWFjcm8iLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJjYXBpdGFsS2V5TmFtZSIsInNlbWljb2xvbktleUNvZGUiLCJkYXNoS2V5Q29kZSIsImVxdWFsS2V5Q29kZSIsImxlZnRDb21tYW5kS2V5Q29kZSIsInJpZ2h0Q29tbWFuZEtleUNvZGUiLCJrZXlib2FyZCIsInNldExvY2FsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFDYUEsUUFBYjtFQUNFLG9CQUFZQyxXQUFaLEVBQXlCO0VBQUE7O0VBQ3ZCLFNBQUtDLFNBQUwsR0FBaUJELFdBQWpCO0VBQ0EsU0FBS0UsU0FBTCxHQUFpQkgsUUFBUSxDQUFDSSxhQUFULENBQXVCSCxXQUF2QixD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
