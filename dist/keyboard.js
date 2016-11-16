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
      listener.preventRepeat = listener.preventRepeatByDefault;
      listener.releaseHandler.call(this, event);
      this._appliedListeners.splice(i, 1);
      i -= 1;
    }
  }
};

module.exports = Keyboard;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9rZXlib2FyZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJcbnZhciBMb2NhbGUgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIEtleUNvbWJvID0gcmVxdWlyZSgnLi9rZXktY29tYm8nKTtcblxuXG5mdW5jdGlvbiBLZXlib2FyZCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcbiAgdGhpcy5fbG9jYWxlICAgICAgICAgICAgICAgPSBudWxsO1xuICB0aGlzLl9jdXJyZW50Q29udGV4dCAgICAgICA9IG51bGw7XG4gIHRoaXMuX2NvbnRleHRzICAgICAgICAgICAgID0ge307XG4gIHRoaXMuX2xpc3RlbmVycyAgICAgICAgICAgID0gW107XG4gIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMgICAgID0gW107XG4gIHRoaXMuX2xvY2FsZXMgICAgICAgICAgICAgID0ge307XG4gIHRoaXMuX3RhcmdldEVsZW1lbnQgICAgICAgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0V2luZG93ICAgICAgICAgPSBudWxsO1xuICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgICAgICA9ICcnO1xuICB0aGlzLl90YXJnZXRVc2VyQWdlbnQgICAgICA9ICcnO1xuICB0aGlzLl9pc01vZGVybkJyb3dzZXIgICAgICA9IGZhbHNlO1xuICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IG51bGw7XG4gIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyAgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nICAgPSBudWxsO1xuICB0aGlzLl9wYXVzZWQgICAgICAgICAgICAgICA9IGZhbHNlO1xuXG4gIHRoaXMuc2V0Q29udGV4dCgnZ2xvYmFsJyk7XG4gIHRoaXMud2F0Y2godGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCBwbGF0Zm9ybSwgdXNlckFnZW50KTtcbn1cblxuS2V5Ym9hcmQucHJvdG90eXBlLnNldExvY2FsZSA9IGZ1bmN0aW9uKGxvY2FsZU5hbWUsIGxvY2FsZUJ1aWxkZXIpIHtcbiAgdmFyIGxvY2FsZSA9IG51bGw7XG4gIGlmICh0eXBlb2YgbG9jYWxlTmFtZSA9PT0gJ3N0cmluZycpIHtcblxuICAgIGlmIChsb2NhbGVCdWlsZGVyKSB7XG4gICAgICBsb2NhbGUgPSBuZXcgTG9jYWxlKGxvY2FsZU5hbWUpO1xuICAgICAgbG9jYWxlQnVpbGRlcihsb2NhbGUsIHRoaXMuX3RhcmdldFBsYXRmb3JtLCB0aGlzLl90YXJnZXRVc2VyQWdlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2NhbGUgPSB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdIHx8IG51bGw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxvY2FsZSAgICAgPSBsb2NhbGVOYW1lO1xuICAgIGxvY2FsZU5hbWUgPSBsb2NhbGUuX2xvY2FsZU5hbWU7XG4gIH1cblxuICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgID0gbG9jYWxlO1xuICB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdID0gbG9jYWxlO1xuICBpZiAobG9jYWxlKSB7XG4gICAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzID0gbG9jYWxlLnByZXNzZWRLZXlzO1xuICB9XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuZ2V0TG9jYWxlID0gZnVuY3Rpb24obG9jYWxOYW1lKSB7XG4gIGxvY2FsTmFtZSB8fCAobG9jYWxOYW1lID0gdGhpcy5fbG9jYWxlLmxvY2FsZU5hbWUpO1xuICByZXR1cm4gdGhpcy5fbG9jYWxlc1tsb2NhbE5hbWVdIHx8IG51bGw7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XG4gIGlmIChrZXlDb21ib1N0ciA9PT0gbnVsbCB8fCB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdmdW5jdGlvbicpIHtcbiAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0ID0gcmVsZWFzZUhhbmRsZXI7XG4gICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA9IHByZXNzSGFuZGxlcjtcbiAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgID0ga2V5Q29tYm9TdHI7XG4gICAga2V5Q29tYm9TdHIgICAgICAgICAgICA9IG51bGw7XG4gIH1cblxuICBpZiAoXG4gICAga2V5Q29tYm9TdHIgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcbiAgKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb21ib1N0ci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5fbGlzdGVuZXJzLnB1c2goe1xuICAgIGtleUNvbWJvICAgICAgICAgICAgICAgOiBrZXlDb21ib1N0ciA/IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0cikgOiBudWxsLFxuICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgOiBwcmVzc0hhbmRsZXIgICAgICAgICAgIHx8IG51bGwsXG4gICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA6IHJlbGVhc2VIYW5kbGVyICAgICAgICAgfHwgbnVsbCxcbiAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgIDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZSxcbiAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZVxuICB9KTtcbn07XG5LZXlib2FyZC5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBLZXlib2FyZC5wcm90b3R5cGUuYmluZDtcbktleWJvYXJkLnByb3RvdHlwZS5vbiAgICAgICAgICA9IEtleWJvYXJkLnByb3RvdHlwZS5iaW5kO1xuXG5LZXlib2FyZC5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcbiAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJlbGVhc2VIYW5kbGVyID0gcHJlc3NIYW5kbGVyO1xuICAgIHByZXNzSGFuZGxlciAgID0ga2V5Q29tYm9TdHI7XG4gICAga2V5Q29tYm9TdHIgPSBudWxsO1xuICB9XG5cbiAgaWYgKFxuICAgIGtleUNvbWJvU3RyICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXG4gICkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29tYm9TdHIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMudW5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lcnNbaV07XG5cbiAgICB2YXIgY29tYm9NYXRjaGVzICAgICAgICAgID0gIWtleUNvbWJvU3RyICYmICFsaXN0ZW5lci5rZXlDb21ibyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5rZXlDb21ibyAmJiBsaXN0ZW5lci5rZXlDb21iby5pc0VxdWFsKGtleUNvbWJvU3RyKTtcbiAgICB2YXIgcHJlc3NIYW5kbGVyTWF0Y2hlcyAgID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJlc3NIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXNzSGFuZGxlciA9PT0gbGlzdGVuZXIucHJlc3NIYW5kbGVyO1xuICAgIHZhciByZWxlYXNlSGFuZGxlck1hdGNoZXMgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcmVsZWFzZUhhbmRsZXIgJiYgIWxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGVhc2VIYW5kbGVyID09PSBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcjtcblxuICAgIGlmIChjb21ib01hdGNoZXMgJiYgcHJlc3NIYW5kbGVyTWF0Y2hlcyAmJiByZWxlYXNlSGFuZGxlck1hdGNoZXMpIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICBpIC09IDE7XG4gICAgfVxuICB9XG59O1xuS2V5Ym9hcmQucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZDtcbktleWJvYXJkLnByb3RvdHlwZS5vZmYgICAgICAgICAgICA9IEtleWJvYXJkLnByb3RvdHlwZS51bmJpbmQ7XG5cbktleWJvYXJkLnByb3RvdHlwZS5zZXRDb250ZXh0ID0gZnVuY3Rpb24oY29udGV4dE5hbWUpIHtcbiAgaWYodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxuXG4gIGlmICghdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdKSB7XG4gICAgdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdID0gW107XG4gIH1cbiAgdGhpcy5fbGlzdGVuZXJzICAgICAgPSB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV07XG4gIHRoaXMuX2N1cnJlbnRDb250ZXh0ID0gY29udGV4dE5hbWU7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fY3VycmVudENvbnRleHQ7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUud2l0aENvbnRleHQgPSBmdW5jdGlvbihjb250ZXh0TmFtZSwgY2FsbGJhY2spIHtcbiAgdmFyIHByZXZpb3VzQ29udGV4dE5hbWUgPSB0aGlzLmdldENvbnRleHQoKTtcbiAgdGhpcy5zZXRDb250ZXh0KGNvbnRleHROYW1lKTtcblxuICBjYWxsYmFjaygpO1xuXG4gIHRoaXMuc2V0Q29udGV4dChwcmV2aW91c0NvbnRleHROYW1lKTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS53YXRjaCA9IGZ1bmN0aW9uKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgdGFyZ2V0UGxhdGZvcm0sIHRhcmdldFVzZXJBZ2VudCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHRoaXMuc3RvcCgpO1xuXG4gIGlmICghdGFyZ2V0V2luZG93KSB7XG4gICAgaWYgKCFnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lciAmJiAhZ2xvYmFsLmF0dGFjaEV2ZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGdsb2JhbCBmdW5jdGlvbnMgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudC4nKTtcbiAgICB9XG4gICAgdGFyZ2V0V2luZG93ID0gZ2xvYmFsO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB0YXJnZXRXaW5kb3cubm9kZVR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgdGFyZ2V0VXNlckFnZW50ID0gdGFyZ2V0UGxhdGZvcm07XG4gICAgdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0RWxlbWVudDtcbiAgICB0YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRXaW5kb3c7XG4gICAgdGFyZ2V0V2luZG93ICAgID0gZ2xvYmFsO1xuICB9XG5cbiAgaWYgKCF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAmJiAhdGFyZ2V0V2luZG93LmF0dGFjaEV2ZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50IG1ldGhvZHMgb24gdGFyZ2V0V2luZG93LicpO1xuICB9XG5cbiAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyID0gISF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcblxuICB2YXIgdXNlckFnZW50ID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcbiAgdmFyIHBsYXRmb3JtICA9IHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IgJiYgdGFyZ2V0V2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSAgfHwgJyc7XG5cbiAgdGFyZ2V0RWxlbWVudCAgICYmIHRhcmdldEVsZW1lbnQgICAhPT0gbnVsbCB8fCAodGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93LmRvY3VtZW50KTtcbiAgdGFyZ2V0UGxhdGZvcm0gICYmIHRhcmdldFBsYXRmb3JtICAhPT0gbnVsbCB8fCAodGFyZ2V0UGxhdGZvcm0gID0gcGxhdGZvcm0pO1xuICB0YXJnZXRVc2VyQWdlbnQgJiYgdGFyZ2V0VXNlckFnZW50ICE9PSBudWxsIHx8ICh0YXJnZXRVc2VyQWdlbnQgPSB1c2VyQWdlbnQpO1xuXG4gIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5wcmVzc0tleShldmVudC5rZXlDb2RlLCBldmVudCk7XG4gIH07XG4gIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgX3RoaXMucmVsZWFzZUtleShldmVudC5rZXlDb2RlLCBldmVudCk7XG4gIH07XG4gIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgX3RoaXMucmVsZWFzZUFsbEtleXMoZXZlbnQpXG4gIH07XG5cbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsICdrZXlkb3duJywgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcpO1xuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0V2luZG93LCAgJ2JsdXInLCAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuXG4gIHRoaXMuX3RhcmdldEVsZW1lbnQgICA9IHRhcmdldEVsZW1lbnQ7XG4gIHRoaXMuX3RhcmdldFdpbmRvdyAgICA9IHRhcmdldFdpbmRvdztcbiAgdGhpcy5fdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0UGxhdGZvcm07XG4gIHRoaXMuX3RhcmdldFVzZXJBZ2VudCA9IHRhcmdldFVzZXJBZ2VudDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgaWYgKCF0aGlzLl90YXJnZXRFbGVtZW50IHx8ICF0aGlzLl90YXJnZXRXaW5kb3cpIHsgcmV0dXJuOyB9XG5cbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG5cbiAgdGhpcy5fdGFyZ2V0V2luZG93ICA9IG51bGw7XG4gIHRoaXMuX3RhcmdldEVsZW1lbnQgPSBudWxsO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnByZXNzS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSwgZXZlbnQpIHtcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgdGhpcy5fbG9jYWxlLnByZXNzS2V5KGtleUNvZGUpO1xuICB0aGlzLl9hcHBseUJpbmRpbmdzKGV2ZW50KTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5yZWxlYXNlS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSwgZXZlbnQpIHtcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgdGhpcy5fbG9jYWxlLnJlbGVhc2VLZXkoa2V5Q29kZSk7XG4gIHRoaXMuX2NsZWFyQmluZGluZ3MoZXZlbnQpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnJlbGVhc2VBbGxLZXlzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XG5cbiAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLmxlbmd0aCA9IDA7XG4gIHRoaXMuX2NsZWFyQmluZGluZ3MoZXZlbnQpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XG4gIGlmICh0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XG4gIHRoaXMuX3BhdXNlZCA9IHRydWU7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVzdW1lID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucmVsZWFzZUFsbEtleXMoKTtcbiAgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2JpbmRFdmVudCA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuICByZXR1cm4gdGhpcy5faXNNb2Rlcm5Ccm93c2VyID9cbiAgICB0YXJnZXRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxuICAgIHRhcmdldEVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgaGFuZGxlcik7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX3VuYmluZEV2ZW50ID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xuICAgIHRhcmdldEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XG4gICAgdGFyZ2V0RWxlbWVudC5kZXRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fZ2V0R3JvdXBlZExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGlzdGVuZXJHcm91cHMgICA9IFtdO1xuICB2YXIgbGlzdGVuZXJHcm91cE1hcCA9IFtdO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gIGlmICh0aGlzLl9jdXJyZW50Q29udGV4dCAhPT0gJ2dsb2JhbCcpIHtcbiAgICBsaXN0ZW5lcnMgPSBbXS5jb25jYXQobGlzdGVuZXJzLCB0aGlzLl9jb250ZXh0cy5nbG9iYWwpO1xuICB9XG5cbiAgbGlzdGVuZXJzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiAoYi5rZXlDb21ibyA/IGIua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMCkgLSAoYS5rZXlDb21ibyA/IGEua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDogMCk7XG4gIH0pLmZvckVhY2goZnVuY3Rpb24obCkge1xuICAgIHZhciBtYXBJbmRleCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgaWYgKGxpc3RlbmVyR3JvdXBNYXBbaV0gPT09IG51bGwgJiYgbC5rZXlDb21ibyA9PT0gbnVsbCB8fFxuICAgICAgICAgIGxpc3RlbmVyR3JvdXBNYXBbaV0gIT09IG51bGwgJiYgbGlzdGVuZXJHcm91cE1hcFtpXS5pc0VxdWFsKGwua2V5Q29tYm8pKSB7XG4gICAgICAgIG1hcEluZGV4ID0gaTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1hcEluZGV4ID09PSAtMSkge1xuICAgICAgbWFwSW5kZXggPSBsaXN0ZW5lckdyb3VwTWFwLmxlbmd0aDtcbiAgICAgIGxpc3RlbmVyR3JvdXBNYXAucHVzaChsLmtleUNvbWJvKTtcbiAgICB9XG4gICAgaWYgKCFsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0pIHtcbiAgICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSA9IFtdO1xuICAgIH1cbiAgICBsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0ucHVzaChsKTtcbiAgfSk7XG4gIHJldHVybiBsaXN0ZW5lckdyb3Vwcztcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fYXBwbHlCaW5kaW5ncyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIHZhciBwcmV2ZW50UmVwZWF0ID0gZmFsc2U7XG5cbiAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xuICBldmVudC5wcmV2ZW50UmVwZWF0ID0gZnVuY3Rpb24oKSB7IHByZXZlbnRSZXBlYXQgPSB0cnVlOyB9O1xuICBldmVudC5wcmVzc2VkS2V5cyAgID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xuXG4gIHZhciBwcmVzc2VkS2V5cyAgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcbiAgdmFyIGxpc3RlbmVyR3JvdXBzID0gdGhpcy5fZ2V0R3JvdXBlZExpc3RlbmVycygpO1xuXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lckdyb3Vwcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBsaXN0ZW5lcnMgPSBsaXN0ZW5lckdyb3Vwc1tpXTtcbiAgICB2YXIga2V5Q29tYm8gID0gbGlzdGVuZXJzWzBdLmtleUNvbWJvO1xuXG4gICAgaWYgKGtleUNvbWJvID09PSBudWxsIHx8IGtleUNvbWJvLmNoZWNrKHByZXNzZWRLZXlzKSkge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBsaXN0ZW5lcnMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2pdO1xuXG4gICAgICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCkge1xuICAgICAgICAgIGxpc3RlbmVyID0ge1xuICAgICAgICAgICAga2V5Q29tYm8gICAgICAgICAgICAgICA6IG5ldyBLZXlDb21ibyhwcmVzc2VkS2V5cy5qb2luKCcrJykpLFxuICAgICAgICAgICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA6IGxpc3RlbmVyLnByZXNzSGFuZGxlcixcbiAgICAgICAgICAgIHJlbGVhc2VIYW5kbGVyICAgICAgICAgOiBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcixcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgOiBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0LFxuICAgICAgICAgICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA6IGxpc3RlbmVyLnByZXZlbnRSZXBlYXRCeURlZmF1bHRcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3RlbmVyLnByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJldmVudFJlcGVhdCkge1xuICAgICAgICAgIGxpc3RlbmVyLnByZXNzSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICBpZiAocHJldmVudFJlcGVhdCkge1xuICAgICAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IHByZXZlbnRSZXBlYXQ7XG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyICYmIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcikgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoa2V5Q29tYm8pIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBrZXlDb21iby5rZXlOYW1lcy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgIHZhciBpbmRleCA9IHByZXNzZWRLZXlzLmluZGV4T2Yoa2V5Q29tYm8ua2V5TmFtZXNbal0pO1xuICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIHByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICBqIC09IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUuX2NsZWFyQmluZGluZ3MgPSBmdW5jdGlvbihldmVudCkge1xuICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIGxpc3RlbmVyID0gdGhpcy5fYXBwbGllZExpc3RlbmVyc1tpXTtcbiAgICB2YXIga2V5Q29tYm8gPSBsaXN0ZW5lci5rZXlDb21ibztcbiAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwgIWtleUNvbWJvLmNoZWNrKHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cykpIHtcbiAgICAgIGxpc3RlbmVyLnByZXZlbnRSZXBlYXQgPSBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0QnlEZWZhdWx0O1xuICAgICAgbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgIGkgLT0gMTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gS2V5Ym9hcmQ7XG4iXX0=
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
  var semicolonKeyCode = userAgent.match('Firefox') ? 59  : 186;
  var dashKeyCode      = userAgent.match('Firefox') ? 173 : 189;
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
  locale.bindKeyCode(leftCommandKeyCode,  ['command', 'windows', 'win', 'super', 'leftcommand', 'leftwindows', 'leftwin', 'leftsuper']);
  locale.bindKeyCode(rightCommandKeyCode, ['command', 'windows', 'win', 'super', 'rightcommand', 'rightwindows', 'rightwin', 'rightsuper']);

  // kill keys
  locale.setKillKey('command');
};

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9rZXktY29tYm8uanMiLCJsaWIva2V5Ym9hcmQuanMiLCJsaWIvbG9jYWxlLmpzIiwibG9jYWxlcy91cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG52YXIgS2V5Ym9hcmQgPSByZXF1aXJlKCcuL2xpYi9rZXlib2FyZCcpO1xudmFyIExvY2FsZSAgID0gcmVxdWlyZSgnLi9saWIvbG9jYWxlJyk7XG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2xpYi9rZXktY29tYm8nKTtcblxudmFyIGtleWJvYXJkID0gbmV3IEtleWJvYXJkKCk7XG5cbmtleWJvYXJkLnNldExvY2FsZSgndXMnLCByZXF1aXJlKCcuL2xvY2FsZXMvdXMnKSk7XG5cbmV4cG9ydHMgICAgICAgICAgPSBtb2R1bGUuZXhwb3J0cyA9IGtleWJvYXJkO1xuZXhwb3J0cy5LZXlib2FyZCA9IEtleWJvYXJkO1xuZXhwb3J0cy5Mb2NhbGUgICA9IExvY2FsZTtcbmV4cG9ydHMuS2V5Q29tYm8gPSBLZXlDb21ibztcbiIsIlxuZnVuY3Rpb24gS2V5Q29tYm8oa2V5Q29tYm9TdHIpIHtcbiAgdGhpcy5zb3VyY2VTdHIgPSBrZXlDb21ib1N0cjtcbiAgdGhpcy5zdWJDb21ib3MgPSBLZXlDb21iby5wYXJzZUNvbWJvU3RyKGtleUNvbWJvU3RyKTtcbiAgdGhpcy5rZXlOYW1lcyAgPSB0aGlzLnN1YkNvbWJvcy5yZWR1Y2UoZnVuY3Rpb24obWVtbywgbmV4dFN1YkNvbWJvKSB7XG4gICAgcmV0dXJuIG1lbW8uY29uY2F0KG5leHRTdWJDb21ibyk7XG4gIH0sIFtdKTtcbn1cblxuLy8gVE9ETzogQWRkIHN1cHBvcnQgZm9yIGtleSBjb21ibyBzZXF1ZW5jZXNcbktleUNvbWJvLnNlcXVlbmNlRGVsaW1pbmF0b3IgPSAnPj4nO1xuS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvciAgICA9ICc+JztcbktleUNvbWJvLmtleURlbGltaW5hdG9yICAgICAgPSAnKyc7XG5cbktleUNvbWJvLnBhcnNlQ29tYm9TdHIgPSBmdW5jdGlvbihrZXlDb21ib1N0cikge1xuICB2YXIgc3ViQ29tYm9TdHJzID0gS2V5Q29tYm8uX3NwbGl0U3RyKGtleUNvbWJvU3RyLCBLZXlDb21iby5jb21ib0RlbGltaW5hdG9yKTtcbiAgdmFyIGNvbWJvICAgICAgICA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwIDsgaSA8IHN1YkNvbWJvU3Rycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGNvbWJvLnB1c2goS2V5Q29tYm8uX3NwbGl0U3RyKHN1YkNvbWJvU3Ryc1tpXSwgS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IpKTtcbiAgfVxuICByZXR1cm4gY29tYm87XG59O1xuXG5LZXlDb21iby5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbihwcmVzc2VkS2V5TmFtZXMpIHtcbiAgdmFyIHN0YXJ0aW5nS2V5TmFtZUluZGV4ID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHN0YXJ0aW5nS2V5TmFtZUluZGV4ID0gdGhpcy5fY2hlY2tTdWJDb21ibyhcbiAgICAgIHRoaXMuc3ViQ29tYm9zW2ldLFxuICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXgsXG4gICAgICBwcmVzc2VkS2V5TmFtZXNcbiAgICApO1xuICAgIGlmIChzdGFydGluZ0tleU5hbWVJbmRleCA9PT0gLTEpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5LZXlDb21iby5wcm90b3R5cGUuaXNFcXVhbCA9IGZ1bmN0aW9uKG90aGVyS2V5Q29tYm8pIHtcbiAgaWYgKFxuICAgICFvdGhlcktleUNvbWJvIHx8XG4gICAgdHlwZW9mIG90aGVyS2V5Q29tYm8gIT09ICdzdHJpbmcnICYmXG4gICAgdHlwZW9mIG90aGVyS2V5Q29tYm8gIT09ICdvYmplY3QnXG4gICkgeyByZXR1cm4gZmFsc2U7IH1cblxuICBpZiAodHlwZW9mIG90aGVyS2V5Q29tYm8gPT09ICdzdHJpbmcnKSB7XG4gICAgb3RoZXJLZXlDb21ibyA9IG5ldyBLZXlDb21ibyhvdGhlcktleUNvbWJvKTtcbiAgfVxuXG4gIGlmICh0aGlzLnN1YkNvbWJvcy5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViQ29tYm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKHRoaXMuc3ViQ29tYm9zW2ldLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3NbaV0ubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBzdWJDb21ibyAgICAgID0gdGhpcy5zdWJDb21ib3NbaV07XG4gICAgdmFyIG90aGVyU3ViQ29tYm8gPSBvdGhlcktleUNvbWJvLnN1YkNvbWJvc1tpXS5zbGljZSgwKTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ViQ29tYm8ubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgIHZhciBrZXlOYW1lID0gc3ViQ29tYm9bal07XG4gICAgICB2YXIgaW5kZXggICA9IG90aGVyU3ViQ29tYm8uaW5kZXhPZihrZXlOYW1lKTtcblxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgb3RoZXJTdWJDb21iby5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAob3RoZXJTdWJDb21iby5sZW5ndGggIT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbktleUNvbWJvLl9zcGxpdFN0ciA9IGZ1bmN0aW9uKHN0ciwgZGVsaW1pbmF0b3IpIHtcbiAgdmFyIHMgID0gc3RyO1xuICB2YXIgZCAgPSBkZWxpbWluYXRvcjtcbiAgdmFyIGMgID0gJyc7XG4gIHZhciBjYSA9IFtdO1xuXG4gIGZvciAodmFyIGNpID0gMDsgY2kgPCBzLmxlbmd0aDsgY2kgKz0gMSkge1xuICAgIGlmIChjaSA+IDAgJiYgc1tjaV0gPT09IGQgJiYgc1tjaSAtIDFdICE9PSAnXFxcXCcpIHtcbiAgICAgIGNhLnB1c2goYy50cmltKCkpO1xuICAgICAgYyA9ICcnO1xuICAgICAgY2kgKz0gMTtcbiAgICB9XG4gICAgYyArPSBzW2NpXTtcbiAgfVxuICBpZiAoYykgeyBjYS5wdXNoKGMudHJpbSgpKTsgfVxuXG4gIHJldHVybiBjYTtcbn07XG5cbktleUNvbWJvLnByb3RvdHlwZS5fY2hlY2tTdWJDb21ibyA9IGZ1bmN0aW9uKHN1YkNvbWJvLCBzdGFydGluZ0tleU5hbWVJbmRleCwgcHJlc3NlZEtleU5hbWVzKSB7XG4gIHN1YkNvbWJvID0gc3ViQ29tYm8uc2xpY2UoMCk7XG4gIHByZXNzZWRLZXlOYW1lcyA9IHByZXNzZWRLZXlOYW1lcy5zbGljZShzdGFydGluZ0tleU5hbWVJbmRleCk7XG5cbiAgdmFyIGVuZEluZGV4ID0gc3RhcnRpbmdLZXlOYW1lSW5kZXg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3ViQ29tYm8ubGVuZ3RoOyBpICs9IDEpIHtcblxuICAgIHZhciBrZXlOYW1lID0gc3ViQ29tYm9baV07XG4gICAgaWYgKGtleU5hbWVbMF0gPT09ICdcXFxcJykge1xuICAgICAgdmFyIGVzY2FwZWRLZXlOYW1lID0ga2V5TmFtZS5zbGljZSgxKTtcbiAgICAgIGlmIChcbiAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgfHxcbiAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmtleURlbGltaW5hdG9yXG4gICAgICApIHtcbiAgICAgICAga2V5TmFtZSA9IGVzY2FwZWRLZXlOYW1lO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBpbmRleCA9IHByZXNzZWRLZXlOYW1lcy5pbmRleE9mKGtleU5hbWUpO1xuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICBzdWJDb21iby5zcGxpY2UoaSwgMSk7XG4gICAgICBpIC09IDE7XG4gICAgICBpZiAoaW5kZXggPiBlbmRJbmRleCkge1xuICAgICAgICBlbmRJbmRleCA9IGluZGV4O1xuICAgICAgfVxuICAgICAgaWYgKHN1YkNvbWJvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZW5kSW5kZXg7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBLZXlDb21ibztcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcblxudmFyIExvY2FsZSA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2tleS1jb21ibycpO1xuXG5cbmZ1bmN0aW9uIEtleWJvYXJkKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgcGxhdGZvcm0sIHVzZXJBZ2VudCkge1xuICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgICA9IG51bGw7XG4gIHRoaXMuX2N1cnJlbnRDb250ZXh0ICAgICAgID0gbnVsbDtcbiAgdGhpcy5fY29udGV4dHMgICAgICAgICAgICAgPSB7fTtcbiAgdGhpcy5fbGlzdGVuZXJzICAgICAgICAgICAgPSBbXTtcbiAgdGhpcy5fYXBwbGllZExpc3RlbmVycyAgICAgPSBbXTtcbiAgdGhpcy5fbG9jYWxlcyAgICAgICAgICAgICAgPSB7fTtcbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgICAgICAgPSBudWxsO1xuICB0aGlzLl90YXJnZXRXaW5kb3cgICAgICAgICA9IG51bGw7XG4gIHRoaXMuX3RhcmdldFBsYXRmb3JtICAgICAgID0gJyc7XG4gIHRoaXMuX3RhcmdldFVzZXJBZ2VudCAgICAgID0gJyc7XG4gIHRoaXMuX2lzTW9kZXJuQnJvd3NlciAgICAgID0gZmFsc2U7XG4gIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nICAgPSBudWxsO1xuICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcgICA9IG51bGw7XG4gIHRoaXMuX3BhdXNlZCAgICAgICAgICAgICAgID0gZmFsc2U7XG5cbiAgdGhpcy5zZXRDb250ZXh0KCdnbG9iYWwnKTtcbiAgdGhpcy53YXRjaCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpO1xufVxuXG5LZXlib2FyZC5wcm90b3R5cGUuc2V0TG9jYWxlID0gZnVuY3Rpb24obG9jYWxlTmFtZSwgbG9jYWxlQnVpbGRlcikge1xuICB2YXIgbG9jYWxlID0gbnVsbDtcbiAgaWYgKHR5cGVvZiBsb2NhbGVOYW1lID09PSAnc3RyaW5nJykge1xuXG4gICAgaWYgKGxvY2FsZUJ1aWxkZXIpIHtcbiAgICAgIGxvY2FsZSA9IG5ldyBMb2NhbGUobG9jYWxlTmFtZSk7XG4gICAgICBsb2NhbGVCdWlsZGVyKGxvY2FsZSwgdGhpcy5fdGFyZ2V0UGxhdGZvcm0sIHRoaXMuX3RhcmdldFVzZXJBZ2VudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsZSA9IHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gfHwgbnVsbDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbG9jYWxlICAgICA9IGxvY2FsZU5hbWU7XG4gICAgbG9jYWxlTmFtZSA9IGxvY2FsZS5fbG9jYWxlTmFtZTtcbiAgfVxuXG4gIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgPSBsb2NhbGU7XG4gIHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gPSBsb2NhbGU7XG4gIGlmIChsb2NhbGUpIHtcbiAgICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMgPSBsb2NhbGUucHJlc3NlZEtleXM7XG4gIH1cbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5nZXRMb2NhbGUgPSBmdW5jdGlvbihsb2NhbE5hbWUpIHtcbiAgbG9jYWxOYW1lIHx8IChsb2NhbE5hbWUgPSB0aGlzLl9sb2NhbGUubG9jYWxlTmFtZSk7XG4gIHJldHVybiB0aGlzLl9sb2NhbGVzW2xvY2FsTmFtZV0gfHwgbnVsbDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcbiAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgPSByZWxlYXNlSGFuZGxlcjtcbiAgICByZWxlYXNlSGFuZGxlciAgICAgICAgID0gcHJlc3NIYW5kbGVyO1xuICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgPSBrZXlDb21ib1N0cjtcbiAgICBrZXlDb21ib1N0ciAgICAgICAgICAgID0gbnVsbDtcbiAgfVxuXG4gIGlmIChcbiAgICBrZXlDb21ib1N0ciAmJlxuICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIubGVuZ3RoID09PSAnbnVtYmVyJ1xuICApIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLl9saXN0ZW5lcnMucHVzaCh7XG4gICAga2V5Q29tYm8gICAgICAgICAgICAgICA6IGtleUNvbWJvU3RyID8gbmV3IEtleUNvbWJvKGtleUNvbWJvU3RyKSA6IG51bGwsXG4gICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA6IHByZXNzSGFuZGxlciAgICAgICAgICAgfHwgbnVsbCxcbiAgICByZWxlYXNlSGFuZGxlciAgICAgICAgIDogcmVsZWFzZUhhbmRsZXIgICAgICAgICB8fCBudWxsLFxuICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgOiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlLFxuICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgOiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlXG4gIH0pO1xufTtcbktleWJvYXJkLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEtleWJvYXJkLnByb3RvdHlwZS5iaW5kO1xuS2V5Ym9hcmQucHJvdG90eXBlLm9uICAgICAgICAgID0gS2V5Ym9hcmQucHJvdG90eXBlLmJpbmQ7XG5cbktleWJvYXJkLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcikge1xuICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmVsZWFzZUhhbmRsZXIgPSBwcmVzc0hhbmRsZXI7XG4gICAgcHJlc3NIYW5kbGVyICAgPSBrZXlDb21ib1N0cjtcbiAgICBrZXlDb21ib1N0ciA9IG51bGw7XG4gIH1cblxuICBpZiAoXG4gICAga2V5Q29tYm9TdHIgJiZcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcbiAgKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb21ib1N0ci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy51bmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xpc3RlbmVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tpXTtcblxuICAgIHZhciBjb21ib01hdGNoZXMgICAgICAgICAgPSAha2V5Q29tYm9TdHIgJiYgIWxpc3RlbmVyLmtleUNvbWJvIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmtleUNvbWJvICYmIGxpc3RlbmVyLmtleUNvbWJvLmlzRXF1YWwoa2V5Q29tYm9TdHIpO1xuICAgIHZhciBwcmVzc0hhbmRsZXJNYXRjaGVzICAgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmVzc0hhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlc3NIYW5kbGVyID09PSBsaXN0ZW5lci5wcmVzc0hhbmRsZXI7XG4gICAgdmFyIHJlbGVhc2VIYW5kbGVyTWF0Y2hlcyA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFyZWxlYXNlSGFuZGxlciAmJiAhbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsZWFzZUhhbmRsZXIgPT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyO1xuXG4gICAgaWYgKGNvbWJvTWF0Y2hlcyAmJiBwcmVzc0hhbmRsZXJNYXRjaGVzICYmIHJlbGVhc2VIYW5kbGVyTWF0Y2hlcykge1xuICAgICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgIGkgLT0gMTtcbiAgICB9XG4gIH1cbn07XG5LZXlib2FyZC5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBLZXlib2FyZC5wcm90b3R5cGUudW5iaW5kO1xuS2V5Ym9hcmQucHJvdG90eXBlLm9mZiAgICAgICAgICAgID0gS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZDtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnNldENvbnRleHQgPSBmdW5jdGlvbihjb250ZXh0TmFtZSkge1xuICBpZih0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XG5cbiAgaWYgKCF0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0pIHtcbiAgICB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0gPSBbXTtcbiAgfVxuICB0aGlzLl9saXN0ZW5lcnMgICAgICA9IHRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXTtcbiAgdGhpcy5fY3VycmVudENvbnRleHQgPSBjb250ZXh0TmFtZTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9jdXJyZW50Q29udGV4dDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS53aXRoQ29udGV4dCA9IGZ1bmN0aW9uKGNvbnRleHROYW1lLCBjYWxsYmFjaykge1xuICB2YXIgcHJldmlvdXNDb250ZXh0TmFtZSA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuICB0aGlzLnNldENvbnRleHQoY29udGV4dE5hbWUpO1xuXG4gIGNhbGxiYWNrKCk7XG5cbiAgdGhpcy5zZXRDb250ZXh0KHByZXZpb3VzQ29udGV4dE5hbWUpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24odGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCB0YXJnZXRQbGF0Zm9ybSwgdGFyZ2V0VXNlckFnZW50KSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdGhpcy5zdG9wKCk7XG5cbiAgaWYgKCF0YXJnZXRXaW5kb3cpIHtcbiAgICBpZiAoIWdsb2JhbC5hZGRFdmVudExpc3RlbmVyICYmICFnbG9iYWwuYXR0YWNoRXZlbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgZ2xvYmFsIGZ1bmN0aW9ucyBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50LicpO1xuICAgIH1cbiAgICB0YXJnZXRXaW5kb3cgPSBnbG9iYWw7XG4gIH1cblxuICBpZiAodHlwZW9mIHRhcmdldFdpbmRvdy5ub2RlVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICB0YXJnZXRVc2VyQWdlbnQgPSB0YXJnZXRQbGF0Zm9ybTtcbiAgICB0YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRFbGVtZW50O1xuICAgIHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdztcbiAgICB0YXJnZXRXaW5kb3cgICAgPSBnbG9iYWw7XG4gIH1cblxuICBpZiAoIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyICYmICF0YXJnZXRXaW5kb3cuYXR0YWNoRXZlbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQgbWV0aG9kcyBvbiB0YXJnZXRXaW5kb3cuJyk7XG4gIH1cblxuICB0aGlzLl9pc01vZGVybkJyb3dzZXIgPSAhIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xuXG4gIHZhciB1c2VyQWdlbnQgPSB0YXJnZXRXaW5kb3cubmF2aWdhdG9yICYmIHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50IHx8ICcnO1xuICB2YXIgcGxhdGZvcm0gID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtICB8fCAnJztcblxuICB0YXJnZXRFbGVtZW50ICAgJiYgdGFyZ2V0RWxlbWVudCAgICE9PSBudWxsIHx8ICh0YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRXaW5kb3cuZG9jdW1lbnQpO1xuICB0YXJnZXRQbGF0Zm9ybSAgJiYgdGFyZ2V0UGxhdGZvcm0gICE9PSBudWxsIHx8ICh0YXJnZXRQbGF0Zm9ybSAgPSBwbGF0Zm9ybSk7XG4gIHRhcmdldFVzZXJBZ2VudCAmJiB0YXJnZXRVc2VyQWdlbnQgIT09IG51bGwgfHwgKHRhcmdldFVzZXJBZ2VudCA9IHVzZXJBZ2VudCk7XG5cbiAgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xuICAgIF90aGlzLnByZXNzS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgfTtcbiAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5yZWxlYXNlS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcbiAgfTtcbiAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBfdGhpcy5yZWxlYXNlQWxsS2V5cyhldmVudClcbiAgfTtcblxuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5dXAnLCAgIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyk7XG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG5cbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0RWxlbWVudDtcbiAgdGhpcy5fdGFyZ2V0V2luZG93ICAgID0gdGFyZ2V0V2luZG93O1xuICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRQbGF0Zm9ybTtcbiAgdGhpcy5fdGFyZ2V0VXNlckFnZW50ID0gdGFyZ2V0VXNlckFnZW50O1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICBpZiAoIXRoaXMuX3RhcmdldEVsZW1lbnQgfHwgIXRoaXMuX3RhcmdldFdpbmRvdykgeyByZXR1cm47IH1cblxuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcblxuICB0aGlzLl90YXJnZXRXaW5kb3cgID0gbnVsbDtcbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCA9IG51bGw7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucHJlc3NLZXkgPSBmdW5jdGlvbihrZXlDb2RlLCBldmVudCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICB0aGlzLl9sb2NhbGUucHJlc3NLZXkoa2V5Q29kZSk7XG4gIHRoaXMuX2FwcGx5QmluZGluZ3MoZXZlbnQpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLnJlbGVhc2VLZXkgPSBmdW5jdGlvbihrZXlDb2RlLCBldmVudCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICB0aGlzLl9sb2NhbGUucmVsZWFzZUtleShrZXlDb2RlKTtcbiAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVsZWFzZUFsbEtleXMgPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cblxuICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcbiAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cbiAgaWYgKHRoaXMuX2xvY2FsZSkgeyB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7IH1cbiAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG59O1xuXG5LZXlib2FyZC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yZWxlYXNlQWxsS2V5cygpO1xuICB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoID0gMDtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fYmluZEV2ZW50ID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xuICAgIHRhcmdldEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XG4gICAgdGFyZ2V0RWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fdW5iaW5kRXZlbnQgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XG4gICAgdGFyZ2V0RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcbiAgICB0YXJnZXRFbGVtZW50LmRldGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9nZXRHcm91cGVkTGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsaXN0ZW5lckdyb3VwcyAgID0gW107XG4gIHZhciBsaXN0ZW5lckdyb3VwTWFwID0gW107XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcbiAgaWYgKHRoaXMuX2N1cnJlbnRDb250ZXh0ICE9PSAnZ2xvYmFsJykge1xuICAgIGxpc3RlbmVycyA9IFtdLmNvbmNhdChsaXN0ZW5lcnMsIHRoaXMuX2NvbnRleHRzLmdsb2JhbCk7XG4gIH1cblxuICBsaXN0ZW5lcnMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIChiLmtleUNvbWJvID8gYi5rZXlDb21iby5rZXlOYW1lcy5sZW5ndGggOiAwKSAtIChhLmtleUNvbWJvID8gYS5rZXlDb21iby5rZXlOYW1lcy5sZW5ndGggOiAwKTtcbiAgfSkuZm9yRWFjaChmdW5jdGlvbihsKSB7XG4gICAgdmFyIG1hcEluZGV4ID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lckdyb3VwTWFwLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBpZiAobGlzdGVuZXJHcm91cE1hcFtpXSA9PT0gbnVsbCAmJiBsLmtleUNvbWJvID09PSBudWxsIHx8XG4gICAgICAgICAgbGlzdGVuZXJHcm91cE1hcFtpXSAhPT0gbnVsbCAmJiBsaXN0ZW5lckdyb3VwTWFwW2ldLmlzRXF1YWwobC5rZXlDb21ibykpIHtcbiAgICAgICAgbWFwSW5kZXggPSBpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobWFwSW5kZXggPT09IC0xKSB7XG4gICAgICBtYXBJbmRleCA9IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoO1xuICAgICAgbGlzdGVuZXJHcm91cE1hcC5wdXNoKGwua2V5Q29tYm8pO1xuICAgIH1cbiAgICBpZiAoIWxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSkge1xuICAgICAgbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdID0gW107XG4gICAgfVxuICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XS5wdXNoKGwpO1xuICB9KTtcbiAgcmV0dXJuIGxpc3RlbmVyR3JvdXBzO1xufTtcblxuS2V5Ym9hcmQucHJvdG90eXBlLl9hcHBseUJpbmRpbmdzID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgdmFyIHByZXZlbnRSZXBlYXQgPSBmYWxzZTtcblxuICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XG4gIGV2ZW50LnByZXZlbnRSZXBlYXQgPSBmdW5jdGlvbigpIHsgcHJldmVudFJlcGVhdCA9IHRydWU7IH07XG4gIGV2ZW50LnByZXNzZWRLZXlzICAgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XG5cbiAgdmFyIHByZXNzZWRLZXlzICAgID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xuICB2YXIgbGlzdGVuZXJHcm91cHMgPSB0aGlzLl9nZXRHcm91cGVkTGlzdGVuZXJzKCk7XG5cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVyR3JvdXBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgdmFyIGxpc3RlbmVycyA9IGxpc3RlbmVyR3JvdXBzW2ldO1xuICAgIHZhciBrZXlDb21ibyAgPSBsaXN0ZW5lcnNbMF0ua2V5Q29tYm87XG5cbiAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwga2V5Q29tYm8uY2hlY2socHJlc3NlZEtleXMpKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxpc3RlbmVycy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbal07XG5cbiAgICAgICAgaWYgKGtleUNvbWJvID09PSBudWxsKSB7XG4gICAgICAgICAgbGlzdGVuZXIgPSB7XG4gICAgICAgICAgICBrZXlDb21ibyAgICAgICAgICAgICAgIDogbmV3IEtleUNvbWJvKHByZXNzZWRLZXlzLmpvaW4oJysnKSksXG4gICAgICAgICAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgIDogbGlzdGVuZXIucHJlc3NIYW5kbGVyLFxuICAgICAgICAgICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA6IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyLFxuICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA6IGxpc3RlbmVyLnByZXZlbnRSZXBlYXQsXG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IDogbGlzdGVuZXIucHJldmVudFJlcGVhdEJ5RGVmYXVsdFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdGVuZXIucHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmV2ZW50UmVwZWF0KSB7XG4gICAgICAgICAgbGlzdGVuZXIucHJlc3NIYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgIGlmIChwcmV2ZW50UmVwZWF0KSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0ID0gcHJldmVudFJlcGVhdDtcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdGVuZXIucmVsZWFzZUhhbmRsZXIgJiYgdGhpcy5fYXBwbGllZExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSA9PT0gLTEpIHtcbiAgICAgICAgICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChrZXlDb21ibykge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleUNvbWJvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgdmFyIGluZGV4ID0gcHJlc3NlZEtleXMuaW5kZXhPZihrZXlDb21iby5rZXlOYW1lc1tqXSk7XG4gICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgcHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIGogLT0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbktleWJvYXJkLnByb3RvdHlwZS5fY2xlYXJCaW5kaW5ncyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50IHx8IChldmVudCA9IHt9KTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzW2ldO1xuICAgIHZhciBrZXlDb21ibyA9IGxpc3RlbmVyLmtleUNvbWJvO1xuICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCB8fCAha2V5Q29tYm8uY2hlY2sodGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzKSkge1xuICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IGxpc3RlbmVyLnByZXZlbnRSZXBlYXRCeURlZmF1bHQ7XG4gICAgICBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgaSAtPSAxO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlib2FyZDtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbXhwWWk5clpYbGliMkZ5WkM1cWN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJJaXdpWm1sc1pTSTZJbWRsYm1WeVlYUmxaQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKY2JuWmhjaUJNYjJOaGJHVWdQU0J5WlhGMWFYSmxLQ2N1TDJ4dlkyRnNaU2NwTzF4dWRtRnlJRXRsZVVOdmJXSnZJRDBnY21WeGRXbHlaU2duTGk5clpYa3RZMjl0WW04bktUdGNibHh1WEc1bWRXNWpkR2x2YmlCTFpYbGliMkZ5WkNoMFlYSm5aWFJYYVc1a2IzY3NJSFJoY21kbGRFVnNaVzFsYm5Rc0lIQnNZWFJtYjNKdExDQjFjMlZ5UVdkbGJuUXBJSHRjYmlBZ2RHaHBjeTVmYkc5allXeGxJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1BTQnVkV3hzTzF4dUlDQjBhR2x6TGw5amRYSnlaVzUwUTI5dWRHVjRkQ0FnSUNBZ0lDQTlJRzUxYkd3N1hHNGdJSFJvYVhNdVgyTnZiblJsZUhSeklDQWdJQ0FnSUNBZ0lDQWdJRDBnZTMwN1hHNGdJSFJvYVhNdVgyeHBjM1JsYm1WeWN5QWdJQ0FnSUNBZ0lDQWdJRDBnVzEwN1hHNGdJSFJvYVhNdVgyRndjR3hwWldSTWFYTjBaVzVsY25NZ0lDQWdJRDBnVzEwN1hHNGdJSFJvYVhNdVgyeHZZMkZzWlhNZ0lDQWdJQ0FnSUNBZ0lDQWdJRDBnZTMwN1hHNGdJSFJvYVhNdVgzUmhjbWRsZEVWc1pXMWxiblFnSUNBZ0lDQWdJRDBnYm5Wc2JEdGNiaUFnZEdocGN5NWZkR0Z5WjJWMFYybHVaRzkzSUNBZ0lDQWdJQ0FnUFNCdWRXeHNPMXh1SUNCMGFHbHpMbDkwWVhKblpYUlFiR0YwWm05eWJTQWdJQ0FnSUNBOUlDY25PMXh1SUNCMGFHbHpMbDkwWVhKblpYUlZjMlZ5UVdkbGJuUWdJQ0FnSUNBOUlDY25PMXh1SUNCMGFHbHpMbDlwYzAxdlpHVnlia0p5YjNkelpYSWdJQ0FnSUNBOUlHWmhiSE5sTzF4dUlDQjBhR2x6TGw5MFlYSm5aWFJMWlhsRWIzZHVRbWx1WkdsdVp5QTlJRzUxYkd3N1hHNGdJSFJvYVhNdVgzUmhjbWRsZEV0bGVWVndRbWx1WkdsdVp5QWdJRDBnYm5Wc2JEdGNiaUFnZEdocGN5NWZkR0Z5WjJWMFVtVnpaWFJDYVc1a2FXNW5JQ0FnUFNCdWRXeHNPMXh1SUNCMGFHbHpMbDl3WVhWelpXUWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBOUlHWmhiSE5sTzF4dVhHNGdJSFJvYVhNdWMyVjBRMjl1ZEdWNGRDZ25aMnh2WW1Gc0p5azdYRzRnSUhSb2FYTXVkMkYwWTJnb2RHRnlaMlYwVjJsdVpHOTNMQ0IwWVhKblpYUkZiR1Z0Wlc1MExDQndiR0YwWm05eWJTd2dkWE5sY2tGblpXNTBLVHRjYm4xY2JseHVTMlY1WW05aGNtUXVjSEp2ZEc5MGVYQmxMbk5sZEV4dlkyRnNaU0E5SUdaMWJtTjBhVzl1S0d4dlkyRnNaVTVoYldVc0lHeHZZMkZzWlVKMWFXeGtaWElwSUh0Y2JpQWdkbUZ5SUd4dlkyRnNaU0E5SUc1MWJHdzdYRzRnSUdsbUlDaDBlWEJsYjJZZ2JHOWpZV3hsVG1GdFpTQTlQVDBnSjNOMGNtbHVaeWNwSUh0Y2JseHVJQ0FnSUdsbUlDaHNiMk5oYkdWQ2RXbHNaR1Z5S1NCN1hHNGdJQ0FnSUNCc2IyTmhiR1VnUFNCdVpYY2dURzlqWVd4bEtHeHZZMkZzWlU1aGJXVXBPMXh1SUNBZ0lDQWdiRzlqWVd4bFFuVnBiR1JsY2loc2IyTmhiR1VzSUhSb2FYTXVYM1JoY21kbGRGQnNZWFJtYjNKdExDQjBhR2x6TGw5MFlYSm5aWFJWYzJWeVFXZGxiblFwTzF4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQnNiMk5oYkdVZ1BTQjBhR2x6TGw5c2IyTmhiR1Z6VzJ4dlkyRnNaVTVoYldWZElIeDhJRzUxYkd3N1hHNGdJQ0FnZlZ4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUd4dlkyRnNaU0FnSUNBZ1BTQnNiMk5oYkdWT1lXMWxPMXh1SUNBZ0lHeHZZMkZzWlU1aGJXVWdQU0JzYjJOaGJHVXVYMnh2WTJGc1pVNWhiV1U3WEc0Z0lIMWNibHh1SUNCMGFHbHpMbDlzYjJOaGJHVWdJQ0FnSUNBZ0lDQWdJQ0FnSUQwZ2JHOWpZV3hsTzF4dUlDQjBhR2x6TGw5c2IyTmhiR1Z6VzJ4dlkyRnNaVTVoYldWZElEMGdiRzlqWVd4bE8xeHVJQ0JwWmlBb2JHOWpZV3hsS1NCN1hHNGdJQ0FnZEdocGN5NWZiRzlqWVd4bExuQnlaWE56WldSTFpYbHpJRDBnYkc5allXeGxMbkJ5WlhOelpXUkxaWGx6TzF4dUlDQjlYRzU5TzF4dVhHNUxaWGxpYjJGeVpDNXdjbTkwYjNSNWNHVXVaMlYwVEc5allXeGxJRDBnWm5WdVkzUnBiMjRvYkc5allXeE9ZVzFsS1NCN1hHNGdJR3h2WTJGc1RtRnRaU0I4ZkNBb2JHOWpZV3hPWVcxbElEMGdkR2hwY3k1ZmJHOWpZV3hsTG14dlkyRnNaVTVoYldVcE8xeHVJQ0J5WlhSMWNtNGdkR2hwY3k1ZmJHOWpZV3hsYzF0c2IyTmhiRTVoYldWZElIeDhJRzUxYkd3N1hHNTlPMXh1WEc1TFpYbGliMkZ5WkM1d2NtOTBiM1I1Y0dVdVltbHVaQ0E5SUdaMWJtTjBhVzl1S0d0bGVVTnZiV0p2VTNSeUxDQndjbVZ6YzBoaGJtUnNaWElzSUhKbGJHVmhjMlZJWVc1a2JHVnlMQ0J3Y21WMlpXNTBVbVZ3WldGMFFubEVaV1poZFd4MEtTQjdYRzRnSUdsbUlDaHJaWGxEYjIxaWIxTjBjaUE5UFQwZ2JuVnNiQ0I4ZkNCMGVYQmxiMllnYTJWNVEyOXRZbTlUZEhJZ1BUMDlJQ2RtZFc1amRHbHZiaWNwSUh0Y2JpQWdJQ0J3Y21WMlpXNTBVbVZ3WldGMFFubEVaV1poZFd4MElEMGdjbVZzWldGelpVaGhibVJzWlhJN1hHNGdJQ0FnY21Wc1pXRnpaVWhoYm1Sc1pYSWdJQ0FnSUNBZ0lDQTlJSEJ5WlhOelNHRnVaR3hsY2p0Y2JpQWdJQ0J3Y21WemMwaGhibVJzWlhJZ0lDQWdJQ0FnSUNBZ0lEMGdhMlY1UTI5dFltOVRkSEk3WEc0Z0lDQWdhMlY1UTI5dFltOVRkSElnSUNBZ0lDQWdJQ0FnSUNBOUlHNTFiR3c3WEc0Z0lIMWNibHh1SUNCcFppQW9YRzRnSUNBZ2EyVjVRMjl0WW05VGRISWdKaVpjYmlBZ0lDQjBlWEJsYjJZZ2EyVjVRMjl0WW05VGRISWdQVDA5SUNkdlltcGxZM1FuSUNZbVhHNGdJQ0FnZEhsd1pXOW1JR3RsZVVOdmJXSnZVM1J5TG14bGJtZDBhQ0E5UFQwZ0oyNTFiV0psY2lkY2JpQWdLU0I3WEc0Z0lDQWdabTl5SUNoMllYSWdhU0E5SURBN0lHa2dQQ0JyWlhsRGIyMWliMU4wY2k1c1pXNW5kR2c3SUdrZ0t6MGdNU2tnZTF4dUlDQWdJQ0FnZEdocGN5NWlhVzVrS0d0bGVVTnZiV0p2VTNSeVcybGRMQ0J3Y21WemMwaGhibVJzWlhJc0lISmxiR1ZoYzJWSVlXNWtiR1Z5S1R0Y2JpQWdJQ0I5WEc0Z0lDQWdjbVYwZFhKdU8xeHVJQ0I5WEc1Y2JpQWdkR2hwY3k1ZmJHbHpkR1Z1WlhKekxuQjFjMmdvZTF4dUlDQWdJR3RsZVVOdmJXSnZJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ09pQnJaWGxEYjIxaWIxTjBjaUEvSUc1bGR5QkxaWGxEYjIxaWJ5aHJaWGxEYjIxaWIxTjBjaWtnT2lCdWRXeHNMRnh1SUNBZ0lIQnlaWE56U0dGdVpHeGxjaUFnSUNBZ0lDQWdJQ0FnT2lCd2NtVnpjMGhoYm1Sc1pYSWdJQ0FnSUNBZ0lDQWdJSHg4SUc1MWJHd3NYRzRnSUNBZ2NtVnNaV0Z6WlVoaGJtUnNaWElnSUNBZ0lDQWdJQ0E2SUhKbGJHVmhjMlZJWVc1a2JHVnlJQ0FnSUNBZ0lDQWdmSHdnYm5Wc2JDeGNiaUFnSUNCd2NtVjJaVzUwVW1Wd1pXRjBJQ0FnSUNBZ0lDQWdJRG9nY0hKbGRtVnVkRkpsY0dWaGRFSjVSR1ZtWVhWc2RDQjhmQ0JtWVd4elpTeGNiaUFnSUNCd2NtVjJaVzUwVW1Wd1pXRjBRbmxFWldaaGRXeDBJRG9nY0hKbGRtVnVkRkpsY0dWaGRFSjVSR1ZtWVhWc2RDQjhmQ0JtWVd4elpWeHVJQ0I5S1R0Y2JuMDdYRzVMWlhsaWIyRnlaQzV3Y205MGIzUjVjR1V1WVdSa1RHbHpkR1Z1WlhJZ1BTQkxaWGxpYjJGeVpDNXdjbTkwYjNSNWNHVXVZbWx1WkR0Y2JrdGxlV0p2WVhKa0xuQnliM1J2ZEhsd1pTNXZiaUFnSUNBZ0lDQWdJQ0E5SUV0bGVXSnZZWEprTG5CeWIzUnZkSGx3WlM1aWFXNWtPMXh1WEc1TFpYbGliMkZ5WkM1d2NtOTBiM1I1Y0dVdWRXNWlhVzVrSUQwZ1puVnVZM1JwYjI0b2EyVjVRMjl0WW05VGRISXNJSEJ5WlhOelNHRnVaR3hsY2l3Z2NtVnNaV0Z6WlVoaGJtUnNaWElwSUh0Y2JpQWdhV1lnS0d0bGVVTnZiV0p2VTNSeUlEMDlQU0J1ZFd4c0lIeDhJSFI1Y0dWdlppQnJaWGxEYjIxaWIxTjBjaUE5UFQwZ0oyWjFibU4wYVc5dUp5a2dlMXh1SUNBZ0lISmxiR1ZoYzJWSVlXNWtiR1Z5SUQwZ2NISmxjM05JWVc1a2JHVnlPMXh1SUNBZ0lIQnlaWE56U0dGdVpHeGxjaUFnSUQwZ2EyVjVRMjl0WW05VGRISTdYRzRnSUNBZ2EyVjVRMjl0WW05VGRISWdQU0J1ZFd4c08xeHVJQ0I5WEc1Y2JpQWdhV1lnS0Z4dUlDQWdJR3RsZVVOdmJXSnZVM1J5SUNZbVhHNGdJQ0FnZEhsd1pXOW1JR3RsZVVOdmJXSnZVM1J5SUQwOVBTQW5iMkpxWldOMEp5QW1KbHh1SUNBZ0lIUjVjR1Z2WmlCclpYbERiMjFpYjFOMGNpNXNaVzVuZEdnZ1BUMDlJQ2R1ZFcxaVpYSW5YRzRnSUNrZ2UxeHVJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2EyVjVRMjl0WW05VGRISXViR1Z1WjNSb095QnBJQ3M5SURFcElIdGNiaUFnSUNBZ0lIUm9hWE11ZFc1aWFXNWtLR3RsZVVOdmJXSnZVM1J5VzJsZExDQndjbVZ6YzBoaGJtUnNaWElzSUhKbGJHVmhjMlZJWVc1a2JHVnlLVHRjYmlBZ0lDQjlYRzRnSUNBZ2NtVjBkWEp1TzF4dUlDQjlYRzVjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQjBhR2x6TGw5c2FYTjBaVzVsY25NdWJHVnVaM1JvT3lCcElDczlJREVwSUh0Y2JpQWdJQ0IyWVhJZ2JHbHpkR1Z1WlhJZ1BTQjBhR2x6TGw5c2FYTjBaVzVsY25OYmFWMDdYRzVjYmlBZ0lDQjJZWElnWTI5dFltOU5ZWFJqYUdWeklDQWdJQ0FnSUNBZ0lEMGdJV3RsZVVOdmJXSnZVM1J5SUNZbUlDRnNhWE4wWlc1bGNpNXJaWGxEYjIxaWJ5QjhmRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnNhWE4wWlc1bGNpNXJaWGxEYjIxaWJ5QW1KaUJzYVhOMFpXNWxjaTVyWlhsRGIyMWlieTVwYzBWeGRXRnNLR3RsZVVOdmJXSnZVM1J5S1R0Y2JpQWdJQ0IyWVhJZ2NISmxjM05JWVc1a2JHVnlUV0YwWTJobGN5QWdJRDBnSVhCeVpYTnpTR0Z1Wkd4bGNpQW1KaUFoY21Wc1pXRnpaVWhoYm1Sc1pYSWdmSHhjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJWEJ5WlhOelNHRnVaR3hsY2lBbUppQWhiR2x6ZEdWdVpYSXVjSEpsYzNOSVlXNWtiR1Z5SUh4OFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhCeVpYTnpTR0Z1Wkd4bGNpQTlQVDBnYkdsemRHVnVaWEl1Y0hKbGMzTklZVzVrYkdWeU8xeHVJQ0FnSUhaaGNpQnlaV3hsWVhObFNHRnVaR3hsY2sxaGRHTm9aWE1nUFNBaGNISmxjM05JWVc1a2JHVnlJQ1ltSUNGeVpXeGxZWE5sU0dGdVpHeGxjaUI4ZkZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FoY21Wc1pXRnpaVWhoYm1Sc1pYSWdKaVlnSVd4cGMzUmxibVZ5TG5KbGJHVmhjMlZJWVc1a2JHVnlJSHg4WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsYkdWaGMyVklZVzVrYkdWeUlEMDlQU0JzYVhOMFpXNWxjaTV5Wld4bFlYTmxTR0Z1Wkd4bGNqdGNibHh1SUNBZ0lHbG1JQ2hqYjIxaWIwMWhkR05vWlhNZ0ppWWdjSEpsYzNOSVlXNWtiR1Z5VFdGMFkyaGxjeUFtSmlCeVpXeGxZWE5sU0dGdVpHeGxjazFoZEdOb1pYTXBJSHRjYmlBZ0lDQWdJSFJvYVhNdVgyeHBjM1JsYm1WeWN5NXpjR3hwWTJVb2FTd2dNU2s3WEc0Z0lDQWdJQ0JwSUMwOUlERTdYRzRnSUNBZ2ZWeHVJQ0I5WEc1OU8xeHVTMlY1WW05aGNtUXVjSEp2ZEc5MGVYQmxMbkpsYlc5MlpVeHBjM1JsYm1WeUlEMGdTMlY1WW05aGNtUXVjSEp2ZEc5MGVYQmxMblZ1WW1sdVpEdGNia3RsZVdKdllYSmtMbkJ5YjNSdmRIbHdaUzV2Wm1ZZ0lDQWdJQ0FnSUNBZ0lDQTlJRXRsZVdKdllYSmtMbkJ5YjNSdmRIbHdaUzUxYm1KcGJtUTdYRzVjYmt0bGVXSnZZWEprTG5CeWIzUnZkSGx3WlM1elpYUkRiMjUwWlhoMElEMGdablZ1WTNScGIyNG9ZMjl1ZEdWNGRFNWhiV1VwSUh0Y2JpQWdhV1lvZEdocGN5NWZiRzlqWVd4bEtTQjdJSFJvYVhNdWNtVnNaV0Z6WlVGc2JFdGxlWE1vS1RzZ2ZWeHVYRzRnSUdsbUlDZ2hkR2hwY3k1ZlkyOXVkR1Y0ZEhOYlkyOXVkR1Y0ZEU1aGJXVmRLU0I3WEc0Z0lDQWdkR2hwY3k1ZlkyOXVkR1Y0ZEhOYlkyOXVkR1Y0ZEU1aGJXVmRJRDBnVzEwN1hHNGdJSDFjYmlBZ2RHaHBjeTVmYkdsemRHVnVaWEp6SUNBZ0lDQWdQU0IwYUdsekxsOWpiMjUwWlhoMGMxdGpiMjUwWlhoMFRtRnRaVjA3WEc0Z0lIUm9hWE11WDJOMWNuSmxiblJEYjI1MFpYaDBJRDBnWTI5dWRHVjRkRTVoYldVN1hHNTlPMXh1WEc1TFpYbGliMkZ5WkM1d2NtOTBiM1I1Y0dVdVoyVjBRMjl1ZEdWNGRDQTlJR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQnlaWFIxY200Z2RHaHBjeTVmWTNWeWNtVnVkRU52Ym5SbGVIUTdYRzU5TzF4dVhHNUxaWGxpYjJGeVpDNXdjbTkwYjNSNWNHVXVkMmwwYUVOdmJuUmxlSFFnUFNCbWRXNWpkR2x2YmloamIyNTBaWGgwVG1GdFpTd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ2RtRnlJSEJ5WlhacGIzVnpRMjl1ZEdWNGRFNWhiV1VnUFNCMGFHbHpMbWRsZEVOdmJuUmxlSFFvS1R0Y2JpQWdkR2hwY3k1elpYUkRiMjUwWlhoMEtHTnZiblJsZUhST1lXMWxLVHRjYmx4dUlDQmpZV3hzWW1GamF5Z3BPMXh1WEc0Z0lIUm9hWE11YzJWMFEyOXVkR1Y0ZENod2NtVjJhVzkxYzBOdmJuUmxlSFJPWVcxbEtUdGNibjA3WEc1Y2JrdGxlV0p2WVhKa0xuQnliM1J2ZEhsd1pTNTNZWFJqYUNBOUlHWjFibU4wYVc5dUtIUmhjbWRsZEZkcGJtUnZkeXdnZEdGeVoyVjBSV3hsYldWdWRDd2dkR0Z5WjJWMFVHeGhkR1p2Y20wc0lIUmhjbWRsZEZWelpYSkJaMlZ1ZENrZ2UxeHVJQ0IyWVhJZ1gzUm9hWE1nUFNCMGFHbHpPMXh1WEc0Z0lIUm9hWE11YzNSdmNDZ3BPMXh1WEc0Z0lHbG1JQ2doZEdGeVoyVjBWMmx1Wkc5M0tTQjdYRzRnSUNBZ2FXWWdLQ0ZuYkc5aVlXd3VZV1JrUlhabGJuUk1hWE4wWlc1bGNpQW1KaUFoWjJ4dlltRnNMbUYwZEdGamFFVjJaVzUwS1NCN1hHNGdJQ0FnSUNCMGFISnZkeUJ1WlhjZ1JYSnliM0lvSjBOaGJtNXZkQ0JtYVc1a0lHZHNiMkpoYkNCbWRXNWpkR2x2Ym5NZ1lXUmtSWFpsYm5STWFYTjBaVzVsY2lCdmNpQmhkSFJoWTJoRmRtVnVkQzRuS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdkR0Z5WjJWMFYybHVaRzkzSUQwZ1oyeHZZbUZzTzF4dUlDQjlYRzVjYmlBZ2FXWWdLSFI1Y0dWdlppQjBZWEpuWlhSWGFXNWtiM2N1Ym05a1pWUjVjR1VnUFQwOUlDZHVkVzFpWlhJbktTQjdYRzRnSUNBZ2RHRnlaMlYwVlhObGNrRm5aVzUwSUQwZ2RHRnlaMlYwVUd4aGRHWnZjbTA3WEc0Z0lDQWdkR0Z5WjJWMFVHeGhkR1p2Y20wZ0lEMGdkR0Z5WjJWMFJXeGxiV1Z1ZER0Y2JpQWdJQ0IwWVhKblpYUkZiR1Z0Wlc1MElDQWdQU0IwWVhKblpYUlhhVzVrYjNjN1hHNGdJQ0FnZEdGeVoyVjBWMmx1Wkc5M0lDQWdJRDBnWjJ4dlltRnNPMXh1SUNCOVhHNWNiaUFnYVdZZ0tDRjBZWEpuWlhSWGFXNWtiM2N1WVdSa1JYWmxiblJNYVhOMFpXNWxjaUFtSmlBaGRHRnlaMlYwVjJsdVpHOTNMbUYwZEdGamFFVjJaVzUwS1NCN1hHNGdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2REWVc1dWIzUWdabWx1WkNCaFpHUkZkbVZ1ZEV4cGMzUmxibVZ5SUc5eUlHRjBkR0ZqYUVWMlpXNTBJRzFsZEdodlpITWdiMjRnZEdGeVoyVjBWMmx1Wkc5M0xpY3BPMXh1SUNCOVhHNWNiaUFnZEdocGN5NWZhWE5OYjJSbGNtNUNjbTkzYzJWeUlEMGdJU0YwWVhKblpYUlhhVzVrYjNjdVlXUmtSWFpsYm5STWFYTjBaVzVsY2p0Y2JseHVJQ0IyWVhJZ2RYTmxja0ZuWlc1MElEMGdkR0Z5WjJWMFYybHVaRzkzTG01aGRtbG5ZWFJ2Y2lBbUppQjBZWEpuWlhSWGFXNWtiM2N1Ym1GMmFXZGhkRzl5TG5WelpYSkJaMlZ1ZENCOGZDQW5KenRjYmlBZ2RtRnlJSEJzWVhSbWIzSnRJQ0E5SUhSaGNtZGxkRmRwYm1SdmR5NXVZWFpwWjJGMGIzSWdKaVlnZEdGeVoyVjBWMmx1Wkc5M0xtNWhkbWxuWVhSdmNpNXdiR0YwWm05eWJTQWdmSHdnSnljN1hHNWNiaUFnZEdGeVoyVjBSV3hsYldWdWRDQWdJQ1ltSUhSaGNtZGxkRVZzWlcxbGJuUWdJQ0FoUFQwZ2JuVnNiQ0I4ZkNBb2RHRnlaMlYwUld4bGJXVnVkQ0FnSUQwZ2RHRnlaMlYwVjJsdVpHOTNMbVJ2WTNWdFpXNTBLVHRjYmlBZ2RHRnlaMlYwVUd4aGRHWnZjbTBnSUNZbUlIUmhjbWRsZEZCc1lYUm1iM0p0SUNBaFBUMGdiblZzYkNCOGZDQW9kR0Z5WjJWMFVHeGhkR1p2Y20wZ0lEMGdjR3hoZEdadmNtMHBPMXh1SUNCMFlYSm5aWFJWYzJWeVFXZGxiblFnSmlZZ2RHRnlaMlYwVlhObGNrRm5aVzUwSUNFOVBTQnVkV3hzSUh4OElDaDBZWEpuWlhSVmMyVnlRV2RsYm5RZ1BTQjFjMlZ5UVdkbGJuUXBPMXh1WEc0Z0lIUm9hWE11WDNSaGNtZGxkRXRsZVVSdmQyNUNhVzVrYVc1bklEMGdablZ1WTNScGIyNG9aWFpsYm5RcElIdGNiaUFnSUNCZmRHaHBjeTV3Y21WemMwdGxlU2hsZG1WdWRDNXJaWGxEYjJSbExDQmxkbVZ1ZENrN1hHNGdJSDA3WEc0Z0lIUm9hWE11WDNSaGNtZGxkRXRsZVZWd1FtbHVaR2x1WnlBOUlHWjFibU4wYVc5dUtHVjJaVzUwS1NCN1hHNGdJQ0FnWDNSb2FYTXVjbVZzWldGelpVdGxlU2hsZG1WdWRDNXJaWGxEYjJSbExDQmxkbVZ1ZENrN1hHNGdJSDA3WEc0Z0lIUm9hWE11WDNSaGNtZGxkRkpsYzJWMFFtbHVaR2x1WnlBOUlHWjFibU4wYVc5dUtHVjJaVzUwS1NCN1hHNGdJQ0FnWDNSb2FYTXVjbVZzWldGelpVRnNiRXRsZVhNb1pYWmxiblFwWEc0Z0lIMDdYRzVjYmlBZ2RHaHBjeTVmWW1sdVpFVjJaVzUwS0hSaGNtZGxkRVZzWlcxbGJuUXNJQ2RyWlhsa2IzZHVKeXdnZEdocGN5NWZkR0Z5WjJWMFMyVjVSRzkzYmtKcGJtUnBibWNwTzF4dUlDQjBhR2x6TGw5aWFXNWtSWFpsYm5Rb2RHRnlaMlYwUld4bGJXVnVkQ3dnSjJ0bGVYVndKeXdnSUNCMGFHbHpMbDkwWVhKblpYUkxaWGxWY0VKcGJtUnBibWNwTzF4dUlDQjBhR2x6TGw5aWFXNWtSWFpsYm5Rb2RHRnlaMlYwVjJsdVpHOTNMQ0FnSjJadlkzVnpKeXdnSUNCMGFHbHpMbDkwWVhKblpYUlNaWE5sZEVKcGJtUnBibWNwTzF4dUlDQjBhR2x6TGw5aWFXNWtSWFpsYm5Rb2RHRnlaMlYwVjJsdVpHOTNMQ0FnSjJKc2RYSW5MQ0FnSUNCMGFHbHpMbDkwWVhKblpYUlNaWE5sZEVKcGJtUnBibWNwTzF4dVhHNGdJSFJvYVhNdVgzUmhjbWRsZEVWc1pXMWxiblFnSUNBOUlIUmhjbWRsZEVWc1pXMWxiblE3WEc0Z0lIUm9hWE11WDNSaGNtZGxkRmRwYm1SdmR5QWdJQ0E5SUhSaGNtZGxkRmRwYm1SdmR6dGNiaUFnZEdocGN5NWZkR0Z5WjJWMFVHeGhkR1p2Y20wZ0lEMGdkR0Z5WjJWMFVHeGhkR1p2Y20wN1hHNGdJSFJvYVhNdVgzUmhjbWRsZEZWelpYSkJaMlZ1ZENBOUlIUmhjbWRsZEZWelpYSkJaMlZ1ZER0Y2JuMDdYRzVjYmt0bGVXSnZZWEprTG5CeWIzUnZkSGx3WlM1emRHOXdJRDBnWm5WdVkzUnBiMjRvS1NCN1hHNGdJSFpoY2lCZmRHaHBjeUE5SUhSb2FYTTdYRzVjYmlBZ2FXWWdLQ0YwYUdsekxsOTBZWEpuWlhSRmJHVnRaVzUwSUh4OElDRjBhR2x6TGw5MFlYSm5aWFJYYVc1a2IzY3BJSHNnY21WMGRYSnVPeUI5WEc1Y2JpQWdkR2hwY3k1ZmRXNWlhVzVrUlhabGJuUW9kR2hwY3k1ZmRHRnlaMlYwUld4bGJXVnVkQ3dnSjJ0bGVXUnZkMjRuTENCMGFHbHpMbDkwWVhKblpYUkxaWGxFYjNkdVFtbHVaR2x1WnlrN1hHNGdJSFJvYVhNdVgzVnVZbWx1WkVWMlpXNTBLSFJvYVhNdVgzUmhjbWRsZEVWc1pXMWxiblFzSUNkclpYbDFjQ2NzSUNBZ2RHaHBjeTVmZEdGeVoyVjBTMlY1VlhCQ2FXNWthVzVuS1R0Y2JpQWdkR2hwY3k1ZmRXNWlhVzVrUlhabGJuUW9kR2hwY3k1ZmRHRnlaMlYwVjJsdVpHOTNMQ0FnSjJadlkzVnpKeXdnSUNCMGFHbHpMbDkwWVhKblpYUlNaWE5sZEVKcGJtUnBibWNwTzF4dUlDQjBhR2x6TGw5MWJtSnBibVJGZG1WdWRDaDBhR2x6TGw5MFlYSm5aWFJYYVc1a2IzY3NJQ0FuWW14MWNpY3NJQ0FnSUhSb2FYTXVYM1JoY21kbGRGSmxjMlYwUW1sdVpHbHVaeWs3WEc1Y2JpQWdkR2hwY3k1ZmRHRnlaMlYwVjJsdVpHOTNJQ0E5SUc1MWJHdzdYRzRnSUhSb2FYTXVYM1JoY21kbGRFVnNaVzFsYm5RZ1BTQnVkV3hzTzF4dWZUdGNibHh1UzJWNVltOWhjbVF1Y0hKdmRHOTBlWEJsTG5CeVpYTnpTMlY1SUQwZ1puVnVZM1JwYjI0b2EyVjVRMjlrWlN3Z1pYWmxiblFwSUh0Y2JpQWdhV1lnS0hSb2FYTXVYM0JoZFhObFpDa2dleUJ5WlhSMWNtNDdJSDFjYmlBZ2FXWWdLQ0YwYUdsekxsOXNiMk5oYkdVcElIc2dkR2h5YjNjZ2JtVjNJRVZ5Y205eUtDZE1iMk5oYkdVZ2JtOTBJSE5sZENjcE95QjlYRzVjYmlBZ2RHaHBjeTVmYkc5allXeGxMbkJ5WlhOelMyVjVLR3RsZVVOdlpHVXBPMXh1SUNCMGFHbHpMbDloY0hCc2VVSnBibVJwYm1kektHVjJaVzUwS1R0Y2JuMDdYRzVjYmt0bGVXSnZZWEprTG5CeWIzUnZkSGx3WlM1eVpXeGxZWE5sUzJWNUlEMGdablZ1WTNScGIyNG9hMlY1UTI5a1pTd2daWFpsYm5RcElIdGNiaUFnYVdZZ0tIUm9hWE11WDNCaGRYTmxaQ2tnZXlCeVpYUjFjbTQ3SUgxY2JpQWdhV1lnS0NGMGFHbHpMbDlzYjJOaGJHVXBJSHNnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2RNYjJOaGJHVWdibTkwSUhObGRDY3BPeUI5WEc1Y2JpQWdkR2hwY3k1ZmJHOWpZV3hsTG5KbGJHVmhjMlZMWlhrb2EyVjVRMjlrWlNrN1hHNGdJSFJvYVhNdVgyTnNaV0Z5UW1sdVpHbHVaM01vWlhabGJuUXBPMXh1ZlR0Y2JseHVTMlY1WW05aGNtUXVjSEp2ZEc5MGVYQmxMbkpsYkdWaGMyVkJiR3hMWlhseklEMGdablZ1WTNScGIyNG9aWFpsYm5RcElIdGNiaUFnYVdZZ0tIUm9hWE11WDNCaGRYTmxaQ2tnZXlCeVpYUjFjbTQ3SUgxY2JpQWdhV1lnS0NGMGFHbHpMbDlzYjJOaGJHVXBJSHNnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2RNYjJOaGJHVWdibTkwSUhObGRDY3BPeUI5WEc1Y2JpQWdkR2hwY3k1ZmJHOWpZV3hsTG5CeVpYTnpaV1JMWlhsekxteGxibWQwYUNBOUlEQTdYRzRnSUhSb2FYTXVYMk5zWldGeVFtbHVaR2x1WjNNb1pYWmxiblFwTzF4dWZUdGNibHh1UzJWNVltOWhjbVF1Y0hKdmRHOTBlWEJsTG5CaGRYTmxJRDBnWm5WdVkzUnBiMjRvS1NCN1hHNGdJR2xtSUNoMGFHbHpMbDl3WVhWelpXUXBJSHNnY21WMGRYSnVPeUI5WEc0Z0lHbG1JQ2gwYUdsekxsOXNiMk5oYkdVcElIc2dkR2hwY3k1eVpXeGxZWE5sUVd4c1MyVjVjeWdwT3lCOVhHNGdJSFJvYVhNdVgzQmhkWE5sWkNBOUlIUnlkV1U3WEc1OU8xeHVYRzVMWlhsaWIyRnlaQzV3Y205MGIzUjVjR1V1Y21WemRXMWxJRDBnWm5WdVkzUnBiMjRvS1NCN1hHNGdJSFJvYVhNdVgzQmhkWE5sWkNBOUlHWmhiSE5sTzF4dWZUdGNibHh1UzJWNVltOWhjbVF1Y0hKdmRHOTBlWEJsTG5KbGMyVjBJRDBnWm5WdVkzUnBiMjRvS1NCN1hHNGdJSFJvYVhNdWNtVnNaV0Z6WlVGc2JFdGxlWE1vS1R0Y2JpQWdkR2hwY3k1ZmJHbHpkR1Z1WlhKekxteGxibWQwYUNBOUlEQTdYRzU5TzF4dVhHNUxaWGxpYjJGeVpDNXdjbTkwYjNSNWNHVXVYMkpwYm1SRmRtVnVkQ0E5SUdaMWJtTjBhVzl1S0hSaGNtZGxkRVZzWlcxbGJuUXNJR1YyWlc1MFRtRnRaU3dnYUdGdVpHeGxjaWtnZTF4dUlDQnlaWFIxY200Z2RHaHBjeTVmYVhOTmIyUmxjbTVDY205M2MyVnlJRDljYmlBZ0lDQjBZWEpuWlhSRmJHVnRaVzUwTG1Ga1pFVjJaVzUwVEdsemRHVnVaWElvWlhabGJuUk9ZVzFsTENCb1lXNWtiR1Z5TENCbVlXeHpaU2tnT2x4dUlDQWdJSFJoY21kbGRFVnNaVzFsYm5RdVlYUjBZV05vUlhabGJuUW9KMjl1SnlBcklHVjJaVzUwVG1GdFpTd2dhR0Z1Wkd4bGNpazdYRzU5TzF4dVhHNUxaWGxpYjJGeVpDNXdjbTkwYjNSNWNHVXVYM1Z1WW1sdVpFVjJaVzUwSUQwZ1puVnVZM1JwYjI0b2RHRnlaMlYwUld4bGJXVnVkQ3dnWlhabGJuUk9ZVzFsTENCb1lXNWtiR1Z5S1NCN1hHNGdJSEpsZEhWeWJpQjBhR2x6TGw5cGMwMXZaR1Z5YmtKeWIzZHpaWElnUDF4dUlDQWdJSFJoY21kbGRFVnNaVzFsYm5RdWNtVnRiM1psUlhabGJuUk1hWE4wWlc1bGNpaGxkbVZ1ZEU1aGJXVXNJR2hoYm1Sc1pYSXNJR1poYkhObEtTQTZYRzRnSUNBZ2RHRnlaMlYwUld4bGJXVnVkQzVrWlhSaFkyaEZkbVZ1ZENnbmIyNG5JQ3NnWlhabGJuUk9ZVzFsTENCb1lXNWtiR1Z5S1R0Y2JuMDdYRzVjYmt0bGVXSnZZWEprTG5CeWIzUnZkSGx3WlM1ZloyVjBSM0p2ZFhCbFpFeHBjM1JsYm1WeWN5QTlJR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQjJZWElnYkdsemRHVnVaWEpIY205MWNITWdJQ0E5SUZ0ZE8xeHVJQ0IyWVhJZ2JHbHpkR1Z1WlhKSGNtOTFjRTFoY0NBOUlGdGRPMXh1WEc0Z0lIWmhjaUJzYVhOMFpXNWxjbk1nUFNCMGFHbHpMbDlzYVhOMFpXNWxjbk03WEc0Z0lHbG1JQ2gwYUdsekxsOWpkWEp5Wlc1MFEyOXVkR1Y0ZENBaFBUMGdKMmRzYjJKaGJDY3BJSHRjYmlBZ0lDQnNhWE4wWlc1bGNuTWdQU0JiWFM1amIyNWpZWFFvYkdsemRHVnVaWEp6TENCMGFHbHpMbDlqYjI1MFpYaDBjeTVuYkc5aVlXd3BPMXh1SUNCOVhHNWNiaUFnYkdsemRHVnVaWEp6TG5OdmNuUW9ablZ1WTNScGIyNG9ZU3dnWWlrZ2UxeHVJQ0FnSUhKbGRIVnliaUFvWWk1clpYbERiMjFpYnlBL0lHSXVhMlY1UTI5dFltOHVhMlY1VG1GdFpYTXViR1Z1WjNSb0lEb2dNQ2tnTFNBb1lTNXJaWGxEYjIxaWJ5QS9JR0V1YTJWNVEyOXRZbTh1YTJWNVRtRnRaWE11YkdWdVozUm9JRG9nTUNrN1hHNGdJSDBwTG1admNrVmhZMmdvWm5WdVkzUnBiMjRvYkNrZ2UxeHVJQ0FnSUhaaGNpQnRZWEJKYm1SbGVDQTlJQzB4TzF4dUlDQWdJR1p2Y2lBb2RtRnlJR2tnUFNBd095QnBJRHdnYkdsemRHVnVaWEpIY205MWNFMWhjQzVzWlc1bmRHZzdJR2tnS3owZ01Ta2dlMXh1SUNBZ0lDQWdhV1lnS0d4cGMzUmxibVZ5UjNKdmRYQk5ZWEJiYVYwZ1BUMDlJRzUxYkd3Z0ppWWdiQzVyWlhsRGIyMWlieUE5UFQwZ2JuVnNiQ0I4ZkZ4dUlDQWdJQ0FnSUNBZ0lHeHBjM1JsYm1WeVIzSnZkWEJOWVhCYmFWMGdJVDA5SUc1MWJHd2dKaVlnYkdsemRHVnVaWEpIY205MWNFMWhjRnRwWFM1cGMwVnhkV0ZzS0d3dWEyVjVRMjl0WW04cEtTQjdYRzRnSUNBZ0lDQWdJRzFoY0VsdVpHVjRJRDBnYVR0Y2JpQWdJQ0FnSUgxY2JpQWdJQ0I5WEc0Z0lDQWdhV1lnS0cxaGNFbHVaR1Y0SUQwOVBTQXRNU2tnZTF4dUlDQWdJQ0FnYldGd1NXNWtaWGdnUFNCc2FYTjBaVzVsY2tkeWIzVndUV0Z3TG14bGJtZDBhRHRjYmlBZ0lDQWdJR3hwYzNSbGJtVnlSM0p2ZFhCTllYQXVjSFZ6YUNoc0xtdGxlVU52YldKdktUdGNiaUFnSUNCOVhHNGdJQ0FnYVdZZ0tDRnNhWE4wWlc1bGNrZHliM1Z3YzF0dFlYQkpibVJsZUYwcElIdGNiaUFnSUNBZ0lHeHBjM1JsYm1WeVIzSnZkWEJ6VzIxaGNFbHVaR1Y0WFNBOUlGdGRPMXh1SUNBZ0lIMWNiaUFnSUNCc2FYTjBaVzVsY2tkeWIzVndjMXR0WVhCSmJtUmxlRjB1Y0hWemFDaHNLVHRjYmlBZ2ZTazdYRzRnSUhKbGRIVnliaUJzYVhOMFpXNWxja2R5YjNWd2N6dGNibjA3WEc1Y2JrdGxlV0p2WVhKa0xuQnliM1J2ZEhsd1pTNWZZWEJ3YkhsQ2FXNWthVzVuY3lBOUlHWjFibU4wYVc5dUtHVjJaVzUwS1NCN1hHNGdJSFpoY2lCd2NtVjJaVzUwVW1Wd1pXRjBJRDBnWm1Gc2MyVTdYRzVjYmlBZ1pYWmxiblFnZkh3Z0tHVjJaVzUwSUQwZ2UzMHBPMXh1SUNCbGRtVnVkQzV3Y21WMlpXNTBVbVZ3WldGMElEMGdablZ1WTNScGIyNG9LU0I3SUhCeVpYWmxiblJTWlhCbFlYUWdQU0IwY25WbE95QjlPMXh1SUNCbGRtVnVkQzV3Y21WemMyVmtTMlY1Y3lBZ0lEMGdkR2hwY3k1ZmJHOWpZV3hsTG5CeVpYTnpaV1JMWlhsekxuTnNhV05sS0RBcE8xeHVYRzRnSUhaaGNpQndjbVZ6YzJWa1MyVjVjeUFnSUNBOUlIUm9hWE11WDJ4dlkyRnNaUzV3Y21WemMyVmtTMlY1Y3k1emJHbGpaU2d3S1R0Y2JpQWdkbUZ5SUd4cGMzUmxibVZ5UjNKdmRYQnpJRDBnZEdocGN5NWZaMlYwUjNKdmRYQmxaRXhwYzNSbGJtVnljeWdwTzF4dVhHNWNiaUFnWm05eUlDaDJZWElnYVNBOUlEQTdJR2tnUENCc2FYTjBaVzVsY2tkeWIzVndjeTVzWlc1bmRHZzdJR2tnS3owZ01Ta2dlMXh1SUNBZ0lIWmhjaUJzYVhOMFpXNWxjbk1nUFNCc2FYTjBaVzVsY2tkeWIzVndjMXRwWFR0Y2JpQWdJQ0IyWVhJZ2EyVjVRMjl0WW04Z0lEMGdiR2x6ZEdWdVpYSnpXekJkTG10bGVVTnZiV0p2TzF4dVhHNGdJQ0FnYVdZZ0tHdGxlVU52YldKdklEMDlQU0J1ZFd4c0lIeDhJR3RsZVVOdmJXSnZMbU5vWldOcktIQnlaWE56WldSTFpYbHpLU2tnZTF4dUlDQWdJQ0FnWm05eUlDaDJZWElnYWlBOUlEQTdJR29nUENCc2FYTjBaVzVsY25NdWJHVnVaM1JvT3lCcUlDczlJREVwSUh0Y2JpQWdJQ0FnSUNBZ2RtRnlJR3hwYzNSbGJtVnlJRDBnYkdsemRHVnVaWEp6VzJwZE8xeHVYRzRnSUNBZ0lDQWdJR2xtSUNoclpYbERiMjFpYnlBOVBUMGdiblZzYkNrZ2UxeHVJQ0FnSUNBZ0lDQWdJR3hwYzNSbGJtVnlJRDBnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhMlY1UTI5dFltOGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBNklHNWxkeUJMWlhsRGIyMWlieWh3Y21WemMyVmtTMlY1Y3k1cWIybHVLQ2NySnlrcExGeHVJQ0FnSUNBZ0lDQWdJQ0FnY0hKbGMzTklZVzVrYkdWeUlDQWdJQ0FnSUNBZ0lDQTZJR3hwYzNSbGJtVnlMbkJ5WlhOelNHRnVaR3hsY2l4Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsYkdWaGMyVklZVzVrYkdWeUlDQWdJQ0FnSUNBZ09pQnNhWE4wWlc1bGNpNXlaV3hsWVhObFNHRnVaR3hsY2l4Y2JpQWdJQ0FnSUNBZ0lDQWdJSEJ5WlhabGJuUlNaWEJsWVhRZ0lDQWdJQ0FnSUNBZ09pQnNhWE4wWlc1bGNpNXdjbVYyWlc1MFVtVndaV0YwTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdjSEpsZG1WdWRGSmxjR1ZoZEVKNVJHVm1ZWFZzZENBNklHeHBjM1JsYm1WeUxuQnlaWFpsYm5SU1pYQmxZWFJDZVVSbFptRjFiSFJjYmlBZ0lDQWdJQ0FnSUNCOU8xeHVJQ0FnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJQ0FnYVdZZ0tHeHBjM1JsYm1WeUxuQnlaWE56U0dGdVpHeGxjaUFtSmlBaGJHbHpkR1Z1WlhJdWNISmxkbVZ1ZEZKbGNHVmhkQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lHeHBjM1JsYm1WeUxuQnlaWE56U0dGdVpHeGxjaTVqWVd4c0tIUm9hWE1zSUdWMlpXNTBLVHRjYmlBZ0lDQWdJQ0FnSUNCcFppQW9jSEpsZG1WdWRGSmxjR1ZoZENrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYkdsemRHVnVaWEl1Y0hKbGRtVnVkRkpsY0dWaGRDQTlJSEJ5WlhabGJuUlNaWEJsWVhRN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J3Y21WMlpXNTBVbVZ3WldGMElDQWdJQ0FnSUNBZ0lEMGdabUZzYzJVN1hHNGdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ2FXWWdLR3hwYzNSbGJtVnlMbkpsYkdWaGMyVklZVzVrYkdWeUlDWW1JSFJvYVhNdVgyRndjR3hwWldSTWFYTjBaVzVsY25NdWFXNWtaWGhQWmloc2FYTjBaVzVsY2lrZ1BUMDlJQzB4S1NCN1hHNGdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZllYQndiR2xsWkV4cGMzUmxibVZ5Y3k1d2RYTm9LR3hwYzNSbGJtVnlLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNCcFppQW9hMlY1UTI5dFltOHBJSHRjYmlBZ0lDQWdJQ0FnWm05eUlDaDJZWElnYWlBOUlEQTdJR29nUENCclpYbERiMjFpYnk1clpYbE9ZVzFsY3k1c1pXNW5kR2c3SUdvZ0t6MGdNU2tnZTF4dUlDQWdJQ0FnSUNBZ0lIWmhjaUJwYm1SbGVDQTlJSEJ5WlhOelpXUkxaWGx6TG1sdVpHVjRUMllvYTJWNVEyOXRZbTh1YTJWNVRtRnRaWE5iYWwwcE8xeHVJQ0FnSUNBZ0lDQWdJR2xtSUNocGJtUmxlQ0FoUFQwZ0xURXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIQnlaWE56WldSTFpYbHpMbk53YkdsalpTaHBibVJsZUN3Z01TazdYRzRnSUNBZ0lDQWdJQ0FnSUNCcUlDMDlJREU3WEc0Z0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVJQ0I5WEc1OU8xeHVYRzVMWlhsaWIyRnlaQzV3Y205MGIzUjVjR1V1WDJOc1pXRnlRbWx1WkdsdVozTWdQU0JtZFc1amRHbHZiaWhsZG1WdWRDa2dlMXh1SUNCbGRtVnVkQ0I4ZkNBb1pYWmxiblFnUFNCN2ZTazdYRzVjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQjBhR2x6TGw5aGNIQnNhV1ZrVEdsemRHVnVaWEp6TG14bGJtZDBhRHNnYVNBclBTQXhLU0I3WEc0Z0lDQWdkbUZ5SUd4cGMzUmxibVZ5SUQwZ2RHaHBjeTVmWVhCd2JHbGxaRXhwYzNSbGJtVnljMXRwWFR0Y2JpQWdJQ0IyWVhJZ2EyVjVRMjl0WW04Z1BTQnNhWE4wWlc1bGNpNXJaWGxEYjIxaWJ6dGNiaUFnSUNCcFppQW9hMlY1UTI5dFltOGdQVDA5SUc1MWJHd2dmSHdnSVd0bGVVTnZiV0p2TG1Ob1pXTnJLSFJvYVhNdVgyeHZZMkZzWlM1d2NtVnpjMlZrUzJWNWN5a3BJSHRjYmlBZ0lDQWdJR3hwYzNSbGJtVnlMbkJ5WlhabGJuUlNaWEJsWVhRZ1BTQnNhWE4wWlc1bGNpNXdjbVYyWlc1MFVtVndaV0YwUW5sRVpXWmhkV3gwTzF4dUlDQWdJQ0FnYkdsemRHVnVaWEl1Y21Wc1pXRnpaVWhoYm1Sc1pYSXVZMkZzYkNoMGFHbHpMQ0JsZG1WdWRDazdYRzRnSUNBZ0lDQjBhR2x6TGw5aGNIQnNhV1ZrVEdsemRHVnVaWEp6TG5Od2JHbGpaU2hwTENBeEtUdGNiaUFnSUNBZ0lHa2dMVDBnTVR0Y2JpQWdJQ0I5WEc0Z0lIMWNibjA3WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1MyVjVZbTloY21RN1hHNGlYWDA9IiwiXG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2tleS1jb21ibycpO1xuXG5cbmZ1bmN0aW9uIExvY2FsZShuYW1lKSB7XG4gIHRoaXMubG9jYWxlTmFtZSAgICAgPSBuYW1lO1xuICB0aGlzLnByZXNzZWRLZXlzICAgID0gW107XG4gIHRoaXMuX2FwcGxpZWRNYWNyb3MgPSBbXTtcbiAgdGhpcy5fa2V5TWFwICAgICAgICA9IHt9O1xuICB0aGlzLl9raWxsS2V5Q29kZXMgID0gW107XG4gIHRoaXMuX21hY3JvcyAgICAgICAgPSBbXTtcbn1cblxuTG9jYWxlLnByb3RvdHlwZS5iaW5kS2V5Q29kZSA9IGZ1bmN0aW9uKGtleUNvZGUsIGtleU5hbWVzKSB7XG4gIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XG4gICAga2V5TmFtZXMgPSBba2V5TmFtZXNdO1xuICB9XG5cbiAgdGhpcy5fa2V5TWFwW2tleUNvZGVdID0ga2V5TmFtZXM7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLmJpbmRNYWNybyA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBrZXlOYW1lcykge1xuICBpZiAodHlwZW9mIGtleU5hbWVzID09PSAnc3RyaW5nJykge1xuICAgIGtleU5hbWVzID0gWyBrZXlOYW1lcyBdO1xuICB9XG5cbiAgdmFyIGhhbmRsZXIgPSBudWxsO1xuICBpZiAodHlwZW9mIGtleU5hbWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaGFuZGxlciA9IGtleU5hbWVzO1xuICAgIGtleU5hbWVzID0gbnVsbDtcbiAgfVxuXG4gIHZhciBtYWNybyA9IHtcbiAgICBrZXlDb21ibyA6IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0ciksXG4gICAga2V5TmFtZXMgOiBrZXlOYW1lcyxcbiAgICBoYW5kbGVyICA6IGhhbmRsZXJcbiAgfTtcblxuICB0aGlzLl9tYWNyb3MucHVzaChtYWNybyk7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLmdldEtleUNvZGVzID0gZnVuY3Rpb24oa2V5TmFtZSkge1xuICB2YXIga2V5Q29kZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5Q29kZSBpbiB0aGlzLl9rZXlNYXApIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9rZXlNYXBba2V5Q29kZV0uaW5kZXhPZihrZXlOYW1lKTtcbiAgICBpZiAoaW5kZXggPiAtMSkgeyBrZXlDb2Rlcy5wdXNoKGtleUNvZGV8MCk7IH1cbiAgfVxuICByZXR1cm4ga2V5Q29kZXM7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLmdldEtleU5hbWVzID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICByZXR1cm4gdGhpcy5fa2V5TWFwW2tleUNvZGVdIHx8IFtdO1xufTtcblxuTG9jYWxlLnByb3RvdHlwZS5zZXRLaWxsS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB0aGlzLnNldEtpbGxLZXkoa2V5Q29kZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLl9raWxsS2V5Q29kZXMucHVzaChrZXlDb2RlKTtcbn07XG5cbkxvY2FsZS5wcm90b3R5cGUucHJlc3NLZXkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMucHJlc3NLZXkoa2V5Q29kZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIga2V5TmFtZXMgPSB0aGlzLmdldEtleU5hbWVzKGtleUNvZGUpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSkgPT09IC0xKSB7XG4gICAgICB0aGlzLnByZXNzZWRLZXlzLnB1c2goa2V5TmFtZXNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuX2FwcGx5TWFjcm9zKCk7XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLnJlbGVhc2VLZXkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHRoaXMucmVsZWFzZUtleShrZXlDb2Rlc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgZWxzZSB7XG4gICAgdmFyIGtleU5hbWVzICAgICAgICAgPSB0aGlzLmdldEtleU5hbWVzKGtleUNvZGUpO1xuICAgIHZhciBraWxsS2V5Q29kZUluZGV4ID0gdGhpcy5fa2lsbEtleUNvZGVzLmluZGV4T2Yoa2V5Q29kZSk7XG4gICAgXG4gICAgaWYgKGtpbGxLZXlDb2RlSW5kZXggPiAtMSkge1xuICAgICAgdGhpcy5wcmVzc2VkS2V5cy5sZW5ndGggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihrZXlOYW1lc1tpXSk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fY2xlYXJNYWNyb3MoKTtcbiAgfVxufTtcblxuTG9jYWxlLnByb3RvdHlwZS5fYXBwbHlNYWNyb3MgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG1hY3JvcyA9IHRoaXMuX21hY3Jvcy5zbGljZSgwKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYWNyb3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbWFjcm8gPSBtYWNyb3NbaV07XG4gICAgaWYgKG1hY3JvLmtleUNvbWJvLmNoZWNrKHRoaXMucHJlc3NlZEtleXMpKSB7XG4gICAgICBpZiAobWFjcm8uaGFuZGxlcikge1xuICAgICAgICBtYWNyby5rZXlOYW1lcyA9IG1hY3JvLmhhbmRsZXIodGhpcy5wcmVzc2VkS2V5cyk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgIGlmICh0aGlzLnByZXNzZWRLZXlzLmluZGV4T2YobWFjcm8ua2V5TmFtZXNbal0pID09PSAtMSkge1xuICAgICAgICAgIHRoaXMucHJlc3NlZEtleXMucHVzaChtYWNyby5rZXlOYW1lc1tqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGxpZWRNYWNyb3MucHVzaChtYWNybyk7XG4gICAgfVxuICB9XG59O1xuXG5Mb2NhbGUucHJvdG90eXBlLl9jbGVhck1hY3JvcyA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRNYWNyb3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgbWFjcm8gPSB0aGlzLl9hcHBsaWVkTWFjcm9zW2ldO1xuICAgIGlmICghbWFjcm8ua2V5Q29tYm8uY2hlY2sodGhpcy5wcmVzc2VkS2V5cykpIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWFjcm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKG1hY3JvLmtleU5hbWVzW2pdKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtYWNyby5oYW5kbGVyKSB7XG4gICAgICAgIG1hY3JvLmtleU5hbWVzID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FwcGxpZWRNYWNyb3Muc3BsaWNlKGksIDEpO1xuICAgICAgaSAtPSAxO1xuICAgIH1cbiAgfVxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsZTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsb2NhbGUsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcblxuICAvLyBnZW5lcmFsXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzLCAgIFsnY2FuY2VsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOCwgICBbJ2JhY2tzcGFjZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDksICAgWyd0YWInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMiwgIFsnY2xlYXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMywgIFsnZW50ZXInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNiwgIFsnc2hpZnQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNywgIFsnY3RybCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4LCAgWydhbHQnLCAnbWVudSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5LCAgWydwYXVzZScsICdicmVhayddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIwLCAgWydjYXBzbG9jayddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDI3LCAgWydlc2NhcGUnLCAnZXNjJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzIsICBbJ3NwYWNlJywgJ3NwYWNlYmFyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzMsICBbJ3BhZ2V1cCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM0LCAgWydwYWdlZG93biddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM1LCAgWydlbmQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzNiwgIFsnaG9tZSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM3LCAgWydsZWZ0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzgsICBbJ3VwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMzksICBbJ3JpZ2h0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDAsICBbJ2Rvd24nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0MSwgIFsnc2VsZWN0J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDIsICBbJ3ByaW50c2NyZWVuJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDMsICBbJ2V4ZWN1dGUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NCwgIFsnc25hcHNob3QnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NSwgIFsnaW5zZXJ0JywgJ2lucyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ2LCAgWydkZWxldGUnLCAnZGVsJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNDcsICBbJ2hlbHAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxNDUsIFsnc2Nyb2xsbG9jaycsICdzY3JvbGwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxODcsIFsnZXF1YWwnLCAnZXF1YWxzaWduJywgJz0nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxODgsIFsnY29tbWEnLCAnLCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MCwgWydwZXJpb2QnLCAnLiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MSwgWydzbGFzaCcsICdmb3J3YXJkc2xhc2gnLCAnLyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MiwgWydncmF2ZWFjY2VudCcsICdgJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMjE5LCBbJ29wZW5icmFja2V0JywgJ1snXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjAsIFsnYmFja3NsYXNoJywgJ1xcXFwnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjEsIFsnY2xvc2VicmFja2V0JywgJ10nXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjIsIFsnYXBvc3Ryb3BoZScsICdcXCcnXSk7XG5cbiAgLy8gMC05XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OCwgWyd6ZXJvJywgJzAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OSwgWydvbmUnLCAnMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUwLCBbJ3R3bycsICcyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTEsIFsndGhyZWUnLCAnMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUyLCBbJ2ZvdXInLCAnNCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUzLCBbJ2ZpdmUnLCAnNSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU0LCBbJ3NpeCcsICc2J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoNTUsIFsnc2V2ZW4nLCAnNyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDU2LCBbJ2VpZ2h0JywgJzgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NywgWyduaW5lJywgJzknXSk7XG5cbiAgLy8gbnVtcGFkXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NiwgWydudW16ZXJvJywgJ251bTAnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NywgWydudW1vbmUnLCAnbnVtMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk4LCBbJ251bXR3bycsICdudW0yJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoOTksIFsnbnVtdGhyZWUnLCAnbnVtMyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMCwgWydudW1mb3VyJywgJ251bTQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDEsIFsnbnVtZml2ZScsICdudW01J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAyLCBbJ251bXNpeCcsICdudW02J10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTAzLCBbJ251bXNldmVuJywgJ251bTcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDQsIFsnbnVtZWlnaHQnLCAnbnVtOCddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNSwgWydudW1uaW5lJywgJ251bTknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDYsIFsnbnVtbXVsdGlwbHknLCAnbnVtKiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNywgWydudW1hZGQnLCAnbnVtKyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOCwgWydudW1lbnRlciddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOSwgWydudW1zdWJ0cmFjdCcsICdudW0tJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTEwLCBbJ251bWRlY2ltYWwnLCAnbnVtLiddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMSwgWydudW1kaXZpZGUnLCAnbnVtLyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE0NCwgWydudW1sb2NrJywgJ251bSddKTtcblxuICAvLyBmdW5jdGlvbiBrZXlzXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTIsIFsnZjEnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTMsIFsnZjInXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTQsIFsnZjMnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTUsIFsnZjQnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTYsIFsnZjUnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTcsIFsnZjYnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTgsIFsnZjcnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTksIFsnZjgnXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjAsIFsnZjknXSk7XG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjEsIFsnZjEwJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUoMTIyLCBbJ2YxMSddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEyMywgWydmMTInXSk7XG5cbiAgLy8gc2Vjb25kYXJ5IGtleSBzeW1ib2xzXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgYCcsIFsndGlsZGUnLCAnfiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAxJywgWydleGNsYW1hdGlvbicsICdleGNsYW1hdGlvbnBvaW50JywgJyEnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMicsIFsnYXQnLCAnQCddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAzJywgWydudW1iZXInLCAnIyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA0JywgWydkb2xsYXInLCAnZG9sbGFycycsICdkb2xsYXJzaWduJywgJyQnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNScsIFsncGVyY2VudCcsICclJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDYnLCBbJ2NhcmV0JywgJ14nXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNycsIFsnYW1wZXJzYW5kJywgJ2FuZCcsICcmJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDgnLCBbJ2FzdGVyaXNrJywgJyonXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOScsIFsnb3BlbnBhcmVuJywgJygnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMCcsIFsnY2xvc2VwYXJlbicsICcpJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC0nLCBbJ3VuZGVyc2NvcmUnLCAnXyddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA9JywgWydwbHVzJywgJysnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgWycsIFsnb3BlbmN1cmx5YnJhY2UnLCAnb3BlbmN1cmx5YnJhY2tldCcsICd7J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIF0nLCBbJ2Nsb3NlY3VybHlicmFjZScsICdjbG9zZWN1cmx5YnJhY2tldCcsICd9J10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFxcXFwnLCBbJ3ZlcnRpY2FsYmFyJywgJ3wnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOycsIFsnY29sb24nLCAnOiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBcXCcnLCBbJ3F1b3RhdGlvbm1hcmsnLCAnXFwnJ10pO1xuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArICEsJywgWydvcGVuYW5nbGVicmFja2V0JywgJzwnXSk7XG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLicsIFsnY2xvc2VhbmdsZWJyYWNrZXQnLCAnPiddKTtcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAvJywgWydxdWVzdGlvbm1hcmsnLCAnPyddKTtcblxuICAvL2EteiBhbmQgQS1aXG4gIGZvciAodmFyIGtleUNvZGUgPSA2NTsga2V5Q29kZSA8PSA5MDsga2V5Q29kZSArPSAxKSB7XG4gICAgdmFyIGtleU5hbWUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleUNvZGUgKyAzMik7XG4gICAgdmFyIGNhcGl0YWxLZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlKTtcbiAgXHRsb2NhbGUuYmluZEtleUNvZGUoa2V5Q29kZSwga2V5TmFtZSk7XG4gIFx0bG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAnICsga2V5TmFtZSwgY2FwaXRhbEtleU5hbWUpO1xuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ2NhcHNsb2NrICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcbiAgfVxuXG4gIC8vIGJyb3dzZXIgY2F2ZWF0c1xuICB2YXIgc2VtaWNvbG9uS2V5Q29kZSA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gNTkgIDogMTg2O1xuICB2YXIgZGFzaEtleUNvZGUgICAgICA9IHVzZXJBZ2VudC5tYXRjaCgnRmlyZWZveCcpID8gMTczIDogMTg5O1xuICB2YXIgbGVmdENvbW1hbmRLZXlDb2RlO1xuICB2YXIgcmlnaHRDb21tYW5kS2V5Q29kZTtcbiAgaWYgKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiAodXNlckFnZW50Lm1hdGNoKCdTYWZhcmknKSB8fCB1c2VyQWdlbnQubWF0Y2goJ0Nocm9tZScpKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSA5MTtcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gOTM7XG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdPcGVyYScpKSB7XG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDE3O1xuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSAxNztcbiAgfSBlbHNlIGlmKHBsYXRmb3JtLm1hdGNoKCdNYWMnKSAmJiB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSkge1xuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSAyMjQ7XG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDIyNDtcbiAgfVxuICBsb2NhbGUuYmluZEtleUNvZGUoc2VtaWNvbG9uS2V5Q29kZSwgICAgWydzZW1pY29sb24nLCAnOyddKTtcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGRhc2hLZXlDb2RlLCAgICAgICAgIFsnZGFzaCcsICctJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUobGVmdENvbW1hbmRLZXlDb2RlLCAgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ2xlZnRjb21tYW5kJywgJ2xlZnR3aW5kb3dzJywgJ2xlZnR3aW4nLCAnbGVmdHN1cGVyJ10pO1xuICBsb2NhbGUuYmluZEtleUNvZGUocmlnaHRDb21tYW5kS2V5Q29kZSwgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ3JpZ2h0Y29tbWFuZCcsICdyaWdodHdpbmRvd3MnLCAncmlnaHR3aW4nLCAncmlnaHRzdXBlciddKTtcblxuICAvLyBraWxsIGtleXNcbiAgbG9jYWxlLnNldEtpbGxLZXkoJ2NvbW1hbmQnKTtcbn07XG4iXX0=
