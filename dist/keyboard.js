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
    function Keyboard(targetWindow, targetElement, targetPlatform, targetUserAgent) {
      _classCallCheck(this, Keyboard);

      this._locale = null;
      this._currentContext = '';
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
      this._contexts.global = {
        listeners: this._listeners,
        targetWindow: targetWindow,
        targetElement: targetElement,
        targetPlatform: targetPlatform,
        targetUserAgent: targetUserAgent
      };
      this.setContext('global');
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
          var globalContext = this._contexts.global;
          this._contexts[contextName] = {
            listeners: [],
            targetWindow: globalContext.targetWindow,
            targetElement: globalContext.targetElement,
            targetPlatform: globalContext.targetPlatform,
            targetUserAgent: globalContext.targetUserAgent
          };
        }

        var context = this._contexts[contextName];
        this._currentContext = contextName;
        this._listeners = context.listeners;
        this.stop();
        this.watch(context.targetWindow, context.targetElement, context.targetPlatform, context.targetUserAgent);
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
        var currentContext = this._contexts[this._currentContext];
        currentContext.targetWindow = this._targetWindow;
        currentContext.targetElement = this._targetElement;
        currentContext.targetPlatform = this._targetPlatform;
        currentContext.targetUserAgent = this._targetUserAgent;
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
          listeners = [].concat(_toConsumableArray(listeners), _toConsumableArray(this._contexts.global.listeners));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9rZXktY29tYm8uanMiLCIuLi9saWIvbG9jYWxlLmpzIiwiLi4vbGliL2tleWJvYXJkLmpzIiwiLi4vbG9jYWxlcy91cy5qcyIsIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuZXhwb3J0IGNsYXNzIEtleUNvbWJvIHtcbiAgY29uc3RydWN0b3Ioa2V5Q29tYm9TdHIpIHtcbiAgICB0aGlzLnNvdXJjZVN0ciA9IGtleUNvbWJvU3RyO1xuICAgIHRoaXMuc3ViQ29tYm9zID0gS2V5Q29tYm8ucGFyc2VDb21ib1N0cihrZXlDb21ib1N0cik7XG4gICAgdGhpcy5rZXlOYW1lcyAgPSB0aGlzLnN1YkNvbWJvcy5yZWR1Y2UoKG1lbW8sIG5leHRTdWJDb21ibykgPT5cbiAgICAgIG1lbW8uY29uY2F0KG5leHRTdWJDb21ibyksIFtdKTtcbiAgfVxuXG4gIGNoZWNrKHByZXNzZWRLZXlOYW1lcykge1xuICAgIGxldCBzdGFydGluZ0tleU5hbWVJbmRleCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSB0aGlzLl9jaGVja1N1YkNvbWJvKFxuICAgICAgICB0aGlzLnN1YkNvbWJvc1tpXSxcbiAgICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXgsXG4gICAgICAgIHByZXNzZWRLZXlOYW1lc1xuICAgICAgKTtcbiAgICAgIGlmIChzdGFydGluZ0tleU5hbWVJbmRleCA9PT0gLTEpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIGlzRXF1YWwob3RoZXJLZXlDb21ibykge1xuICAgIGlmIChcbiAgICAgICFvdGhlcktleUNvbWJvIHx8XG4gICAgICB0eXBlb2Ygb3RoZXJLZXlDb21ibyAhPT0gJ3N0cmluZycgJiZcbiAgICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnb2JqZWN0J1xuICAgICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIGlmICh0eXBlb2Ygb3RoZXJLZXlDb21ibyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG90aGVyS2V5Q29tYm8gPSBuZXcgS2V5Q29tYm8ob3RoZXJLZXlDb21ibyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3ViQ29tYm9zLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3MubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmICh0aGlzLnN1YkNvbWJvc1tpXS5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3Qgc3ViQ29tYm8gICAgICA9IHRoaXMuc3ViQ29tYm9zW2ldO1xuICAgICAgY29uc3Qgb3RoZXJTdWJDb21ibyA9IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLnNsaWNlKDApO1xuXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHN1YkNvbWJvLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGNvbnN0IGtleU5hbWUgPSBzdWJDb21ib1tqXTtcbiAgICAgICAgY29uc3QgaW5kZXggICA9IG90aGVyU3ViQ29tYm8uaW5kZXhPZihrZXlOYW1lKTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIG90aGVyU3ViQ29tYm8uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG90aGVyU3ViQ29tYm8ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBfY2hlY2tTdWJDb21ibyhzdWJDb21ibywgc3RhcnRpbmdLZXlOYW1lSW5kZXgsIHByZXNzZWRLZXlOYW1lcykge1xuICAgIHN1YkNvbWJvID0gc3ViQ29tYm8uc2xpY2UoMCk7XG4gICAgcHJlc3NlZEtleU5hbWVzID0gcHJlc3NlZEtleU5hbWVzLnNsaWNlKHN0YXJ0aW5nS2V5TmFtZUluZGV4KTtcblxuICAgIGxldCBlbmRJbmRleCA9IHN0YXJ0aW5nS2V5TmFtZUluZGV4O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3ViQ29tYm8ubGVuZ3RoOyBpICs9IDEpIHtcblxuICAgICAgbGV0IGtleU5hbWUgPSBzdWJDb21ib1tpXTtcbiAgICAgIGlmIChrZXlOYW1lWzBdID09PSAnXFxcXCcpIHtcbiAgICAgICAgY29uc3QgZXNjYXBlZEtleU5hbWUgPSBrZXlOYW1lLnNsaWNlKDEpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgfHxcbiAgICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3JcbiAgICAgICAgKSB7XG4gICAgICAgICAga2V5TmFtZSA9IGVzY2FwZWRLZXlOYW1lO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gcHJlc3NlZEtleU5hbWVzLmluZGV4T2Yoa2V5TmFtZSk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBzdWJDb21iby5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGkgLT0gMTtcbiAgICAgICAgaWYgKGluZGV4ID4gZW5kSW5kZXgpIHtcbiAgICAgICAgICBlbmRJbmRleCA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdWJDb21iby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gZW5kSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xufVxuXG5LZXlDb21iby5jb21ib0RlbGltaW5hdG9yID0gJz4nO1xuS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IgICA9ICcrJztcblxuS2V5Q29tYm8ucGFyc2VDb21ib1N0ciA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyKSB7XG4gIGNvbnN0IHN1YkNvbWJvU3RycyA9IEtleUNvbWJvLl9zcGxpdFN0cihrZXlDb21ib1N0ciwgS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvcik7XG4gIGNvbnN0IGNvbWJvICAgICAgICA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwIDsgaSA8IHN1YkNvbWJvU3Rycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGNvbWJvLnB1c2goS2V5Q29tYm8uX3NwbGl0U3RyKHN1YkNvbWJvU3Ryc1tpXSwgS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IpKTtcbiAgfVxuICByZXR1cm4gY29tYm87XG59XG5cbktleUNvbWJvLl9zcGxpdFN0ciA9IGZ1bmN0aW9uKHN0ciwgZGVsaW1pbmF0b3IpIHtcbiAgY29uc3QgcyAgPSBzdHI7XG4gIGNvbnN0IGQgID0gZGVsaW1pbmF0b3I7XG4gIGxldCBjICA9ICcnO1xuICBjb25zdCBjYSA9IFtdO1xuXG4gIGZvciAobGV0IGNpID0gMDsgY2kgPCBzLmxlbmd0aDsgY2kgKz0gMSkge1xuICAgIGlmIChjaSA+IDAgJiYgc1tjaV0gPT09IGQgJiYgc1tjaSAtIDFdICE9PSAnXFxcXCcpIHtcbiAgICAgIGNhLnB1c2goYy50cmltKCkpO1xuICAgICAgYyA9ICcnO1xuICAgICAgY2kgKz0gMTtcbiAgICB9XG4gICAgYyArPSBzW2NpXTtcbiAgfVxuICBpZiAoYykgeyBjYS5wdXNoKGMudHJpbSgpKTsgfVxuXG4gIHJldHVybiBjYTtcbn07XG4iLCJpbXBvcnQgeyBLZXlDb21ibyB9IGZyb20gJy4va2V5LWNvbWJvJztcblxuXG5leHBvcnQgY2xhc3MgTG9jYWxlIHtcbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHRoaXMubG9jYWxlTmFtZSAgICAgICAgICA9IG5hbWU7XG4gICAgdGhpcy5hY3RpdmVUYXJnZXRLZXlzID0gW107XG4gICAgdGhpcy5wcmVzc2VkS2V5cyAgICAgICAgID0gW107XG4gICAgdGhpcy5fYXBwbGllZE1hY3JvcyAgICAgID0gW107XG4gICAgdGhpcy5fa2V5TWFwICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fa2lsbEtleUNvZGVzICAgICAgID0gW107XG4gICAgdGhpcy5fbWFjcm9zICAgICAgICAgICAgID0gW107XG4gIH1cblxuICBiaW5kS2V5Q29kZShrZXlDb2RlLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFtrZXlOYW1lc107XG4gICAgfVxuXG4gICAgdGhpcy5fa2V5TWFwW2tleUNvZGVdID0ga2V5TmFtZXM7XG4gIH07XG5cbiAgYmluZE1hY3JvKGtleUNvbWJvU3RyLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFsga2V5TmFtZXMgXTtcbiAgICB9XG5cbiAgICBsZXQgaGFuZGxlciA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaGFuZGxlciA9IGtleU5hbWVzO1xuICAgICAga2V5TmFtZXMgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1hY3JvID0ge1xuICAgICAga2V5Q29tYm8gOiBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpLFxuICAgICAga2V5TmFtZXMgOiBrZXlOYW1lcyxcbiAgICAgIGhhbmRsZXIgIDogaGFuZGxlclxuICAgIH07XG5cbiAgICB0aGlzLl9tYWNyb3MucHVzaChtYWNybyk7XG4gIH07XG5cbiAgZ2V0S2V5Q29kZXMoa2V5TmFtZSkge1xuICAgIGNvbnN0IGtleUNvZGVzID0gW107XG4gICAgZm9yIChjb25zdCBrZXlDb2RlIGluIHRoaXMuX2tleU1hcCkge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9rZXlNYXBba2V5Q29kZV0uaW5kZXhPZihrZXlOYW1lKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7IGtleUNvZGVzLnB1c2goa2V5Q29kZXwwKTsgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5Q29kZXM7XG4gIH07XG5cbiAgZ2V0S2V5TmFtZXMoa2V5Q29kZSkge1xuICAgIHJldHVybiB0aGlzLl9rZXlNYXBba2V5Q29kZV0gfHwgW107XG4gIH07XG5cbiAgc2V0S2lsbEtleShrZXlDb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3Qga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLnNldEtpbGxLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2tpbGxLZXlDb2Rlcy5wdXNoKGtleUNvZGUpO1xuICB9O1xuXG4gIHByZXNzS2V5KGtleUNvZGUpIHtcbiAgICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMucHJlc3NLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYWN0aXZlVGFyZ2V0S2V5cy5sZW5ndGggPSAwO1xuICAgIGNvbnN0IGtleU5hbWVzID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLmFjdGl2ZVRhcmdldEtleXMucHVzaChrZXlOYW1lc1tpXSk7XG4gICAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKGtleU5hbWVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9hcHBseU1hY3JvcygpO1xuICB9O1xuXG4gIHJlbGVhc2VLZXkoa2V5Q29kZSkge1xuICAgIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlS2V5KGtleUNvZGVzW2ldKTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBrZXlOYW1lcyAgICAgICAgID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICAgIGNvbnN0IGtpbGxLZXlDb2RlSW5kZXggPSB0aGlzLl9raWxsS2V5Q29kZXMuaW5kZXhPZihrZXlDb2RlKTtcblxuICAgICAgaWYgKGtpbGxLZXlDb2RlSW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSk7XG4gICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hY3RpdmVUYXJnZXRLZXlzLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLl9jbGVhck1hY3JvcygpO1xuICAgIH1cbiAgfTtcblxuICBfYXBwbHlNYWNyb3MoKSB7XG4gICAgY29uc3QgbWFjcm9zID0gdGhpcy5fbWFjcm9zLnNsaWNlKDApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWFjcm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBtYWNybyA9IG1hY3Jvc1tpXTtcbiAgICAgIGlmIChtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xuICAgICAgICBpZiAobWFjcm8uaGFuZGxlcikge1xuICAgICAgICAgIG1hY3JvLmtleU5hbWVzID0gbWFjcm8uaGFuZGxlcih0aGlzLnByZXNzZWRLZXlzKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgaWYgKHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihtYWNyby5rZXlOYW1lc1tqXSkgPT09IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnB1c2gobWFjcm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9hcHBsaWVkTWFjcm9zLnB1c2gobWFjcm8pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBfY2xlYXJNYWNyb3MoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9hcHBsaWVkTWFjcm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBtYWNybyA9IHRoaXMuX2FwcGxpZWRNYWNyb3NbaV07XG4gICAgICBpZiAoIW1hY3JvLmtleUNvbWJvLmNoZWNrKHRoaXMucHJlc3NlZEtleXMpKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbWFjcm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihtYWNyby5rZXlOYW1lc1tqXSk7XG4gICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcbiAgICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGkgLT0gMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IExvY2FsZSB9IGZyb20gJy4vbG9jYWxlJztcbmltcG9ydCB7IEtleUNvbWJvIH0gZnJvbSAnLi9rZXktY29tYm8nO1xuXG5cbmV4cG9ydCBjbGFzcyBLZXlib2FyZCB7XG4gIGNvbnN0cnVjdG9yKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgdGFyZ2V0UGxhdGZvcm0sIHRhcmdldFVzZXJBZ2VudCkge1xuICAgIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50Q29udGV4dCAgICAgICA9ICcnO1xuICAgIHRoaXMuX2NvbnRleHRzICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fbGlzdGVuZXJzICAgICAgICAgICAgPSBbXTtcbiAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzICAgICA9IFtdO1xuICAgIHRoaXMuX2xvY2FsZXMgICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgICAgICAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldFdpbmRvdyAgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgICAgICA9ICcnO1xuICAgIHRoaXMuX3RhcmdldFVzZXJBZ2VudCAgICAgID0gJyc7XG4gICAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyICAgICAgPSBmYWxzZTtcbiAgICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IG51bGw7XG4gICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nICAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyAgID0gbnVsbDtcbiAgICB0aGlzLl9wYXVzZWQgICAgICAgICAgICAgICA9IGZhbHNlO1xuXG4gICAgdGhpcy5fY29udGV4dHMuZ2xvYmFsID0ge1xuICAgICAgbGlzdGVuZXJzOiB0aGlzLl9saXN0ZW5lcnMsXG4gICAgICB0YXJnZXRXaW5kb3csXG4gICAgICB0YXJnZXRFbGVtZW50LFxuICAgICAgdGFyZ2V0UGxhdGZvcm0sXG4gICAgICB0YXJnZXRVc2VyQWdlbnRcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRDb250ZXh0KCdnbG9iYWwnKTtcbiAgfVxuXG4gIHNldExvY2FsZShsb2NhbGVOYW1lLCBsb2NhbGVCdWlsZGVyKSB7XG4gICAgbGV0IGxvY2FsZSA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiBsb2NhbGVOYW1lID09PSAnc3RyaW5nJykge1xuXG4gICAgICBpZiAobG9jYWxlQnVpbGRlcikge1xuICAgICAgICBsb2NhbGUgPSBuZXcgTG9jYWxlKGxvY2FsZU5hbWUpO1xuICAgICAgICBsb2NhbGVCdWlsZGVyKGxvY2FsZSwgdGhpcy5fdGFyZ2V0UGxhdGZvcm0sIHRoaXMuX3RhcmdldFVzZXJBZ2VudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2NhbGUgPSB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdIHx8IG51bGw7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsZSAgICAgPSBsb2NhbGVOYW1lO1xuICAgICAgbG9jYWxlTmFtZSA9IGxvY2FsZS5fbG9jYWxlTmFtZTtcbiAgICB9XG5cbiAgICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgID0gbG9jYWxlO1xuICAgIHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gPSBsb2NhbGU7XG4gICAgaWYgKGxvY2FsZSkge1xuICAgICAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzID0gbG9jYWxlLnByZXNzZWRLZXlzO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0TG9jYWxlKGxvY2FsTmFtZSkge1xuICAgIGxvY2FsTmFtZSB8fCAobG9jYWxOYW1lID0gdGhpcy5fbG9jYWxlLmxvY2FsZU5hbWUpO1xuICAgIHJldHVybiB0aGlzLl9sb2NhbGVzW2xvY2FsTmFtZV0gfHwgbnVsbDtcbiAgfVxuXG4gIGJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0ID0gcmVsZWFzZUhhbmRsZXI7XG4gICAgICByZWxlYXNlSGFuZGxlciAgICAgICAgID0gcHJlc3NIYW5kbGVyO1xuICAgICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA9IGtleUNvbWJvU3RyO1xuICAgICAga2V5Q29tYm9TdHIgICAgICAgICAgICA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAga2V5Q29tYm9TdHIgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICAgKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMuYmluZChrZXlDb21ib1N0cltpXSwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl9saXN0ZW5lcnMucHVzaCh7XG4gICAgICBrZXlDb21ibyAgICAgICAgICAgICAgOiBrZXlDb21ib1N0ciA/IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0cikgOiBudWxsLFxuICAgICAgcHJlc3NIYW5kbGVyICAgICAgICAgIDogcHJlc3NIYW5kbGVyICAgICAgICAgICB8fCBudWxsLFxuICAgICAgcmVsZWFzZUhhbmRsZXIgICAgICAgIDogcmVsZWFzZUhhbmRsZXIgICAgICAgICB8fCBudWxsLFxuICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgIDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZSxcbiAgICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQ6IHByZXZlbnRSZXBlYXRCeURlZmF1bHQgfHwgZmFsc2UsXG4gICAgICBleGVjdXRpbmdIYW5kbGVyICAgICAgOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRMaXN0ZW5lcihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCkge1xuICAgIHJldHVybiB0aGlzLmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpO1xuICB9XG5cbiAgb24oa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KTtcbiAgfVxuXG4gIGJpbmRQcmVzcyhrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XG4gICAgcmV0dXJuIHRoaXMuYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCBudWxsLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KTtcbiAgfVxuXG4gIGJpbmRSZWxlYXNlKGtleUNvbWJvU3RyLCByZWxlYXNlSGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLmJpbmQoa2V5Q29tYm9TdHIsIG51bGwsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KTtcbiAgfVxuXG4gIHVuYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcikge1xuICAgIGlmIChrZXlDb21ib1N0ciA9PT0gbnVsbCB8fCB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlbGVhc2VIYW5kbGVyID0gcHJlc3NIYW5kbGVyO1xuICAgICAgcHJlc3NIYW5kbGVyICAgPSBrZXlDb21ib1N0cjtcbiAgICAgIGtleUNvbWJvU3RyID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBrZXlDb21ib1N0ciAmJlxuICAgICAgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcbiAgICApIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5Q29tYm9TdHIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy51bmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5fbGlzdGVuZXJzW2ldO1xuXG4gICAgICBjb25zdCBjb21ib01hdGNoZXMgICAgICAgICAgPSAha2V5Q29tYm9TdHIgJiYgIWxpc3RlbmVyLmtleUNvbWJvIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIua2V5Q29tYm8gJiYgbGlzdGVuZXIua2V5Q29tYm8uaXNFcXVhbChrZXlDb21ib1N0cik7XG4gICAgICBjb25zdCBwcmVzc0hhbmRsZXJNYXRjaGVzICAgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFwcmVzc0hhbmRsZXIgJiYgIWxpc3RlbmVyLnByZXNzSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXNzSGFuZGxlciA9PT0gbGlzdGVuZXIucHJlc3NIYW5kbGVyO1xuICAgICAgY29uc3QgcmVsZWFzZUhhbmRsZXJNYXRjaGVzID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcmVsZWFzZUhhbmRsZXIgJiYgIWxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsZWFzZUhhbmRsZXIgPT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyO1xuXG4gICAgICBpZiAoY29tYm9NYXRjaGVzICYmIHByZXNzSGFuZGxlck1hdGNoZXMgJiYgcmVsZWFzZUhhbmRsZXJNYXRjaGVzKSB7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGkgLT0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbW92ZUxpc3RlbmVyKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMudW5iaW5kKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgfVxuXG4gIG9mZihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLnVuYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XG4gIH1cblxuICBzZXRDb250ZXh0KGNvbnRleHROYW1lKSB7XG4gICAgaWYodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxuXG4gICAgaWYgKCF0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0pIHtcbiAgICAgIGNvbnN0IGdsb2JhbENvbnRleHQgPSB0aGlzLl9jb250ZXh0cy5nbG9iYWw7XG4gICAgICB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0gPSB7XG4gICAgICAgIGxpc3RlbmVycyAgICAgIDogW10sXG4gICAgICAgIHRhcmdldFdpbmRvdyAgIDogZ2xvYmFsQ29udGV4dC50YXJnZXRXaW5kb3csXG4gICAgICAgIHRhcmdldEVsZW1lbnQgIDogZ2xvYmFsQ29udGV4dC50YXJnZXRFbGVtZW50LFxuICAgICAgICB0YXJnZXRQbGF0Zm9ybSA6IGdsb2JhbENvbnRleHQudGFyZ2V0UGxhdGZvcm0sXG4gICAgICAgIHRhcmdldFVzZXJBZ2VudDogZ2xvYmFsQ29udGV4dC50YXJnZXRVc2VyQWdlbnRcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgY29udGV4dCAgICAgICAgPSB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV07XG4gICAgdGhpcy5fY3VycmVudENvbnRleHQgPSBjb250ZXh0TmFtZTtcbiAgICB0aGlzLl9saXN0ZW5lcnMgICAgICA9IGNvbnRleHQubGlzdGVuZXJzO1xuXG4gICAgdGhpcy5zdG9wKCk7XG4gICAgdGhpcy53YXRjaChcbiAgICAgIGNvbnRleHQudGFyZ2V0V2luZG93LFxuICAgICAgY29udGV4dC50YXJnZXRFbGVtZW50LFxuICAgICAgY29udGV4dC50YXJnZXRQbGF0Zm9ybSxcbiAgICAgIGNvbnRleHQudGFyZ2V0VXNlckFnZW50XG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0Q29udGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudENvbnRleHQ7XG4gIH1cblxuICB3aXRoQ29udGV4dChjb250ZXh0TmFtZSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBwcmV2aW91c0NvbnRleHROYW1lID0gdGhpcy5nZXRDb250ZXh0KCk7XG4gICAgdGhpcy5zZXRDb250ZXh0KGNvbnRleHROYW1lKTtcblxuICAgIGNhbGxiYWNrKCk7XG5cbiAgICB0aGlzLnNldENvbnRleHQocHJldmlvdXNDb250ZXh0TmFtZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHdhdGNoKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgdGFyZ2V0UGxhdGZvcm0sIHRhcmdldFVzZXJBZ2VudCkge1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgY29uc3Qgd2luID0gdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsVGhpcyA6XG4gICAgICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgICAgICAgICAgICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDpcbiAgICAgICAgICAgICAgICB7fTtcblxuICAgIGlmICghdGFyZ2V0V2luZG93KSB7XG4gICAgICBpZiAoIXdpbi5hZGRFdmVudExpc3RlbmVyICYmICF3aW4uYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCB3aW5kb3cgZnVuY3Rpb25zIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQuJyk7XG4gICAgICB9XG4gICAgICB0YXJnZXRXaW5kb3cgPSB3aW47XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGVsZW1lbnQgYmluZGluZ3Mgd2hlcmUgYSB0YXJnZXQgd2luZG93IGlzIG5vdCBwYXNzZWRcbiAgICBpZiAodHlwZW9mIHRhcmdldFdpbmRvdy5ub2RlVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRhcmdldFVzZXJBZ2VudCA9IHRhcmdldFBsYXRmb3JtO1xuICAgICAgdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0RWxlbWVudDtcbiAgICAgIHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdztcbiAgICAgIHRhcmdldFdpbmRvdyAgICA9IHdpbjtcbiAgICB9XG5cbiAgICBpZiAoIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyICYmICF0YXJnZXRXaW5kb3cuYXR0YWNoRXZlbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudCBtZXRob2RzIG9uIHRhcmdldFdpbmRvdy4nKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pc01vZGVybkJyb3dzZXIgPSAhIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xuXG4gICAgY29uc3QgdXNlckFnZW50ID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcbiAgICBjb25zdCBwbGF0Zm9ybSAgPSB0YXJnZXRXaW5kb3cubmF2aWdhdG9yICYmIHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IucGxhdGZvcm0gIHx8ICcnO1xuXG4gICAgdGFyZ2V0RWxlbWVudCAgICYmIHRhcmdldEVsZW1lbnQgICAhPT0gbnVsbCB8fCAodGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93LmRvY3VtZW50KTtcbiAgICB0YXJnZXRQbGF0Zm9ybSAgJiYgdGFyZ2V0UGxhdGZvcm0gICE9PSBudWxsIHx8ICh0YXJnZXRQbGF0Zm9ybSAgPSBwbGF0Zm9ybSk7XG4gICAgdGFyZ2V0VXNlckFnZW50ICYmIHRhcmdldFVzZXJBZ2VudCAhPT0gbnVsbCB8fCAodGFyZ2V0VXNlckFnZW50ID0gdXNlckFnZW50KTtcblxuICAgIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnByZXNzS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgICAgIHRoaXMuX2hhbmRsZUNvbW1hbmRCdWcoZXZlbnQsIHBsYXRmb3JtKTtcbiAgICB9O1xuICAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy5yZWxlYXNlS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgICB9O1xuICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy5yZWxlYXNlQWxsS2V5cyhldmVudCk7XG4gICAgfTtcblxuICAgIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xuICAgIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gICAgdGhpcy5fYmluZEV2ZW50KHRhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICAgIHRoaXMuX3RhcmdldEVsZW1lbnQgICA9IHRhcmdldEVsZW1lbnQ7XG4gICAgdGhpcy5fdGFyZ2V0V2luZG93ICAgID0gdGFyZ2V0V2luZG93O1xuICAgIHRoaXMuX3RhcmdldFBsYXRmb3JtICA9IHRhcmdldFBsYXRmb3JtO1xuICAgIHRoaXMuX3RhcmdldFVzZXJBZ2VudCA9IHRhcmdldFVzZXJBZ2VudDtcblxuICAgIGNvbnN0IGN1cnJlbnRDb250ZXh0ICAgICAgICAgICA9IHRoaXMuX2NvbnRleHRzW3RoaXMuX2N1cnJlbnRDb250ZXh0XTtcbiAgICBjdXJyZW50Q29udGV4dC50YXJnZXRXaW5kb3cgICAgPSB0aGlzLl90YXJnZXRXaW5kb3c7XG4gICAgY3VycmVudENvbnRleHQudGFyZ2V0RWxlbWVudCAgID0gdGhpcy5fdGFyZ2V0RWxlbWVudDtcbiAgICBjdXJyZW50Q29udGV4dC50YXJnZXRQbGF0Zm9ybSAgPSB0aGlzLl90YXJnZXRQbGF0Zm9ybTtcbiAgICBjdXJyZW50Q29udGV4dC50YXJnZXRVc2VyQWdlbnQgPSB0aGlzLl90YXJnZXRVc2VyQWdlbnQ7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgaWYgKCF0aGlzLl90YXJnZXRFbGVtZW50IHx8ICF0aGlzLl90YXJnZXRXaW5kb3cpIHsgcmV0dXJuOyB9XG5cbiAgICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5dXAnLCAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyk7XG4gICAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuICAgIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICAgIHRoaXMuX3RhcmdldFdpbmRvdyAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldEVsZW1lbnQgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwcmVzc0tleShrZXlDb2RlLCBldmVudCkge1xuICAgIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuIHRoaXM7IH1cbiAgICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICAgIHRoaXMuX2xvY2FsZS5wcmVzc0tleShrZXlDb2RlKTtcbiAgICB0aGlzLl9hcHBseUJpbmRpbmdzKGV2ZW50KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVsZWFzZUtleShrZXlDb2RlLCBldmVudCkge1xuICAgIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuIHRoaXM7IH1cbiAgICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICAgIHRoaXMuX2xvY2FsZS5yZWxlYXNlS2V5KGtleUNvZGUpO1xuICAgIHRoaXMuX2NsZWFyQmluZGluZ3MoZXZlbnQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZWxlYXNlQWxsS2V5cyhldmVudCkge1xuICAgIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuIHRoaXM7IH1cbiAgICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICAgIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5sZW5ndGggPSAwO1xuICAgIHRoaXMuX2NsZWFyQmluZGluZ3MoZXZlbnQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwYXVzZSgpIHtcbiAgICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybiB0aGlzOyB9XG4gICAgaWYgKHRoaXMuX2xvY2FsZSkgeyB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7IH1cbiAgICB0aGlzLl9wYXVzZWQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXN1bWUoKSB7XG4gICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMucmVsZWFzZUFsbEtleXMoKTtcbiAgICB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID0gMDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5faXNNb2Rlcm5Ccm93c2VyID9cbiAgICAgIHRhcmdldEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XG4gICAgICB0YXJnZXRFbGVtZW50LmF0dGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xuICB9XG5cbiAgX3VuYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xuICAgICAgdGFyZ2V0RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcbiAgICAgIHRhcmdldEVsZW1lbnQuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICBfZ2V0R3JvdXBlZExpc3RlbmVycygpIHtcbiAgICBjb25zdCBsaXN0ZW5lckdyb3VwcyAgID0gW107XG4gICAgY29uc3QgbGlzdGVuZXJHcm91cE1hcCA9IFtdO1xuXG4gICAgbGV0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcbiAgICBpZiAodGhpcy5fY3VycmVudENvbnRleHQgIT09ICdnbG9iYWwnKSB7XG4gICAgICBsaXN0ZW5lcnMgPSBbLi4ubGlzdGVuZXJzLCAuLi50aGlzLl9jb250ZXh0cy5nbG9iYWwubGlzdGVuZXJzXTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuc29ydChcbiAgICAgIChhLCBiKSA9PlxuICAgICAgICAoYi5rZXlDb21ibyA/IGIua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMCkgLVxuICAgICAgICAoYS5rZXlDb21ibyA/IGEua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMClcbiAgICApLmZvckVhY2goKGwpID0+IHtcbiAgICAgIGxldCBtYXBJbmRleCA9IC0xO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lckdyb3VwTWFwLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChsaXN0ZW5lckdyb3VwTWFwW2ldID09PSBudWxsICYmIGwua2V5Q29tYm8gPT09IG51bGwgfHxcbiAgICAgICAgICAgIGxpc3RlbmVyR3JvdXBNYXBbaV0gIT09IG51bGwgJiYgbGlzdGVuZXJHcm91cE1hcFtpXS5pc0VxdWFsKGwua2V5Q29tYm8pKSB7XG4gICAgICAgICAgbWFwSW5kZXggPSBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWFwSW5kZXggPT09IC0xKSB7XG4gICAgICAgIG1hcEluZGV4ID0gbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7XG4gICAgICAgIGxpc3RlbmVyR3JvdXBNYXAucHVzaChsLmtleUNvbWJvKTtcbiAgICAgIH1cbiAgICAgIGlmICghbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdKSB7XG4gICAgICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSA9IFtdO1xuICAgICAgfVxuICAgICAgbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdLnB1c2gobCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbGlzdGVuZXJHcm91cHM7XG4gIH1cblxuICBfYXBwbHlCaW5kaW5ncyhldmVudCkge1xuICAgIGxldCBwcmV2ZW50UmVwZWF0ID0gZmFsc2U7XG5cbiAgICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG4gICAgZXZlbnQucHJldmVudFJlcGVhdCA9ICgpID0+IHsgcHJldmVudFJlcGVhdCA9IHRydWU7IH07XG4gICAgZXZlbnQucHJlc3NlZEtleXMgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcblxuICAgIGNvbnN0IGFjdGl2ZVRhcmdldEtleXMgPSB0aGlzLl9sb2NhbGUuYWN0aXZlVGFyZ2V0S2V5cztcbiAgICBjb25zdCBwcmVzc2VkS2V5cyAgICAgID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xuICAgIGNvbnN0IGxpc3RlbmVyR3JvdXBzICAgPSB0aGlzLl9nZXRHcm91cGVkTGlzdGVuZXJzKCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3RlbmVyR3JvdXBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSBsaXN0ZW5lckdyb3Vwc1tpXTtcbiAgICAgIGNvbnN0IGtleUNvbWJvICA9IGxpc3RlbmVyc1swXS5rZXlDb21ibztcblxuICAgICAgaWYgKFxuICAgICAgICBrZXlDb21ibyA9PT0gbnVsbCB8fFxuICAgICAgICBrZXlDb21iby5jaGVjayhwcmVzc2VkS2V5cykgJiZcbiAgICAgICAgYWN0aXZlVGFyZ2V0S2V5cy5zb21lKGsgPT4ga2V5Q29tYm8ua2V5TmFtZXMuaW5jbHVkZXMoaykpXG4gICAgICApIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBsaXN0ZW5lcnMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICBsZXQgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbal07XG5cbiAgICAgICAgICBpZiAoIWxpc3RlbmVyLmV4ZWN1dGluZ0hhbmRsZXIgJiYgbGlzdGVuZXIucHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmV2ZW50UmVwZWF0KSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5leGVjdXRpbmdIYW5kbGVyID0gdHJ1ZTtcbiAgICAgICAgICAgIGxpc3RlbmVyLnByZXNzSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICAgIGxpc3RlbmVyLmV4ZWN1dGluZ0hhbmRsZXIgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKHByZXZlbnRSZXBlYXQgfHwgbGlzdGVuZXIucHJldmVudFJlcGVhdEJ5RGVmYXVsdCkge1xuICAgICAgICAgICAgICBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5Q29tYm8pIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGtleUNvbWJvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHByZXNzZWRLZXlzLmluZGV4T2Yoa2V5Q29tYm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICBwcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICBqIC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2NsZWFyQmluZGluZ3MoZXZlbnQpIHtcbiAgICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG4gICAgZXZlbnQucHJlc3NlZEtleXMgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5fYXBwbGllZExpc3RlbmVyc1tpXTtcbiAgICAgIGNvbnN0IGtleUNvbWJvID0gbGlzdGVuZXIua2V5Q29tYm87XG4gICAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwgIWtleUNvbWJvLmNoZWNrKHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cykpIHtcbiAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IGZhbHNlO1xuICAgICAgICBpZiAoa2V5Q29tYm8gIT09IG51bGwgfHwgZXZlbnQucHJlc3NlZEtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbGlzdGVuZXIuZXhlY3V0aW5nSGFuZGxlciAmJiBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcikge1xuICAgICAgICAgIGxpc3RlbmVyLmV4ZWN1dGluZ0hhbmRsZXIgPSB0cnVlO1xuICAgICAgICAgIGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgIGxpc3RlbmVyLmV4ZWN1dGluZ0hhbmRsZXIgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVDb21tYW5kQnVnKGV2ZW50LCBwbGF0Zm9ybSkge1xuICAgIC8vIE9uIE1hYyB3aGVuIHRoZSBjb21tYW5kIGtleSBpcyBrZXB0IHByZXNzZWQsIGtleXVwIGlzIG5vdCB0cmlnZ2VyZWQgZm9yIGFueSBvdGhlciBrZXkuXG4gICAgLy8gSW4gdGhpcyBjYXNlIGZvcmNlIGEga2V5dXAgZm9yIG5vbi1tb2RpZmllciBrZXlzIGRpcmVjdGx5IGFmdGVyIHRoZSBrZXlwcmVzcy5cbiAgICBjb25zdCBtb2RpZmllcktleXMgPSBbXCJzaGlmdFwiLCBcImN0cmxcIiwgXCJhbHRcIiwgXCJjYXBzbG9ja1wiLCBcInRhYlwiLCBcImNvbW1hbmRcIl07XG4gICAgaWYgKHBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpICYmIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5pbmNsdWRlcyhcImNvbW1hbmRcIikgJiZcbiAgICAgICAgIW1vZGlmaWVyS2V5cy5pbmNsdWRlcyh0aGlzLl9sb2NhbGUuZ2V0S2V5TmFtZXMoZXZlbnQua2V5Q29kZSlbMF0pKSB7XG4gICAgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcoZXZlbnQpO1xuICAgIH1cbiAgfVxufVxuIiwiXG5leHBvcnQgZnVuY3Rpb24gdXMobG9jYWxlLCBwbGF0Zm9ybSwgdXNlckFnZW50KSB7XG5cbiAgLy8gZ2VuZXJhbFxuICBsb2NhbGUuYmluZEtleUNvZGUoMywgICBbJ2NhbmNlbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDgsICAgWydiYWNrc3BhY2UnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5LCAgIFsndGFiJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIsICBbJ2NsZWFyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMsICBbJ2VudGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTYsICBbJ3NoaWZ0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTcsICBbJ2N0cmwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOCwgIFsnYWx0JywgJ21lbnUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOSwgIFsncGF1c2UnLCAnYnJlYWsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMCwgIFsnY2Fwc2xvY2snXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyNywgIFsnZXNjYXBlJywgJ2VzYyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMyLCAgWydzcGFjZScsICdzcGFjZWJhciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMzLCAgWydwYWdldXAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNCwgIFsncGFnZWRvd24nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNSwgIFsnZW5kJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzYsICBbJ2hvbWUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNywgIFsnbGVmdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM4LCAgWyd1cCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM5LCAgWydyaWdodCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQwLCAgWydkb3duJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDEsICBbJ3NlbGVjdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQyLCAgWydwcmludHNjcmVlbiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQzLCAgWydleGVjdXRlJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDQsICBbJ3NuYXBzaG90J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDUsICBbJ2luc2VydCcsICdpbnMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NiwgIFsnZGVsZXRlJywgJ2RlbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ3LCAgWydoZWxwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTQ1LCBbJ3Njcm9sbGxvY2snLCAnc2Nyb2xsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTg4LCBbJ2NvbW1hJywgJywnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTAsIFsncGVyaW9kJywgJy4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTEsIFsnc2xhc2gnLCAnZm9yd2FyZHNsYXNoJywgJy8nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTIsIFsnZ3JhdmVhY2NlbnQnLCAnYCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIxOSwgWydvcGVuYnJhY2tldCcsICdbJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIwLCBbJ2JhY2tzbGFzaCcsICdcXFxcJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIxLCBbJ2Nsb3NlYnJhY2tldCcsICddJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjIyLCBbJ2Fwb3N0cm9waGUnLCAnXFwnJ10pO1xuXG4gIC8vIDAtOVxuICBsb2NhbGUuYmluZEtleUNvZGUoNDgsIFsnemVybycsICcwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDksIFsnb25lJywgJzEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MCwgWyd0d28nLCAnMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUxLCBbJ3RocmVlJywgJzMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MiwgWydmb3VyJywgJzQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MywgWydmaXZlJywgJzUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NCwgWydzaXgnLCAnNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU1LCBbJ3NldmVuJywgJzcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NiwgWydlaWdodCcsICc4J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTcsIFsnbmluZScsICc5J10pO1xuXG4gIC8vIG51bXBhZFxuICBsb2NhbGUuYmluZEtleUNvZGUoOTYsIFsnbnVtemVybycsICdudW0wJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTcsIFsnbnVtb25lJywgJ251bTEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5OCwgWydudW10d28nLCAnbnVtMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk5LCBbJ251bXRocmVlJywgJ251bTMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDAsIFsnbnVtZm91cicsICdudW00J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAxLCBbJ251bWZpdmUnLCAnbnVtNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMiwgWydudW1zaXgnLCAnbnVtNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMywgWydudW1zZXZlbicsICdudW03J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA0LCBbJ251bWVpZ2h0JywgJ251bTgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDUsIFsnbnVtbmluZScsICdudW05J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA2LCBbJ251bW11bHRpcGx5JywgJ251bSonXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDcsIFsnbnVtYWRkJywgJ251bSsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDgsIFsnbnVtZW50ZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDksIFsnbnVtc3VidHJhY3QnLCAnbnVtLSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMCwgWydudW1kZWNpbWFsJywgJ251bS4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTEsIFsnbnVtZGl2aWRlJywgJ251bS8nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNDQsIFsnbnVtbG9jaycsICdudW0nXSk7XG5cbiAgLy8gZnVuY3Rpb24ga2V5c1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEyLCBbJ2YxJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEzLCBbJ2YyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE0LCBbJ2YzJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE1LCBbJ2Y0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE2LCBbJ2Y1J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE3LCBbJ2Y2J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE4LCBbJ2Y3J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTE5LCBbJ2Y4J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIwLCBbJ2Y5J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIxLCBbJ2YxMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMiwgWydmMTEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjMsIFsnZjEyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI0LCBbJ2YxMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyNSwgWydmMTQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjYsIFsnZjE1J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI3LCBbJ2YxNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyOCwgWydmMTcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjksIFsnZjE4J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMwLCBbJ2YxOSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzMSwgWydmMjAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzIsIFsnZjIxJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMzLCBbJ2YyMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzNCwgWydmMjMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzUsIFsnZjI0J10pO1xuXG4gIC8vIHNlY29uZGFyeSBrZXkgc3ltYm9sc1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIGAnLCBbJ3RpbGRlJywgJ34nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMScsIFsnZXhjbGFtYXRpb24nLCAnZXhjbGFtYXRpb25wb2ludCcsICchJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDInLCBbJ2F0JywgJ0AnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMycsIFsnbnVtYmVyJywgJyMnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNCcsIFsnZG9sbGFyJywgJ2RvbGxhcnMnLCAnZG9sbGFyc2lnbicsICckJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDUnLCBbJ3BlcmNlbnQnLCAnJSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA2JywgWydjYXJldCcsICdeJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDcnLCBbJ2FtcGVyc2FuZCcsICdhbmQnLCAnJiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA4JywgWydhc3RlcmlzaycsICcqJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDknLCBbJ29wZW5wYXJlbicsICcoJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDAnLCBbJ2Nsb3NlcGFyZW4nLCAnKSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAtJywgWyd1bmRlcnNjb3JlJywgJ18nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgPScsIFsncGx1cycsICcrJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFsnLCBbJ29wZW5jdXJseWJyYWNlJywgJ29wZW5jdXJseWJyYWNrZXQnLCAneyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBdJywgWydjbG9zZWN1cmx5YnJhY2UnLCAnY2xvc2VjdXJseWJyYWNrZXQnLCAnfSddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBcXFxcJywgWyd2ZXJ0aWNhbGJhcicsICd8J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDsnLCBbJ2NvbG9uJywgJzonXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXFwnJywgWydxdW90YXRpb25tYXJrJywgJ1xcJyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAhLCcsIFsnb3BlbmFuZ2xlYnJhY2tldCcsICc8J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC4nLCBbJ2Nsb3NlYW5nbGVicmFja2V0JywgJz4nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLycsIFsncXVlc3Rpb25tYXJrJywgJz8nXSk7XG5cbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSkge1xuICAgIGxvY2FsZS5iaW5kTWFjcm8oJ2NvbW1hbmQnLCBbJ21vZCcsICdtb2RpZmllciddKTtcbiAgfSBlbHNlIHtcbiAgICBsb2NhbGUuYmluZE1hY3JvKCdjdHJsJywgWydtb2QnLCAnbW9kaWZpZXInXSk7XG4gIH1cblxuICAvL2EteiBhbmQgQS1aXG4gIGZvciAobGV0IGtleUNvZGUgPSA2NTsga2V5Q29kZSA8PSA5MDsga2V5Q29kZSArPSAxKSB7XG4gICAgdmFyIGtleU5hbWUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleUNvZGUgKyAzMik7XG4gICAgdmFyIGNhcGl0YWxLZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlKTtcbiAgXHRsb2NhbGUuYmluZEtleUNvZGUoa2V5Q29kZSwga2V5TmFtZSk7XG4gIFx0bG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAnICsga2V5TmFtZSwgY2FwaXRhbEtleU5hbWUpO1xuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ2NhcHNsb2NrICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcbiAgfVxuXG4gIC8vIGJyb3dzZXIgY2F2ZWF0c1xuICBjb25zdCBzZW1pY29sb25LZXlDb2RlID0gdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykgPyA1OSAgOiAxODY7XG4gIGNvbnN0IGRhc2hLZXlDb2RlICAgICAgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDE3MyA6IDE4OTtcbiAgY29uc3QgZXF1YWxLZXlDb2RlICAgICA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gNjEgIDogMTg3O1xuICBsZXQgbGVmdENvbW1hbmRLZXlDb2RlO1xuICBsZXQgcmlnaHRDb21tYW5kS2V5Q29kZTtcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiAodXNlckFnZW50Lm1hdGNoKCdTYWZhcmknKSB8fCB1c2VyQWdlbnQubWF0Y2goJ0Nocm9tZScpKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSA5MTtcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gOTM7XG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdPcGVyYScpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDE3O1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSAxNztcbiAgfSBlbHNlIGlmKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSAyMjQ7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDIyNDtcbiAgfVxuICBsb2NhbGUuYmluZEtleUNvZGUoc2VtaWNvbG9uS2V5Q29kZSwgICAgWydzZW1pY29sb24nLCAnOyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGRhc2hLZXlDb2RlLCAgICAgICAgIFsnZGFzaCcsICctJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoZXF1YWxLZXlDb2RlLCAgICAgICAgWydlcXVhbCcsICdlcXVhbHNpZ24nLCAnPSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGxlZnRDb21tYW5kS2V5Q29kZSwgIFsnY29tbWFuZCcsICd3aW5kb3dzJywgJ3dpbicsICdzdXBlcicsICdsZWZ0Y29tbWFuZCcsICdsZWZ0d2luZG93cycsICdsZWZ0d2luJywgJ2xlZnRzdXBlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKHJpZ2h0Q29tbWFuZEtleUNvZGUsIFsnY29tbWFuZCcsICd3aW5kb3dzJywgJ3dpbicsICdzdXBlcicsICdyaWdodGNvbW1hbmQnLCAncmlnaHR3aW5kb3dzJywgJ3JpZ2h0d2luJywgJ3JpZ2h0c3VwZXInXSk7XG5cbiAgLy8ga2lsbCBrZXlzXG4gIGxvY2FsZS5zZXRLaWxsS2V5KCdjb21tYW5kJyk7XG59O1xuIiwiaW1wb3J0IHsgS2V5Ym9hcmQgfSBmcm9tICcuL2xpYi9rZXlib2FyZCc7XG5pbXBvcnQgeyBMb2NhbGUgfSBmcm9tICcuL2xpYi9sb2NhbGUnO1xuaW1wb3J0IHsgS2V5Q29tYm8gfSBmcm9tICcuL2xpYi9rZXktY29tYm8nO1xuaW1wb3J0IHsgdXMgfSBmcm9tICcuL2xvY2FsZXMvdXMnO1xuXG5jb25zdCBrZXlib2FyZCA9IG5ldyBLZXlib2FyZCgpO1xuXG5rZXlib2FyZC5zZXRMb2NhbGUoJ3VzJywgdXMpO1xuXG5rZXlib2FyZC5LZXlib2FyZCA9IEtleWJvYXJkO1xua2V5Ym9hcmQuTG9jYWxlID0gTG9jYWxlO1xua2V5Ym9hcmQuS2V5Q29tYm8gPSBLZXlDb21ibztcblxuZXhwb3J0IGRlZmF1bHQga2V5Ym9hcmQ7XG4iXSwibmFtZXMiOlsiS2V5Q29tYm8iLCJrZXlDb21ib1N0ciIsInNvdXJjZVN0ciIsInN1YkNvbWJvcyIsInBhcnNlQ29tYm9TdHIiLCJrZXlOYW1lcyIsInJlZHVjZSIsIm1lbW8iLCJuZXh0U3ViQ29tYm8iLCJjb25jYXQiLCJwcmVzc2VkS2V5TmFtZXMiLCJzdGFydGluZ0tleU5hbWVJbmRleCIsImkiLCJsZW5ndGgiLCJfY2hlY2tTdWJDb21ibyIsIm90aGVyS2V5Q29tYm8iLCJzdWJDb21ibyIsIm90aGVyU3ViQ29tYm8iLCJzbGljZSIsImoiLCJrZXlOYW1lIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwiZW5kSW5kZXgiLCJlc2NhcGVkS2V5TmFtZSIsImNvbWJvRGVsaW1pbmF0b3IiLCJrZXlEZWxpbWluYXRvciIsInN1YkNvbWJvU3RycyIsIl9zcGxpdFN0ciIsImNvbWJvIiwicHVzaCIsInN0ciIsImRlbGltaW5hdG9yIiwicyIsImQiLCJjIiwiY2EiLCJjaSIsInRyaW0iLCJMb2NhbGUiLCJuYW1lIiwibG9jYWxlTmFtZSIsImFjdGl2ZVRhcmdldEtleXMiLCJwcmVzc2VkS2V5cyIsIl9hcHBsaWVkTWFjcm9zIiwiX2tleU1hcCIsIl9raWxsS2V5Q29kZXMiLCJfbWFjcm9zIiwia2V5Q29kZSIsImhhbmRsZXIiLCJtYWNybyIsImtleUNvbWJvIiwia2V5Q29kZXMiLCJnZXRLZXlDb2RlcyIsInNldEtpbGxLZXkiLCJwcmVzc0tleSIsImdldEtleU5hbWVzIiwiX2FwcGx5TWFjcm9zIiwicmVsZWFzZUtleSIsImtpbGxLZXlDb2RlSW5kZXgiLCJfY2xlYXJNYWNyb3MiLCJtYWNyb3MiLCJjaGVjayIsIktleWJvYXJkIiwidGFyZ2V0V2luZG93IiwidGFyZ2V0RWxlbWVudCIsInRhcmdldFBsYXRmb3JtIiwidGFyZ2V0VXNlckFnZW50IiwiX2xvY2FsZSIsIl9jdXJyZW50Q29udGV4dCIsIl9jb250ZXh0cyIsIl9saXN0ZW5lcnMiLCJfYXBwbGllZExpc3RlbmVycyIsIl9sb2NhbGVzIiwiX3RhcmdldEVsZW1lbnQiLCJfdGFyZ2V0V2luZG93IiwiX3RhcmdldFBsYXRmb3JtIiwiX3RhcmdldFVzZXJBZ2VudCIsIl9pc01vZGVybkJyb3dzZXIiLCJfdGFyZ2V0S2V5RG93bkJpbmRpbmciLCJfdGFyZ2V0S2V5VXBCaW5kaW5nIiwiX3RhcmdldFJlc2V0QmluZGluZyIsIl9wYXVzZWQiLCJnbG9iYWwiLCJsaXN0ZW5lcnMiLCJzZXRDb250ZXh0IiwibG9jYWxlQnVpbGRlciIsImxvY2FsZSIsIl9sb2NhbGVOYW1lIiwibG9jYWxOYW1lIiwicHJlc3NIYW5kbGVyIiwicmVsZWFzZUhhbmRsZXIiLCJwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IiwiYmluZCIsInByZXZlbnRSZXBlYXQiLCJleGVjdXRpbmdIYW5kbGVyIiwidW5iaW5kIiwibGlzdGVuZXIiLCJjb21ib01hdGNoZXMiLCJpc0VxdWFsIiwicHJlc3NIYW5kbGVyTWF0Y2hlcyIsInJlbGVhc2VIYW5kbGVyTWF0Y2hlcyIsImNvbnRleHROYW1lIiwicmVsZWFzZUFsbEtleXMiLCJnbG9iYWxDb250ZXh0IiwiY29udGV4dCIsInN0b3AiLCJ3YXRjaCIsImNhbGxiYWNrIiwicHJldmlvdXNDb250ZXh0TmFtZSIsImdldENvbnRleHQiLCJ3aW4iLCJnbG9iYWxUaGlzIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImF0dGFjaEV2ZW50IiwiRXJyb3IiLCJub2RlVHlwZSIsInVzZXJBZ2VudCIsIm5hdmlnYXRvciIsInBsYXRmb3JtIiwiZG9jdW1lbnQiLCJldmVudCIsIl9oYW5kbGVDb21tYW5kQnVnIiwiX2JpbmRFdmVudCIsImN1cnJlbnRDb250ZXh0IiwiX3VuYmluZEV2ZW50IiwiX2FwcGx5QmluZGluZ3MiLCJfY2xlYXJCaW5kaW5ncyIsImV2ZW50TmFtZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJkZXRhY2hFdmVudCIsImxpc3RlbmVyR3JvdXBzIiwibGlzdGVuZXJHcm91cE1hcCIsInNvcnQiLCJhIiwiYiIsImZvckVhY2giLCJsIiwibWFwSW5kZXgiLCJfZ2V0R3JvdXBlZExpc3RlbmVycyIsInNvbWUiLCJrIiwiaW5jbHVkZXMiLCJjYWxsIiwibW9kaWZpZXJLZXlzIiwibWF0Y2giLCJ1cyIsImJpbmRLZXlDb2RlIiwiYmluZE1hY3JvIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiY2FwaXRhbEtleU5hbWUiLCJzZW1pY29sb25LZXlDb2RlIiwiZGFzaEtleUNvZGUiLCJlcXVhbEtleUNvZGUiLCJsZWZ0Q29tbWFuZEtleUNvZGUiLCJyaWdodENvbW1hbmRLZXlDb2RlIiwia2V5Ym9hcmQiLCJzZXRMb2NhbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BQ2FBLFFBQWI7RUFDRSxvQkFBWUMsV0FBWixFQUF5QjtFQUFBOztFQUN2QixTQUFLQyxTQUFMLEdBQWlCRCxXQUFqQjtFQUNBLFNBQUtFLFNBQUwsR0FBaUJILFFBQVEsQ0FBQ0ksYUFBVCxDQUF1QkgsV0FBdkIsQ0FBakI7RUFDQSxTQUFLSSxRQUFMLEdBQWlCLEtBQUtGLFNBQUwsQ0FBZUcsTUFBZixDQUFzQixVQUFDQyxJQUFELEVBQU9DLFlBQVA7RUFBQSxhQUNyQ0QsSUFBSSxDQUFDRSxNQUFMLENBQVlELFlBQVosQ0FEcUM7RUFBQSxLQUF0QixFQUNZLEVBRFosQ0FBakI7RUFFRDs7RUFOSDtFQUFBO0VBQUEsMEJBUVFFLGVBUlIsRUFReUI7RUFDckIsVUFBSUMsb0JBQW9CLEdBQUcsQ0FBM0I7O0VBQ0EsV0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLEtBQUtULFNBQUwsQ0FBZVUsTUFBbkMsRUFBMkNELENBQUMsSUFBSSxDQUFoRCxFQUFtRDtFQUNqREQsUUFBQUEsb0JBQW9CLEdBQUcsS0FBS0csY0FBTCxDQUNyQixLQUFLWCxTQUFMLENBQWVTLENBQWYsQ0FEcUIsRUFFckJELG9CQUZxQixFQUdyQkQsZUFIcUIsQ0FBdkI7O0VBS0EsWUFBSUMsb0JBQW9CLEtBQUssQ0FBQyxDQUE5QixFQUFpQztFQUFFLGlCQUFPLEtBQVA7RUFBZTtFQUNuRDs7RUFDRCxhQUFPLElBQVA7RUFDRDtFQW5CSDtFQUFBO0VBQUEsNEJBcUJVSSxhQXJCVixFQXFCeUI7RUFDckIsVUFDRSxDQUFDQSxhQUFELElBQ0EsT0FBT0EsYUFBUCxLQUF5QixRQUF6QixJQUNBLFFBQU9BLGFBQVAsTUFBeUIsUUFIM0IsRUFJRTtFQUFFLGVBQU8sS0FBUDtFQUFlOztFQUVuQixVQUFJLE9BQU9BLGFBQVAsS0FBeUIsUUFBN0IsRUFBdUM7RUFDckNBLFFBQUFBLGFBQWEsR0FBRyxJQUFJZixRQUFKLENBQWFlLGFBQWIsQ0FBaEI7RUFDRDs7RUFFRCxVQUFJLEtBQUtaLFNBQUwsQ0FBZVUsTUFBZixLQUEwQkUsYUFBYSxDQUFDWixTQUFkLENBQXdCVSxNQUF0RCxFQUE4RDtFQUM1RCxlQUFPLEtBQVA7RUFDRDs7RUFDRCxXQUFLLElBQUlELENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsS0FBS1QsU0FBTCxDQUFlVSxNQUFuQyxFQUEyQ0QsQ0FBQyxJQUFJLENBQWhELEVBQW1EO0VBQ2pELFlBQUksS0FBS1QsU0FBTCxDQUFlUyxDQUFmLEVBQWtCQyxNQUFsQixLQUE2QkUsYUFBYSxDQUFDWixTQUFkLENBQXdCUyxDQUF4QixFQUEyQkMsTUFBNUQsRUFBb0U7RUFDbEUsaUJBQU8sS0FBUDtFQUNEO0VBQ0Y7O0VBRUQsV0FBSyxJQUFJRCxFQUFDLEdBQUcsQ0FBYixFQUFnQkEsRUFBQyxHQUFHLEtBQUtULFNBQUwsQ0FBZVUsTUFBbkMsRUFBMkNELEVBQUMsSUFBSSxDQUFoRCxFQUFtRDtFQUNqRCxZQUFNSSxRQUFRLEdBQVEsS0FBS2IsU0FBTCxDQUFlUyxFQUFmLENBQXRCOztFQUNBLFlBQU1LLGFBQWEsR0FBR0YsYUFBYSxDQUFDWixTQUFkLENBQXdCUyxFQUF4QixFQUEyQk0sS0FBM0IsQ0FBaUMsQ0FBakMsQ0FBdEI7O0VBRUEsYUFBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHSCxRQUFRLENBQUNILE1BQTdCLEVBQXFDTSxDQUFDLElBQUksQ0FBMUMsRUFBNkM7RUFDM0MsY0FBTUMsT0FBTyxHQUFHSixRQUFRLENBQUNHLENBQUQsQ0FBeEI7RUFDQSxjQUFNRSxLQUFLLEdBQUtKLGFBQWEsQ0FBQ0ssT0FBZCxDQUFzQkYsT0FBdEIsQ0FBaEI7O0VBRUEsY0FBSUMsS0FBSyxHQUFHLENBQUMsQ0FBYixFQUFnQjtFQUNkSixZQUFBQSxhQUFhLENBQUNNLE1BQWQsQ0FBcUJGLEtBQXJCLEVBQTRCLENBQTVCO0VBQ0Q7RUFDRjs7RUFDRCxZQUFJSixhQUFhLENBQUNKLE1BQWQsS0FBeUIsQ0FBN0IsRUFBZ0M7RUFDOUIsaUJBQU8sS0FBUDtFQUNEO0VBQ0Y7O0VBRUQsYUFBTyxJQUFQO0VBQ0Q7RUEzREg7RUFBQTtFQUFBLG1DQTZEaUJHLFFBN0RqQixFQTZEMkJMLG9CQTdEM0IsRUE2RGlERCxlQTdEakQsRUE2RGtFO0VBQzlETSxNQUFBQSxRQUFRLEdBQUdBLFFBQVEsQ0FBQ0UsS0FBVCxDQUFlLENBQWYsQ0FBWDtFQUNBUixNQUFBQSxlQUFlLEdBQUdBLGVBQWUsQ0FBQ1EsS0FBaEIsQ0FBc0JQLG9CQUF0QixDQUFsQjtFQUVBLFVBQUlhLFFBQVEsR0FBR2Isb0JBQWY7O0VBQ0EsV0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHSSxRQUFRLENBQUNILE1BQTdCLEVBQXFDRCxDQUFDLElBQUksQ0FBMUMsRUFBNkM7RUFFM0MsWUFBSVEsT0FBTyxHQUFHSixRQUFRLENBQUNKLENBQUQsQ0FBdEI7O0VBQ0EsWUFBSVEsT0FBTyxDQUFDLENBQUQsQ0FBUCxLQUFlLElBQW5CLEVBQXlCO0VBQ3ZCLGNBQU1LLGNBQWMsR0FBR0wsT0FBTyxDQUFDRixLQUFSLENBQWMsQ0FBZCxDQUF2Qjs7RUFDQSxjQUNFTyxjQUFjLEtBQUt6QixRQUFRLENBQUMwQixnQkFBNUIsSUFDQUQsY0FBYyxLQUFLekIsUUFBUSxDQUFDMkIsY0FGOUIsRUFHRTtFQUNBUCxZQUFBQSxPQUFPLEdBQUdLLGNBQVY7RUFDRDtFQUNGOztFQUVELFlBQU1KLEtBQUssR0FBR1gsZUFBZSxDQUFDWSxPQUFoQixDQUF3QkYsT0FBeEIsQ0FBZDs7RUFDQSxZQUFJQyxLQUFLLEdBQUcsQ0FBQyxDQUFiLEVBQWdCO0VBQ2RMLFVBQUFBLFFBQVEsQ0FBQ08sTUFBVCxDQUFnQlgsQ0FBaEIsRUFBbUIsQ0FBbkI7RUFDQUEsVUFBQUEsQ0FBQyxJQUFJLENBQUw7O0VBQ0EsY0FBSVMsS0FBSyxHQUFHRyxRQUFaLEVBQXNCO0VBQ3BCQSxZQUFBQSxRQUFRLEdBQUdILEtBQVg7RUFDRDs7RUFDRCxjQUFJTCxRQUFRLENBQUNILE1BQVQsS0FBb0IsQ0FBeEIsRUFBMkI7RUFDekIsbUJBQU9XLFFBQVA7RUFDRDtFQUNGO0VBQ0Y7O0VBQ0QsYUFBTyxDQUFDLENBQVI7RUFDRDtFQTVGSDs7RUFBQTtFQUFBO0VBK0ZBeEIsUUFBUSxDQUFDMEIsZ0JBQVQsR0FBNEIsR0FBNUI7RUFDQTFCLFFBQVEsQ0FBQzJCLGNBQVQsR0FBNEIsR0FBNUI7O0VBRUEzQixRQUFRLENBQUNJLGFBQVQsR0FBeUIsVUFBU0gsV0FBVCxFQUFzQjtFQUM3QyxNQUFNMkIsWUFBWSxHQUFHNUIsUUFBUSxDQUFDNkIsU0FBVCxDQUFtQjVCLFdBQW5CLEVBQWdDRCxRQUFRLENBQUMwQixnQkFBekMsQ0FBckI7O0VBQ0EsTUFBTUksS0FBSyxHQUFVLEVBQXJCOztFQUVBLE9BQUssSUFBSWxCLENBQUMsR0FBRyxDQUFiLEVBQWlCQSxDQUFDLEdBQUdnQixZQUFZLENBQUNmLE1BQWxDLEVBQTBDRCxDQUFDLElBQUksQ0FBL0MsRUFBa0Q7RUFDaERrQixJQUFBQSxLQUFLLENBQUNDLElBQU4sQ0FBVy9CLFFBQVEsQ0FBQzZCLFNBQVQsQ0FBbUJELFlBQVksQ0FBQ2hCLENBQUQsQ0FBL0IsRUFBb0NaLFFBQVEsQ0FBQzJCLGNBQTdDLENBQVg7RUFDRDs7RUFDRCxTQUFPRyxLQUFQO0VBQ0QsQ0FSRDs7RUFVQTlCLFFBQVEsQ0FBQzZCLFNBQVQsR0FBcUIsVUFBU0csR0FBVCxFQUFjQyxXQUFkLEVBQTJCO0VBQzlDLE1BQU1DLENBQUMsR0FBSUYsR0FBWDtFQUNBLE1BQU1HLENBQUMsR0FBSUYsV0FBWDtFQUNBLE1BQUlHLENBQUMsR0FBSSxFQUFUO0VBQ0EsTUFBTUMsRUFBRSxHQUFHLEVBQVg7O0VBRUEsT0FBSyxJQUFJQyxFQUFFLEdBQUcsQ0FBZCxFQUFpQkEsRUFBRSxHQUFHSixDQUFDLENBQUNyQixNQUF4QixFQUFnQ3lCLEVBQUUsSUFBSSxDQUF0QyxFQUF5QztFQUN2QyxRQUFJQSxFQUFFLEdBQUcsQ0FBTCxJQUFVSixDQUFDLENBQUNJLEVBQUQsQ0FBRCxLQUFVSCxDQUFwQixJQUF5QkQsQ0FBQyxDQUFDSSxFQUFFLEdBQUcsQ0FBTixDQUFELEtBQWMsSUFBM0MsRUFBaUQ7RUFDL0NELE1BQUFBLEVBQUUsQ0FBQ04sSUFBSCxDQUFRSyxDQUFDLENBQUNHLElBQUYsRUFBUjtFQUNBSCxNQUFBQSxDQUFDLEdBQUcsRUFBSjtFQUNBRSxNQUFBQSxFQUFFLElBQUksQ0FBTjtFQUNEOztFQUNERixJQUFBQSxDQUFDLElBQUlGLENBQUMsQ0FBQ0ksRUFBRCxDQUFOO0VBQ0Q7O0VBQ0QsTUFBSUYsQ0FBSixFQUFPO0VBQUVDLElBQUFBLEVBQUUsQ0FBQ04sSUFBSCxDQUFRSyxDQUFDLENBQUNHLElBQUYsRUFBUjtFQUFvQjs7RUFFN0IsU0FBT0YsRUFBUDtFQUNELENBakJEOztNQzFHYUcsTUFBYjtFQUNFLGtCQUFZQyxJQUFaLEVBQWtCO0VBQUE7O0VBQ2hCLFNBQUtDLFVBQUwsR0FBMkJELElBQTNCO0VBQ0EsU0FBS0UsZ0JBQUwsR0FBd0IsRUFBeEI7RUFDQSxTQUFLQyxXQUFMLEdBQTJCLEVBQTNCO0VBQ0EsU0FBS0MsY0FBTCxHQUEyQixFQUEzQjtFQUNBLFNBQUtDLE9BQUwsR0FBMkIsRUFBM0I7RUFDQSxTQUFLQyxhQUFMLEdBQTJCLEVBQTNCO0VBQ0EsU0FBS0MsT0FBTCxHQUEyQixFQUEzQjtFQUNEOztFQVRIO0VBQUE7RUFBQSxnQ0FXY0MsT0FYZCxFQVd1QjVDLFFBWHZCLEVBV2lDO0VBQzdCLFVBQUksT0FBT0EsUUFBUCxLQUFvQixRQUF4QixFQUFrQztFQUNoQ0EsUUFBQUEsUUFBUSxHQUFHLENBQUNBLFFBQUQsQ0FBWDtFQUNEOztFQUVELFdBQUt5QyxPQUFMLENBQWFHLE9BQWIsSUFBd0I1QyxRQUF4QjtFQUNEO0VBakJIO0VBQUE7RUFBQSw4QkFtQllKLFdBbkJaLEVBbUJ5QkksUUFuQnpCLEVBbUJtQztFQUMvQixVQUFJLE9BQU9BLFFBQVAsS0FBb0IsUUFBeEIsRUFBa0M7RUFDaENBLFFBQUFBLFFBQVEsR0FBRyxDQUFFQSxRQUFGLENBQVg7RUFDRDs7RUFFRCxVQUFJNkMsT0FBTyxHQUFHLElBQWQ7O0VBQ0EsVUFBSSxPQUFPN0MsUUFBUCxLQUFvQixVQUF4QixFQUFvQztFQUNsQzZDLFFBQUFBLE9BQU8sR0FBRzdDLFFBQVY7RUFDQUEsUUFBQUEsUUFBUSxHQUFHLElBQVg7RUFDRDs7RUFFRCxVQUFNOEMsS0FBSyxHQUFHO0VBQ1pDLFFBQUFBLFFBQVEsRUFBRyxJQUFJcEQsUUFBSixDQUFhQyxXQUFiLENBREM7RUFFWkksUUFBQUEsUUFBUSxFQUFHQSxRQUZDO0VBR1o2QyxRQUFBQSxPQUFPLEVBQUlBO0VBSEMsT0FBZDs7RUFNQSxXQUFLRixPQUFMLENBQWFqQixJQUFiLENBQWtCb0IsS0FBbEI7RUFDRDtFQXJDSDtFQUFBO0VBQUEsZ0NBdUNjL0IsT0F2Q2QsRUF1Q3VCO0VBQ25CLFVBQU1pQyxRQUFRLEdBQUcsRUFBakI7O0VBQ0EsV0FBSyxJQUFNSixPQUFYLElBQXNCLEtBQUtILE9BQTNCLEVBQW9DO0VBQ2xDLFlBQU16QixLQUFLLEdBQUcsS0FBS3lCLE9BQUwsQ0FBYUcsT0FBYixFQUFzQjNCLE9BQXRCLENBQThCRixPQUE5QixDQUFkOztFQUNBLFlBQUlDLEtBQUssR0FBRyxDQUFDLENBQWIsRUFBZ0I7RUFBRWdDLFVBQUFBLFFBQVEsQ0FBQ3RCLElBQVQsQ0FBY2tCLE9BQU8sR0FBQyxDQUF0QjtFQUEyQjtFQUM5Qzs7RUFDRCxhQUFPSSxRQUFQO0VBQ0Q7RUE5Q0g7RUFBQTtFQUFBLGdDQWdEY0osT0FoRGQsRUFnRHVCO0VBQ25CLGFBQU8sS0FBS0gsT0FBTCxDQUFhRyxPQUFiLEtBQXlCLEVBQWhDO0VBQ0Q7RUFsREg7RUFBQTtFQUFBLCtCQW9EYUEsT0FwRGIsRUFvRHNCO0VBQ2xCLFVBQUksT0FBT0EsT0FBUCxLQUFtQixRQUF2QixFQUFpQztFQUMvQixZQUFNSSxRQUFRLEdBQUcsS0FBS0MsV0FBTCxDQUFpQkwsT0FBakIsQ0FBakI7O0VBQ0EsYUFBSyxJQUFJckMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR3lDLFFBQVEsQ0FBQ3hDLE1BQTdCLEVBQXFDRCxDQUFDLElBQUksQ0FBMUMsRUFBNkM7RUFDM0MsZUFBSzJDLFVBQUwsQ0FBZ0JGLFFBQVEsQ0FBQ3pDLENBQUQsQ0FBeEI7RUFDRDs7RUFDRDtFQUNEOztFQUVELFdBQUttQyxhQUFMLENBQW1CaEIsSUFBbkIsQ0FBd0JrQixPQUF4QjtFQUNEO0VBOURIO0VBQUE7RUFBQSw2QkFnRVdBLE9BaEVYLEVBZ0VvQjtFQUNoQixVQUFJLE9BQU9BLE9BQVAsS0FBbUIsUUFBdkIsRUFBaUM7RUFDL0IsWUFBTUksUUFBUSxHQUFHLEtBQUtDLFdBQUwsQ0FBaUJMLE9BQWpCLENBQWpCOztFQUNBLGFBQUssSUFBSXJDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUd5QyxRQUFRLENBQUN4QyxNQUE3QixFQUFxQ0QsQ0FBQyxJQUFJLENBQTFDLEVBQTZDO0VBQzNDLGVBQUs0QyxRQUFMLENBQWNILFFBQVEsQ0FBQ3pDLENBQUQsQ0FBdEI7RUFDRDs7RUFDRDtFQUNEOztFQUVELFdBQUsrQixnQkFBTCxDQUFzQjlCLE1BQXRCLEdBQStCLENBQS9CO0VBQ0EsVUFBTVIsUUFBUSxHQUFHLEtBQUtvRCxXQUFMLENBQWlCUixPQUFqQixDQUFqQjs7RUFDQSxXQUFLLElBQUlyQyxFQUFDLEdBQUcsQ0FBYixFQUFnQkEsRUFBQyxHQUFHUCxRQUFRLENBQUNRLE1BQTdCLEVBQXFDRCxFQUFDLElBQUksQ0FBMUMsRUFBNkM7RUFDM0MsYUFBSytCLGdCQUFMLENBQXNCWixJQUF0QixDQUEyQjFCLFFBQVEsQ0FBQ08sRUFBRCxDQUFuQzs7RUFDQSxZQUFJLEtBQUtnQyxXQUFMLENBQWlCdEIsT0FBakIsQ0FBeUJqQixRQUFRLENBQUNPLEVBQUQsQ0FBakMsTUFBMEMsQ0FBQyxDQUEvQyxFQUFrRDtFQUNoRCxlQUFLZ0MsV0FBTCxDQUFpQmIsSUFBakIsQ0FBc0IxQixRQUFRLENBQUNPLEVBQUQsQ0FBOUI7RUFDRDtFQUNGOztFQUVELFdBQUs4QyxZQUFMO0VBQ0Q7RUFuRkg7RUFBQTtFQUFBLCtCQXFGYVQsT0FyRmIsRUFxRnNCO0VBQ2xCLFVBQUksT0FBT0EsT0FBUCxLQUFtQixRQUF2QixFQUFpQztFQUMvQixZQUFNSSxRQUFRLEdBQUcsS0FBS0MsV0FBTCxDQUFpQkwsT0FBakIsQ0FBakI7O0VBQ0EsYUFBSyxJQUFJckMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR3lDLFFBQVEsQ0FBQ3hDLE1BQTdCLEVBQXFDRCxDQUFDLElBQUksQ0FBMUMsRUFBNkM7RUFDM0MsZUFBSytDLFVBQUwsQ0FBZ0JOLFFBQVEsQ0FBQ3pDLENBQUQsQ0FBeEI7RUFDRDtFQUVGLE9BTkQsTUFNTztFQUNMLFlBQU1QLFFBQVEsR0FBVyxLQUFLb0QsV0FBTCxDQUFpQlIsT0FBakIsQ0FBekI7O0VBQ0EsWUFBTVcsZ0JBQWdCLEdBQUcsS0FBS2IsYUFBTCxDQUFtQnpCLE9BQW5CLENBQTJCMkIsT0FBM0IsQ0FBekI7O0VBRUEsWUFBSVcsZ0JBQWdCLEtBQUssQ0FBQyxDQUExQixFQUE2QjtFQUMzQixlQUFLaEIsV0FBTCxDQUFpQi9CLE1BQWpCLEdBQTBCLENBQTFCO0VBQ0QsU0FGRCxNQUVPO0VBQ0wsZUFBSyxJQUFJRCxHQUFDLEdBQUcsQ0FBYixFQUFnQkEsR0FBQyxHQUFHUCxRQUFRLENBQUNRLE1BQTdCLEVBQXFDRCxHQUFDLElBQUksQ0FBMUMsRUFBNkM7RUFDM0MsZ0JBQU1TLEtBQUssR0FBRyxLQUFLdUIsV0FBTCxDQUFpQnRCLE9BQWpCLENBQXlCakIsUUFBUSxDQUFDTyxHQUFELENBQWpDLENBQWQ7O0VBQ0EsZ0JBQUlTLEtBQUssR0FBRyxDQUFDLENBQWIsRUFBZ0I7RUFDZCxtQkFBS3VCLFdBQUwsQ0FBaUJyQixNQUFqQixDQUF3QkYsS0FBeEIsRUFBK0IsQ0FBL0I7RUFDRDtFQUNGO0VBQ0Y7O0VBRUQsYUFBS3NCLGdCQUFMLENBQXNCOUIsTUFBdEIsR0FBK0IsQ0FBL0I7O0VBQ0EsYUFBS2dELFlBQUw7RUFDRDtFQUNGO0VBOUdIO0VBQUE7RUFBQSxtQ0FnSGlCO0VBQ2IsVUFBTUMsTUFBTSxHQUFHLEtBQUtkLE9BQUwsQ0FBYTlCLEtBQWIsQ0FBbUIsQ0FBbkIsQ0FBZjs7RUFDQSxXQUFLLElBQUlOLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdrRCxNQUFNLENBQUNqRCxNQUEzQixFQUFtQ0QsQ0FBQyxJQUFJLENBQXhDLEVBQTJDO0VBQ3pDLFlBQU11QyxLQUFLLEdBQUdXLE1BQU0sQ0FBQ2xELENBQUQsQ0FBcEI7O0VBQ0EsWUFBSXVDLEtBQUssQ0FBQ0MsUUFBTixDQUFlVyxLQUFmLENBQXFCLEtBQUtuQixXQUExQixDQUFKLEVBQTRDO0VBQzFDLGNBQUlPLEtBQUssQ0FBQ0QsT0FBVixFQUFtQjtFQUNqQkMsWUFBQUEsS0FBSyxDQUFDOUMsUUFBTixHQUFpQjhDLEtBQUssQ0FBQ0QsT0FBTixDQUFjLEtBQUtOLFdBQW5CLENBQWpCO0VBQ0Q7O0VBQ0QsZUFBSyxJQUFJekIsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR2dDLEtBQUssQ0FBQzlDLFFBQU4sQ0FBZVEsTUFBbkMsRUFBMkNNLENBQUMsSUFBSSxDQUFoRCxFQUFtRDtFQUNqRCxnQkFBSSxLQUFLeUIsV0FBTCxDQUFpQnRCLE9BQWpCLENBQXlCNkIsS0FBSyxDQUFDOUMsUUFBTixDQUFlYyxDQUFmLENBQXpCLE1BQWdELENBQUMsQ0FBckQsRUFBd0Q7RUFDdEQsbUJBQUt5QixXQUFMLENBQWlCYixJQUFqQixDQUFzQm9CLEtBQUssQ0FBQzlDLFFBQU4sQ0FBZWMsQ0FBZixDQUF0QjtFQUNEO0VBQ0Y7O0VBQ0QsZUFBSzBCLGNBQUwsQ0FBb0JkLElBQXBCLENBQXlCb0IsS0FBekI7RUFDRDtFQUNGO0VBQ0Y7RUFoSUg7RUFBQTtFQUFBLG1DQWtJaUI7RUFDYixXQUFLLElBQUl2QyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLEtBQUtpQyxjQUFMLENBQW9CaEMsTUFBeEMsRUFBZ0RELENBQUMsSUFBSSxDQUFyRCxFQUF3RDtFQUN0RCxZQUFNdUMsS0FBSyxHQUFHLEtBQUtOLGNBQUwsQ0FBb0JqQyxDQUFwQixDQUFkOztFQUNBLFlBQUksQ0FBQ3VDLEtBQUssQ0FBQ0MsUUFBTixDQUFlVyxLQUFmLENBQXFCLEtBQUtuQixXQUExQixDQUFMLEVBQTZDO0VBQzNDLGVBQUssSUFBSXpCLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdnQyxLQUFLLENBQUM5QyxRQUFOLENBQWVRLE1BQW5DLEVBQTJDTSxDQUFDLElBQUksQ0FBaEQsRUFBbUQ7RUFDakQsZ0JBQU1FLEtBQUssR0FBRyxLQUFLdUIsV0FBTCxDQUFpQnRCLE9BQWpCLENBQXlCNkIsS0FBSyxDQUFDOUMsUUFBTixDQUFlYyxDQUFmLENBQXpCLENBQWQ7O0VBQ0EsZ0JBQUlFLEtBQUssR0FBRyxDQUFDLENBQWIsRUFBZ0I7RUFDZCxtQkFBS3VCLFdBQUwsQ0FBaUJyQixNQUFqQixDQUF3QkYsS0FBeEIsRUFBK0IsQ0FBL0I7RUFDRDtFQUNGOztFQUNELGNBQUk4QixLQUFLLENBQUNELE9BQVYsRUFBbUI7RUFDakJDLFlBQUFBLEtBQUssQ0FBQzlDLFFBQU4sR0FBaUIsSUFBakI7RUFDRDs7RUFDRCxlQUFLd0MsY0FBTCxDQUFvQnRCLE1BQXBCLENBQTJCWCxDQUEzQixFQUE4QixDQUE5Qjs7RUFDQUEsVUFBQUEsQ0FBQyxJQUFJLENBQUw7RUFDRDtFQUNGO0VBQ0Y7RUFuSkg7O0VBQUE7RUFBQTs7TUNDYW9ELFFBQWI7RUFDRSxvQkFBWUMsWUFBWixFQUEwQkMsYUFBMUIsRUFBeUNDLGNBQXpDLEVBQXlEQyxlQUF6RCxFQUEwRTtFQUFBOztFQUN4RSxTQUFLQyxPQUFMLEdBQTZCLElBQTdCO0VBQ0EsU0FBS0MsZUFBTCxHQUE2QixFQUE3QjtFQUNBLFNBQUtDLFNBQUwsR0FBNkIsRUFBN0I7RUFDQSxTQUFLQyxVQUFMLEdBQTZCLEVBQTdCO0VBQ0EsU0FBS0MsaUJBQUwsR0FBNkIsRUFBN0I7RUFDQSxTQUFLQyxRQUFMLEdBQTZCLEVBQTdCO0VBQ0EsU0FBS0MsY0FBTCxHQUE2QixJQUE3QjtFQUNBLFNBQUtDLGFBQUwsR0FBNkIsSUFBN0I7RUFDQSxTQUFLQyxlQUFMLEdBQTZCLEVBQTdCO0VBQ0EsU0FBS0MsZ0JBQUwsR0FBNkIsRUFBN0I7RUFDQSxTQUFLQyxnQkFBTCxHQUE2QixLQUE3QjtFQUNBLFNBQUtDLHFCQUFMLEdBQTZCLElBQTdCO0VBQ0EsU0FBS0MsbUJBQUwsR0FBNkIsSUFBN0I7RUFDQSxTQUFLQyxtQkFBTCxHQUE2QixJQUE3QjtFQUNBLFNBQUtDLE9BQUwsR0FBNkIsS0FBN0I7RUFFQSxTQUFLWixTQUFMLENBQWVhLE1BQWYsR0FBd0I7RUFDdEJDLE1BQUFBLFNBQVMsRUFBRSxLQUFLYixVQURNO0VBRXRCUCxNQUFBQSxZQUFZLEVBQVpBLFlBRnNCO0VBR3RCQyxNQUFBQSxhQUFhLEVBQWJBLGFBSHNCO0VBSXRCQyxNQUFBQSxjQUFjLEVBQWRBLGNBSnNCO0VBS3RCQyxNQUFBQSxlQUFlLEVBQWZBO0VBTHNCLEtBQXhCO0VBUUEsU0FBS2tCLFVBQUwsQ0FBZ0IsUUFBaEI7RUFDRDs7RUEzQkg7RUFBQTtFQUFBLDhCQTZCWTVDLFVBN0JaLEVBNkJ3QjZDLGFBN0J4QixFQTZCdUM7RUFDbkMsVUFBSUMsTUFBTSxHQUFHLElBQWI7O0VBQ0EsVUFBSSxPQUFPOUMsVUFBUCxLQUFzQixRQUExQixFQUFvQztFQUVsQyxZQUFJNkMsYUFBSixFQUFtQjtFQUNqQkMsVUFBQUEsTUFBTSxHQUFHLElBQUloRCxNQUFKLENBQVdFLFVBQVgsQ0FBVDtFQUNBNkMsVUFBQUEsYUFBYSxDQUFDQyxNQUFELEVBQVMsS0FBS1gsZUFBZCxFQUErQixLQUFLQyxnQkFBcEMsQ0FBYjtFQUNELFNBSEQsTUFHTztFQUNMVSxVQUFBQSxNQUFNLEdBQUcsS0FBS2QsUUFBTCxDQUFjaEMsVUFBZCxLQUE2QixJQUF0QztFQUNEO0VBQ0YsT0FSRCxNQVFPO0VBQ0w4QyxRQUFBQSxNQUFNLEdBQU85QyxVQUFiO0VBQ0FBLFFBQUFBLFVBQVUsR0FBRzhDLE1BQU0sQ0FBQ0MsV0FBcEI7RUFDRDs7RUFFRCxXQUFLcEIsT0FBTCxHQUE0Qm1CLE1BQTVCO0VBQ0EsV0FBS2QsUUFBTCxDQUFjaEMsVUFBZCxJQUE0QjhDLE1BQTVCOztFQUNBLFVBQUlBLE1BQUosRUFBWTtFQUNWLGFBQUtuQixPQUFMLENBQWF6QixXQUFiLEdBQTJCNEMsTUFBTSxDQUFDNUMsV0FBbEM7RUFDRDs7RUFFRCxhQUFPLElBQVA7RUFDRDtFQW5ESDtFQUFBO0VBQUEsOEJBcURZOEMsU0FyRFosRUFxRHVCO0VBQ25CQSxNQUFBQSxTQUFTLEtBQUtBLFNBQVMsR0FBRyxLQUFLckIsT0FBTCxDQUFhM0IsVUFBOUIsQ0FBVDtFQUNBLGFBQU8sS0FBS2dDLFFBQUwsQ0FBY2dCLFNBQWQsS0FBNEIsSUFBbkM7RUFDRDtFQXhESDtFQUFBO0VBQUEseUJBMERPekYsV0ExRFAsRUEwRG9CMEYsWUExRHBCLEVBMERrQ0MsY0ExRGxDLEVBMERrREMsc0JBMURsRCxFQTBEMEU7RUFDdEUsVUFBSTVGLFdBQVcsS0FBSyxJQUFoQixJQUF3QixPQUFPQSxXQUFQLEtBQXVCLFVBQW5ELEVBQStEO0VBQzdENEYsUUFBQUEsc0JBQXNCLEdBQUdELGNBQXpCO0VBQ0FBLFFBQUFBLGNBQWMsR0FBV0QsWUFBekI7RUFDQUEsUUFBQUEsWUFBWSxHQUFhMUYsV0FBekI7RUFDQUEsUUFBQUEsV0FBVyxHQUFjLElBQXpCO0VBQ0Q7O0VBRUQsVUFDRUEsV0FBVyxJQUNYLFFBQU9BLFdBQVAsTUFBdUIsUUFEdkIsSUFFQSxPQUFPQSxXQUFXLENBQUNZLE1BQW5CLEtBQThCLFFBSGhDLEVBSUU7RUFDQSxhQUFLLElBQUlELENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdYLFdBQVcsQ0FBQ1ksTUFBaEMsRUFBd0NELENBQUMsSUFBSSxDQUE3QyxFQUFnRDtFQUM5QyxlQUFLa0YsSUFBTCxDQUFVN0YsV0FBVyxDQUFDVyxDQUFELENBQXJCLEVBQTBCK0UsWUFBMUIsRUFBd0NDLGNBQXhDO0VBQ0Q7O0VBQ0QsZUFBTyxJQUFQO0VBQ0Q7O0VBRUQsV0FBS3BCLFVBQUwsQ0FBZ0J6QyxJQUFoQixDQUFxQjtFQUNuQnFCLFFBQUFBLFFBQVEsRUFBZ0JuRCxXQUFXLEdBQUcsSUFBSUQsUUFBSixDQUFhQyxXQUFiLENBQUgsR0FBK0IsSUFEL0M7RUFFbkIwRixRQUFBQSxZQUFZLEVBQVlBLFlBQVksSUFBYyxJQUYvQjtFQUduQkMsUUFBQUEsY0FBYyxFQUFVQSxjQUFjLElBQVksSUFIL0I7RUFJbkJHLFFBQUFBLGFBQWEsRUFBV0Ysc0JBQXNCLElBQUksS0FKL0I7RUFLbkJBLFFBQUFBLHNCQUFzQixFQUFFQSxzQkFBc0IsSUFBSSxLQUwvQjtFQU1uQkcsUUFBQUEsZ0JBQWdCLEVBQVE7RUFOTCxPQUFyQjs7RUFTQSxhQUFPLElBQVA7RUFDRDtFQXZGSDtFQUFBO0VBQUEsZ0NBeUZjL0YsV0F6RmQsRUF5RjJCMEYsWUF6RjNCLEVBeUZ5Q0MsY0F6RnpDLEVBeUZ5REMsc0JBekZ6RCxFQXlGaUY7RUFDN0UsYUFBTyxLQUFLQyxJQUFMLENBQVU3RixXQUFWLEVBQXVCMEYsWUFBdkIsRUFBcUNDLGNBQXJDLEVBQXFEQyxzQkFBckQsQ0FBUDtFQUNEO0VBM0ZIO0VBQUE7RUFBQSx1QkE2Rks1RixXQTdGTCxFQTZGa0IwRixZQTdGbEIsRUE2RmdDQyxjQTdGaEMsRUE2RmdEQyxzQkE3RmhELEVBNkZ3RTtFQUNwRSxhQUFPLEtBQUtDLElBQUwsQ0FBVTdGLFdBQVYsRUFBdUIwRixZQUF2QixFQUFxQ0MsY0FBckMsRUFBcURDLHNCQUFyRCxDQUFQO0VBQ0Q7RUEvRkg7RUFBQTtFQUFBLDhCQWlHWTVGLFdBakdaLEVBaUd5QjBGLFlBakd6QixFQWlHdUNFLHNCQWpHdkMsRUFpRytEO0VBQzNELGFBQU8sS0FBS0MsSUFBTCxDQUFVN0YsV0FBVixFQUF1QjBGLFlBQXZCLEVBQXFDLElBQXJDLEVBQTJDRSxzQkFBM0MsQ0FBUDtFQUNEO0VBbkdIO0VBQUE7RUFBQSxnQ0FxR2M1RixXQXJHZCxFQXFHMkIyRixjQXJHM0IsRUFxRzJDO0VBQ3ZDLGFBQU8sS0FBS0UsSUFBTCxDQUFVN0YsV0FBVixFQUF1QixJQUF2QixFQUE2QjJGLGNBQTdCLEVBQTZDQyxzQkFBN0MsQ0FBUDtFQUNEO0VBdkdIO0VBQUE7RUFBQSwyQkF5R1M1RixXQXpHVCxFQXlHc0IwRixZQXpHdEIsRUF5R29DQyxjQXpHcEMsRUF5R29EO0VBQ2hELFVBQUkzRixXQUFXLEtBQUssSUFBaEIsSUFBd0IsT0FBT0EsV0FBUCxLQUF1QixVQUFuRCxFQUErRDtFQUM3RDJGLFFBQUFBLGNBQWMsR0FBR0QsWUFBakI7RUFDQUEsUUFBQUEsWUFBWSxHQUFLMUYsV0FBakI7RUFDQUEsUUFBQUEsV0FBVyxHQUFHLElBQWQ7RUFDRDs7RUFFRCxVQUNFQSxXQUFXLElBQ1gsUUFBT0EsV0FBUCxNQUF1QixRQUR2QixJQUVBLE9BQU9BLFdBQVcsQ0FBQ1ksTUFBbkIsS0FBOEIsUUFIaEMsRUFJRTtFQUNBLGFBQUssSUFBSUQsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR1gsV0FBVyxDQUFDWSxNQUFoQyxFQUF3Q0QsQ0FBQyxJQUFJLENBQTdDLEVBQWdEO0VBQzlDLGVBQUtxRixNQUFMLENBQVloRyxXQUFXLENBQUNXLENBQUQsQ0FBdkIsRUFBNEIrRSxZQUE1QixFQUEwQ0MsY0FBMUM7RUFDRDs7RUFDRCxlQUFPLElBQVA7RUFDRDs7RUFFRCxXQUFLLElBQUloRixFQUFDLEdBQUcsQ0FBYixFQUFnQkEsRUFBQyxHQUFHLEtBQUs0RCxVQUFMLENBQWdCM0QsTUFBcEMsRUFBNENELEVBQUMsSUFBSSxDQUFqRCxFQUFvRDtFQUNsRCxZQUFNc0YsUUFBUSxHQUFHLEtBQUsxQixVQUFMLENBQWdCNUQsRUFBaEIsQ0FBakI7RUFFQSxZQUFNdUYsWUFBWSxHQUFZLENBQUNsRyxXQUFELElBQWdCLENBQUNpRyxRQUFRLENBQUM5QyxRQUExQixJQUNGOEMsUUFBUSxDQUFDOUMsUUFBVCxJQUFxQjhDLFFBQVEsQ0FBQzlDLFFBQVQsQ0FBa0JnRCxPQUFsQixDQUEwQm5HLFdBQTFCLENBRGpEO0VBRUEsWUFBTW9HLG1CQUFtQixHQUFLLENBQUNWLFlBQUQsSUFBaUIsQ0FBQ0MsY0FBbEIsSUFDRixDQUFDRCxZQUFELElBQWlCLENBQUNPLFFBQVEsQ0FBQ1AsWUFEekIsSUFFRkEsWUFBWSxLQUFLTyxRQUFRLENBQUNQLFlBRnREO0VBR0EsWUFBTVcscUJBQXFCLEdBQUcsQ0FBQ1gsWUFBRCxJQUFpQixDQUFDQyxjQUFsQixJQUNGLENBQUNBLGNBQUQsSUFBbUIsQ0FBQ00sUUFBUSxDQUFDTixjQUQzQixJQUVGQSxjQUFjLEtBQUtNLFFBQVEsQ0FBQ04sY0FGeEQ7O0VBSUEsWUFBSU8sWUFBWSxJQUFJRSxtQkFBaEIsSUFBdUNDLHFCQUEzQyxFQUFrRTtFQUNoRSxlQUFLOUIsVUFBTCxDQUFnQmpELE1BQWhCLENBQXVCWCxFQUF2QixFQUEwQixDQUExQjs7RUFDQUEsVUFBQUEsRUFBQyxJQUFJLENBQUw7RUFDRDtFQUNGOztFQUVELGFBQU8sSUFBUDtFQUNEO0VBOUlIO0VBQUE7RUFBQSxtQ0FnSmlCWCxXQWhKakIsRUFnSjhCMEYsWUFoSjlCLEVBZ0o0Q0MsY0FoSjVDLEVBZ0o0RDtFQUN4RCxhQUFPLEtBQUtLLE1BQUwsQ0FBWWhHLFdBQVosRUFBeUIwRixZQUF6QixFQUF1Q0MsY0FBdkMsQ0FBUDtFQUNEO0VBbEpIO0VBQUE7RUFBQSx3QkFvSk0zRixXQXBKTixFQW9KbUIwRixZQXBKbkIsRUFvSmlDQyxjQXBKakMsRUFvSmlEO0VBQzdDLGFBQU8sS0FBS0ssTUFBTCxDQUFZaEcsV0FBWixFQUF5QjBGLFlBQXpCLEVBQXVDQyxjQUF2QyxDQUFQO0VBQ0Q7RUF0Skg7RUFBQTtFQUFBLCtCQXdKYVcsV0F4SmIsRUF3SjBCO0VBQ3RCLFVBQUcsS0FBS2xDLE9BQVIsRUFBaUI7RUFBRSxhQUFLbUMsY0FBTDtFQUF3Qjs7RUFFM0MsVUFBSSxDQUFDLEtBQUtqQyxTQUFMLENBQWVnQyxXQUFmLENBQUwsRUFBa0M7RUFDaEMsWUFBTUUsYUFBYSxHQUFHLEtBQUtsQyxTQUFMLENBQWVhLE1BQXJDO0VBQ0EsYUFBS2IsU0FBTCxDQUFlZ0MsV0FBZixJQUE4QjtFQUM1QmxCLFVBQUFBLFNBQVMsRUFBUSxFQURXO0VBRTVCcEIsVUFBQUEsWUFBWSxFQUFLd0MsYUFBYSxDQUFDeEMsWUFGSDtFQUc1QkMsVUFBQUEsYUFBYSxFQUFJdUMsYUFBYSxDQUFDdkMsYUFISDtFQUk1QkMsVUFBQUEsY0FBYyxFQUFHc0MsYUFBYSxDQUFDdEMsY0FKSDtFQUs1QkMsVUFBQUEsZUFBZSxFQUFFcUMsYUFBYSxDQUFDckM7RUFMSCxTQUE5QjtFQU9EOztFQUVELFVBQU1zQyxPQUFPLEdBQVUsS0FBS25DLFNBQUwsQ0FBZWdDLFdBQWYsQ0FBdkI7RUFDQSxXQUFLakMsZUFBTCxHQUF1QmlDLFdBQXZCO0VBQ0EsV0FBSy9CLFVBQUwsR0FBdUJrQyxPQUFPLENBQUNyQixTQUEvQjtFQUVBLFdBQUtzQixJQUFMO0VBQ0EsV0FBS0MsS0FBTCxDQUNFRixPQUFPLENBQUN6QyxZQURWLEVBRUV5QyxPQUFPLENBQUN4QyxhQUZWLEVBR0V3QyxPQUFPLENBQUN2QyxjQUhWLEVBSUV1QyxPQUFPLENBQUN0QyxlQUpWO0VBT0EsYUFBTyxJQUFQO0VBQ0Q7RUFuTEg7RUFBQTtFQUFBLGlDQXFMZTtFQUNYLGFBQU8sS0FBS0UsZUFBWjtFQUNEO0VBdkxIO0VBQUE7RUFBQSxnQ0F5TGNpQyxXQXpMZCxFQXlMMkJNLFFBekwzQixFQXlMcUM7RUFDakMsVUFBTUMsbUJBQW1CLEdBQUcsS0FBS0MsVUFBTCxFQUE1QjtFQUNBLFdBQUt6QixVQUFMLENBQWdCaUIsV0FBaEI7RUFFQU0sTUFBQUEsUUFBUTtFQUVSLFdBQUt2QixVQUFMLENBQWdCd0IsbUJBQWhCO0VBRUEsYUFBTyxJQUFQO0VBQ0Q7RUFsTUg7RUFBQTtFQUFBLDBCQW9NUTdDLFlBcE1SLEVBb01zQkMsYUFwTXRCLEVBb01xQ0MsY0FwTXJDLEVBb01xREMsZUFwTXJELEVBb01zRTtFQUFBOztFQUNsRSxXQUFLdUMsSUFBTDtFQUVBLFVBQU1LLEdBQUcsR0FBRyxPQUFPQyxVQUFQLEtBQXNCLFdBQXRCLEdBQW9DQSxVQUFwQyxHQUNBLE9BQU83QixNQUFQLEtBQWtCLFdBQWxCLEdBQWdDQSxNQUFoQyxHQUNBLE9BQU84QixNQUFQLEtBQWtCLFdBQWxCLEdBQWdDQSxNQUFoQyxHQUNBLEVBSFo7O0VBS0EsVUFBSSxDQUFDakQsWUFBTCxFQUFtQjtFQUNqQixZQUFJLENBQUMrQyxHQUFHLENBQUNHLGdCQUFMLElBQXlCLENBQUNILEdBQUcsQ0FBQ0ksV0FBbEMsRUFBK0M7RUFDN0MsZ0JBQU0sSUFBSUMsS0FBSixDQUFVLCtEQUFWLENBQU47RUFDRDs7RUFDRHBELFFBQUFBLFlBQVksR0FBRytDLEdBQWY7RUFDRCxPQWJpRTs7O0VBZ0JsRSxVQUFJLE9BQU8vQyxZQUFZLENBQUNxRCxRQUFwQixLQUFpQyxRQUFyQyxFQUErQztFQUM3Q2xELFFBQUFBLGVBQWUsR0FBR0QsY0FBbEI7RUFDQUEsUUFBQUEsY0FBYyxHQUFJRCxhQUFsQjtFQUNBQSxRQUFBQSxhQUFhLEdBQUtELFlBQWxCO0VBQ0FBLFFBQUFBLFlBQVksR0FBTStDLEdBQWxCO0VBQ0Q7O0VBRUQsVUFBSSxDQUFDL0MsWUFBWSxDQUFDa0QsZ0JBQWQsSUFBa0MsQ0FBQ2xELFlBQVksQ0FBQ21ELFdBQXBELEVBQWlFO0VBQy9ELGNBQU0sSUFBSUMsS0FBSixDQUFVLHNFQUFWLENBQU47RUFDRDs7RUFFRCxXQUFLdEMsZ0JBQUwsR0FBd0IsQ0FBQyxDQUFDZCxZQUFZLENBQUNrRCxnQkFBdkM7RUFFQSxVQUFNSSxTQUFTLEdBQUd0RCxZQUFZLENBQUN1RCxTQUFiLElBQTBCdkQsWUFBWSxDQUFDdUQsU0FBYixDQUF1QkQsU0FBakQsSUFBOEQsRUFBaEY7RUFDQSxVQUFNRSxRQUFRLEdBQUl4RCxZQUFZLENBQUN1RCxTQUFiLElBQTBCdkQsWUFBWSxDQUFDdUQsU0FBYixDQUF1QkMsUUFBakQsSUFBOEQsRUFBaEY7RUFFQXZELE1BQUFBLGFBQWEsSUFBTUEsYUFBYSxLQUFPLElBQXZDLEtBQWdEQSxhQUFhLEdBQUtELFlBQVksQ0FBQ3lELFFBQS9FO0VBQ0F2RCxNQUFBQSxjQUFjLElBQUtBLGNBQWMsS0FBTSxJQUF2QyxLQUFnREEsY0FBYyxHQUFJc0QsUUFBbEU7RUFDQXJELE1BQUFBLGVBQWUsSUFBSUEsZUFBZSxLQUFLLElBQXZDLEtBQWdEQSxlQUFlLEdBQUdtRCxTQUFsRTs7RUFFQSxXQUFLdkMscUJBQUwsR0FBNkIsVUFBQzJDLEtBQUQsRUFBVztFQUN0QyxRQUFBLEtBQUksQ0FBQ25FLFFBQUwsQ0FBY21FLEtBQUssQ0FBQzFFLE9BQXBCLEVBQTZCMEUsS0FBN0I7O0VBQ0EsUUFBQSxLQUFJLENBQUNDLGlCQUFMLENBQXVCRCxLQUF2QixFQUE4QkYsUUFBOUI7RUFDRCxPQUhEOztFQUlBLFdBQUt4QyxtQkFBTCxHQUEyQixVQUFDMEMsS0FBRCxFQUFXO0VBQ3BDLFFBQUEsS0FBSSxDQUFDaEUsVUFBTCxDQUFnQmdFLEtBQUssQ0FBQzFFLE9BQXRCLEVBQStCMEUsS0FBL0I7RUFDRCxPQUZEOztFQUdBLFdBQUt6QyxtQkFBTCxHQUEyQixVQUFDeUMsS0FBRCxFQUFXO0VBQ3BDLFFBQUEsS0FBSSxDQUFDbkIsY0FBTCxDQUFvQm1CLEtBQXBCO0VBQ0QsT0FGRDs7RUFJQSxXQUFLRSxVQUFMLENBQWdCM0QsYUFBaEIsRUFBK0IsU0FBL0IsRUFBMEMsS0FBS2MscUJBQS9DOztFQUNBLFdBQUs2QyxVQUFMLENBQWdCM0QsYUFBaEIsRUFBK0IsT0FBL0IsRUFBMEMsS0FBS2UsbUJBQS9DOztFQUNBLFdBQUs0QyxVQUFMLENBQWdCNUQsWUFBaEIsRUFBK0IsT0FBL0IsRUFBMEMsS0FBS2lCLG1CQUEvQzs7RUFDQSxXQUFLMkMsVUFBTCxDQUFnQjVELFlBQWhCLEVBQStCLE1BQS9CLEVBQTBDLEtBQUtpQixtQkFBL0M7O0VBRUEsV0FBS1AsY0FBTCxHQUF3QlQsYUFBeEI7RUFDQSxXQUFLVSxhQUFMLEdBQXdCWCxZQUF4QjtFQUNBLFdBQUtZLGVBQUwsR0FBd0JWLGNBQXhCO0VBQ0EsV0FBS1csZ0JBQUwsR0FBd0JWLGVBQXhCO0VBRUEsVUFBTTBELGNBQWMsR0FBYSxLQUFLdkQsU0FBTCxDQUFlLEtBQUtELGVBQXBCLENBQWpDO0VBQ0F3RCxNQUFBQSxjQUFjLENBQUM3RCxZQUFmLEdBQWlDLEtBQUtXLGFBQXRDO0VBQ0FrRCxNQUFBQSxjQUFjLENBQUM1RCxhQUFmLEdBQWlDLEtBQUtTLGNBQXRDO0VBQ0FtRCxNQUFBQSxjQUFjLENBQUMzRCxjQUFmLEdBQWlDLEtBQUtVLGVBQXRDO0VBQ0FpRCxNQUFBQSxjQUFjLENBQUMxRCxlQUFmLEdBQWlDLEtBQUtVLGdCQUF0QztFQUVBLGFBQU8sSUFBUDtFQUNEO0VBcFFIO0VBQUE7RUFBQSwyQkFzUVM7RUFDTCxVQUFJLENBQUMsS0FBS0gsY0FBTixJQUF3QixDQUFDLEtBQUtDLGFBQWxDLEVBQWlEO0VBQUU7RUFBUzs7RUFFNUQsV0FBS21ELFlBQUwsQ0FBa0IsS0FBS3BELGNBQXZCLEVBQXVDLFNBQXZDLEVBQWtELEtBQUtLLHFCQUF2RDs7RUFDQSxXQUFLK0MsWUFBTCxDQUFrQixLQUFLcEQsY0FBdkIsRUFBdUMsT0FBdkMsRUFBa0QsS0FBS00sbUJBQXZEOztFQUNBLFdBQUs4QyxZQUFMLENBQWtCLEtBQUtuRCxhQUF2QixFQUF1QyxPQUF2QyxFQUFrRCxLQUFLTSxtQkFBdkQ7O0VBQ0EsV0FBSzZDLFlBQUwsQ0FBa0IsS0FBS25ELGFBQXZCLEVBQXVDLE1BQXZDLEVBQWtELEtBQUtNLG1CQUF2RDs7RUFFQSxXQUFLTixhQUFMLEdBQXNCLElBQXRCO0VBQ0EsV0FBS0QsY0FBTCxHQUFzQixJQUF0QjtFQUVBLGFBQU8sSUFBUDtFQUNEO0VBbFJIO0VBQUE7RUFBQSw2QkFvUlcxQixPQXBSWCxFQW9Sb0IwRSxLQXBScEIsRUFvUjJCO0VBQ3ZCLFVBQUksS0FBS3hDLE9BQVQsRUFBa0I7RUFBRSxlQUFPLElBQVA7RUFBYzs7RUFDbEMsVUFBSSxDQUFDLEtBQUtkLE9BQVYsRUFBbUI7RUFBRSxjQUFNLElBQUlnRCxLQUFKLENBQVUsZ0JBQVYsQ0FBTjtFQUFvQzs7RUFFekQsV0FBS2hELE9BQUwsQ0FBYWIsUUFBYixDQUFzQlAsT0FBdEI7O0VBQ0EsV0FBSytFLGNBQUwsQ0FBb0JMLEtBQXBCOztFQUVBLGFBQU8sSUFBUDtFQUNEO0VBNVJIO0VBQUE7RUFBQSwrQkE4UmExRSxPQTlSYixFQThSc0IwRSxLQTlSdEIsRUE4UjZCO0VBQ3pCLFVBQUksS0FBS3hDLE9BQVQsRUFBa0I7RUFBRSxlQUFPLElBQVA7RUFBYzs7RUFDbEMsVUFBSSxDQUFDLEtBQUtkLE9BQVYsRUFBbUI7RUFBRSxjQUFNLElBQUlnRCxLQUFKLENBQVUsZ0JBQVYsQ0FBTjtFQUFvQzs7RUFFekQsV0FBS2hELE9BQUwsQ0FBYVYsVUFBYixDQUF3QlYsT0FBeEI7O0VBQ0EsV0FBS2dGLGNBQUwsQ0FBb0JOLEtBQXBCOztFQUVBLGFBQU8sSUFBUDtFQUNEO0VBdFNIO0VBQUE7RUFBQSxtQ0F3U2lCQSxLQXhTakIsRUF3U3dCO0VBQ3BCLFVBQUksS0FBS3hDLE9BQVQsRUFBa0I7RUFBRSxlQUFPLElBQVA7RUFBYzs7RUFDbEMsVUFBSSxDQUFDLEtBQUtkLE9BQVYsRUFBbUI7RUFBRSxjQUFNLElBQUlnRCxLQUFKLENBQVUsZ0JBQVYsQ0FBTjtFQUFvQzs7RUFFekQsV0FBS2hELE9BQUwsQ0FBYXpCLFdBQWIsQ0FBeUIvQixNQUF6QixHQUFrQyxDQUFsQzs7RUFDQSxXQUFLb0gsY0FBTCxDQUFvQk4sS0FBcEI7O0VBRUEsYUFBTyxJQUFQO0VBQ0Q7RUFoVEg7RUFBQTtFQUFBLDRCQWtUVTtFQUNOLFVBQUksS0FBS3hDLE9BQVQsRUFBa0I7RUFBRSxlQUFPLElBQVA7RUFBYzs7RUFDbEMsVUFBSSxLQUFLZCxPQUFULEVBQWtCO0VBQUUsYUFBS21DLGNBQUw7RUFBd0I7O0VBQzVDLFdBQUtyQixPQUFMLEdBQWUsSUFBZjtFQUVBLGFBQU8sSUFBUDtFQUNEO0VBeFRIO0VBQUE7RUFBQSw2QkEwVFc7RUFDUCxXQUFLQSxPQUFMLEdBQWUsS0FBZjtFQUVBLGFBQU8sSUFBUDtFQUNEO0VBOVRIO0VBQUE7RUFBQSw0QkFnVVU7RUFDTixXQUFLcUIsY0FBTDtFQUNBLFdBQUtoQyxVQUFMLENBQWdCM0QsTUFBaEIsR0FBeUIsQ0FBekI7RUFFQSxhQUFPLElBQVA7RUFDRDtFQXJVSDtFQUFBO0VBQUEsK0JBdVVhcUQsYUF2VWIsRUF1VTRCZ0UsU0F2VTVCLEVBdVV1Q2hGLE9BdlV2QyxFQXVVZ0Q7RUFDNUMsYUFBTyxLQUFLNkIsZ0JBQUwsR0FDTGIsYUFBYSxDQUFDaUQsZ0JBQWQsQ0FBK0JlLFNBQS9CLEVBQTBDaEYsT0FBMUMsRUFBbUQsS0FBbkQsQ0FESyxHQUVMZ0IsYUFBYSxDQUFDa0QsV0FBZCxDQUEwQixPQUFPYyxTQUFqQyxFQUE0Q2hGLE9BQTVDLENBRkY7RUFHRDtFQTNVSDtFQUFBO0VBQUEsaUNBNlVlZ0IsYUE3VWYsRUE2VThCZ0UsU0E3VTlCLEVBNlV5Q2hGLE9BN1V6QyxFQTZVa0Q7RUFDOUMsYUFBTyxLQUFLNkIsZ0JBQUwsR0FDTGIsYUFBYSxDQUFDaUUsbUJBQWQsQ0FBa0NELFNBQWxDLEVBQTZDaEYsT0FBN0MsRUFBc0QsS0FBdEQsQ0FESyxHQUVMZ0IsYUFBYSxDQUFDa0UsV0FBZCxDQUEwQixPQUFPRixTQUFqQyxFQUE0Q2hGLE9BQTVDLENBRkY7RUFHRDtFQWpWSDtFQUFBO0VBQUEsMkNBbVZ5QjtFQUNyQixVQUFNbUYsY0FBYyxHQUFLLEVBQXpCO0VBQ0EsVUFBTUMsZ0JBQWdCLEdBQUcsRUFBekI7RUFFQSxVQUFJakQsU0FBUyxHQUFHLEtBQUtiLFVBQXJCOztFQUNBLFVBQUksS0FBS0YsZUFBTCxLQUF5QixRQUE3QixFQUF1QztFQUNyQ2UsUUFBQUEsU0FBUyxnQ0FBT0EsU0FBUCxzQkFBcUIsS0FBS2QsU0FBTCxDQUFlYSxNQUFmLENBQXNCQyxTQUEzQyxFQUFUO0VBQ0Q7O0VBRURBLE1BQUFBLFNBQVMsQ0FBQ2tELElBQVYsQ0FDRSxVQUFDQyxDQUFELEVBQUlDLENBQUo7RUFBQSxlQUNFLENBQUNBLENBQUMsQ0FBQ3JGLFFBQUYsR0FBYXFGLENBQUMsQ0FBQ3JGLFFBQUYsQ0FBVy9DLFFBQVgsQ0FBb0JRLE1BQWpDLEdBQTBDLENBQTNDLEtBQ0MySCxDQUFDLENBQUNwRixRQUFGLEdBQWFvRixDQUFDLENBQUNwRixRQUFGLENBQVcvQyxRQUFYLENBQW9CUSxNQUFqQyxHQUEwQyxDQUQzQyxDQURGO0VBQUEsT0FERixFQUlFNkgsT0FKRixDQUlVLFVBQUNDLENBQUQsRUFBTztFQUNmLFlBQUlDLFFBQVEsR0FBRyxDQUFDLENBQWhCOztFQUNBLGFBQUssSUFBSWhJLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcwSCxnQkFBZ0IsQ0FBQ3pILE1BQXJDLEVBQTZDRCxDQUFDLElBQUksQ0FBbEQsRUFBcUQ7RUFDbkQsY0FBSTBILGdCQUFnQixDQUFDMUgsQ0FBRCxDQUFoQixLQUF3QixJQUF4QixJQUFnQytILENBQUMsQ0FBQ3ZGLFFBQUYsS0FBZSxJQUEvQyxJQUNBa0YsZ0JBQWdCLENBQUMxSCxDQUFELENBQWhCLEtBQXdCLElBQXhCLElBQWdDMEgsZ0JBQWdCLENBQUMxSCxDQUFELENBQWhCLENBQW9Cd0YsT0FBcEIsQ0FBNEJ1QyxDQUFDLENBQUN2RixRQUE5QixDQURwQyxFQUM2RTtFQUMzRXdGLFlBQUFBLFFBQVEsR0FBR2hJLENBQVg7RUFDRDtFQUNGOztFQUNELFlBQUlnSSxRQUFRLEtBQUssQ0FBQyxDQUFsQixFQUFxQjtFQUNuQkEsVUFBQUEsUUFBUSxHQUFHTixnQkFBZ0IsQ0FBQ3pILE1BQTVCO0VBQ0F5SCxVQUFBQSxnQkFBZ0IsQ0FBQ3ZHLElBQWpCLENBQXNCNEcsQ0FBQyxDQUFDdkYsUUFBeEI7RUFDRDs7RUFDRCxZQUFJLENBQUNpRixjQUFjLENBQUNPLFFBQUQsQ0FBbkIsRUFBK0I7RUFDN0JQLFVBQUFBLGNBQWMsQ0FBQ08sUUFBRCxDQUFkLEdBQTJCLEVBQTNCO0VBQ0Q7O0VBQ0RQLFFBQUFBLGNBQWMsQ0FBQ08sUUFBRCxDQUFkLENBQXlCN0csSUFBekIsQ0FBOEI0RyxDQUE5QjtFQUNELE9BcEJEO0VBc0JBLGFBQU9OLGNBQVA7RUFDRDtFQW5YSDtFQUFBO0VBQUEsbUNBcVhpQlYsS0FyWGpCLEVBcVh3QjtFQUFBOztFQUNwQixVQUFJNUIsYUFBYSxHQUFHLEtBQXBCO0VBRUE0QixNQUFBQSxLQUFLLEtBQUtBLEtBQUssR0FBRyxFQUFiLENBQUw7O0VBQ0FBLE1BQUFBLEtBQUssQ0FBQzVCLGFBQU4sR0FBc0IsWUFBTTtFQUFFQSxRQUFBQSxhQUFhLEdBQUcsSUFBaEI7RUFBdUIsT0FBckQ7O0VBQ0E0QixNQUFBQSxLQUFLLENBQUMvRSxXQUFOLEdBQXNCLEtBQUt5QixPQUFMLENBQWF6QixXQUFiLENBQXlCMUIsS0FBekIsQ0FBK0IsQ0FBL0IsQ0FBdEI7RUFFQSxVQUFNeUIsZ0JBQWdCLEdBQUcsS0FBSzBCLE9BQUwsQ0FBYTFCLGdCQUF0Qzs7RUFDQSxVQUFNQyxXQUFXLEdBQVEsS0FBS3lCLE9BQUwsQ0FBYXpCLFdBQWIsQ0FBeUIxQixLQUF6QixDQUErQixDQUEvQixDQUF6Qjs7RUFDQSxVQUFNbUgsY0FBYyxHQUFLLEtBQUtRLG9CQUFMLEVBQXpCOztFQVRvQixpQ0FXWGpJLENBWFc7RUFZbEIsWUFBTXlFLFNBQVMsR0FBR2dELGNBQWMsQ0FBQ3pILENBQUQsQ0FBaEM7RUFDQSxZQUFNd0MsUUFBUSxHQUFJaUMsU0FBUyxDQUFDLENBQUQsQ0FBVCxDQUFhakMsUUFBL0I7O0VBRUEsWUFDRUEsUUFBUSxLQUFLLElBQWIsSUFDQUEsUUFBUSxDQUFDVyxLQUFULENBQWVuQixXQUFmLEtBQ0FELGdCQUFnQixDQUFDbUcsSUFBakIsQ0FBc0IsVUFBQUMsQ0FBQztFQUFBLGlCQUFJM0YsUUFBUSxDQUFDL0MsUUFBVCxDQUFrQjJJLFFBQWxCLENBQTJCRCxDQUEzQixDQUFKO0VBQUEsU0FBdkIsQ0FIRixFQUlFO0VBQ0EsZUFBSyxJQUFJNUgsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR2tFLFNBQVMsQ0FBQ3hFLE1BQTlCLEVBQXNDTSxDQUFDLElBQUksQ0FBM0MsRUFBOEM7RUFDNUMsZ0JBQUkrRSxRQUFRLEdBQUdiLFNBQVMsQ0FBQ2xFLENBQUQsQ0FBeEI7O0VBRUEsZ0JBQUksQ0FBQytFLFFBQVEsQ0FBQ0YsZ0JBQVYsSUFBOEJFLFFBQVEsQ0FBQ1AsWUFBdkMsSUFBdUQsQ0FBQ08sUUFBUSxDQUFDSCxhQUFyRSxFQUFvRjtFQUNsRkcsY0FBQUEsUUFBUSxDQUFDRixnQkFBVCxHQUE0QixJQUE1QjtFQUNBRSxjQUFBQSxRQUFRLENBQUNQLFlBQVQsQ0FBc0JzRCxJQUF0QixDQUEyQixNQUEzQixFQUFpQ3RCLEtBQWpDO0VBQ0F6QixjQUFBQSxRQUFRLENBQUNGLGdCQUFULEdBQTRCLEtBQTVCOztFQUVBLGtCQUFJRCxhQUFhLElBQUlHLFFBQVEsQ0FBQ0wsc0JBQTlCLEVBQXNEO0VBQ3BESyxnQkFBQUEsUUFBUSxDQUFDSCxhQUFULEdBQXlCLElBQXpCO0VBQ0FBLGdCQUFBQSxhQUFhLEdBQVksS0FBekI7RUFDRDtFQUNGOztFQUVELGdCQUFJLE1BQUksQ0FBQ3RCLGlCQUFMLENBQXVCbkQsT0FBdkIsQ0FBK0I0RSxRQUEvQixNQUE2QyxDQUFDLENBQWxELEVBQXFEO0VBQ25ELGNBQUEsTUFBSSxDQUFDekIsaUJBQUwsQ0FBdUIxQyxJQUF2QixDQUE0Qm1FLFFBQTVCO0VBQ0Q7RUFDRjs7RUFFRCxjQUFJOUMsUUFBSixFQUFjO0VBQ1osaUJBQUssSUFBSWpDLEVBQUMsR0FBRyxDQUFiLEVBQWdCQSxFQUFDLEdBQUdpQyxRQUFRLENBQUMvQyxRQUFULENBQWtCUSxNQUF0QyxFQUE4Q00sRUFBQyxJQUFJLENBQW5ELEVBQXNEO0VBQ3BELGtCQUFNRSxLQUFLLEdBQUd1QixXQUFXLENBQUN0QixPQUFaLENBQW9COEIsUUFBUSxDQUFDL0MsUUFBVCxDQUFrQmMsRUFBbEIsQ0FBcEIsQ0FBZDs7RUFDQSxrQkFBSUUsS0FBSyxLQUFLLENBQUMsQ0FBZixFQUFrQjtFQUNoQnVCLGdCQUFBQSxXQUFXLENBQUNyQixNQUFaLENBQW1CRixLQUFuQixFQUEwQixDQUExQjtFQUNBRixnQkFBQUEsRUFBQyxJQUFJLENBQUw7RUFDRDtFQUNGO0VBQ0Y7RUFDRjtFQWhEaUI7O0VBV3BCLFdBQUssSUFBSVAsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR3lILGNBQWMsQ0FBQ3hILE1BQW5DLEVBQTJDRCxDQUFDLElBQUksQ0FBaEQsRUFBbUQ7RUFBQSxjQUExQ0EsQ0FBMEM7RUFzQ2xEO0VBQ0Y7RUF2YUg7RUFBQTtFQUFBLG1DQXlhaUIrRyxLQXphakIsRUF5YXdCO0VBQ3BCQSxNQUFBQSxLQUFLLEtBQUtBLEtBQUssR0FBRyxFQUFiLENBQUw7RUFDQUEsTUFBQUEsS0FBSyxDQUFDL0UsV0FBTixHQUFvQixLQUFLeUIsT0FBTCxDQUFhekIsV0FBYixDQUF5QjFCLEtBQXpCLENBQStCLENBQS9CLENBQXBCOztFQUVBLFdBQUssSUFBSU4sQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBRyxLQUFLNkQsaUJBQUwsQ0FBdUI1RCxNQUEzQyxFQUFtREQsQ0FBQyxJQUFJLENBQXhELEVBQTJEO0VBQ3pELFlBQU1zRixRQUFRLEdBQUcsS0FBS3pCLGlCQUFMLENBQXVCN0QsQ0FBdkIsQ0FBakI7RUFDQSxZQUFNd0MsUUFBUSxHQUFHOEMsUUFBUSxDQUFDOUMsUUFBMUI7O0VBQ0EsWUFBSUEsUUFBUSxLQUFLLElBQWIsSUFBcUIsQ0FBQ0EsUUFBUSxDQUFDVyxLQUFULENBQWUsS0FBS00sT0FBTCxDQUFhekIsV0FBNUIsQ0FBMUIsRUFBb0U7RUFDbEVzRCxVQUFBQSxRQUFRLENBQUNILGFBQVQsR0FBeUIsS0FBekI7O0VBQ0EsY0FBSTNDLFFBQVEsS0FBSyxJQUFiLElBQXFCdUUsS0FBSyxDQUFDL0UsV0FBTixDQUFrQi9CLE1BQWxCLEtBQTZCLENBQXRELEVBQXlEO0VBQ3ZELGlCQUFLNEQsaUJBQUwsQ0FBdUJsRCxNQUF2QixDQUE4QlgsQ0FBOUIsRUFBaUMsQ0FBakM7O0VBQ0FBLFlBQUFBLENBQUMsSUFBSSxDQUFMO0VBQ0Q7O0VBQ0QsY0FBSSxDQUFDc0YsUUFBUSxDQUFDRixnQkFBVixJQUE4QkUsUUFBUSxDQUFDTixjQUEzQyxFQUEyRDtFQUN6RE0sWUFBQUEsUUFBUSxDQUFDRixnQkFBVCxHQUE0QixJQUE1QjtFQUNBRSxZQUFBQSxRQUFRLENBQUNOLGNBQVQsQ0FBd0JxRCxJQUF4QixDQUE2QixJQUE3QixFQUFtQ3RCLEtBQW5DO0VBQ0F6QixZQUFBQSxRQUFRLENBQUNGLGdCQUFULEdBQTRCLEtBQTVCO0VBQ0Q7RUFDRjtFQUNGO0VBQ0Y7RUE3Ykg7RUFBQTtFQUFBLHNDQStib0IyQixLQS9icEIsRUErYjJCRixRQS9iM0IsRUErYnFDO0VBQ2pDO0VBQ0E7RUFDQSxVQUFNeUIsWUFBWSxHQUFHLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsS0FBbEIsRUFBeUIsVUFBekIsRUFBcUMsS0FBckMsRUFBNEMsU0FBNUMsQ0FBckI7O0VBQ0EsVUFBSXpCLFFBQVEsQ0FBQzBCLEtBQVQsQ0FBZSxLQUFmLEtBQXlCLEtBQUs5RSxPQUFMLENBQWF6QixXQUFiLENBQXlCb0csUUFBekIsQ0FBa0MsU0FBbEMsQ0FBekIsSUFDQSxDQUFDRSxZQUFZLENBQUNGLFFBQWIsQ0FBc0IsS0FBSzNFLE9BQUwsQ0FBYVosV0FBYixDQUF5QmtFLEtBQUssQ0FBQzFFLE9BQS9CLEVBQXdDLENBQXhDLENBQXRCLENBREwsRUFDd0U7RUFDdEUsYUFBS2dDLG1CQUFMLENBQXlCMEMsS0FBekI7RUFDRDtFQUNGO0VBdmNIOztFQUFBO0VBQUE7O0VDSE8sU0FBU3lCLEVBQVQsQ0FBWTVELE1BQVosRUFBb0JpQyxRQUFwQixFQUE4QkYsU0FBOUIsRUFBeUM7RUFFOUM7RUFDQS9CLEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsQ0FBbkIsRUFBd0IsQ0FBQyxRQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLENBQW5CLEVBQXdCLENBQUMsV0FBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixDQUFuQixFQUF3QixDQUFDLEtBQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsRUFBbkIsRUFBd0IsQ0FBQyxPQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEVBQW5CLEVBQXdCLENBQUMsT0FBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixFQUFuQixFQUF3QixDQUFDLE9BQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsRUFBbkIsRUFBd0IsQ0FBQyxNQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEVBQW5CLEVBQXdCLENBQUMsS0FBRCxFQUFRLE1BQVIsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsRUFBbkIsRUFBd0IsQ0FBQyxPQUFELEVBQVUsT0FBVixDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixFQUFuQixFQUF3QixDQUFDLFVBQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsRUFBbkIsRUFBd0IsQ0FBQyxRQUFELEVBQVcsS0FBWCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixFQUFuQixFQUF3QixDQUFDLE9BQUQsRUFBVSxVQUFWLENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEVBQW5CLEVBQXdCLENBQUMsUUFBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixFQUFuQixFQUF3QixDQUFDLFVBQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsRUFBbkIsRUFBd0IsQ0FBQyxLQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEVBQW5CLEVBQXdCLENBQUMsTUFBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixFQUFuQixFQUF3QixDQUFDLE1BQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsRUFBbkIsRUFBd0IsQ0FBQyxJQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEVBQW5CLEVBQXdCLENBQUMsT0FBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixFQUFuQixFQUF3QixDQUFDLE1BQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsRUFBbkIsRUFBd0IsQ0FBQyxRQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEVBQW5CLEVBQXdCLENBQUMsYUFBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixFQUFuQixFQUF3QixDQUFDLFNBQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsRUFBbkIsRUFBd0IsQ0FBQyxVQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEVBQW5CLEVBQXdCLENBQUMsUUFBRCxFQUFXLEtBQVgsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsRUFBbkIsRUFBd0IsQ0FBQyxRQUFELEVBQVcsS0FBWCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixFQUFuQixFQUF3QixDQUFDLE1BQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxZQUFELEVBQWUsUUFBZixDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixHQUFuQixFQUF3QixDQUFDLE9BQUQsRUFBVSxHQUFWLENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsUUFBRCxFQUFXLEdBQVgsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxPQUFELEVBQVUsY0FBVixFQUEwQixHQUExQixDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixHQUFuQixFQUF3QixDQUFDLGFBQUQsRUFBZ0IsR0FBaEIsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxhQUFELEVBQWdCLEdBQWhCLENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsV0FBRCxFQUFjLElBQWQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxjQUFELEVBQWlCLEdBQWpCLENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsWUFBRCxFQUFlLElBQWYsQ0FBeEIsRUF0QzhDOztFQXlDOUM3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEVBQW5CLEVBQXVCLENBQUMsTUFBRCxFQUFTLEdBQVQsQ0FBdkI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsRUFBbkIsRUFBdUIsQ0FBQyxLQUFELEVBQVEsR0FBUixDQUF2QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixFQUFuQixFQUF1QixDQUFDLEtBQUQsRUFBUSxHQUFSLENBQXZCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEVBQW5CLEVBQXVCLENBQUMsT0FBRCxFQUFVLEdBQVYsQ0FBdkI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsRUFBbkIsRUFBdUIsQ0FBQyxNQUFELEVBQVMsR0FBVCxDQUF2QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixFQUFuQixFQUF1QixDQUFDLE1BQUQsRUFBUyxHQUFULENBQXZCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEVBQW5CLEVBQXVCLENBQUMsS0FBRCxFQUFRLEdBQVIsQ0FBdkI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsRUFBbkIsRUFBdUIsQ0FBQyxPQUFELEVBQVUsR0FBVixDQUF2QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixFQUFuQixFQUF1QixDQUFDLE9BQUQsRUFBVSxHQUFWLENBQXZCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEVBQW5CLEVBQXVCLENBQUMsTUFBRCxFQUFTLEdBQVQsQ0FBdkIsRUFsRDhDOztFQXFEOUM3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEVBQW5CLEVBQXVCLENBQUMsU0FBRCxFQUFZLE1BQVosQ0FBdkI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsRUFBbkIsRUFBdUIsQ0FBQyxRQUFELEVBQVcsTUFBWCxDQUF2QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixFQUFuQixFQUF1QixDQUFDLFFBQUQsRUFBVyxNQUFYLENBQXZCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEVBQW5CLEVBQXVCLENBQUMsVUFBRCxFQUFhLE1BQWIsQ0FBdkI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxTQUFELEVBQVksTUFBWixDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixHQUFuQixFQUF3QixDQUFDLFNBQUQsRUFBWSxNQUFaLENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsUUFBRCxFQUFXLE1BQVgsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxVQUFELEVBQWEsTUFBYixDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixHQUFuQixFQUF3QixDQUFDLFVBQUQsRUFBYSxNQUFiLENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsU0FBRCxFQUFZLE1BQVosQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxhQUFELEVBQWdCLE1BQWhCLENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsUUFBRCxFQUFXLE1BQVgsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxVQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsYUFBRCxFQUFnQixNQUFoQixDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixHQUFuQixFQUF3QixDQUFDLFlBQUQsRUFBZSxNQUFmLENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsV0FBRCxFQUFjLE1BQWQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxTQUFELEVBQVksS0FBWixDQUF4QixFQXJFOEM7O0VBd0U5QzdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxJQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsSUFBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixHQUFuQixFQUF3QixDQUFDLElBQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxJQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsSUFBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixHQUFuQixFQUF3QixDQUFDLElBQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxJQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsSUFBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixHQUFuQixFQUF3QixDQUFDLElBQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxLQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsS0FBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixHQUFuQixFQUF3QixDQUFDLEtBQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxLQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsS0FBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixHQUFuQixFQUF3QixDQUFDLEtBQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxLQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsS0FBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixHQUFuQixFQUF3QixDQUFDLEtBQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxLQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsS0FBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixHQUFuQixFQUF3QixDQUFDLEtBQUQsQ0FBeEI7RUFDQTdELEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUIsR0FBbkIsRUFBd0IsQ0FBQyxLQUFELENBQXhCO0VBQ0E3RCxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CLEdBQW5CLEVBQXdCLENBQUMsS0FBRCxDQUF4QjtFQUNBN0QsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQixHQUFuQixFQUF3QixDQUFDLEtBQUQsQ0FBeEIsRUEvRjhDOztFQWtHOUM3RCxFQUFBQSxNQUFNLENBQUM4RCxTQUFQLENBQWlCLFdBQWpCLEVBQThCLENBQUMsT0FBRCxFQUFVLEdBQVYsQ0FBOUI7RUFDQTlELEVBQUFBLE1BQU0sQ0FBQzhELFNBQVAsQ0FBaUIsV0FBakIsRUFBOEIsQ0FBQyxhQUFELEVBQWdCLGtCQUFoQixFQUFvQyxHQUFwQyxDQUE5QjtFQUNBOUQsRUFBQUEsTUFBTSxDQUFDOEQsU0FBUCxDQUFpQixXQUFqQixFQUE4QixDQUFDLElBQUQsRUFBTyxHQUFQLENBQTlCO0VBQ0E5RCxFQUFBQSxNQUFNLENBQUM4RCxTQUFQLENBQWlCLFdBQWpCLEVBQThCLENBQUMsUUFBRCxFQUFXLEdBQVgsQ0FBOUI7RUFDQTlELEVBQUFBLE1BQU0sQ0FBQzhELFNBQVAsQ0FBaUIsV0FBakIsRUFBOEIsQ0FBQyxRQUFELEVBQVcsU0FBWCxFQUFzQixZQUF0QixFQUFvQyxHQUFwQyxDQUE5QjtFQUNBOUQsRUFBQUEsTUFBTSxDQUFDOEQsU0FBUCxDQUFpQixXQUFqQixFQUE4QixDQUFDLFNBQUQsRUFBWSxHQUFaLENBQTlCO0VBQ0E5RCxFQUFBQSxNQUFNLENBQUM4RCxTQUFQLENBQWlCLFdBQWpCLEVBQThCLENBQUMsT0FBRCxFQUFVLEdBQVYsQ0FBOUI7RUFDQTlELEVBQUFBLE1BQU0sQ0FBQzhELFNBQVAsQ0FBaUIsV0FBakIsRUFBOEIsQ0FBQyxXQUFELEVBQWMsS0FBZCxFQUFxQixHQUFyQixDQUE5QjtFQUNBOUQsRUFBQUEsTUFBTSxDQUFDOEQsU0FBUCxDQUFpQixXQUFqQixFQUE4QixDQUFDLFVBQUQsRUFBYSxHQUFiLENBQTlCO0VBQ0E5RCxFQUFBQSxNQUFNLENBQUM4RCxTQUFQLENBQWlCLFdBQWpCLEVBQThCLENBQUMsV0FBRCxFQUFjLEdBQWQsQ0FBOUI7RUFDQTlELEVBQUFBLE1BQU0sQ0FBQzhELFNBQVAsQ0FBaUIsV0FBakIsRUFBOEIsQ0FBQyxZQUFELEVBQWUsR0FBZixDQUE5QjtFQUNBOUQsRUFBQUEsTUFBTSxDQUFDOEQsU0FBUCxDQUFpQixXQUFqQixFQUE4QixDQUFDLFlBQUQsRUFBZSxHQUFmLENBQTlCO0VBQ0E5RCxFQUFBQSxNQUFNLENBQUM4RCxTQUFQLENBQWlCLFdBQWpCLEVBQThCLENBQUMsTUFBRCxFQUFTLEdBQVQsQ0FBOUI7RUFDQTlELEVBQUFBLE1BQU0sQ0FBQzhELFNBQVAsQ0FBaUIsV0FBakIsRUFBOEIsQ0FBQyxnQkFBRCxFQUFtQixrQkFBbkIsRUFBdUMsR0FBdkMsQ0FBOUI7RUFDQTlELEVBQUFBLE1BQU0sQ0FBQzhELFNBQVAsQ0FBaUIsV0FBakIsRUFBOEIsQ0FBQyxpQkFBRCxFQUFvQixtQkFBcEIsRUFBeUMsR0FBekMsQ0FBOUI7RUFDQTlELEVBQUFBLE1BQU0sQ0FBQzhELFNBQVAsQ0FBaUIsWUFBakIsRUFBK0IsQ0FBQyxhQUFELEVBQWdCLEdBQWhCLENBQS9CO0VBQ0E5RCxFQUFBQSxNQUFNLENBQUM4RCxTQUFQLENBQWlCLFdBQWpCLEVBQThCLENBQUMsT0FBRCxFQUFVLEdBQVYsQ0FBOUI7RUFDQTlELEVBQUFBLE1BQU0sQ0FBQzhELFNBQVAsQ0FBaUIsWUFBakIsRUFBK0IsQ0FBQyxlQUFELEVBQWtCLElBQWxCLENBQS9CO0VBQ0E5RCxFQUFBQSxNQUFNLENBQUM4RCxTQUFQLENBQWlCLFlBQWpCLEVBQStCLENBQUMsa0JBQUQsRUFBcUIsR0FBckIsQ0FBL0I7RUFDQTlELEVBQUFBLE1BQU0sQ0FBQzhELFNBQVAsQ0FBaUIsV0FBakIsRUFBOEIsQ0FBQyxtQkFBRCxFQUFzQixHQUF0QixDQUE5QjtFQUNBOUQsRUFBQUEsTUFBTSxDQUFDOEQsU0FBUCxDQUFpQixXQUFqQixFQUE4QixDQUFDLGNBQUQsRUFBaUIsR0FBakIsQ0FBOUI7O0VBRUEsTUFBSTdCLFFBQVEsQ0FBQzBCLEtBQVQsQ0FBZSxLQUFmLENBQUosRUFBMkI7RUFDekIzRCxJQUFBQSxNQUFNLENBQUM4RCxTQUFQLENBQWlCLFNBQWpCLEVBQTRCLENBQUMsS0FBRCxFQUFRLFVBQVIsQ0FBNUI7RUFDRCxHQUZELE1BRU87RUFDTDlELElBQUFBLE1BQU0sQ0FBQzhELFNBQVAsQ0FBaUIsTUFBakIsRUFBeUIsQ0FBQyxLQUFELEVBQVEsVUFBUixDQUF6QjtFQUNELEdBNUg2Qzs7O0VBK0g5QyxPQUFLLElBQUlyRyxPQUFPLEdBQUcsRUFBbkIsRUFBdUJBLE9BQU8sSUFBSSxFQUFsQyxFQUFzQ0EsT0FBTyxJQUFJLENBQWpELEVBQW9EO0VBQ2xELFFBQUk3QixPQUFPLEdBQUdtSSxNQUFNLENBQUNDLFlBQVAsQ0FBb0J2RyxPQUFPLEdBQUcsRUFBOUIsQ0FBZDtFQUNBLFFBQUl3RyxjQUFjLEdBQUdGLE1BQU0sQ0FBQ0MsWUFBUCxDQUFvQnZHLE9BQXBCLENBQXJCO0VBQ0R1QyxJQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CcEcsT0FBbkIsRUFBNEI3QixPQUE1QjtFQUNBb0UsSUFBQUEsTUFBTSxDQUFDOEQsU0FBUCxDQUFpQixhQUFhbEksT0FBOUIsRUFBdUNxSSxjQUF2QztFQUNBakUsSUFBQUEsTUFBTSxDQUFDOEQsU0FBUCxDQUFpQixnQkFBZ0JsSSxPQUFqQyxFQUEwQ3FJLGNBQTFDO0VBQ0EsR0FySTZDOzs7RUF3STlDLE1BQU1DLGdCQUFnQixHQUFHbkMsU0FBUyxDQUFDNEIsS0FBVixDQUFnQixTQUFoQixJQUE2QixFQUE3QixHQUFtQyxHQUE1RDtFQUNBLE1BQU1RLFdBQVcsR0FBUXBDLFNBQVMsQ0FBQzRCLEtBQVYsQ0FBZ0IsU0FBaEIsSUFBNkIsR0FBN0IsR0FBbUMsR0FBNUQ7RUFDQSxNQUFNUyxZQUFZLEdBQU9yQyxTQUFTLENBQUM0QixLQUFWLENBQWdCLFNBQWhCLElBQTZCLEVBQTdCLEdBQW1DLEdBQTVEO0VBQ0EsTUFBSVUsa0JBQUo7RUFDQSxNQUFJQyxtQkFBSjs7RUFDQSxNQUFJckMsUUFBUSxDQUFDMEIsS0FBVCxDQUFlLEtBQWYsTUFBMEI1QixTQUFTLENBQUM0QixLQUFWLENBQWdCLFFBQWhCLEtBQTZCNUIsU0FBUyxDQUFDNEIsS0FBVixDQUFnQixRQUFoQixDQUF2RCxDQUFKLEVBQXVGO0VBQ3JGVSxJQUFBQSxrQkFBa0IsR0FBSSxFQUF0QjtFQUNBQyxJQUFBQSxtQkFBbUIsR0FBRyxFQUF0QjtFQUNELEdBSEQsTUFHTyxJQUFHckMsUUFBUSxDQUFDMEIsS0FBVCxDQUFlLEtBQWYsS0FBeUI1QixTQUFTLENBQUM0QixLQUFWLENBQWdCLE9BQWhCLENBQTVCLEVBQXNEO0VBQzNEVSxJQUFBQSxrQkFBa0IsR0FBSSxFQUF0QjtFQUNBQyxJQUFBQSxtQkFBbUIsR0FBRyxFQUF0QjtFQUNELEdBSE0sTUFHQSxJQUFHckMsUUFBUSxDQUFDMEIsS0FBVCxDQUFlLEtBQWYsS0FBeUI1QixTQUFTLENBQUM0QixLQUFWLENBQWdCLFNBQWhCLENBQTVCLEVBQXdEO0VBQzdEVSxJQUFBQSxrQkFBa0IsR0FBSSxHQUF0QjtFQUNBQyxJQUFBQSxtQkFBbUIsR0FBRyxHQUF0QjtFQUNEOztFQUNEdEUsRUFBQUEsTUFBTSxDQUFDNkQsV0FBUCxDQUFtQkssZ0JBQW5CLEVBQXdDLENBQUMsV0FBRCxFQUFjLEdBQWQsQ0FBeEM7RUFDQWxFLEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUJNLFdBQW5CLEVBQXdDLENBQUMsTUFBRCxFQUFTLEdBQVQsQ0FBeEM7RUFDQW5FLEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUJPLFlBQW5CLEVBQXdDLENBQUMsT0FBRCxFQUFVLFdBQVYsRUFBdUIsR0FBdkIsQ0FBeEM7RUFDQXBFLEVBQUFBLE1BQU0sQ0FBQzZELFdBQVAsQ0FBbUJRLGtCQUFuQixFQUF3QyxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLEtBQXZCLEVBQThCLE9BQTlCLEVBQXVDLGFBQXZDLEVBQXNELGFBQXRELEVBQXFFLFNBQXJFLEVBQWdGLFdBQWhGLENBQXhDO0VBQ0FyRSxFQUFBQSxNQUFNLENBQUM2RCxXQUFQLENBQW1CUyxtQkFBbkIsRUFBd0MsQ0FBQyxTQUFELEVBQVksU0FBWixFQUF1QixLQUF2QixFQUE4QixPQUE5QixFQUF1QyxjQUF2QyxFQUF1RCxjQUF2RCxFQUF1RSxVQUF2RSxFQUFtRixZQUFuRixDQUF4QyxFQTNKOEM7O0VBOEo5Q3RFLEVBQUFBLE1BQU0sQ0FBQ2pDLFVBQVAsQ0FBa0IsU0FBbEI7RUFDRDs7TUMzSkt3RyxRQUFRLEdBQUcsSUFBSS9GLFFBQUo7RUFFakIrRixRQUFRLENBQUNDLFNBQVQsQ0FBbUIsSUFBbkIsRUFBeUJaLEVBQXpCO0VBRUFXLFFBQVEsQ0FBQy9GLFFBQVQsR0FBb0JBLFFBQXBCO0VBQ0ErRixRQUFRLENBQUN2SCxNQUFULEdBQWtCQSxNQUFsQjtFQUNBdUgsUUFBUSxDQUFDL0osUUFBVCxHQUFvQkEsUUFBcEI7Ozs7Ozs7OyJ9
