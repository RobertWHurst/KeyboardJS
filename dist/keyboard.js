!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.keyboardJS=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var Keyboard = require('./lib/keyboard');
var Locale   = require('./lib/locale');
var KeyCombo = require('./lib/key-combo');

var keyboard = new Keyboard();

keyboard.setLocale('us', require('./locales/us'));

exports          = module.exports = keyboard;
exports.Keyboard = Keyboard;
exports.Locale   = Locale;
exports.KeyCombo = KeyCombo;

},{"./lib/key-combo":2,"./lib/keyboard":3,"./lib/locale":4,"./locales/us":5}],2:[function(require,module,exports){

function KeyCombo(keyComboStr) {
  this.sourceStr = keyComboStr;
  this.subCombos = KeyCombo.parseComboStr(keyComboStr);
  this.keyNames  = this.subCombos.reduce(function(memo, nextSubCombo) {
    return memo.concat(nextSubCombo);
  }, []);
}

// TODO: Add support for key combo sequences
KeyCombo.sequenceDeliminator = '>>';
KeyCombo.comboDeliminator    = '>';
KeyCombo.keyDeliminator      = '+';

KeyCombo.parseComboStr = function(keyComboStr) {
  var subComboStrs = KeyCombo._splitStr(keyComboStr, KeyCombo.comboDeliminator);
  var combo        = [];

  for (var i = 0 ; i < subComboStrs.length; i += 1) {
    combo.push(KeyCombo._splitStr(subComboStrs[i], KeyCombo.keyDeliminator));
  }
  return combo;
};

KeyCombo.prototype.check = function(pressedKeyNames) {
  var startingKeyNameIndex = 0;
  for (var i = 0; i < this.subCombos.length; i += 1) {
    startingKeyNameIndex = this._checkSubCombo(
      this.subCombos[i],
      startingKeyNameIndex,
      pressedKeyNames
    );
    if (startingKeyNameIndex === -1) { return false; }
  }
  return true;
};

KeyCombo.prototype.isEqual = function(otherKeyCombo) {
  if (
    !otherKeyCombo ||
    typeof otherKeyCombo !== 'string' &&
    typeof otherKeyCombo !== 'object'
  ) { return false; }

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
    var subCombo      = this.subCombos[i];
    var otherSubCombo = otherKeyCombo.subCombos[i].slice(0);

    for (var j = 0; j < subCombo.length; j += 1) {
      var keyName = subCombo[j];
      var index   = otherSubCombo.indexOf(keyName);

      if (index > -1) {
        otherSubCombo.splice(index, 1);
      }
    }
    if (otherSubCombo.length !== 0) {
      return false;
    }
  }

  return true;
};

KeyCombo._splitStr = function(str, deliminator) {
  var s  = str;
  var d  = deliminator;
  var c  = '';
  var ca = [];

  for (var ci = 0; ci < s.length; ci += 1) {
    if (ci > 0 && s[ci] === d && s[ci - 1] !== '\\') {
      ca.push(c.trim());
      c = '';
      ci += 1;
    }
    c += s[ci];
  }
  if (c) { ca.push(c.trim()); }

  return ca;
};

KeyCombo.prototype._checkSubCombo = function(subCombo, startingKeyNameIndex, pressedKeyNames) {
  subCombo = subCombo.slice(0);
  pressedKeyNames = pressedKeyNames.slice(startingKeyNameIndex);

  var endIndex = startingKeyNameIndex;
  for (var i = 0; i < subCombo.length; i += 1) {

    var keyName = subCombo[i];
    if (keyName[0] === '\\') {
      var escapedKeyName = keyName.slice(1);
      if (
        escapedKeyName === KeyCombo.comboDeliminator ||
        escapedKeyName === KeyCombo.keyDeliminator
      ) {
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
};


module.exports = KeyCombo;

},{}],3:[function(require,module,exports){
(function (global){

var Locale = require('./locale');
var KeyCombo = require('./key-combo');


function Keyboard(targetWindow, targetElement, platform, userAgent) {
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
  this._callerHandler        = null;

  this.setContext('global');
  this.watch(targetWindow, targetElement, platform, userAgent);
}

Keyboard.prototype.setLocale = function(localeName, localeBuilder) {
  var locale = null;
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
};

Keyboard.prototype.getLocale = function(localName) {
  localName || (localName = this._locale.localeName);
  return this._locales[localName] || null;
};

Keyboard.prototype.bind = function(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault) {
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
    for (var i = 0; i < keyComboStr.length; i += 1) {
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
};
Keyboard.prototype.addListener = Keyboard.prototype.bind;
Keyboard.prototype.on          = Keyboard.prototype.bind;

Keyboard.prototype.unbind = function(keyComboStr, pressHandler, releaseHandler) {
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
    var listener = this._listeners[i];

    var comboMatches          = !keyComboStr && !listener.keyCombo ||
                                listener.keyCombo && listener.keyCombo.isEqual(keyComboStr);
    var pressHandlerMatches   = !pressHandler && !releaseHandler ||
                                !pressHandler && !listener.pressHandler ||
                                pressHandler === listener.pressHandler;
    var releaseHandlerMatches = !pressHandler && !releaseHandler ||
                                !releaseHandler && !listener.releaseHandler ||
                                releaseHandler === listener.releaseHandler;

    if (comboMatches && pressHandlerMatches && releaseHandlerMatches) {
      this._listeners.splice(i, 1);
      i -= 1;
    }
  }
};
Keyboard.prototype.removeListener = Keyboard.prototype.unbind;
Keyboard.prototype.off            = Keyboard.prototype.unbind;

Keyboard.prototype.setContext = function(contextName) {
  if(this._locale) { this.releaseAllKeys(); }

  if (!this._contexts[contextName]) {
    this._contexts[contextName] = [];
  }
  this._listeners      = this._contexts[contextName];
  this._currentContext = contextName;
};

Keyboard.prototype.getContext = function() {
  return this._currentContext;
};

Keyboard.prototype.withContext = function(contextName, callback) {
  var previousContextName = this.getContext();
  this.setContext(contextName);

  callback();

  this.setContext(previousContextName);
};

Keyboard.prototype.watch = function(targetWindow, targetElement, targetPlatform, targetUserAgent) {
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
    targetPlatform  = targetElement;
    targetElement   = targetWindow;
    targetWindow    = global;
  }

  if (!targetWindow.addEventListener && !targetWindow.attachEvent) {
    throw new Error('Cannot find addEventListener or attachEvent methods on targetWindow.');
  }

  this._isModernBrowser = !!targetWindow.addEventListener;

  var userAgent = targetWindow.navigator && targetWindow.navigator.userAgent || '';
  var platform  = targetWindow.navigator && targetWindow.navigator.platform  || '';

  targetElement   && targetElement   !== null || (targetElement   = targetWindow.document);
  targetPlatform  && targetPlatform  !== null || (targetPlatform  = platform);
  targetUserAgent && targetUserAgent !== null || (targetUserAgent = userAgent);

  this._targetKeyDownBinding = function(event) {
    _this.pressKey(event.keyCode, event);
    _this._handleCommandBug(event, platform);
  };
  this._targetKeyUpBinding = function(event) {
    _this.releaseKey(event.keyCode, event);
  };
  this._targetResetBinding = function(event) {
    _this.releaseAllKeys(event)
  };

  this._bindEvent(targetElement, 'keydown', this._targetKeyDownBinding);
  this._bindEvent(targetElement, 'keyup',   this._targetKeyUpBinding);
  this._bindEvent(targetWindow,  'focus',   this._targetResetBinding);
  this._bindEvent(targetWindow,  'blur',    this._targetResetBinding);

  this._targetElement   = targetElement;
  this._targetWindow    = targetWindow;
  this._targetPlatform  = targetPlatform;
  this._targetUserAgent = targetUserAgent;
};

Keyboard.prototype.stop = function() {
  var _this = this;

  if (!this._targetElement || !this._targetWindow) { return; }

  this._unbindEvent(this._targetElement, 'keydown', this._targetKeyDownBinding);
  this._unbindEvent(this._targetElement, 'keyup',   this._targetKeyUpBinding);
  this._unbindEvent(this._targetWindow,  'focus',   this._targetResetBinding);
  this._unbindEvent(this._targetWindow,  'blur',    this._targetResetBinding);

  this._targetWindow  = null;
  this._targetElement = null;
};

Keyboard.prototype.pressKey = function(keyCode, event) {
  if (this._paused) { return; }
  if (!this._locale) { throw new Error('Locale not set'); }

  this._locale.pressKey(keyCode);
  this._applyBindings(event);
};

Keyboard.prototype.releaseKey = function(keyCode, event) {
  if (this._paused) { return; }
  if (!this._locale) { throw new Error('Locale not set'); }

  this._locale.releaseKey(keyCode);
  this._clearBindings(event);
};

Keyboard.prototype.releaseAllKeys = function(event) {
  if (this._paused) { return; }
  if (!this._locale) { throw new Error('Locale not set'); }

  this._locale.pressedKeys.length = 0;
  this._clearBindings(event);
};

Keyboard.prototype.pause = function() {
  if (this._paused) { return; }
  if (this._locale) { this.releaseAllKeys(); }
  this._paused = true;
};

Keyboard.prototype.resume = function() {
  this._paused = false;
};

Keyboard.prototype.reset = function() {
  this.releaseAllKeys();
  this._listeners.length = 0;
};

Keyboard.prototype._bindEvent = function(targetElement, eventName, handler) {
  return this._isModernBrowser ?
    targetElement.addEventListener(eventName, handler, false) :
    targetElement.attachEvent('on' + eventName, handler);
};

Keyboard.prototype._unbindEvent = function(targetElement, eventName, handler) {
  return this._isModernBrowser ?
    targetElement.removeEventListener(eventName, handler, false) :
    targetElement.detachEvent('on' + eventName, handler);
};

Keyboard.prototype._getGroupedListeners = function() {
  var listenerGroups   = [];
  var listenerGroupMap = [];

  var listeners = this._listeners;
  if (this._currentContext !== 'global') {
    listeners = [].concat(listeners, this._contexts.global);
  }

  listeners.sort(function(a, b) {
    return (b.keyCombo ? b.keyCombo.keyNames.length : 0) - (a.keyCombo ? a.keyCombo.keyNames.length : 0);
  }).forEach(function(l) {
    var mapIndex = -1;
    for (var i = 0; i < listenerGroupMap.length; i += 1) {
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
};

Keyboard.prototype._applyBindings = function(event) {
  var preventRepeat = false;

  event || (event = {});
  event.preventRepeat = function() { preventRepeat = true; };
  event.pressedKeys   = this._locale.pressedKeys.slice(0);

  var pressedKeys    = this._locale.pressedKeys.slice(0);
  var listenerGroups = this._getGroupedListeners();


  for (var i = 0; i < listenerGroups.length; i += 1) {
    var listeners = listenerGroups[i];
    var keyCombo  = listeners[0].keyCombo;

    if (keyCombo === null || keyCombo.check(pressedKeys)) {
      for (var j = 0; j < listeners.length; j += 1) {
        var listener = listeners[j];

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

        if (listener.releaseHandler && this._appliedListeners.indexOf(listener) === -1) {
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
};

Keyboard.prototype._clearBindings = function(event) {
  event || (event = {});

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
};

Keyboard.prototype._handleCommandBug = function(event, platform) {
  // On Mac when the command key is kept pressed, keyup is not triggered for any other key.
  // In this case force a keyup for non-modifier keys directly after the keypress.
  var modifierKeys = ["shift", "ctrl", "alt", "capslock", "tab", "command"];
  if (platform.match("Mac") && this._locale.pressedKeys.includes("command") &&
      !modifierKeys.includes(this._locale.getKeyNames(event.keyCode)[0])) {
    this._targetKeyUpBinding(event);
  }
};

module.exports = Keyboard;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9rZXlib2FyZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbnZhciBMb2NhbGUgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xyXG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2tleS1jb21ibycpO1xyXG5cclxuXHJcbmZ1bmN0aW9uIEtleWJvYXJkKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgcGxhdGZvcm0sIHVzZXJBZ2VudCkge1xyXG4gIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgID0gbnVsbDtcclxuICB0aGlzLl9jdXJyZW50Q29udGV4dCAgICAgICA9IG51bGw7XHJcbiAgdGhpcy5fY29udGV4dHMgICAgICAgICAgICAgPSB7fTtcclxuICB0aGlzLl9saXN0ZW5lcnMgICAgICAgICAgICA9IFtdO1xyXG4gIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMgICAgID0gW107XHJcbiAgdGhpcy5fbG9jYWxlcyAgICAgICAgICAgICAgPSB7fTtcclxuICB0aGlzLl90YXJnZXRFbGVtZW50ICAgICAgICA9IG51bGw7XHJcbiAgdGhpcy5fdGFyZ2V0V2luZG93ICAgICAgICAgPSBudWxsO1xyXG4gIHRoaXMuX3RhcmdldFBsYXRmb3JtICAgICAgID0gJyc7XHJcbiAgdGhpcy5fdGFyZ2V0VXNlckFnZW50ICAgICAgPSAnJztcclxuICB0aGlzLl9pc01vZGVybkJyb3dzZXIgICAgICA9IGZhbHNlO1xyXG4gIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gbnVsbDtcclxuICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcgICA9IG51bGw7XHJcbiAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nICAgPSBudWxsO1xyXG4gIHRoaXMuX3BhdXNlZCAgICAgICAgICAgICAgID0gZmFsc2U7XHJcbiAgdGhpcy5fY2FsbGVySGFuZGxlciAgICAgICAgPSBudWxsO1xyXG5cclxuICB0aGlzLnNldENvbnRleHQoJ2dsb2JhbCcpO1xyXG4gIHRoaXMud2F0Y2godGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCBwbGF0Zm9ybSwgdXNlckFnZW50KTtcclxufVxyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnNldExvY2FsZSA9IGZ1bmN0aW9uKGxvY2FsZU5hbWUsIGxvY2FsZUJ1aWxkZXIpIHtcclxuICB2YXIgbG9jYWxlID0gbnVsbDtcclxuICBpZiAodHlwZW9mIGxvY2FsZU5hbWUgPT09ICdzdHJpbmcnKSB7XHJcblxyXG4gICAgaWYgKGxvY2FsZUJ1aWxkZXIpIHtcclxuICAgICAgbG9jYWxlID0gbmV3IExvY2FsZShsb2NhbGVOYW1lKTtcclxuICAgICAgbG9jYWxlQnVpbGRlcihsb2NhbGUsIHRoaXMuX3RhcmdldFBsYXRmb3JtLCB0aGlzLl90YXJnZXRVc2VyQWdlbnQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbG9jYWxlID0gdGhpcy5fbG9jYWxlc1tsb2NhbGVOYW1lXSB8fCBudWxsO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBsb2NhbGUgICAgID0gbG9jYWxlTmFtZTtcclxuICAgIGxvY2FsZU5hbWUgPSBsb2NhbGUuX2xvY2FsZU5hbWU7XHJcbiAgfVxyXG5cclxuICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgID0gbG9jYWxlO1xyXG4gIHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gPSBsb2NhbGU7XHJcbiAgaWYgKGxvY2FsZSkge1xyXG4gICAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzID0gbG9jYWxlLnByZXNzZWRLZXlzO1xyXG4gIH1cclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5nZXRMb2NhbGUgPSBmdW5jdGlvbihsb2NhbE5hbWUpIHtcclxuICBsb2NhbE5hbWUgfHwgKGxvY2FsTmFtZSA9IHRoaXMuX2xvY2FsZS5sb2NhbGVOYW1lKTtcclxuICByZXR1cm4gdGhpcy5fbG9jYWxlc1tsb2NhbE5hbWVdIHx8IG51bGw7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XHJcbiAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA9IHJlbGVhc2VIYW5kbGVyO1xyXG4gICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA9IHByZXNzSGFuZGxlcjtcclxuICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgPSBrZXlDb21ib1N0cjtcclxuICAgIGtleUNvbWJvU3RyICAgICAgICAgICAgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgaWYgKFxyXG4gICAga2V5Q29tYm9TdHIgJiZcclxuICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcclxuICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXHJcbiAgKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgIHRoaXMuYmluZChrZXlDb21ib1N0cltpXSwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XHJcbiAgICB9XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0aGlzLl9saXN0ZW5lcnMucHVzaCh7XHJcbiAgICBrZXlDb21ibyAgICAgICAgICAgICAgIDoga2V5Q29tYm9TdHIgPyBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpIDogbnVsbCxcclxuICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgOiBwcmVzc0hhbmRsZXIgICAgICAgICAgIHx8IG51bGwsXHJcbiAgICByZWxlYXNlSGFuZGxlciAgICAgICAgIDogcmVsZWFzZUhhbmRsZXIgICAgICAgICB8fCBudWxsLFxyXG4gICAgcHJldmVudFJlcGVhdCAgICAgICAgICA6IHByZXZlbnRSZXBlYXRCeURlZmF1bHQgfHwgZmFsc2UsXHJcbiAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZVxyXG4gIH0pO1xyXG59O1xyXG5LZXlib2FyZC5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBLZXlib2FyZC5wcm90b3R5cGUuYmluZDtcclxuS2V5Ym9hcmQucHJvdG90eXBlLm9uICAgICAgICAgID0gS2V5Ym9hcmQucHJvdG90eXBlLmJpbmQ7XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcclxuICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICByZWxlYXNlSGFuZGxlciA9IHByZXNzSGFuZGxlcjtcclxuICAgIHByZXNzSGFuZGxlciAgID0ga2V5Q29tYm9TdHI7XHJcbiAgICBrZXlDb21ib1N0ciA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBpZiAoXHJcbiAgICBrZXlDb21ib1N0ciAmJlxyXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnb2JqZWN0JyAmJlxyXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcclxuICApIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29tYm9TdHIubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgdGhpcy51bmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tpXTtcclxuXHJcbiAgICB2YXIgY29tYm9NYXRjaGVzICAgICAgICAgID0gIWtleUNvbWJvU3RyICYmICFsaXN0ZW5lci5rZXlDb21ibyB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmtleUNvbWJvICYmIGxpc3RlbmVyLmtleUNvbWJvLmlzRXF1YWwoa2V5Q29tYm9TdHIpO1xyXG4gICAgdmFyIHByZXNzSGFuZGxlck1hdGNoZXMgICA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJlc3NIYW5kbGVyIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlc3NIYW5kbGVyID09PSBsaXN0ZW5lci5wcmVzc0hhbmRsZXI7XHJcbiAgICB2YXIgcmVsZWFzZUhhbmRsZXJNYXRjaGVzID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcmVsZWFzZUhhbmRsZXIgJiYgIWxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsZWFzZUhhbmRsZXIgPT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyO1xyXG5cclxuICAgIGlmIChjb21ib01hdGNoZXMgJiYgcHJlc3NIYW5kbGVyTWF0Y2hlcyAmJiByZWxlYXNlSGFuZGxlck1hdGNoZXMpIHtcclxuICAgICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcclxuICAgICAgaSAtPSAxO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuS2V5Ym9hcmQucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZDtcclxuS2V5Ym9hcmQucHJvdG90eXBlLm9mZiAgICAgICAgICAgID0gS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZDtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5zZXRDb250ZXh0ID0gZnVuY3Rpb24oY29udGV4dE5hbWUpIHtcclxuICBpZih0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XHJcblxyXG4gIGlmICghdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdKSB7XHJcbiAgICB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0gPSBbXTtcclxuICB9XHJcbiAgdGhpcy5fbGlzdGVuZXJzICAgICAgPSB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV07XHJcbiAgdGhpcy5fY3VycmVudENvbnRleHQgPSBjb250ZXh0TmFtZTtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMuX2N1cnJlbnRDb250ZXh0O1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLndpdGhDb250ZXh0ID0gZnVuY3Rpb24oY29udGV4dE5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgdmFyIHByZXZpb3VzQ29udGV4dE5hbWUgPSB0aGlzLmdldENvbnRleHQoKTtcclxuICB0aGlzLnNldENvbnRleHQoY29udGV4dE5hbWUpO1xyXG5cclxuICBjYWxsYmFjaygpO1xyXG5cclxuICB0aGlzLnNldENvbnRleHQocHJldmlvdXNDb250ZXh0TmFtZSk7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUud2F0Y2ggPSBmdW5jdGlvbih0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHRhcmdldFBsYXRmb3JtLCB0YXJnZXRVc2VyQWdlbnQpIHtcclxuICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICB0aGlzLnN0b3AoKTtcclxuXHJcbiAgaWYgKCF0YXJnZXRXaW5kb3cpIHtcclxuICAgIGlmICghZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIgJiYgIWdsb2JhbC5hdHRhY2hFdmVudCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGdsb2JhbCBmdW5jdGlvbnMgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudC4nKTtcclxuICAgIH1cclxuICAgIHRhcmdldFdpbmRvdyA9IGdsb2JhbDtcclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2YgdGFyZ2V0V2luZG93Lm5vZGVUeXBlID09PSAnbnVtYmVyJykge1xyXG4gICAgdGFyZ2V0VXNlckFnZW50ID0gdGFyZ2V0UGxhdGZvcm07XHJcbiAgICB0YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRFbGVtZW50O1xyXG4gICAgdGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93O1xyXG4gICAgdGFyZ2V0V2luZG93ICAgID0gZ2xvYmFsO1xyXG4gIH1cclxuXHJcbiAgaWYgKCF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAmJiAhdGFyZ2V0V2luZG93LmF0dGFjaEV2ZW50KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQgbWV0aG9kcyBvbiB0YXJnZXRXaW5kb3cuJyk7XHJcbiAgfVxyXG5cclxuICB0aGlzLl9pc01vZGVybkJyb3dzZXIgPSAhIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xyXG5cclxuICB2YXIgdXNlckFnZW50ID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcclxuICB2YXIgcGxhdGZvcm0gID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtICB8fCAnJztcclxuXHJcbiAgdGFyZ2V0RWxlbWVudCAgICYmIHRhcmdldEVsZW1lbnQgICAhPT0gbnVsbCB8fCAodGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93LmRvY3VtZW50KTtcclxuICB0YXJnZXRQbGF0Zm9ybSAgJiYgdGFyZ2V0UGxhdGZvcm0gICE9PSBudWxsIHx8ICh0YXJnZXRQbGF0Zm9ybSAgPSBwbGF0Zm9ybSk7XHJcbiAgdGFyZ2V0VXNlckFnZW50ICYmIHRhcmdldFVzZXJBZ2VudCAhPT0gbnVsbCB8fCAodGFyZ2V0VXNlckFnZW50ID0gdXNlckFnZW50KTtcclxuXHJcbiAgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgX3RoaXMucHJlc3NLZXkoZXZlbnQua2V5Q29kZSwgZXZlbnQpO1xyXG4gICAgX3RoaXMuX2hhbmRsZUNvbW1hbmRCdWcoZXZlbnQsIHBsYXRmb3JtKTtcclxuICB9O1xyXG4gIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBfdGhpcy5yZWxlYXNlS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcclxuICB9O1xyXG4gIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBfdGhpcy5yZWxlYXNlQWxsS2V5cyhldmVudClcclxuICB9O1xyXG5cclxuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XHJcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcclxuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xyXG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XHJcblxyXG4gIHRoaXMuX3RhcmdldEVsZW1lbnQgICA9IHRhcmdldEVsZW1lbnQ7XHJcbiAgdGhpcy5fdGFyZ2V0V2luZG93ICAgID0gdGFyZ2V0V2luZG93O1xyXG4gIHRoaXMuX3RhcmdldFBsYXRmb3JtICA9IHRhcmdldFBsYXRmb3JtO1xyXG4gIHRoaXMuX3RhcmdldFVzZXJBZ2VudCA9IHRhcmdldFVzZXJBZ2VudDtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgaWYgKCF0aGlzLl90YXJnZXRFbGVtZW50IHx8ICF0aGlzLl90YXJnZXRXaW5kb3cpIHsgcmV0dXJuOyB9XHJcblxyXG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXlkb3duJywgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcpO1xyXG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcclxuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XHJcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2JsdXInLCAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xyXG5cclxuICB0aGlzLl90YXJnZXRXaW5kb3cgID0gbnVsbDtcclxuICB0aGlzLl90YXJnZXRFbGVtZW50ID0gbnVsbDtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5wcmVzc0tleSA9IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KSB7XHJcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cclxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cclxuXHJcbiAgdGhpcy5fbG9jYWxlLnByZXNzS2V5KGtleUNvZGUpO1xyXG4gIHRoaXMuX2FwcGx5QmluZGluZ3MoZXZlbnQpO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnJlbGVhc2VLZXkgPSBmdW5jdGlvbihrZXlDb2RlLCBldmVudCkge1xyXG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XHJcbiAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XHJcblxyXG4gIHRoaXMuX2xvY2FsZS5yZWxlYXNlS2V5KGtleUNvZGUpO1xyXG4gIHRoaXMuX2NsZWFyQmluZGluZ3MoZXZlbnQpO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnJlbGVhc2VBbGxLZXlzID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxyXG4gIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxyXG5cclxuICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcclxuICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xyXG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XHJcbiAgaWYgKHRoaXMuX2xvY2FsZSkgeyB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7IH1cclxuICB0aGlzLl9wYXVzZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnJlc3VtZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5yZWxlYXNlQWxsS2V5cygpO1xyXG4gIHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPSAwO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLl9iaW5kRXZlbnQgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcclxuICByZXR1cm4gdGhpcy5faXNNb2Rlcm5Ccm93c2VyID9cclxuICAgIHRhcmdldEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XHJcbiAgICB0YXJnZXRFbGVtZW50LmF0dGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLl91bmJpbmRFdmVudCA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xyXG4gIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xyXG4gICAgdGFyZ2V0RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcclxuICAgIHRhcmdldEVsZW1lbnQuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgaGFuZGxlcik7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuX2dldEdyb3VwZWRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgbGlzdGVuZXJHcm91cHMgICA9IFtdO1xyXG4gIHZhciBsaXN0ZW5lckdyb3VwTWFwID0gW107XHJcblxyXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XHJcbiAgaWYgKHRoaXMuX2N1cnJlbnRDb250ZXh0ICE9PSAnZ2xvYmFsJykge1xyXG4gICAgbGlzdGVuZXJzID0gW10uY29uY2F0KGxpc3RlbmVycywgdGhpcy5fY29udGV4dHMuZ2xvYmFsKTtcclxuICB9XHJcblxyXG4gIGxpc3RlbmVycy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgIHJldHVybiAoYi5rZXlDb21ibyA/IGIua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMCkgLSAoYS5rZXlDb21ibyA/IGEua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMCk7XHJcbiAgfSkuZm9yRWFjaChmdW5jdGlvbihsKSB7XHJcbiAgICB2YXIgbWFwSW5kZXggPSAtMTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICBpZiAobGlzdGVuZXJHcm91cE1hcFtpXSA9PT0gbnVsbCAmJiBsLmtleUNvbWJvID09PSBudWxsIHx8XHJcbiAgICAgICAgICBsaXN0ZW5lckdyb3VwTWFwW2ldICE9PSBudWxsICYmIGxpc3RlbmVyR3JvdXBNYXBbaV0uaXNFcXVhbChsLmtleUNvbWJvKSkge1xyXG4gICAgICAgIG1hcEluZGV4ID0gaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKG1hcEluZGV4ID09PSAtMSkge1xyXG4gICAgICBtYXBJbmRleCA9IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoO1xyXG4gICAgICBsaXN0ZW5lckdyb3VwTWFwLnB1c2gobC5rZXlDb21ibyk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSkge1xyXG4gICAgICBsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0gPSBbXTtcclxuICAgIH1cclxuICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XS5wdXNoKGwpO1xyXG4gIH0pO1xyXG4gIHJldHVybiBsaXN0ZW5lckdyb3VwcztcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5fYXBwbHlCaW5kaW5ncyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgdmFyIHByZXZlbnRSZXBlYXQgPSBmYWxzZTtcclxuXHJcbiAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xyXG4gIGV2ZW50LnByZXZlbnRSZXBlYXQgPSBmdW5jdGlvbigpIHsgcHJldmVudFJlcGVhdCA9IHRydWU7IH07XHJcbiAgZXZlbnQucHJlc3NlZEtleXMgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcclxuXHJcbiAgdmFyIHByZXNzZWRLZXlzICAgID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xyXG4gIHZhciBsaXN0ZW5lckdyb3VwcyA9IHRoaXMuX2dldEdyb3VwZWRMaXN0ZW5lcnMoKTtcclxuXHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBsaXN0ZW5lcnMgPSBsaXN0ZW5lckdyb3Vwc1tpXTtcclxuICAgIHZhciBrZXlDb21ibyAgPSBsaXN0ZW5lcnNbMF0ua2V5Q29tYm87XHJcblxyXG4gICAgaWYgKGtleUNvbWJvID09PSBudWxsIHx8IGtleUNvbWJvLmNoZWNrKHByZXNzZWRLZXlzKSkge1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxpc3RlbmVycy5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tqXTtcclxuXHJcbiAgICAgICAgaWYgKGtleUNvbWJvID09PSBudWxsKSB7XHJcbiAgICAgICAgICBsaXN0ZW5lciA9IHtcclxuICAgICAgICAgICAga2V5Q29tYm8gICAgICAgICAgICAgICA6IG5ldyBLZXlDb21ibyhwcmVzc2VkS2V5cy5qb2luKCcrJykpLFxyXG4gICAgICAgICAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgIDogbGlzdGVuZXIucHJlc3NIYW5kbGVyLFxyXG4gICAgICAgICAgICByZWxlYXNlSGFuZGxlciAgICAgICAgIDogbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIsXHJcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgOiBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0LFxyXG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IDogbGlzdGVuZXIucHJldmVudFJlcGVhdEJ5RGVmYXVsdFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsaXN0ZW5lci5wcmVzc0hhbmRsZXIgJiYgIWxpc3RlbmVyLnByZXZlbnRSZXBlYXQpIHtcclxuICAgICAgICAgIGxpc3RlbmVyLnByZXNzSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcclxuICAgICAgICAgIGlmIChwcmV2ZW50UmVwZWF0KSB7XHJcbiAgICAgICAgICAgIGxpc3RlbmVyLnByZXZlbnRSZXBlYXQgPSBwcmV2ZW50UmVwZWF0O1xyXG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobGlzdGVuZXIucmVsZWFzZUhhbmRsZXIgJiYgdGhpcy5fYXBwbGllZExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSA9PT0gLTEpIHtcclxuICAgICAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoa2V5Q29tYm8pIHtcclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleUNvbWJvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XHJcbiAgICAgICAgICB2YXIgaW5kZXggPSBwcmVzc2VkS2V5cy5pbmRleE9mKGtleUNvbWJvLmtleU5hbWVzW2pdKTtcclxuICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgaiAtPSAxO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5fY2xlYXJCaW5kaW5ncyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnNbaV07XHJcbiAgICB2YXIga2V5Q29tYm8gPSBsaXN0ZW5lci5rZXlDb21ibztcclxuICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCB8fCAha2V5Q29tYm8uY2hlY2sodGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzKSkge1xyXG4gICAgICBpZiAodGhpcy5fY2FsbGVySGFuZGxlciAhPT0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIpIHtcclxuICAgICAgICB2YXIgb2xkQ2FsbGVyID0gdGhpcy5fY2FsbGVySGFuZGxlcjtcclxuICAgICAgICB0aGlzLl9jYWxsZXJIYW5kbGVyID0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXI7XHJcbiAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IGxpc3RlbmVyLnByZXZlbnRSZXBlYXRCeURlZmF1bHQ7XHJcbiAgICAgICAgbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XHJcbiAgICAgICAgdGhpcy5fY2FsbGVySGFuZGxlciA9IG9sZENhbGxlcjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLnNwbGljZShpLCAxKTtcclxuICAgICAgaSAtPSAxO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5faGFuZGxlQ29tbWFuZEJ1ZyA9IGZ1bmN0aW9uKGV2ZW50LCBwbGF0Zm9ybSkge1xyXG4gIC8vIE9uIE1hYyB3aGVuIHRoZSBjb21tYW5kIGtleSBpcyBrZXB0IHByZXNzZWQsIGtleXVwIGlzIG5vdCB0cmlnZ2VyZWQgZm9yIGFueSBvdGhlciBrZXkuXHJcbiAgLy8gSW4gdGhpcyBjYXNlIGZvcmNlIGEga2V5dXAgZm9yIG5vbi1tb2RpZmllciBrZXlzIGRpcmVjdGx5IGFmdGVyIHRoZSBrZXlwcmVzcy5cclxuICB2YXIgbW9kaWZpZXJLZXlzID0gW1wic2hpZnRcIiwgXCJjdHJsXCIsIFwiYWx0XCIsIFwiY2Fwc2xvY2tcIiwgXCJ0YWJcIiwgXCJjb21tYW5kXCJdO1xyXG4gIGlmIChwbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSAmJiB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuaW5jbHVkZXMoXCJjb21tYW5kXCIpICYmXHJcbiAgICAgICFtb2RpZmllcktleXMuaW5jbHVkZXModGhpcy5fbG9jYWxlLmdldEtleU5hbWVzKGV2ZW50LmtleUNvZGUpWzBdKSkge1xyXG4gICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKGV2ZW50KTtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEtleWJvYXJkO1xyXG4iXX0=
},{"./key-combo":2,"./locale":4}],4:[function(require,module,exports){

var KeyCombo = require('./key-combo');


function Locale(name) {
  this.localeName     = name;
  this.pressedKeys    = [];
  this._appliedMacros = [];
  this._keyMap        = {};
  this._killKeyCodes  = [];
  this._macros        = [];
}

Locale.prototype.bindKeyCode = function(keyCode, keyNames) {
  if (typeof keyNames === 'string') {
    keyNames = [keyNames];
  }

  this._keyMap[keyCode] = keyNames;
};

Locale.prototype.bindMacro = function(keyComboStr, keyNames) {
  if (typeof keyNames === 'string') {
    keyNames = [ keyNames ];
  }

  var handler = null;
  if (typeof keyNames === 'function') {
    handler = keyNames;
    keyNames = null;
  }

  var macro = {
    keyCombo : new KeyCombo(keyComboStr),
    keyNames : keyNames,
    handler  : handler
  };

  this._macros.push(macro);
};

Locale.prototype.getKeyCodes = function(keyName) {
  var keyCodes = [];
  for (var keyCode in this._keyMap) {
    var index = this._keyMap[keyCode].indexOf(keyName);
    if (index > -1) { keyCodes.push(keyCode|0); }
  }
  return keyCodes;
};

Locale.prototype.getKeyNames = function(keyCode) {
  return this._keyMap[keyCode] || [];
};

Locale.prototype.setKillKey = function(keyCode) {
  if (typeof keyCode === 'string') {
    var keyCodes = this.getKeyCodes(keyCode);
    for (var i = 0; i < keyCodes.length; i += 1) {
      this.setKillKey(keyCodes[i]);
    }
    return;
  }

  this._killKeyCodes.push(keyCode);
};

Locale.prototype.pressKey = function(keyCode) {
  if (typeof keyCode === 'string') {
    var keyCodes = this.getKeyCodes(keyCode);
    for (var i = 0; i < keyCodes.length; i += 1) {
      this.pressKey(keyCodes[i]);
    }
    return;
  }

  var keyNames = this.getKeyNames(keyCode);
  for (var i = 0; i < keyNames.length; i += 1) {
    if (this.pressedKeys.indexOf(keyNames[i]) === -1) {
      this.pressedKeys.push(keyNames[i]);
    }
  }

  this._applyMacros();
};

Locale.prototype.releaseKey = function(keyCode) {
  if (typeof keyCode === 'string') {
    var keyCodes = this.getKeyCodes(keyCode);
    for (var i = 0; i < keyCodes.length; i += 1) {
      this.releaseKey(keyCodes[i]);
    }
  }

  else {
    var keyNames         = this.getKeyNames(keyCode);
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
};

Locale.prototype._applyMacros = function() {
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
};

Locale.prototype._clearMacros = function() {
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
};


module.exports = Locale;

},{"./key-combo":2}],5:[function(require,module,exports){

module.exports = function(locale, platform, userAgent) {

  // general
  locale.bindKeyCode(3,   ['cancel']);
  locale.bindKeyCode(8,   ['backspace']);
  locale.bindKeyCode(9,   ['tab']);
  locale.bindKeyCode(12,  ['clear']);
  locale.bindKeyCode(13,  ['enter']);
  locale.bindKeyCode(16,  ['shift']);
  locale.bindKeyCode(17,  ['ctrl']);
  locale.bindKeyCode(18,  ['alt', 'menu']);
  locale.bindKeyCode(19,  ['pause', 'break']);
  locale.bindKeyCode(20,  ['capslock']);
  locale.bindKeyCode(27,  ['escape', 'esc']);
  locale.bindKeyCode(32,  ['space', 'spacebar']);
  locale.bindKeyCode(33,  ['pageup']);
  locale.bindKeyCode(34,  ['pagedown']);
  locale.bindKeyCode(35,  ['end']);
  locale.bindKeyCode(36,  ['home']);
  locale.bindKeyCode(37,  ['left']);
  locale.bindKeyCode(38,  ['up']);
  locale.bindKeyCode(39,  ['right']);
  locale.bindKeyCode(40,  ['down']);
  locale.bindKeyCode(41,  ['select']);
  locale.bindKeyCode(42,  ['printscreen']);
  locale.bindKeyCode(43,  ['execute']);
  locale.bindKeyCode(44,  ['snapshot']);
  locale.bindKeyCode(45,  ['insert', 'ins']);
  locale.bindKeyCode(46,  ['delete', 'del']);
  locale.bindKeyCode(47,  ['help']);
  locale.bindKeyCode(145, ['scrolllock', 'scroll']);
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
  
  if (platform.match('Mac')) {
    locale.bindMacro('command', ['mod', 'modifier']);
  } else {
    locale.bindMacro('ctrl', ['mod', 'modifier']);
  }

  //a-z and A-Z
  for (var keyCode = 65; keyCode <= 90; keyCode += 1) {
    var keyName = String.fromCharCode(keyCode + 32);
    var capitalKeyName = String.fromCharCode(keyCode);
  	locale.bindKeyCode(keyCode, keyName);
  	locale.bindMacro('shift + ' + keyName, capitalKeyName);
  	locale.bindMacro('capslock + ' + keyName, capitalKeyName);
  }

  // browser caveats
  var semicolonKeyCode = userAgent.match('Firefox') ? 59  : 186;
  var dashKeyCode      = userAgent.match('Firefox') ? 173 : 189;
  var equalKeyCode     = userAgent.match('Firefox') ? 61  : 187;
  var leftCommandKeyCode;
  var rightCommandKeyCode;
  if (platform.match('Mac') && (userAgent.match('Safari') || userAgent.match('Chrome'))) {
    leftCommandKeyCode  = 91;
    rightCommandKeyCode = 93;
  } else if(platform.match('Mac') && userAgent.match('Opera')) {
    leftCommandKeyCode  = 17;
    rightCommandKeyCode = 17;
  } else if(platform.match('Mac') && userAgent.match('Firefox')) {
    leftCommandKeyCode  = 224;
    rightCommandKeyCode = 224;
  }
  locale.bindKeyCode(semicolonKeyCode,    ['semicolon', ';']);
  locale.bindKeyCode(dashKeyCode,         ['dash', '-']);
  locale.bindKeyCode(equalKeyCode,        ['equal', 'equalsign', '=']);
  locale.bindKeyCode(leftCommandKeyCode,  ['command', 'windows', 'win', 'super', 'leftcommand', 'leftwindows', 'leftwin', 'leftsuper']);
  locale.bindKeyCode(rightCommandKeyCode, ['command', 'windows', 'win', 'super', 'rightcommand', 'rightwindows', 'rightwin', 'rightsuper']);

  // kill keys
  locale.setKillKey('command');
};

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsImluZGV4LmpzIiwibGliXFxrZXktY29tYm8uanMiLCJsaWJcXGtleWJvYXJkLmpzIiwibGliXFxsb2NhbGUuanMiLCJsb2NhbGVzXFx1cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXHJcbnZhciBLZXlib2FyZCA9IHJlcXVpcmUoJy4vbGliL2tleWJvYXJkJyk7XHJcbnZhciBMb2NhbGUgICA9IHJlcXVpcmUoJy4vbGliL2xvY2FsZScpO1xyXG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2xpYi9rZXktY29tYm8nKTtcclxuXHJcbnZhciBrZXlib2FyZCA9IG5ldyBLZXlib2FyZCgpO1xyXG5cclxua2V5Ym9hcmQuc2V0TG9jYWxlKCd1cycsIHJlcXVpcmUoJy4vbG9jYWxlcy91cycpKTtcclxuXHJcbmV4cG9ydHMgICAgICAgICAgPSBtb2R1bGUuZXhwb3J0cyA9IGtleWJvYXJkO1xyXG5leHBvcnRzLktleWJvYXJkID0gS2V5Ym9hcmQ7XHJcbmV4cG9ydHMuTG9jYWxlICAgPSBMb2NhbGU7XHJcbmV4cG9ydHMuS2V5Q29tYm8gPSBLZXlDb21ibztcclxuIiwiXHJcbmZ1bmN0aW9uIEtleUNvbWJvKGtleUNvbWJvU3RyKSB7XHJcbiAgdGhpcy5zb3VyY2VTdHIgPSBrZXlDb21ib1N0cjtcclxuICB0aGlzLnN1YkNvbWJvcyA9IEtleUNvbWJvLnBhcnNlQ29tYm9TdHIoa2V5Q29tYm9TdHIpO1xyXG4gIHRoaXMua2V5TmFtZXMgID0gdGhpcy5zdWJDb21ib3MucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIG5leHRTdWJDb21ibykge1xyXG4gICAgcmV0dXJuIG1lbW8uY29uY2F0KG5leHRTdWJDb21ibyk7XHJcbiAgfSwgW10pO1xyXG59XHJcblxyXG4vLyBUT0RPOiBBZGQgc3VwcG9ydCBmb3Iga2V5IGNvbWJvIHNlcXVlbmNlc1xyXG5LZXlDb21iby5zZXF1ZW5jZURlbGltaW5hdG9yID0gJz4+JztcclxuS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvciAgICA9ICc+JztcclxuS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IgICAgICA9ICcrJztcclxuXHJcbktleUNvbWJvLnBhcnNlQ29tYm9TdHIgPSBmdW5jdGlvbihrZXlDb21ib1N0cikge1xyXG4gIHZhciBzdWJDb21ib1N0cnMgPSBLZXlDb21iby5fc3BsaXRTdHIoa2V5Q29tYm9TdHIsIEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IpO1xyXG4gIHZhciBjb21ibyAgICAgICAgPSBbXTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDAgOyBpIDwgc3ViQ29tYm9TdHJzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICBjb21iby5wdXNoKEtleUNvbWJvLl9zcGxpdFN0cihzdWJDb21ib1N0cnNbaV0sIEtleUNvbWJvLmtleURlbGltaW5hdG9yKSk7XHJcbiAgfVxyXG4gIHJldHVybiBjb21ibztcclxufTtcclxuXHJcbktleUNvbWJvLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKHByZXNzZWRLZXlOYW1lcykge1xyXG4gIHZhciBzdGFydGluZ0tleU5hbWVJbmRleCA9IDA7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSB0aGlzLl9jaGVja1N1YkNvbWJvKFxyXG4gICAgICB0aGlzLnN1YkNvbWJvc1tpXSxcclxuICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXgsXHJcbiAgICAgIHByZXNzZWRLZXlOYW1lc1xyXG4gICAgKTtcclxuICAgIGlmIChzdGFydGluZ0tleU5hbWVJbmRleCA9PT0gLTEpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgfVxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuS2V5Q29tYm8ucHJvdG90eXBlLmlzRXF1YWwgPSBmdW5jdGlvbihvdGhlcktleUNvbWJvKSB7XHJcbiAgaWYgKFxyXG4gICAgIW90aGVyS2V5Q29tYm8gfHxcclxuICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnc3RyaW5nJyAmJlxyXG4gICAgdHlwZW9mIG90aGVyS2V5Q29tYm8gIT09ICdvYmplY3QnXHJcbiAgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICBpZiAodHlwZW9mIG90aGVyS2V5Q29tYm8gPT09ICdzdHJpbmcnKSB7XHJcbiAgICBvdGhlcktleUNvbWJvID0gbmV3IEtleUNvbWJvKG90aGVyS2V5Q29tYm8pO1xyXG4gIH1cclxuXHJcbiAgaWYgKHRoaXMuc3ViQ29tYm9zLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3MubGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIGlmICh0aGlzLnN1YkNvbWJvc1tpXS5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViQ29tYm9zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICB2YXIgc3ViQ29tYm8gICAgICA9IHRoaXMuc3ViQ29tYm9zW2ldO1xyXG4gICAgdmFyIG90aGVyU3ViQ29tYm8gPSBvdGhlcktleUNvbWJvLnN1YkNvbWJvc1tpXS5zbGljZSgwKTtcclxuXHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN1YkNvbWJvLmxlbmd0aDsgaiArPSAxKSB7XHJcbiAgICAgIHZhciBrZXlOYW1lID0gc3ViQ29tYm9bal07XHJcbiAgICAgIHZhciBpbmRleCAgID0gb3RoZXJTdWJDb21iby5pbmRleE9mKGtleU5hbWUpO1xyXG5cclxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICBvdGhlclN1YkNvbWJvLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChvdGhlclN1YkNvbWJvLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbktleUNvbWJvLl9zcGxpdFN0ciA9IGZ1bmN0aW9uKHN0ciwgZGVsaW1pbmF0b3IpIHtcclxuICB2YXIgcyAgPSBzdHI7XHJcbiAgdmFyIGQgID0gZGVsaW1pbmF0b3I7XHJcbiAgdmFyIGMgID0gJyc7XHJcbiAgdmFyIGNhID0gW107XHJcblxyXG4gIGZvciAodmFyIGNpID0gMDsgY2kgPCBzLmxlbmd0aDsgY2kgKz0gMSkge1xyXG4gICAgaWYgKGNpID4gMCAmJiBzW2NpXSA9PT0gZCAmJiBzW2NpIC0gMV0gIT09ICdcXFxcJykge1xyXG4gICAgICBjYS5wdXNoKGMudHJpbSgpKTtcclxuICAgICAgYyA9ICcnO1xyXG4gICAgICBjaSArPSAxO1xyXG4gICAgfVxyXG4gICAgYyArPSBzW2NpXTtcclxuICB9XHJcbiAgaWYgKGMpIHsgY2EucHVzaChjLnRyaW0oKSk7IH1cclxuXHJcbiAgcmV0dXJuIGNhO1xyXG59O1xyXG5cclxuS2V5Q29tYm8ucHJvdG90eXBlLl9jaGVja1N1YkNvbWJvID0gZnVuY3Rpb24oc3ViQ29tYm8sIHN0YXJ0aW5nS2V5TmFtZUluZGV4LCBwcmVzc2VkS2V5TmFtZXMpIHtcclxuICBzdWJDb21ibyA9IHN1YkNvbWJvLnNsaWNlKDApO1xyXG4gIHByZXNzZWRLZXlOYW1lcyA9IHByZXNzZWRLZXlOYW1lcy5zbGljZShzdGFydGluZ0tleU5hbWVJbmRleCk7XHJcblxyXG4gIHZhciBlbmRJbmRleCA9IHN0YXJ0aW5nS2V5TmFtZUluZGV4O1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3ViQ29tYm8ubGVuZ3RoOyBpICs9IDEpIHtcclxuXHJcbiAgICB2YXIga2V5TmFtZSA9IHN1YkNvbWJvW2ldO1xyXG4gICAgaWYgKGtleU5hbWVbMF0gPT09ICdcXFxcJykge1xyXG4gICAgICB2YXIgZXNjYXBlZEtleU5hbWUgPSBrZXlOYW1lLnNsaWNlKDEpO1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgfHxcclxuICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3JcclxuICAgICAgKSB7XHJcbiAgICAgICAga2V5TmFtZSA9IGVzY2FwZWRLZXlOYW1lO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGluZGV4ID0gcHJlc3NlZEtleU5hbWVzLmluZGV4T2Yoa2V5TmFtZSk7XHJcbiAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICBzdWJDb21iby5zcGxpY2UoaSwgMSk7XHJcbiAgICAgIGkgLT0gMTtcclxuICAgICAgaWYgKGluZGV4ID4gZW5kSW5kZXgpIHtcclxuICAgICAgICBlbmRJbmRleCA9IGluZGV4O1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzdWJDb21iby5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gZW5kSW5kZXg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIC0xO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gS2V5Q29tYm87XHJcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcblxyXG52YXIgTG9jYWxlID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcclxudmFyIEtleUNvbWJvID0gcmVxdWlyZSgnLi9rZXktY29tYm8nKTtcclxuXHJcblxyXG5mdW5jdGlvbiBLZXlib2FyZCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcclxuICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgICA9IG51bGw7XHJcbiAgdGhpcy5fY3VycmVudENvbnRleHQgICAgICAgPSBudWxsO1xyXG4gIHRoaXMuX2NvbnRleHRzICAgICAgICAgICAgID0ge307XHJcbiAgdGhpcy5fbGlzdGVuZXJzICAgICAgICAgICAgPSBbXTtcclxuICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzICAgICA9IFtdO1xyXG4gIHRoaXMuX2xvY2FsZXMgICAgICAgICAgICAgID0ge307XHJcbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgICAgICAgPSBudWxsO1xyXG4gIHRoaXMuX3RhcmdldFdpbmRvdyAgICAgICAgID0gbnVsbDtcclxuICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgICAgICA9ICcnO1xyXG4gIHRoaXMuX3RhcmdldFVzZXJBZ2VudCAgICAgID0gJyc7XHJcbiAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyICAgICAgPSBmYWxzZTtcclxuICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IG51bGw7XHJcbiAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nICAgPSBudWxsO1xyXG4gIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyAgID0gbnVsbDtcclxuICB0aGlzLl9wYXVzZWQgICAgICAgICAgICAgICA9IGZhbHNlO1xyXG4gIHRoaXMuX2NhbGxlckhhbmRsZXIgICAgICAgID0gbnVsbDtcclxuXHJcbiAgdGhpcy5zZXRDb250ZXh0KCdnbG9iYWwnKTtcclxuICB0aGlzLndhdGNoKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgcGxhdGZvcm0sIHVzZXJBZ2VudCk7XHJcbn1cclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5zZXRMb2NhbGUgPSBmdW5jdGlvbihsb2NhbGVOYW1lLCBsb2NhbGVCdWlsZGVyKSB7XHJcbiAgdmFyIGxvY2FsZSA9IG51bGw7XHJcbiAgaWYgKHR5cGVvZiBsb2NhbGVOYW1lID09PSAnc3RyaW5nJykge1xyXG5cclxuICAgIGlmIChsb2NhbGVCdWlsZGVyKSB7XHJcbiAgICAgIGxvY2FsZSA9IG5ldyBMb2NhbGUobG9jYWxlTmFtZSk7XHJcbiAgICAgIGxvY2FsZUJ1aWxkZXIobG9jYWxlLCB0aGlzLl90YXJnZXRQbGF0Zm9ybSwgdGhpcy5fdGFyZ2V0VXNlckFnZW50KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxvY2FsZSA9IHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gfHwgbnVsbDtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgbG9jYWxlICAgICA9IGxvY2FsZU5hbWU7XHJcbiAgICBsb2NhbGVOYW1lID0gbG9jYWxlLl9sb2NhbGVOYW1lO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5fbG9jYWxlICAgICAgICAgICAgICA9IGxvY2FsZTtcclxuICB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdID0gbG9jYWxlO1xyXG4gIGlmIChsb2NhbGUpIHtcclxuICAgIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cyA9IGxvY2FsZS5wcmVzc2VkS2V5cztcclxuICB9XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuZ2V0TG9jYWxlID0gZnVuY3Rpb24obG9jYWxOYW1lKSB7XHJcbiAgbG9jYWxOYW1lIHx8IChsb2NhbE5hbWUgPSB0aGlzLl9sb2NhbGUubG9jYWxlTmFtZSk7XHJcbiAgcmV0dXJuIHRoaXMuX2xvY2FsZXNbbG9jYWxOYW1lXSB8fCBudWxsO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlciwgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCkge1xyXG4gIGlmIChrZXlDb21ib1N0ciA9PT0gbnVsbCB8fCB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdmdW5jdGlvbicpIHtcclxuICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgPSByZWxlYXNlSGFuZGxlcjtcclxuICAgIHJlbGVhc2VIYW5kbGVyICAgICAgICAgPSBwcmVzc0hhbmRsZXI7XHJcbiAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgID0ga2V5Q29tYm9TdHI7XHJcbiAgICBrZXlDb21ib1N0ciAgICAgICAgICAgID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGlmIChcclxuICAgIGtleUNvbWJvU3RyICYmXHJcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdvYmplY3QnICYmXHJcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIubGVuZ3RoID09PSAnbnVtYmVyJ1xyXG4gICkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb21ib1N0ci5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICB0aGlzLmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5fbGlzdGVuZXJzLnB1c2goe1xyXG4gICAga2V5Q29tYm8gICAgICAgICAgICAgICA6IGtleUNvbWJvU3RyID8gbmV3IEtleUNvbWJvKGtleUNvbWJvU3RyKSA6IG51bGwsXHJcbiAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgIDogcHJlc3NIYW5kbGVyICAgICAgICAgICB8fCBudWxsLFxyXG4gICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA6IHJlbGVhc2VIYW5kbGVyICAgICAgICAgfHwgbnVsbCxcclxuICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgOiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlLFxyXG4gICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA6IHByZXZlbnRSZXBlYXRCeURlZmF1bHQgfHwgZmFsc2VcclxuICB9KTtcclxufTtcclxuS2V5Ym9hcmQucHJvdG90eXBlLmFkZExpc3RlbmVyID0gS2V5Ym9hcmQucHJvdG90eXBlLmJpbmQ7XHJcbktleWJvYXJkLnByb3RvdHlwZS5vbiAgICAgICAgICA9IEtleWJvYXJkLnByb3RvdHlwZS5iaW5kO1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKSB7XHJcbiAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgcmVsZWFzZUhhbmRsZXIgPSBwcmVzc0hhbmRsZXI7XHJcbiAgICBwcmVzc0hhbmRsZXIgICA9IGtleUNvbWJvU3RyO1xyXG4gICAga2V5Q29tYm9TdHIgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgaWYgKFxyXG4gICAga2V5Q29tYm9TdHIgJiZcclxuICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcclxuICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXHJcbiAgKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgIHRoaXMudW5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcclxuICAgIH1cclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lcnNbaV07XHJcblxyXG4gICAgdmFyIGNvbWJvTWF0Y2hlcyAgICAgICAgICA9ICFrZXlDb21ib1N0ciAmJiAhbGlzdGVuZXIua2V5Q29tYm8gfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5rZXlDb21ibyAmJiBsaXN0ZW5lci5rZXlDb21iby5pc0VxdWFsKGtleUNvbWJvU3RyKTtcclxuICAgIHZhciBwcmVzc0hhbmRsZXJNYXRjaGVzICAgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFwcmVzc0hhbmRsZXIgJiYgIWxpc3RlbmVyLnByZXNzSGFuZGxlciB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXNzSGFuZGxlciA9PT0gbGlzdGVuZXIucHJlc3NIYW5kbGVyO1xyXG4gICAgdmFyIHJlbGVhc2VIYW5kbGVyTWF0Y2hlcyA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXJlbGVhc2VIYW5kbGVyICYmICFsaXN0ZW5lci5yZWxlYXNlSGFuZGxlciB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGVhc2VIYW5kbGVyID09PSBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcjtcclxuXHJcbiAgICBpZiAoY29tYm9NYXRjaGVzICYmIHByZXNzSGFuZGxlck1hdGNoZXMgJiYgcmVsZWFzZUhhbmRsZXJNYXRjaGVzKSB7XHJcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgIGkgLT0gMTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcbktleWJvYXJkLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IEtleWJvYXJkLnByb3RvdHlwZS51bmJpbmQ7XHJcbktleWJvYXJkLnByb3RvdHlwZS5vZmYgICAgICAgICAgICA9IEtleWJvYXJkLnByb3RvdHlwZS51bmJpbmQ7XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuc2V0Q29udGV4dCA9IGZ1bmN0aW9uKGNvbnRleHROYW1lKSB7XHJcbiAgaWYodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxyXG5cclxuICBpZiAoIXRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXSkge1xyXG4gICAgdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdID0gW107XHJcbiAgfVxyXG4gIHRoaXMuX2xpc3RlbmVycyAgICAgID0gdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdO1xyXG4gIHRoaXMuX2N1cnJlbnRDb250ZXh0ID0gY29udGV4dE5hbWU7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLl9jdXJyZW50Q29udGV4dDtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS53aXRoQ29udGV4dCA9IGZ1bmN0aW9uKGNvbnRleHROYW1lLCBjYWxsYmFjaykge1xyXG4gIHZhciBwcmV2aW91c0NvbnRleHROYW1lID0gdGhpcy5nZXRDb250ZXh0KCk7XHJcbiAgdGhpcy5zZXRDb250ZXh0KGNvbnRleHROYW1lKTtcclxuXHJcbiAgY2FsbGJhY2soKTtcclxuXHJcbiAgdGhpcy5zZXRDb250ZXh0KHByZXZpb3VzQ29udGV4dE5hbWUpO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24odGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCB0YXJnZXRQbGF0Zm9ybSwgdGFyZ2V0VXNlckFnZW50KSB7XHJcbiAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgdGhpcy5zdG9wKCk7XHJcblxyXG4gIGlmICghdGFyZ2V0V2luZG93KSB7XHJcbiAgICBpZiAoIWdsb2JhbC5hZGRFdmVudExpc3RlbmVyICYmICFnbG9iYWwuYXR0YWNoRXZlbnQpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBnbG9iYWwgZnVuY3Rpb25zIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQuJyk7XHJcbiAgICB9XHJcbiAgICB0YXJnZXRXaW5kb3cgPSBnbG9iYWw7XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIHRhcmdldFdpbmRvdy5ub2RlVHlwZSA9PT0gJ251bWJlcicpIHtcclxuICAgIHRhcmdldFVzZXJBZ2VudCA9IHRhcmdldFBsYXRmb3JtO1xyXG4gICAgdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0RWxlbWVudDtcclxuICAgIHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdztcclxuICAgIHRhcmdldFdpbmRvdyAgICA9IGdsb2JhbDtcclxuICB9XHJcblxyXG4gIGlmICghdGFyZ2V0V2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJiYgIXRhcmdldFdpbmRvdy5hdHRhY2hFdmVudCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50IG1ldGhvZHMgb24gdGFyZ2V0V2luZG93LicpO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyID0gISF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcclxuXHJcbiAgdmFyIHVzZXJBZ2VudCA9IHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IgJiYgdGFyZ2V0V2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQgfHwgJyc7XHJcbiAgdmFyIHBsYXRmb3JtICA9IHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IgJiYgdGFyZ2V0V2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSAgfHwgJyc7XHJcblxyXG4gIHRhcmdldEVsZW1lbnQgICAmJiB0YXJnZXRFbGVtZW50ICAgIT09IG51bGwgfHwgKHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdy5kb2N1bWVudCk7XHJcbiAgdGFyZ2V0UGxhdGZvcm0gICYmIHRhcmdldFBsYXRmb3JtICAhPT0gbnVsbCB8fCAodGFyZ2V0UGxhdGZvcm0gID0gcGxhdGZvcm0pO1xyXG4gIHRhcmdldFVzZXJBZ2VudCAmJiB0YXJnZXRVc2VyQWdlbnQgIT09IG51bGwgfHwgKHRhcmdldFVzZXJBZ2VudCA9IHVzZXJBZ2VudCk7XHJcblxyXG4gIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIF90aGlzLnByZXNzS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcclxuICAgIF90aGlzLl9oYW5kbGVDb21tYW5kQnVnKGV2ZW50LCBwbGF0Zm9ybSk7XHJcbiAgfTtcclxuICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgX3RoaXMucmVsZWFzZUtleShldmVudC5rZXlDb2RlLCBldmVudCk7XHJcbiAgfTtcclxuICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgX3RoaXMucmVsZWFzZUFsbEtleXMoZXZlbnQpXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsICdrZXlkb3duJywgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcpO1xyXG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5dXAnLCAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyk7XHJcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldFdpbmRvdywgICdmb2N1cycsICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcclxuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0V2luZG93LCAgJ2JsdXInLCAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xyXG5cclxuICB0aGlzLl90YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRFbGVtZW50O1xyXG4gIHRoaXMuX3RhcmdldFdpbmRvdyAgICA9IHRhcmdldFdpbmRvdztcclxuICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRQbGF0Zm9ybTtcclxuICB0aGlzLl90YXJnZXRVc2VyQWdlbnQgPSB0YXJnZXRVc2VyQWdlbnQ7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gIGlmICghdGhpcy5fdGFyZ2V0RWxlbWVudCB8fCAhdGhpcy5fdGFyZ2V0V2luZG93KSB7IHJldHVybjsgfVxyXG5cclxuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcclxuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5dXAnLCAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyk7XHJcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xyXG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcclxuXHJcbiAgdGhpcy5fdGFyZ2V0V2luZG93ICA9IG51bGw7XHJcbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCA9IG51bGw7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUucHJlc3NLZXkgPSBmdW5jdGlvbihrZXlDb2RlLCBldmVudCkge1xyXG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XHJcbiAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XHJcblxyXG4gIHRoaXMuX2xvY2FsZS5wcmVzc0tleShrZXlDb2RlKTtcclxuICB0aGlzLl9hcHBseUJpbmRpbmdzKGV2ZW50KTtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5yZWxlYXNlS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSwgZXZlbnQpIHtcclxuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxyXG4gIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxyXG5cclxuICB0aGlzLl9sb2NhbGUucmVsZWFzZUtleShrZXlDb2RlKTtcclxuICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5yZWxlYXNlQWxsS2V5cyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cclxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cclxuXHJcbiAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLmxlbmd0aCA9IDA7XHJcbiAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcclxuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxyXG4gIGlmICh0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XHJcbiAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMucmVsZWFzZUFsbEtleXMoKTtcclxuICB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID0gMDtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5fYmluZEV2ZW50ID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XHJcbiAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XHJcbiAgICB0YXJnZXRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxyXG4gICAgdGFyZ2V0RWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5fdW5iaW5kRXZlbnQgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcclxuICByZXR1cm4gdGhpcy5faXNNb2Rlcm5Ccm93c2VyID9cclxuICAgIHRhcmdldEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XHJcbiAgICB0YXJnZXRFbGVtZW50LmRldGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLl9nZXRHcm91cGVkTGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGxpc3RlbmVyR3JvdXBzICAgPSBbXTtcclxuICB2YXIgbGlzdGVuZXJHcm91cE1hcCA9IFtdO1xyXG5cclxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xyXG4gIGlmICh0aGlzLl9jdXJyZW50Q29udGV4dCAhPT0gJ2dsb2JhbCcpIHtcclxuICAgIGxpc3RlbmVycyA9IFtdLmNvbmNhdChsaXN0ZW5lcnMsIHRoaXMuX2NvbnRleHRzLmdsb2JhbCk7XHJcbiAgfVxyXG5cclxuICBsaXN0ZW5lcnMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICByZXR1cm4gKGIua2V5Q29tYm8gPyBiLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApIC0gKGEua2V5Q29tYm8gPyBhLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA6IDApO1xyXG4gIH0pLmZvckVhY2goZnVuY3Rpb24obCkge1xyXG4gICAgdmFyIG1hcEluZGV4ID0gLTE7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgaWYgKGxpc3RlbmVyR3JvdXBNYXBbaV0gPT09IG51bGwgJiYgbC5rZXlDb21ibyA9PT0gbnVsbCB8fFxyXG4gICAgICAgICAgbGlzdGVuZXJHcm91cE1hcFtpXSAhPT0gbnVsbCAmJiBsaXN0ZW5lckdyb3VwTWFwW2ldLmlzRXF1YWwobC5rZXlDb21ibykpIHtcclxuICAgICAgICBtYXBJbmRleCA9IGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChtYXBJbmRleCA9PT0gLTEpIHtcclxuICAgICAgbWFwSW5kZXggPSBsaXN0ZW5lckdyb3VwTWFwLmxlbmd0aDtcclxuICAgICAgbGlzdGVuZXJHcm91cE1hcC5wdXNoKGwua2V5Q29tYm8pO1xyXG4gICAgfVxyXG4gICAgaWYgKCFsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0pIHtcclxuICAgICAgbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdID0gW107XHJcbiAgICB9XHJcbiAgICBsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0ucHVzaChsKTtcclxuICB9KTtcclxuICByZXR1cm4gbGlzdGVuZXJHcm91cHM7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuX2FwcGx5QmluZGluZ3MgPSBmdW5jdGlvbihldmVudCkge1xyXG4gIHZhciBwcmV2ZW50UmVwZWF0ID0gZmFsc2U7XHJcblxyXG4gIGV2ZW50IHx8IChldmVudCA9IHt9KTtcclxuICBldmVudC5wcmV2ZW50UmVwZWF0ID0gZnVuY3Rpb24oKSB7IHByZXZlbnRSZXBlYXQgPSB0cnVlOyB9O1xyXG4gIGV2ZW50LnByZXNzZWRLZXlzICAgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XHJcblxyXG4gIHZhciBwcmVzc2VkS2V5cyAgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcclxuICB2YXIgbGlzdGVuZXJHcm91cHMgPSB0aGlzLl9nZXRHcm91cGVkTGlzdGVuZXJzKCk7XHJcblxyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVyR3JvdXBzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICB2YXIgbGlzdGVuZXJzID0gbGlzdGVuZXJHcm91cHNbaV07XHJcbiAgICB2YXIga2V5Q29tYm8gID0gbGlzdGVuZXJzWzBdLmtleUNvbWJvO1xyXG5cclxuICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCB8fCBrZXlDb21iby5jaGVjayhwcmVzc2VkS2V5cykpIHtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBsaXN0ZW5lcnMubGVuZ3RoOyBqICs9IDEpIHtcclxuICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbal07XHJcblxyXG4gICAgICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgbGlzdGVuZXIgPSB7XHJcbiAgICAgICAgICAgIGtleUNvbWJvICAgICAgICAgICAgICAgOiBuZXcgS2V5Q29tYm8ocHJlc3NlZEtleXMuam9pbignKycpKSxcclxuICAgICAgICAgICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA6IGxpc3RlbmVyLnByZXNzSGFuZGxlcixcclxuICAgICAgICAgICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA6IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyLFxyXG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgIDogbGlzdGVuZXIucHJldmVudFJlcGVhdCxcclxuICAgICAgICAgICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA6IGxpc3RlbmVyLnByZXZlbnRSZXBlYXRCeURlZmF1bHRcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobGlzdGVuZXIucHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmV2ZW50UmVwZWF0KSB7XHJcbiAgICAgICAgICBsaXN0ZW5lci5wcmVzc0hhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XHJcbiAgICAgICAgICBpZiAocHJldmVudFJlcGVhdCkge1xyXG4gICAgICAgICAgICBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0ID0gcHJldmVudFJlcGVhdDtcclxuICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyICYmIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcikgPT09IC0xKSB7XHJcbiAgICAgICAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGtleUNvbWJvKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBrZXlDb21iby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICAgICAgdmFyIGluZGV4ID0gcHJlc3NlZEtleXMuaW5kZXhPZihrZXlDb21iby5rZXlOYW1lc1tqXSk7XHJcbiAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIGogLT0gMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuX2NsZWFyQmluZGluZ3MgPSBmdW5jdGlvbihldmVudCkge1xyXG4gIGV2ZW50IHx8IChldmVudCA9IHt9KTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzW2ldO1xyXG4gICAgdmFyIGtleUNvbWJvID0gbGlzdGVuZXIua2V5Q29tYm87XHJcbiAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwgIWtleUNvbWJvLmNoZWNrKHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cykpIHtcclxuICAgICAgaWYgKHRoaXMuX2NhbGxlckhhbmRsZXIgIT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIG9sZENhbGxlciA9IHRoaXMuX2NhbGxlckhhbmRsZXI7XHJcbiAgICAgICAgdGhpcy5fY2FsbGVySGFuZGxlciA9IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyO1xyXG4gICAgICAgIGxpc3RlbmVyLnByZXZlbnRSZXBlYXQgPSBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0QnlEZWZhdWx0O1xyXG4gICAgICAgIGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xyXG4gICAgICAgIHRoaXMuX2NhbGxlckhhbmRsZXIgPSBvbGRDYWxsZXI7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgIGkgLT0gMTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuX2hhbmRsZUNvbW1hbmRCdWcgPSBmdW5jdGlvbihldmVudCwgcGxhdGZvcm0pIHtcclxuICAvLyBPbiBNYWMgd2hlbiB0aGUgY29tbWFuZCBrZXkgaXMga2VwdCBwcmVzc2VkLCBrZXl1cCBpcyBub3QgdHJpZ2dlcmVkIGZvciBhbnkgb3RoZXIga2V5LlxyXG4gIC8vIEluIHRoaXMgY2FzZSBmb3JjZSBhIGtleXVwIGZvciBub24tbW9kaWZpZXIga2V5cyBkaXJlY3RseSBhZnRlciB0aGUga2V5cHJlc3MuXHJcbiAgdmFyIG1vZGlmaWVyS2V5cyA9IFtcInNoaWZ0XCIsIFwiY3RybFwiLCBcImFsdFwiLCBcImNhcHNsb2NrXCIsIFwidGFiXCIsIFwiY29tbWFuZFwiXTtcclxuICBpZiAocGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgJiYgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLmluY2x1ZGVzKFwiY29tbWFuZFwiKSAmJlxyXG4gICAgICAhbW9kaWZpZXJLZXlzLmluY2x1ZGVzKHRoaXMuX2xvY2FsZS5nZXRLZXlOYW1lcyhldmVudC5rZXlDb2RlKVswXSkpIHtcclxuICAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyhldmVudCk7XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBLZXlib2FyZDtcclxuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklteHBZaTlyWlhsaWIyRnlaQzVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBGQlFVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRU0lzSW1acGJHVWlPaUpuWlc1bGNtRjBaV1F1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaVhISmNiblpoY2lCTWIyTmhiR1VnUFNCeVpYRjFhWEpsS0NjdUwyeHZZMkZzWlNjcE8xeHlYRzUyWVhJZ1MyVjVRMjl0WW04Z1BTQnlaWEYxYVhKbEtDY3VMMnRsZVMxamIyMWlieWNwTzF4eVhHNWNjbHh1WEhKY2JtWjFibU4wYVc5dUlFdGxlV0p2WVhKa0tIUmhjbWRsZEZkcGJtUnZkeXdnZEdGeVoyVjBSV3hsYldWdWRDd2djR3hoZEdadmNtMHNJSFZ6WlhKQloyVnVkQ2tnZTF4eVhHNGdJSFJvYVhNdVgyeHZZMkZzWlNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRDBnYm5Wc2JEdGNjbHh1SUNCMGFHbHpMbDlqZFhKeVpXNTBRMjl1ZEdWNGRDQWdJQ0FnSUNBOUlHNTFiR3c3WEhKY2JpQWdkR2hwY3k1ZlkyOXVkR1Y0ZEhNZ0lDQWdJQ0FnSUNBZ0lDQWdQU0I3ZlR0Y2NseHVJQ0IwYUdsekxsOXNhWE4wWlc1bGNuTWdJQ0FnSUNBZ0lDQWdJQ0E5SUZ0ZE8xeHlYRzRnSUhSb2FYTXVYMkZ3Y0d4cFpXUk1hWE4wWlc1bGNuTWdJQ0FnSUQwZ1cxMDdYSEpjYmlBZ2RHaHBjeTVmYkc5allXeGxjeUFnSUNBZ0lDQWdJQ0FnSUNBZ1BTQjdmVHRjY2x4dUlDQjBhR2x6TGw5MFlYSm5aWFJGYkdWdFpXNTBJQ0FnSUNBZ0lDQTlJRzUxYkd3N1hISmNiaUFnZEdocGN5NWZkR0Z5WjJWMFYybHVaRzkzSUNBZ0lDQWdJQ0FnUFNCdWRXeHNPMXh5WEc0Z0lIUm9hWE11WDNSaGNtZGxkRkJzWVhSbWIzSnRJQ0FnSUNBZ0lEMGdKeWM3WEhKY2JpQWdkR2hwY3k1ZmRHRnlaMlYwVlhObGNrRm5aVzUwSUNBZ0lDQWdQU0FuSnp0Y2NseHVJQ0IwYUdsekxsOXBjMDF2WkdWeWJrSnliM2R6WlhJZ0lDQWdJQ0E5SUdaaGJITmxPMXh5WEc0Z0lIUm9hWE11WDNSaGNtZGxkRXRsZVVSdmQyNUNhVzVrYVc1bklEMGdiblZzYkR0Y2NseHVJQ0IwYUdsekxsOTBZWEpuWlhSTFpYbFZjRUpwYm1ScGJtY2dJQ0E5SUc1MWJHdzdYSEpjYmlBZ2RHaHBjeTVmZEdGeVoyVjBVbVZ6WlhSQ2FXNWthVzVuSUNBZ1BTQnVkV3hzTzF4eVhHNGdJSFJvYVhNdVgzQmhkWE5sWkNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRDBnWm1Gc2MyVTdYSEpjYmlBZ2RHaHBjeTVmWTJGc2JHVnlTR0Z1Wkd4bGNpQWdJQ0FnSUNBZ1BTQnVkV3hzTzF4eVhHNWNjbHh1SUNCMGFHbHpMbk5sZEVOdmJuUmxlSFFvSjJkc2IySmhiQ2NwTzF4eVhHNGdJSFJvYVhNdWQyRjBZMmdvZEdGeVoyVjBWMmx1Wkc5M0xDQjBZWEpuWlhSRmJHVnRaVzUwTENCd2JHRjBabTl5YlN3Z2RYTmxja0ZuWlc1MEtUdGNjbHh1ZlZ4eVhHNWNjbHh1UzJWNVltOWhjbVF1Y0hKdmRHOTBlWEJsTG5ObGRFeHZZMkZzWlNBOUlHWjFibU4wYVc5dUtHeHZZMkZzWlU1aGJXVXNJR3h2WTJGc1pVSjFhV3hrWlhJcElIdGNjbHh1SUNCMllYSWdiRzlqWVd4bElEMGdiblZzYkR0Y2NseHVJQ0JwWmlBb2RIbHdaVzltSUd4dlkyRnNaVTVoYldVZ1BUMDlJQ2R6ZEhKcGJtY25LU0I3WEhKY2JseHlYRzRnSUNBZ2FXWWdLR3h2WTJGc1pVSjFhV3hrWlhJcElIdGNjbHh1SUNBZ0lDQWdiRzlqWVd4bElEMGdibVYzSUV4dlkyRnNaU2hzYjJOaGJHVk9ZVzFsS1R0Y2NseHVJQ0FnSUNBZ2JHOWpZV3hsUW5WcGJHUmxjaWhzYjJOaGJHVXNJSFJvYVhNdVgzUmhjbWRsZEZCc1lYUm1iM0p0TENCMGFHbHpMbDkwWVhKblpYUlZjMlZ5UVdkbGJuUXBPMXh5WEc0Z0lDQWdmU0JsYkhObElIdGNjbHh1SUNBZ0lDQWdiRzlqWVd4bElEMGdkR2hwY3k1ZmJHOWpZV3hsYzF0c2IyTmhiR1ZPWVcxbFhTQjhmQ0J1ZFd4c08xeHlYRzRnSUNBZ2ZWeHlYRzRnSUgwZ1pXeHpaU0I3WEhKY2JpQWdJQ0JzYjJOaGJHVWdJQ0FnSUQwZ2JHOWpZV3hsVG1GdFpUdGNjbHh1SUNBZ0lHeHZZMkZzWlU1aGJXVWdQU0JzYjJOaGJHVXVYMnh2WTJGc1pVNWhiV1U3WEhKY2JpQWdmVnh5WEc1Y2NseHVJQ0IwYUdsekxsOXNiMk5oYkdVZ0lDQWdJQ0FnSUNBZ0lDQWdJRDBnYkc5allXeGxPMXh5WEc0Z0lIUm9hWE11WDJ4dlkyRnNaWE5iYkc5allXeGxUbUZ0WlYwZ1BTQnNiMk5oYkdVN1hISmNiaUFnYVdZZ0tHeHZZMkZzWlNrZ2UxeHlYRzRnSUNBZ2RHaHBjeTVmYkc5allXeGxMbkJ5WlhOelpXUkxaWGx6SUQwZ2JHOWpZV3hsTG5CeVpYTnpaV1JMWlhsek8xeHlYRzRnSUgxY2NseHVmVHRjY2x4dVhISmNia3RsZVdKdllYSmtMbkJ5YjNSdmRIbHdaUzVuWlhSTWIyTmhiR1VnUFNCbWRXNWpkR2x2Ymloc2IyTmhiRTVoYldVcElIdGNjbHh1SUNCc2IyTmhiRTVoYldVZ2ZId2dLR3h2WTJGc1RtRnRaU0E5SUhSb2FYTXVYMnh2WTJGc1pTNXNiMk5oYkdWT1lXMWxLVHRjY2x4dUlDQnlaWFIxY200Z2RHaHBjeTVmYkc5allXeGxjMXRzYjJOaGJFNWhiV1ZkSUh4OElHNTFiR3c3WEhKY2JuMDdYSEpjYmx4eVhHNUxaWGxpYjJGeVpDNXdjbTkwYjNSNWNHVXVZbWx1WkNBOUlHWjFibU4wYVc5dUtHdGxlVU52YldKdlUzUnlMQ0J3Y21WemMwaGhibVJzWlhJc0lISmxiR1ZoYzJWSVlXNWtiR1Z5TENCd2NtVjJaVzUwVW1Wd1pXRjBRbmxFWldaaGRXeDBLU0I3WEhKY2JpQWdhV1lnS0d0bGVVTnZiV0p2VTNSeUlEMDlQU0J1ZFd4c0lIeDhJSFI1Y0dWdlppQnJaWGxEYjIxaWIxTjBjaUE5UFQwZ0oyWjFibU4wYVc5dUp5a2dlMXh5WEc0Z0lDQWdjSEpsZG1WdWRGSmxjR1ZoZEVKNVJHVm1ZWFZzZENBOUlISmxiR1ZoYzJWSVlXNWtiR1Z5TzF4eVhHNGdJQ0FnY21Wc1pXRnpaVWhoYm1Sc1pYSWdJQ0FnSUNBZ0lDQTlJSEJ5WlhOelNHRnVaR3hsY2p0Y2NseHVJQ0FnSUhCeVpYTnpTR0Z1Wkd4bGNpQWdJQ0FnSUNBZ0lDQWdQU0JyWlhsRGIyMWliMU4wY2p0Y2NseHVJQ0FnSUd0bGVVTnZiV0p2VTNSeUlDQWdJQ0FnSUNBZ0lDQWdQU0J1ZFd4c08xeHlYRzRnSUgxY2NseHVYSEpjYmlBZ2FXWWdLRnh5WEc0Z0lDQWdhMlY1UTI5dFltOVRkSElnSmlaY2NseHVJQ0FnSUhSNWNHVnZaaUJyWlhsRGIyMWliMU4wY2lBOVBUMGdKMjlpYW1WamRDY2dKaVpjY2x4dUlDQWdJSFI1Y0dWdlppQnJaWGxEYjIxaWIxTjBjaTVzWlc1bmRHZ2dQVDA5SUNkdWRXMWlaWEluWEhKY2JpQWdLU0I3WEhKY2JpQWdJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Ec2dhU0E4SUd0bGVVTnZiV0p2VTNSeUxteGxibWQwYURzZ2FTQXJQU0F4S1NCN1hISmNiaUFnSUNBZ0lIUm9hWE11WW1sdVpDaHJaWGxEYjIxaWIxTjBjbHRwWFN3Z2NISmxjM05JWVc1a2JHVnlMQ0J5Wld4bFlYTmxTR0Z1Wkd4bGNpazdYSEpjYmlBZ0lDQjlYSEpjYmlBZ0lDQnlaWFIxY200N1hISmNiaUFnZlZ4eVhHNWNjbHh1SUNCMGFHbHpMbDlzYVhOMFpXNWxjbk11Y0hWemFDaDdYSEpjYmlBZ0lDQnJaWGxEYjIxaWJ5QWdJQ0FnSUNBZ0lDQWdJQ0FnSURvZ2EyVjVRMjl0WW05VGRISWdQeUJ1WlhjZ1MyVjVRMjl0WW04b2EyVjVRMjl0WW05VGRISXBJRG9nYm5Wc2JDeGNjbHh1SUNBZ0lIQnlaWE56U0dGdVpHeGxjaUFnSUNBZ0lDQWdJQ0FnT2lCd2NtVnpjMGhoYm1Sc1pYSWdJQ0FnSUNBZ0lDQWdJSHg4SUc1MWJHd3NYSEpjYmlBZ0lDQnlaV3hsWVhObFNHRnVaR3hsY2lBZ0lDQWdJQ0FnSURvZ2NtVnNaV0Z6WlVoaGJtUnNaWElnSUNBZ0lDQWdJQ0I4ZkNCdWRXeHNMRnh5WEc0Z0lDQWdjSEpsZG1WdWRGSmxjR1ZoZENBZ0lDQWdJQ0FnSUNBNklIQnlaWFpsYm5SU1pYQmxZWFJDZVVSbFptRjFiSFFnZkh3Z1ptRnNjMlVzWEhKY2JpQWdJQ0J3Y21WMlpXNTBVbVZ3WldGMFFubEVaV1poZFd4MElEb2djSEpsZG1WdWRGSmxjR1ZoZEVKNVJHVm1ZWFZzZENCOGZDQm1ZV3h6WlZ4eVhHNGdJSDBwTzF4eVhHNTlPMXh5WEc1TFpYbGliMkZ5WkM1d2NtOTBiM1I1Y0dVdVlXUmtUR2x6ZEdWdVpYSWdQU0JMWlhsaWIyRnlaQzV3Y205MGIzUjVjR1V1WW1sdVpEdGNjbHh1UzJWNVltOWhjbVF1Y0hKdmRHOTBlWEJsTG05dUlDQWdJQ0FnSUNBZ0lEMGdTMlY1WW05aGNtUXVjSEp2ZEc5MGVYQmxMbUpwYm1RN1hISmNibHh5WEc1TFpYbGliMkZ5WkM1d2NtOTBiM1I1Y0dVdWRXNWlhVzVrSUQwZ1puVnVZM1JwYjI0b2EyVjVRMjl0WW05VGRISXNJSEJ5WlhOelNHRnVaR3hsY2l3Z2NtVnNaV0Z6WlVoaGJtUnNaWElwSUh0Y2NseHVJQ0JwWmlBb2EyVjVRMjl0WW05VGRISWdQVDA5SUc1MWJHd2dmSHdnZEhsd1pXOW1JR3RsZVVOdmJXSnZVM1J5SUQwOVBTQW5ablZ1WTNScGIyNG5LU0I3WEhKY2JpQWdJQ0J5Wld4bFlYTmxTR0Z1Wkd4bGNpQTlJSEJ5WlhOelNHRnVaR3hsY2p0Y2NseHVJQ0FnSUhCeVpYTnpTR0Z1Wkd4bGNpQWdJRDBnYTJWNVEyOXRZbTlUZEhJN1hISmNiaUFnSUNCclpYbERiMjFpYjFOMGNpQTlJRzUxYkd3N1hISmNiaUFnZlZ4eVhHNWNjbHh1SUNCcFppQW9YSEpjYmlBZ0lDQnJaWGxEYjIxaWIxTjBjaUFtSmx4eVhHNGdJQ0FnZEhsd1pXOW1JR3RsZVVOdmJXSnZVM1J5SUQwOVBTQW5iMkpxWldOMEp5QW1KbHh5WEc0Z0lDQWdkSGx3Wlc5bUlHdGxlVU52YldKdlUzUnlMbXhsYm1kMGFDQTlQVDBnSjI1MWJXSmxjaWRjY2x4dUlDQXBJSHRjY2x4dUlDQWdJR1p2Y2lBb2RtRnlJR2tnUFNBd095QnBJRHdnYTJWNVEyOXRZbTlUZEhJdWJHVnVaM1JvT3lCcElDczlJREVwSUh0Y2NseHVJQ0FnSUNBZ2RHaHBjeTUxYm1KcGJtUW9hMlY1UTI5dFltOVRkSEpiYVYwc0lIQnlaWE56U0dGdVpHeGxjaXdnY21Wc1pXRnpaVWhoYm1Sc1pYSXBPMXh5WEc0Z0lDQWdmVnh5WEc0Z0lDQWdjbVYwZFhKdU8xeHlYRzRnSUgxY2NseHVYSEpjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQjBhR2x6TGw5c2FYTjBaVzVsY25NdWJHVnVaM1JvT3lCcElDczlJREVwSUh0Y2NseHVJQ0FnSUhaaGNpQnNhWE4wWlc1bGNpQTlJSFJvYVhNdVgyeHBjM1JsYm1WeWMxdHBYVHRjY2x4dVhISmNiaUFnSUNCMllYSWdZMjl0WW05TllYUmphR1Z6SUNBZ0lDQWdJQ0FnSUQwZ0lXdGxlVU52YldKdlUzUnlJQ1ltSUNGc2FYTjBaVzVsY2k1clpYbERiMjFpYnlCOGZGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHeHBjM1JsYm1WeUxtdGxlVU52YldKdklDWW1JR3hwYzNSbGJtVnlMbXRsZVVOdmJXSnZMbWx6UlhGMVlXd29hMlY1UTI5dFltOVRkSElwTzF4eVhHNGdJQ0FnZG1GeUlIQnlaWE56U0dGdVpHeGxjazFoZEdOb1pYTWdJQ0E5SUNGd2NtVnpjMGhoYm1Sc1pYSWdKaVlnSVhKbGJHVmhjMlZJWVc1a2JHVnlJSHg4WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSVhCeVpYTnpTR0Z1Wkd4bGNpQW1KaUFoYkdsemRHVnVaWEl1Y0hKbGMzTklZVzVrYkdWeUlIeDhYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjSEpsYzNOSVlXNWtiR1Z5SUQwOVBTQnNhWE4wWlc1bGNpNXdjbVZ6YzBoaGJtUnNaWEk3WEhKY2JpQWdJQ0IyWVhJZ2NtVnNaV0Z6WlVoaGJtUnNaWEpOWVhSamFHVnpJRDBnSVhCeVpYTnpTR0Z1Wkd4bGNpQW1KaUFoY21Wc1pXRnpaVWhoYm1Sc1pYSWdmSHhjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FoY21Wc1pXRnpaVWhoYm1Sc1pYSWdKaVlnSVd4cGMzUmxibVZ5TG5KbGJHVmhjMlZJWVc1a2JHVnlJSHg4WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21Wc1pXRnpaVWhoYm1Sc1pYSWdQVDA5SUd4cGMzUmxibVZ5TG5KbGJHVmhjMlZJWVc1a2JHVnlPMXh5WEc1Y2NseHVJQ0FnSUdsbUlDaGpiMjFpYjAxaGRHTm9aWE1nSmlZZ2NISmxjM05JWVc1a2JHVnlUV0YwWTJobGN5QW1KaUJ5Wld4bFlYTmxTR0Z1Wkd4bGNrMWhkR05vWlhNcElIdGNjbHh1SUNBZ0lDQWdkR2hwY3k1ZmJHbHpkR1Z1WlhKekxuTndiR2xqWlNocExDQXhLVHRjY2x4dUlDQWdJQ0FnYVNBdFBTQXhPMXh5WEc0Z0lDQWdmVnh5WEc0Z0lIMWNjbHh1ZlR0Y2NseHVTMlY1WW05aGNtUXVjSEp2ZEc5MGVYQmxMbkpsYlc5MlpVeHBjM1JsYm1WeUlEMGdTMlY1WW05aGNtUXVjSEp2ZEc5MGVYQmxMblZ1WW1sdVpEdGNjbHh1UzJWNVltOWhjbVF1Y0hKdmRHOTBlWEJsTG05bVppQWdJQ0FnSUNBZ0lDQWdJRDBnUzJWNVltOWhjbVF1Y0hKdmRHOTBlWEJsTG5WdVltbHVaRHRjY2x4dVhISmNia3RsZVdKdllYSmtMbkJ5YjNSdmRIbHdaUzV6WlhSRGIyNTBaWGgwSUQwZ1puVnVZM1JwYjI0b1kyOXVkR1Y0ZEU1aGJXVXBJSHRjY2x4dUlDQnBaaWgwYUdsekxsOXNiMk5oYkdVcElIc2dkR2hwY3k1eVpXeGxZWE5sUVd4c1MyVjVjeWdwT3lCOVhISmNibHh5WEc0Z0lHbG1JQ2doZEdocGN5NWZZMjl1ZEdWNGRITmJZMjl1ZEdWNGRFNWhiV1ZkS1NCN1hISmNiaUFnSUNCMGFHbHpMbDlqYjI1MFpYaDBjMXRqYjI1MFpYaDBUbUZ0WlYwZ1BTQmJYVHRjY2x4dUlDQjlYSEpjYmlBZ2RHaHBjeTVmYkdsemRHVnVaWEp6SUNBZ0lDQWdQU0IwYUdsekxsOWpiMjUwWlhoMGMxdGpiMjUwWlhoMFRtRnRaVjA3WEhKY2JpQWdkR2hwY3k1ZlkzVnljbVZ1ZEVOdmJuUmxlSFFnUFNCamIyNTBaWGgwVG1GdFpUdGNjbHh1ZlR0Y2NseHVYSEpjYmt0bGVXSnZZWEprTG5CeWIzUnZkSGx3WlM1blpYUkRiMjUwWlhoMElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdjbVYwZFhKdUlIUm9hWE11WDJOMWNuSmxiblJEYjI1MFpYaDBPMXh5WEc1OU8xeHlYRzVjY2x4dVMyVjVZbTloY21RdWNISnZkRzkwZVhCbExuZHBkR2hEYjI1MFpYaDBJRDBnWm5WdVkzUnBiMjRvWTI5dWRHVjRkRTVoYldVc0lHTmhiR3hpWVdOcktTQjdYSEpjYmlBZ2RtRnlJSEJ5WlhacGIzVnpRMjl1ZEdWNGRFNWhiV1VnUFNCMGFHbHpMbWRsZEVOdmJuUmxlSFFvS1R0Y2NseHVJQ0IwYUdsekxuTmxkRU52Ym5SbGVIUW9ZMjl1ZEdWNGRFNWhiV1VwTzF4eVhHNWNjbHh1SUNCallXeHNZbUZqYXlncE8xeHlYRzVjY2x4dUlDQjBhR2x6TG5ObGRFTnZiblJsZUhRb2NISmxkbWx2ZFhORGIyNTBaWGgwVG1GdFpTazdYSEpjYm4wN1hISmNibHh5WEc1TFpYbGliMkZ5WkM1d2NtOTBiM1I1Y0dVdWQyRjBZMmdnUFNCbWRXNWpkR2x2YmloMFlYSm5aWFJYYVc1a2IzY3NJSFJoY21kbGRFVnNaVzFsYm5Rc0lIUmhjbWRsZEZCc1lYUm1iM0p0TENCMFlYSm5aWFJWYzJWeVFXZGxiblFwSUh0Y2NseHVJQ0IyWVhJZ1gzUm9hWE1nUFNCMGFHbHpPMXh5WEc1Y2NseHVJQ0IwYUdsekxuTjBiM0FvS1R0Y2NseHVYSEpjYmlBZ2FXWWdLQ0YwWVhKblpYUlhhVzVrYjNjcElIdGNjbHh1SUNBZ0lHbG1JQ2doWjJ4dlltRnNMbUZrWkVWMlpXNTBUR2x6ZEdWdVpYSWdKaVlnSVdkc2IySmhiQzVoZEhSaFkyaEZkbVZ1ZENrZ2UxeHlYRzRnSUNBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb0owTmhibTV2ZENCbWFXNWtJR2RzYjJKaGJDQm1kVzVqZEdsdmJuTWdZV1JrUlhabGJuUk1hWE4wWlc1bGNpQnZjaUJoZEhSaFkyaEZkbVZ1ZEM0bktUdGNjbHh1SUNBZ0lIMWNjbHh1SUNBZ0lIUmhjbWRsZEZkcGJtUnZkeUE5SUdkc2IySmhiRHRjY2x4dUlDQjlYSEpjYmx4eVhHNGdJR2xtSUNoMGVYQmxiMllnZEdGeVoyVjBWMmx1Wkc5M0xtNXZaR1ZVZVhCbElEMDlQU0FuYm5WdFltVnlKeWtnZTF4eVhHNGdJQ0FnZEdGeVoyVjBWWE5sY2tGblpXNTBJRDBnZEdGeVoyVjBVR3hoZEdadmNtMDdYSEpjYmlBZ0lDQjBZWEpuWlhSUWJHRjBabTl5YlNBZ1BTQjBZWEpuWlhSRmJHVnRaVzUwTzF4eVhHNGdJQ0FnZEdGeVoyVjBSV3hsYldWdWRDQWdJRDBnZEdGeVoyVjBWMmx1Wkc5M08xeHlYRzRnSUNBZ2RHRnlaMlYwVjJsdVpHOTNJQ0FnSUQwZ1oyeHZZbUZzTzF4eVhHNGdJSDFjY2x4dVhISmNiaUFnYVdZZ0tDRjBZWEpuWlhSWGFXNWtiM2N1WVdSa1JYWmxiblJNYVhOMFpXNWxjaUFtSmlBaGRHRnlaMlYwVjJsdVpHOTNMbUYwZEdGamFFVjJaVzUwS1NCN1hISmNiaUFnSUNCMGFISnZkeUJ1WlhjZ1JYSnliM0lvSjBOaGJtNXZkQ0JtYVc1a0lHRmtaRVYyWlc1MFRHbHpkR1Z1WlhJZ2IzSWdZWFIwWVdOb1JYWmxiblFnYldWMGFHOWtjeUJ2YmlCMFlYSm5aWFJYYVc1a2IzY3VKeWs3WEhKY2JpQWdmVnh5WEc1Y2NseHVJQ0IwYUdsekxsOXBjMDF2WkdWeWJrSnliM2R6WlhJZ1BTQWhJWFJoY21kbGRGZHBibVJ2ZHk1aFpHUkZkbVZ1ZEV4cGMzUmxibVZ5TzF4eVhHNWNjbHh1SUNCMllYSWdkWE5sY2tGblpXNTBJRDBnZEdGeVoyVjBWMmx1Wkc5M0xtNWhkbWxuWVhSdmNpQW1KaUIwWVhKblpYUlhhVzVrYjNjdWJtRjJhV2RoZEc5eUxuVnpaWEpCWjJWdWRDQjhmQ0FuSnp0Y2NseHVJQ0IyWVhJZ2NHeGhkR1p2Y20wZ0lEMGdkR0Z5WjJWMFYybHVaRzkzTG01aGRtbG5ZWFJ2Y2lBbUppQjBZWEpuWlhSWGFXNWtiM2N1Ym1GMmFXZGhkRzl5TG5Cc1lYUm1iM0p0SUNCOGZDQW5KenRjY2x4dVhISmNiaUFnZEdGeVoyVjBSV3hsYldWdWRDQWdJQ1ltSUhSaGNtZGxkRVZzWlcxbGJuUWdJQ0FoUFQwZ2JuVnNiQ0I4ZkNBb2RHRnlaMlYwUld4bGJXVnVkQ0FnSUQwZ2RHRnlaMlYwVjJsdVpHOTNMbVJ2WTNWdFpXNTBLVHRjY2x4dUlDQjBZWEpuWlhSUWJHRjBabTl5YlNBZ0ppWWdkR0Z5WjJWMFVHeGhkR1p2Y20wZ0lDRTlQU0J1ZFd4c0lIeDhJQ2gwWVhKblpYUlFiR0YwWm05eWJTQWdQU0J3YkdGMFptOXliU2s3WEhKY2JpQWdkR0Z5WjJWMFZYTmxja0ZuWlc1MElDWW1JSFJoY21kbGRGVnpaWEpCWjJWdWRDQWhQVDBnYm5Wc2JDQjhmQ0FvZEdGeVoyVjBWWE5sY2tGblpXNTBJRDBnZFhObGNrRm5aVzUwS1R0Y2NseHVYSEpjYmlBZ2RHaHBjeTVmZEdGeVoyVjBTMlY1Ukc5M2JrSnBibVJwYm1jZ1BTQm1kVzVqZEdsdmJpaGxkbVZ1ZENrZ2UxeHlYRzRnSUNBZ1gzUm9hWE11Y0hKbGMzTkxaWGtvWlhabGJuUXVhMlY1UTI5a1pTd2daWFpsYm5RcE8xeHlYRzRnSUNBZ1gzUm9hWE11WDJoaGJtUnNaVU52YlcxaGJtUkNkV2NvWlhabGJuUXNJSEJzWVhSbWIzSnRLVHRjY2x4dUlDQjlPMXh5WEc0Z0lIUm9hWE11WDNSaGNtZGxkRXRsZVZWd1FtbHVaR2x1WnlBOUlHWjFibU4wYVc5dUtHVjJaVzUwS1NCN1hISmNiaUFnSUNCZmRHaHBjeTV5Wld4bFlYTmxTMlY1S0dWMlpXNTBMbXRsZVVOdlpHVXNJR1YyWlc1MEtUdGNjbHh1SUNCOU8xeHlYRzRnSUhSb2FYTXVYM1JoY21kbGRGSmxjMlYwUW1sdVpHbHVaeUE5SUdaMWJtTjBhVzl1S0dWMlpXNTBLU0I3WEhKY2JpQWdJQ0JmZEdocGN5NXlaV3hsWVhObFFXeHNTMlY1Y3lobGRtVnVkQ2xjY2x4dUlDQjlPMXh5WEc1Y2NseHVJQ0IwYUdsekxsOWlhVzVrUlhabGJuUW9kR0Z5WjJWMFJXeGxiV1Z1ZEN3Z0oydGxlV1J2ZDI0bkxDQjBhR2x6TGw5MFlYSm5aWFJMWlhsRWIzZHVRbWx1WkdsdVp5azdYSEpjYmlBZ2RHaHBjeTVmWW1sdVpFVjJaVzUwS0hSaGNtZGxkRVZzWlcxbGJuUXNJQ2RyWlhsMWNDY3NJQ0FnZEdocGN5NWZkR0Z5WjJWMFMyVjVWWEJDYVc1a2FXNW5LVHRjY2x4dUlDQjBhR2x6TGw5aWFXNWtSWFpsYm5Rb2RHRnlaMlYwVjJsdVpHOTNMQ0FnSjJadlkzVnpKeXdnSUNCMGFHbHpMbDkwWVhKblpYUlNaWE5sZEVKcGJtUnBibWNwTzF4eVhHNGdJSFJvYVhNdVgySnBibVJGZG1WdWRDaDBZWEpuWlhSWGFXNWtiM2NzSUNBbllteDFjaWNzSUNBZ0lIUm9hWE11WDNSaGNtZGxkRkpsYzJWMFFtbHVaR2x1WnlrN1hISmNibHh5WEc0Z0lIUm9hWE11WDNSaGNtZGxkRVZzWlcxbGJuUWdJQ0E5SUhSaGNtZGxkRVZzWlcxbGJuUTdYSEpjYmlBZ2RHaHBjeTVmZEdGeVoyVjBWMmx1Wkc5M0lDQWdJRDBnZEdGeVoyVjBWMmx1Wkc5M08xeHlYRzRnSUhSb2FYTXVYM1JoY21kbGRGQnNZWFJtYjNKdElDQTlJSFJoY21kbGRGQnNZWFJtYjNKdE8xeHlYRzRnSUhSb2FYTXVYM1JoY21kbGRGVnpaWEpCWjJWdWRDQTlJSFJoY21kbGRGVnpaWEpCWjJWdWREdGNjbHh1ZlR0Y2NseHVYSEpjYmt0bGVXSnZZWEprTG5CeWIzUnZkSGx3WlM1emRHOXdJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnZG1GeUlGOTBhR2x6SUQwZ2RHaHBjenRjY2x4dVhISmNiaUFnYVdZZ0tDRjBhR2x6TGw5MFlYSm5aWFJGYkdWdFpXNTBJSHg4SUNGMGFHbHpMbDkwWVhKblpYUlhhVzVrYjNjcElIc2djbVYwZFhKdU95QjlYSEpjYmx4eVhHNGdJSFJvYVhNdVgzVnVZbWx1WkVWMlpXNTBLSFJvYVhNdVgzUmhjbWRsZEVWc1pXMWxiblFzSUNkclpYbGtiM2R1Snl3Z2RHaHBjeTVmZEdGeVoyVjBTMlY1Ukc5M2JrSnBibVJwYm1jcE8xeHlYRzRnSUhSb2FYTXVYM1Z1WW1sdVpFVjJaVzUwS0hSb2FYTXVYM1JoY21kbGRFVnNaVzFsYm5Rc0lDZHJaWGwxY0Njc0lDQWdkR2hwY3k1ZmRHRnlaMlYwUzJWNVZYQkNhVzVrYVc1bktUdGNjbHh1SUNCMGFHbHpMbDkxYm1KcGJtUkZkbVZ1ZENoMGFHbHpMbDkwWVhKblpYUlhhVzVrYjNjc0lDQW5abTlqZFhNbkxDQWdJSFJvYVhNdVgzUmhjbWRsZEZKbGMyVjBRbWx1WkdsdVp5azdYSEpjYmlBZ2RHaHBjeTVmZFc1aWFXNWtSWFpsYm5Rb2RHaHBjeTVmZEdGeVoyVjBWMmx1Wkc5M0xDQWdKMkpzZFhJbkxDQWdJQ0IwYUdsekxsOTBZWEpuWlhSU1pYTmxkRUpwYm1ScGJtY3BPMXh5WEc1Y2NseHVJQ0IwYUdsekxsOTBZWEpuWlhSWGFXNWtiM2NnSUQwZ2JuVnNiRHRjY2x4dUlDQjBhR2x6TGw5MFlYSm5aWFJGYkdWdFpXNTBJRDBnYm5Wc2JEdGNjbHh1ZlR0Y2NseHVYSEpjYmt0bGVXSnZZWEprTG5CeWIzUnZkSGx3WlM1d2NtVnpjMHRsZVNBOUlHWjFibU4wYVc5dUtHdGxlVU52WkdVc0lHVjJaVzUwS1NCN1hISmNiaUFnYVdZZ0tIUm9hWE11WDNCaGRYTmxaQ2tnZXlCeVpYUjFjbTQ3SUgxY2NseHVJQ0JwWmlBb0lYUm9hWE11WDJ4dlkyRnNaU2tnZXlCMGFISnZkeUJ1WlhjZ1JYSnliM0lvSjB4dlkyRnNaU0J1YjNRZ2MyVjBKeWs3SUgxY2NseHVYSEpjYmlBZ2RHaHBjeTVmYkc5allXeGxMbkJ5WlhOelMyVjVLR3RsZVVOdlpHVXBPMXh5WEc0Z0lIUm9hWE11WDJGd2NHeDVRbWx1WkdsdVozTW9aWFpsYm5RcE8xeHlYRzU5TzF4eVhHNWNjbHh1UzJWNVltOWhjbVF1Y0hKdmRHOTBlWEJsTG5KbGJHVmhjMlZMWlhrZ1BTQm1kVzVqZEdsdmJpaHJaWGxEYjJSbExDQmxkbVZ1ZENrZ2UxeHlYRzRnSUdsbUlDaDBhR2x6TGw5d1lYVnpaV1FwSUhzZ2NtVjBkWEp1T3lCOVhISmNiaUFnYVdZZ0tDRjBhR2x6TGw5c2IyTmhiR1VwSUhzZ2RHaHliM2NnYm1WM0lFVnljbTl5S0NkTWIyTmhiR1VnYm05MElITmxkQ2NwT3lCOVhISmNibHh5WEc0Z0lIUm9hWE11WDJ4dlkyRnNaUzV5Wld4bFlYTmxTMlY1S0d0bGVVTnZaR1VwTzF4eVhHNGdJSFJvYVhNdVgyTnNaV0Z5UW1sdVpHbHVaM01vWlhabGJuUXBPMXh5WEc1OU8xeHlYRzVjY2x4dVMyVjVZbTloY21RdWNISnZkRzkwZVhCbExuSmxiR1ZoYzJWQmJHeExaWGx6SUQwZ1puVnVZM1JwYjI0b1pYWmxiblFwSUh0Y2NseHVJQ0JwWmlBb2RHaHBjeTVmY0dGMWMyVmtLU0I3SUhKbGRIVnlianNnZlZ4eVhHNGdJR2xtSUNnaGRHaHBjeTVmYkc5allXeGxLU0I3SUhSb2NtOTNJRzVsZHlCRmNuSnZjaWduVEc5allXeGxJRzV2ZENCelpYUW5LVHNnZlZ4eVhHNWNjbHh1SUNCMGFHbHpMbDlzYjJOaGJHVXVjSEpsYzNObFpFdGxlWE11YkdWdVozUm9JRDBnTUR0Y2NseHVJQ0IwYUdsekxsOWpiR1ZoY2tKcGJtUnBibWR6S0dWMlpXNTBLVHRjY2x4dWZUdGNjbHh1WEhKY2JrdGxlV0p2WVhKa0xuQnliM1J2ZEhsd1pTNXdZWFZ6WlNBOUlHWjFibU4wYVc5dUtDa2dlMXh5WEc0Z0lHbG1JQ2gwYUdsekxsOXdZWFZ6WldRcElIc2djbVYwZFhKdU95QjlYSEpjYmlBZ2FXWWdLSFJvYVhNdVgyeHZZMkZzWlNrZ2V5QjBhR2x6TG5KbGJHVmhjMlZCYkd4TFpYbHpLQ2s3SUgxY2NseHVJQ0IwYUdsekxsOXdZWFZ6WldRZ1BTQjBjblZsTzF4eVhHNTlPMXh5WEc1Y2NseHVTMlY1WW05aGNtUXVjSEp2ZEc5MGVYQmxMbkpsYzNWdFpTQTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJSFJvYVhNdVgzQmhkWE5sWkNBOUlHWmhiSE5sTzF4eVhHNTlPMXh5WEc1Y2NseHVTMlY1WW05aGNtUXVjSEp2ZEc5MGVYQmxMbkpsYzJWMElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdkR2hwY3k1eVpXeGxZWE5sUVd4c1MyVjVjeWdwTzF4eVhHNGdJSFJvYVhNdVgyeHBjM1JsYm1WeWN5NXNaVzVuZEdnZ1BTQXdPMXh5WEc1OU8xeHlYRzVjY2x4dVMyVjVZbTloY21RdWNISnZkRzkwZVhCbExsOWlhVzVrUlhabGJuUWdQU0JtZFc1amRHbHZiaWgwWVhKblpYUkZiR1Z0Wlc1MExDQmxkbVZ1ZEU1aGJXVXNJR2hoYm1Sc1pYSXBJSHRjY2x4dUlDQnlaWFIxY200Z2RHaHBjeTVmYVhOTmIyUmxjbTVDY205M2MyVnlJRDljY2x4dUlDQWdJSFJoY21kbGRFVnNaVzFsYm5RdVlXUmtSWFpsYm5STWFYTjBaVzVsY2lobGRtVnVkRTVoYldVc0lHaGhibVJzWlhJc0lHWmhiSE5sS1NBNlhISmNiaUFnSUNCMFlYSm5aWFJGYkdWdFpXNTBMbUYwZEdGamFFVjJaVzUwS0NkdmJpY2dLeUJsZG1WdWRFNWhiV1VzSUdoaGJtUnNaWElwTzF4eVhHNTlPMXh5WEc1Y2NseHVTMlY1WW05aGNtUXVjSEp2ZEc5MGVYQmxMbDkxYm1KcGJtUkZkbVZ1ZENBOUlHWjFibU4wYVc5dUtIUmhjbWRsZEVWc1pXMWxiblFzSUdWMlpXNTBUbUZ0WlN3Z2FHRnVaR3hsY2lrZ2UxeHlYRzRnSUhKbGRIVnliaUIwYUdsekxsOXBjMDF2WkdWeWJrSnliM2R6WlhJZ1AxeHlYRzRnSUNBZ2RHRnlaMlYwUld4bGJXVnVkQzV5WlcxdmRtVkZkbVZ1ZEV4cGMzUmxibVZ5S0dWMlpXNTBUbUZ0WlN3Z2FHRnVaR3hsY2l3Z1ptRnNjMlVwSURwY2NseHVJQ0FnSUhSaGNtZGxkRVZzWlcxbGJuUXVaR1YwWVdOb1JYWmxiblFvSjI5dUp5QXJJR1YyWlc1MFRtRnRaU3dnYUdGdVpHeGxjaWs3WEhKY2JuMDdYSEpjYmx4eVhHNUxaWGxpYjJGeVpDNXdjbTkwYjNSNWNHVXVYMmRsZEVkeWIzVndaV1JNYVhOMFpXNWxjbk1nUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNCMllYSWdiR2x6ZEdWdVpYSkhjbTkxY0hNZ0lDQTlJRnRkTzF4eVhHNGdJSFpoY2lCc2FYTjBaVzVsY2tkeWIzVndUV0Z3SUQwZ1cxMDdYSEpjYmx4eVhHNGdJSFpoY2lCc2FYTjBaVzVsY25NZ1BTQjBhR2x6TGw5c2FYTjBaVzVsY25NN1hISmNiaUFnYVdZZ0tIUm9hWE11WDJOMWNuSmxiblJEYjI1MFpYaDBJQ0U5UFNBbloyeHZZbUZzSnlrZ2UxeHlYRzRnSUNBZ2JHbHpkR1Z1WlhKeklEMGdXMTB1WTI5dVkyRjBLR3hwYzNSbGJtVnljeXdnZEdocGN5NWZZMjl1ZEdWNGRITXVaMnh2WW1Gc0tUdGNjbHh1SUNCOVhISmNibHh5WEc0Z0lHeHBjM1JsYm1WeWN5NXpiM0owS0daMWJtTjBhVzl1S0dFc0lHSXBJSHRjY2x4dUlDQWdJSEpsZEhWeWJpQW9ZaTVyWlhsRGIyMWlieUEvSUdJdWEyVjVRMjl0WW04dWEyVjVUbUZ0WlhNdWJHVnVaM1JvSURvZ01Da2dMU0FvWVM1clpYbERiMjFpYnlBL0lHRXVhMlY1UTI5dFltOHVhMlY1VG1GdFpYTXViR1Z1WjNSb0lEb2dNQ2s3WEhKY2JpQWdmU2t1Wm05eVJXRmphQ2htZFc1amRHbHZiaWhzS1NCN1hISmNiaUFnSUNCMllYSWdiV0Z3U1c1a1pYZ2dQU0F0TVR0Y2NseHVJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2JHbHpkR1Z1WlhKSGNtOTFjRTFoY0M1c1pXNW5kR2c3SUdrZ0t6MGdNU2tnZTF4eVhHNGdJQ0FnSUNCcFppQW9iR2x6ZEdWdVpYSkhjbTkxY0UxaGNGdHBYU0E5UFQwZ2JuVnNiQ0FtSmlCc0xtdGxlVU52YldKdklEMDlQU0J1ZFd4c0lIeDhYSEpjYmlBZ0lDQWdJQ0FnSUNCc2FYTjBaVzVsY2tkeWIzVndUV0Z3VzJsZElDRTlQU0J1ZFd4c0lDWW1JR3hwYzNSbGJtVnlSM0p2ZFhCTllYQmJhVjB1YVhORmNYVmhiQ2hzTG10bGVVTnZiV0p2S1NrZ2UxeHlYRzRnSUNBZ0lDQWdJRzFoY0VsdVpHVjRJRDBnYVR0Y2NseHVJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ2ZWeHlYRzRnSUNBZ2FXWWdLRzFoY0VsdVpHVjRJRDA5UFNBdE1Ta2dlMXh5WEc0Z0lDQWdJQ0J0WVhCSmJtUmxlQ0E5SUd4cGMzUmxibVZ5UjNKdmRYQk5ZWEF1YkdWdVozUm9PMXh5WEc0Z0lDQWdJQ0JzYVhOMFpXNWxja2R5YjNWd1RXRndMbkIxYzJnb2JDNXJaWGxEYjIxaWJ5azdYSEpjYmlBZ0lDQjlYSEpjYmlBZ0lDQnBaaUFvSVd4cGMzUmxibVZ5UjNKdmRYQnpXMjFoY0VsdVpHVjRYU2tnZTF4eVhHNGdJQ0FnSUNCc2FYTjBaVzVsY2tkeWIzVndjMXR0WVhCSmJtUmxlRjBnUFNCYlhUdGNjbHh1SUNBZ0lIMWNjbHh1SUNBZ0lHeHBjM1JsYm1WeVIzSnZkWEJ6VzIxaGNFbHVaR1Y0WFM1d2RYTm9LR3dwTzF4eVhHNGdJSDBwTzF4eVhHNGdJSEpsZEhWeWJpQnNhWE4wWlc1bGNrZHliM1Z3Y3p0Y2NseHVmVHRjY2x4dVhISmNia3RsZVdKdllYSmtMbkJ5YjNSdmRIbHdaUzVmWVhCd2JIbENhVzVrYVc1bmN5QTlJR1oxYm1OMGFXOXVLR1YyWlc1MEtTQjdYSEpjYmlBZ2RtRnlJSEJ5WlhabGJuUlNaWEJsWVhRZ1BTQm1ZV3h6WlR0Y2NseHVYSEpjYmlBZ1pYWmxiblFnZkh3Z0tHVjJaVzUwSUQwZ2UzMHBPMXh5WEc0Z0lHVjJaVzUwTG5CeVpYWmxiblJTWlhCbFlYUWdQU0JtZFc1amRHbHZiaWdwSUhzZ2NISmxkbVZ1ZEZKbGNHVmhkQ0E5SUhSeWRXVTdJSDA3WEhKY2JpQWdaWFpsYm5RdWNISmxjM05sWkV0bGVYTWdJQ0E5SUhSb2FYTXVYMnh2WTJGc1pTNXdjbVZ6YzJWa1MyVjVjeTV6YkdsalpTZ3dLVHRjY2x4dVhISmNiaUFnZG1GeUlIQnlaWE56WldSTFpYbHpJQ0FnSUQwZ2RHaHBjeTVmYkc5allXeGxMbkJ5WlhOelpXUkxaWGx6TG5Oc2FXTmxLREFwTzF4eVhHNGdJSFpoY2lCc2FYTjBaVzVsY2tkeWIzVndjeUE5SUhSb2FYTXVYMmRsZEVkeWIzVndaV1JNYVhOMFpXNWxjbk1vS1R0Y2NseHVYSEpjYmx4eVhHNGdJR1p2Y2lBb2RtRnlJR2tnUFNBd095QnBJRHdnYkdsemRHVnVaWEpIY205MWNITXViR1Z1WjNSb095QnBJQ3M5SURFcElIdGNjbHh1SUNBZ0lIWmhjaUJzYVhOMFpXNWxjbk1nUFNCc2FYTjBaVzVsY2tkeWIzVndjMXRwWFR0Y2NseHVJQ0FnSUhaaGNpQnJaWGxEYjIxaWJ5QWdQU0JzYVhOMFpXNWxjbk5iTUYwdWEyVjVRMjl0WW04N1hISmNibHh5WEc0Z0lDQWdhV1lnS0d0bGVVTnZiV0p2SUQwOVBTQnVkV3hzSUh4OElHdGxlVU52YldKdkxtTm9aV05yS0hCeVpYTnpaV1JMWlhsektTa2dlMXh5WEc0Z0lDQWdJQ0JtYjNJZ0tIWmhjaUJxSUQwZ01Ec2dhaUE4SUd4cGMzUmxibVZ5Y3k1c1pXNW5kR2c3SUdvZ0t6MGdNU2tnZTF4eVhHNGdJQ0FnSUNBZ0lIWmhjaUJzYVhOMFpXNWxjaUE5SUd4cGMzUmxibVZ5YzF0cVhUdGNjbHh1WEhKY2JpQWdJQ0FnSUNBZ2FXWWdLR3RsZVVOdmJXSnZJRDA5UFNCdWRXeHNLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQnNhWE4wWlc1bGNpQTlJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdhMlY1UTI5dFltOGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBNklHNWxkeUJMWlhsRGIyMWlieWh3Y21WemMyVmtTMlY1Y3k1cWIybHVLQ2NySnlrcExGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCd2NtVnpjMGhoYm1Sc1pYSWdJQ0FnSUNBZ0lDQWdJRG9nYkdsemRHVnVaWEl1Y0hKbGMzTklZVzVrYkdWeUxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpXeGxZWE5sU0dGdVpHeGxjaUFnSUNBZ0lDQWdJRG9nYkdsemRHVnVaWEl1Y21Wc1pXRnpaVWhoYm1Sc1pYSXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIQnlaWFpsYm5SU1pYQmxZWFFnSUNBZ0lDQWdJQ0FnT2lCc2FYTjBaVzVsY2k1d2NtVjJaVzUwVW1Wd1pXRjBMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQndjbVYyWlc1MFVtVndaV0YwUW5sRVpXWmhkV3gwSURvZ2JHbHpkR1Z1WlhJdWNISmxkbVZ1ZEZKbGNHVmhkRUo1UkdWbVlYVnNkRnh5WEc0Z0lDQWdJQ0FnSUNBZ2ZUdGNjbHh1SUNBZ0lDQWdJQ0I5WEhKY2JseHlYRzRnSUNBZ0lDQWdJR2xtSUNoc2FYTjBaVzVsY2k1d2NtVnpjMGhoYm1Sc1pYSWdKaVlnSVd4cGMzUmxibVZ5TG5CeVpYWmxiblJTWlhCbFlYUXBJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lHeHBjM1JsYm1WeUxuQnlaWE56U0dGdVpHeGxjaTVqWVd4c0tIUm9hWE1zSUdWMlpXNTBLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lHbG1JQ2h3Y21WMlpXNTBVbVZ3WldGMEtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHeHBjM1JsYm1WeUxuQnlaWFpsYm5SU1pYQmxZWFFnUFNCd2NtVjJaVzUwVW1Wd1pXRjBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQndjbVYyWlc1MFVtVndaV0YwSUNBZ0lDQWdJQ0FnSUQwZ1ptRnNjMlU3WEhKY2JpQWdJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQWdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lDQWdJQ0JwWmlBb2JHbHpkR1Z1WlhJdWNtVnNaV0Z6WlVoaGJtUnNaWElnSmlZZ2RHaHBjeTVmWVhCd2JHbGxaRXhwYzNSbGJtVnljeTVwYm1SbGVFOW1LR3hwYzNSbGJtVnlLU0E5UFQwZ0xURXBJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lIUm9hWE11WDJGd2NHeHBaV1JNYVhOMFpXNWxjbk11Y0hWemFDaHNhWE4wWlc1bGNpazdYSEpjYmlBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnSUNCOVhISmNibHh5WEc0Z0lDQWdJQ0JwWmlBb2EyVjVRMjl0WW04cElIdGNjbHh1SUNBZ0lDQWdJQ0JtYjNJZ0tIWmhjaUJxSUQwZ01Ec2dhaUE4SUd0bGVVTnZiV0p2TG10bGVVNWhiV1Z6TG14bGJtZDBhRHNnYWlBclBTQXhLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQjJZWElnYVc1a1pYZ2dQU0J3Y21WemMyVmtTMlY1Y3k1cGJtUmxlRTltS0d0bGVVTnZiV0p2TG10bGVVNWhiV1Z6VzJwZEtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUdsbUlDaHBibVJsZUNBaFBUMGdMVEVwSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnY0hKbGMzTmxaRXRsZVhNdWMzQnNhV05sS0dsdVpHVjRMQ0F4S1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYWlBdFBTQXhPMXh5WEc0Z0lDQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnZlZ4eVhHNGdJQ0FnZlZ4eVhHNGdJSDFjY2x4dWZUdGNjbHh1WEhKY2JrdGxlV0p2WVhKa0xuQnliM1J2ZEhsd1pTNWZZMnhsWVhKQ2FXNWthVzVuY3lBOUlHWjFibU4wYVc5dUtHVjJaVzUwS1NCN1hISmNiaUFnWlhabGJuUWdmSHdnS0dWMlpXNTBJRDBnZTMwcE8xeHlYRzVjY2x4dUlDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJSFJvYVhNdVgyRndjR3hwWldSTWFYTjBaVzVsY25NdWJHVnVaM1JvT3lCcElDczlJREVwSUh0Y2NseHVJQ0FnSUhaaGNpQnNhWE4wWlc1bGNpQTlJSFJvYVhNdVgyRndjR3hwWldSTWFYTjBaVzVsY25OYmFWMDdYSEpjYmlBZ0lDQjJZWElnYTJWNVEyOXRZbThnUFNCc2FYTjBaVzVsY2k1clpYbERiMjFpYnp0Y2NseHVJQ0FnSUdsbUlDaHJaWGxEYjIxaWJ5QTlQVDBnYm5Wc2JDQjhmQ0FoYTJWNVEyOXRZbTh1WTJobFkyc29kR2hwY3k1ZmJHOWpZV3hsTG5CeVpYTnpaV1JMWlhsektTa2dlMXh5WEc0Z0lDQWdJQ0JwWmlBb2RHaHBjeTVmWTJGc2JHVnlTR0Z1Wkd4bGNpQWhQVDBnYkdsemRHVnVaWEl1Y21Wc1pXRnpaVWhoYm1Sc1pYSXBJSHRjY2x4dUlDQWdJQ0FnSUNCMllYSWdiMnhrUTJGc2JHVnlJRDBnZEdocGN5NWZZMkZzYkdWeVNHRnVaR3hsY2p0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5allXeHNaWEpJWVc1a2JHVnlJRDBnYkdsemRHVnVaWEl1Y21Wc1pXRnpaVWhoYm1Sc1pYSTdYSEpjYmlBZ0lDQWdJQ0FnYkdsemRHVnVaWEl1Y0hKbGRtVnVkRkpsY0dWaGRDQTlJR3hwYzNSbGJtVnlMbkJ5WlhabGJuUlNaWEJsWVhSQ2VVUmxabUYxYkhRN1hISmNiaUFnSUNBZ0lDQWdiR2x6ZEdWdVpYSXVjbVZzWldGelpVaGhibVJzWlhJdVkyRnNiQ2gwYUdsekxDQmxkbVZ1ZENrN1hISmNiaUFnSUNBZ0lDQWdkR2hwY3k1ZlkyRnNiR1Z5U0dGdVpHeGxjaUE5SUc5c1pFTmhiR3hsY2p0Y2NseHVJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ0lDQjBhR2x6TGw5aGNIQnNhV1ZrVEdsemRHVnVaWEp6TG5Od2JHbGpaU2hwTENBeEtUdGNjbHh1SUNBZ0lDQWdhU0F0UFNBeE8xeHlYRzRnSUNBZ2ZWeHlYRzRnSUgxY2NseHVmVHRjY2x4dVhISmNia3RsZVdKdllYSmtMbkJ5YjNSdmRIbHdaUzVmYUdGdVpHeGxRMjl0YldGdVpFSjFaeUE5SUdaMWJtTjBhVzl1S0dWMlpXNTBMQ0J3YkdGMFptOXliU2tnZTF4eVhHNGdJQzh2SUU5dUlFMWhZeUIzYUdWdUlIUm9aU0JqYjIxdFlXNWtJR3RsZVNCcGN5QnJaWEIwSUhCeVpYTnpaV1FzSUd0bGVYVndJR2x6SUc1dmRDQjBjbWxuWjJWeVpXUWdabTl5SUdGdWVTQnZkR2hsY2lCclpYa3VYSEpjYmlBZ0x5OGdTVzRnZEdocGN5QmpZWE5sSUdadmNtTmxJR0VnYTJWNWRYQWdabTl5SUc1dmJpMXRiMlJwWm1sbGNpQnJaWGx6SUdScGNtVmpkR3g1SUdGbWRHVnlJSFJvWlNCclpYbHdjbVZ6Y3k1Y2NseHVJQ0IyWVhJZ2JXOWthV1pwWlhKTFpYbHpJRDBnVzF3aWMyaHBablJjSWl3Z1hDSmpkSEpzWENJc0lGd2lZV3gwWENJc0lGd2lZMkZ3YzJ4dlkydGNJaXdnWENKMFlXSmNJaXdnWENKamIyMXRZVzVrWENKZE8xeHlYRzRnSUdsbUlDaHdiR0YwWm05eWJTNXRZWFJqYUNoY0lrMWhZMXdpS1NBbUppQjBhR2x6TGw5c2IyTmhiR1V1Y0hKbGMzTmxaRXRsZVhNdWFXNWpiSFZrWlhNb1hDSmpiMjF0WVc1a1hDSXBJQ1ltWEhKY2JpQWdJQ0FnSUNGdGIyUnBabWxsY2t0bGVYTXVhVzVqYkhWa1pYTW9kR2hwY3k1ZmJHOWpZV3hsTG1kbGRFdGxlVTVoYldWektHVjJaVzUwTG10bGVVTnZaR1VwV3pCZEtTa2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZmRHRnlaMlYwUzJWNVZYQkNhVzVrYVc1bktHVjJaVzUwS1R0Y2NseHVJQ0I5WEhKY2JuMDdYSEpjYmx4eVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlFdGxlV0p2WVhKa08xeHlYRzRpWFgwPSIsIlxyXG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2tleS1jb21ibycpO1xyXG5cclxuXHJcbmZ1bmN0aW9uIExvY2FsZShuYW1lKSB7XHJcbiAgdGhpcy5sb2NhbGVOYW1lICAgICA9IG5hbWU7XHJcbiAgdGhpcy5wcmVzc2VkS2V5cyAgICA9IFtdO1xyXG4gIHRoaXMuX2FwcGxpZWRNYWNyb3MgPSBbXTtcclxuICB0aGlzLl9rZXlNYXAgICAgICAgID0ge307XHJcbiAgdGhpcy5fa2lsbEtleUNvZGVzICA9IFtdO1xyXG4gIHRoaXMuX21hY3JvcyAgICAgICAgPSBbXTtcclxufVxyXG5cclxuTG9jYWxlLnByb3RvdHlwZS5iaW5kS2V5Q29kZSA9IGZ1bmN0aW9uKGtleUNvZGUsIGtleU5hbWVzKSB7XHJcbiAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ3N0cmluZycpIHtcclxuICAgIGtleU5hbWVzID0gW2tleU5hbWVzXTtcclxuICB9XHJcblxyXG4gIHRoaXMuX2tleU1hcFtrZXlDb2RlXSA9IGtleU5hbWVzO1xyXG59O1xyXG5cclxuTG9jYWxlLnByb3RvdHlwZS5iaW5kTWFjcm8gPSBmdW5jdGlvbihrZXlDb21ib1N0ciwga2V5TmFtZXMpIHtcclxuICBpZiAodHlwZW9mIGtleU5hbWVzID09PSAnc3RyaW5nJykge1xyXG4gICAga2V5TmFtZXMgPSBbIGtleU5hbWVzIF07XHJcbiAgfVxyXG5cclxuICB2YXIgaGFuZGxlciA9IG51bGw7XHJcbiAgaWYgKHR5cGVvZiBrZXlOYW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgaGFuZGxlciA9IGtleU5hbWVzO1xyXG4gICAga2V5TmFtZXMgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgdmFyIG1hY3JvID0ge1xyXG4gICAga2V5Q29tYm8gOiBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpLFxyXG4gICAga2V5TmFtZXMgOiBrZXlOYW1lcyxcclxuICAgIGhhbmRsZXIgIDogaGFuZGxlclxyXG4gIH07XHJcblxyXG4gIHRoaXMuX21hY3Jvcy5wdXNoKG1hY3JvKTtcclxufTtcclxuXHJcbkxvY2FsZS5wcm90b3R5cGUuZ2V0S2V5Q29kZXMgPSBmdW5jdGlvbihrZXlOYW1lKSB7XHJcbiAgdmFyIGtleUNvZGVzID0gW107XHJcbiAgZm9yICh2YXIga2V5Q29kZSBpbiB0aGlzLl9rZXlNYXApIHtcclxuICAgIHZhciBpbmRleCA9IHRoaXMuX2tleU1hcFtrZXlDb2RlXS5pbmRleE9mKGtleU5hbWUpO1xyXG4gICAgaWYgKGluZGV4ID4gLTEpIHsga2V5Q29kZXMucHVzaChrZXlDb2RlfDApOyB9XHJcbiAgfVxyXG4gIHJldHVybiBrZXlDb2RlcztcclxufTtcclxuXHJcbkxvY2FsZS5wcm90b3R5cGUuZ2V0S2V5TmFtZXMgPSBmdW5jdGlvbihrZXlDb2RlKSB7XHJcbiAgcmV0dXJuIHRoaXMuX2tleU1hcFtrZXlDb2RlXSB8fCBbXTtcclxufTtcclxuXHJcbkxvY2FsZS5wcm90b3R5cGUuc2V0S2lsbEtleSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcclxuICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICB2YXIga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICB0aGlzLnNldEtpbGxLZXkoa2V5Q29kZXNbaV0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5fa2lsbEtleUNvZGVzLnB1c2goa2V5Q29kZSk7XHJcbn07XHJcblxyXG5Mb2NhbGUucHJvdG90eXBlLnByZXNzS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSkge1xyXG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcclxuICAgIHZhciBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgIHRoaXMucHJlc3NLZXkoa2V5Q29kZXNbaV0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdmFyIGtleU5hbWVzID0gdGhpcy5nZXRLZXlOYW1lcyhrZXlDb2RlKTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICBpZiAodGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKSA9PT0gLTEpIHtcclxuICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKGtleU5hbWVzW2ldKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHRoaXMuX2FwcGx5TWFjcm9zKCk7XHJcbn07XHJcblxyXG5Mb2NhbGUucHJvdG90eXBlLnJlbGVhc2VLZXkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XHJcbiAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xyXG4gICAgdmFyIGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgdGhpcy5yZWxlYXNlS2V5KGtleUNvZGVzW2ldKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGVsc2Uge1xyXG4gICAgdmFyIGtleU5hbWVzICAgICAgICAgPSB0aGlzLmdldEtleU5hbWVzKGtleUNvZGUpO1xyXG4gICAgdmFyIGtpbGxLZXlDb2RlSW5kZXggPSB0aGlzLl9raWxsS2V5Q29kZXMuaW5kZXhPZihrZXlDb2RlKTtcclxuICAgIFxyXG4gICAgaWYgKGtpbGxLZXlDb2RlSW5kZXggPiAtMSkge1xyXG4gICAgICB0aGlzLnByZXNzZWRLZXlzLmxlbmd0aCA9IDA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKGtleU5hbWVzW2ldKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2NsZWFyTWFjcm9zKCk7XHJcbiAgfVxyXG59O1xyXG5cclxuTG9jYWxlLnByb3RvdHlwZS5fYXBwbHlNYWNyb3MgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgbWFjcm9zID0gdGhpcy5fbWFjcm9zLnNsaWNlKDApO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWFjcm9zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICB2YXIgbWFjcm8gPSBtYWNyb3NbaV07XHJcbiAgICBpZiAobWFjcm8ua2V5Q29tYm8uY2hlY2sodGhpcy5wcmVzc2VkS2V5cykpIHtcclxuICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcclxuICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG1hY3JvLmhhbmRsZXIodGhpcy5wcmVzc2VkS2V5cyk7XHJcbiAgICAgIH1cclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtYWNyby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICAgIGlmICh0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pID09PSAtMSkge1xyXG4gICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5wdXNoKG1hY3JvLmtleU5hbWVzW2pdKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5wdXNoKG1hY3JvKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5Mb2NhbGUucHJvdG90eXBlLl9jbGVhck1hY3JvcyA9IGZ1bmN0aW9uKCkge1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYXBwbGllZE1hY3Jvcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgdmFyIG1hY3JvID0gdGhpcy5fYXBwbGllZE1hY3Jvc1tpXTtcclxuICAgIGlmICghbWFjcm8ua2V5Q29tYm8uY2hlY2sodGhpcy5wcmVzc2VkS2V5cykpIHtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtYWNyby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihtYWNyby5rZXlOYW1lc1tqXSk7XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG1hY3JvLmhhbmRsZXIpIHtcclxuICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5fYXBwbGllZE1hY3Jvcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgIGkgLT0gMTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbGU7XHJcbiIsIlxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxvY2FsZSwgcGxhdGZvcm0sIHVzZXJBZ2VudCkge1xyXG5cclxuICAvLyBnZW5lcmFsXHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMsICAgWydjYW5jZWwnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDgsICAgWydiYWNrc3BhY2UnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDksICAgWyd0YWInXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyLCAgWydjbGVhciddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTMsICBbJ2VudGVyJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNiwgIFsnc2hpZnQnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE3LCAgWydjdHJsJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOCwgIFsnYWx0JywgJ21lbnUnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5LCAgWydwYXVzZScsICdicmVhayddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMjAsICBbJ2NhcHNsb2NrJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyNywgIFsnZXNjYXBlJywgJ2VzYyddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMzIsICBbJ3NwYWNlJywgJ3NwYWNlYmFyJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzMywgIFsncGFnZXVwJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNCwgIFsncGFnZWRvd24nXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM1LCAgWydlbmQnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM2LCAgWydob21lJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNywgIFsnbGVmdCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMzgsICBbJ3VwJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzOSwgIFsncmlnaHQnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQwLCAgWydkb3duJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MSwgIFsnc2VsZWN0J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MiwgIFsncHJpbnRzY3JlZW4nXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQzLCAgWydleGVjdXRlJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NCwgIFsnc25hcHNob3QnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ1LCAgWydpbnNlcnQnLCAnaW5zJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NiwgIFsnZGVsZXRlJywgJ2RlbCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoNDcsICBbJ2hlbHAnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE0NSwgWydzY3JvbGxsb2NrJywgJ3Njcm9sbCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTg4LCBbJ2NvbW1hJywgJywnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MCwgWydwZXJpb2QnLCAnLiddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTkxLCBbJ3NsYXNoJywgJ2ZvcndhcmRzbGFzaCcsICcvJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTIsIFsnZ3JhdmVhY2NlbnQnLCAnYCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMjE5LCBbJ29wZW5icmFja2V0JywgJ1snXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMCwgWydiYWNrc2xhc2gnLCAnXFxcXCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMjIxLCBbJ2Nsb3NlYnJhY2tldCcsICddJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjIsIFsnYXBvc3Ryb3BoZScsICdcXCcnXSk7XHJcblxyXG4gIC8vIDAtOVxyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OCwgWyd6ZXJvJywgJzAnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ5LCBbJ29uZScsICcxJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MCwgWyd0d28nLCAnMiddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoNTEsIFsndGhyZWUnLCAnMyddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoNTIsIFsnZm91cicsICc0J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1MywgWydmaXZlJywgJzUnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU0LCBbJ3NpeCcsICc2J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NSwgWydzZXZlbicsICc3J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NiwgWydlaWdodCcsICc4J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NywgWyduaW5lJywgJzknXSk7XHJcblxyXG4gIC8vIG51bXBhZFxyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NiwgWydudW16ZXJvJywgJ251bTAnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk3LCBbJ251bW9uZScsICdudW0xJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5OCwgWydudW10d28nLCAnbnVtMiddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoOTksIFsnbnVtdGhyZWUnLCAnbnVtMyddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTAwLCBbJ251bWZvdXInLCAnbnVtNCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTAxLCBbJ251bWZpdmUnLCAnbnVtNSddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTAyLCBbJ251bXNpeCcsICdudW02J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDMsIFsnbnVtc2V2ZW4nLCAnbnVtNyddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTA0LCBbJ251bWVpZ2h0JywgJ251bTgnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNSwgWydudW1uaW5lJywgJ251bTknXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNiwgWydudW1tdWx0aXBseScsICdudW0qJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDcsIFsnbnVtYWRkJywgJ251bSsnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOCwgWydudW1lbnRlciddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTA5LCBbJ251bXN1YnRyYWN0JywgJ251bS0nXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMCwgWydudW1kZWNpbWFsJywgJ251bS4nXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMSwgWydudW1kaXZpZGUnLCAnbnVtLyddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTQ0LCBbJ251bWxvY2snLCAnbnVtJ10pO1xyXG5cclxuICAvLyBmdW5jdGlvbiBrZXlzXHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMiwgWydmMSddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTEzLCBbJ2YyJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTQsIFsnZjMnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNSwgWydmNCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTE2LCBbJ2Y1J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTcsIFsnZjYnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExOCwgWydmNyddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTE5LCBbJ2Y4J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjAsIFsnZjknXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMSwgWydmMTAnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMiwgWydmMTEnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMywgWydmMTInXSk7XHJcblxyXG4gIC8vIHNlY29uZGFyeSBrZXkgc3ltYm9sc1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgYCcsIFsndGlsZGUnLCAnfiddKTtcclxuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDEnLCBbJ2V4Y2xhbWF0aW9uJywgJ2V4Y2xhbWF0aW9ucG9pbnQnLCAnISddKTtcclxuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDInLCBbJ2F0JywgJ0AnXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAzJywgWydudW1iZXInLCAnIyddKTtcclxuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDQnLCBbJ2RvbGxhcicsICdkb2xsYXJzJywgJ2RvbGxhcnNpZ24nLCAnJCddKTtcclxuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDUnLCBbJ3BlcmNlbnQnLCAnJSddKTtcclxuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDYnLCBbJ2NhcmV0JywgJ14nXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA3JywgWydhbXBlcnNhbmQnLCAnYW5kJywgJyYnXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA4JywgWydhc3RlcmlzaycsICcqJ10pO1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOScsIFsnb3BlbnBhcmVuJywgJygnXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAwJywgWydjbG9zZXBhcmVuJywgJyknXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAtJywgWyd1bmRlcnNjb3JlJywgJ18nXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA9JywgWydwbHVzJywgJysnXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBbJywgWydvcGVuY3VybHlicmFjZScsICdvcGVuY3VybHlicmFja2V0JywgJ3snXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBdJywgWydjbG9zZWN1cmx5YnJhY2UnLCAnY2xvc2VjdXJseWJyYWNrZXQnLCAnfSddKTtcclxuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFxcXFwnLCBbJ3ZlcnRpY2FsYmFyJywgJ3wnXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA7JywgWydjb2xvbicsICc6J10pO1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXFwnJywgWydxdW90YXRpb25tYXJrJywgJ1xcJyddKTtcclxuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArICEsJywgWydvcGVuYW5nbGVicmFja2V0JywgJzwnXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAuJywgWydjbG9zZWFuZ2xlYnJhY2tldCcsICc+J10pO1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLycsIFsncXVlc3Rpb25tYXJrJywgJz8nXSk7XHJcbiAgXHJcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSkge1xyXG4gICAgbG9jYWxlLmJpbmRNYWNybygnY29tbWFuZCcsIFsnbW9kJywgJ21vZGlmaWVyJ10pO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsb2NhbGUuYmluZE1hY3JvKCdjdHJsJywgWydtb2QnLCAnbW9kaWZpZXInXSk7XHJcbiAgfVxyXG5cclxuICAvL2EteiBhbmQgQS1aXHJcbiAgZm9yICh2YXIga2V5Q29kZSA9IDY1OyBrZXlDb2RlIDw9IDkwOyBrZXlDb2RlICs9IDEpIHtcclxuICAgIHZhciBrZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlICsgMzIpO1xyXG4gICAgdmFyIGNhcGl0YWxLZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlKTtcclxuICBcdGxvY2FsZS5iaW5kS2V5Q29kZShrZXlDb2RlLCBrZXlOYW1lKTtcclxuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcclxuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ2NhcHNsb2NrICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcclxuICB9XHJcblxyXG4gIC8vIGJyb3dzZXIgY2F2ZWF0c1xyXG4gIHZhciBzZW1pY29sb25LZXlDb2RlID0gdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykgPyA1OSAgOiAxODY7XHJcbiAgdmFyIGRhc2hLZXlDb2RlICAgICAgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDE3MyA6IDE4OTtcclxuICB2YXIgZXF1YWxLZXlDb2RlICAgICA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gNjEgIDogMTg3O1xyXG4gIHZhciBsZWZ0Q29tbWFuZEtleUNvZGU7XHJcbiAgdmFyIHJpZ2h0Q29tbWFuZEtleUNvZGU7XHJcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiAodXNlckFnZW50Lm1hdGNoKCdTYWZhcmknKSB8fCB1c2VyQWdlbnQubWF0Y2goJ0Nocm9tZScpKSkge1xyXG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDkxO1xyXG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDkzO1xyXG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdPcGVyYScpKSB7XHJcbiAgICBsZWZ0Q29tbWFuZEtleUNvZGUgID0gMTc7XHJcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gMTc7XHJcbiAgfSBlbHNlIGlmKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSkge1xyXG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDIyNDtcclxuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSAyMjQ7XHJcbiAgfVxyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZShzZW1pY29sb25LZXlDb2RlLCAgICBbJ3NlbWljb2xvbicsICc7J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZShkYXNoS2V5Q29kZSwgICAgICAgICBbJ2Rhc2gnLCAnLSddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoZXF1YWxLZXlDb2RlLCAgICAgICAgWydlcXVhbCcsICdlcXVhbHNpZ24nLCAnPSddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUobGVmdENvbW1hbmRLZXlDb2RlLCAgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ2xlZnRjb21tYW5kJywgJ2xlZnR3aW5kb3dzJywgJ2xlZnR3aW4nLCAnbGVmdHN1cGVyJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZShyaWdodENvbW1hbmRLZXlDb2RlLCBbJ2NvbW1hbmQnLCAnd2luZG93cycsICd3aW4nLCAnc3VwZXInLCAncmlnaHRjb21tYW5kJywgJ3JpZ2h0d2luZG93cycsICdyaWdodHdpbicsICdyaWdodHN1cGVyJ10pO1xyXG5cclxuICAvLyBraWxsIGtleXNcclxuICBsb2NhbGUuc2V0S2lsbEtleSgnY29tbWFuZCcpO1xyXG59O1xyXG4iXX0=
