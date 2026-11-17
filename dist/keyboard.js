(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.keyboardJS = factory());
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
        var _this = this;

        var macros = this._macros.slice(0);

        for (var i = 0; i < macros.length; i += 1) {
          var macro = macros[i];

          if (macro.keyCombo.check(this.pressedKeys)) {
            if (macro.handler) {
              macro.keyNames = macro.handler(this.pressedKeys);
            }

            var isTargeted = macro.keyCombo.keyNames.some(function (k) {
              return _this.activeTargetKeys.indexOf(k) !== -1;
            });

            for (var j = 0; j < macro.keyNames.length; j += 1) {
              if (this.pressedKeys.indexOf(macro.keyNames[j]) === -1) {
                this.pressedKeys.push(macro.keyNames[j]);
              }

              if (isTargeted && this.activeTargetKeys.indexOf(macro.keyNames[j]) === -1) {
                this.activeTargetKeys.push(macro.keyNames[j]);
              }
            }

            if (this._appliedMacros.indexOf(macro) === -1) {
              this._appliedMacros.push(macro);
            }
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
            this.bind(keyComboStr[i], pressHandler, releaseHandler, preventRepeatByDefault);
          }

          return this;
        }

        this._listeners.push({
          keyCombo: keyComboStr ? new KeyCombo(keyComboStr) : null,
          pressHandler: pressHandler || null,
          releaseHandler: releaseHandler || null,
          preventRepeat: false,
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
        return this.bind(keyComboStr, null, releaseHandler);
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
            // This was added so when using things like JSDOM watch can be used to configure watch
            // for the global namespace manually.
            if (this._currentContext === 'global') {
              return;
            }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmQuanMiLCJzb3VyY2VzIjpbIi4uL2xpYi9rZXktY29tYm8uanMiLCIuLi9saWIvbG9jYWxlLmpzIiwiLi4vbGliL2tleWJvYXJkLmpzIiwiLi4vbG9jYWxlcy91cy5qcyIsIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuZXhwb3J0IGNsYXNzIEtleUNvbWJvIHtcbiAgY29uc3RydWN0b3Ioa2V5Q29tYm9TdHIpIHtcbiAgICB0aGlzLnNvdXJjZVN0ciA9IGtleUNvbWJvU3RyO1xuICAgIHRoaXMuc3ViQ29tYm9zID0gS2V5Q29tYm8ucGFyc2VDb21ib1N0cihrZXlDb21ib1N0cik7XG4gICAgdGhpcy5rZXlOYW1lcyAgPSB0aGlzLnN1YkNvbWJvcy5yZWR1Y2UoKG1lbW8sIG5leHRTdWJDb21ibykgPT5cbiAgICAgIG1lbW8uY29uY2F0KG5leHRTdWJDb21ibyksIFtdKTtcbiAgfVxuXG4gIGNoZWNrKHByZXNzZWRLZXlOYW1lcykge1xuICAgIGxldCBzdGFydGluZ0tleU5hbWVJbmRleCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSB0aGlzLl9jaGVja1N1YkNvbWJvKFxuICAgICAgICB0aGlzLnN1YkNvbWJvc1tpXSxcbiAgICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXgsXG4gICAgICAgIHByZXNzZWRLZXlOYW1lc1xuICAgICAgKTtcbiAgICAgIGlmIChzdGFydGluZ0tleU5hbWVJbmRleCA9PT0gLTEpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIGlzRXF1YWwob3RoZXJLZXlDb21ibykge1xuICAgIGlmIChcbiAgICAgICFvdGhlcktleUNvbWJvIHx8XG4gICAgICB0eXBlb2Ygb3RoZXJLZXlDb21ibyAhPT0gJ3N0cmluZycgJiZcbiAgICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnb2JqZWN0J1xuICAgICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIGlmICh0eXBlb2Ygb3RoZXJLZXlDb21ibyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG90aGVyS2V5Q29tYm8gPSBuZXcgS2V5Q29tYm8ob3RoZXJLZXlDb21ibyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3ViQ29tYm9zLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3MubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGlmICh0aGlzLnN1YkNvbWJvc1tpXS5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3Qgc3ViQ29tYm8gICAgICA9IHRoaXMuc3ViQ29tYm9zW2ldO1xuICAgICAgY29uc3Qgb3RoZXJTdWJDb21ibyA9IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLnNsaWNlKDApO1xuXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHN1YkNvbWJvLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGNvbnN0IGtleU5hbWUgPSBzdWJDb21ib1tqXTtcbiAgICAgICAgY29uc3QgaW5kZXggICA9IG90aGVyU3ViQ29tYm8uaW5kZXhPZihrZXlOYW1lKTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIG90aGVyU3ViQ29tYm8uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG90aGVyU3ViQ29tYm8ubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBfY2hlY2tTdWJDb21ibyhzdWJDb21ibywgc3RhcnRpbmdLZXlOYW1lSW5kZXgsIHByZXNzZWRLZXlOYW1lcykge1xuICAgIHN1YkNvbWJvID0gc3ViQ29tYm8uc2xpY2UoMCk7XG4gICAgcHJlc3NlZEtleU5hbWVzID0gcHJlc3NlZEtleU5hbWVzLnNsaWNlKHN0YXJ0aW5nS2V5TmFtZUluZGV4KTtcblxuICAgIGxldCBlbmRJbmRleCA9IHN0YXJ0aW5nS2V5TmFtZUluZGV4O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3ViQ29tYm8ubGVuZ3RoOyBpICs9IDEpIHtcblxuICAgICAgbGV0IGtleU5hbWUgPSBzdWJDb21ib1tpXTtcbiAgICAgIGlmIChrZXlOYW1lWzBdID09PSAnXFxcXCcpIHtcbiAgICAgICAgY29uc3QgZXNjYXBlZEtleU5hbWUgPSBrZXlOYW1lLnNsaWNlKDEpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgfHxcbiAgICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3JcbiAgICAgICAgKSB7XG4gICAgICAgICAga2V5TmFtZSA9IGVzY2FwZWRLZXlOYW1lO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gcHJlc3NlZEtleU5hbWVzLmluZGV4T2Yoa2V5TmFtZSk7XG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBzdWJDb21iby5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGkgLT0gMTtcbiAgICAgICAgaWYgKGluZGV4ID4gZW5kSW5kZXgpIHtcbiAgICAgICAgICBlbmRJbmRleCA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdWJDb21iby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gZW5kSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xufVxuXG5LZXlDb21iby5jb21ib0RlbGltaW5hdG9yID0gJz4nO1xuS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IgICA9ICcrJztcblxuS2V5Q29tYm8ucGFyc2VDb21ib1N0ciA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyKSB7XG4gIGNvbnN0IHN1YkNvbWJvU3RycyA9IEtleUNvbWJvLl9zcGxpdFN0cihrZXlDb21ib1N0ciwgS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvcik7XG4gIGNvbnN0IGNvbWJvICAgICAgICA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwIDsgaSA8IHN1YkNvbWJvU3Rycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGNvbWJvLnB1c2goS2V5Q29tYm8uX3NwbGl0U3RyKHN1YkNvbWJvU3Ryc1tpXSwgS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IpKTtcbiAgfVxuICByZXR1cm4gY29tYm87XG59XG5cbktleUNvbWJvLl9zcGxpdFN0ciA9IGZ1bmN0aW9uKHN0ciwgZGVsaW1pbmF0b3IpIHtcbiAgY29uc3QgcyAgPSBzdHI7XG4gIGNvbnN0IGQgID0gZGVsaW1pbmF0b3I7XG4gIGxldCBjICA9ICcnO1xuICBjb25zdCBjYSA9IFtdO1xuXG4gIGZvciAobGV0IGNpID0gMDsgY2kgPCBzLmxlbmd0aDsgY2kgKz0gMSkge1xuICAgIGlmIChjaSA+IDAgJiYgc1tjaV0gPT09IGQgJiYgc1tjaSAtIDFdICE9PSAnXFxcXCcpIHtcbiAgICAgIGNhLnB1c2goYy50cmltKCkpO1xuICAgICAgYyA9ICcnO1xuICAgICAgY2kgKz0gMTtcbiAgICB9XG4gICAgYyArPSBzW2NpXTtcbiAgfVxuICBpZiAoYykgeyBjYS5wdXNoKGMudHJpbSgpKTsgfVxuXG4gIHJldHVybiBjYTtcbn07XG4iLCJpbXBvcnQgeyBLZXlDb21ibyB9IGZyb20gJy4va2V5LWNvbWJvJztcblxuXG5leHBvcnQgY2xhc3MgTG9jYWxlIHtcbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHRoaXMubG9jYWxlTmFtZSAgICAgICAgICA9IG5hbWU7XG4gICAgdGhpcy5hY3RpdmVUYXJnZXRLZXlzID0gW107XG4gICAgdGhpcy5wcmVzc2VkS2V5cyAgICAgICAgID0gW107XG4gICAgdGhpcy5fYXBwbGllZE1hY3JvcyAgICAgID0gW107XG4gICAgdGhpcy5fa2V5TWFwICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fa2lsbEtleUNvZGVzICAgICAgID0gW107XG4gICAgdGhpcy5fbWFjcm9zICAgICAgICAgICAgID0gW107XG4gIH1cblxuICBiaW5kS2V5Q29kZShrZXlDb2RlLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFtrZXlOYW1lc107XG4gICAgfVxuXG4gICAgdGhpcy5fa2V5TWFwW2tleUNvZGVdID0ga2V5TmFtZXM7XG4gIH07XG5cbiAgYmluZE1hY3JvKGtleUNvbWJvU3RyLCBrZXlOYW1lcykge1xuICAgIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBrZXlOYW1lcyA9IFsga2V5TmFtZXMgXTtcbiAgICB9XG5cbiAgICBsZXQgaGFuZGxlciA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaGFuZGxlciA9IGtleU5hbWVzO1xuICAgICAga2V5TmFtZXMgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1hY3JvID0ge1xuICAgICAga2V5Q29tYm8gOiBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpLFxuICAgICAga2V5TmFtZXMgOiBrZXlOYW1lcyxcbiAgICAgIGhhbmRsZXIgIDogaGFuZGxlclxuICAgIH07XG5cbiAgICB0aGlzLl9tYWNyb3MucHVzaChtYWNybyk7XG4gIH07XG5cbiAgZ2V0S2V5Q29kZXMoa2V5TmFtZSkge1xuICAgIGNvbnN0IGtleUNvZGVzID0gW107XG4gICAgZm9yIChjb25zdCBrZXlDb2RlIGluIHRoaXMuX2tleU1hcCkge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9rZXlNYXBba2V5Q29kZV0uaW5kZXhPZihrZXlOYW1lKTtcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7IGtleUNvZGVzLnB1c2goa2V5Q29kZXwwKTsgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5Q29kZXM7XG4gIH07XG5cbiAgZ2V0S2V5TmFtZXMoa2V5Q29kZSkge1xuICAgIHJldHVybiB0aGlzLl9rZXlNYXBba2V5Q29kZV0gfHwgW107XG4gIH07XG5cbiAgc2V0S2lsbEtleShrZXlDb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3Qga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzLnNldEtpbGxLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2tpbGxLZXlDb2Rlcy5wdXNoKGtleUNvZGUpO1xuICB9O1xuXG4gIHByZXNzS2V5KGtleUNvZGUpIHtcbiAgICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMucHJlc3NLZXkoa2V5Q29kZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYWN0aXZlVGFyZ2V0S2V5cy5sZW5ndGggPSAwO1xuICAgIGNvbnN0IGtleU5hbWVzID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLmFjdGl2ZVRhcmdldEtleXMucHVzaChrZXlOYW1lc1tpXSk7XG4gICAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKGtleU5hbWVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9hcHBseU1hY3JvcygpO1xuICB9O1xuXG4gIHJlbGVhc2VLZXkoa2V5Q29kZSkge1xuICAgIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlS2V5KGtleUNvZGVzW2ldKTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBrZXlOYW1lcyAgICAgICAgID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcbiAgICAgIGNvbnN0IGtpbGxLZXlDb2RlSW5kZXggPSB0aGlzLl9raWxsS2V5Q29kZXMuaW5kZXhPZihrZXlDb2RlKTtcblxuICAgICAgaWYgKGtpbGxLZXlDb2RlSW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSk7XG4gICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hY3RpdmVUYXJnZXRLZXlzLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLl9jbGVhck1hY3JvcygpO1xuICAgIH1cbiAgfTtcblxuICBfYXBwbHlNYWNyb3MoKSB7XG4gICAgY29uc3QgbWFjcm9zID0gdGhpcy5fbWFjcm9zLnNsaWNlKDApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWFjcm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBtYWNybyA9IG1hY3Jvc1tpXTtcbiAgICAgIGlmIChtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xuICAgICAgICBpZiAobWFjcm8uaGFuZGxlcikge1xuICAgICAgICAgIG1hY3JvLmtleU5hbWVzID0gbWFjcm8uaGFuZGxlcih0aGlzLnByZXNzZWRLZXlzKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpc1RhcmdldGVkID0gbWFjcm8ua2V5Q29tYm8ua2V5TmFtZXMuc29tZShrID0+IHRoaXMuYWN0aXZlVGFyZ2V0S2V5cy5pbmRleE9mKGspICE9PSAtMSk7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbWFjcm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKG1hY3JvLmtleU5hbWVzW2pdKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMucHVzaChtYWNyby5rZXlOYW1lc1tqXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpc1RhcmdldGVkICYmIHRoaXMuYWN0aXZlVGFyZ2V0S2V5cy5pbmRleE9mKG1hY3JvLmtleU5hbWVzW2pdKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlVGFyZ2V0S2V5cy5wdXNoKG1hY3JvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2FwcGxpZWRNYWNyb3MuaW5kZXhPZihtYWNybykgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5wdXNoKG1hY3JvKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBfY2xlYXJNYWNyb3MoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9hcHBsaWVkTWFjcm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBtYWNybyA9IHRoaXMuX2FwcGxpZWRNYWNyb3NbaV07XG4gICAgICBpZiAoIW1hY3JvLmtleUNvbWJvLmNoZWNrKHRoaXMucHJlc3NlZEtleXMpKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbWFjcm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihtYWNyby5rZXlOYW1lc1tqXSk7XG4gICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcbiAgICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGkgLT0gMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IExvY2FsZSB9IGZyb20gJy4vbG9jYWxlJztcbmltcG9ydCB7IEtleUNvbWJvIH0gZnJvbSAnLi9rZXktY29tYm8nO1xuXG5cbmV4cG9ydCBjbGFzcyBLZXlib2FyZCB7XG4gIGNvbnN0cnVjdG9yKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgdGFyZ2V0UGxhdGZvcm0sIHRhcmdldFVzZXJBZ2VudCkge1xuICAgIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50Q29udGV4dCAgICAgICA9ICcnO1xuICAgIHRoaXMuX2NvbnRleHRzICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fbGlzdGVuZXJzICAgICAgICAgICAgPSBbXTtcbiAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzICAgICA9IFtdO1xuICAgIHRoaXMuX2xvY2FsZXMgICAgICAgICAgICAgID0ge307XG4gICAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgICAgICAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldFdpbmRvdyAgICAgICAgID0gbnVsbDtcbiAgICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgICAgICA9ICcnO1xuICAgIHRoaXMuX3RhcmdldFVzZXJBZ2VudCAgICAgID0gJyc7XG4gICAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyICAgICAgPSBmYWxzZTtcbiAgICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IG51bGw7XG4gICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nICAgPSBudWxsO1xuICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyAgID0gbnVsbDtcbiAgICB0aGlzLl9wYXVzZWQgICAgICAgICAgICAgICA9IGZhbHNlO1xuXG4gICAgdGhpcy5fY29udGV4dHMuZ2xvYmFsID0ge1xuICAgICAgbGlzdGVuZXJzOiB0aGlzLl9saXN0ZW5lcnMsXG4gICAgICB0YXJnZXRXaW5kb3csXG4gICAgICB0YXJnZXRFbGVtZW50LFxuICAgICAgdGFyZ2V0UGxhdGZvcm0sXG4gICAgICB0YXJnZXRVc2VyQWdlbnRcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRDb250ZXh0KCdnbG9iYWwnKTtcbiAgfVxuXG4gIHNldExvY2FsZShsb2NhbGVOYW1lLCBsb2NhbGVCdWlsZGVyKSB7XG4gICAgbGV0IGxvY2FsZSA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiBsb2NhbGVOYW1lID09PSAnc3RyaW5nJykge1xuXG4gICAgICBpZiAobG9jYWxlQnVpbGRlcikge1xuICAgICAgICBsb2NhbGUgPSBuZXcgTG9jYWxlKGxvY2FsZU5hbWUpO1xuICAgICAgICBsb2NhbGVCdWlsZGVyKGxvY2FsZSwgdGhpcy5fdGFyZ2V0UGxhdGZvcm0sIHRoaXMuX3RhcmdldFVzZXJBZ2VudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2NhbGUgPSB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdIHx8IG51bGw7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsZSAgICAgPSBsb2NhbGVOYW1lO1xuICAgICAgbG9jYWxlTmFtZSA9IGxvY2FsZS5fbG9jYWxlTmFtZTtcbiAgICB9XG5cbiAgICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgID0gbG9jYWxlO1xuICAgIHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gPSBsb2NhbGU7XG4gICAgaWYgKGxvY2FsZSkge1xuICAgICAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzID0gbG9jYWxlLnByZXNzZWRLZXlzO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0TG9jYWxlKGxvY2FsTmFtZSkge1xuICAgIGxvY2FsTmFtZSB8fCAobG9jYWxOYW1lID0gdGhpcy5fbG9jYWxlLmxvY2FsZU5hbWUpO1xuICAgIHJldHVybiB0aGlzLl9sb2NhbGVzW2xvY2FsTmFtZV0gfHwgbnVsbDtcbiAgfVxuXG4gIGJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0ID0gcmVsZWFzZUhhbmRsZXI7XG4gICAgICByZWxlYXNlSGFuZGxlciAgICAgICAgID0gcHJlc3NIYW5kbGVyO1xuICAgICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA9IGtleUNvbWJvU3RyO1xuICAgICAga2V5Q29tYm9TdHIgICAgICAgICAgICA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAga2V5Q29tYm9TdHIgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICAgKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMuYmluZChrZXlDb21ib1N0cltpXSwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl9saXN0ZW5lcnMucHVzaCh7XG4gICAgICBrZXlDb21ibyAgICAgICAgICAgICAgOiBrZXlDb21ib1N0ciA/IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0cikgOiBudWxsLFxuICAgICAgcHJlc3NIYW5kbGVyICAgICAgICAgIDogcHJlc3NIYW5kbGVyICAgICAgICAgICB8fCBudWxsLFxuICAgICAgcmVsZWFzZUhhbmRsZXIgICAgICAgIDogcmVsZWFzZUhhbmRsZXIgICAgICAgICB8fCBudWxsLFxuICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgIDogZmFsc2UsXG4gICAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0OiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlLFxuICAgICAgZXhlY3V0aW5nSGFuZGxlciAgICAgIDogZmFsc2VcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkTGlzdGVuZXIoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KTtcbiAgfVxuXG4gIG9uKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XG4gICAgcmV0dXJuIHRoaXMuYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCk7XG4gIH1cblxuICBiaW5kUHJlc3Moa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCkge1xuICAgIHJldHVybiB0aGlzLmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgbnVsbCwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCk7XG4gIH1cblxuICBiaW5kUmVsZWFzZShrZXlDb21ib1N0ciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5iaW5kKGtleUNvbWJvU3RyLCBudWxsLCByZWxlYXNlSGFuZGxlcik7XG4gIH1cblxuICB1bmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZWxlYXNlSGFuZGxlciA9IHByZXNzSGFuZGxlcjtcbiAgICAgIHByZXNzSGFuZGxlciAgID0ga2V5Q29tYm9TdHI7XG4gICAgICBrZXlDb21ib1N0ciA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAga2V5Q29tYm9TdHIgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICAgKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXMudW5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tpXTtcblxuICAgICAgY29uc3QgY29tYm9NYXRjaGVzICAgICAgICAgID0gIWtleUNvbWJvU3RyICYmICFsaXN0ZW5lci5rZXlDb21ibyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmtleUNvbWJvICYmIGxpc3RlbmVyLmtleUNvbWJvLmlzRXF1YWwoa2V5Q29tYm9TdHIpO1xuICAgICAgY29uc3QgcHJlc3NIYW5kbGVyTWF0Y2hlcyAgID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmVzc0hhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVzc0hhbmRsZXIgPT09IGxpc3RlbmVyLnByZXNzSGFuZGxlcjtcbiAgICAgIGNvbnN0IHJlbGVhc2VIYW5kbGVyTWF0Y2hlcyA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXJlbGVhc2VIYW5kbGVyICYmICFsaXN0ZW5lci5yZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGVhc2VIYW5kbGVyID09PSBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcjtcblxuICAgICAgaWYgKGNvbWJvTWF0Y2hlcyAmJiBwcmVzc0hhbmRsZXJNYXRjaGVzICYmIHJlbGVhc2VIYW5kbGVyTWF0Y2hlcykge1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICBpIC09IDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZW1vdmVMaXN0ZW5lcihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcikge1xuICAgIHJldHVybiB0aGlzLnVuYmluZChrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XG4gIH1cblxuICBvZmYoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy51bmJpbmQoa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICB9XG5cbiAgc2V0Q29udGV4dChjb250ZXh0TmFtZSkge1xuICAgIGlmKHRoaXMuX2xvY2FsZSkgeyB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7IH1cblxuICAgIGlmICghdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdKSB7XG4gICAgICBjb25zdCBnbG9iYWxDb250ZXh0ID0gdGhpcy5fY29udGV4dHMuZ2xvYmFsO1xuICAgICAgdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdID0ge1xuICAgICAgICBsaXN0ZW5lcnMgICAgICA6IFtdLFxuICAgICAgICB0YXJnZXRXaW5kb3cgICA6IGdsb2JhbENvbnRleHQudGFyZ2V0V2luZG93LFxuICAgICAgICB0YXJnZXRFbGVtZW50ICA6IGdsb2JhbENvbnRleHQudGFyZ2V0RWxlbWVudCxcbiAgICAgICAgdGFyZ2V0UGxhdGZvcm0gOiBnbG9iYWxDb250ZXh0LnRhcmdldFBsYXRmb3JtLFxuICAgICAgICB0YXJnZXRVc2VyQWdlbnQ6IGdsb2JhbENvbnRleHQudGFyZ2V0VXNlckFnZW50XG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRleHQgICAgICAgID0gdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdO1xuICAgIHRoaXMuX2N1cnJlbnRDb250ZXh0ID0gY29udGV4dE5hbWU7XG4gICAgdGhpcy5fbGlzdGVuZXJzICAgICAgPSBjb250ZXh0Lmxpc3RlbmVycztcblxuICAgIHRoaXMuc3RvcCgpO1xuICAgIHRoaXMud2F0Y2goXG4gICAgICBjb250ZXh0LnRhcmdldFdpbmRvdyxcbiAgICAgIGNvbnRleHQudGFyZ2V0RWxlbWVudCxcbiAgICAgIGNvbnRleHQudGFyZ2V0UGxhdGZvcm0sXG4gICAgICBjb250ZXh0LnRhcmdldFVzZXJBZ2VudFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldENvbnRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRDb250ZXh0O1xuICB9XG5cbiAgd2l0aENvbnRleHQoY29udGV4dE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgcHJldmlvdXNDb250ZXh0TmFtZSA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuICAgIHRoaXMuc2V0Q29udGV4dChjb250ZXh0TmFtZSk7XG5cbiAgICBjYWxsYmFjaygpO1xuXG4gICAgdGhpcy5zZXRDb250ZXh0KHByZXZpb3VzQ29udGV4dE5hbWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB3YXRjaCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHRhcmdldFBsYXRmb3JtLCB0YXJnZXRVc2VyQWdlbnQpIHtcbiAgICB0aGlzLnN0b3AoKTtcblxuICAgIGNvbnN0IHdpbiA9IHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbFRoaXMgOlxuICAgICAgICAgICAgICAgIHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDpcbiAgICAgICAgICAgICAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6XG4gICAgICAgICAgICAgICAge307XG5cbiAgICBpZiAoIXRhcmdldFdpbmRvdykge1xuICAgICAgaWYgKCF3aW4uYWRkRXZlbnRMaXN0ZW5lciAmJiAhd2luLmF0dGFjaEV2ZW50KSB7XG4gICAgICAgIC8vIFRoaXMgd2FzIGFkZGVkIHNvIHdoZW4gdXNpbmcgdGhpbmdzIGxpa2UgSlNET00gd2F0Y2ggY2FuIGJlIHVzZWQgdG8gY29uZmlndXJlIHdhdGNoXG4gICAgICAgIC8vIGZvciB0aGUgZ2xvYmFsIG5hbWVzcGFjZSBtYW51YWxseS5cbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRDb250ZXh0ID09PSAnZ2xvYmFsJykge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgd2luZG93IGZ1bmN0aW9ucyBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50LicpO1xuICAgICAgfVxuICAgICAgdGFyZ2V0V2luZG93ID0gd2luO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBlbGVtZW50IGJpbmRpbmdzIHdoZXJlIGEgdGFyZ2V0IHdpbmRvdyBpcyBub3QgcGFzc2VkXG4gICAgaWYgKHR5cGVvZiB0YXJnZXRXaW5kb3cubm9kZVR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICB0YXJnZXRVc2VyQWdlbnQgPSB0YXJnZXRQbGF0Zm9ybTtcbiAgICAgIHRhcmdldFBsYXRmb3JtICA9IHRhcmdldEVsZW1lbnQ7XG4gICAgICB0YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRXaW5kb3c7XG4gICAgICB0YXJnZXRXaW5kb3cgICAgPSB3aW47XG4gICAgfVxuXG4gICAgaWYgKCF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAmJiAhdGFyZ2V0V2luZG93LmF0dGFjaEV2ZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQgbWV0aG9kcyBvbiB0YXJnZXRXaW5kb3cuJyk7XG4gICAgfVxuXG4gICAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyID0gISF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcblxuICAgIGNvbnN0IHVzZXJBZ2VudCA9IHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IgJiYgdGFyZ2V0V2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQgfHwgJyc7XG4gICAgY29uc3QgcGxhdGZvcm0gID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtICB8fCAnJztcblxuICAgIHRhcmdldEVsZW1lbnQgICAmJiB0YXJnZXRFbGVtZW50ICAgIT09IG51bGwgfHwgKHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdy5kb2N1bWVudCk7XG4gICAgdGFyZ2V0UGxhdGZvcm0gICYmIHRhcmdldFBsYXRmb3JtICAhPT0gbnVsbCB8fCAodGFyZ2V0UGxhdGZvcm0gID0gcGxhdGZvcm0pO1xuICAgIHRhcmdldFVzZXJBZ2VudCAmJiB0YXJnZXRVc2VyQWdlbnQgIT09IG51bGwgfHwgKHRhcmdldFVzZXJBZ2VudCA9IHVzZXJBZ2VudCk7XG5cbiAgICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy5wcmVzc0tleShldmVudC5rZXlDb2RlLCBldmVudCk7XG4gICAgICB0aGlzLl9oYW5kbGVDb21tYW5kQnVnKGV2ZW50LCBwbGF0Zm9ybSk7XG4gICAgfTtcbiAgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcgPSAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMucmVsZWFzZUtleShldmVudC5rZXlDb2RlLCBldmVudCk7XG4gICAgfTtcbiAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcgPSAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMucmVsZWFzZUFsbEtleXMoZXZlbnQpO1xuICAgIH07XG5cbiAgICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XG4gICAgdGhpcy5fYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcbiAgICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuICAgIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG5cbiAgICB0aGlzLl90YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRFbGVtZW50O1xuICAgIHRoaXMuX3RhcmdldFdpbmRvdyAgICA9IHRhcmdldFdpbmRvdztcbiAgICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRQbGF0Zm9ybTtcbiAgICB0aGlzLl90YXJnZXRVc2VyQWdlbnQgPSB0YXJnZXRVc2VyQWdlbnQ7XG5cbiAgICBjb25zdCBjdXJyZW50Q29udGV4dCAgICAgICAgICAgPSB0aGlzLl9jb250ZXh0c1t0aGlzLl9jdXJyZW50Q29udGV4dF07XG4gICAgY3VycmVudENvbnRleHQudGFyZ2V0V2luZG93ICAgID0gdGhpcy5fdGFyZ2V0V2luZG93O1xuICAgIGN1cnJlbnRDb250ZXh0LnRhcmdldEVsZW1lbnQgICA9IHRoaXMuX3RhcmdldEVsZW1lbnQ7XG4gICAgY3VycmVudENvbnRleHQudGFyZ2V0UGxhdGZvcm0gID0gdGhpcy5fdGFyZ2V0UGxhdGZvcm07XG4gICAgY3VycmVudENvbnRleHQudGFyZ2V0VXNlckFnZW50ID0gdGhpcy5fdGFyZ2V0VXNlckFnZW50O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIGlmICghdGhpcy5fdGFyZ2V0RWxlbWVudCB8fCAhdGhpcy5fdGFyZ2V0V2luZG93KSB7IHJldHVybjsgfVxuXG4gICAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XG4gICAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xuICAgIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdmb2N1cycsICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcbiAgICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG5cbiAgICB0aGlzLl90YXJnZXRXaW5kb3cgID0gbnVsbDtcbiAgICB0aGlzLl90YXJnZXRFbGVtZW50ID0gbnVsbDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHJlc3NLZXkoa2V5Q29kZSwgZXZlbnQpIHtcbiAgICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybiB0aGlzOyB9XG4gICAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgICB0aGlzLl9sb2NhbGUucHJlc3NLZXkoa2V5Q29kZSk7XG4gICAgdGhpcy5fYXBwbHlCaW5kaW5ncyhldmVudCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbGVhc2VLZXkoa2V5Q29kZSwgZXZlbnQpIHtcbiAgICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybiB0aGlzOyB9XG4gICAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgICB0aGlzLl9sb2NhbGUucmVsZWFzZUtleShrZXlDb2RlKTtcbiAgICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVsZWFzZUFsbEtleXMoZXZlbnQpIHtcbiAgICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybiB0aGlzOyB9XG4gICAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcGF1c2UoKSB7XG4gICAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm4gdGhpczsgfVxuICAgIGlmICh0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XG4gICAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVzdW1lKCkge1xuICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XG4gICAgICB0YXJnZXRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxuICAgICAgdGFyZ2V0RWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgfVxuXG4gIF91bmJpbmRFdmVudCh0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5faXNNb2Rlcm5Ccm93c2VyID9cbiAgICAgIHRhcmdldEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XG4gICAgICB0YXJnZXRFbGVtZW50LmRldGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xuICB9XG5cbiAgX2dldEdyb3VwZWRMaXN0ZW5lcnMoKSB7XG4gICAgY29uc3QgbGlzdGVuZXJHcm91cHMgICA9IFtdO1xuICAgIGNvbnN0IGxpc3RlbmVyR3JvdXBNYXAgPSBbXTtcblxuICAgIGxldCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRDb250ZXh0ICE9PSAnZ2xvYmFsJykge1xuICAgICAgbGlzdGVuZXJzID0gWy4uLmxpc3RlbmVycywgLi4udGhpcy5fY29udGV4dHMuZ2xvYmFsLmxpc3RlbmVyc107XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLnNvcnQoXG4gICAgICAoYSwgYikgPT5cbiAgICAgICAgKGIua2V5Q29tYm8gPyBiLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApIC1cbiAgICAgICAgKGEua2V5Q29tYm8gPyBhLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApXG4gICAgKS5mb3JFYWNoKChsKSA9PiB7XG4gICAgICBsZXQgbWFwSW5kZXggPSAtMTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAobGlzdGVuZXJHcm91cE1hcFtpXSA9PT0gbnVsbCAmJiBsLmtleUNvbWJvID09PSBudWxsIHx8XG4gICAgICAgICAgICBsaXN0ZW5lckdyb3VwTWFwW2ldICE9PSBudWxsICYmIGxpc3RlbmVyR3JvdXBNYXBbaV0uaXNFcXVhbChsLmtleUNvbWJvKSkge1xuICAgICAgICAgIG1hcEluZGV4ID0gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1hcEluZGV4ID09PSAtMSkge1xuICAgICAgICBtYXBJbmRleCA9IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoO1xuICAgICAgICBsaXN0ZW5lckdyb3VwTWFwLnB1c2gobC5rZXlDb21ibyk7XG4gICAgICB9XG4gICAgICBpZiAoIWxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSkge1xuICAgICAgICBsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XS5wdXNoKGwpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGxpc3RlbmVyR3JvdXBzO1xuICB9XG5cbiAgX2FwcGx5QmluZGluZ3MoZXZlbnQpIHtcbiAgICBsZXQgcHJldmVudFJlcGVhdCA9IGZhbHNlO1xuXG4gICAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xuICAgIGV2ZW50LnByZXZlbnRSZXBlYXQgPSAoKSA9PiB7IHByZXZlbnRSZXBlYXQgPSB0cnVlOyB9O1xuICAgIGV2ZW50LnByZXNzZWRLZXlzICAgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG5cbiAgICBjb25zdCBhY3RpdmVUYXJnZXRLZXlzID0gdGhpcy5fbG9jYWxlLmFjdGl2ZVRhcmdldEtleXM7XG4gICAgY29uc3QgcHJlc3NlZEtleXMgICAgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcbiAgICBjb25zdCBsaXN0ZW5lckdyb3VwcyAgID0gdGhpcy5fZ2V0R3JvdXBlZExpc3RlbmVycygpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lckdyb3Vwcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgbGlzdGVuZXJzID0gbGlzdGVuZXJHcm91cHNbaV07XG4gICAgICBjb25zdCBrZXlDb21ibyAgPSBsaXN0ZW5lcnNbMF0ua2V5Q29tYm87XG5cbiAgICAgIGlmIChcbiAgICAgICAga2V5Q29tYm8gPT09IG51bGwgfHxcbiAgICAgICAga2V5Q29tYm8uY2hlY2socHJlc3NlZEtleXMpICYmXG4gICAgICAgIGFjdGl2ZVRhcmdldEtleXMuc29tZShrID0+IGtleUNvbWJvLmtleU5hbWVzLmluY2x1ZGVzKGspKVxuICAgICAgKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbGlzdGVuZXJzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgbGV0IGxpc3RlbmVyID0gbGlzdGVuZXJzW2pdO1xuXG4gICAgICAgICAgaWYgKCFsaXN0ZW5lci5leGVjdXRpbmdIYW5kbGVyICYmIGxpc3RlbmVyLnByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJldmVudFJlcGVhdCkge1xuICAgICAgICAgICAgbGlzdGVuZXIuZXhlY3V0aW5nSGFuZGxlciA9IHRydWU7XG4gICAgICAgICAgICBsaXN0ZW5lci5wcmVzc0hhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgICBsaXN0ZW5lci5leGVjdXRpbmdIYW5kbGVyID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChwcmV2ZW50UmVwZWF0IHx8IGxpc3RlbmVyLnByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgICAgICAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IHRydWU7XG4gICAgICAgICAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5fYXBwbGllZExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtleUNvbWJvKSB7XG4gICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBrZXlDb21iby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBwcmVzc2VkS2V5cy5pbmRleE9mKGtleUNvbWJvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgcHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgaiAtPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9jbGVhckJpbmRpbmdzKGV2ZW50KSB7XG4gICAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xuICAgIGV2ZW50LnByZXNzZWRLZXlzID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnNbaV07XG4gICAgICBjb25zdCBrZXlDb21ibyA9IGxpc3RlbmVyLmtleUNvbWJvO1xuICAgICAgaWYgKGtleUNvbWJvID09PSBudWxsIHx8ICFrZXlDb21iby5jaGVjayh0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMpKSB7XG4gICAgICAgIGxpc3RlbmVyLnByZXZlbnRSZXBlYXQgPSBmYWxzZTtcbiAgICAgICAgaWYgKGtleUNvbWJvICE9PSBudWxsIHx8IGV2ZW50LnByZXNzZWRLZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWxpc3RlbmVyLmV4ZWN1dGluZ0hhbmRsZXIgJiYgbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIpIHtcbiAgICAgICAgICBsaXN0ZW5lci5leGVjdXRpbmdIYW5kbGVyID0gdHJ1ZTtcbiAgICAgICAgICBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICBsaXN0ZW5lci5leGVjdXRpbmdIYW5kbGVyID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfaGFuZGxlQ29tbWFuZEJ1ZyhldmVudCwgcGxhdGZvcm0pIHtcbiAgICAvLyBPbiBNYWMgd2hlbiB0aGUgY29tbWFuZCBrZXkgaXMga2VwdCBwcmVzc2VkLCBrZXl1cCBpcyBub3QgdHJpZ2dlcmVkIGZvciBhbnkgb3RoZXIga2V5LlxuICAgIC8vIEluIHRoaXMgY2FzZSBmb3JjZSBhIGtleXVwIGZvciBub24tbW9kaWZpZXIga2V5cyBkaXJlY3RseSBhZnRlciB0aGUga2V5cHJlc3MuXG4gICAgY29uc3QgbW9kaWZpZXJLZXlzID0gW1wic2hpZnRcIiwgXCJjdHJsXCIsIFwiYWx0XCIsIFwiY2Fwc2xvY2tcIiwgXCJ0YWJcIiwgXCJjb21tYW5kXCJdO1xuICAgIGlmIChwbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSAmJiB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuaW5jbHVkZXMoXCJjb21tYW5kXCIpICYmXG4gICAgICAgICFtb2RpZmllcktleXMuaW5jbHVkZXModGhpcy5fbG9jYWxlLmdldEtleU5hbWVzKGV2ZW50LmtleUNvZGUpWzBdKSkge1xuICAgICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKGV2ZW50KTtcbiAgICB9XG4gIH1cbn1cbiIsIlxuZXhwb3J0IGZ1bmN0aW9uIHVzKGxvY2FsZSwgcGxhdGZvcm0sIHVzZXJBZ2VudCkge1xuXG4gIC8vIGdlbmVyYWxcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMsICAgWydjYW5jZWwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg4LCAgIFsnYmFja3NwYWNlJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOSwgICBbJ3RhYiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyLCAgWydjbGVhciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzLCAgWydlbnRlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE2LCAgWydzaGlmdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE3LCAgWydjdHJsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTgsICBbJ2FsdCcsICdtZW51J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTksICBbJ3BhdXNlJywgJ2JyZWFrJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjAsICBbJ2NhcHNsb2NrJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjcsICBbJ2VzY2FwZScsICdlc2MnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzMiwgIFsnc3BhY2UnLCAnc3BhY2ViYXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzMywgIFsncGFnZXVwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzQsICBbJ3BhZ2Vkb3duJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzUsICBbJ2VuZCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM2LCAgWydob21lJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzcsICBbJ2xlZnQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzOCwgIFsndXAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzOSwgIFsncmlnaHQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MCwgIFsnZG93biddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQxLCAgWydzZWxlY3QnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MiwgIFsncHJpbnRzY3JlZW4nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MywgIFsnZXhlY3V0ZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ0LCAgWydzbmFwc2hvdCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ1LCAgWydpbnNlcnQnLCAnaW5zJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDYsICBbJ2RlbGV0ZScsICdkZWwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NywgIFsnaGVscCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE0NSwgWydzY3JvbGxsb2NrJywgJ3Njcm9sbCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4OCwgWydjb21tYScsICcsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkwLCBbJ3BlcmlvZCcsICcuJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkxLCBbJ3NsYXNoJywgJ2ZvcndhcmRzbGFzaCcsICcvJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTkyLCBbJ2dyYXZlYWNjZW50JywgJ2AnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMTksIFsnb3BlbmJyYWNrZXQnLCAnWyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMCwgWydiYWNrc2xhc2gnLCAnXFxcXCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMSwgWydjbG9zZWJyYWNrZXQnLCAnXSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMiwgWydhcG9zdHJvcGhlJywgJ1xcJyddKTtcblxuICAvLyAwLTlcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ4LCBbJ3plcm8nLCAnMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ5LCBbJ29uZScsICcxJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTAsIFsndHdvJywgJzInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MSwgWyd0aHJlZScsICczJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTIsIFsnZm91cicsICc0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTMsIFsnZml2ZScsICc1J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTQsIFsnc2l4JywgJzYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NSwgWydzZXZlbicsICc3J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTYsIFsnZWlnaHQnLCAnOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU3LCBbJ25pbmUnLCAnOSddKTtcblxuICAvLyBudW1wYWRcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk2LCBbJ251bXplcm8nLCAnbnVtMCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk3LCBbJ251bW9uZScsICdudW0xJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTgsIFsnbnVtdHdvJywgJ251bTInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5OSwgWydudW10aHJlZScsICdudW0zJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAwLCBbJ251bWZvdXInLCAnbnVtNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMSwgWydudW1maXZlJywgJ251bTUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDIsIFsnbnVtc2l4JywgJ251bTYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDMsIFsnbnVtc2V2ZW4nLCAnbnVtNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNCwgWydudW1laWdodCcsICdudW04J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA1LCBbJ251bW5pbmUnLCAnbnVtOSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNiwgWydudW1tdWx0aXBseScsICdudW0qJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA3LCBbJ251bWFkZCcsICdudW0rJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA4LCBbJ251bWVudGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTA5LCBbJ251bXN1YnRyYWN0JywgJ251bS0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTAsIFsnbnVtZGVjaW1hbCcsICdudW0uJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTExLCBbJ251bWRpdmlkZScsICdudW0vJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTQ0LCBbJ251bWxvY2snLCAnbnVtJ10pO1xuXG4gIC8vIGZ1bmN0aW9uIGtleXNcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMiwgWydmMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMywgWydmMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNCwgWydmMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNSwgWydmNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNiwgWydmNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNywgWydmNiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExOCwgWydmNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExOSwgWydmOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMCwgWydmOSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMSwgWydmMTAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjIsIFsnZjExJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIzLCBbJ2YxMiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyNCwgWydmMTMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjUsIFsnZjE0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI2LCBbJ2YxNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyNywgWydmMTYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjgsIFsnZjE3J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTI5LCBbJ2YxOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzMCwgWydmMTknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzEsIFsnZjIwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTMyLCBbJ2YyMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEzMywgWydmMjInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMzQsIFsnZjIzJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTM1LCBbJ2YyNCddKTtcblxuICAvLyBzZWNvbmRhcnkga2V5IHN5bWJvbHNcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBgJywgWyd0aWxkZScsICd+J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDEnLCBbJ2V4Y2xhbWF0aW9uJywgJ2V4Y2xhbWF0aW9ucG9pbnQnLCAnISddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAyJywgWydhdCcsICdAJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDMnLCBbJ251bWJlcicsICcjJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDQnLCBbJ2RvbGxhcicsICdkb2xsYXJzJywgJ2RvbGxhcnNpZ24nLCAnJCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA1JywgWydwZXJjZW50JywgJyUnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNicsIFsnY2FyZXQnLCAnXiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA3JywgWydhbXBlcnNhbmQnLCAnYW5kJywgJyYnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOCcsIFsnYXN0ZXJpc2snLCAnKiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA5JywgWydvcGVucGFyZW4nLCAnKCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAwJywgWydjbG9zZXBhcmVuJywgJyknXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLScsIFsndW5kZXJzY29yZScsICdfJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArID0nLCBbJ3BsdXMnLCAnKyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBbJywgWydvcGVuY3VybHlicmFjZScsICdvcGVuY3VybHlicmFja2V0JywgJ3snXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXScsIFsnY2xvc2VjdXJseWJyYWNlJywgJ2Nsb3NlY3VybHlicmFja2V0JywgJ30nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXFxcXCcsIFsndmVydGljYWxiYXInLCAnfCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA7JywgWydjb2xvbicsICc6J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFxcJycsIFsncXVvdGF0aW9ubWFyaycsICdcXCcnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgISwnLCBbJ29wZW5hbmdsZWJyYWNrZXQnLCAnPCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAuJywgWydjbG9zZWFuZ2xlYnJhY2tldCcsICc+J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC8nLCBbJ3F1ZXN0aW9ubWFyaycsICc/J10pO1xuXG4gIGlmIChwbGF0Zm9ybS5tYXRjaCgnTWFjJykpIHtcbiAgICBsb2NhbGUuYmluZE1hY3JvKCdjb21tYW5kJywgWydtb2QnLCAnbW9kaWZpZXInXSk7XG4gIH0gZWxzZSB7XG4gICAgbG9jYWxlLmJpbmRNYWNybygnY3RybCcsIFsnbW9kJywgJ21vZGlmaWVyJ10pO1xuICB9XG5cbiAgLy9hLXogYW5kIEEtWlxuICBmb3IgKGxldCBrZXlDb2RlID0gNjU7IGtleUNvZGUgPD0gOTA7IGtleUNvZGUgKz0gMSkge1xuICAgIHZhciBrZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlICsgMzIpO1xuICAgIHZhciBjYXBpdGFsS2V5TmFtZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5Q29kZSk7XG4gIFx0bG9jYWxlLmJpbmRLZXlDb2RlKGtleUNvZGUsIGtleU5hbWUpO1xuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcbiAgXHRsb2NhbGUuYmluZE1hY3JvKCdjYXBzbG9jayArICcgKyBrZXlOYW1lLCBjYXBpdGFsS2V5TmFtZSk7XG4gIH1cblxuICAvLyBicm93c2VyIGNhdmVhdHNcbiAgY29uc3Qgc2VtaWNvbG9uS2V5Q29kZSA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gNTkgIDogMTg2O1xuICBjb25zdCBkYXNoS2V5Q29kZSAgICAgID0gdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykgPyAxNzMgOiAxODk7XG4gIGNvbnN0IGVxdWFsS2V5Q29kZSAgICAgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDYxICA6IDE4NztcbiAgbGV0IGxlZnRDb21tYW5kS2V5Q29kZTtcbiAgbGV0IHJpZ2h0Q29tbWFuZEtleUNvZGU7XG4gIGlmIChwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgKHVzZXJBZ2VudC5tYXRjaCgnU2FmYXJpJykgfHwgdXNlckFnZW50Lm1hdGNoKCdDaHJvbWUnKSkpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gOTE7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDkzO1xuICB9IGVsc2UgaWYocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmIHVzZXJBZ2VudC5tYXRjaCgnT3BlcmEnKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSAxNztcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gMTc7XG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykpIHtcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gMjI0O1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSAyMjQ7XG4gIH1cbiAgbG9jYWxlLmJpbmRLZXlDb2RlKHNlbWljb2xvbktleUNvZGUsICAgIFsnc2VtaWNvbG9uJywgJzsnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShkYXNoS2V5Q29kZSwgICAgICAgICBbJ2Rhc2gnLCAnLSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGVxdWFsS2V5Q29kZSwgICAgICAgIFsnZXF1YWwnLCAnZXF1YWxzaWduJywgJz0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShsZWZ0Q29tbWFuZEtleUNvZGUsICBbJ2NvbW1hbmQnLCAnd2luZG93cycsICd3aW4nLCAnc3VwZXInLCAnbGVmdGNvbW1hbmQnLCAnbGVmdHdpbmRvd3MnLCAnbGVmdHdpbicsICdsZWZ0c3VwZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZShyaWdodENvbW1hbmRLZXlDb2RlLCBbJ2NvbW1hbmQnLCAnd2luZG93cycsICd3aW4nLCAnc3VwZXInLCAncmlnaHRjb21tYW5kJywgJ3JpZ2h0d2luZG93cycsICdyaWdodHdpbicsICdyaWdodHN1cGVyJ10pO1xuXG4gIC8vIGtpbGwga2V5c1xuICBsb2NhbGUuc2V0S2lsbEtleSgnY29tbWFuZCcpO1xufTtcbiIsImltcG9ydCB7IEtleWJvYXJkIH0gZnJvbSAnLi9saWIva2V5Ym9hcmQnO1xuaW1wb3J0IHsgTG9jYWxlIH0gZnJvbSAnLi9saWIvbG9jYWxlJztcbmltcG9ydCB7IEtleUNvbWJvIH0gZnJvbSAnLi9saWIva2V5LWNvbWJvJztcbmltcG9ydCB7IHVzIH0gZnJvbSAnLi9sb2NhbGVzL3VzJztcblxuY29uc3Qga2V5Ym9hcmQgPSBuZXcgS2V5Ym9hcmQoKTtcblxua2V5Ym9hcmQuc2V0TG9jYWxlKCd1cycsIHVzKTtcblxua2V5Ym9hcmQuS2V5Ym9hcmQgPSBLZXlib2FyZDtcbmtleWJvYXJkLkxvY2FsZSA9IExvY2FsZTtcbmtleWJvYXJkLktleUNvbWJvID0gS2V5Q29tYm87XG5cbmV4cG9ydCBkZWZhdWx0IGtleWJvYXJkO1xuIl0sIm5hbWVzIjpbIktleUNvbWJvIiwia2V5Q29tYm9TdHIiLCJzb3VyY2VTdHIiLCJzdWJDb21ib3MiLCJwYXJzZUNvbWJvU3RyIiwia2V5TmFtZXMiLCJyZWR1Y2UiLCJtZW1vIiwibmV4dFN1YkNvbWJvIiwiY29uY2F0IiwicHJlc3NlZEtleU5hbWVzIiwic3RhcnRpbmdLZXlOYW1lSW5kZXgiLCJpIiwibGVuZ3RoIiwiX2NoZWNrU3ViQ29tYm8iLCJvdGhlcktleUNvbWJvIiwic3ViQ29tYm8iLCJvdGhlclN1YkNvbWJvIiwic2xpY2UiLCJqIiwia2V5TmFtZSIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsImVuZEluZGV4IiwiZXNjYXBlZEtleU5hbWUiLCJjb21ib0RlbGltaW5hdG9yIiwia2V5RGVsaW1pbmF0b3IiLCJzdWJDb21ib1N0cnMiLCJfc3BsaXRTdHIiLCJjb21ibyIsInB1c2giLCJzdHIiLCJkZWxpbWluYXRvciIsInMiLCJkIiwiYyIsImNhIiwiY2kiLCJ0cmltIiwiTG9jYWxlIiwibmFtZSIsImxvY2FsZU5hbWUiLCJhY3RpdmVUYXJnZXRLZXlzIiwicHJlc3NlZEtleXMiLCJfYXBwbGllZE1hY3JvcyIsIl9rZXlNYXAiLCJfa2lsbEtleUNvZGVzIiwiX21hY3JvcyIsImtleUNvZGUiLCJoYW5kbGVyIiwibWFjcm8iLCJrZXlDb21ibyIsImtleUNvZGVzIiwiZ2V0S2V5Q29kZXMiLCJzZXRLaWxsS2V5IiwicHJlc3NLZXkiLCJnZXRLZXlOYW1lcyIsIl9hcHBseU1hY3JvcyIsInJlbGVhc2VLZXkiLCJraWxsS2V5Q29kZUluZGV4IiwiX2NsZWFyTWFjcm9zIiwibWFjcm9zIiwiY2hlY2siLCJpc1RhcmdldGVkIiwic29tZSIsImsiLCJLZXlib2FyZCIsInRhcmdldFdpbmRvdyIsInRhcmdldEVsZW1lbnQiLCJ0YXJnZXRQbGF0Zm9ybSIsInRhcmdldFVzZXJBZ2VudCIsIl9sb2NhbGUiLCJfY3VycmVudENvbnRleHQiLCJfY29udGV4dHMiLCJfbGlzdGVuZXJzIiwiX2FwcGxpZWRMaXN0ZW5lcnMiLCJfbG9jYWxlcyIsIl90YXJnZXRFbGVtZW50IiwiX3RhcmdldFdpbmRvdyIsIl90YXJnZXRQbGF0Zm9ybSIsIl90YXJnZXRVc2VyQWdlbnQiLCJfaXNNb2Rlcm5Ccm93c2VyIiwiX3RhcmdldEtleURvd25CaW5kaW5nIiwiX3RhcmdldEtleVVwQmluZGluZyIsIl90YXJnZXRSZXNldEJpbmRpbmciLCJfcGF1c2VkIiwiZ2xvYmFsIiwibGlzdGVuZXJzIiwic2V0Q29udGV4dCIsImxvY2FsZUJ1aWxkZXIiLCJsb2NhbGUiLCJfbG9jYWxlTmFtZSIsImxvY2FsTmFtZSIsInByZXNzSGFuZGxlciIsInJlbGVhc2VIYW5kbGVyIiwicHJldmVudFJlcGVhdEJ5RGVmYXVsdCIsImJpbmQiLCJwcmV2ZW50UmVwZWF0IiwiZXhlY3V0aW5nSGFuZGxlciIsInVuYmluZCIsImxpc3RlbmVyIiwiY29tYm9NYXRjaGVzIiwiaXNFcXVhbCIsInByZXNzSGFuZGxlck1hdGNoZXMiLCJyZWxlYXNlSGFuZGxlck1hdGNoZXMiLCJjb250ZXh0TmFtZSIsInJlbGVhc2VBbGxLZXlzIiwiZ2xvYmFsQ29udGV4dCIsImNvbnRleHQiLCJzdG9wIiwid2F0Y2giLCJjYWxsYmFjayIsInByZXZpb3VzQ29udGV4dE5hbWUiLCJnZXRDb250ZXh0Iiwid2luIiwiZ2xvYmFsVGhpcyIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJhdHRhY2hFdmVudCIsIkVycm9yIiwibm9kZVR5cGUiLCJ1c2VyQWdlbnQiLCJuYXZpZ2F0b3IiLCJwbGF0Zm9ybSIsImRvY3VtZW50IiwiZXZlbnQiLCJfaGFuZGxlQ29tbWFuZEJ1ZyIsIl9iaW5kRXZlbnQiLCJjdXJyZW50Q29udGV4dCIsIl91bmJpbmRFdmVudCIsIl9hcHBseUJpbmRpbmdzIiwiX2NsZWFyQmluZGluZ3MiLCJldmVudE5hbWUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZGV0YWNoRXZlbnQiLCJsaXN0ZW5lckdyb3VwcyIsImxpc3RlbmVyR3JvdXBNYXAiLCJzb3J0IiwiYSIsImIiLCJmb3JFYWNoIiwibCIsIm1hcEluZGV4IiwiX2dldEdyb3VwZWRMaXN0ZW5lcnMiLCJpbmNsdWRlcyIsImNhbGwiLCJtb2RpZmllcktleXMiLCJtYXRjaCIsInVzIiwiYmluZEtleUNvZGUiLCJiaW5kTWFjcm8iLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJjYXBpdGFsS2V5TmFtZSIsInNlbWljb2xvbktleUNvZGUiLCJkYXNoS2V5Q29kZSIsImVxdWFsS2V5Q29kZSIsImxlZnRDb21tYW5kS2V5Q29kZSIsInJpZ2h0Q29tbWFuZEtleUNvZGUiLCJrZXlib2FyZCIsInNldExvY2FsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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
