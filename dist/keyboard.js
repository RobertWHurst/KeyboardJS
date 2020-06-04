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

          return;
        }

        this._listeners.push({
          keyCombo: keyComboStr ? new KeyCombo(keyComboStr) : null,
          pressHandler: pressHandler || null,
          releaseHandler: releaseHandler || null,
          preventRepeat: preventRepeatByDefault || false,
          preventRepeatByDefault: preventRepeatByDefault || false
        });
      }
    }, {
      key: "addListener",
      value: function addListener() {
        return this.bind.apply(this, arguments);
      }
    }, {
      key: "on",
      value: function on() {
        return this.bind.apply(this, arguments);
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

          return;
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
      }
    }, {
      key: "removeListener",
      value: function removeListener() {
        return this.unbind.apply(this, arguments);
      }
    }, {
      key: "off",
      value: function off() {
        return this.unbind.apply(this, arguments);
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
      }
    }, {
      key: "releaseKey",
      value: function releaseKey(keyCode, event) {
        if (this._paused) {
          return;
        }

        if (!this._locale) {
          throw new Error('Locale not set');
        }

        this._locale.releaseKey(keyCode);

        this._clearBindings(event);
      }
    }, {
      key: "releaseAllKeys",
      value: function releaseAllKeys(event) {
        if (this._paused) {
          return;
        }

        if (!this._locale) {
          throw new Error('Locale not set');
        }

        this._locale.pressedKeys.length = 0;

        this._clearBindings(event);
      }
    }, {
      key: "pause",
      value: function pause() {
        if (this._paused) {
          return;
        }

        if (this._locale) {
          this.releaseAllKeys();
        }

        this._paused = true;
      }
    }, {
      key: "resume",
      value: function resume() {
        this._paused = false;
      }
    }, {
      key: "reset",
      value: function reset() {
        this.releaseAllKeys();
        this._listeners.length = 0;
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

              if (keyCombo === null) {
                listener = {
                  keyCombo: new KeyCombo(pressedKeys.join('+')),
                  pressHandler: listener.pressHandler,
                  releaseHandler: listener.releaseHandler,
                  preventRepeat: listener.preventRepeat,
                  preventRepeatByDefault: listener.preventRepeatByDefault
                };
              }

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

            this._appliedListeners.splice(i, 1);

            i -= 1;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9rZXktY29tYm8uanMiLCIuLi9saWIvbG9jYWxlLmpzIiwiLi4vbGliL2tleWJvYXJkLmpzIiwiLi4vbG9jYWxlcy91cy5qcyIsIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuZXhwb3J0IGNsYXNzIEtleUNvbWJvIHtcbiAgY29uc3RydWN0b3Ioa2V5Q29tYm9TdHIpIHtcbiAgICB0aGlzLnNvdXJjZVN0ciA9IGtleUNvbWJvU3RyO1xuICAgIHRoaXMuc3ViQ29tYm9zID0gS2V5Q29tYm8ucGFyc2VDb21ib1N0cihrZXlDb21ib1N0cik7XG4gICAgdGhpcy5rZXlOYW1lcyAgPSB0aGlzLnN1YkNvbWJvcy5yZWR1Y2UoKG1lbW8sIG5leHRTdWJDb21ibykgPT5cbiAgICAgIG1lbW8uY29uY2F0KG5leHRTdWJDb21ibyksIFtdKTtcbiAgfVxuXG4gIGNoZWNrKHByZXNzZWRLZXlOYW1lcykge1xuICAgIGxldCBzdGFydGluZ0tleU5hbWVJbmRleCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSB0aGlzLl9jaGVja1N1YkNvbWJvKFxuICAgICAgICB0aGlzLnN1YkNvbWJvc1tpXSxcbiAgICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXgsXG4gICAgICAgIHByZXNzZWRLZXlOYW1lc1xuICAgICAgKTtcbiAgICAgIGlmIChzdGFydGluZ0tleU5hbWVJbmRleCA9PT0gLTEpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIGlzRXF1YWwob3RoZXJLZXlDb21ibykge1xuICAgIGlmIChcbiAgICAgICFvdGhlcktleUNvbWJvIHx8XG4gICAgICB0eXBlb2Ygb3RoZXJLZXlDb21ibyAhPT0gJ3N0cmluZycgJiZcbiAgICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnb2JqZWN0J1xuICAgICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIGlmICh0eXBlb2Ygb3RoZXJLZXlDb21ibyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG90aGVyS2V5Q29tYm8gPSBuZXcgS2V5Q29tYm8ob3RoZXJLZXlDb21ibyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3ViQ29tYm9zLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3MubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmICh0aGlzLnN1YkNvbWJvc1tpXS5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3Qgc3ViQ29tYm8gICAgICA9IHRoaXMuc3ViQ29tYm9zW2ldO1xuICAgICAgY29uc3Qgb3RoZXJTdWJDb21ibyA9IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLnNsaWNlKDApO1xuXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHN1YkNvbWJvLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGNvbnN0IGtleU5hbWUgPSBzdWJDb21ib1tqXTtcbiAgICAgICAgY29uc3QgaW5kZXggICA9IG90aGVyU3ViQ29tYm8uaW5kZXhPZihrZXlOYW1lKTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIG90aGVyU3ViQ29tYm8uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG90aGVyU3ViQ29tYm8ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBfY2hlY2tTdWJDb21ibyhzdWJDb21ibywgc3RhcnRpbmdLZXlOYW1lSW5kZXgsIHByZXNzZWRLZXlOYW1lcykge1xuICAgIHN1YkNvbWJvID0gc3ViQ29tYm8uc2xpY2UoMCk7XG4gICAgcHJlc3NlZEtleU5hbWVzID0gcHJlc3NlZEtleU5hbWVzLnNsaWNlKHN0YXJ0aW5nS2V5TmFtZUluZGV4KTtcblxuICAgIGxldCBlbmRJbmRleCA9IHN0YXJ0aW5nS2V5TmFtZUluZGV4O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3ViQ29tYm8ubGVuZ3RoOyBpICs9IDEpIHtcblxuICAgICAgbGV0IGtleU5hbWUgPSBzdWJDb21ib1tpXTtcbiAgICAgIGlmIChrZXlOYW1lWzBdID09PSAnXFxcXCcpIHtcbiAgICAgICAgY29uc3QgZXNjYXBlZEtleU5hbWUgPSBrZXlOYW1lLnNsaWNlKDEpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgfHxcbiAgICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3JcbiAgICAgICAgKSB7XG4gICAgICAgICAga2V5TmFtZSA9IGVzY2FwZWRLZXlOYW1lO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gcHJlc3NlZEtleU5hbWVzLmluZGV4T2Yoa2V5TmFtZSk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBzdWJDb21iby5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGkgLT0gMTtcbiAgICAgICAgaWYgKGluZGV4ID4gZW5kSW5kZXgpIHtcbiAgICAgICAgICBlbmRJbmRleCA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdWJDb21iby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gZW5kSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xufVxuXG5LZXlDb21iby5jb21ib0RlbGltaW5hdG9yID0gJz4nO1xuS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IgICA9ICcrJztcblxuS2V5Q29tYm8ucGFyc2VDb21ib1N0ciA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyKSB7XG4gIGNvbnN0IHN1YkNvbWJvU3RycyA9IEtleUNvbWJvLl9zcGxpdFN0cihrZXlDb21ib1N0ciwgS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvcik7XG4gIGNvbnN0IGNvbWJvICAgICAgICA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwIDsgaSA8IHN1YkNvbWJvU3Rycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGNvbWJvLnB1c2goS2V5Q29tYm8uX3NwbGl0U3RyKHN1YkNvbWJvU3Ryc1tpXSwgS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IpKTtcbiAgfVxuICByZXR1cm4gY29tYm87XG59XG5cbktleUNvbWJvLl9zcGxpdFN0ciA9IGZ1bmN0aW9uKHN0ciwgZGVsaW1pbmF0b3IpIHtcbiAgY29uc3QgcyAgPSBzdHI7XG4gIGNvbnN0IGQgID0gZGVsaW1pbmF0b3I7XG4gIGxldCBjICA9ICcnO1xuICBjb25zdCBjYSA9IFtdO1xuXG4gIGZvciAobGV0IGNpID0gMDsgY2kgPCBzLmxlbmd0aDsgY2kgKz0gMSkge1xuICAgIGlmIChjaSA+IDAgJiYgc1tjaV0gPT09IGQgJiYgc1tjaSAtIDFdICE9PSAnXFxcXCcpIHtcbiAgICAgIGNhLnB1c2goYy50cmltKCkpO1xuICAgICAgYyA9ICcnO1xuICAgICAgY2kgKz0gMTtcbiAgICB9XG4gICAgYyArPSBzW2NpXTtcbiAgfVxuICBpZiAoYykgeyBjYS5wdXNoKGMudHJpbSgpKTsgfVxuXG4gIHJldHVybiBjYTtcbn07XG4iLCJpbXBvcnQgeyBLZXlDb21ibyB9IGZyb20gJy4va2V5LWNvbWJvJztcblxuXG5leHBvcnQgY2xhc3MgTG9jYWxlIHtcbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHRoaXMubG9jYWxlTmFtZSAgICAgPSBuYW1lO1xuICAgIHRoaXMucHJlc3NlZEtleXMgICAgPSBbXTtcbiAgICB0aGlzLl9hcHBsaWVkTWFjcm9zID0gW107XG4gICAgdGhpcy5fa2V5TWFwICAgICAgICA9IHt9O1xuICAgIHRoaXMuX2tpbGxLZXlDb2RlcyAgPSBbXTtcbiAgICB0aGlzLl9tYWNyb3MgICAgICAgID0gW107XG4gIH1cblxuICBiaW5kS2V5Q29kZShrZXlDb2RlLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFtrZXlOYW1lc107XG4gICAgfVxuXG4gICAgdGhpcy5fa2V5TWFwW2tleUNvZGVdID0ga2V5TmFtZXM7XG4gIH07XG5cbiAgYmluZE1hY3JvKGtleUNvbWJvU3RyLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFsga2V5TmFtZXMgXTtcbiAgICB9XG5cbiAgICBsZXQgaGFuZGxlciA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaGFuZGxlciA9IGtleU5hbWVzO1xuICAgICAga2V5TmFtZXMgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1hY3JvID0ge1xuICAgICAga2V5Q29tYm8gOiBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpLFxuICAgICAga2V5TmFtZXMgOiBrZXlOYW1lcyxcbiAgICAgIGhhbmRsZXIgIDogaGFuZGxlclxuICAgIH07XG5cbiAgICB0aGlzLl9tYWNyb3MucHVzaChtYWNybyk7XG4gIH07XG5cbiAgZ2V0S2V5Q29kZXMoa2V5TmFtZSkge1xuICAgIGNvbnN0IGtleUNvZGVzID0gW107XG4gICAgZm9yIChjb25zdCBrZXlDb2RlIGluIHRoaXMuX2tleU1hcCkge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9rZXlNYXBba2V5Q29kZV0uaW5kZXhPZihrZXlOYW1lKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7IGtleUNvZGVzLnB1c2goa2V5Q29kZXwwKTsgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5Q29kZXM7XG4gIH07XG5cbiAgZ2V0S2V5TmFtZXMoa2V5Q29kZSkge1xuICAgIHJldHVybiB0aGlzLl9rZXlNYXBba2V5Q29kZV0gfHwgW107XG4gIH07XG5cbiAgc2V0S2lsbEtleShrZXlDb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3Qga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLnNldEtpbGxLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2tpbGxLZXlDb2Rlcy5wdXNoKGtleUNvZGUpO1xuICB9O1xuXG4gIHByZXNzS2V5KGtleUNvZGUpIHtcbiAgICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMucHJlc3NLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGtleU5hbWVzID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKGtleU5hbWVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9hcHBseU1hY3JvcygpO1xuICB9O1xuXG4gIHJlbGVhc2VLZXkoa2V5Q29kZSkge1xuICAgIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlS2V5KGtleUNvZGVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGtleU5hbWVzICAgICAgICAgPSB0aGlzLmdldEtleU5hbWVzKGtleUNvZGUpO1xuICAgICAgY29uc3Qga2lsbEtleUNvZGVJbmRleCA9IHRoaXMuX2tpbGxLZXlDb2Rlcy5pbmRleE9mKGtleUNvZGUpO1xuXG4gICAgICBpZiAoa2lsbEtleUNvZGVJbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSk7XG4gICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5fY2xlYXJNYWNyb3MoKTtcbiAgICB9XG4gIH07XG5cbiAgX2FwcGx5TWFjcm9zKCkge1xuICAgIGNvbnN0IG1hY3JvcyA9IHRoaXMuX21hY3Jvcy5zbGljZSgwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgbWFjcm8gPSBtYWNyb3NbaV07XG4gICAgICBpZiAobWFjcm8ua2V5Q29tYm8uY2hlY2sodGhpcy5wcmVzc2VkS2V5cykpIHtcbiAgICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcbiAgICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG1hY3JvLmhhbmRsZXIodGhpcy5wcmVzc2VkS2V5cyk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBtYWNyby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgIGlmICh0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKG1hY3JvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5wdXNoKG1hY3JvKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgX2NsZWFyTWFjcm9zKCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fYXBwbGllZE1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgbWFjcm8gPSB0aGlzLl9hcHBsaWVkTWFjcm9zW2ldO1xuICAgICAgaWYgKCFtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChtYWNyby5oYW5kbGVyKSB7XG4gICAgICAgICAgbWFjcm8ua2V5TmFtZXMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2FwcGxpZWRNYWNyb3Muc3BsaWNlKGksIDEpO1xuICAgICAgICBpIC09IDE7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgeyBMb2NhbGUgfSBmcm9tICcuL2xvY2FsZSc7XG5pbXBvcnQgeyBLZXlDb21ibyB9IGZyb20gJy4va2V5LWNvbWJvJztcblxuXG5leHBvcnQgY2xhc3MgS2V5Ym9hcmQge1xuICBjb25zdHJ1Y3Rvcih0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcbiAgICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgICA9IG51bGw7XG4gICAgdGhpcy5fY3VycmVudENvbnRleHQgICAgICAgPSBudWxsO1xuICAgIHRoaXMuX2NvbnRleHRzICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fbGlzdGVuZXJzICAgICAgICAgICAgPSBbXTtcbiAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzICAgICA9IFtdO1xuICAgIHRoaXMuX2xvY2FsZXMgICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgICAgICAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldFdpbmRvdyAgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgICAgICA9ICcnO1xuICAgIHRoaXMuX3RhcmdldFVzZXJBZ2VudCAgICAgID0gJyc7XG4gICAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyICAgICAgPSBmYWxzZTtcbiAgICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IG51bGw7XG4gICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nICAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyAgID0gbnVsbDtcbiAgICB0aGlzLl9wYXVzZWQgICAgICAgICAgICAgICA9IGZhbHNlO1xuICAgIHRoaXMuX2NhbGxlckhhbmRsZXIgICAgICAgID0gbnVsbDtcblxuICAgIHRoaXMuc2V0Q29udGV4dCgnZ2xvYmFsJyk7XG4gICAgdGhpcy53YXRjaCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpO1xuICB9XG5cbiAgc2V0TG9jYWxlKGxvY2FsZU5hbWUsIGxvY2FsZUJ1aWxkZXIpIHtcbiAgICBsZXQgbG9jYWxlID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIGxvY2FsZU5hbWUgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgIGlmIChsb2NhbGVCdWlsZGVyKSB7XG4gICAgICAgIGxvY2FsZSA9IG5ldyBMb2NhbGUobG9jYWxlTmFtZSk7XG4gICAgICAgIGxvY2FsZUJ1aWxkZXIobG9jYWxlLCB0aGlzLl90YXJnZXRQbGF0Zm9ybSwgdGhpcy5fdGFyZ2V0VXNlckFnZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvY2FsZSA9IHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gfHwgbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbG9jYWxlICAgICA9IGxvY2FsZU5hbWU7XG4gICAgICBsb2NhbGVOYW1lID0gbG9jYWxlLl9sb2NhbGVOYW1lO1xuICAgIH1cblxuICAgIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgPSBsb2NhbGU7XG4gICAgdGhpcy5fbG9jYWxlc1tsb2NhbGVOYW1lXSA9IGxvY2FsZTtcbiAgICBpZiAobG9jYWxlKSB7XG4gICAgICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMgPSBsb2NhbGUucHJlc3NlZEtleXM7XG4gICAgfVxuICB9XG5cbiAgZ2V0TG9jYWxlKGxvY2FsTmFtZSkge1xuICAgIGxvY2FsTmFtZSB8fCAobG9jYWxOYW1lID0gdGhpcy5fbG9jYWxlLmxvY2FsZU5hbWUpO1xuICAgIHJldHVybiB0aGlzLl9sb2NhbGVzW2xvY2FsTmFtZV0gfHwgbnVsbDtcbiAgfVxuXG4gIGJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0ID0gcmVsZWFzZUhhbmRsZXI7XG4gICAgICByZWxlYXNlSGFuZGxlciAgICAgICAgID0gcHJlc3NIYW5kbGVyO1xuICAgICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA9IGtleUNvbWJvU3RyO1xuICAgICAga2V5Q29tYm9TdHIgICAgICAgICAgICA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAga2V5Q29tYm9TdHIgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICAgKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMuYmluZChrZXlDb21ib1N0cltpXSwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fbGlzdGVuZXJzLnB1c2goe1xuICAgICAga2V5Q29tYm8gICAgICAgICAgICAgICA6IGtleUNvbWJvU3RyID8gbmV3IEtleUNvbWJvKGtleUNvbWJvU3RyKSA6IG51bGwsXG4gICAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgIDogcHJlc3NIYW5kbGVyICAgICAgICAgICB8fCBudWxsLFxuICAgICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA6IHJlbGVhc2VIYW5kbGVyICAgICAgICAgfHwgbnVsbCxcbiAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgOiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlLFxuICAgICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA6IHByZXZlbnRSZXBlYXRCeURlZmF1bHQgfHwgZmFsc2VcbiAgICB9KTtcbiAgfVxuXG4gIGFkZExpc3RlbmVyKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kKC4uLmFyZ3MpO1xuICB9XG5cbiAgb24oLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLmJpbmQoLi4uYXJncyk7XG4gIH1cblxuICB1bmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZWxlYXNlSGFuZGxlciA9IHByZXNzSGFuZGxlcjtcbiAgICAgIHByZXNzSGFuZGxlciAgID0ga2V5Q29tYm9TdHI7XG4gICAgICBrZXlDb21ib1N0ciA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAga2V5Q29tYm9TdHIgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICAgKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMudW5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2xpc3RlbmVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lcnNbaV07XG5cbiAgICAgIGNvbnN0IGNvbWJvTWF0Y2hlcyAgICAgICAgICA9ICFrZXlDb21ib1N0ciAmJiAhbGlzdGVuZXIua2V5Q29tYm8gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5rZXlDb21ibyAmJiBsaXN0ZW5lci5rZXlDb21iby5pc0VxdWFsKGtleUNvbWJvU3RyKTtcbiAgICAgIGNvbnN0IHByZXNzSGFuZGxlck1hdGNoZXMgICA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJlc3NIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlc3NIYW5kbGVyID09PSBsaXN0ZW5lci5wcmVzc0hhbmRsZXI7XG4gICAgICBjb25zdCByZWxlYXNlSGFuZGxlck1hdGNoZXMgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFyZWxlYXNlSGFuZGxlciAmJiAhbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxlYXNlSGFuZGxlciA9PT0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXI7XG5cbiAgICAgIGlmIChjb21ib01hdGNoZXMgJiYgcHJlc3NIYW5kbGVyTWF0Y2hlcyAmJiByZWxlYXNlSGFuZGxlck1hdGNoZXMpIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgaSAtPSAxO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUxpc3RlbmVyKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy51bmJpbmQoLi4uYXJncyk7XG4gIH1cblxuICBvZmYoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnVuYmluZCguLi5hcmdzKTtcbiAgfVxuXG4gIHNldENvbnRleHQoY29udGV4dE5hbWUpIHtcbiAgICBpZih0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XG5cbiAgICBpZiAoIXRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXSkge1xuICAgICAgdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdID0gW107XG4gICAgfVxuICAgIHRoaXMuX2xpc3RlbmVycyAgICAgID0gdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdO1xuICAgIHRoaXMuX2N1cnJlbnRDb250ZXh0ID0gY29udGV4dE5hbWU7XG4gIH1cblxuICBnZXRDb250ZXh0KCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50Q29udGV4dDtcbiAgfVxuXG4gIHdpdGhDb250ZXh0KGNvbnRleHROYW1lLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IHByZXZpb3VzQ29udGV4dE5hbWUgPSB0aGlzLmdldENvbnRleHQoKTtcbiAgICB0aGlzLnNldENvbnRleHQoY29udGV4dE5hbWUpO1xuXG4gICAgY2FsbGJhY2soKTtcblxuICAgIHRoaXMuc2V0Q29udGV4dChwcmV2aW91c0NvbnRleHROYW1lKTtcbiAgfVxuXG4gIHdhdGNoKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgdGFyZ2V0UGxhdGZvcm0sIHRhcmdldFVzZXJBZ2VudCkge1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgY29uc3Qgd2luID0gdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsVGhpcyA6XG4gICAgICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgICAgICAgICAgICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDpcbiAgICAgICAgICAgICAgICB7fTtcblxuICAgIGlmICghdGFyZ2V0V2luZG93KSB7XG4gICAgICBpZiAoIXdpbi5hZGRFdmVudExpc3RlbmVyICYmICF3aW4uYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCB3aW5kb3cgZnVuY3Rpb25zIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQuJyk7XG4gICAgICB9XG4gICAgICB0YXJnZXRXaW5kb3cgPSB3aW47XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGVsZW1lbnQgYmluZGluZ3Mgd2hlcmUgYSB0YXJnZXQgd2luZG93IGlzIG5vdCBwYXNzZWRcbiAgICBpZiAodHlwZW9mIHRhcmdldFdpbmRvdy5ub2RlVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRhcmdldFVzZXJBZ2VudCA9IHRhcmdldFBsYXRmb3JtO1xuICAgICAgdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0RWxlbWVudDtcbiAgICAgIHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdztcbiAgICAgIHRhcmdldFdpbmRvdyAgICA9IHdpbjtcbiAgICB9XG5cbiAgICBpZiAoIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyICYmICF0YXJnZXRXaW5kb3cuYXR0YWNoRXZlbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudCBtZXRob2RzIG9uIHRhcmdldFdpbmRvdy4nKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pc01vZGVybkJyb3dzZXIgPSAhIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xuXG4gICAgY29uc3QgdXNlckFnZW50ID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcbiAgICBjb25zdCBwbGF0Zm9ybSAgPSB0YXJnZXRXaW5kb3cubmF2aWdhdG9yICYmIHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IucGxhdGZvcm0gIHx8ICcnO1xuXG4gICAgdGFyZ2V0RWxlbWVudCAgICYmIHRhcmdldEVsZW1lbnQgICAhPT0gbnVsbCB8fCAodGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93LmRvY3VtZW50KTtcbiAgICB0YXJnZXRQbGF0Zm9ybSAgJiYgdGFyZ2V0UGxhdGZvcm0gICE9PSBudWxsIHx8ICh0YXJnZXRQbGF0Zm9ybSAgPSBwbGF0Zm9ybSk7XG4gICAgdGFyZ2V0VXNlckFnZW50ICYmIHRhcmdldFVzZXJBZ2VudCAhPT0gbnVsbCB8fCAodGFyZ2V0VXNlckFnZW50ID0gdXNlckFnZW50KTtcblxuICAgIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnByZXNzS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgICAgIHRoaXMuX2hhbmRsZUNvbW1hbmRCdWcoZXZlbnQsIHBsYXRmb3JtKTtcbiAgICB9O1xuICAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy5yZWxlYXNlS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgICB9O1xuICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy5yZWxlYXNlQWxsS2V5cyhldmVudCk7XG4gICAgfTtcblxuICAgIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xuICAgIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gICAgdGhpcy5fYmluZEV2ZW50KHRhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICAgIHRoaXMuX3RhcmdldEVsZW1lbnQgICA9IHRhcmdldEVsZW1lbnQ7XG4gICAgdGhpcy5fdGFyZ2V0V2luZG93ICAgID0gdGFyZ2V0V2luZG93O1xuICAgIHRoaXMuX3RhcmdldFBsYXRmb3JtICA9IHRhcmdldFBsYXRmb3JtO1xuICAgIHRoaXMuX3RhcmdldFVzZXJBZ2VudCA9IHRhcmdldFVzZXJBZ2VudDtcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgaWYgKCF0aGlzLl90YXJnZXRFbGVtZW50IHx8ICF0aGlzLl90YXJnZXRXaW5kb3cpIHsgcmV0dXJuOyB9XG5cbiAgICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5dXAnLCAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyk7XG4gICAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuICAgIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICAgIHRoaXMuX3RhcmdldFdpbmRvdyAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldEVsZW1lbnQgPSBudWxsO1xuICB9XG5cbiAgcHJlc3NLZXkoa2V5Q29kZSwgZXZlbnQpIHtcbiAgICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICAgIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxuXG4gICAgdGhpcy5fbG9jYWxlLnByZXNzS2V5KGtleUNvZGUpO1xuICAgIHRoaXMuX2FwcGx5QmluZGluZ3MoZXZlbnQpO1xuICB9XG5cbiAgcmVsZWFzZUtleShrZXlDb2RlLCBldmVudCkge1xuICAgIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gICAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgICB0aGlzLl9sb2NhbGUucmVsZWFzZUtleShrZXlDb2RlKTtcbiAgICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcbiAgfVxuXG4gIHJlbGVhc2VBbGxLZXlzKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICAgIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5sZW5ndGggPSAwO1xuICAgIHRoaXMuX2NsZWFyQmluZGluZ3MoZXZlbnQpO1xuICB9XG5cbiAgcGF1c2UoKSB7XG4gICAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgICBpZiAodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxuICAgIHRoaXMuX3BhdXNlZCA9IHRydWU7XG4gIH1cblxuICByZXN1bWUoKSB7XG4gICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XG4gIH1cblxuICBfYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xuICAgICAgdGFyZ2V0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcbiAgICAgIHRhcmdldEVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICBfdW5iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XG4gICAgICB0YXJnZXRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxuICAgICAgdGFyZ2V0RWxlbWVudC5kZXRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgfVxuXG4gIF9nZXRHcm91cGVkTGlzdGVuZXJzKCkge1xuICAgIGNvbnN0IGxpc3RlbmVyR3JvdXBzICAgPSBbXTtcbiAgICBjb25zdCBsaXN0ZW5lckdyb3VwTWFwID0gW107XG5cbiAgICBsZXQgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuICAgIGlmICh0aGlzLl9jdXJyZW50Q29udGV4dCAhPT0gJ2dsb2JhbCcpIHtcbiAgICAgIGxpc3RlbmVycyA9IFsuLi5saXN0ZW5lcnMsIC4uLnRoaXMuX2NvbnRleHRzLmdsb2JhbF07XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLnNvcnQoXG4gICAgICAoYSwgYikgPT5cbiAgICAgICAgKGIua2V5Q29tYm8gPyBiLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApIC1cbiAgICAgICAgKGEua2V5Q29tYm8gPyBhLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApXG4gICAgKS5mb3JFYWNoKChsKSA9PiB7XG4gICAgICBsZXQgbWFwSW5kZXggPSAtMTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAobGlzdGVuZXJHcm91cE1hcFtpXSA9PT0gbnVsbCAmJiBsLmtleUNvbWJvID09PSBudWxsIHx8XG4gICAgICAgICAgICBsaXN0ZW5lckdyb3VwTWFwW2ldICE9PSBudWxsICYmIGxpc3RlbmVyR3JvdXBNYXBbaV0uaXNFcXVhbChsLmtleUNvbWJvKSkge1xuICAgICAgICAgIG1hcEluZGV4ID0gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1hcEluZGV4ID09PSAtMSkge1xuICAgICAgICBtYXBJbmRleCA9IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoO1xuICAgICAgICBsaXN0ZW5lckdyb3VwTWFwLnB1c2gobC5rZXlDb21ibyk7XG4gICAgICB9XG4gICAgICBpZiAoIWxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSkge1xuICAgICAgICBsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XS5wdXNoKGwpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGxpc3RlbmVyR3JvdXBzO1xuICB9XG5cbiAgX2FwcGx5QmluZGluZ3MoZXZlbnQpIHtcbiAgICBsZXQgcHJldmVudFJlcGVhdCA9IGZhbHNlO1xuXG4gICAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xuICAgIGV2ZW50LnByZXZlbnRSZXBlYXQgPSAoKSA9PiB7IHByZXZlbnRSZXBlYXQgPSB0cnVlOyB9O1xuICAgIGV2ZW50LnByZXNzZWRLZXlzICAgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG5cbiAgICBjb25zdCBwcmVzc2VkS2V5cyAgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcbiAgICBjb25zdCBsaXN0ZW5lckdyb3VwcyA9IHRoaXMuX2dldEdyb3VwZWRMaXN0ZW5lcnMoKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IGxpc3RlbmVyR3JvdXBzW2ldO1xuICAgICAgY29uc3Qga2V5Q29tYm8gID0gbGlzdGVuZXJzWzBdLmtleUNvbWJvO1xuXG4gICAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwga2V5Q29tYm8uY2hlY2socHJlc3NlZEtleXMpKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbGlzdGVuZXJzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgbGV0IGxpc3RlbmVyID0gbGlzdGVuZXJzW2pdO1xuXG4gICAgICAgICAgaWYgKGtleUNvbWJvID09PSBudWxsKSB7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHtcbiAgICAgICAgICAgICAga2V5Q29tYm8gICAgICAgICAgICAgICA6IG5ldyBLZXlDb21ibyhwcmVzc2VkS2V5cy5qb2luKCcrJykpLFxuICAgICAgICAgICAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgIDogbGlzdGVuZXIucHJlc3NIYW5kbGVyLFxuICAgICAgICAgICAgICByZWxlYXNlSGFuZGxlciAgICAgICAgIDogbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIsXG4gICAgICAgICAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgOiBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0LFxuICAgICAgICAgICAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IDogbGlzdGVuZXIucHJldmVudFJlcGVhdEJ5RGVmYXVsdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobGlzdGVuZXIucHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmV2ZW50UmVwZWF0KSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5wcmVzc0hhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgICBpZiAocHJldmVudFJlcGVhdCkge1xuICAgICAgICAgICAgICBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0ID0gcHJldmVudFJlcGVhdDtcbiAgICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChsaXN0ZW5lci5yZWxlYXNlSGFuZGxlciAmJiB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5Q29tYm8pIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGtleUNvbWJvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHByZXNzZWRLZXlzLmluZGV4T2Yoa2V5Q29tYm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICBwcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICBqIC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyQmluZGluZ3MoZXZlbnQpIHtcbiAgICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG4gICAgZXZlbnQucHJlc3NlZEtleXMgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5fYXBwbGllZExpc3RlbmVyc1tpXTtcbiAgICAgIGNvbnN0IGtleUNvbWJvID0gbGlzdGVuZXIua2V5Q29tYm87XG4gICAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwgIWtleUNvbWJvLmNoZWNrKHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cykpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NhbGxlckhhbmRsZXIgIT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyKSB7XG4gICAgICAgICAgY29uc3Qgb2xkQ2FsbGVyID0gdGhpcy5fY2FsbGVySGFuZGxlcjtcbiAgICAgICAgICB0aGlzLl9jYWxsZXJIYW5kbGVyID0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXI7XG4gICAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IGxpc3RlbmVyLnByZXZlbnRSZXBlYXRCeURlZmF1bHQ7XG4gICAgICAgICAgbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgdGhpcy5fY2FsbGVySGFuZGxlciA9IG9sZENhbGxlcjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgaSAtPSAxO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVDb21tYW5kQnVnKGV2ZW50LCBwbGF0Zm9ybSkge1xuICAgIC8vIE9uIE1hYyB3aGVuIHRoZSBjb21tYW5kIGtleSBpcyBrZXB0IHByZXNzZWQsIGtleXVwIGlzIG5vdCB0cmlnZ2VyZWQgZm9yIGFueSBvdGhlciBrZXkuXG4gICAgLy8gSW4gdGhpcyBjYXNlIGZvcmNlIGEga2V5dXAgZm9yIG5vbi1tb2RpZmllciBrZXlzIGRpcmVjdGx5IGFmdGVyIHRoZSBrZXlwcmVzcy5cbiAgICBjb25zdCBtb2RpZmllcktleXMgPSBbXCJzaGlmdFwiLCBcImN0cmxcIiwgXCJhbHRcIiwgXCJjYXBzbG9ja1wiLCBcInRhYlwiLCBcImNvbW1hbmRcIl07XG4gICAgaWYgKHBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpICYmIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5pbmNsdWRlcyhcImNvbW1hbmRcIikgJiZcbiAgICAgICAgIW1vZGlmaWVyS2V5cy5pbmNsdWRlcyh0aGlzLl9sb2NhbGUuZ2V0S2V5TmFtZXMoZXZlbnQua2V5Q29kZSlbMF0pKSB7XG4gICAgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcoZXZlbnQpO1xuICAgIH1cbiAgfVxufVxuIiwiXG5leHBvcnQgZnVuY3Rpb24gdXMobG9jYWxlLCBwbGF0Zm9ybSwgdXNlckFnZW50KSB7XG5cbiAgLy8gZ2VuZXJhbFxuICBsb2NhbGUuYmluZEtleUNvZGUoMywgICBbJ2NhbmNlbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDgsICAgWydiYWNrc3BhY2UnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5LCAgIFsndGFiJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIsICBbJ2NsZWFyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMsICBbJ2VudGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTYsICBbJ3NoaWZ0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTcsICBbJ2N0cmwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOCwgIFsnYWx0JywgJ21lbnUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOSwgIFsncGF1c2UnLCAnYnJlYWsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMCwgIFsnY2Fwc2xvY2snXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyNywgIFsnZXNjYXBlJywgJ2VzYyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMyLCAgWydzcGFjZScsICdzcGFjZWJhciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMzLCAgWydwYWdldXAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNCwgIFsncGFnZWRvd24nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNSwgIFsnZW5kJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzYsICBbJ2hvbWUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNywgIFsnbGVmdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM4LCAgWyd1cCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM5LCAgWydyaWdodCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQwLCAgWydkb3duJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDEsICBbJ3NlbGVjdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQyLCAgWydwcmludHNjcmVlbiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQzLCAgWydleGVjdXRlJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDQsICBbJ3NuYXBzaG90J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDUsICBbJ2luc2VydCcsICdpbnMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NiwgIFsnZGVsZXRlJywgJ2RlbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ3LCAgWydoZWxwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTQ1LCBbJ3Njcm9sbGxvY2snLCAnc2Nyb2xsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTg4LCBbJ2NvbW1hJywgJywnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTAsIFsncGVyaW9kJywgJy4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTEsIFsnc2xhc2gnLCAnZm9yd2FyZHNsYXNoJywgJy8nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTIsIFsnZ3JhdmVhY2NlbnQnLCAnYCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIxOSwgWydvcGVuYnJhY2tldCcsICdbJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIwLCBbJ2JhY2tzbGFzaCcsICdcXFxcJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIxLCBbJ2Nsb3NlYnJhY2tldCcsICddJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIyLCBbJ2Fwb3N0cm9waGUnLCAnXFwnJ10pO1xuXG4gIC8vIDAtOVxuICBsb2NhbGUuYmluZEtleUNvZGUoNDgsIFsnemVybycsICcwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDksIFsnb25lJywgJzEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MCwgWyd0d28nLCAnMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUxLCBbJ3RocmVlJywgJzMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MiwgWydmb3VyJywgJzQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MywgWydmaXZlJywgJzUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NCwgWydzaXgnLCAnNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU1LCBbJ3NldmVuJywgJzcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NiwgWydlaWdodCcsICc4J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTcsIFsnbmluZScsICc5J10pO1xuXG4gIC8vIG51bXBhZFxuICBsb2NhbGUuYmluZEtleUNvZGUoOTYsIFsnbnVtemVybycsICdudW0wJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTcsIFsnbnVtb25lJywgJ251bTEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5OCwgWydudW10d28nLCAnbnVtMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk5LCBbJ251bXRocmVlJywgJ251bTMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDAsIFsnbnVtZm91cicsICdudW00J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAxLCBbJ251bWZpdmUnLCAnbnVtNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMiwgWydudW1zaXgnLCAnbnVtNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMywgWydudW1zZXZlbicsICdudW03J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA0LCBbJ251bWVpZ2h0JywgJ251bTgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDUsIFsnbnVtbmluZScsICdudW05J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA2LCBbJ251bW11bHRpcGx5JywgJ251bSonXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDcsIFsnbnVtYWRkJywgJ251bSsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDgsIFsnbnVtZW50ZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDksIFsnbnVtc3VidHJhY3QnLCAnbnVtLSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMCwgWydudW1kZWNpbWFsJywgJ251bS4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTEsIFsnbnVtZGl2aWRlJywgJ251bS8nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNDQsIFsnbnVtbG9jaycsICdudW0nXSk7XG5cbiAgLy8gZnVuY3Rpb24ga2V5c1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEyLCBbJ2YxJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEzLCBbJ2YyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE0LCBbJ2YzJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE1LCBbJ2Y0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE2LCBbJ2Y1J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE3LCBbJ2Y2J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE4LCBbJ2Y3J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE5LCBbJ2Y4J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIwLCBbJ2Y5J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIxLCBbJ2YxMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMiwgWydmMTEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjMsIFsnZjEyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI0LCBbJ2YxMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyNSwgWydmMTQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjYsIFsnZjE1J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI3LCBbJ2YxNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyOCwgWydmMTcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjksIFsnZjE4J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMwLCBbJ2YxOSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzMSwgWydmMjAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzIsIFsnZjIxJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMzLCBbJ2YyMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzNCwgWydmMjMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzUsIFsnZjI0J10pO1xuXG4gIC8vIHNlY29uZGFyeSBrZXkgc3ltYm9sc1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIGAnLCBbJ3RpbGRlJywgJ34nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMScsIFsnZXhjbGFtYXRpb24nLCAnZXhjbGFtYXRpb25wb2ludCcsICchJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDInLCBbJ2F0JywgJ0AnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMycsIFsnbnVtYmVyJywgJyMnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNCcsIFsnZG9sbGFyJywgJ2RvbGxhcnMnLCAnZG9sbGFyc2lnbicsICckJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDUnLCBbJ3BlcmNlbnQnLCAnJSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA2JywgWydjYXJldCcsICdeJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDcnLCBbJ2FtcGVyc2FuZCcsICdhbmQnLCAnJiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA4JywgWydhc3RlcmlzaycsICcqJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDknLCBbJ29wZW5wYXJlbicsICcoJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDAnLCBbJ2Nsb3NlcGFyZW4nLCAnKSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAtJywgWyd1bmRlcnNjb3JlJywgJ18nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgPScsIFsncGx1cycsICcrJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFsnLCBbJ29wZW5jdXJseWJyYWNlJywgJ29wZW5jdXJseWJyYWNrZXQnLCAneyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBdJywgWydjbG9zZWN1cmx5YnJhY2UnLCAnY2xvc2VjdXJseWJyYWNrZXQnLCAnfSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBcXFxcJywgWyd2ZXJ0aWNhbGJhcicsICd8J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDsnLCBbJ2NvbG9uJywgJzonXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXFwnJywgWydxdW90YXRpb25tYXJrJywgJ1xcJyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAhLCcsIFsnb3BlbmFuZ2xlYnJhY2tldCcsICc8J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC4nLCBbJ2Nsb3NlYW5nbGVicmFja2V0JywgJz4nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLycsIFsncXVlc3Rpb25tYXJrJywgJz8nXSk7XG5cbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSkge1xuICAgIGxvY2FsZS5iaW5kTWFjcm8oJ2NvbW1hbmQnLCBbJ21vZCcsICdtb2RpZmllciddKTtcbiAgfSBlbHNlIHtcbiAgICBsb2NhbGUuYmluZE1hY3JvKCdjdHJsJywgWydtb2QnLCAnbW9kaWZpZXInXSk7XG4gIH1cblxuICAvL2EteiBhbmQgQS1aXG4gIGZvciAobGV0IGtleUNvZGUgPSA2NTsga2V5Q29kZSA8PSA5MDsga2V5Q29kZSArPSAxKSB7XG4gICAgdmFyIGtleU5hbWUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleUNvZGUgKyAzMik7XG4gICAgdmFyIGNhcGl0YWxLZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlKTtcbiAgXHRsb2NhbGUuYmluZEtleUNvZGUoa2V5Q29kZSwga2V5TmFtZSk7XG4gIFx0bG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAnICsga2V5TmFtZSwgY2FwaXRhbEtleU5hbWUpO1xuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ2NhcHNsb2NrICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcbiAgfVxuXG4gIC8vIGJyb3dzZXIgY2F2ZWF0c1xuICBjb25zdCBzZW1pY29sb25LZXlDb2RlID0gdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykgPyA1OSAgOiAxODY7XG4gIGNvbnN0IGRhc2hLZXlDb2RlICAgICAgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDE3MyA6IDE4OTtcbiAgY29uc3QgZXF1YWxLZXlDb2RlICAgICA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gNjEgIDogMTg3O1xuICBsZXQgbGVmdENvbW1hbmRLZXlDb2RlO1xuICBsZXQgcmlnaHRDb21tYW5kS2V5Q29kZTtcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiAodXNlckFnZW50Lm1hdGNoKCdTYWZhcmknKSB8fCB1c2VyQWdlbnQubWF0Y2goJ0Nocm9tZScpKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSA5MTtcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gOTM7XG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdPcGVyYScpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDE3O1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSAxNztcbiAgfSBlbHNlIGlmKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSAyMjQ7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDIyNDtcbiAgfVxuICBsb2NhbGUuYmluZEtleUNvZGUoc2VtaWNvbG9uS2V5Q29kZSwgICAgWydzZW1pY29sb24nLCAnOyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGRhc2hLZXlDb2RlLCAgICAgICAgIFsnZGFzaCcsICctJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoZXF1YWxLZXlDb2RlLCAgICAgICAgWydlcXVhbCcsICdlcXVhbHNpZ24nLCAnPSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGxlZnRDb21tYW5kS2V5Q29kZSwgIFsnY29tbWFuZCcsICd3aW5kb3dzJywgJ3dpbicsICdzdXBlcicsICdsZWZ0Y29tbWFuZCcsICdsZWZ0d2luZG93cycsICdsZWZ0d2luJywgJ2xlZnRzdXBlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKHJpZ2h0Q29tbWFuZEtleUNvZGUsIFsnY29tbWFuZCcsICd3aW5kb3dzJywgJ3dpbicsICdzdXBlcicsICdyaWdodGNvbW1hbmQnLCAncmlnaHR3aW5kb3dzJywgJ3JpZ2h0d2luJywgJ3JpZ2h0c3VwZXInXSk7XG5cbiAgLy8ga2lsbCBrZXlzXG4gIGxvY2FsZS5zZXRLaWxsS2V5KCdjb21tYW5kJyk7XG59O1xuIiwiaW1wb3J0IHsgS2V5Ym9hcmQgfSBmcm9tICcuL2xpYi9rZXlib2FyZCc7XG5pbXBvcnQgeyBMb2NhbGUgfSBmcm9tICcuL2xpYi9sb2NhbGUnO1xuaW1wb3J0IHsgS2V5Q29tYm8gfSBmcm9tICcuL2xpYi9rZXktY29tYm8nO1xuaW1wb3J0IHsgdXMgfSBmcm9tICcuL2xvY2FsZXMvdXMnO1xuXG5jb25zdCBrZXlib2FyZCA9IG5ldyBLZXlib2FyZCgpO1xuXG5rZXlib2FyZC5zZXRMb2NhbGUoJ3VzJywgdXMpO1xuXG5rZXlib2FyZC5LZXlib2FyZCA9IEtleWJvYXJkO1xua2V5Ym9hcmQuTG9jYWxlID0gTG9jYWxlO1xua2V5Ym9hcmQuS2V5Q29tYm8gPSBLZXlDb21ibztcblxuZXhwb3J0IGRlZmF1bHQga2V5Ym9hcmQ7XG4iXSwibmFtZXMiOlsiS2V5Q29tYm8iLCJrZXlDb21ib1N0ciIsInNvdXJjZVN0ciIsInN1YkNvbWJvcyIsInBhcnNlQ29tYm9TdHIiLCJrZXlOYW1lcyIsInJlZHVjZSIsIm1lbW8iLCJuZXh0U3ViQ29tYm8iLCJjb25jYXQiLCJwcmVzc2VkS2V5TmFtZXMiLCJzdGFydGluZ0tleU5hbWVJbmRleCIsImkiLCJsZW5ndGgiLCJfY2hlY2tTdWJDb21ibyIsIm90aGVyS2V5Q29tYm8iLCJzdWJDb21ibyIsIm90aGVyU3ViQ29tYm8iLCJzbGljZSIsImoiLCJrZXlOYW1lIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwiZW5kSW5kZXgiLCJlc2NhcGVkS2V5TmFtZSIsImNvbWJvRGVsaW1pbmF0b3IiLCJrZXlEZWxpbWluYXRvciIsInN1YkNvbWJvU3RycyIsIl9zcGxpdFN0ciIsImNvbWJvIiwicHVzaCIsInN0ciIsImRlbGltaW5hdG9yIiwicyIsImQiLCJjIiwiY2EiLCJjaSIsInRyaW0iLCJMb2NhbGUiLCJuYW1lIiwibG9jYWxlTmFtZSIsInByZXNzZWRLZXlzIiwiX2FwcGxpZWRNYWNyb3MiLCJfa2V5TWFwIiwiX2tpbGxLZXlDb2RlcyIsIl9tYWNyb3MiLCJrZXlDb2RlIiwiaGFuZGxlciIsIm1hY3JvIiwia2V5Q29tYm8iLCJrZXlDb2RlcyIsImdldEtleUNvZGVzIiwic2V0S2lsbEtleSIsInByZXNzS2V5IiwiZ2V0S2V5TmFtZXMiLCJfYXBwbHlNYWNyb3MiLCJyZWxlYXNlS2V5Iiwia2lsbEtleUNvZGVJbmRleCIsIl9jbGVhck1hY3JvcyIsIm1hY3JvcyIsImNoZWNrIiwiS2V5Ym9hcmQiLCJ0YXJnZXRXaW5kb3ciLCJ0YXJnZXRFbGVtZW50IiwicGxhdGZvcm0iLCJ1c2VyQWdlbnQiLCJfbG9jYWxlIiwiX2N1cnJlbnRDb250ZXh0IiwiX2NvbnRleHRzIiwiX2xpc3RlbmVycyIsIl9hcHBsaWVkTGlzdGVuZXJzIiwiX2xvY2FsZXMiLCJfdGFyZ2V0RWxlbWVudCIsIl90YXJnZXRXaW5kb3ciLCJfdGFyZ2V0UGxhdGZvcm0iLCJfdGFyZ2V0VXNlckFnZW50IiwiX2lzTW9kZXJuQnJvd3NlciIsIl90YXJnZXRLZXlEb3duQmluZGluZyIsIl90YXJnZXRLZXlVcEJpbmRpbmciLCJfdGFyZ2V0UmVzZXRCaW5kaW5nIiwiX3BhdXNlZCIsIl9jYWxsZXJIYW5kbGVyIiwic2V0Q29udGV4dCIsIndhdGNoIiwibG9jYWxlQnVpbGRlciIsImxvY2FsZSIsIl9sb2NhbGVOYW1lIiwibG9jYWxOYW1lIiwicHJlc3NIYW5kbGVyIiwicmVsZWFzZUhhbmRsZXIiLCJwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IiwiYmluZCIsInByZXZlbnRSZXBlYXQiLCJ1bmJpbmQiLCJsaXN0ZW5lciIsImNvbWJvTWF0Y2hlcyIsImlzRXF1YWwiLCJwcmVzc0hhbmRsZXJNYXRjaGVzIiwicmVsZWFzZUhhbmRsZXJNYXRjaGVzIiwiY29udGV4dE5hbWUiLCJyZWxlYXNlQWxsS2V5cyIsImNhbGxiYWNrIiwicHJldmlvdXNDb250ZXh0TmFtZSIsImdldENvbnRleHQiLCJ0YXJnZXRQbGF0Zm9ybSIsInRhcmdldFVzZXJBZ2VudCIsInN0b3AiLCJ3aW4iLCJnbG9iYWxUaGlzIiwiZ2xvYmFsIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImF0dGFjaEV2ZW50IiwiRXJyb3IiLCJub2RlVHlwZSIsIm5hdmlnYXRvciIsImRvY3VtZW50IiwiZXZlbnQiLCJfaGFuZGxlQ29tbWFuZEJ1ZyIsIl9iaW5kRXZlbnQiLCJfdW5iaW5kRXZlbnQiLCJfYXBwbHlCaW5kaW5ncyIsIl9jbGVhckJpbmRpbmdzIiwiZXZlbnROYW1lIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImRldGFjaEV2ZW50IiwibGlzdGVuZXJHcm91cHMiLCJsaXN0ZW5lckdyb3VwTWFwIiwibGlzdGVuZXJzIiwic29ydCIsImEiLCJiIiwiZm9yRWFjaCIsImwiLCJtYXBJbmRleCIsIl9nZXRHcm91cGVkTGlzdGVuZXJzIiwiam9pbiIsImNhbGwiLCJvbGRDYWxsZXIiLCJtb2RpZmllcktleXMiLCJtYXRjaCIsImluY2x1ZGVzIiwidXMiLCJiaW5kS2V5Q29kZSIsImJpbmRNYWNybyIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImNhcGl0YWxLZXlOYW1lIiwic2VtaWNvbG9uS2V5Q29kZSIsImRhc2hLZXlDb2RlIiwiZXF1YWxLZXlDb2RlIiwibGVmdENvbW1hbmRLZXlDb2RlIiwicmlnaHRDb21tYW5kS2V5Q29kZSIsImtleWJvYXJkIiwic2V0TG9jYWxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQUNhQSxRQUFiO0VBQ0Usb0JBQVlDLFdBQVosRUFBeUI7RUFBQTs7RUFDdkIsU0FBS0MsU0FBTCxHQUFpQkQsV0FBakI7RUFDQSxTQUFLRSxTQUFMLEdBQWlCSCxRQUFRLENBQUNJLGFBQVQsQ0FBdUJILFdBQXZCLENBQWpCO0VBQ0EsU0FBS0ksUUFBTCxHQUFpQixLQUFLRixTQUFMLENBQWVHLE1BQWYsQ0FBc0IsVUFBQ0MsSUFBRCxFQUFPQyxZQUFQO0VBQUEsYUFDckNELElBQUksQ0FBQ0UsTUFBTCxDQUFZRCxZQUFaLENBRHFDO0VBQUEsS0FBdEIsRUFDWSxFQURaLENBQWpCO0VBRUQ7O0VBTkg7RUFBQTtFQUFBLDBCQVFRRSxlQVJSLEVBUXlCO0VBQ3JCLFVBQUlDLG9CQUFvQixHQUFHLENBQTNCOztFQUNBLFdBQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBRyxLQUFLVCxTQUFMLENBQWVVLE1BQW5DLEVBQTJDRCxDQUFDLElBQUksQ0FBaEQsRUFBbUQ7RUFDakRELFFBQUFBLG9CQUFvQixHQUFHLEtBQUtHLGNBQUwsQ0FDckIsS0FBS1gsU0FBTCxDQUFlUyxDQUFmLENBRHFCLEVBRXJCRCxvQkFGcUIsRUFHckJELGVBSHFCLENBQXZCOztFQUtBLFlBQUlDLG9CQUFvQixLQUFLLENBQUMsQ0FBOUIsRUFBaUM7RUFBRSxpQkFBTyxLQUFQO0VBQWU7RUFDbkQ7O0VBQ0QsYUFBTyxJQUFQO0VBQ0Q7RUFuQkg7RUFBQTtFQUFBLDRCQXFCVUksYUFyQlYsRUFxQnlCO0VBQ3JCLFVBQ0UsQ0FBQ0EsYUFBRCxJQUNBLE9BQU9BLGFB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
