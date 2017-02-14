(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("keyboardJS", [], factory);
	else if(typeof exports === 'object')
		exports["keyboardJS"] = factory();
	else
		root["keyboardJS"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.KeyCombo = exports.Locale = exports.Keyboard = undefined;
	
	var _keyboard = __webpack_require__(1);
	
	var _keyboard2 = _interopRequireDefault(_keyboard);
	
	var _locale = __webpack_require__(2);
	
	var _locale2 = _interopRequireDefault(_locale);
	
	var _keyCombo = __webpack_require__(3);
	
	var _keyCombo2 = _interopRequireDefault(_keyCombo);
	
	var _us = __webpack_require__(4);
	
	var _us2 = _interopRequireDefault(_us);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var keyboard = new _keyboard2.default();
	keyboard.setLocale('us', _us2.default);
	
	module.exports = keyboard;
	exports.Keyboard = _keyboard2.default;
	exports.Locale = _locale2.default;
	exports.KeyCombo = _keyCombo2.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _locale = __webpack_require__(2);
	
	var _locale2 = _interopRequireDefault(_locale);
	
	var _keyCombo = __webpack_require__(3);
	
	var _keyCombo2 = _interopRequireDefault(_keyCombo);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Keyboard = function () {
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
	    key: 'setLocale',
	    value: function setLocale(localeName, localeBuilder) {
	      var locale = null;
	      if (typeof localeName === 'string') {
	
	        if (localeBuilder) {
	          locale = new _locale2.default(localeName);
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
	    key: 'getLocale',
	    value: function getLocale(localName) {
	      localName || (localName = this._locale.localeName);
	      return this._locales[localName] || null;
	    }
	  }, {
	    key: 'bind',
	    value: function bind(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault) {
	      if (keyComboStr === null || typeof keyComboStr === 'function') {
	        preventRepeatByDefault = releaseHandler;
	        releaseHandler = pressHandler;
	        pressHandler = keyComboStr;
	        keyComboStr = null;
	      }
	
	      if (keyComboStr && (typeof keyComboStr === 'undefined' ? 'undefined' : _typeof(keyComboStr)) === 'object' && typeof keyComboStr.length === 'number') {
	        for (var i = 0; i < keyComboStr.length; i += 1) {
	          this.bind(keyComboStr[i], pressHandler, releaseHandler);
	        }
	        return;
	      }
	
	      this._listeners.push({
	        keyCombo: keyComboStr ? new _keyCombo2.default(keyComboStr) : null,
	        pressHandler: pressHandler || null,
	        releaseHandler: releaseHandler || null,
	        preventRepeat: preventRepeatByDefault || false,
	        preventRepeatByDefault: preventRepeatByDefault || false
	      });
	    }
	  }, {
	    key: 'unbind',
	    value: function unbind(keyComboStr, pressHandler, releaseHandler) {
	      if (keyComboStr === null || typeof keyComboStr === 'function') {
	        releaseHandler = pressHandler;
	        pressHandler = keyComboStr;
	        keyComboStr = null;
	      }
	
	      if (keyComboStr && (typeof keyComboStr === 'undefined' ? 'undefined' : _typeof(keyComboStr)) === 'object' && typeof keyComboStr.length === 'number') {
	        for (var i = 0; i < keyComboStr.length; i += 1) {
	          this.unbind(keyComboStr[i], pressHandler, releaseHandler);
	        }
	        return;
	      }
	
	      for (var i = 0; i < this._listeners.length; i += 1) {
	        var listener = this._listeners[i];
	
	        var comboMatches = !keyComboStr && !listener.keyCombo || listener.keyCombo && listener.keyCombo.isEqual(keyComboStr);
	        var pressHandlerMatches = !pressHandler && !releaseHandler || !pressHandler && !listener.pressHandler || pressHandler === listener.pressHandler;
	        var releaseHandlerMatches = !pressHandler && !releaseHandler || !releaseHandler && !listener.releaseHandler || releaseHandler === listener.releaseHandler;
	
	        if (comboMatches && pressHandlerMatches && releaseHandlerMatches) {
	          this._listeners.splice(i, 1);
	          i -= 1;
	        }
	      }
	    }
	  }, {
	    key: 'setContext',
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
	    key: 'getContext',
	    value: function getContext() {
	      return this._currentContext;
	    }
	  }, {
	    key: 'withContext',
	    value: function withContext(contextName, callback) {
	      var previousContextName = this.getContext();
	      this.setContext(contextName);
	
	      callback();
	
	      this.setContext(previousContextName);
	    }
	  }, {
	    key: 'watch',
	    value: function watch(targetWindow, targetElement, targetPlatform, targetUserAgent) {
	      var _this = this;
	
	      this.stop();
	
	      if (!targetWindow) {
	        if (!global.addEventListener && !global.attachEvent) {
	          throw new Error('Cannot find global functions addEventListener or attachEvent.');
	        }
	        targetWindow = global;
	      }
	
	      if (typeof targetWindow.nodeType === 'number') {
	        targetUserAgent = targetPlatform;
	        targetPlatform = targetElement;
	        targetElement = targetWindow;
	        targetWindow = global;
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
	    key: 'stop',
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
	    key: 'pressKey',
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
	    key: 'releaseKey',
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
	    key: 'releaseAllKeys',
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
	    key: 'pause',
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
	    key: 'resume',
	    value: function resume() {
	      this._paused = false;
	    }
	  }, {
	    key: 'reset',
	    value: function reset() {
	      this.releaseAllKeys();
	      this._listeners.length = 0;
	    }
	  }, {
	    key: '_bindEvent',
	    value: function _bindEvent(targetElement, eventName, handler) {
	      return this._isModernBrowser ? targetElement.addEventListener(eventName, handler, false) : targetElement.attachEvent('on' + eventName, handler);
	    }
	  }, {
	    key: '_unbindEvent',
	    value: function _unbindEvent(targetElement, eventName, handler) {
	      return this._isModernBrowser ? targetElement.removeEventListener(eventName, handler, false) : targetElement.detachEvent('on' + eventName, handler);
	    }
	  }, {
	    key: '_getGroupedListeners',
	    value: function _getGroupedListeners() {
	      var listenerGroups = [];
	      var listenerGroupMap = [];
	
	      var listeners = this._listeners;
	      if (this._currentContext !== 'global') {
	        listeners = [].concat(listeners, this._contexts.global);
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
	    key: '_applyBindings',
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
	                keyCombo: new _keyCombo2.default(pressedKeys.join('+')),
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
	
	            if (listener.releaseHandler && !this._appliedListeners.includes(listener)) {
	              this._appliedListeners.push(listener);
	            }
	          }
	
	          if (keyCombo) {
	            for (var j = 0; j < keyCombo.keyNames.length; j += 1) {
	              var index = pressedKeys.indexOf(keyCombo.keyNames[j]);
	              if (index !== -1) {
	                pressedKeys.splice(index, 1);
	                j -= 1;
	              }
	            }
	          }
	        }
	      }
	    }
	  }, {
	    key: '_clearBindings',
	    value: function _clearBindings(event) {
	      event || (event = {});
	
	      for (var i = 0; i < this._appliedListeners.length; i += 1) {
	        var listener = this._appliedListeners[i];
	        var keyCombo = listener.keyCombo;
	        if (keyCombo === null || !keyCombo.check(this._locale.pressedKeys)) {
	          listener.preventRepeat = listener.preventRepeatByDefault;
	          listener.releaseHandler.call(this, event);
	          this._appliedListeners.splice(i, 1);
	          i -= 1;
	        }
	      }
	    }
	  }]);
	
	  return Keyboard;
	}();
	
	Keyboard.prototype.addListener = Keyboard.prototype.bind;
	Keyboard.prototype.on = Keyboard.prototype.bind;
	
	Keyboard.prototype.removeListener = Keyboard.prototype.unbind;
	Keyboard.prototype.off = Keyboard.prototype.unbind;
	
	exports.default = Keyboard;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _keyCombo = __webpack_require__(3);
	
	var _keyCombo2 = _interopRequireDefault(_keyCombo);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Locale = function () {
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
	    key: 'bindKeyCode',
	    value: function bindKeyCode(keyCode, keyNames) {
	      if (typeof keyNames === 'string') {
	        keyNames = [keyNames];
	      }
	
	      this._keyMap[keyCode] = keyNames;
	    }
	  }, {
	    key: 'bindMacro',
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
	        keyCombo: new _keyCombo2.default(keyComboStr),
	        keyNames: keyNames,
	        handler: handler
	      };
	
	      this._macros.push(macro);
	    }
	  }, {
	    key: 'getKeyCodes',
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
	    key: 'getKeyNames',
	    value: function getKeyNames(keyCode) {
	      return this._keyMap[keyCode] || [];
	    }
	  }, {
	    key: 'setKillKey',
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
	    key: 'pressKey',
	    value: function pressKey(keyCode) {
	      if (typeof keyCode === 'string') {
	        var keyCodes = this.getKeyCodes(keyCode);
	        for (var i = 0; i < keyCodes.length; i += 1) {
	          this.pressKey(keyCodes[i]);
	        }
	        return;
	      }
	
	      var keyNames = this.getKeyNames(keyCode);
	      for (var i = 0; i < keyNames.length; i += 1) {
	        if (!this.pressedKeys.includes(keyNames[i])) {
	          this.pressedKeys.push(keyNames[i]);
	        }
	      }
	
	      this._applyMacros();
	    }
	  }, {
	    key: 'releaseKey',
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
	          for (var i = 0; i < keyNames.length; i += 1) {
	            var index = this.pressedKeys.indexOf(keyNames[i]);
	            if (index > -1) {
	              this.pressedKeys.splice(index, 1);
	            }
	          }
	        }
	
	        this._clearMacros();
	      }
	    }
	  }, {
	    key: '_applyMacros',
	    value: function _applyMacros() {
	      var macros = this._macros.slice(0);
	      for (var i = 0; i < macros.length; i += 1) {
	        var macro = macros[i];
	        if (macro.keyCombo.check(this.pressedKeys)) {
	          if (macro.handler) {
	            macro.keyNames = macro.handler(this.pressedKeys);
	          }
	          for (var j = 0; j < macro.keyNames.length; j += 1) {
	            if (!this.pressedKeys.includes(macro.keyNames[j])) {
	              this.pressedKeys.push(macro.keyNames[j]);
	            }
	          }
	          this._appliedMacros.push(macro);
	        }
	      }
	    }
	  }, {
	    key: '_clearMacros',
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
	
	exports.default = Locale;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var KeyCombo = function () {
	  function KeyCombo(keyComboStr) {
	    _classCallCheck(this, KeyCombo);
	
	    this.sourceStr = keyComboStr;
	    this.subCombos = KeyCombo.parseComboStr(keyComboStr);
	    this.keyNames = this.subCombos.reduce(function (memo, nextSubCombo) {
	      return memo.concat(nextSubCombo);
	    }, []);
	  }
	
	  _createClass(KeyCombo, [{
	    key: 'check',
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
	    key: 'isEqual',
	    value: function isEqual(otherKeyCombo) {
	      if (!otherKeyCombo || typeof otherKeyCombo !== 'string' && (typeof otherKeyCombo === 'undefined' ? 'undefined' : _typeof(otherKeyCombo)) !== 'object') {
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
	
	      for (var i = 0; i < this.subCombos.length; i += 1) {
	        var subCombo = this.subCombos[i];
	        var otherSubCombo = otherKeyCombo.subCombos[i].slice(0);
	
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
	    key: '_checkSubCombo',
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
	
	// TODO: Add support for key combo sequences
	
	
	KeyCombo.sequenceDeliminator = '>>';
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
	
	exports.default = KeyCombo;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	exports.default = function (locale, platform, userAgent) {
	
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
	  locale.bindKeyCode(187, ['equal', 'equalsign', '=']);
	  locale.bindKeyCode(188, ['comma', ',']);
	  locale.bindKeyCode(190, ['period', '.']);
	  locale.bindKeyCode(191, ['slash', 'forwardslash', '/']);
	  locale.bindKeyCode(192, ['graveaccent', '`']);
	  locale.bindKeyCode(219, ['openbracket', '[']);
	  locale.bindKeyCode(220, ['backslash', '\\']);
	  locale.bindKeyCode(221, ['closebracket', ']']);
	  locale.bindKeyCode(222, ['apostrophe', '\'']);
	
	  // 0-9
	  locale.bindKeyCode(48, ['zero', '0']);
	  locale.bindKeyCode(49, ['one', '1']);
	  locale.bindKeyCode(50, ['two', '2']);
	  locale.bindKeyCode(51, ['three', '3']);
	  locale.bindKeyCode(52, ['four', '4']);
	  locale.bindKeyCode(53, ['five', '5']);
	  locale.bindKeyCode(54, ['six', '6']);
	  locale.bindKeyCode(55, ['seven', '7']);
	  locale.bindKeyCode(56, ['eight', '8']);
	  locale.bindKeyCode(57, ['nine', '9']);
	
	  // numpad
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
	  locale.bindKeyCode(144, ['numlock', 'num']);
	
	  // function keys
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
	
	  // secondary key symbols
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
	
	  //a-z and A-Z
	  for (var keyCode = 65; keyCode <= 90; keyCode += 1) {
	    var keyName = String.fromCharCode(keyCode + 32);
	    var capitalKeyName = String.fromCharCode(keyCode);
	    locale.bindKeyCode(keyCode, keyName);
	    locale.bindMacro('shift + ' + keyName, capitalKeyName);
	    locale.bindMacro('capslock + ' + keyName, capitalKeyName);
	  }
	
	  // browser caveats
	  var semicolonKeyCode = userAgent.match('Firefox') ? 59 : 186;
	  var dashKeyCode = userAgent.match('Firefox') ? 173 : 189;
	  var leftCommandKeyCode = void 0;
	  var rightCommandKeyCode = void 0;
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
	  locale.bindKeyCode(leftCommandKeyCode, ['command', 'windows', 'win', 'super', 'leftcommand', 'leftwindows', 'leftwin', 'leftsuper']);
	  locale.bindKeyCode(rightCommandKeyCode, ['command', 'windows', 'win', 'super', 'rightcommand', 'rightwindows', 'rightwin', 'rightsuper']);
	
	  // kill keys
	  locale.setKillKey('command');
	};

/***/ }
/******/ ])
});
;
//# sourceMappingURL=keyboard.js.map