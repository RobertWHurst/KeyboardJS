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
          preventRepeatByDefault: preventRepeatByDefault || false,
          executingHandler: false
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

              if (!listener.executingHandler && listener.pressHandler && !listener.preventRepeat) {
                listener.executingHandler = true;
                listener.pressHandler.call(this, event);
                listener.executingHandler = false;

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

            if (!listener.executingHandler && listener.releaseHandler) {
              listener.executingHandler = true;
              listener.releaseHandler.call(this, event);
              listener.executingHandler = false;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9rZXktY29tYm8uanMiLCIuLi9saWIvbG9jYWxlLmpzIiwiLi4vbGliL2tleWJvYXJkLmpzIiwiLi4vbG9jYWxlcy91cy5qcyIsIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuZXhwb3J0IGNsYXNzIEtleUNvbWJvIHtcbiAgY29uc3RydWN0b3Ioa2V5Q29tYm9TdHIpIHtcbiAgICB0aGlzLnNvdXJjZVN0ciA9IGtleUNvbWJvU3RyO1xuICAgIHRoaXMuc3ViQ29tYm9zID0gS2V5Q29tYm8ucGFyc2VDb21ib1N0cihrZXlDb21ib1N0cik7XG4gICAgdGhpcy5rZXlOYW1lcyAgPSB0aGlzLnN1YkNvbWJvcy5yZWR1Y2UoKG1lbW8sIG5leHRTdWJDb21ibykgPT5cbiAgICAgIG1lbW8uY29uY2F0KG5leHRTdWJDb21ibyksIFtdKTtcbiAgfVxuXG4gIGNoZWNrKHByZXNzZWRLZXlOYW1lcykge1xuICAgIGxldCBzdGFydGluZ0tleU5hbWVJbmRleCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSB0aGlzLl9jaGVja1N1YkNvbWJvKFxuICAgICAgICB0aGlzLnN1YkNvbWJvc1tpXSxcbiAgICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXgsXG4gICAgICAgIHByZXNzZWRLZXlOYW1lc1xuICAgICAgKTtcbiAgICAgIGlmIChzdGFydGluZ0tleU5hbWVJbmRleCA9PT0gLTEpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIGlzRXF1YWwob3RoZXJLZXlDb21ibykge1xuICAgIGlmIChcbiAgICAgICFvdGhlcktleUNvbWJvIHx8XG4gICAgICB0eXBlb2Ygb3RoZXJLZXlDb21ibyAhPT0gJ3N0cmluZycgJiZcbiAgICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnb2JqZWN0J1xuICAgICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIGlmICh0eXBlb2Ygb3RoZXJLZXlDb21ibyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG90aGVyS2V5Q29tYm8gPSBuZXcgS2V5Q29tYm8ob3RoZXJLZXlDb21ibyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3ViQ29tYm9zLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3MubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmICh0aGlzLnN1YkNvbWJvc1tpXS5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3Qgc3ViQ29tYm8gICAgICA9IHRoaXMuc3ViQ29tYm9zW2ldO1xuICAgICAgY29uc3Qgb3RoZXJTdWJDb21ibyA9IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLnNsaWNlKDApO1xuXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHN1YkNvbWJvLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGNvbnN0IGtleU5hbWUgPSBzdWJDb21ib1tqXTtcbiAgICAgICAgY29uc3QgaW5kZXggICA9IG90aGVyU3ViQ29tYm8uaW5kZXhPZihrZXlOYW1lKTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIG90aGVyU3ViQ29tYm8uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG90aGVyU3ViQ29tYm8ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBfY2hlY2tTdWJDb21ibyhzdWJDb21ibywgc3RhcnRpbmdLZXlOYW1lSW5kZXgsIHByZXNzZWRLZXlOYW1lcykge1xuICAgIHN1YkNvbWJvID0gc3ViQ29tYm8uc2xpY2UoMCk7XG4gICAgcHJlc3NlZEtleU5hbWVzID0gcHJlc3NlZEtleU5hbWVzLnNsaWNlKHN0YXJ0aW5nS2V5TmFtZUluZGV4KTtcblxuICAgIGxldCBlbmRJbmRleCA9IHN0YXJ0aW5nS2V5TmFtZUluZGV4O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3ViQ29tYm8ubGVuZ3RoOyBpICs9IDEpIHtcblxuICAgICAgbGV0IGtleU5hbWUgPSBzdWJDb21ib1tpXTtcbiAgICAgIGlmIChrZXlOYW1lWzBdID09PSAnXFxcXCcpIHtcbiAgICAgICAgY29uc3QgZXNjYXBlZEtleU5hbWUgPSBrZXlOYW1lLnNsaWNlKDEpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgfHxcbiAgICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3JcbiAgICAgICAgKSB7XG4gICAgICAgICAga2V5TmFtZSA9IGVzY2FwZWRLZXlOYW1lO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gcHJlc3NlZEtleU5hbWVzLmluZGV4T2Yoa2V5TmFtZSk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBzdWJDb21iby5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGkgLT0gMTtcbiAgICAgICAgaWYgKGluZGV4ID4gZW5kSW5kZXgpIHtcbiAgICAgICAgICBlbmRJbmRleCA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdWJDb21iby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gZW5kSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xufVxuXG5LZXlDb21iby5jb21ib0RlbGltaW5hdG9yID0gJz4nO1xuS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IgICA9ICcrJztcblxuS2V5Q29tYm8ucGFyc2VDb21ib1N0ciA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyKSB7XG4gIGNvbnN0IHN1YkNvbWJvU3RycyA9IEtleUNvbWJvLl9zcGxpdFN0cihrZXlDb21ib1N0ciwgS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvcik7XG4gIGNvbnN0IGNvbWJvICAgICAgICA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwIDsgaSA8IHN1YkNvbWJvU3Rycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGNvbWJvLnB1c2goS2V5Q29tYm8uX3NwbGl0U3RyKHN1YkNvbWJvU3Ryc1tpXSwgS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IpKTtcbiAgfVxuICByZXR1cm4gY29tYm87XG59XG5cbktleUNvbWJvLl9zcGxpdFN0ciA9IGZ1bmN0aW9uKHN0ciwgZGVsaW1pbmF0b3IpIHtcbiAgY29uc3QgcyAgPSBzdHI7XG4gIGNvbnN0IGQgID0gZGVsaW1pbmF0b3I7XG4gIGxldCBjICA9ICcnO1xuICBjb25zdCBjYSA9IFtdO1xuXG4gIGZvciAobGV0IGNpID0gMDsgY2kgPCBzLmxlbmd0aDsgY2kgKz0gMSkge1xuICAgIGlmIChjaSA+IDAgJiYgc1tjaV0gPT09IGQgJiYgc1tjaSAtIDFdICE9PSAnXFxcXCcpIHtcbiAgICAgIGNhLnB1c2goYy50cmltKCkpO1xuICAgICAgYyA9ICcnO1xuICAgICAgY2kgKz0gMTtcbiAgICB9XG4gICAgYyArPSBzW2NpXTtcbiAgfVxuICBpZiAoYykgeyBjYS5wdXNoKGMudHJpbSgpKTsgfVxuXG4gIHJldHVybiBjYTtcbn07XG4iLCJpbXBvcnQgeyBLZXlDb21ibyB9IGZyb20gJy4va2V5LWNvbWJvJztcblxuXG5leHBvcnQgY2xhc3MgTG9jYWxlIHtcbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHRoaXMubG9jYWxlTmFtZSAgICAgPSBuYW1lO1xuICAgIHRoaXMucHJlc3NlZEtleXMgICAgPSBbXTtcbiAgICB0aGlzLl9hcHBsaWVkTWFjcm9zID0gW107XG4gICAgdGhpcy5fa2V5TWFwICAgICAgICA9IHt9O1xuICAgIHRoaXMuX2tpbGxLZXlDb2RlcyAgPSBbXTtcbiAgICB0aGlzLl9tYWNyb3MgICAgICAgID0gW107XG4gIH1cblxuICBiaW5kS2V5Q29kZShrZXlDb2RlLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFtrZXlOYW1lc107XG4gICAgfVxuXG4gICAgdGhpcy5fa2V5TWFwW2tleUNvZGVdID0ga2V5TmFtZXM7XG4gIH07XG5cbiAgYmluZE1hY3JvKGtleUNvbWJvU3RyLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFsga2V5TmFtZXMgXTtcbiAgICB9XG5cbiAgICBsZXQgaGFuZGxlciA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaGFuZGxlciA9IGtleU5hbWVzO1xuICAgICAga2V5TmFtZXMgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1hY3JvID0ge1xuICAgICAga2V5Q29tYm8gOiBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpLFxuICAgICAga2V5TmFtZXMgOiBrZXlOYW1lcyxcbiAgICAgIGhhbmRsZXIgIDogaGFuZGxlclxuICAgIH07XG5cbiAgICB0aGlzLl9tYWNyb3MucHVzaChtYWNybyk7XG4gIH07XG5cbiAgZ2V0S2V5Q29kZXMoa2V5TmFtZSkge1xuICAgIGNvbnN0IGtleUNvZGVzID0gW107XG4gICAgZm9yIChjb25zdCBrZXlDb2RlIGluIHRoaXMuX2tleU1hcCkge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9rZXlNYXBba2V5Q29kZV0uaW5kZXhPZihrZXlOYW1lKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7IGtleUNvZGVzLnB1c2goa2V5Q29kZXwwKTsgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5Q29kZXM7XG4gIH07XG5cbiAgZ2V0S2V5TmFtZXMoa2V5Q29kZSkge1xuICAgIHJldHVybiB0aGlzLl9rZXlNYXBba2V5Q29kZV0gfHwgW107XG4gIH07XG5cbiAgc2V0S2lsbEtleShrZXlDb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3Qga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLnNldEtpbGxLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2tpbGxLZXlDb2Rlcy5wdXNoKGtleUNvZGUpO1xuICB9O1xuXG4gIHByZXNzS2V5KGtleUNvZGUpIHtcbiAgICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMucHJlc3NLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGtleU5hbWVzID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKGtleU5hbWVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9hcHBseU1hY3JvcygpO1xuICB9O1xuXG4gIHJlbGVhc2VLZXkoa2V5Q29kZSkge1xuICAgIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlS2V5KGtleUNvZGVzW2ldKTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBrZXlOYW1lcyAgICAgICAgID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICAgIGNvbnN0IGtpbGxLZXlDb2RlSW5kZXggPSB0aGlzLl9raWxsS2V5Q29kZXMuaW5kZXhPZihrZXlDb2RlKTtcblxuICAgICAgaWYgKGtpbGxLZXlDb2RlSW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSk7XG4gICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5fY2xlYXJNYWNyb3MoKTtcbiAgICB9XG4gIH07XG5cbiAgX2FwcGx5TWFjcm9zKCkge1xuICAgIGNvbnN0IG1hY3JvcyA9IHRoaXMuX21hY3Jvcy5zbGljZSgwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgbWFjcm8gPSBtYWNyb3NbaV07XG4gICAgICBpZiAobWFjcm8ua2V5Q29tYm8uY2hlY2sodGhpcy5wcmVzc2VkS2V5cykpIHtcbiAgICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcbiAgICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG1hY3JvLmhhbmRsZXIodGhpcy5wcmVzc2VkS2V5cyk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBtYWNyby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgIGlmICh0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKG1hY3JvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5wdXNoKG1hY3JvKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgX2NsZWFyTWFjcm9zKCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fYXBwbGllZE1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgbWFjcm8gPSB0aGlzLl9hcHBsaWVkTWFjcm9zW2ldO1xuICAgICAgaWYgKCFtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChtYWNyby5oYW5kbGVyKSB7XG4gICAgICAgICAgbWFjcm8ua2V5TmFtZXMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2FwcGxpZWRNYWNyb3Muc3BsaWNlKGksIDEpO1xuICAgICAgICBpIC09IDE7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBMb2NhbGUgfSBmcm9tICcuL2xvY2FsZSc7XG5pbXBvcnQgeyBLZXlDb21ibyB9IGZyb20gJy4va2V5LWNvbWJvJztcblxuXG5leHBvcnQgY2xhc3MgS2V5Ym9hcmQge1xuICBjb25zdHJ1Y3Rvcih0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcbiAgICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgICA9IG51bGw7XG4gICAgdGhpcy5fY3VycmVudENvbnRleHQgICAgICAgPSBudWxsO1xuICAgIHRoaXMuX2NvbnRleHRzICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fbGlzdGVuZXJzICAgICAgICAgICAgPSBbXTtcbiAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzICAgICA9IFtdO1xuICAgIHRoaXMuX2xvY2FsZXMgICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgICAgICAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldFdpbmRvdyAgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgICAgICA9ICcnO1xuICAgIHRoaXMuX3RhcmdldFVzZXJBZ2VudCAgICAgID0gJyc7XG4gICAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyICAgICAgPSBmYWxzZTtcbiAgICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IG51bGw7XG4gICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nICAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyAgID0gbnVsbDtcbiAgICB0aGlzLl9wYXVzZWQgICAgICAgICAgICAgICA9IGZhbHNlO1xuXG4gICAgdGhpcy5zZXRDb250ZXh0KCdnbG9iYWwnKTtcbiAgICB0aGlzLndhdGNoKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgcGxhdGZvcm0sIHVzZXJBZ2VudCk7XG4gIH1cblxuICBzZXRMb2NhbGUobG9jYWxlTmFtZSwgbG9jYWxlQnVpbGRlcikge1xuICAgIGxldCBsb2NhbGUgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgbG9jYWxlTmFtZSA9PT0gJ3N0cmluZycpIHtcblxuICAgICAgaWYgKGxvY2FsZUJ1aWxkZXIpIHtcbiAgICAgICAgbG9jYWxlID0gbmV3IExvY2FsZShsb2NhbGVOYW1lKTtcbiAgICAgICAgbG9jYWxlQnVpbGRlcihsb2NhbGUsIHRoaXMuX3RhcmdldFBsYXRmb3JtLCB0aGlzLl90YXJnZXRVc2VyQWdlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9jYWxlID0gdGhpcy5fbG9jYWxlc1tsb2NhbGVOYW1lXSB8fCBudWxsO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2NhbGUgICAgID0gbG9jYWxlTmFtZTtcbiAgICAgIGxvY2FsZU5hbWUgPSBsb2NhbGUuX2xvY2FsZU5hbWU7XG4gICAgfVxuXG4gICAgdGhpcy5fbG9jYWxlICAgICAgICAgICAgICA9IGxvY2FsZTtcbiAgICB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdID0gbG9jYWxlO1xuICAgIGlmIChsb2NhbGUpIHtcbiAgICAgIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cyA9IGxvY2FsZS5wcmVzc2VkS2V5cztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldExvY2FsZShsb2NhbE5hbWUpIHtcbiAgICBsb2NhbE5hbWUgfHwgKGxvY2FsTmFtZSA9IHRoaXMuX2xvY2FsZS5sb2NhbGVOYW1lKTtcbiAgICByZXR1cm4gdGhpcy5fbG9jYWxlc1tsb2NhbE5hbWVdIHx8IG51bGw7XG4gIH1cblxuICBiaW5kKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XG4gICAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA9IHJlbGVhc2VIYW5kbGVyO1xuICAgICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA9IHByZXNzSGFuZGxlcjtcbiAgICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgPSBrZXlDb21ib1N0cjtcbiAgICAgIGtleUNvbWJvU3RyICAgICAgICAgICAgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIGtleUNvbWJvU3RyICYmXG4gICAgICB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Yga2V5Q29tYm9TdHIubGVuZ3RoID09PSAnbnVtYmVyJ1xuICAgICkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlDb21ib1N0ci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fbGlzdGVuZXJzLnB1c2goe1xuICAgICAga2V5Q29tYm8gICAgICAgICAgICAgIDoga2V5Q29tYm9TdHIgPyBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpIDogbnVsbCxcbiAgICAgIHByZXNzSGFuZGxlciAgICAgICAgICA6IHByZXNzSGFuZGxlciAgICAgICAgICAgfHwgbnVsbCxcbiAgICAgIHJlbGVhc2VIYW5kbGVyICAgICAgICA6IHJlbGVhc2VIYW5kbGVyICAgICAgICAgfHwgbnVsbCxcbiAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICA6IHByZXZlbnRSZXBlYXRCeURlZmF1bHQgfHwgZmFsc2UsXG4gICAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0OiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlLFxuICAgICAgZXhlY3V0aW5nSGFuZGxlciAgICAgIDogZmFsc2VcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkTGlzdGVuZXIoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KTtcbiAgfVxuXG4gIG9uKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XG4gICAgcmV0dXJuIHRoaXMuYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCk7XG4gIH1cblxuICBiaW5kUHJlc3Moa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCkge1xuICAgIHJldHVybiB0aGlzLmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgbnVsbCwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCk7XG4gIH1cblxuICBiaW5kUmVsZWFzZShrZXlDb21ib1N0ciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kKGtleUNvbWJvU3RyLCBudWxsLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCk7XG4gIH1cblxuICB1bmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZWxlYXNlSGFuZGxlciA9IHByZXNzSGFuZGxlcjtcbiAgICAgIHByZXNzSGFuZGxlciAgID0ga2V5Q29tYm9TdHI7XG4gICAgICBrZXlDb21ib1N0ciA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAga2V5Q29tYm9TdHIgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICAgKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMudW5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tpXTtcblxuICAgICAgY29uc3QgY29tYm9NYXRjaGVzICAgICAgICAgID0gIWtleUNvbWJvU3RyICYmICFsaXN0ZW5lci5rZXlDb21ibyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmtleUNvbWJvICYmIGxpc3RlbmVyLmtleUNvbWJvLmlzRXF1YWwoa2V5Q29tYm9TdHIpO1xuICAgICAgY29uc3QgcHJlc3NIYW5kbGVyTWF0Y2hlcyAgID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmVzc0hhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVzc0hhbmRsZXIgPT09IGxpc3RlbmVyLnByZXNzSGFuZGxlcjtcbiAgICAgIGNvbnN0IHJlbGVhc2VIYW5kbGVyTWF0Y2hlcyA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXJlbGVhc2VIYW5kbGVyICYmICFsaXN0ZW5lci5yZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGVhc2VIYW5kbGVyID09PSBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcjtcblxuICAgICAgaWYgKGNvbWJvTWF0Y2hlcyAmJiBwcmVzc0hhbmRsZXJNYXRjaGVzICYmIHJlbGVhc2VIYW5kbGVyTWF0Y2hlcykge1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICBpIC09IDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZW1vdmVMaXN0ZW5lcihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLnVuYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XG4gIH1cblxuICBvZmYoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy51bmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICB9XG5cbiAgc2V0Q29udGV4dChjb250ZXh0TmFtZSkge1xuICAgIGlmKHRoaXMuX2xvY2FsZSkgeyB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7IH1cblxuICAgIGlmICghdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdKSB7XG4gICAgICB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0gPSBbXTtcbiAgICB9XG4gICAgdGhpcy5fbGlzdGVuZXJzICAgICAgPSB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV07XG4gICAgdGhpcy5fY3VycmVudENvbnRleHQgPSBjb250ZXh0TmFtZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0Q29udGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudENvbnRleHQ7XG4gIH1cblxuICB3aXRoQ29udGV4dChjb250ZXh0TmFtZSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBwcmV2aW91c0NvbnRleHROYW1lID0gdGhpcy5nZXRDb250ZXh0KCk7XG4gICAgdGhpcy5zZXRDb250ZXh0KGNvbnRleHROYW1lKTtcblxuICAgIGNhbGxiYWNrKCk7XG5cbiAgICB0aGlzLnNldENvbnRleHQocHJldmlvdXNDb250ZXh0TmFtZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHdhdGNoKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgdGFyZ2V0UGxhdGZvcm0sIHRhcmdldFVzZXJBZ2VudCkge1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgY29uc3Qgd2luID0gdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsVGhpcyA6XG4gICAgICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgICAgICAgICAgICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDpcbiAgICAgICAgICAgICAgICB7fTtcblxuICAgIGlmICghdGFyZ2V0V2luZG93KSB7XG4gICAgICBpZiAoIXdpbi5hZGRFdmVudExpc3RlbmVyICYmICF3aW4uYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCB3aW5kb3cgZnVuY3Rpb25zIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQuJyk7XG4gICAgICB9XG4gICAgICB0YXJnZXRXaW5kb3cgPSB3aW47XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGVsZW1lbnQgYmluZGluZ3Mgd2hlcmUgYSB0YXJnZXQgd2luZG93IGlzIG5vdCBwYXNzZWRcbiAgICBpZiAodHlwZW9mIHRhcmdldFdpbmRvdy5ub2RlVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRhcmdldFVzZXJBZ2VudCA9IHRhcmdldFBsYXRmb3JtO1xuICAgICAgdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0RWxlbWVudDtcbiAgICAgIHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdztcbiAgICAgIHRhcmdldFdpbmRvdyAgICA9IHdpbjtcbiAgICB9XG5cbiAgICBpZiAoIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyICYmICF0YXJnZXRXaW5kb3cuYXR0YWNoRXZlbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudCBtZXRob2RzIG9uIHRhcmdldFdpbmRvdy4nKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pc01vZGVybkJyb3dzZXIgPSAhIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xuXG4gICAgY29uc3QgdXNlckFnZW50ID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcbiAgICBjb25zdCBwbGF0Zm9ybSAgPSB0YXJnZXRXaW5kb3cubmF2aWdhdG9yICYmIHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IucGxhdGZvcm0gIHx8ICcnO1xuXG4gICAgdGFyZ2V0RWxlbWVudCAgICYmIHRhcmdldEVsZW1lbnQgICAhPT0gbnVsbCB8fCAodGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93LmRvY3VtZW50KTtcbiAgICB0YXJnZXRQbGF0Zm9ybSAgJiYgdGFyZ2V0UGxhdGZvcm0gICE9PSBudWxsIHx8ICh0YXJnZXRQbGF0Zm9ybSAgPSBwbGF0Zm9ybSk7XG4gICAgdGFyZ2V0VXNlckFnZW50ICYmIHRhcmdldFVzZXJBZ2VudCAhPT0gbnVsbCB8fCAodGFyZ2V0VXNlckFnZW50ID0gdXNlckFnZW50KTtcblxuICAgIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnByZXNzS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgICAgIHRoaXMuX2hhbmRsZUNvbW1hbmRCdWcoZXZlbnQsIHBsYXRmb3JtKTtcbiAgICB9O1xuICAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy5yZWxlYXNlS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgICB9O1xuICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy5yZWxlYXNlQWxsS2V5cyhldmVudCk7XG4gICAgfTtcblxuICAgIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xuICAgIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gICAgdGhpcy5fYmluZEV2ZW50KHRhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICAgIHRoaXMuX3RhcmdldEVsZW1lbnQgICA9IHRhcmdldEVsZW1lbnQ7XG4gICAgdGhpcy5fdGFyZ2V0V2luZG93ICAgID0gdGFyZ2V0V2luZG93O1xuICAgIHRoaXMuX3RhcmdldFBsYXRmb3JtICA9IHRhcmdldFBsYXRmb3JtO1xuICAgIHRoaXMuX3RhcmdldFVzZXJBZ2VudCA9IHRhcmdldFVzZXJBZ2VudDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICBpZiAoIXRoaXMuX3RhcmdldEVsZW1lbnQgfHwgIXRoaXMuX3RhcmdldFdpbmRvdykgeyByZXR1cm47IH1cblxuICAgIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXlkb3duJywgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcpO1xuICAgIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcbiAgICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gICAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2JsdXInLCAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuXG4gICAgdGhpcy5fdGFyZ2V0V2luZG93ICA9IG51bGw7XG4gICAgdGhpcy5fdGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByZXNzS2V5KGtleUNvZGUsIGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm4gdGhpczsgfVxuICAgIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gICAgdGhpcy5fbG9jYWxlLnByZXNzS2V5KGtleUNvZGUpO1xuICAgIHRoaXMuX2FwcGx5QmluZGluZ3MoZXZlbnQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZWxlYXNlS2V5KGtleUNvZGUsIGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm4gdGhpczsgfVxuICAgIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gICAgdGhpcy5fbG9jYWxlLnJlbGVhc2VLZXkoa2V5Q29kZSk7XG4gICAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbGVhc2VBbGxLZXlzKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm4gdGhpczsgfVxuICAgIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gICAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHBhdXNlKCkge1xuICAgIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuIHRoaXM7IH1cbiAgICBpZiAodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxuICAgIHRoaXMuX3BhdXNlZCA9IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlc3VtZSgpIHtcbiAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5yZWxlYXNlQWxsS2V5cygpO1xuICAgIHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPSAwO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xuICAgICAgdGFyZ2V0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcbiAgICAgIHRhcmdldEVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICBfdW5iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XG4gICAgICB0YXJnZXRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxuICAgICAgdGFyZ2V0RWxlbWVudC5kZXRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgfVxuXG4gIF9nZXRHcm91cGVkTGlzdGVuZXJzKCkge1xuICAgIGNvbnN0IGxpc3RlbmVyR3JvdXBzICAgPSBbXTtcbiAgICBjb25zdCBsaXN0ZW5lckdyb3VwTWFwID0gW107XG5cbiAgICBsZXQgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuICAgIGlmICh0aGlzLl9jdXJyZW50Q29udGV4dCAhPT0gJ2dsb2JhbCcpIHtcbiAgICAgIGxpc3RlbmVycyA9IFsuLi5saXN0ZW5lcnMsIC4uLnRoaXMuX2NvbnRleHRzLmdsb2JhbF07XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLnNvcnQoXG4gICAgICAoYSwgYikgPT5cbiAgICAgICAgKGIua2V5Q29tYm8gPyBiLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApIC1cbiAgICAgICAgKGEua2V5Q29tYm8gPyBhLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApXG4gICAgKS5mb3JFYWNoKChsKSA9PiB7XG4gICAgICBsZXQgbWFwSW5kZXggPSAtMTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAobGlzdGVuZXJHcm91cE1hcFtpXSA9PT0gbnVsbCAmJiBsLmtleUNvbWJvID09PSBudWxsIHx8XG4gICAgICAgICAgICBsaXN0ZW5lckdyb3VwTWFwW2ldICE9PSBudWxsICYmIGxpc3RlbmVyR3JvdXBNYXBbaV0uaXNFcXVhbChsLmtleUNvbWJvKSkge1xuICAgICAgICAgIG1hcEluZGV4ID0gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1hcEluZGV4ID09PSAtMSkge1xuICAgICAgICBtYXBJbmRleCA9IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoO1xuICAgICAgICBsaXN0ZW5lckdyb3VwTWFwLnB1c2gobC5rZXlDb21ibyk7XG4gICAgICB9XG4gICAgICBpZiAoIWxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSkge1xuICAgICAgICBsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XS5wdXNoKGwpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGxpc3RlbmVyR3JvdXBzO1xuICB9XG5cbiAgX2FwcGx5QmluZGluZ3MoZXZlbnQpIHtcbiAgICBsZXQgcHJldmVudFJlcGVhdCA9IGZhbHNlO1xuXG4gICAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xuICAgIGV2ZW50LnByZXZlbnRSZXBlYXQgPSAoKSA9PiB7IHByZXZlbnRSZXBlYXQgPSB0cnVlOyB9O1xuICAgIGV2ZW50LnByZXNzZWRLZXlzICAgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG5cbiAgICBjb25zdCBwcmVzc2VkS2V5cyAgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcbiAgICBjb25zdCBsaXN0ZW5lckdyb3VwcyA9IHRoaXMuX2dldEdyb3VwZWRMaXN0ZW5lcnMoKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IGxpc3RlbmVyR3JvdXBzW2ldO1xuICAgICAgY29uc3Qga2V5Q29tYm8gID0gbGlzdGVuZXJzWzBdLmtleUNvbWJvO1xuXG4gICAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwga2V5Q29tYm8uY2hlY2socHJlc3NlZEtleXMpKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbGlzdGVuZXJzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgbGV0IGxpc3RlbmVyID0gbGlzdGVuZXJzW2pdO1xuXG4gICAgICAgICAgaWYgKCFsaXN0ZW5lci5leGVjdXRpbmdIYW5kbGVyICYmIGxpc3RlbmVyLnByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJldmVudFJlcGVhdCkge1xuICAgICAgICAgICAgbGlzdGVuZXIuZXhlY3V0aW5nSGFuZGxlciA9IHRydWU7XG4gICAgICAgICAgICBsaXN0ZW5lci5wcmVzc0hhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgICBsaXN0ZW5lci5leGVjdXRpbmdIYW5kbGVyID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChwcmV2ZW50UmVwZWF0IHx8IGxpc3RlbmVyLnByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgICAgICAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IHRydWU7XG4gICAgICAgICAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5fYXBwbGllZExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtleUNvbWJvKSB7XG4gICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBrZXlDb21iby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBwcmVzc2VkS2V5cy5pbmRleE9mKGtleUNvbWJvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgcHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgaiAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9jbGVhckJpbmRpbmdzKGV2ZW50KSB7XG4gICAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xuICAgIGV2ZW50LnByZXNzZWRLZXlzID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnNbaV07XG4gICAgICBjb25zdCBrZXlDb21ibyA9IGxpc3RlbmVyLmtleUNvbWJvO1xuICAgICAgaWYgKGtleUNvbWJvID09PSBudWxsIHx8ICFrZXlDb21iby5jaGVjayh0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMpKSB7XG4gICAgICAgIGxpc3RlbmVyLnByZXZlbnRSZXBlYXQgPSBmYWxzZTtcbiAgICAgICAgaWYgKGtleUNvbWJvICE9PSBudWxsIHx8IGV2ZW50LnByZXNzZWRLZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWxpc3RlbmVyLmV4ZWN1dGluZ0hhbmRsZXIgJiYgbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIpIHtcbiAgICAgICAgICBsaXN0ZW5lci5leGVjdXRpbmdIYW5kbGVyID0gdHJ1ZTtcbiAgICAgICAgICBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICBsaXN0ZW5lci5leGVjdXRpbmdIYW5kbGVyID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfaGFuZGxlQ29tbWFuZEJ1ZyhldmVudCwgcGxhdGZvcm0pIHtcbiAgICAvLyBPbiBNYWMgd2hlbiB0aGUgY29tbWFuZCBrZXkgaXMga2VwdCBwcmVzc2VkLCBrZXl1cCBpcyBub3QgdHJpZ2dlcmVkIGZvciBhbnkgb3RoZXIga2V5LlxuICAgIC8vIEluIHRoaXMgY2FzZSBmb3JjZSBhIGtleXVwIGZvciBub24tbW9kaWZpZXIga2V5cyBkaXJlY3RseSBhZnRlciB0aGUga2V5cHJlc3MuXG4gICAgY29uc3QgbW9kaWZpZXJLZXlzID0gW1wic2hpZnRcIiwgXCJjdHJsXCIsIFwiYWx0XCIsIFwiY2Fwc2xvY2tcIiwgXCJ0YWJcIiwgXCJjb21tYW5kXCJdO1xuICAgIGlmIChwbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSAmJiB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuaW5jbHVkZXMoXCJjb21tYW5kXCIpICYmXG4gICAgICAgICFtb2RpZmllcktleXMuaW5jbHVkZXModGhpcy5fbG9jYWxlLmdldEtleU5hbWVzKGV2ZW50LmtleUNvZGUpWzBdKSkge1xuICAgICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKGV2ZW50KTtcbiAgICB9XG4gIH1cbn1cbiIsIlxuZXhwb3J0IGZ1bmN0aW9uIHVzKGxvY2FsZSwgcGxhdGZvcm0sIHVzZXJBZ2VudCkge1xuXG4gIC8vIGdlbmVyYWxcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMsICAgWydjYW5jZWwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg4LCAgIFsnYmFja3NwYWNlJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOSwgICBbJ3RhYiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyLCAgWydjbGVhciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzLCAgWydlbnRlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE2LCAgWydzaGlmdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE3LCAgWydjdHJsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTgsICBbJ2FsdCcsICdtZW51J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTksICBbJ3BhdXNlJywgJ2JyZWFrJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjAsICBbJ2NhcHNsb2NrJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjcsICBbJ2VzY2FwZScsICdlc2MnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzMiwgIFsnc3BhY2UnLCAnc3BhY2ViYXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzMywgIFsncGFnZXVwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzQsICBbJ3BhZ2Vkb3duJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzUsICBbJ2VuZCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM2LCAgWydob21lJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzcsICBbJ2xlZnQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzOCwgIFsndXAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzOSwgIFsncmlnaHQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MCwgIFsnZG93biddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQxLCAgWydzZWxlY3QnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MiwgIFsncHJpbnRzY3JlZW4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MywgIFsnZXhlY3V0ZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ0LCAgWydzbmFwc2hvdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ1LCAgWydpbnNlcnQnLCAnaW5zJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDYsICBbJ2RlbGV0ZScsICdkZWwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NywgIFsnaGVscCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE0NSwgWydzY3JvbGxsb2NrJywgJ3Njcm9sbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4OCwgWydjb21tYScsICcsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkwLCBbJ3BlcmlvZCcsICcuJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkxLCBbJ3NsYXNoJywgJ2ZvcndhcmRzbGFzaCcsICcvJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkyLCBbJ2dyYXZlYWNjZW50JywgJ2AnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMTksIFsnb3BlbmJyYWNrZXQnLCAnWyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMCwgWydiYWNrc2xhc2gnLCAnXFxcXCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMSwgWydjbG9zZWJyYWNrZXQnLCAnXSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMiwgWydhcG9zdHJvcGhlJywgJ1xcJyddKTtcblxuICAvLyAwLTlcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ4LCBbJ3plcm8nLCAnMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ5LCBbJ29uZScsICcxJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTAsIFsndHdvJywgJzInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MSwgWyd0aHJlZScsICczJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTIsIFsnZm91cicsICc0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTMsIFsnZml2ZScsICc1J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTQsIFsnc2l4JywgJzYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NSwgWydzZXZlbicsICc3J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTYsIFsnZWlnaHQnLCAnOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU3LCBbJ25pbmUnLCAnOSddKTtcblxuICAvLyBudW1wYWRcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk2LCBbJ251bXplcm8nLCAnbnVtMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk3LCBbJ251bW9uZScsICdudW0xJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTgsIFsnbnVtdHdvJywgJ251bTInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5OSwgWydudW10aHJlZScsICdudW0zJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAwLCBbJ251bWZvdXInLCAnbnVtNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMSwgWydudW1maXZlJywgJ251bTUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDIsIFsnbnVtc2l4JywgJ251bTYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDMsIFsnbnVtc2V2ZW4nLCAnbnVtNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNCwgWydudW1laWdodCcsICdudW04J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA1LCBbJ251bW5pbmUnLCAnbnVtOSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNiwgWydudW1tdWx0aXBseScsICdudW0qJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA3LCBbJ251bWFkZCcsICdudW0rJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA4LCBbJ251bWVudGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA5LCBbJ251bXN1YnRyYWN0JywgJ251bS0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTAsIFsnbnVtZGVjaW1hbCcsICdudW0uJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTExLCBbJ251bWRpdmlkZScsICdudW0vJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTQ0LCBbJ251bWxvY2snLCAnbnVtJ10pO1xuXG4gIC8vIGZ1bmN0aW9uIGtleXNcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMiwgWydmMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMywgWydmMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNCwgWydmMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNSwgWydmNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNiwgWydmNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNywgWydmNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExOCwgWydmNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExOSwgWydmOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMCwgWydmOSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMSwgWydmMTAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjIsIFsnZjExJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIzLCBbJ2YxMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyNCwgWydmMTMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjUsIFsnZjE0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI2LCBbJ2YxNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyNywgWydmMTYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjgsIFsnZjE3J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI5LCBbJ2YxOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzMCwgWydmMTknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzEsIFsnZjIwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMyLCBbJ2YyMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzMywgWydmMjInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzQsIFsnZjIzJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTM1LCBbJ2YyNCddKTtcblxuICAvLyBzZWNvbmRhcnkga2V5IHN5bWJvbHNcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBgJywgWyd0aWxkZScsICd+J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDEnLCBbJ2V4Y2xhbWF0aW9uJywgJ2V4Y2xhbWF0aW9ucG9pbnQnLCAnISddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAyJywgWydhdCcsICdAJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDMnLCBbJ251bWJlcicsICcjJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDQnLCBbJ2RvbGxhcicsICdkb2xsYXJzJywgJ2RvbGxhcnNpZ24nLCAnJCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA1JywgWydwZXJjZW50JywgJyUnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNicsIFsnY2FyZXQnLCAnXiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA3JywgWydhbXBlcnNhbmQnLCAnYW5kJywgJyYnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOCcsIFsnYXN0ZXJpc2snLCAnKiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA5JywgWydvcGVucGFyZW4nLCAnKCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAwJywgWydjbG9zZXBhcmVuJywgJyknXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLScsIFsndW5kZXJzY29yZScsICdfJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArID0nLCBbJ3BsdXMnLCAnKyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBbJywgWydvcGVuY3VybHlicmFjZScsICdvcGVuY3VybHlicmFja2V0JywgJ3snXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXScsIFsnY2xvc2VjdXJseWJyYWNlJywgJ2Nsb3NlY3VybHlicmFja2V0JywgJ30nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXFxcXCcsIFsndmVydGljYWxiYXInLCAnfCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA7JywgWydjb2xvbicsICc6J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFxcJycsIFsncXVvdGF0aW9ubWFyaycsICdcXCcnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgISwnLCBbJ29wZW5hbmdsZWJyYWNrZXQnLCAnPCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAuJywgWydjbG9zZWFuZ2xlYnJhY2tldCcsICc+J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC8nLCBbJ3F1ZXN0aW9ubWFyaycsICc/J10pO1xuXG4gIGlmIChwbGF0Zm9ybS5tYXRjaCgnTWFjJykpIHtcbiAgICBsb2NhbGUuYmluZE1hY3JvKCdjb21tYW5kJywgWydtb2QnLCAnbW9kaWZpZXInXSk7XG4gIH0gZWxzZSB7XG4gICAgbG9jYWxlLmJpbmRNYWNybygnY3RybCcsIFsnbW9kJywgJ21vZGlmaWVyJ10pO1xuICB9XG5cbiAgLy9hLXogYW5kIEEtWlxuICBmb3IgKGxldCBrZXlDb2RlID0gNjU7IGtleUNvZGUgPD0gOTA7IGtleUNvZGUgKz0gMSkge1xuICAgIHZhciBrZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlICsgMzIpO1xuICAgIHZhciBjYXBpdGFsS2V5TmFtZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5Q29kZSk7XG4gIFx0bG9jYWxlLmJpbmRLZXlDb2RlKGtleUNvZGUsIGtleU5hbWUpO1xuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcbiAgXHRsb2NhbGUuYmluZE1hY3JvKCdjYXBzbG9jayArICcgKyBrZXlOYW1lLCBjYXBpdGFsS2V5TmFtZSk7XG4gIH1cblxuICAvLyBicm93c2VyIGNhdmVhdHNcbiAgY29uc3Qgc2VtaWNvbG9uS2V5Q29kZSA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gNTkgIDogMTg2O1xuICBjb25zdCBkYXNoS2V5Q29kZSAgICAgID0gdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykgPyAxNzMgOiAxODk7XG4gIGNvbnN0IGVxdWFsS2V5Q29kZSAgICAgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDYxICA6IDE4NztcbiAgbGV0IGxlZnRDb21tYW5kS2V5Q29kZTtcbiAgbGV0IHJpZ2h0Q29tbWFuZEtleUNvZGU7XG4gIGlmIChwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgKHVzZXJBZ2VudC5tYXRjaCgnU2FmYXJpJykgfHwgdXNlckFnZW50Lm1hdGNoKCdDaHJvbWUnKSkpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gOTE7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDkzO1xuICB9IGVsc2UgaWYocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmIHVzZXJBZ2VudC5tYXRjaCgnT3BlcmEnKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSAxNztcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gMTc7XG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gMjI0O1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSAyMjQ7XG4gIH1cbiAgbG9jYWxlLmJpbmRLZXlDb2RlKHNlbWljb2xvbktleUNvZGUsICAgIFsnc2VtaWNvbG9uJywgJzsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShkYXNoS2V5Q29kZSwgICAgICAgICBbJ2Rhc2gnLCAnLSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGVxdWFsS2V5Q29kZSwgICAgICAgIFsnZXF1YWwnLCAnZXF1YWxzaWduJywgJz0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShsZWZ0Q29tbWFuZEtleUNvZGUsICBbJ2NvbW1hbmQnLCAnd2luZG93cycsICd3aW4nLCAnc3VwZXInLCAnbGVmdGNvbW1hbmQnLCAnbGVmdHdpbmRvd3MnLCAnbGVmdHdpbicsICdsZWZ0c3VwZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShyaWdodENvbW1hbmRLZXlDb2RlLCBbJ2NvbW1hbmQnLCAnd2luZG93cycsICd3aW4nLCAnc3VwZXInLCAncmlnaHRjb21tYW5kJywgJ3JpZ2h0d2luZG93cycsICdyaWdodHdpbicsICdyaWdodHN1cGVyJ10pO1xuXG4gIC8vIGtpbGwga2V5c1xuICBsb2NhbGUuc2V0S2lsbEtleSgnY29tbWFuZCcpO1xufTtcbiIsImltcG9ydCB7IEtleWJvYXJkIH0gZnJvbSAnLi9saWIva2V5Ym9hcmQnO1xuaW1wb3J0IHsgTG9jYWxlIH0gZnJvbSAnLi9saWIvbG9jYWxlJztcbmltcG9ydCB7IEtleUNvbWJvIH0gZnJvbSAnLi9saWIva2V5LWNvbWJvJztcbmltcG9ydCB7IHVzIH0gZnJvbSAnLi9sb2NhbGVzL3VzJztcblxuY29uc3Qga2V5Ym9hcmQgPSBuZXcgS2V5Ym9hcmQoKTtcblxua2V5Ym9hcmQuc2V0TG9jYWxlKCd1cycsIHVzKTtcblxua2V5Ym9hcmQuS2V5Ym9hcmQgPSBLZXlib2FyZDtcbmtleWJvYXJkLkxvY2FsZSA9IExvY2FsZTtcbmtleWJvYXJkLktleUNvbWJvID0gS2V5Q29tYm87XG5cbmV4cG9ydCBkZWZhdWx0IGtleWJvYXJkO1xuIl0sIm5hbWVzIjpbIktleUNvbWJvIiwia2V5Q29tYm9TdHIiLCJzb3VyY2VTdHIiLCJzdWJDb21ib3MiLCJwYXJzZUNvbWJvU3RyIiwia2V5TmFtZXMiLCJyZWR1Y2UiLCJtZW1vIiwibmV4dFN1YkNvbWJvIiwiY29uY2F0IiwicHJlc3NlZEtleU5hbWVzIiwic3RhcnRpbmdLZXlOYW1lSW5kZXgiLCJpIiwibGVuZ3RoIiwiX2NoZWNrU3ViQ29tYm8iLCJvdGhlcktleUNvbWJvIiwic3ViQ29tYm8iLCJvdGhlclN1YkNvbWJvIiwic2xpY2UiLCJqIiwia2V5TmFtZSIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsImVuZEluZGV4IiwiZXNjYXBlZEtleU5hbWUiLCJjb21ib0RlbGltaW5hdG9yIiwia2V5RGVsaW1pbmF0b3IiLCJzdWJDb21ib1N0cnMiLCJfc3BsaXRTdHIiLCJjb21ibyIsInB1c2giLCJzdHIiLCJkZWxpbWluYXRvciIsInMiLCJkIiwiYyIsImNhIiwiY2kiLCJ0cmltIiwiTG9jYWxlIiwibmFtZSIsImxvY2FsZU5hbWUiLCJwcmVzc2VkS2V5cyIsIl9hcHBsaWVkTWFjcm9zIiwiX2tleU1hcCIsIl9raWxsS2V5Q29kZXMiLCJfbWFjcm9zIiwia2V5Q29kZSIsImhhbmRsZXIiLCJtYWNybyIsImtleUNvbWJvIiwia2V5Q29kZXMiLCJnZXRLZXlDb2RlcyIsInNldEtpbGxLZXkiLCJwcmVzc0tleSIsImdldEtleU5hbWVzIiwiX2FwcGx5TWFjcm9zIiwicmVsZWFzZUtleSIsImtpbGxLZXlDb2RlSW5kZXgiLCJfY2xlYXJNYWNyb3MiLCJtYWNyb3MiLCJjaGVjayIsIktleWJvYXJkIiwidGFyZ2V0V2luZG93IiwidGFyZ2V0RWxlbWVudCIsInBsYXRmb3JtIiwidXNlckFnZW50IiwiX2xvY2FsZSIsIl9jdXJyZW50Q29udGV4dCIsIl9jb250ZXh0cyIsIl9saXN0ZW5lcnMiLCJfYXBwbGllZExpc3RlbmVycyIsIl9sb2NhbGVzIiwiX3RhcmdldEVsZW1lbnQiLCJfdGFyZ2V0V2luZG93IiwiX3RhcmdldFBsYXRmb3JtIiwiX3RhcmdldFVzZXJBZ2VudCIsIl9pc01vZGVybkJyb3dzZXIiLCJfdGFyZ2V0S2V5RG93bkJpbmRpbmciLCJfdGFyZ2V0S2V5VXBCaW5kaW5nIiwiX3RhcmdldFJlc2V0QmluZGluZyIsIl9wYXVzZWQiLCJzZXRDb250ZXh0Iiwid2F0Y2giLCJsb2NhbGVCdWlsZGVyIiwibG9jYWxlIiwiX2xvY2FsZU5hbWUiLCJsb2NhbE5hbWUiLCJwcmVzc0hhbmRsZXIiLCJyZWxlYXNlSGFuZGxlciIsInByZXZlbnRSZXBlYXRCeURlZmF1bHQiLCJiaW5kIiwicHJldmVudFJlcGVhdCIsImV4ZWN1dGluZ0hhbmRsZXIiLCJ1bmJpbmQiLCJsaXN0ZW5lciIsImNvbWJvTWF0Y2hlcyIsImlzRXF1YWwiLCJwcmVzc0hhbmRsZXJNYXRjaGVzIiwicmVsZWFzZUhhbmRsZXJNYXRjaGVzIiwiY29udGV4dE5hbWUiLCJyZWxlYXNlQWxsS2V5cyIsImNhbGxiYWNrIiwicHJldmlvdXNDb250ZXh0TmFtZSIsImdldENvbnRleHQiLCJ0YXJnZXRQbGF0Zm9ybSIsInRhcmdldFVzZXJBZ2VudCIsInN0b3AiLCJ3aW4iLCJnbG9iYWxUaGlzIiwiZ2xvYmFsIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImF0dGFjaEV2ZW50IiwiRXJyb3IiLCJub2RlVHlwZSIsIm5hdmlnYXRvciIsImRvY3VtZW50IiwiZXZlbnQiLCJfaGFuZGxlQ29tbWFuZEJ1ZyIsIl9iaW5kRXZlbnQiLCJfdW5iaW5kRXZlbnQiLCJfYXBwbHlCaW5kaW5ncyIsIl9jbGVhckJpbmRpbmdzIiwiZXZlbnROYW1lIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImRldGFjaEV2ZW50IiwibGlzdGVuZXJHcm91cHMiLCJsaXN0ZW5lckdyb3VwTWFwIiwibGlzdGVuZXJzIiwic29ydCIsImEiLCJiIiwiZm9yRWFjaCIsImwiLCJtYXBJbmRleCIsIl9nZXRHcm91cGVkTGlzdGVuZXJzIiwiY2FsbCIsIm1vZGlmaWVyS2V5cyIsIm1hdGNoIiwiaW5jbHVkZXMiLCJ1cyIsImJpbmRLZXlDb2RlIiwiYmluZE1hY3JvIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiY2FwaXRhbEtleU5hbWUiLCJzZW1pY29sb25LZXlDb2RlIiwiZGFzaEtleUNvZGUiLCJlcXVhbEtleUNvZGUiLCJsZWZ0Q29tbWFuZEtleUNvZGUiLCJyaWdodENvbW1hbmRLZXlDb2RlIiwia2V5Ym9hcmQiLCJzZXRMb2NhbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BQ2FBLFFBQWI7RUFDRSxvQkFBWUMsV0FBWixFQUF5QjtFQUFBOztFQUN2QixTQUFLQyxTQUFMLEdBQWlCRCxXQUFqQjtFQUNBLFNBQUtFLFNBQUwsR0FBaUJILFFB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
