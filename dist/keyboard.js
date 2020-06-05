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
      this.activeTargetKeys = [];
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

        this.activeTargetKeys.length = 0;
        var keyNames = this.getKeyNames(keyCode);

        for (var _i = 0; _i < keyNames.length; _i += 1) {
          this.activeTargetKeys.push(keyNames[_i]);

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

          this.activeTargetKeys.length = 0;

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
        var _this2 = this;

        var preventRepeat = false;
        event || (event = {});

        event.preventRepeat = function () {
          preventRepeat = true;
        };

        event.pressedKeys = this._locale.pressedKeys.slice(0);
        var activeTargetKeys = this._locale.activeTargetKeys;

        var pressedKeys = this._locale.pressedKeys.slice(0);

        var listenerGroups = this._getGroupedListeners();

        var _loop = function _loop(i) {
          var listeners = listenerGroups[i];
          var keyCombo = listeners[0].keyCombo;

          if (keyCombo === null || keyCombo.check(pressedKeys) && activeTargetKeys.some(function (k) {
            return keyCombo.keyNames.includes(k);
          })) {
            for (var j = 0; j < listeners.length; j += 1) {
              var listener = listeners[j];

              if (!listener.executingHandler && listener.pressHandler && !listener.preventRepeat) {
                listener.executingHandler = true;
                listener.pressHandler.call(_this2, event);
                listener.executingHandler = false;

                if (preventRepeat || listener.preventRepeatByDefault) {
                  listener.preventRepeat = true;
                  preventRepeat = false;
                }
              }

              if (_this2._appliedListeners.indexOf(listener) === -1) {
                _this2._appliedListeners.push(listener);
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
        };

        for (var i = 0; i < listenerGroups.length; i += 1) {
          _loop(i);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9rZXktY29tYm8uanMiLCIuLi9saWIvbG9jYWxlLmpzIiwiLi4vbGliL2tleWJvYXJkLmpzIiwiLi4vbG9jYWxlcy91cy5qcyIsIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuZXhwb3J0IGNsYXNzIEtleUNvbWJvIHtcbiAgY29uc3RydWN0b3Ioa2V5Q29tYm9TdHIpIHtcbiAgICB0aGlzLnNvdXJjZVN0ciA9IGtleUNvbWJvU3RyO1xuICAgIHRoaXMuc3ViQ29tYm9zID0gS2V5Q29tYm8ucGFyc2VDb21ib1N0cihrZXlDb21ib1N0cik7XG4gICAgdGhpcy5rZXlOYW1lcyAgPSB0aGlzLnN1YkNvbWJvcy5yZWR1Y2UoKG1lbW8sIG5leHRTdWJDb21ibykgPT5cbiAgICAgIG1lbW8uY29uY2F0KG5leHRTdWJDb21ibyksIFtdKTtcbiAgfVxuXG4gIGNoZWNrKHByZXNzZWRLZXlOYW1lcykge1xuICAgIGxldCBzdGFydGluZ0tleU5hbWVJbmRleCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSB0aGlzLl9jaGVja1N1YkNvbWJvKFxuICAgICAgICB0aGlzLnN1YkNvbWJvc1tpXSxcbiAgICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXgsXG4gICAgICAgIHByZXNzZWRLZXlOYW1lc1xuICAgICAgKTtcbiAgICAgIGlmIChzdGFydGluZ0tleU5hbWVJbmRleCA9PT0gLTEpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIGlzRXF1YWwob3RoZXJLZXlDb21ibykge1xuICAgIGlmIChcbiAgICAgICFvdGhlcktleUNvbWJvIHx8XG4gICAgICB0eXBlb2Ygb3RoZXJLZXlDb21ibyAhPT0gJ3N0cmluZycgJiZcbiAgICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnb2JqZWN0J1xuICAgICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIGlmICh0eXBlb2Ygb3RoZXJLZXlDb21ibyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG90aGVyS2V5Q29tYm8gPSBuZXcgS2V5Q29tYm8ob3RoZXJLZXlDb21ibyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3ViQ29tYm9zLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3MubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmICh0aGlzLnN1YkNvbWJvc1tpXS5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3Qgc3ViQ29tYm8gICAgICA9IHRoaXMuc3ViQ29tYm9zW2ldO1xuICAgICAgY29uc3Qgb3RoZXJTdWJDb21ibyA9IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLnNsaWNlKDApO1xuXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHN1YkNvbWJvLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGNvbnN0IGtleU5hbWUgPSBzdWJDb21ib1tqXTtcbiAgICAgICAgY29uc3QgaW5kZXggICA9IG90aGVyU3ViQ29tYm8uaW5kZXhPZihrZXlOYW1lKTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIG90aGVyU3ViQ29tYm8uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG90aGVyU3ViQ29tYm8ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBfY2hlY2tTdWJDb21ibyhzdWJDb21ibywgc3RhcnRpbmdLZXlOYW1lSW5kZXgsIHByZXNzZWRLZXlOYW1lcykge1xuICAgIHN1YkNvbWJvID0gc3ViQ29tYm8uc2xpY2UoMCk7XG4gICAgcHJlc3NlZEtleU5hbWVzID0gcHJlc3NlZEtleU5hbWVzLnNsaWNlKHN0YXJ0aW5nS2V5TmFtZUluZGV4KTtcblxuICAgIGxldCBlbmRJbmRleCA9IHN0YXJ0aW5nS2V5TmFtZUluZGV4O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3ViQ29tYm8ubGVuZ3RoOyBpICs9IDEpIHtcblxuICAgICAgbGV0IGtleU5hbWUgPSBzdWJDb21ib1tpXTtcbiAgICAgIGlmIChrZXlOYW1lWzBdID09PSAnXFxcXCcpIHtcbiAgICAgICAgY29uc3QgZXNjYXBlZEtleU5hbWUgPSBrZXlOYW1lLnNsaWNlKDEpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgfHxcbiAgICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3JcbiAgICAgICAgKSB7XG4gICAgICAgICAga2V5TmFtZSA9IGVzY2FwZWRLZXlOYW1lO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gcHJlc3NlZEtleU5hbWVzLmluZGV4T2Yoa2V5TmFtZSk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBzdWJDb21iby5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGkgLT0gMTtcbiAgICAgICAgaWYgKGluZGV4ID4gZW5kSW5kZXgpIHtcbiAgICAgICAgICBlbmRJbmRleCA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdWJDb21iby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gZW5kSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xufVxuXG5LZXlDb21iby5jb21ib0RlbGltaW5hdG9yID0gJz4nO1xuS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IgICA9ICcrJztcblxuS2V5Q29tYm8ucGFyc2VDb21ib1N0ciA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyKSB7XG4gIGNvbnN0IHN1YkNvbWJvU3RycyA9IEtleUNvbWJvLl9zcGxpdFN0cihrZXlDb21ib1N0ciwgS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvcik7XG4gIGNvbnN0IGNvbWJvICAgICAgICA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwIDsgaSA8IHN1YkNvbWJvU3Rycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGNvbWJvLnB1c2goS2V5Q29tYm8uX3NwbGl0U3RyKHN1YkNvbWJvU3Ryc1tpXSwgS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IpKTtcbiAgfVxuICByZXR1cm4gY29tYm87XG59XG5cbktleUNvbWJvLl9zcGxpdFN0ciA9IGZ1bmN0aW9uKHN0ciwgZGVsaW1pbmF0b3IpIHtcbiAgY29uc3QgcyAgPSBzdHI7XG4gIGNvbnN0IGQgID0gZGVsaW1pbmF0b3I7XG4gIGxldCBjICA9ICcnO1xuICBjb25zdCBjYSA9IFtdO1xuXG4gIGZvciAobGV0IGNpID0gMDsgY2kgPCBzLmxlbmd0aDsgY2kgKz0gMSkge1xuICAgIGlmIChjaSA+IDAgJiYgc1tjaV0gPT09IGQgJiYgc1tjaSAtIDFdICE9PSAnXFxcXCcpIHtcbiAgICAgIGNhLnB1c2goYy50cmltKCkpO1xuICAgICAgYyA9ICcnO1xuICAgICAgY2kgKz0gMTtcbiAgICB9XG4gICAgYyArPSBzW2NpXTtcbiAgfVxuICBpZiAoYykgeyBjYS5wdXNoKGMudHJpbSgpKTsgfVxuXG4gIHJldHVybiBjYTtcbn07XG4iLCJpbXBvcnQgeyBLZXlDb21ibyB9IGZyb20gJy4va2V5LWNvbWJvJztcblxuXG5leHBvcnQgY2xhc3MgTG9jYWxlIHtcbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHRoaXMubG9jYWxlTmFtZSAgICAgICAgICA9IG5hbWU7XG4gICAgdGhpcy5hY3RpdmVUYXJnZXRLZXlzID0gW107XG4gICAgdGhpcy5wcmVzc2VkS2V5cyAgICAgICAgID0gW107XG4gICAgdGhpcy5fYXBwbGllZE1hY3JvcyAgICAgID0gW107XG4gICAgdGhpcy5fa2V5TWFwICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fa2lsbEtleUNvZGVzICAgICAgID0gW107XG4gICAgdGhpcy5fbWFjcm9zICAgICAgICAgICAgID0gW107XG4gIH1cblxuICBiaW5kS2V5Q29kZShrZXlDb2RlLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFtrZXlOYW1lc107XG4gICAgfVxuXG4gICAgdGhpcy5fa2V5TWFwW2tleUNvZGVdID0ga2V5TmFtZXM7XG4gIH07XG5cbiAgYmluZE1hY3JvKGtleUNvbWJvU3RyLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFsga2V5TmFtZXMgXTtcbiAgICB9XG5cbiAgICBsZXQgaGFuZGxlciA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaGFuZGxlciA9IGtleU5hbWVzO1xuICAgICAga2V5TmFtZXMgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1hY3JvID0ge1xuICAgICAga2V5Q29tYm8gOiBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpLFxuICAgICAga2V5TmFtZXMgOiBrZXlOYW1lcyxcbiAgICAgIGhhbmRsZXIgIDogaGFuZGxlclxuICAgIH07XG5cbiAgICB0aGlzLl9tYWNyb3MucHVzaChtYWNybyk7XG4gIH07XG5cbiAgZ2V0S2V5Q29kZXMoa2V5TmFtZSkge1xuICAgIGNvbnN0IGtleUNvZGVzID0gW107XG4gICAgZm9yIChjb25zdCBrZXlDb2RlIGluIHRoaXMuX2tleU1hcCkge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9rZXlNYXBba2V5Q29kZV0uaW5kZXhPZihrZXlOYW1lKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7IGtleUNvZGVzLnB1c2goa2V5Q29kZXwwKTsgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5Q29kZXM7XG4gIH07XG5cbiAgZ2V0S2V5TmFtZXMoa2V5Q29kZSkge1xuICAgIHJldHVybiB0aGlzLl9rZXlNYXBba2V5Q29kZV0gfHwgW107XG4gIH07XG5cbiAgc2V0S2lsbEtleShrZXlDb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3Qga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLnNldEtpbGxLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2tpbGxLZXlDb2Rlcy5wdXNoKGtleUNvZGUpO1xuICB9O1xuXG4gIHByZXNzS2V5KGtleUNvZGUpIHtcbiAgICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMucHJlc3NLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYWN0aXZlVGFyZ2V0S2V5cy5sZW5ndGggPSAwO1xuICAgIGNvbnN0IGtleU5hbWVzID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLmFjdGl2ZVRhcmdldEtleXMucHVzaChrZXlOYW1lc1tpXSk7XG4gICAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKGtleU5hbWVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9hcHBseU1hY3JvcygpO1xuICB9O1xuXG4gIHJlbGVhc2VLZXkoa2V5Q29kZSkge1xuICAgIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlS2V5KGtleUNvZGVzW2ldKTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBrZXlOYW1lcyAgICAgICAgID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICAgIGNvbnN0IGtpbGxLZXlDb2RlSW5kZXggPSB0aGlzLl9raWxsS2V5Q29kZXMuaW5kZXhPZihrZXlDb2RlKTtcblxuICAgICAgaWYgKGtpbGxLZXlDb2RlSW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSk7XG4gICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hY3RpdmVUYXJnZXRLZXlzLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLl9jbGVhck1hY3JvcygpO1xuICAgIH1cbiAgfTtcblxuICBfYXBwbHlNYWNyb3MoKSB7XG4gICAgY29uc3QgbWFjcm9zID0gdGhpcy5fbWFjcm9zLnNsaWNlKDApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWFjcm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBtYWNybyA9IG1hY3Jvc1tpXTtcbiAgICAgIGlmIChtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xuICAgICAgICBpZiAobWFjcm8uaGFuZGxlcikge1xuICAgICAgICAgIG1hY3JvLmtleU5hbWVzID0gbWFjcm8uaGFuZGxlcih0aGlzLnByZXNzZWRLZXlzKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgaWYgKHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihtYWNyby5rZXlOYW1lc1tqXSkgPT09IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnB1c2gobWFjcm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9hcHBsaWVkTWFjcm9zLnB1c2gobWFjcm8pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBfY2xlYXJNYWNyb3MoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9hcHBsaWVkTWFjcm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBtYWNybyA9IHRoaXMuX2FwcGxpZWRNYWNyb3NbaV07XG4gICAgICBpZiAoIW1hY3JvLmtleUNvbWJvLmNoZWNrKHRoaXMucHJlc3NlZEtleXMpKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbWFjcm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihtYWNyby5rZXlOYW1lc1tqXSk7XG4gICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcbiAgICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGkgLT0gMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IExvY2FsZSB9IGZyb20gJy4vbG9jYWxlJztcbmltcG9ydCB7IEtleUNvbWJvIH0gZnJvbSAnLi9rZXktY29tYm8nO1xuXG5cbmV4cG9ydCBjbGFzcyBLZXlib2FyZCB7XG4gIGNvbnN0cnVjdG9yKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgcGxhdGZvcm0sIHVzZXJBZ2VudCkge1xuICAgIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50Q29udGV4dCAgICAgICA9IG51bGw7XG4gICAgdGhpcy5fY29udGV4dHMgICAgICAgICAgICAgPSB7fTtcbiAgICB0aGlzLl9saXN0ZW5lcnMgICAgICAgICAgICA9IFtdO1xuICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMgICAgID0gW107XG4gICAgdGhpcy5fbG9jYWxlcyAgICAgICAgICAgICAgPSB7fTtcbiAgICB0aGlzLl90YXJnZXRFbGVtZW50ICAgICAgICA9IG51bGw7XG4gICAgdGhpcy5fdGFyZ2V0V2luZG93ICAgICAgICAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldFBsYXRmb3JtICAgICAgID0gJyc7XG4gICAgdGhpcy5fdGFyZ2V0VXNlckFnZW50ICAgICAgPSAnJztcbiAgICB0aGlzLl9pc01vZGVybkJyb3dzZXIgICAgICA9IGZhbHNlO1xuICAgIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gbnVsbDtcbiAgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcgICA9IG51bGw7XG4gICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nICAgPSBudWxsO1xuICAgIHRoaXMuX3BhdXNlZCAgICAgICAgICAgICAgID0gZmFsc2U7XG5cbiAgICB0aGlzLnNldENvbnRleHQoJ2dsb2JhbCcpO1xuICAgIHRoaXMud2F0Y2godGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCBwbGF0Zm9ybSwgdXNlckFnZW50KTtcbiAgfVxuXG4gIHNldExvY2FsZShsb2NhbGVOYW1lLCBsb2NhbGVCdWlsZGVyKSB7XG4gICAgbGV0IGxvY2FsZSA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiBsb2NhbGVOYW1lID09PSAnc3RyaW5nJykge1xuXG4gICAgICBpZiAobG9jYWxlQnVpbGRlcikge1xuICAgICAgICBsb2NhbGUgPSBuZXcgTG9jYWxlKGxvY2FsZU5hbWUpO1xuICAgICAgICBsb2NhbGVCdWlsZGVyKGxvY2FsZSwgdGhpcy5fdGFyZ2V0UGxhdGZvcm0sIHRoaXMuX3RhcmdldFVzZXJBZ2VudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2NhbGUgPSB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdIHx8IG51bGw7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsZSAgICAgPSBsb2NhbGVOYW1lO1xuICAgICAgbG9jYWxlTmFtZSA9IGxvY2FsZS5fbG9jYWxlTmFtZTtcbiAgICB9XG5cbiAgICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgID0gbG9jYWxlO1xuICAgIHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gPSBsb2NhbGU7XG4gICAgaWYgKGxvY2FsZSkge1xuICAgICAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzID0gbG9jYWxlLnByZXNzZWRLZXlzO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0TG9jYWxlKGxvY2FsTmFtZSkge1xuICAgIGxvY2FsTmFtZSB8fCAobG9jYWxOYW1lID0gdGhpcy5fbG9jYWxlLmxvY2FsZU5hbWUpO1xuICAgIHJldHVybiB0aGlzLl9sb2NhbGVzW2xvY2FsTmFtZV0gfHwgbnVsbDtcbiAgfVxuXG4gIGJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0ID0gcmVsZWFzZUhhbmRsZXI7XG4gICAgICByZWxlYXNlSGFuZGxlciAgICAgICAgID0gcHJlc3NIYW5kbGVyO1xuICAgICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA9IGtleUNvbWJvU3RyO1xuICAgICAga2V5Q29tYm9TdHIgICAgICAgICAgICA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAga2V5Q29tYm9TdHIgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICAgKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMuYmluZChrZXlDb21ib1N0cltpXSwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl9saXN0ZW5lcnMucHVzaCh7XG4gICAgICBrZXlDb21ibyAgICAgICAgICAgICAgOiBrZXlDb21ib1N0ciA/IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0cikgOiBudWxsLFxuICAgICAgcHJlc3NIYW5kbGVyICAgICAgICAgIDogcHJlc3NIYW5kbGVyICAgICAgICAgICB8fCBudWxsLFxuICAgICAgcmVsZWFzZUhhbmRsZXIgICAgICAgIDogcmVsZWFzZUhhbmRsZXIgICAgICAgICB8fCBudWxsLFxuICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgIDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZSxcbiAgICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQ6IHByZXZlbnRSZXBlYXRCeURlZmF1bHQgfHwgZmFsc2UsXG4gICAgICBleGVjdXRpbmdIYW5kbGVyICAgICAgOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRMaXN0ZW5lcihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCkge1xuICAgIHJldHVybiB0aGlzLmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpO1xuICB9XG5cbiAgb24oa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KTtcbiAgfVxuXG4gIGJpbmRQcmVzcyhrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XG4gICAgcmV0dXJuIHRoaXMuYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCBudWxsLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KTtcbiAgfVxuXG4gIGJpbmRSZWxlYXNlKGtleUNvbWJvU3RyLCByZWxlYXNlSGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLmJpbmQoa2V5Q29tYm9TdHIsIG51bGwsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KTtcbiAgfVxuXG4gIHVuYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcikge1xuICAgIGlmIChrZXlDb21ib1N0ciA9PT0gbnVsbCB8fCB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlbGVhc2VIYW5kbGVyID0gcHJlc3NIYW5kbGVyO1xuICAgICAgcHJlc3NIYW5kbGVyICAgPSBrZXlDb21ib1N0cjtcbiAgICAgIGtleUNvbWJvU3RyID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBrZXlDb21ib1N0ciAmJlxuICAgICAgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcbiAgICApIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5Q29tYm9TdHIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy51bmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5fbGlzdGVuZXJzW2ldO1xuXG4gICAgICBjb25zdCBjb21ib01hdGNoZXMgICAgICAgICAgPSAha2V5Q29tYm9TdHIgJiYgIWxpc3RlbmVyLmtleUNvbWJvIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIua2V5Q29tYm8gJiYgbGlzdGVuZXIua2V5Q29tYm8uaXNFcXVhbChrZXlDb21ib1N0cik7XG4gICAgICBjb25zdCBwcmVzc0hhbmRsZXJNYXRjaGVzICAgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFwcmVzc0hhbmRsZXIgJiYgIWxpc3RlbmVyLnByZXNzSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXNzSGFuZGxlciA9PT0gbGlzdGVuZXIucHJlc3NIYW5kbGVyO1xuICAgICAgY29uc3QgcmVsZWFzZUhhbmRsZXJNYXRjaGVzID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcmVsZWFzZUhhbmRsZXIgJiYgIWxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsZWFzZUhhbmRsZXIgPT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyO1xuXG4gICAgICBpZiAoY29tYm9NYXRjaGVzICYmIHByZXNzSGFuZGxlck1hdGNoZXMgJiYgcmVsZWFzZUhhbmRsZXJNYXRjaGVzKSB7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGkgLT0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbW92ZUxpc3RlbmVyKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMudW5iaW5kKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgfVxuXG4gIG9mZihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLnVuYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XG4gIH1cblxuICBzZXRDb250ZXh0KGNvbnRleHROYW1lKSB7XG4gICAgaWYodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxuXG4gICAgaWYgKCF0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0pIHtcbiAgICAgIHRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXSA9IFtdO1xuICAgIH1cbiAgICB0aGlzLl9saXN0ZW5lcnMgICAgICA9IHRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXTtcbiAgICB0aGlzLl9jdXJyZW50Q29udGV4dCA9IGNvbnRleHROYW1lO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBnZXRDb250ZXh0KCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50Q29udGV4dDtcbiAgfVxuXG4gIHdpdGhDb250ZXh0KGNvbnRleHROYW1lLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IHByZXZpb3VzQ29udGV4dE5hbWUgPSB0aGlzLmdldENvbnRleHQoKTtcbiAgICB0aGlzLnNldENvbnRleHQoY29udGV4dE5hbWUpO1xuXG4gICAgY2FsbGJhY2soKTtcblxuICAgIHRoaXMuc2V0Q29udGV4dChwcmV2aW91c0NvbnRleHROYW1lKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgd2F0Y2godGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCB0YXJnZXRQbGF0Zm9ybSwgdGFyZ2V0VXNlckFnZW50KSB7XG4gICAgdGhpcy5zdG9wKCk7XG5cbiAgICBjb25zdCB3aW4gPSB0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWxUaGlzIDpcbiAgICAgICAgICAgICAgICB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6XG4gICAgICAgICAgICAgICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOlxuICAgICAgICAgICAgICAgIHt9O1xuXG4gICAgaWYgKCF0YXJnZXRXaW5kb3cpIHtcbiAgICAgIGlmICghd2luLmFkZEV2ZW50TGlzdGVuZXIgJiYgIXdpbi5hdHRhY2hFdmVudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIHdpbmRvdyBmdW5jdGlvbnMgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudC4nKTtcbiAgICAgIH1cbiAgICAgIHRhcmdldFdpbmRvdyA9IHdpbjtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgZWxlbWVudCBiaW5kaW5ncyB3aGVyZSBhIHRhcmdldCB3aW5kb3cgaXMgbm90IHBhc3NlZFxuICAgIGlmICh0eXBlb2YgdGFyZ2V0V2luZG93Lm5vZGVUeXBlID09PSAnbnVtYmVyJykge1xuICAgICAgdGFyZ2V0VXNlckFnZW50ID0gdGFyZ2V0UGxhdGZvcm07XG4gICAgICB0YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRFbGVtZW50O1xuICAgICAgdGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93O1xuICAgICAgdGFyZ2V0V2luZG93ICAgID0gd2luO1xuICAgIH1cblxuICAgIGlmICghdGFyZ2V0V2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJiYgIXRhcmdldFdpbmRvdy5hdHRhY2hFdmVudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50IG1ldGhvZHMgb24gdGFyZ2V0V2luZG93LicpO1xuICAgIH1cblxuICAgIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA9ICEhdGFyZ2V0V2luZG93LmFkZEV2ZW50TGlzdGVuZXI7XG5cbiAgICBjb25zdCB1c2VyQWdlbnQgPSB0YXJnZXRXaW5kb3cubmF2aWdhdG9yICYmIHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50IHx8ICcnO1xuICAgIGNvbnN0IHBsYXRmb3JtICA9IHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IgJiYgdGFyZ2V0V2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSAgfHwgJyc7XG5cbiAgICB0YXJnZXRFbGVtZW50ICAgJiYgdGFyZ2V0RWxlbWVudCAgICE9PSBudWxsIHx8ICh0YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRXaW5kb3cuZG9jdW1lbnQpO1xuICAgIHRhcmdldFBsYXRmb3JtICAmJiB0YXJnZXRQbGF0Zm9ybSAgIT09IG51bGwgfHwgKHRhcmdldFBsYXRmb3JtICA9IHBsYXRmb3JtKTtcbiAgICB0YXJnZXRVc2VyQWdlbnQgJiYgdGFyZ2V0VXNlckFnZW50ICE9PSBudWxsIHx8ICh0YXJnZXRVc2VyQWdlbnQgPSB1c2VyQWdlbnQpO1xuXG4gICAgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcgPSAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMucHJlc3NLZXkoZXZlbnQua2V5Q29kZSwgZXZlbnQpO1xuICAgICAgdGhpcy5faGFuZGxlQ29tbWFuZEJ1ZyhldmVudCwgcGxhdGZvcm0pO1xuICAgIH07XG4gICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nID0gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnJlbGVhc2VLZXkoZXZlbnQua2V5Q29kZSwgZXZlbnQpO1xuICAgIH07XG4gICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nID0gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnJlbGVhc2VBbGxLZXlzKGV2ZW50KTtcbiAgICB9O1xuXG4gICAgdGhpcy5fYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsICdrZXlkb3duJywgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcpO1xuICAgIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5dXAnLCAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyk7XG4gICAgdGhpcy5fYmluZEV2ZW50KHRhcmdldFdpbmRvdywgICdmb2N1cycsICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcbiAgICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0V2luZG93LCAgJ2JsdXInLCAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuXG4gICAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0RWxlbWVudDtcbiAgICB0aGlzLl90YXJnZXRXaW5kb3cgICAgPSB0YXJnZXRXaW5kb3c7XG4gICAgdGhpcy5fdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0UGxhdGZvcm07XG4gICAgdGhpcy5fdGFyZ2V0VXNlckFnZW50ID0gdGFyZ2V0VXNlckFnZW50O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIGlmICghdGhpcy5fdGFyZ2V0RWxlbWVudCB8fCAhdGhpcy5fdGFyZ2V0V2luZG93KSB7IHJldHVybjsgfVxuXG4gICAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XG4gICAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xuICAgIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdmb2N1cycsICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcbiAgICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG5cbiAgICB0aGlzLl90YXJnZXRXaW5kb3cgID0gbnVsbDtcbiAgICB0aGlzLl90YXJnZXRFbGVtZW50ID0gbnVsbDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHJlc3NLZXkoa2V5Q29kZSwgZXZlbnQpIHtcbiAgICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybiB0aGlzOyB9XG4gICAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgICB0aGlzLl9sb2NhbGUucHJlc3NLZXkoa2V5Q29kZSk7XG4gICAgdGhpcy5fYXBwbHlCaW5kaW5ncyhldmVudCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbGVhc2VLZXkoa2V5Q29kZSwgZXZlbnQpIHtcbiAgICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybiB0aGlzOyB9XG4gICAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgICB0aGlzLl9sb2NhbGUucmVsZWFzZUtleShrZXlDb2RlKTtcbiAgICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVsZWFzZUFsbEtleXMoZXZlbnQpIHtcbiAgICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybiB0aGlzOyB9XG4gICAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcGF1c2UoKSB7XG4gICAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm4gdGhpczsgfVxuICAgIGlmICh0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XG4gICAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVzdW1lKCkge1xuICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XG4gICAgICB0YXJnZXRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxuICAgICAgdGFyZ2V0RWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgfVxuXG4gIF91bmJpbmRFdmVudCh0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5faXNNb2Rlcm5Ccm93c2VyID9cbiAgICAgIHRhcmdldEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XG4gICAgICB0YXJnZXRFbGVtZW50LmRldGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xuICB9XG5cbiAgX2dldEdyb3VwZWRMaXN0ZW5lcnMoKSB7XG4gICAgY29uc3QgbGlzdGVuZXJHcm91cHMgICA9IFtdO1xuICAgIGNvbnN0IGxpc3RlbmVyR3JvdXBNYXAgPSBbXTtcblxuICAgIGxldCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRDb250ZXh0ICE9PSAnZ2xvYmFsJykge1xuICAgICAgbGlzdGVuZXJzID0gWy4uLmxpc3RlbmVycywgLi4udGhpcy5fY29udGV4dHMuZ2xvYmFsXTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuc29ydChcbiAgICAgIChhLCBiKSA9PlxuICAgICAgICAoYi5rZXlDb21ibyA/IGIua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMCkgLVxuICAgICAgICAoYS5rZXlDb21ibyA/IGEua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMClcbiAgICApLmZvckVhY2goKGwpID0+IHtcbiAgICAgIGxldCBtYXBJbmRleCA9IC0xO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lckdyb3VwTWFwLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChsaXN0ZW5lckdyb3VwTWFwW2ldID09PSBudWxsICYmIGwua2V5Q29tYm8gPT09IG51bGwgfHxcbiAgICAgICAgICAgIGxpc3RlbmVyR3JvdXBNYXBbaV0gIT09IG51bGwgJiYgbGlzdGVuZXJHcm91cE1hcFtpXS5pc0VxdWFsKGwua2V5Q29tYm8pKSB7XG4gICAgICAgICAgbWFwSW5kZXggPSBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWFwSW5kZXggPT09IC0xKSB7XG4gICAgICAgIG1hcEluZGV4ID0gbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7XG4gICAgICAgIGxpc3RlbmVyR3JvdXBNYXAucHVzaChsLmtleUNvbWJvKTtcbiAgICAgIH1cbiAgICAgIGlmICghbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdKSB7XG4gICAgICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSA9IFtdO1xuICAgICAgfVxuICAgICAgbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdLnB1c2gobCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbGlzdGVuZXJHcm91cHM7XG4gIH1cblxuICBfYXBwbHlCaW5kaW5ncyhldmVudCkge1xuICAgIGxldCBwcmV2ZW50UmVwZWF0ID0gZmFsc2U7XG5cbiAgICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG4gICAgZXZlbnQucHJldmVudFJlcGVhdCA9ICgpID0+IHsgcHJldmVudFJlcGVhdCA9IHRydWU7IH07XG4gICAgZXZlbnQucHJlc3NlZEtleXMgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcblxuICAgIGNvbnN0IGFjdGl2ZVRhcmdldEtleXMgPSB0aGlzLl9sb2NhbGUuYWN0aXZlVGFyZ2V0S2V5cztcbiAgICBjb25zdCBwcmVzc2VkS2V5cyAgICAgID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xuICAgIGNvbnN0IGxpc3RlbmVyR3JvdXBzICAgPSB0aGlzLl9nZXRHcm91cGVkTGlzdGVuZXJzKCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3RlbmVyR3JvdXBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSBsaXN0ZW5lckdyb3Vwc1tpXTtcbiAgICAgIGNvbnN0IGtleUNvbWJvICA9IGxpc3RlbmVyc1swXS5rZXlDb21ibztcblxuICAgICAgaWYgKFxuICAgICAgICBrZXlDb21ibyA9PT0gbnVsbCB8fFxuICAgICAgICBrZXlDb21iby5jaGVjayhwcmVzc2VkS2V5cykgJiZcbiAgICAgICAgYWN0aXZlVGFyZ2V0S2V5cy5zb21lKGsgPT4ga2V5Q29tYm8ua2V5TmFtZXMuaW5jbHVkZXMoaykpXG4gICAgICApIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBsaXN0ZW5lcnMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICBsZXQgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbal07XG5cbiAgICAgICAgICBpZiAoIWxpc3RlbmVyLmV4ZWN1dGluZ0hhbmRsZXIgJiYgbGlzdGVuZXIucHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmV2ZW50UmVwZWF0KSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5leGVjdXRpbmdIYW5kbGVyID0gdHJ1ZTtcbiAgICAgICAgICAgIGxpc3RlbmVyLnByZXNzSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICAgIGxpc3RlbmVyLmV4ZWN1dGluZ0hhbmRsZXIgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKHByZXZlbnRSZXBlYXQgfHwgbGlzdGVuZXIucHJldmVudFJlcGVhdEJ5RGVmYXVsdCkge1xuICAgICAgICAgICAgICBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5Q29tYm8pIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGtleUNvbWJvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHByZXNzZWRLZXlzLmluZGV4T2Yoa2V5Q29tYm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICBwcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICBqIC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyQmluZGluZ3MoZXZlbnQpIHtcbiAgICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG4gICAgZXZlbnQucHJlc3NlZEtleXMgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5fYXBwbGllZExpc3RlbmVyc1tpXTtcbiAgICAgIGNvbnN0IGtleUNvbWJvID0gbGlzdGVuZXIua2V5Q29tYm87XG4gICAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwgIWtleUNvbWJvLmNoZWNrKHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cykpIHtcbiAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IGZhbHNlO1xuICAgICAgICBpZiAoa2V5Q29tYm8gIT09IG51bGwgfHwgZXZlbnQucHJlc3NlZEtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbGlzdGVuZXIuZXhlY3V0aW5nSGFuZGxlciAmJiBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcikge1xuICAgICAgICAgIGxpc3RlbmVyLmV4ZWN1dGluZ0hhbmRsZXIgPSB0cnVlO1xuICAgICAgICAgIGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgIGxpc3RlbmVyLmV4ZWN1dGluZ0hhbmRsZXIgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVDb21tYW5kQnVnKGV2ZW50LCBwbGF0Zm9ybSkge1xuICAgIC8vIE9uIE1hYyB3aGVuIHRoZSBjb21tYW5kIGtleSBpcyBrZXB0IHByZXNzZWQsIGtleXVwIGlzIG5vdCB0cmlnZ2VyZWQgZm9yIGFueSBvdGhlciBrZXkuXG4gICAgLy8gSW4gdGhpcyBjYXNlIGZvcmNlIGEga2V5dXAgZm9yIG5vbi1tb2RpZmllciBrZXlzIGRpcmVjdGx5IGFmdGVyIHRoZSBrZXlwcmVzcy5cbiAgICBjb25zdCBtb2RpZmllcktleXMgPSBbXCJzaGlmdFwiLCBcImN0cmxcIiwgXCJhbHRcIiwgXCJjYXBzbG9ja1wiLCBcInRhYlwiLCBcImNvbW1hbmRcIl07XG4gICAgaWYgKHBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpICYmIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5pbmNsdWRlcyhcImNvbW1hbmRcIikgJiZcbiAgICAgICAgIW1vZGlmaWVyS2V5cy5pbmNsdWRlcyh0aGlzLl9sb2NhbGUuZ2V0S2V5TmFtZXMoZXZlbnQua2V5Q29kZSlbMF0pKSB7XG4gICAgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcoZXZlbnQpO1xuICAgIH1cbiAgfVxufVxuIiwiXG5leHBvcnQgZnVuY3Rpb24gdXMobG9jYWxlLCBwbGF0Zm9ybSwgdXNlckFnZW50KSB7XG5cbiAgLy8gZ2VuZXJhbFxuICBsb2NhbGUuYmluZEtleUNvZGUoMywgICBbJ2NhbmNlbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDgsICAgWydiYWNrc3BhY2UnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5LCAgIFsndGFiJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIsICBbJ2NsZWFyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMsICBbJ2VudGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTYsICBbJ3NoaWZ0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTcsICBbJ2N0cmwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOCwgIFsnYWx0JywgJ21lbnUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOSwgIFsncGF1c2UnLCAnYnJlYWsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMCwgIFsnY2Fwc2xvY2snXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyNywgIFsnZXNjYXBlJywgJ2VzYyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMyLCAgWydzcGFjZScsICdzcGFjZWJhciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMzLCAgWydwYWdldXAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNCwgIFsncGFnZWRvd24nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNSwgIFsnZW5kJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzYsICBbJ2hvbWUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNywgIFsnbGVmdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM4LCAgWyd1cCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM5LCAgWydyaWdodCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQwLCAgWydkb3duJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDEsICBbJ3NlbGVjdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQyLCAgWydwcmludHNjcmVlbiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQzLCAgWydleGVjdXRlJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDQsICBbJ3NuYXBzaG90J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDUsICBbJ2luc2VydCcsICdpbnMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NiwgIFsnZGVsZXRlJywgJ2RlbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ3LCAgWydoZWxwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTQ1LCBbJ3Njcm9sbGxvY2snLCAnc2Nyb2xsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTg4LCBbJ2NvbW1hJywgJywnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTAsIFsncGVyaW9kJywgJy4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTEsIFsnc2xhc2gnLCAnZm9yd2FyZHNsYXNoJywgJy8nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTIsIFsnZ3JhdmVhY2NlbnQnLCAnYCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIxOSwgWydvcGVuYnJhY2tldCcsICdbJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIwLCBbJ2JhY2tzbGFzaCcsICdcXFxcJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIxLCBbJ2Nsb3NlYnJhY2tldCcsICddJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIyLCBbJ2Fwb3N0cm9waGUnLCAnXFwnJ10pO1xuXG4gIC8vIDAtOVxuICBsb2NhbGUuYmluZEtleUNvZGUoNDgsIFsnemVybycsICcwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDksIFsnb25lJywgJzEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MCwgWyd0d28nLCAnMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUxLCBbJ3RocmVlJywgJzMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MiwgWydmb3VyJywgJzQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MywgWydmaXZlJywgJzUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NCwgWydzaXgnLCAnNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU1LCBbJ3NldmVuJywgJzcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NiwgWydlaWdodCcsICc4J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTcsIFsnbmluZScsICc5J10pO1xuXG4gIC8vIG51bXBhZFxuICBsb2NhbGUuYmluZEtleUNvZGUoOTYsIFsnbnVtemVybycsICdudW0wJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTcsIFsnbnVtb25lJywgJ251bTEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5OCwgWydudW10d28nLCAnbnVtMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk5LCBbJ251bXRocmVlJywgJ251bTMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDAsIFsnbnVtZm91cicsICdudW00J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAxLCBbJ251bWZpdmUnLCAnbnVtNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMiwgWydudW1zaXgnLCAnbnVtNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMywgWydudW1zZXZlbicsICdudW03J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA0LCBbJ251bWVpZ2h0JywgJ251bTgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDUsIFsnbnVtbmluZScsICdudW05J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA2LCBbJ251bW11bHRpcGx5JywgJ251bSonXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDcsIFsnbnVtYWRkJywgJ251bSsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDgsIFsnbnVtZW50ZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDksIFsnbnVtc3VidHJhY3QnLCAnbnVtLSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMCwgWydudW1kZWNpbWFsJywgJ251bS4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTEsIFsnbnVtZGl2aWRlJywgJ251bS8nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNDQsIFsnbnVtbG9jaycsICdudW0nXSk7XG5cbiAgLy8gZnVuY3Rpb24ga2V5c1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEyLCBbJ2YxJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEzLCBbJ2YyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE0LCBbJ2YzJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE1LCBbJ2Y0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE2LCBbJ2Y1J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE3LCBbJ2Y2J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE4LCBbJ2Y3J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE5LCBbJ2Y4J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIwLCBbJ2Y5J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIxLCBbJ2YxMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMiwgWydmMTEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjMsIFsnZjEyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI0LCBbJ2YxMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyNSwgWydmMTQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjYsIFsnZjE1J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI3LCBbJ2YxNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyOCwgWydmMTcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjksIFsnZjE4J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMwLCBbJ2YxOSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzMSwgWydmMjAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzIsIFsnZjIxJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMzLCBbJ2YyMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzNCwgWydmMjMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzUsIFsnZjI0J10pO1xuXG4gIC8vIHNlY29uZGFyeSBrZXkgc3ltYm9sc1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIGAnLCBbJ3RpbGRlJywgJ34nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMScsIFsnZXhjbGFtYXRpb24nLCAnZXhjbGFtYXRpb25wb2ludCcsICchJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDInLCBbJ2F0JywgJ0AnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMycsIFsnbnVtYmVyJywgJyMnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNCcsIFsnZG9sbGFyJywgJ2RvbGxhcnMnLCAnZG9sbGFyc2lnbicsICckJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDUnLCBbJ3BlcmNlbnQnLCAnJSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA2JywgWydjYXJldCcsICdeJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDcnLCBbJ2FtcGVyc2FuZCcsICdhbmQnLCAnJiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA4JywgWydhc3RlcmlzaycsICcqJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDknLCBbJ29wZW5wYXJlbicsICcoJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDAnLCBbJ2Nsb3NlcGFyZW4nLCAnKSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAtJywgWyd1bmRlcnNjb3JlJywgJ18nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgPScsIFsncGx1cycsICcrJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFsnLCBbJ29wZW5jdXJseWJyYWNlJywgJ29wZW5jdXJseWJyYWNrZXQnLCAneyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBdJywgWydjbG9zZWN1cmx5YnJhY2UnLCAnY2xvc2VjdXJseWJyYWNrZXQnLCAnfSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBcXFxcJywgWyd2ZXJ0aWNhbGJhcicsICd8J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDsnLCBbJ2NvbG9uJywgJzonXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXFwnJywgWydxdW90YXRpb25tYXJrJywgJ1xcJyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAhLCcsIFsnb3BlbmFuZ2xlYnJhY2tldCcsICc8J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC4nLCBbJ2Nsb3NlYW5nbGVicmFja2V0JywgJz4nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLycsIFsncXVlc3Rpb25tYXJrJywgJz8nXSk7XG5cbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSkge1xuICAgIGxvY2FsZS5iaW5kTWFjcm8oJ2NvbW1hbmQnLCBbJ21vZCcsICdtb2RpZmllciddKTtcbiAgfSBlbHNlIHtcbiAgICBsb2NhbGUuYmluZE1hY3JvKCdjdHJsJywgWydtb2QnLCAnbW9kaWZpZXInXSk7XG4gIH1cblxuICAvL2EteiBhbmQgQS1aXG4gIGZvciAobGV0IGtleUNvZGUgPSA2NTsga2V5Q29kZSA8PSA5MDsga2V5Q29kZSArPSAxKSB7XG4gICAgdmFyIGtleU5hbWUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleUNvZGUgKyAzMik7XG4gICAgdmFyIGNhcGl0YWxLZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlKTtcbiAgXHRsb2NhbGUuYmluZEtleUNvZGUoa2V5Q29kZSwga2V5TmFtZSk7XG4gIFx0bG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAnICsga2V5TmFtZSwgY2FwaXRhbEtleU5hbWUpO1xuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ2NhcHNsb2NrICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcbiAgfVxuXG4gIC8vIGJyb3dzZXIgY2F2ZWF0c1xuICBjb25zdCBzZW1pY29sb25LZXlDb2RlID0gdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykgPyA1OSAgOiAxODY7XG4gIGNvbnN0IGRhc2hLZXlDb2RlICAgICAgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDE3MyA6IDE4OTtcbiAgY29uc3QgZXF1YWxLZXlDb2RlICAgICA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gNjEgIDogMTg3O1xuICBsZXQgbGVmdENvbW1hbmRLZXlDb2RlO1xuICBsZXQgcmlnaHRDb21tYW5kS2V5Q29kZTtcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiAodXNlckFnZW50Lm1hdGNoKCdTYWZhcmknKSB8fCB1c2VyQWdlbnQubWF0Y2goJ0Nocm9tZScpKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSA5MTtcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gOTM7XG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdPcGVyYScpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDE3O1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSAxNztcbiAgfSBlbHNlIGlmKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSAyMjQ7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDIyNDtcbiAgfVxuICBsb2NhbGUuYmluZEtleUNvZGUoc2VtaWNvbG9uS2V5Q29kZSwgICAgWydzZW1pY29sb24nLCAnOyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGRhc2hLZXlDb2RlLCAgICAgICAgIFsnZGFzaCcsICctJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoZXF1YWxLZXlDb2RlLCAgICAgICAgWydlcXVhbCcsICdlcXVhbHNpZ24nLCAnPSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGxlZnRDb21tYW5kS2V5Q29kZSwgIFsnY29tbWFuZCcsICd3aW5kb3dzJywgJ3dpbicsICdzdXBlcicsICdsZWZ0Y29tbWFuZCcsICdsZWZ0d2luZG93cycsICdsZWZ0d2luJywgJ2xlZnRzdXBlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKHJpZ2h0Q29tbWFuZEtleUNvZGUsIFsnY29tbWFuZCcsICd3aW5kb3dzJywgJ3dpbicsICdzdXBlcicsICdyaWdodGNvbW1hbmQnLCAncmlnaHR3aW5kb3dzJywgJ3JpZ2h0d2luJywgJ3JpZ2h0c3VwZXInXSk7XG5cbiAgLy8ga2lsbCBrZXlzXG4gIGxvY2FsZS5zZXRLaWxsS2V5KCdjb21tYW5kJyk7XG59O1xuIiwiaW1wb3J0IHsgS2V5Ym9hcmQgfSBmcm9tICcuL2xpYi9rZXlib2FyZCc7XG5pbXBvcnQgeyBMb2NhbGUgfSBmcm9tICcuL2xpYi9sb2NhbGUnO1xuaW1wb3J0IHsgS2V5Q29tYm8gfSBmcm9tICcuL2xpYi9rZXktY29tYm8nO1xuaW1wb3J0IHsgdXMgfSBmcm9tICcuL2xvY2FsZXMvdXMnO1xuXG5jb25zdCBrZXlib2FyZCA9IG5ldyBLZXlib2FyZCgpO1xuXG5rZXlib2FyZC5zZXRMb2NhbGUoJ3VzJywgdXMpO1xuXG5rZXlib2FyZC5LZXlib2FyZCA9IEtleWJvYXJkO1xua2V5Ym9hcmQuTG9jYWxlID0gTG9jYWxlO1xua2V5Ym9hcmQuS2V5Q29tYm8gPSBLZXlDb21ibztcblxuZXhwb3J0IGRlZmF1bHQga2V5Ym9hcmQ7XG4iXSwibmFtZXMiOlsiS2V5Q29tYm8iLCJrZXlDb21ib1N0ciIsInNvdXJjZVN0ciIsInN1YkNvbWJvcyIsInBhcnNlQ29tYm9TdHIiLCJrZXlOYW1lcyIsInJlZHVjZSIsIm1lbW8iLCJuZXh0U3ViQ29tYm8iLCJjb25jYXQiLCJwcmVzc2VkS2V5TmFtZXMiLCJzdGFydGluZ0tleU5hbWVJbmRleCIsImkiLCJsZW5ndGgiLCJfY2hlY2tTdWJDb21ibyIsIm90aGVyS2V5Q29tYm8iLCJzdWJDb21ibyIsIm90aGVyU3ViQ29tYm8iLCJzbGljZSIsImoiLCJrZXlOYW1lIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwiZW5kSW5kZXgiLCJlc2NhcGVkS2V5TmFtZSIsImNvbWJvRGVsaW1pbmF0b3IiLCJrZXlEZWxpbWluYXRvciIsInN1YkNvbWJvU3RycyIsIl9zcGxpdFN0ciIsImNvbWJvIiwicHVzaCIsInN0ciIsImRlbGltaW5hdG9yIiwicyIsImQiLCJjIiwiY2EiLCJjaSIsInRyaW0iLCJMb2NhbGUiLCJuYW1lIiwibG9jYWxlTmFtZSIsImFjdGl2ZVRhcmdldEtleXMiLCJwcmVzc2VkS2V5cyIsIl9hcHBsaWVkTWFjcm9zIiwiX2tleU1hcCIsIl9raWxsS2V5Q29kZXMiLCJfbWFjcm9zIiwia2V5Q29kZSIsImhhbmRsZXIiLCJtYWNybyIsImtleUNvbWJvIiwia2V5Q29kZXMiLCJnZXRLZXlDb2RlcyIsInNldEtpbGxLZXkiLCJwcmVzc0tleSIsImdldEtleU5hbWVzIiwiX2FwcGx5TWFjcm9zIiwicmVsZWFzZUtleSIsImtpbGxLZXlDb2RlSW5kZXgiLCJfY2xlYXJNYWNyb3MiLCJtYWNyb3MiLCJjaGVjayIsIktleWJvYXJkIiwidGFyZ2V0V2luZG93IiwidGFyZ2V0RWxlbWVudCIsInBsYXRmb3JtIiwidXNlckFnZW50IiwiX2xvY2FsZSIsIl9jdXJyZW50Q29udGV4dCIsIl9jb250ZXh0cyIsIl9saXN0ZW5lcnMiLCJfYXBwbGllZExpc3RlbmVycyIsIl9sb2NhbGVzIiwiX3RhcmdldEVsZW1lbnQiLCJfdGFyZ2V0V2luZG93IiwiX3RhcmdldFBsYXRmb3JtIiwiX3RhcmdldFVzZXJBZ2VudCIsIl9pc01vZGVybkJyb3dzZXIiLCJfdGFyZ2V0S2V5RG93bkJpbmRpbmciLCJfdGFyZ2V0S2V5VXBCaW5kaW5nIiwiX3RhcmdldFJlc2V0QmluZGluZyIsIl9wYXVzZWQiLCJzZXRDb250ZXh0Iiwid2F0Y2giLCJsb2NhbGVCdWlsZGVyIiwibG9jYWxlIiwiX2xvY2FsZU5hbWUiLCJsb2NhbE5hbWUiLCJwcmVzc0hhbmRsZXIiLCJyZWxlYXNlSGFuZGxlciIsInByZXZlbnRSZXBlYXRCeURlZmF1bHQiLCJiaW5kIiwicHJldmVudFJlcGVhdCIsImV4ZWN1dGluZ0hhbmRsZXIiLCJ1bmJpbmQiLCJsaXN0ZW5lciIsImNvbWJvTWF0Y2hlcyIsImlzRXF1YWwiLCJwcmVzc0hhbmRsZXJNYXRjaGVzIiwicmVsZWFzZUhhbmRsZXJNYXRjaGVzIiwiY29udGV4dE5hbWUiLCJyZWxlYXNlQWxsS2V5cyIsImNhbGxiYWNrIiwicHJldmlvdXNDb250ZXh0TmFtZSIsImdldENvbnRleHQiLCJ0YXJnZXRQbGF0Zm9ybSIsInRhcmdldFVzZXJBZ2VudCIsInN0b3AiLCJ3aW4iLCJnbG9iYWxUaGlzIiwiZ2xvYmFsIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImF0dGFjaEV2ZW50IiwiRXJyb3IiLCJub2RlVHlwZSIsIm5hdmlnYXRvciIsImRvY3VtZW50IiwiZXZlbnQiLCJfaGFuZGxlQ29tbWFuZEJ1ZyIsIl9iaW5kRXZlbnQiLCJfdW5iaW5kRXZlbnQiLCJfYXBwbHlCaW5kaW5ncyIsIl9jbGVhckJpbmRpbmdzIiwiZXZlbnROYW1lIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImRldGFjaEV2ZW50IiwibGlzdGVuZXJHcm91cHMiLCJsaXN0ZW5lckdyb3VwTWFwIiwibGlzdGVuZXJzIiwic29ydCIsImEiLCJiIiwiZm9yRWFjaCIsImwiLCJtYXBJbmRleCIsIl9nZXRHcm91cGVkTGlzdGVuZXJzIiwic29tZSIsImsiLCJpbmNsdWRlcyIsImNhbGwiLCJtb2RpZmllcktleXMiLCJtYXRjaCIsInVzIiwiYmluZEtleUNvZGUiLCJiaW5kTWFjcm8iLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJjYXBpdGFsS2V5TmFtZSIsInNlbWljb2xvbktleUNvZGUiLCJkYXNoS2V5Q29kZSIsImVxdWFsS2V5Q29kZSIsImxlZnRDb21tYW5kS2V5Q29kZSIsInJpZ2h0Q29tbWFuZEtleUNvZGUiLCJrZXlib2FyZCIsInNldExvY2FsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFDYUEsUUFBYjtFQUNFLG9CQUFZQyxXQUFaLEVBQXlCO0VBQUE7O0VBQ3ZCLFNBQUtDLFNBQUwsR0FBaUJELFdBQWpCO0VBQ0EsU0FBS0UsU0FBTCxHQUFpQkgsUUFBUSxDQUFDSSxhQUFULENBQXVCSCxXQUF2QixDQUFqQjtFQUNBLFNBQUtJLFFBQUwsR0FBaUIsS0FBS0YsU0FBTCxDQUFlRyxNQUFmLENBQXNCLFVBQUNDLElBQUQsRUFBT0MsWUFBUDtFQUFBLGFBQ3JDRCxJQUFJLENBQUNFLE1BQUwsQ0FBWUQsWUFBWixDQURxQztFQUFBLEtBQXRCLEVBQ1ksRUFEWixDQUFqQjtFQUVEOztFQU5IO0VBQUE7RUFBQSwwQkFRUUUsZUFSUixFQVF5QjtFQUNyQixVQUFJQyxvQkFBb0IsR0FBRyxDQUEzQjs7RUFDQSxXQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsS0FBS1QsU0FBTCxDQUFlVSxNQUFuQyxFQUEyQ0QsQ0FBQyxJQUFJLENBQWhELEVBQW1EO0VBQ2pERCxRQUFBQSxvQkFBb0IsR0FBRyxLQUFLRyxjQUFMLENBQ3JCLEtBQUtYLFNBQUwsQ0FBZVMsQ0FBZixDQURxQixFQUVyQkQsb0JBRnFCLEVBR3JCRCxlQUhxQixDQUF2Qjs7RUFLQSxZQUFJQyxvQkFBb0IsS0FBSyxDQUFDLENBQTlCLEVBQWlDO0VBQUUsaUJBQU8sS0FBUDtFQUFlO0VBQ25E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
