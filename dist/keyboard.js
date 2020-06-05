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

          if (killKeyCodeIndex !== -1) {
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
          return this;
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

                if (preventRepeat || listener.preventRepeatByDefault) {
                  listener.preventRepeat = true;
                  preventRepeat = false;
                }
              }

              if (this._appliedListeners.indexOf(listener) === -1) {
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
            listener.preventRepeat = false;

            if (keyCombo !== null || event.pressedKeys.length === 0) {
              this._appliedListeners.splice(i, 1);

              i -= 1;
            }

            if (listener.releaseHandler) {
              listener.releaseHandler.call(this, event);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9rZXktY29tYm8uanMiLCIuLi9saWIvbG9jYWxlLmpzIiwiLi4vbGliL2tleWJvYXJkLmpzIiwiLi4vbG9jYWxlcy91cy5qcyIsIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuZXhwb3J0IGNsYXNzIEtleUNvbWJvIHtcbiAgY29uc3RydWN0b3Ioa2V5Q29tYm9TdHIpIHtcbiAgICB0aGlzLnNvdXJjZVN0ciA9IGtleUNvbWJvU3RyO1xuICAgIHRoaXMuc3ViQ29tYm9zID0gS2V5Q29tYm8ucGFyc2VDb21ib1N0cihrZXlDb21ib1N0cik7XG4gICAgdGhpcy5rZXlOYW1lcyAgPSB0aGlzLnN1YkNvbWJvcy5yZWR1Y2UoKG1lbW8sIG5leHRTdWJDb21ibykgPT5cbiAgICAgIG1lbW8uY29uY2F0KG5leHRTdWJDb21ibyksIFtdKTtcbiAgfVxuXG4gIGNoZWNrKHByZXNzZWRLZXlOYW1lcykge1xuICAgIGxldCBzdGFydGluZ0tleU5hbWVJbmRleCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSB0aGlzLl9jaGVja1N1YkNvbWJvKFxuICAgICAgICB0aGlzLnN1YkNvbWJvc1tpXSxcbiAgICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXgsXG4gICAgICAgIHByZXNzZWRLZXlOYW1lc1xuICAgICAgKTtcbiAgICAgIGlmIChzdGFydGluZ0tleU5hbWVJbmRleCA9PT0gLTEpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIGlzRXF1YWwob3RoZXJLZXlDb21ibykge1xuICAgIGlmIChcbiAgICAgICFvdGhlcktleUNvbWJvIHx8XG4gICAgICB0eXBlb2Ygb3RoZXJLZXlDb21ibyAhPT0gJ3N0cmluZycgJiZcbiAgICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnb2JqZWN0J1xuICAgICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIGlmICh0eXBlb2Ygb3RoZXJLZXlDb21ibyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG90aGVyS2V5Q29tYm8gPSBuZXcgS2V5Q29tYm8ob3RoZXJLZXlDb21ibyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3ViQ29tYm9zLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3MubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmICh0aGlzLnN1YkNvbWJvc1tpXS5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3Qgc3ViQ29tYm8gICAgICA9IHRoaXMuc3ViQ29tYm9zW2ldO1xuICAgICAgY29uc3Qgb3RoZXJTdWJDb21ibyA9IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLnNsaWNlKDApO1xuXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHN1YkNvbWJvLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGNvbnN0IGtleU5hbWUgPSBzdWJDb21ib1tqXTtcbiAgICAgICAgY29uc3QgaW5kZXggICA9IG90aGVyU3ViQ29tYm8uaW5kZXhPZihrZXlOYW1lKTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIG90aGVyU3ViQ29tYm8uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG90aGVyU3ViQ29tYm8ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBfY2hlY2tTdWJDb21ibyhzdWJDb21ibywgc3RhcnRpbmdLZXlOYW1lSW5kZXgsIHByZXNzZWRLZXlOYW1lcykge1xuICAgIHN1YkNvbWJvID0gc3ViQ29tYm8uc2xpY2UoMCk7XG4gICAgcHJlc3NlZEtleU5hbWVzID0gcHJlc3NlZEtleU5hbWVzLnNsaWNlKHN0YXJ0aW5nS2V5TmFtZUluZGV4KTtcblxuICAgIGxldCBlbmRJbmRleCA9IHN0YXJ0aW5nS2V5TmFtZUluZGV4O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3ViQ29tYm8ubGVuZ3RoOyBpICs9IDEpIHtcblxuICAgICAgbGV0IGtleU5hbWUgPSBzdWJDb21ib1tpXTtcbiAgICAgIGlmIChrZXlOYW1lWzBdID09PSAnXFxcXCcpIHtcbiAgICAgICAgY29uc3QgZXNjYXBlZEtleU5hbWUgPSBrZXlOYW1lLnNsaWNlKDEpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgfHxcbiAgICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3JcbiAgICAgICAgKSB7XG4gICAgICAgICAga2V5TmFtZSA9IGVzY2FwZWRLZXlOYW1lO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gcHJlc3NlZEtleU5hbWVzLmluZGV4T2Yoa2V5TmFtZSk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBzdWJDb21iby5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGkgLT0gMTtcbiAgICAgICAgaWYgKGluZGV4ID4gZW5kSW5kZXgpIHtcbiAgICAgICAgICBlbmRJbmRleCA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdWJDb21iby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gZW5kSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xufVxuXG5LZXlDb21iby5jb21ib0RlbGltaW5hdG9yID0gJz4nO1xuS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IgICA9ICcrJztcblxuS2V5Q29tYm8ucGFyc2VDb21ib1N0ciA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyKSB7XG4gIGNvbnN0IHN1YkNvbWJvU3RycyA9IEtleUNvbWJvLl9zcGxpdFN0cihrZXlDb21ib1N0ciwgS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvcik7XG4gIGNvbnN0IGNvbWJvICAgICAgICA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwIDsgaSA8IHN1YkNvbWJvU3Rycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGNvbWJvLnB1c2goS2V5Q29tYm8uX3NwbGl0U3RyKHN1YkNvbWJvU3Ryc1tpXSwgS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IpKTtcbiAgfVxuICByZXR1cm4gY29tYm87XG59XG5cbktleUNvbWJvLl9zcGxpdFN0ciA9IGZ1bmN0aW9uKHN0ciwgZGVsaW1pbmF0b3IpIHtcbiAgY29uc3QgcyAgPSBzdHI7XG4gIGNvbnN0IGQgID0gZGVsaW1pbmF0b3I7XG4gIGxldCBjICA9ICcnO1xuICBjb25zdCBjYSA9IFtdO1xuXG4gIGZvciAobGV0IGNpID0gMDsgY2kgPCBzLmxlbmd0aDsgY2kgKz0gMSkge1xuICAgIGlmIChjaSA+IDAgJiYgc1tjaV0gPT09IGQgJiYgc1tjaSAtIDFdICE9PSAnXFxcXCcpIHtcbiAgICAgIGNhLnB1c2goYy50cmltKCkpO1xuICAgICAgYyA9ICcnO1xuICAgICAgY2kgKz0gMTtcbiAgICB9XG4gICAgYyArPSBzW2NpXTtcbiAgfVxuICBpZiAoYykgeyBjYS5wdXNoKGMudHJpbSgpKTsgfVxuXG4gIHJldHVybiBjYTtcbn07XG4iLCJpbXBvcnQgeyBLZXlDb21ibyB9IGZyb20gJy4va2V5LWNvbWJvJztcblxuXG5leHBvcnQgY2xhc3MgTG9jYWxlIHtcbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHRoaXMubG9jYWxlTmFtZSAgICAgPSBuYW1lO1xuICAgIHRoaXMucHJlc3NlZEtleXMgICAgPSBbXTtcbiAgICB0aGlzLl9hcHBsaWVkTWFjcm9zID0gW107XG4gICAgdGhpcy5fa2V5TWFwICAgICAgICA9IHt9O1xuICAgIHRoaXMuX2tpbGxLZXlDb2RlcyAgPSBbXTtcbiAgICB0aGlzLl9tYWNyb3MgICAgICAgID0gW107XG4gIH1cblxuICBiaW5kS2V5Q29kZShrZXlDb2RlLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFtrZXlOYW1lc107XG4gICAgfVxuXG4gICAgdGhpcy5fa2V5TWFwW2tleUNvZGVdID0ga2V5TmFtZXM7XG4gIH07XG5cbiAgYmluZE1hY3JvKGtleUNvbWJvU3RyLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFsga2V5TmFtZXMgXTtcbiAgICB9XG5cbiAgICBsZXQgaGFuZGxlciA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaGFuZGxlciA9IGtleU5hbWVzO1xuICAgICAga2V5TmFtZXMgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1hY3JvID0ge1xuICAgICAga2V5Q29tYm8gOiBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpLFxuICAgICAga2V5TmFtZXMgOiBrZXlOYW1lcyxcbiAgICAgIGhhbmRsZXIgIDogaGFuZGxlclxuICAgIH07XG5cbiAgICB0aGlzLl9tYWNyb3MucHVzaChtYWNybyk7XG4gIH07XG5cbiAgZ2V0S2V5Q29kZXMoa2V5TmFtZSkge1xuICAgIGNvbnN0IGtleUNvZGVzID0gW107XG4gICAgZm9yIChjb25zdCBrZXlDb2RlIGluIHRoaXMuX2tleU1hcCkge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9rZXlNYXBba2V5Q29kZV0uaW5kZXhPZihrZXlOYW1lKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7IGtleUNvZGVzLnB1c2goa2V5Q29kZXwwKTsgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5Q29kZXM7XG4gIH07XG5cbiAgZ2V0S2V5TmFtZXMoa2V5Q29kZSkge1xuICAgIHJldHVybiB0aGlzLl9rZXlNYXBba2V5Q29kZV0gfHwgW107XG4gIH07XG5cbiAgc2V0S2lsbEtleShrZXlDb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3Qga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLnNldEtpbGxLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2tpbGxLZXlDb2Rlcy5wdXNoKGtleUNvZGUpO1xuICB9O1xuXG4gIHByZXNzS2V5KGtleUNvZGUpIHtcbiAgICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMucHJlc3NLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGtleU5hbWVzID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKGtleU5hbWVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9hcHBseU1hY3JvcygpO1xuICB9O1xuXG4gIHJlbGVhc2VLZXkoa2V5Q29kZSkge1xuICAgIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlS2V5KGtleUNvZGVzW2ldKTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBrZXlOYW1lcyAgICAgICAgID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICAgIGNvbnN0IGtpbGxLZXlDb2RlSW5kZXggPSB0aGlzLl9raWxsS2V5Q29kZXMuaW5kZXhPZihrZXlDb2RlKTtcblxuICAgICAgaWYgKGtpbGxLZXlDb2RlSW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSk7XG4gICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5fY2xlYXJNYWNyb3MoKTtcbiAgICB9XG4gIH07XG5cbiAgX2FwcGx5TWFjcm9zKCkge1xuICAgIGNvbnN0IG1hY3JvcyA9IHRoaXMuX21hY3Jvcy5zbGljZSgwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgbWFjcm8gPSBtYWNyb3NbaV07XG4gICAgICBpZiAobWFjcm8ua2V5Q29tYm8uY2hlY2sodGhpcy5wcmVzc2VkS2V5cykpIHtcbiAgICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcbiAgICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG1hY3JvLmhhbmRsZXIodGhpcy5wcmVzc2VkS2V5cyk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBtYWNyby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgIGlmICh0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKG1hY3JvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5wdXNoKG1hY3JvKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgX2NsZWFyTWFjcm9zKCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fYXBwbGllZE1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgbWFjcm8gPSB0aGlzLl9hcHBsaWVkTWFjcm9zW2ldO1xuICAgICAgaWYgKCFtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChtYWNyby5oYW5kbGVyKSB7XG4gICAgICAgICAgbWFjcm8ua2V5TmFtZXMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2FwcGxpZWRNYWNyb3Muc3BsaWNlKGksIDEpO1xuICAgICAgICBpIC09IDE7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBMb2NhbGUgfSBmcm9tICcuL2xvY2FsZSc7XG5pbXBvcnQgeyBLZXlDb21ibyB9IGZyb20gJy4va2V5LWNvbWJvJztcblxuXG5leHBvcnQgY2xhc3MgS2V5Ym9hcmQge1xuICBjb25zdHJ1Y3Rvcih0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcbiAgICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgICA9IG51bGw7XG4gICAgdGhpcy5fY3VycmVudENvbnRleHQgICAgICAgPSBudWxsO1xuICAgIHRoaXMuX2NvbnRleHRzICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fbGlzdGVuZXJzICAgICAgICAgICAgPSBbXTtcbiAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzICAgICA9IFtdO1xuICAgIHRoaXMuX2xvY2FsZXMgICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgICAgICAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldFdpbmRvdyAgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgICAgICA9ICcnO1xuICAgIHRoaXMuX3RhcmdldFVzZXJBZ2VudCAgICAgID0gJyc7XG4gICAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyICAgICAgPSBmYWxzZTtcbiAgICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IG51bGw7XG4gICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nICAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyAgID0gbnVsbDtcbiAgICB0aGlzLl9wYXVzZWQgICAgICAgICAgICAgICA9IGZhbHNlO1xuXG4gICAgdGhpcy5zZXRDb250ZXh0KCdnbG9iYWwnKTtcbiAgICB0aGlzLndhdGNoKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgcGxhdGZvcm0sIHVzZXJBZ2VudCk7XG4gIH1cblxuICBzZXRMb2NhbGUobG9jYWxlTmFtZSwgbG9jYWxlQnVpbGRlcikge1xuICAgIGxldCBsb2NhbGUgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgbG9jYWxlTmFtZSA9PT0gJ3N0cmluZycpIHtcblxuICAgICAgaWYgKGxvY2FsZUJ1aWxkZXIpIHtcbiAgICAgICAgbG9jYWxlID0gbmV3IExvY2FsZShsb2NhbGVOYW1lKTtcbiAgICAgICAgbG9jYWxlQnVpbGRlcihsb2NhbGUsIHRoaXMuX3RhcmdldFBsYXRmb3JtLCB0aGlzLl90YXJnZXRVc2VyQWdlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9jYWxlID0gdGhpcy5fbG9jYWxlc1tsb2NhbGVOYW1lXSB8fCBudWxsO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2NhbGUgICAgID0gbG9jYWxlTmFtZTtcbiAgICAgIGxvY2FsZU5hbWUgPSBsb2NhbGUuX2xvY2FsZU5hbWU7XG4gICAgfVxuXG4gICAgdGhpcy5fbG9jYWxlICAgICAgICAgICAgICA9IGxvY2FsZTtcbiAgICB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdID0gbG9jYWxlO1xuICAgIGlmIChsb2NhbGUpIHtcbiAgICAgIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cyA9IGxvY2FsZS5wcmVzc2VkS2V5cztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldExvY2FsZShsb2NhbE5hbWUpIHtcbiAgICBsb2NhbE5hbWUgfHwgKGxvY2FsTmFtZSA9IHRoaXMuX2xvY2FsZS5sb2NhbGVOYW1lKTtcbiAgICByZXR1cm4gdGhpcy5fbG9jYWxlc1tsb2NhbE5hbWVdIHx8IG51bGw7XG4gIH1cblxuICBiaW5kKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XG4gICAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA9IHJlbGVhc2VIYW5kbGVyO1xuICAgICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA9IHByZXNzSGFuZGxlcjtcbiAgICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgPSBrZXlDb21ib1N0cjtcbiAgICAgIGtleUNvbWJvU3RyICAgICAgICAgICAgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIGtleUNvbWJvU3RyICYmXG4gICAgICB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Yga2V5Q29tYm9TdHIubGVuZ3RoID09PSAnbnVtYmVyJ1xuICAgICkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlDb21ib1N0ci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fbGlzdGVuZXJzLnB1c2goe1xuICAgICAga2V5Q29tYm8gICAgICAgICAgICAgICA6IGtleUNvbWJvU3RyID8gbmV3IEtleUNvbWJvKGtleUNvbWJvU3RyKSA6IG51bGwsXG4gICAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgIDogcHJlc3NIYW5kbGVyICAgICAgICAgICB8fCBudWxsLFxuICAgICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA6IHJlbGVhc2VIYW5kbGVyICAgICAgICAgfHwgbnVsbCxcbiAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgOiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlLFxuICAgICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA6IHByZXZlbnRSZXBlYXRCeURlZmF1bHQgfHwgZmFsc2VcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkTGlzdGVuZXIoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KTtcbiAgfVxuXG4gIG9uKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XG4gICAgcmV0dXJuIHRoaXMuYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCk7XG4gIH1cblxuICBiaW5kUHJlc3Moa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCkge1xuICAgIHJldHVybiB0aGlzLmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgbnVsbCwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCk7XG4gIH1cblxuICBiaW5kUmVsZWFzZShrZXlDb21ib1N0ciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kKGtleUNvbWJvU3RyLCBudWxsLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCk7XG4gIH1cblxuICB1bmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZWxlYXNlSGFuZGxlciA9IHByZXNzSGFuZGxlcjtcbiAgICAgIHByZXNzSGFuZGxlciAgID0ga2V5Q29tYm9TdHI7XG4gICAgICBrZXlDb21ib1N0ciA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAga2V5Q29tYm9TdHIgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICAgKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMudW5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tpXTtcblxuICAgICAgY29uc3QgY29tYm9NYXRjaGVzICAgICAgICAgID0gIWtleUNvbWJvU3RyICYmICFsaXN0ZW5lci5rZXlDb21ibyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmtleUNvbWJvICYmIGxpc3RlbmVyLmtleUNvbWJvLmlzRXF1YWwoa2V5Q29tYm9TdHIpO1xuICAgICAgY29uc3QgcHJlc3NIYW5kbGVyTWF0Y2hlcyAgID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmVzc0hhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVzc0hhbmRsZXIgPT09IGxpc3RlbmVyLnByZXNzSGFuZGxlcjtcbiAgICAgIGNvbnN0IHJlbGVhc2VIYW5kbGVyTWF0Y2hlcyA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXJlbGVhc2VIYW5kbGVyICYmICFsaXN0ZW5lci5yZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGVhc2VIYW5kbGVyID09PSBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcjtcblxuICAgICAgaWYgKGNvbWJvTWF0Y2hlcyAmJiBwcmVzc0hhbmRsZXJNYXRjaGVzICYmIHJlbGVhc2VIYW5kbGVyTWF0Y2hlcykge1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICBpIC09IDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZW1vdmVMaXN0ZW5lcihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLnVuYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XG4gIH1cblxuICBvZmYoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy51bmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICB9XG5cbiAgc2V0Q29udGV4dChjb250ZXh0TmFtZSkge1xuICAgIGlmKHRoaXMuX2xvY2FsZSkgeyB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7IH1cblxuICAgIGlmICghdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdKSB7XG4gICAgICB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0gPSBbXTtcbiAgICB9XG4gICAgdGhpcy5fbGlzdGVuZXJzICAgICAgPSB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV07XG4gICAgdGhpcy5fY3VycmVudENvbnRleHQgPSBjb250ZXh0TmFtZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0Q29udGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudENvbnRleHQ7XG4gIH1cblxuICB3aXRoQ29udGV4dChjb250ZXh0TmFtZSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBwcmV2aW91c0NvbnRleHROYW1lID0gdGhpcy5nZXRDb250ZXh0KCk7XG4gICAgdGhpcy5zZXRDb250ZXh0KGNvbnRleHROYW1lKTtcblxuICAgIGNhbGxiYWNrKCk7XG5cbiAgICB0aGlzLnNldENvbnRleHQocHJldmlvdXNDb250ZXh0TmFtZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHdhdGNoKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgdGFyZ2V0UGxhdGZvcm0sIHRhcmdldFVzZXJBZ2VudCkge1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgY29uc3Qgd2luID0gdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsVGhpcyA6XG4gICAgICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgICAgICAgICAgICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDpcbiAgICAgICAgICAgICAgICB7fTtcblxuICAgIGlmICghdGFyZ2V0V2luZG93KSB7XG4gICAgICBpZiAoIXdpbi5hZGRFdmVudExpc3RlbmVyICYmICF3aW4uYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCB3aW5kb3cgZnVuY3Rpb25zIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQuJyk7XG4gICAgICB9XG4gICAgICB0YXJnZXRXaW5kb3cgPSB3aW47XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGVsZW1lbnQgYmluZGluZ3Mgd2hlcmUgYSB0YXJnZXQgd2luZG93IGlzIG5vdCBwYXNzZWRcbiAgICBpZiAodHlwZW9mIHRhcmdldFdpbmRvdy5ub2RlVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRhcmdldFVzZXJBZ2VudCA9IHRhcmdldFBsYXRmb3JtO1xuICAgICAgdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0RWxlbWVudDtcbiAgICAgIHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdztcbiAgICAgIHRhcmdldFdpbmRvdyAgICA9IHdpbjtcbiAgICB9XG5cbiAgICBpZiAoIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyICYmICF0YXJnZXRXaW5kb3cuYXR0YWNoRXZlbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudCBtZXRob2RzIG9uIHRhcmdldFdpbmRvdy4nKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pc01vZGVybkJyb3dzZXIgPSAhIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xuXG4gICAgY29uc3QgdXNlckFnZW50ID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcbiAgICBjb25zdCBwbGF0Zm9ybSAgPSB0YXJnZXRXaW5kb3cubmF2aWdhdG9yICYmIHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IucGxhdGZvcm0gIHx8ICcnO1xuXG4gICAgdGFyZ2V0RWxlbWVudCAgICYmIHRhcmdldEVsZW1lbnQgICAhPT0gbnVsbCB8fCAodGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93LmRvY3VtZW50KTtcbiAgICB0YXJnZXRQbGF0Zm9ybSAgJiYgdGFyZ2V0UGxhdGZvcm0gICE9PSBudWxsIHx8ICh0YXJnZXRQbGF0Zm9ybSAgPSBwbGF0Zm9ybSk7XG4gICAgdGFyZ2V0VXNlckFnZW50ICYmIHRhcmdldFVzZXJBZ2VudCAhPT0gbnVsbCB8fCAodGFyZ2V0VXNlckFnZW50ID0gdXNlckFnZW50KTtcblxuICAgIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnByZXNzS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgICAgIHRoaXMuX2hhbmRsZUNvbW1hbmRCdWcoZXZlbnQsIHBsYXRmb3JtKTtcbiAgICB9O1xuICAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy5yZWxlYXNlS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgICB9O1xuICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy5yZWxlYXNlQWxsS2V5cyhldmVudCk7XG4gICAgfTtcblxuICAgIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xuICAgIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gICAgdGhpcy5fYmluZEV2ZW50KHRhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICAgIHRoaXMuX3RhcmdldEVsZW1lbnQgICA9IHRhcmdldEVsZW1lbnQ7XG4gICAgdGhpcy5fdGFyZ2V0V2luZG93ICAgID0gdGFyZ2V0V2luZG93O1xuICAgIHRoaXMuX3RhcmdldFBsYXRmb3JtICA9IHRhcmdldFBsYXRmb3JtO1xuICAgIHRoaXMuX3RhcmdldFVzZXJBZ2VudCA9IHRhcmdldFVzZXJBZ2VudDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICBpZiAoIXRoaXMuX3RhcmdldEVsZW1lbnQgfHwgIXRoaXMuX3RhcmdldFdpbmRvdykgeyByZXR1cm47IH1cblxuICAgIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXlkb3duJywgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcpO1xuICAgIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcbiAgICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gICAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2JsdXInLCAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuXG4gICAgdGhpcy5fdGFyZ2V0V2luZG93ICA9IG51bGw7XG4gICAgdGhpcy5fdGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByZXNzS2V5KGtleUNvZGUsIGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm4gdGhpczsgfVxuICAgIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gICAgdGhpcy5fbG9jYWxlLnByZXNzS2V5KGtleUNvZGUpO1xuICAgIHRoaXMuX2FwcGx5QmluZGluZ3MoZXZlbnQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZWxlYXNlS2V5KGtleUNvZGUsIGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm4gdGhpczsgfVxuICAgIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gICAgdGhpcy5fbG9jYWxlLnJlbGVhc2VLZXkoa2V5Q29kZSk7XG4gICAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbGVhc2VBbGxLZXlzKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm4gdGhpczsgfVxuICAgIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gICAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHBhdXNlKCkge1xuICAgIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuIHRoaXM7IH1cbiAgICBpZiAodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxuICAgIHRoaXMuX3BhdXNlZCA9IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlc3VtZSgpIHtcbiAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5yZWxlYXNlQWxsS2V5cygpO1xuICAgIHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPSAwO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xuICAgICAgdGFyZ2V0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcbiAgICAgIHRhcmdldEVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICBfdW5iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XG4gICAgICB0YXJnZXRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxuICAgICAgdGFyZ2V0RWxlbWVudC5kZXRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgfVxuXG4gIF9nZXRHcm91cGVkTGlzdGVuZXJzKCkge1xuICAgIGNvbnN0IGxpc3RlbmVyR3JvdXBzICAgPSBbXTtcbiAgICBjb25zdCBsaXN0ZW5lckdyb3VwTWFwID0gW107XG5cbiAgICBsZXQgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuICAgIGlmICh0aGlzLl9jdXJyZW50Q29udGV4dCAhPT0gJ2dsb2JhbCcpIHtcbiAgICAgIGxpc3RlbmVycyA9IFsuLi5saXN0ZW5lcnMsIC4uLnRoaXMuX2NvbnRleHRzLmdsb2JhbF07XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLnNvcnQoXG4gICAgICAoYSwgYikgPT5cbiAgICAgICAgKGIua2V5Q29tYm8gPyBiLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApIC1cbiAgICAgICAgKGEua2V5Q29tYm8gPyBhLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApXG4gICAgKS5mb3JFYWNoKChsKSA9PiB7XG4gICAgICBsZXQgbWFwSW5kZXggPSAtMTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAobGlzdGVuZXJHcm91cE1hcFtpXSA9PT0gbnVsbCAmJiBsLmtleUNvbWJvID09PSBudWxsIHx8XG4gICAgICAgICAgICBsaXN0ZW5lckdyb3VwTWFwW2ldICE9PSBudWxsICYmIGxpc3RlbmVyR3JvdXBNYXBbaV0uaXNFcXVhbChsLmtleUNvbWJvKSkge1xuICAgICAgICAgIG1hcEluZGV4ID0gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1hcEluZGV4ID09PSAtMSkge1xuICAgICAgICBtYXBJbmRleCA9IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoO1xuICAgICAgICBsaXN0ZW5lckdyb3VwTWFwLnB1c2gobC5rZXlDb21ibyk7XG4gICAgICB9XG4gICAgICBpZiAoIWxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSkge1xuICAgICAgICBsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XS5wdXNoKGwpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGxpc3RlbmVyR3JvdXBzO1xuICB9XG5cbiAgX2FwcGx5QmluZGluZ3MoZXZlbnQpIHtcbiAgICBsZXQgcHJldmVudFJlcGVhdCA9IGZhbHNlO1xuXG4gICAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xuICAgIGV2ZW50LnByZXZlbnRSZXBlYXQgPSAoKSA9PiB7IHByZXZlbnRSZXBlYXQgPSB0cnVlOyB9O1xuICAgIGV2ZW50LnByZXNzZWRLZXlzICAgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG5cbiAgICBjb25zdCBwcmVzc2VkS2V5cyAgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcbiAgICBjb25zdCBsaXN0ZW5lckdyb3VwcyA9IHRoaXMuX2dldEdyb3VwZWRMaXN0ZW5lcnMoKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IGxpc3RlbmVyR3JvdXBzW2ldO1xuICAgICAgY29uc3Qga2V5Q29tYm8gID0gbGlzdGVuZXJzWzBdLmtleUNvbWJvO1xuXG4gICAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwga2V5Q29tYm8uY2hlY2socHJlc3NlZEtleXMpKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbGlzdGVuZXJzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgbGV0IGxpc3RlbmVyID0gbGlzdGVuZXJzW2pdO1xuXG4gICAgICAgICAgaWYgKGxpc3RlbmVyLnByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJldmVudFJlcGVhdCkge1xuICAgICAgICAgICAgbGlzdGVuZXIucHJlc3NIYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgICAgaWYgKHByZXZlbnRSZXBlYXQgfHwgbGlzdGVuZXIucHJldmVudFJlcGVhdEJ5RGVmYXVsdCkge1xuICAgICAgICAgICAgICBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5Q29tYm8pIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGtleUNvbWJvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHByZXNzZWRLZXlzLmluZGV4T2Yoa2V5Q29tYm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICBwcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICBqIC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyQmluZGluZ3MoZXZlbnQpIHtcbiAgICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG4gICAgZXZlbnQucHJlc3NlZEtleXMgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5fYXBwbGllZExpc3RlbmVyc1tpXTtcbiAgICAgIGNvbnN0IGtleUNvbWJvID0gbGlzdGVuZXIua2V5Q29tYm87XG4gICAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwgIWtleUNvbWJvLmNoZWNrKHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cykpIHtcbiAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IGZhbHNlO1xuICAgICAgICBpZiAoa2V5Q29tYm8gIT09IG51bGwgfHwgZXZlbnQucHJlc3NlZEtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcikge1xuICAgICAgICAgIGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUNvbW1hbmRCdWcoZXZlbnQsIHBsYXRmb3JtKSB7XG4gICAgLy8gT24gTWFjIHdoZW4gdGhlIGNvbW1hbmQga2V5IGlzIGtlcHQgcHJlc3NlZCwga2V5dXAgaXMgbm90IHRyaWdnZXJlZCBmb3IgYW55IG90aGVyIGtleS5cbiAgICAvLyBJbiB0aGlzIGNhc2UgZm9yY2UgYSBrZXl1cCBmb3Igbm9uLW1vZGlmaWVyIGtleXMgZGlyZWN0bHkgYWZ0ZXIgdGhlIGtleXByZXNzLlxuICAgIGNvbnN0IG1vZGlmaWVyS2V5cyA9IFtcInNoaWZ0XCIsIFwiY3RybFwiLCBcImFsdFwiLCBcImNhcHNsb2NrXCIsIFwidGFiXCIsIFwiY29tbWFuZFwiXTtcbiAgICBpZiAocGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgJiYgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLmluY2x1ZGVzKFwiY29tbWFuZFwiKSAmJlxuICAgICAgICAhbW9kaWZpZXJLZXlzLmluY2x1ZGVzKHRoaXMuX2xvY2FsZS5nZXRLZXlOYW1lcyhldmVudC5rZXlDb2RlKVswXSkpIHtcbiAgICAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyhldmVudCk7XG4gICAgfVxuICB9XG59XG4iLCJcbmV4cG9ydCBmdW5jdGlvbiB1cyhsb2NhbGUsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcblxuICAvLyBnZW5lcmFsXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzLCAgIFsnY2FuY2VsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOCwgICBbJ2JhY2tzcGFjZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDksICAgWyd0YWInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMiwgIFsnY2xlYXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMywgIFsnZW50ZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNiwgIFsnc2hpZnQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNywgIFsnY3RybCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4LCAgWydhbHQnLCAnbWVudSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5LCAgWydwYXVzZScsICdicmVhayddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIwLCAgWydjYXBzbG9jayddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDI3LCAgWydlc2NhcGUnLCAnZXNjJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzIsICBbJ3NwYWNlJywgJ3NwYWNlYmFyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzMsICBbJ3BhZ2V1cCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM0LCAgWydwYWdlZG93biddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM1LCAgWydlbmQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNiwgIFsnaG9tZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM3LCAgWydsZWZ0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzgsICBbJ3VwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzksICBbJ3JpZ2h0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDAsICBbJ2Rvd24nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MSwgIFsnc2VsZWN0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDIsICBbJ3ByaW50c2NyZWVuJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDMsICBbJ2V4ZWN1dGUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NCwgIFsnc25hcHNob3QnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NSwgIFsnaW5zZXJ0JywgJ2lucyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ2LCAgWydkZWxldGUnLCAnZGVsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDcsICBbJ2hlbHAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNDUsIFsnc2Nyb2xsbG9jaycsICdzY3JvbGwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxODgsIFsnY29tbWEnLCAnLCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MCwgWydwZXJpb2QnLCAnLiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MSwgWydzbGFzaCcsICdmb3J3YXJkc2xhc2gnLCAnLyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MiwgWydncmF2ZWFjY2VudCcsICdgJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjE5LCBbJ29wZW5icmFja2V0JywgJ1snXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjAsIFsnYmFja3NsYXNoJywgJ1xcXFwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjEsIFsnY2xvc2VicmFja2V0JywgJ10nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjIsIFsnYXBvc3Ryb3BoZScsICdcXCcnXSk7XG5cbiAgLy8gMC05XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OCwgWyd6ZXJvJywgJzAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OSwgWydvbmUnLCAnMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUwLCBbJ3R3bycsICcyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTEsIFsndGhyZWUnLCAnMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUyLCBbJ2ZvdXInLCAnNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUzLCBbJ2ZpdmUnLCAnNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU0LCBbJ3NpeCcsICc2J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTUsIFsnc2V2ZW4nLCAnNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU2LCBbJ2VpZ2h0JywgJzgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NywgWyduaW5lJywgJzknXSk7XG5cbiAgLy8gbnVtcGFkXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NiwgWydudW16ZXJvJywgJ251bTAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NywgWydudW1vbmUnLCAnbnVtMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk4LCBbJ251bXR3bycsICdudW0yJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTksIFsnbnVtdGhyZWUnLCAnbnVtMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMCwgWydudW1mb3VyJywgJ251bTQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDEsIFsnbnVtZml2ZScsICdudW01J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAyLCBbJ251bXNpeCcsICdudW02J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAzLCBbJ251bXNldmVuJywgJ251bTcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDQsIFsnbnVtZWlnaHQnLCAnbnVtOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNSwgWydudW1uaW5lJywgJ251bTknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDYsIFsnbnVtbXVsdGlwbHknLCAnbnVtKiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNywgWydudW1hZGQnLCAnbnVtKyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOCwgWydudW1lbnRlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOSwgWydudW1zdWJ0cmFjdCcsICdudW0tJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEwLCBbJ251bWRlY2ltYWwnLCAnbnVtLiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMSwgWydudW1kaXZpZGUnLCAnbnVtLyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE0NCwgWydudW1sb2NrJywgJ251bSddKTtcblxuICAvLyBmdW5jdGlvbiBrZXlzXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTIsIFsnZjEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTMsIFsnZjInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTQsIFsnZjMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTUsIFsnZjQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTYsIFsnZjUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTcsIFsnZjYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTgsIFsnZjcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTksIFsnZjgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjAsIFsnZjknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjEsIFsnZjEwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIyLCBbJ2YxMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMywgWydmMTInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjQsIFsnZjEzJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI1LCBbJ2YxNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyNiwgWydmMTUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjcsIFsnZjE2J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI4LCBbJ2YxNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyOSwgWydmMTgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzAsIFsnZjE5J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMxLCBbJ2YyMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzMiwgWydmMjEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzMsIFsnZjIyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTM0LCBbJ2YyMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzNSwgWydmMjQnXSk7XG5cbiAgLy8gc2Vjb25kYXJ5IGtleSBzeW1ib2xzXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgYCcsIFsndGlsZGUnLCAnfiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAxJywgWydleGNsYW1hdGlvbicsICdleGNsYW1hdGlvbnBvaW50JywgJyEnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMicsIFsnYXQnLCAnQCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAzJywgWydudW1iZXInLCAnIyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA0JywgWydkb2xsYXInLCAnZG9sbGFycycsICdkb2xsYXJzaWduJywgJyQnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNScsIFsncGVyY2VudCcsICclJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDYnLCBbJ2NhcmV0JywgJ14nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNycsIFsnYW1wZXJzYW5kJywgJ2FuZCcsICcmJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDgnLCBbJ2FzdGVyaXNrJywgJyonXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOScsIFsnb3BlbnBhcmVuJywgJygnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMCcsIFsnY2xvc2VwYXJlbicsICcpJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC0nLCBbJ3VuZGVyc2NvcmUnLCAnXyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA9JywgWydwbHVzJywgJysnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgWycsIFsnb3BlbmN1cmx5YnJhY2UnLCAnb3BlbmN1cmx5YnJhY2tldCcsICd7J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIF0nLCBbJ2Nsb3NlY3VybHlicmFjZScsICdjbG9zZWN1cmx5YnJhY2tldCcsICd9J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFxcXFwnLCBbJ3ZlcnRpY2FsYmFyJywgJ3wnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOycsIFsnY29sb24nLCAnOiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBcXCcnLCBbJ3F1b3RhdGlvbm1hcmsnLCAnXFwnJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArICEsJywgWydvcGVuYW5nbGVicmFja2V0JywgJzwnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLicsIFsnY2xvc2VhbmdsZWJyYWNrZXQnLCAnPiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAvJywgWydxdWVzdGlvbm1hcmsnLCAnPyddKTtcblxuICBpZiAocGxhdGZvcm0ubWF0Y2goJ01hYycpKSB7XG4gICAgbG9jYWxlLmJpbmRNYWNybygnY29tbWFuZCcsIFsnbW9kJywgJ21vZGlmaWVyJ10pO1xuICB9IGVsc2Uge1xuICAgIGxvY2FsZS5iaW5kTWFjcm8oJ2N0cmwnLCBbJ21vZCcsICdtb2RpZmllciddKTtcbiAgfVxuXG4gIC8vYS16IGFuZCBBLVpcbiAgZm9yIChsZXQga2V5Q29kZSA9IDY1OyBrZXlDb2RlIDw9IDkwOyBrZXlDb2RlICs9IDEpIHtcbiAgICB2YXIga2V5TmFtZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5Q29kZSArIDMyKTtcbiAgICB2YXIgY2FwaXRhbEtleU5hbWUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleUNvZGUpO1xuICBcdGxvY2FsZS5iaW5kS2V5Q29kZShrZXlDb2RlLCBrZXlOYW1lKTtcbiAgXHRsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArICcgKyBrZXlOYW1lLCBjYXBpdGFsS2V5TmFtZSk7XG4gIFx0bG9jYWxlLmJpbmRNYWNybygnY2Fwc2xvY2sgKyAnICsga2V5TmFtZSwgY2FwaXRhbEtleU5hbWUpO1xuICB9XG5cbiAgLy8gYnJvd3NlciBjYXZlYXRzXG4gIGNvbnN0IHNlbWljb2xvbktleUNvZGUgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDU5ICA6IDE4NjtcbiAgY29uc3QgZGFzaEtleUNvZGUgICAgICA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gMTczIDogMTg5O1xuICBjb25zdCBlcXVhbEtleUNvZGUgICAgID0gdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykgPyA2MSAgOiAxODc7XG4gIGxldCBsZWZ0Q29tbWFuZEtleUNvZGU7XG4gIGxldCByaWdodENvbW1hbmRLZXlDb2RlO1xuICBpZiAocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmICh1c2VyQWdlbnQubWF0Y2goJ1NhZmFyaScpIHx8IHVzZXJBZ2VudC5tYXRjaCgnQ2hyb21lJykpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDkxO1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSA5MztcbiAgfSBlbHNlIGlmKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiB1c2VyQWdlbnQubWF0Y2goJ09wZXJhJykpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gMTc7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDE3O1xuICB9IGVsc2UgaWYocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmIHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDIyNDtcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gMjI0O1xuICB9XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShzZW1pY29sb25LZXlDb2RlLCAgICBbJ3NlbWljb2xvbicsICc7J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoZGFzaEtleUNvZGUsICAgICAgICAgWydkYXNoJywgJy0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShlcXVhbEtleUNvZGUsICAgICAgICBbJ2VxdWFsJywgJ2VxdWFsc2lnbicsICc9J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUobGVmdENvbW1hbmRLZXlDb2RlLCAgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ2xlZnRjb21tYW5kJywgJ2xlZnR3aW5kb3dzJywgJ2xlZnR3aW4nLCAnbGVmdHN1cGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUocmlnaHRDb21tYW5kS2V5Q29kZSwgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ3JpZ2h0Y29tbWFuZCcsICdyaWdodHdpbmRvd3MnLCAncmlnaHR3aW4nLCAncmlnaHRzdXBlciddKTtcblxuICAvLyBraWxsIGtleXNcbiAgbG9jYWxlLnNldEtpbGxLZXkoJ2NvbW1hbmQnKTtcbn07XG4iLCJpbXBvcnQgeyBLZXlib2FyZCB9IGZyb20gJy4vbGliL2tleWJvYXJkJztcbmltcG9ydCB7IExvY2FsZSB9IGZyb20gJy4vbGliL2xvY2FsZSc7XG5pbXBvcnQgeyBLZXlDb21ibyB9IGZyb20gJy4vbGliL2tleS1jb21ibyc7XG5pbXBvcnQgeyB1cyB9IGZyb20gJy4vbG9jYWxlcy91cyc7XG5cbmNvbnN0IGtleWJvYXJkID0gbmV3IEtleWJvYXJkKCk7XG5cbmtleWJvYXJkLnNldExvY2FsZSgndXMnLCB1cyk7XG5cbmtleWJvYXJkLktleWJvYXJkID0gS2V5Ym9hcmQ7XG5rZXlib2FyZC5Mb2NhbGUgPSBMb2NhbGU7XG5rZXlib2FyZC5LZXlDb21ibyA9IEtleUNvbWJvO1xuXG5leHBvcnQgZGVmYXVsdCBrZXlib2FyZDtcbiJdLCJuYW1lcyI6WyJLZXlDb21ibyIsImtleUNvbWJvU3RyIiwic291cmNlU3RyIiwic3ViQ29tYm9zIiwicGFyc2VDb21ib1N0ciIsImtleU5hbWVzIiwicmVkdWNlIiwibWVtbyIsIm5leHRTdWJDb21ibyIsImNvbmNhdCIsInByZXNzZWRLZXlOYW1lcyIsInN0YXJ0aW5nS2V5TmFtZUluZGV4IiwiaSIsImxlbmd0aCIsIl9jaGVja1N1YkNvbWJvIiwib3RoZXJLZXlDb21ibyIsInN1YkNvbWJvIiwib3RoZXJTdWJDb21ibyIsInNsaWNlIiwiaiIsImtleU5hbWUiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJlbmRJbmRleCIsImVzY2FwZWRLZXlOYW1lIiwiY29tYm9EZWxpbWluYXRvciIsImtleURlbGltaW5hdG9yIiwic3ViQ29tYm9TdHJzIiwiX3NwbGl0U3RyIiwiY29tYm8iLCJwdXNoIiwic3RyIiwiZGVsaW1pbmF0b3IiLCJzIiwiZCIsImMiLCJjYSIsImNpIiwidHJpbSIsIkxvY2FsZSIsIm5hbWUiLCJsb2NhbGVOYW1lIiwicHJlc3NlZEtleXMiLCJfYXBwbGllZE1hY3JvcyIsIl9rZXlNYXAiLCJfa2lsbEtleUNvZGVzIiwiX21hY3JvcyIsImtleUNvZGUiLCJoYW5kbGVyIiwibWFjcm8iLCJrZXlDb21ibyIsImtleUNvZGVzIiwiZ2V0S2V5Q29kZXMiLCJzZXRLaWxsS2V5IiwicHJlc3NLZXkiLCJnZXRLZXlOYW1lcyIsIl9hcHBseU1hY3JvcyIsInJlbGVhc2VLZXkiLCJraWxsS2V5Q29kZUluZGV4IiwiX2NsZWFyTWFjcm9zIiwibWFjcm9zIiwiY2hlY2siLCJLZXlib2FyZCIsInRhcmdldFdpbmRvdyIsInRhcmdldEVsZW1lbnQiLCJwbGF0Zm9ybSIsInVzZXJBZ2VudCIsIl9sb2NhbGUiLCJfY3VycmVudENvbnRleHQiLCJfY29udGV4dHMiLCJfbGlzdGVuZXJzIiwiX2FwcGxpZWRMaXN0ZW5lcnMiLCJfbG9jYWxlcyIsIl90YXJnZXRFbGVtZW50IiwiX3RhcmdldFdpbmRvdyIsIl90YXJnZXRQbGF0Zm9ybSIsIl90YXJnZXRVc2VyQWdlbnQiLCJfaXNNb2Rlcm5Ccm93c2VyIiwiX3RhcmdldEtleURvd25CaW5kaW5nIiwiX3RhcmdldEtleVVwQmluZGluZyIsIl90YXJnZXRSZXNldEJpbmRpbmciLCJfcGF1c2VkIiwic2V0Q29udGV4dCIsIndhdGNoIiwibG9jYWxlQnVpbGRlciIsImxvY2FsZSIsIl9sb2NhbGVOYW1lIiwibG9jYWxOYW1lIiwicHJlc3NIYW5kbGVyIiwicmVsZWFzZUhhbmRsZXIiLCJwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IiwiYmluZCIsInByZXZlbnRSZXBlYXQiLCJ1bmJpbmQiLCJsaXN0ZW5lciIsImNvbWJvTWF0Y2hlcyIsImlzRXF1YWwiLCJwcmVzc0hhbmRsZXJNYXRjaGVzIiwicmVsZWFzZUhhbmRsZXJNYXRjaGVzIiwiY29udGV4dE5hbWUiLCJyZWxlYXNlQWxsS2V5cyIsImNhbGxiYWNrIiwicHJldmlvdXNDb250ZXh0TmFtZSIsImdldENvbnRleHQiLCJ0YXJnZXRQbGF0Zm9ybSIsInRhcmdldFVzZXJBZ2VudCIsInN0b3AiLCJ3aW4iLCJnbG9iYWxUaGlzIiwiZ2xvYmFsIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImF0dGFjaEV2ZW50IiwiRXJyb3IiLCJub2RlVHlwZSIsIm5hdmlnYXRvciIsImRvY3VtZW50IiwiZXZlbnQiLCJfaGFuZGxlQ29tbWFuZEJ1ZyIsIl9iaW5kRXZlbnQiLCJfdW5iaW5kRXZlbnQiLCJfYXBwbHlCaW5kaW5ncyIsIl9jbGVhckJpbmRpbmdzIiwiZXZlbnROYW1lIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImRldGFjaEV2ZW50IiwibGlzdGVuZXJHcm91cHMiLCJsaXN0ZW5lckdyb3VwTWFwIiwibGlzdGVuZXJzIiwic29ydCIsImEiLCJiIiwiZm9yRWFjaCIsImwiLCJtYXBJbmRleCIsIl9nZXRHcm91cGVkTGlzdGVuZXJzIiwiY2FsbCIsIm1vZGlmaWVyS2V5cyIsIm1hdGNoIiwiaW5jbHVkZXMiLCJ1cyIsImJpbmRLZXlDb2RlIiwiYmluZE1hY3JvIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiY2FwaXRhbEtleU5hbWUiLCJzZW1pY29sb25LZXlDb2RlIiwiZGFzaEtleUNvZGUiLCJlcXVhbEtleUNvZGUiLCJsZWZ0Q29tbWFuZEtleUNvZGUiLCJyaWdodENvbW1hbmRLZXlDb2RlIiwia2V5Ym9hcmQiLCJzZXRMb2NhbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BQ2FBLFFBQWI7RUFDRSxvQkFBWUMsV0FBWixFQUF5QjtFQUFBOztFQUN2QixTQUFLQyxTQUFMLEdBQWlCRCxXQUFqQjtFQUNBLFNBQUtFLFNBQUwsR0FBaUJILFFBQVEsQ0FBQ0ksYUFBVCxDQUF1QkgsV0FBdkIsQ0FBakI7RUFDQSxTQUFLSSxRQUFMLEdBQWlCLEtBQUtGLFNBQUwsQ0FBZUcsTUFBZixDQUFzQixVQUFDQyxJQUFELEVBQU9DLFlBQVA7RUFBQSxhQUNyQ0QsSUFBSSxDQUFDRSxNQUFMLENBQVlELFlBQVosQ0FEcUM7RUFBQSxLQUF0QixFQUNZLEVBRFosQ0FBakI7RUFFRDs7RUFOSDtFQUFBO0VBQUEsMEJBUVFFLGVBUlIsRUFReUI7RUFDckIsVUFBSUMsb0JBQW9CLEdBQUcsQ0FBM0I7O0VBQ0EsV0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLEtBQUtU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
