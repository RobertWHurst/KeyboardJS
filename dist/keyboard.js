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
  });
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
                                listener.keyCombo.isEqual(keyComboStr);
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
    return a.keyCombo.keyNames.length < b.keyCombo.keyNames.length;
  }).forEach(function(l) {
    var mapIndex = -1;
    for (var i = 0; i < listenerGroupMap.length; i += 1) {
      if (listenerGroupMap[i].isEqual(l.keyCombo)) {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9rZXlib2FyZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbnZhciBMb2NhbGUgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xyXG52YXIgS2V5Q29tYm8gPSByZXF1aXJlKCcuL2tleS1jb21ibycpO1xyXG5cclxuXHJcbmZ1bmN0aW9uIEtleWJvYXJkKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgcGxhdGZvcm0sIHVzZXJBZ2VudCkge1xyXG4gIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgID0gbnVsbDtcclxuICB0aGlzLl9jdXJyZW50Q29udGV4dCAgICAgICA9IG51bGw7XHJcbiAgdGhpcy5fY29udGV4dHMgICAgICAgICAgICAgPSB7fTtcclxuICB0aGlzLl9saXN0ZW5lcnMgICAgICAgICAgICA9IFtdO1xyXG4gIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMgICAgID0gW107XHJcbiAgdGhpcy5fbG9jYWxlcyAgICAgICAgICAgICAgPSB7fTtcclxuICB0aGlzLl90YXJnZXRFbGVtZW50ICAgICAgICA9IG51bGw7XHJcbiAgdGhpcy5fdGFyZ2V0V2luZG93ICAgICAgICAgPSBudWxsO1xyXG4gIHRoaXMuX3RhcmdldFBsYXRmb3JtICAgICAgID0gJyc7XHJcbiAgdGhpcy5fdGFyZ2V0VXNlckFnZW50ICAgICAgPSAnJztcclxuICB0aGlzLl9pc01vZGVybkJyb3dzZXIgICAgICA9IGZhbHNlO1xyXG4gIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gbnVsbDtcclxuICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcgICA9IG51bGw7XHJcbiAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nICAgPSBudWxsO1xyXG4gIHRoaXMuX3BhdXNlZCAgICAgICAgICAgICAgID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuc2V0Q29udGV4dCgnZ2xvYmFsJyk7XHJcbiAgdGhpcy53YXRjaCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpO1xyXG59XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuc2V0TG9jYWxlID0gZnVuY3Rpb24obG9jYWxlTmFtZSwgbG9jYWxlQnVpbGRlcikge1xyXG4gIHZhciBsb2NhbGUgPSBudWxsO1xyXG4gIGlmICh0eXBlb2YgbG9jYWxlTmFtZSA9PT0gJ3N0cmluZycpIHtcclxuXHJcbiAgICBpZiAobG9jYWxlQnVpbGRlcikge1xyXG4gICAgICBsb2NhbGUgPSBuZXcgTG9jYWxlKGxvY2FsZU5hbWUpO1xyXG4gICAgICBsb2NhbGVCdWlsZGVyKGxvY2FsZSwgdGhpcy5fdGFyZ2V0UGxhdGZvcm0sIHRoaXMuX3RhcmdldFVzZXJBZ2VudCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsb2NhbGUgPSB0aGlzLl9sb2NhbGVzW2xvY2FsZU5hbWVdIHx8IG51bGw7XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIGxvY2FsZSAgICAgPSBsb2NhbGVOYW1lO1xyXG4gICAgbG9jYWxlTmFtZSA9IGxvY2FsZS5fbG9jYWxlTmFtZTtcclxuICB9XHJcblxyXG4gIHRoaXMuX2xvY2FsZSAgICAgICAgICAgICAgPSBsb2NhbGU7XHJcbiAgdGhpcy5fbG9jYWxlc1tsb2NhbGVOYW1lXSA9IGxvY2FsZTtcclxuICBpZiAobG9jYWxlKSB7XHJcbiAgICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMgPSBsb2NhbGUucHJlc3NlZEtleXM7XHJcbiAgfVxyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLmdldExvY2FsZSA9IGZ1bmN0aW9uKGxvY2FsTmFtZSkge1xyXG4gIGxvY2FsTmFtZSB8fCAobG9jYWxOYW1lID0gdGhpcy5fbG9jYWxlLmxvY2FsZU5hbWUpO1xyXG4gIHJldHVybiB0aGlzLl9sb2NhbGVzW2xvY2FsTmFtZV0gfHwgbnVsbDtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIsIHByZXZlbnRSZXBlYXRCeURlZmF1bHQpIHtcclxuICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0ID0gcmVsZWFzZUhhbmRsZXI7XHJcbiAgICByZWxlYXNlSGFuZGxlciAgICAgICAgID0gcHJlc3NIYW5kbGVyO1xyXG4gICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA9IGtleUNvbWJvU3RyO1xyXG4gICAga2V5Q29tYm9TdHIgICAgICAgICAgICA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBpZiAoXHJcbiAgICBrZXlDb21ib1N0ciAmJlxyXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnb2JqZWN0JyAmJlxyXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcclxuICApIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29tYm9TdHIubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgdGhpcy5iaW5kKGtleUNvbWJvU3RyW2ldLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyKTtcclxuICAgIH1cclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRoaXMuX2xpc3RlbmVycy5wdXNoKHtcclxuICAgIGtleUNvbWJvICAgICAgICAgICAgICAgOiBrZXlDb21ib1N0ciA/IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0cikgOiBudWxsLFxyXG4gICAgcHJlc3NIYW5kbGVyICAgICAgICAgICA6IHByZXNzSGFuZGxlciAgICAgICAgICAgfHwgbnVsbCxcclxuICAgIHJlbGVhc2VIYW5kbGVyICAgICAgICAgOiByZWxlYXNlSGFuZGxlciAgICAgICAgIHx8IG51bGwsXHJcbiAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgIDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZSxcclxuICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgOiBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IHx8IGZhbHNlXHJcbiAgfSk7XHJcbn07XHJcbktleWJvYXJkLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEtleWJvYXJkLnByb3RvdHlwZS5iaW5kO1xyXG5LZXlib2FyZC5wcm90b3R5cGUub24gICAgICAgICAgPSBLZXlib2FyZC5wcm90b3R5cGUuYmluZDtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbihrZXlDb21ib1N0ciwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcikge1xyXG4gIGlmIChrZXlDb21ib1N0ciA9PT0gbnVsbCB8fCB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdmdW5jdGlvbicpIHtcclxuICAgIHJlbGVhc2VIYW5kbGVyID0gcHJlc3NIYW5kbGVyO1xyXG4gICAgcHJlc3NIYW5kbGVyICAgPSBrZXlDb21ib1N0cjtcclxuICAgIGtleUNvbWJvU3RyID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGlmIChcclxuICAgIGtleUNvbWJvU3RyICYmXHJcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIgPT09ICdvYmplY3QnICYmXHJcbiAgICB0eXBlb2Yga2V5Q29tYm9TdHIubGVuZ3RoID09PSAnbnVtYmVyJ1xyXG4gICkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb21ib1N0ci5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICB0aGlzLnVuYmluZChrZXlDb21ib1N0cltpXSwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XHJcbiAgICB9XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xpc3RlbmVycy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgdmFyIGxpc3RlbmVyID0gdGhpcy5fbGlzdGVuZXJzW2ldO1xyXG5cclxuICAgIHZhciBjb21ib01hdGNoZXMgICAgICAgICAgPSAha2V5Q29tYm9TdHIgJiYgIWxpc3RlbmVyLmtleUNvbWJvIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIua2V5Q29tYm8uaXNFcXVhbChrZXlDb21ib1N0cik7XHJcbiAgICB2YXIgcHJlc3NIYW5kbGVyTWF0Y2hlcyAgID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcHJlc3NIYW5kbGVyICYmICFsaXN0ZW5lci5wcmVzc0hhbmRsZXIgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVzc0hhbmRsZXIgPT09IGxpc3RlbmVyLnByZXNzSGFuZGxlcjtcclxuICAgIHZhciByZWxlYXNlSGFuZGxlck1hdGNoZXMgPSAhcHJlc3NIYW5kbGVyICYmICFyZWxlYXNlSGFuZGxlciB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFyZWxlYXNlSGFuZGxlciAmJiAhbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxlYXNlSGFuZGxlciA9PT0gbGlzdGVuZXIucmVsZWFzZUhhbmRsZXI7XHJcblxyXG4gICAgaWYgKGNvbWJvTWF0Y2hlcyAmJiBwcmVzc0hhbmRsZXJNYXRjaGVzICYmIHJlbGVhc2VIYW5kbGVyTWF0Y2hlcykge1xyXG4gICAgICB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICBpIC09IDE7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5LZXlib2FyZC5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBLZXlib2FyZC5wcm90b3R5cGUudW5iaW5kO1xyXG5LZXlib2FyZC5wcm90b3R5cGUub2ZmICAgICAgICAgICAgPSBLZXlib2FyZC5wcm90b3R5cGUudW5iaW5kO1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnNldENvbnRleHQgPSBmdW5jdGlvbihjb250ZXh0TmFtZSkge1xyXG4gIGlmKHRoaXMuX2xvY2FsZSkgeyB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7IH1cclxuXHJcbiAgaWYgKCF0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0pIHtcclxuICAgIHRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXSA9IFtdO1xyXG4gIH1cclxuICB0aGlzLl9saXN0ZW5lcnMgICAgICA9IHRoaXMuX2NvbnRleHRzW2NvbnRleHROYW1lXTtcclxuICB0aGlzLl9jdXJyZW50Q29udGV4dCA9IGNvbnRleHROYW1lO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLmdldENvbnRleHQgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gdGhpcy5fY3VycmVudENvbnRleHQ7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUud2l0aENvbnRleHQgPSBmdW5jdGlvbihjb250ZXh0TmFtZSwgY2FsbGJhY2spIHtcclxuICB2YXIgcHJldmlvdXNDb250ZXh0TmFtZSA9IHRoaXMuZ2V0Q29udGV4dCgpO1xyXG4gIHRoaXMuc2V0Q29udGV4dChjb250ZXh0TmFtZSk7XHJcblxyXG4gIGNhbGxiYWNrKCk7XHJcblxyXG4gIHRoaXMuc2V0Q29udGV4dChwcmV2aW91c0NvbnRleHROYW1lKTtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS53YXRjaCA9IGZ1bmN0aW9uKHRhcmdldFdpbmRvdywgdGFyZ2V0RWxlbWVudCwgdGFyZ2V0UGxhdGZvcm0sIHRhcmdldFVzZXJBZ2VudCkge1xyXG4gIHZhciBfdGhpcyA9IHRoaXM7XHJcblxyXG4gIHRoaXMuc3RvcCgpO1xyXG5cclxuICBpZiAoIXRhcmdldFdpbmRvdykge1xyXG4gICAgaWYgKCFnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lciAmJiAhZ2xvYmFsLmF0dGFjaEV2ZW50KSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgZ2xvYmFsIGZ1bmN0aW9ucyBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50LicpO1xyXG4gICAgfVxyXG4gICAgdGFyZ2V0V2luZG93ID0gZ2xvYmFsO1xyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiB0YXJnZXRXaW5kb3cubm9kZVR5cGUgPT09ICdudW1iZXInKSB7XHJcbiAgICB0YXJnZXRVc2VyQWdlbnQgPSB0YXJnZXRQbGF0Zm9ybTtcclxuICAgIHRhcmdldFBsYXRmb3JtICA9IHRhcmdldEVsZW1lbnQ7XHJcbiAgICB0YXJnZXRFbGVtZW50ICAgPSB0YXJnZXRXaW5kb3c7XHJcbiAgICB0YXJnZXRXaW5kb3cgICAgPSBnbG9iYWw7XHJcbiAgfVxyXG4gIFxyXG4gIGlmICghdGFyZ2V0V2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJiYgIXRhcmdldFdpbmRvdy5hdHRhY2hFdmVudCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50IG1ldGhvZHMgb24gdGFyZ2V0V2luZG93LicpO1xyXG4gIH1cclxuICBcclxuICB0aGlzLl9pc01vZGVybkJyb3dzZXIgPSAhIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xyXG5cclxuICB2YXIgdXNlckFnZW50ID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcclxuICB2YXIgcGxhdGZvcm0gID0gdGFyZ2V0V2luZG93Lm5hdmlnYXRvciAmJiB0YXJnZXRXaW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtICB8fCAnJztcclxuXHJcbiAgdGFyZ2V0RWxlbWVudCAgICYmIHRhcmdldEVsZW1lbnQgICAhPT0gbnVsbCB8fCAodGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93LmRvY3VtZW50KTtcclxuICB0YXJnZXRQbGF0Zm9ybSAgJiYgdGFyZ2V0UGxhdGZvcm0gICE9PSBudWxsIHx8ICh0YXJnZXRQbGF0Zm9ybSAgPSBwbGF0Zm9ybSk7XHJcbiAgdGFyZ2V0VXNlckFnZW50ICYmIHRhcmdldFVzZXJBZ2VudCAhPT0gbnVsbCB8fCAodGFyZ2V0VXNlckFnZW50ID0gdXNlckFnZW50KTtcclxuXHJcbiAgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgX3RoaXMucHJlc3NLZXkoZXZlbnQua2V5Q29kZSwgZXZlbnQpO1xyXG4gIH07XHJcbiAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIF90aGlzLnJlbGVhc2VLZXkoZXZlbnQua2V5Q29kZSwgZXZlbnQpO1xyXG4gIH07XHJcbiAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIF90aGlzLnJlbGVhc2VBbGxLZXlzKGV2ZW50KVxyXG4gIH07XHJcblxyXG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5ZG93bicsIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nKTtcclxuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xyXG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XHJcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldFdpbmRvdywgICdibHVyJywgICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcclxuXHJcbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0RWxlbWVudDtcclxuICB0aGlzLl90YXJnZXRXaW5kb3cgICAgPSB0YXJnZXRXaW5kb3c7XHJcbiAgdGhpcy5fdGFyZ2V0UGxhdGZvcm0gID0gdGFyZ2V0UGxhdGZvcm07XHJcbiAgdGhpcy5fdGFyZ2V0VXNlckFnZW50ID0gdGFyZ2V0VXNlckFnZW50O1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICBpZiAoIXRoaXMuX3RhcmdldEVsZW1lbnQgfHwgIXRoaXMuX3RhcmdldFdpbmRvdykgeyByZXR1cm47IH1cclxuXHJcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XHJcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgICB0aGlzLl90YXJnZXRLZXlVcEJpbmRpbmcpO1xyXG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldFdpbmRvdywgICdmb2N1cycsICAgdGhpcy5fdGFyZ2V0UmVzZXRCaW5kaW5nKTtcclxuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XHJcblxyXG4gIHRoaXMuX3RhcmdldFdpbmRvdyAgPSBudWxsO1xyXG4gIHRoaXMuX3RhcmdldEVsZW1lbnQgPSBudWxsO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnByZXNzS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSwgZXZlbnQpIHtcclxuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxyXG4gIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxyXG5cclxuICB0aGlzLl9sb2NhbGUucHJlc3NLZXkoa2V5Q29kZSk7XHJcbiAgdGhpcy5fYXBwbHlCaW5kaW5ncyhldmVudCk7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUucmVsZWFzZUtleSA9IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KSB7XHJcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cclxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cclxuXHJcbiAgdGhpcy5fbG9jYWxlLnJlbGVhc2VLZXkoa2V5Q29kZSk7XHJcbiAgdGhpcy5fY2xlYXJCaW5kaW5ncyhldmVudCk7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUucmVsZWFzZUFsbEtleXMgPSBmdW5jdGlvbihldmVudCkge1xyXG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XHJcbiAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XHJcblxyXG4gIHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5sZW5ndGggPSAwO1xyXG4gIHRoaXMuX2NsZWFyQmluZGluZ3MoZXZlbnQpO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oKSB7XHJcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cclxuICBpZiAodGhpcy5fbG9jYWxlKSB7IHRoaXMucmVsZWFzZUFsbEtleXMoKTsgfVxyXG4gIHRoaXMuX3BhdXNlZCA9IHRydWU7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUucmVzdW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7XHJcbiAgdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuX2JpbmRFdmVudCA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xyXG4gIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xyXG4gICAgdGFyZ2V0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcclxuICAgIHRhcmdldEVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgaGFuZGxlcik7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuX3VuYmluZEV2ZW50ID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XHJcbiAgcmV0dXJuIHRoaXMuX2lzTW9kZXJuQnJvd3NlciA/XHJcbiAgICB0YXJnZXRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSkgOlxyXG4gICAgdGFyZ2V0RWxlbWVudC5kZXRhY2hFdmVudCgnb24nICsgZXZlbnROYW1lLCBoYW5kbGVyKTtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5fZ2V0R3JvdXBlZExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBsaXN0ZW5lckdyb3VwcyAgID0gW107XHJcbiAgdmFyIGxpc3RlbmVyR3JvdXBNYXAgPSBbXTtcclxuXHJcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcclxuICBpZiAodGhpcy5fY3VycmVudENvbnRleHQgIT09ICdnbG9iYWwnKSB7XHJcbiAgICBsaXN0ZW5lcnMgPSBbXS5jb25jYXQobGlzdGVuZXJzLCB0aGlzLl9jb250ZXh0cy5nbG9iYWwpO1xyXG4gIH1cclxuXHJcbiAgbGlzdGVuZXJzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgcmV0dXJuIGEua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoIDwgYi5rZXlDb21iby5rZXlOYW1lcy5sZW5ndGg7XHJcbiAgfSkuZm9yRWFjaChmdW5jdGlvbihsKSB7XHJcbiAgICB2YXIgbWFwSW5kZXggPSAtMTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICBpZiAobGlzdGVuZXJHcm91cE1hcFtpXS5pc0VxdWFsKGwua2V5Q29tYm8pKSB7XHJcbiAgICAgICAgbWFwSW5kZXggPSBpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAobWFwSW5kZXggPT09IC0xKSB7XHJcbiAgICAgIG1hcEluZGV4ID0gbGlzdGVuZXJHcm91cE1hcC5sZW5ndGg7XHJcbiAgICAgIGxpc3RlbmVyR3JvdXBNYXAucHVzaChsLmtleUNvbWJvKTtcclxuICAgIH1cclxuICAgIGlmICghbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdKSB7XHJcbiAgICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSA9IFtdO1xyXG4gICAgfVxyXG4gICAgbGlzdGVuZXJHcm91cHNbbWFwSW5kZXhdLnB1c2gobCk7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIGxpc3RlbmVyR3JvdXBzO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLl9hcHBseUJpbmRpbmdzID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICB2YXIgcHJldmVudFJlcGVhdCA9IGZhbHNlO1xyXG5cclxuICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XHJcbiAgZXZlbnQucHJldmVudFJlcGVhdCA9IGZ1bmN0aW9uKCkgeyBwcmV2ZW50UmVwZWF0ID0gdHJ1ZTsgfTtcclxuICBldmVudC5wcmVzc2VkS2V5cyAgID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xyXG5cclxuICB2YXIgcHJlc3NlZEtleXMgICAgPSB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMuc2xpY2UoMCk7XHJcbiAgdmFyIGxpc3RlbmVyR3JvdXBzID0gdGhpcy5fZ2V0R3JvdXBlZExpc3RlbmVycygpO1xyXG5cclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lckdyb3Vwcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgdmFyIGxpc3RlbmVycyA9IGxpc3RlbmVyR3JvdXBzW2ldO1xyXG4gICAgdmFyIGtleUNvbWJvICA9IGxpc3RlbmVyc1swXS5rZXlDb21ibztcclxuXHJcbiAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwgfHwga2V5Q29tYm8uY2hlY2socHJlc3NlZEtleXMpKSB7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGlzdGVuZXJzLmxlbmd0aDsgaiArPSAxKSB7XHJcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2pdO1xyXG5cclxuICAgICAgICBpZiAoa2V5Q29tYm8gPT09IG51bGwpIHtcclxuICAgICAgICAgIGxpc3RlbmVyID0ge1xyXG4gICAgICAgICAgICBrZXlDb21ibyAgICAgICAgICAgICAgIDogbmV3IEtleUNvbWJvKHByZXNzZWRLZXlzLmpvaW4oJysnKSksXHJcbiAgICAgICAgICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgOiBsaXN0ZW5lci5wcmVzc0hhbmRsZXIsXHJcbiAgICAgICAgICAgIHJlbGVhc2VIYW5kbGVyICAgICAgICAgOiBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlcixcclxuICAgICAgICAgICAgcHJldmVudFJlcGVhdCAgICAgICAgICA6IGxpc3RlbmVyLnByZXZlbnRSZXBlYXQsXHJcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXRCeURlZmF1bHQgOiBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0QnlEZWZhdWx0XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxpc3RlbmVyLnByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJldmVudFJlcGVhdCkge1xyXG4gICAgICAgICAgbGlzdGVuZXIucHJlc3NIYW5kbGVyLmNhbGwodGhpcywgZXZlbnQpO1xyXG4gICAgICAgICAgaWYgKHByZXZlbnRSZXBlYXQpIHtcclxuICAgICAgICAgICAgbGlzdGVuZXIucHJldmVudFJlcGVhdCA9IHByZXZlbnRSZXBlYXQ7XHJcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsaXN0ZW5lci5yZWxlYXNlSGFuZGxlciAmJiB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpID09PSAtMSkge1xyXG4gICAgICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChrZXlDb21ibykge1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwga2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoOyBqICs9IDEpIHtcclxuICAgICAgICAgIHZhciBpbmRleCA9IHByZXNzZWRLZXlzLmluZGV4T2Yoa2V5Q29tYm8ua2V5TmFtZXNbal0pO1xyXG4gICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICBwcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICBqIC09IDE7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLl9jbGVhckJpbmRpbmdzID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICBldmVudCB8fCAoZXZlbnQgPSB7fSk7XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYXBwbGllZExpc3RlbmVycy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgdmFyIGxpc3RlbmVyID0gdGhpcy5fYXBwbGllZExpc3RlbmVyc1tpXTtcclxuICAgIHZhciBrZXlDb21ibyA9IGxpc3RlbmVyLmtleUNvbWJvO1xyXG4gICAgaWYgKGtleUNvbWJvID09PSBudWxsIHx8ICFrZXlDb21iby5jaGVjayh0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMpKSB7XHJcbiAgICAgIGxpc3RlbmVyLnByZXZlbnRSZXBlYXQgPSBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0QnlEZWZhdWx0O1xyXG4gICAgICBsaXN0ZW5lci5yZWxlYXNlSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcclxuICAgICAgdGhpcy5fYXBwbGllZExpc3RlbmVycy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgIGkgLT0gMTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEtleWJvYXJkO1xyXG4iXX0=
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsImluZGV4LmpzIiwibGliXFxrZXktY29tYm8uanMiLCJsaWJcXGtleWJvYXJkLmpzIiwibGliXFxsb2NhbGUuanMiLCJsb2NhbGVzXFx1cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9XQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxyXG52YXIgS2V5Ym9hcmQgPSByZXF1aXJlKCcuL2xpYi9rZXlib2FyZCcpO1xyXG52YXIgTG9jYWxlICAgPSByZXF1aXJlKCcuL2xpYi9sb2NhbGUnKTtcclxudmFyIEtleUNvbWJvID0gcmVxdWlyZSgnLi9saWIva2V5LWNvbWJvJyk7XHJcblxyXG52YXIga2V5Ym9hcmQgPSBuZXcgS2V5Ym9hcmQoKTtcclxuXHJcbmtleWJvYXJkLnNldExvY2FsZSgndXMnLCByZXF1aXJlKCcuL2xvY2FsZXMvdXMnKSk7XHJcblxyXG5leHBvcnRzICAgICAgICAgID0gbW9kdWxlLmV4cG9ydHMgPSBrZXlib2FyZDtcclxuZXhwb3J0cy5LZXlib2FyZCA9IEtleWJvYXJkO1xyXG5leHBvcnRzLkxvY2FsZSAgID0gTG9jYWxlO1xyXG5leHBvcnRzLktleUNvbWJvID0gS2V5Q29tYm87XHJcbiIsIlxyXG5mdW5jdGlvbiBLZXlDb21ibyhrZXlDb21ib1N0cikge1xyXG4gIHRoaXMuc291cmNlU3RyID0ga2V5Q29tYm9TdHI7XHJcbiAgdGhpcy5zdWJDb21ib3MgPSBLZXlDb21iby5wYXJzZUNvbWJvU3RyKGtleUNvbWJvU3RyKTtcclxuICB0aGlzLmtleU5hbWVzICA9IHRoaXMuc3ViQ29tYm9zLnJlZHVjZShmdW5jdGlvbihtZW1vLCBuZXh0U3ViQ29tYm8pIHtcclxuICAgIHJldHVybiBtZW1vLmNvbmNhdChuZXh0U3ViQ29tYm8pO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBUT0RPOiBBZGQgc3VwcG9ydCBmb3Iga2V5IGNvbWJvIHNlcXVlbmNlc1xyXG5LZXlDb21iby5zZXF1ZW5jZURlbGltaW5hdG9yID0gJz4+JztcclxuS2V5Q29tYm8uY29tYm9EZWxpbWluYXRvciAgICA9ICc+JztcclxuS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3IgICAgICA9ICcrJztcclxuXHJcbktleUNvbWJvLnBhcnNlQ29tYm9TdHIgPSBmdW5jdGlvbihrZXlDb21ib1N0cikge1xyXG4gIHZhciBzdWJDb21ib1N0cnMgPSBLZXlDb21iby5fc3BsaXRTdHIoa2V5Q29tYm9TdHIsIEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IpO1xyXG4gIHZhciBjb21ibyAgICAgICAgPSBbXTtcclxuXHJcbiAgZm9yICh2YXIgaSA9IDAgOyBpIDwgc3ViQ29tYm9TdHJzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICBjb21iby5wdXNoKEtleUNvbWJvLl9zcGxpdFN0cihzdWJDb21ib1N0cnNbaV0sIEtleUNvbWJvLmtleURlbGltaW5hdG9yKSk7XHJcbiAgfVxyXG4gIHJldHVybiBjb21ibztcclxufTtcclxuXHJcbktleUNvbWJvLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKHByZXNzZWRLZXlOYW1lcykge1xyXG4gIHZhciBzdGFydGluZ0tleU5hbWVJbmRleCA9IDA7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YkNvbWJvcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgc3RhcnRpbmdLZXlOYW1lSW5kZXggPSB0aGlzLl9jaGVja1N1YkNvbWJvKFxyXG4gICAgICB0aGlzLnN1YkNvbWJvc1tpXSxcclxuICAgICAgc3RhcnRpbmdLZXlOYW1lSW5kZXgsXHJcbiAgICAgIHByZXNzZWRLZXlOYW1lc1xyXG4gICAgKTtcclxuICAgIGlmIChzdGFydGluZ0tleU5hbWVJbmRleCA9PT0gLTEpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgfVxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuS2V5Q29tYm8ucHJvdG90eXBlLmlzRXF1YWwgPSBmdW5jdGlvbihvdGhlcktleUNvbWJvKSB7XHJcbiAgaWYgKFxyXG4gICAgIW90aGVyS2V5Q29tYm8gfHxcclxuICAgIHR5cGVvZiBvdGhlcktleUNvbWJvICE9PSAnc3RyaW5nJyAmJlxyXG4gICAgdHlwZW9mIG90aGVyS2V5Q29tYm8gIT09ICdvYmplY3QnXHJcbiAgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICBpZiAodHlwZW9mIG90aGVyS2V5Q29tYm8gPT09ICdzdHJpbmcnKSB7XHJcbiAgICBvdGhlcktleUNvbWJvID0gbmV3IEtleUNvbWJvKG90aGVyS2V5Q29tYm8pO1xyXG4gIH1cclxuXHJcbiAgaWYgKHRoaXMuc3ViQ29tYm9zLmxlbmd0aCAhPT0gb3RoZXJLZXlDb21iby5zdWJDb21ib3MubGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJDb21ib3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIGlmICh0aGlzLnN1YkNvbWJvc1tpXS5sZW5ndGggIT09IG90aGVyS2V5Q29tYm8uc3ViQ29tYm9zW2ldLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3ViQ29tYm9zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICB2YXIgc3ViQ29tYm8gICAgICA9IHRoaXMuc3ViQ29tYm9zW2ldO1xyXG4gICAgdmFyIG90aGVyU3ViQ29tYm8gPSBvdGhlcktleUNvbWJvLnN1YkNvbWJvc1tpXS5zbGljZSgwKTtcclxuXHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN1YkNvbWJvLmxlbmd0aDsgaiArPSAxKSB7XHJcbiAgICAgIHZhciBrZXlOYW1lID0gc3ViQ29tYm9bal07XHJcbiAgICAgIHZhciBpbmRleCAgID0gb3RoZXJTdWJDb21iby5pbmRleE9mKGtleU5hbWUpO1xyXG5cclxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICBvdGhlclN1YkNvbWJvLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChvdGhlclN1YkNvbWJvLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbktleUNvbWJvLl9zcGxpdFN0ciA9IGZ1bmN0aW9uKHN0ciwgZGVsaW1pbmF0b3IpIHtcclxuICB2YXIgcyAgPSBzdHI7XHJcbiAgdmFyIGQgID0gZGVsaW1pbmF0b3I7XHJcbiAgdmFyIGMgID0gJyc7XHJcbiAgdmFyIGNhID0gW107XHJcblxyXG4gIGZvciAodmFyIGNpID0gMDsgY2kgPCBzLmxlbmd0aDsgY2kgKz0gMSkge1xyXG4gICAgaWYgKGNpID4gMCAmJiBzW2NpXSA9PT0gZCAmJiBzW2NpIC0gMV0gIT09ICdcXFxcJykge1xyXG4gICAgICBjYS5wdXNoKGMudHJpbSgpKTtcclxuICAgICAgYyA9ICcnO1xyXG4gICAgICBjaSArPSAxO1xyXG4gICAgfVxyXG4gICAgYyArPSBzW2NpXTtcclxuICB9XHJcbiAgaWYgKGMpIHsgY2EucHVzaChjLnRyaW0oKSk7IH1cclxuXHJcbiAgcmV0dXJuIGNhO1xyXG59O1xyXG5cclxuS2V5Q29tYm8ucHJvdG90eXBlLl9jaGVja1N1YkNvbWJvID0gZnVuY3Rpb24oc3ViQ29tYm8sIHN0YXJ0aW5nS2V5TmFtZUluZGV4LCBwcmVzc2VkS2V5TmFtZXMpIHtcclxuICBzdWJDb21ibyA9IHN1YkNvbWJvLnNsaWNlKDApO1xyXG4gIHByZXNzZWRLZXlOYW1lcyA9IHByZXNzZWRLZXlOYW1lcy5zbGljZShzdGFydGluZ0tleU5hbWVJbmRleCk7XHJcblxyXG4gIHZhciBlbmRJbmRleCA9IHN0YXJ0aW5nS2V5TmFtZUluZGV4O1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3ViQ29tYm8ubGVuZ3RoOyBpICs9IDEpIHtcclxuXHJcbiAgICB2YXIga2V5TmFtZSA9IHN1YkNvbWJvW2ldO1xyXG4gICAgaWYgKGtleU5hbWVbMF0gPT09ICdcXFxcJykge1xyXG4gICAgICB2YXIgZXNjYXBlZEtleU5hbWUgPSBrZXlOYW1lLnNsaWNlKDEpO1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgZXNjYXBlZEtleU5hbWUgPT09IEtleUNvbWJvLmNvbWJvRGVsaW1pbmF0b3IgfHxcclxuICAgICAgICBlc2NhcGVkS2V5TmFtZSA9PT0gS2V5Q29tYm8ua2V5RGVsaW1pbmF0b3JcclxuICAgICAgKSB7XHJcbiAgICAgICAga2V5TmFtZSA9IGVzY2FwZWRLZXlOYW1lO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGluZGV4ID0gcHJlc3NlZEtleU5hbWVzLmluZGV4T2Yoa2V5TmFtZSk7XHJcbiAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICBzdWJDb21iby5zcGxpY2UoaSwgMSk7XHJcbiAgICAgIGkgLT0gMTtcclxuICAgICAgaWYgKGluZGV4ID4gZW5kSW5kZXgpIHtcclxuICAgICAgICBlbmRJbmRleCA9IGluZGV4O1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzdWJDb21iby5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gZW5kSW5kZXg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIC0xO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gS2V5Q29tYm87XHJcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcblxyXG52YXIgTG9jYWxlID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcclxudmFyIEtleUNvbWJvID0gcmVxdWlyZSgnLi9rZXktY29tYm8nKTtcclxuXHJcblxyXG5mdW5jdGlvbiBLZXlib2FyZCh0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHBsYXRmb3JtLCB1c2VyQWdlbnQpIHtcclxuICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgICA9IG51bGw7XHJcbiAgdGhpcy5fY3VycmVudENvbnRleHQgICAgICAgPSBudWxsO1xyXG4gIHRoaXMuX2NvbnRleHRzICAgICAgICAgICAgID0ge307XHJcbiAgdGhpcy5fbGlzdGVuZXJzICAgICAgICAgICAgPSBbXTtcclxuICB0aGlzLl9hcHBsaWVkTGlzdGVuZXJzICAgICA9IFtdO1xyXG4gIHRoaXMuX2xvY2FsZXMgICAgICAgICAgICAgID0ge307XHJcbiAgdGhpcy5fdGFyZ2V0RWxlbWVudCAgICAgICAgPSBudWxsO1xyXG4gIHRoaXMuX3RhcmdldFdpbmRvdyAgICAgICAgID0gbnVsbDtcclxuICB0aGlzLl90YXJnZXRQbGF0Zm9ybSAgICAgICA9ICcnO1xyXG4gIHRoaXMuX3RhcmdldFVzZXJBZ2VudCAgICAgID0gJyc7XHJcbiAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyICAgICAgPSBmYWxzZTtcclxuICB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyA9IG51bGw7XHJcbiAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nICAgPSBudWxsO1xyXG4gIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyAgID0gbnVsbDtcclxuICB0aGlzLl9wYXVzZWQgICAgICAgICAgICAgICA9IGZhbHNlO1xyXG5cclxuICB0aGlzLnNldENvbnRleHQoJ2dsb2JhbCcpO1xyXG4gIHRoaXMud2F0Y2godGFyZ2V0V2luZG93LCB0YXJnZXRFbGVtZW50LCBwbGF0Zm9ybSwgdXNlckFnZW50KTtcclxufVxyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnNldExvY2FsZSA9IGZ1bmN0aW9uKGxvY2FsZU5hbWUsIGxvY2FsZUJ1aWxkZXIpIHtcclxuICB2YXIgbG9jYWxlID0gbnVsbDtcclxuICBpZiAodHlwZW9mIGxvY2FsZU5hbWUgPT09ICdzdHJpbmcnKSB7XHJcblxyXG4gICAgaWYgKGxvY2FsZUJ1aWxkZXIpIHtcclxuICAgICAgbG9jYWxlID0gbmV3IExvY2FsZShsb2NhbGVOYW1lKTtcclxuICAgICAgbG9jYWxlQnVpbGRlcihsb2NhbGUsIHRoaXMuX3RhcmdldFBsYXRmb3JtLCB0aGlzLl90YXJnZXRVc2VyQWdlbnQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbG9jYWxlID0gdGhpcy5fbG9jYWxlc1tsb2NhbGVOYW1lXSB8fCBudWxsO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBsb2NhbGUgICAgID0gbG9jYWxlTmFtZTtcclxuICAgIGxvY2FsZU5hbWUgPSBsb2NhbGUuX2xvY2FsZU5hbWU7XHJcbiAgfVxyXG5cclxuICB0aGlzLl9sb2NhbGUgICAgICAgICAgICAgID0gbG9jYWxlO1xyXG4gIHRoaXMuX2xvY2FsZXNbbG9jYWxlTmFtZV0gPSBsb2NhbGU7XHJcbiAgaWYgKGxvY2FsZSkge1xyXG4gICAgdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzID0gbG9jYWxlLnByZXNzZWRLZXlzO1xyXG4gIH1cclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5nZXRMb2NhbGUgPSBmdW5jdGlvbihsb2NhbE5hbWUpIHtcclxuICBsb2NhbE5hbWUgfHwgKGxvY2FsTmFtZSA9IHRoaXMuX2xvY2FsZS5sb2NhbGVOYW1lKTtcclxuICByZXR1cm4gdGhpcy5fbG9jYWxlc1tsb2NhbE5hbWVdIHx8IG51bGw7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBwcmVzc0hhbmRsZXIsIHJlbGVhc2VIYW5kbGVyLCBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0KSB7XHJcbiAgaWYgKGtleUNvbWJvU3RyID09PSBudWxsIHx8IHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgcHJldmVudFJlcGVhdEJ5RGVmYXVsdCA9IHJlbGVhc2VIYW5kbGVyO1xyXG4gICAgcmVsZWFzZUhhbmRsZXIgICAgICAgICA9IHByZXNzSGFuZGxlcjtcclxuICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgPSBrZXlDb21ib1N0cjtcclxuICAgIGtleUNvbWJvU3RyICAgICAgICAgICAgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgaWYgKFxyXG4gICAga2V5Q29tYm9TdHIgJiZcclxuICAgIHR5cGVvZiBrZXlDb21ib1N0ciA9PT0gJ29iamVjdCcgJiZcclxuICAgIHR5cGVvZiBrZXlDb21ib1N0ci5sZW5ndGggPT09ICdudW1iZXInXHJcbiAgKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvbWJvU3RyLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgIHRoaXMuYmluZChrZXlDb21ib1N0cltpXSwgcHJlc3NIYW5kbGVyLCByZWxlYXNlSGFuZGxlcik7XHJcbiAgICB9XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0aGlzLl9saXN0ZW5lcnMucHVzaCh7XHJcbiAgICBrZXlDb21ibyAgICAgICAgICAgICAgIDoga2V5Q29tYm9TdHIgPyBuZXcgS2V5Q29tYm8oa2V5Q29tYm9TdHIpIDogbnVsbCxcclxuICAgIHByZXNzSGFuZGxlciAgICAgICAgICAgOiBwcmVzc0hhbmRsZXIgICAgICAgICAgIHx8IG51bGwsXHJcbiAgICByZWxlYXNlSGFuZGxlciAgICAgICAgIDogcmVsZWFzZUhhbmRsZXIgICAgICAgICB8fCBudWxsLFxyXG4gICAgcHJldmVudFJlcGVhdCAgICAgICAgICA6IHByZXZlbnRSZXBlYXRCeURlZmF1bHQgfHwgZmFsc2UsXHJcbiAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IDogcHJldmVudFJlcGVhdEJ5RGVmYXVsdCB8fCBmYWxzZVxyXG4gIH0pO1xyXG59O1xyXG5LZXlib2FyZC5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBLZXlib2FyZC5wcm90b3R5cGUuYmluZDtcclxuS2V5Ym9hcmQucHJvdG90eXBlLm9uICAgICAgICAgID0gS2V5Ym9hcmQucHJvdG90eXBlLmJpbmQ7XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24oa2V5Q29tYm9TdHIsIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpIHtcclxuICBpZiAoa2V5Q29tYm9TdHIgPT09IG51bGwgfHwgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICByZWxlYXNlSGFuZGxlciA9IHByZXNzSGFuZGxlcjtcclxuICAgIHByZXNzSGFuZGxlciAgID0ga2V5Q29tYm9TdHI7XHJcbiAgICBrZXlDb21ib1N0ciA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBpZiAoXHJcbiAgICBrZXlDb21ib1N0ciAmJlxyXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyID09PSAnb2JqZWN0JyAmJlxyXG4gICAgdHlwZW9mIGtleUNvbWJvU3RyLmxlbmd0aCA9PT0gJ251bWJlcidcclxuICApIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29tYm9TdHIubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgdGhpcy51bmJpbmQoa2V5Q29tYm9TdHJbaV0sIHByZXNzSGFuZGxlciwgcmVsZWFzZUhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyc1tpXTtcclxuXHJcbiAgICB2YXIgY29tYm9NYXRjaGVzICAgICAgICAgID0gIWtleUNvbWJvU3RyICYmICFsaXN0ZW5lci5rZXlDb21ibyB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmtleUNvbWJvLmlzRXF1YWwoa2V5Q29tYm9TdHIpO1xyXG4gICAgdmFyIHByZXNzSGFuZGxlck1hdGNoZXMgICA9ICFwcmVzc0hhbmRsZXIgJiYgIXJlbGVhc2VIYW5kbGVyIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXByZXNzSGFuZGxlciAmJiAhbGlzdGVuZXIucHJlc3NIYW5kbGVyIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlc3NIYW5kbGVyID09PSBsaXN0ZW5lci5wcmVzc0hhbmRsZXI7XHJcbiAgICB2YXIgcmVsZWFzZUhhbmRsZXJNYXRjaGVzID0gIXByZXNzSGFuZGxlciAmJiAhcmVsZWFzZUhhbmRsZXIgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhcmVsZWFzZUhhbmRsZXIgJiYgIWxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsZWFzZUhhbmRsZXIgPT09IGxpc3RlbmVyLnJlbGVhc2VIYW5kbGVyO1xyXG5cclxuICAgIGlmIChjb21ib01hdGNoZXMgJiYgcHJlc3NIYW5kbGVyTWF0Y2hlcyAmJiByZWxlYXNlSGFuZGxlck1hdGNoZXMpIHtcclxuICAgICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcclxuICAgICAgaSAtPSAxO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuS2V5Ym9hcmQucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZDtcclxuS2V5Ym9hcmQucHJvdG90eXBlLm9mZiAgICAgICAgICAgID0gS2V5Ym9hcmQucHJvdG90eXBlLnVuYmluZDtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5zZXRDb250ZXh0ID0gZnVuY3Rpb24oY29udGV4dE5hbWUpIHtcclxuICBpZih0aGlzLl9sb2NhbGUpIHsgdGhpcy5yZWxlYXNlQWxsS2V5cygpOyB9XHJcblxyXG4gIGlmICghdGhpcy5fY29udGV4dHNbY29udGV4dE5hbWVdKSB7XHJcbiAgICB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV0gPSBbXTtcclxuICB9XHJcbiAgdGhpcy5fbGlzdGVuZXJzICAgICAgPSB0aGlzLl9jb250ZXh0c1tjb250ZXh0TmFtZV07XHJcbiAgdGhpcy5fY3VycmVudENvbnRleHQgPSBjb250ZXh0TmFtZTtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMuX2N1cnJlbnRDb250ZXh0O1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLndpdGhDb250ZXh0ID0gZnVuY3Rpb24oY29udGV4dE5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgdmFyIHByZXZpb3VzQ29udGV4dE5hbWUgPSB0aGlzLmdldENvbnRleHQoKTtcclxuICB0aGlzLnNldENvbnRleHQoY29udGV4dE5hbWUpO1xyXG5cclxuICBjYWxsYmFjaygpO1xyXG5cclxuICB0aGlzLnNldENvbnRleHQocHJldmlvdXNDb250ZXh0TmFtZSk7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUud2F0Y2ggPSBmdW5jdGlvbih0YXJnZXRXaW5kb3csIHRhcmdldEVsZW1lbnQsIHRhcmdldFBsYXRmb3JtLCB0YXJnZXRVc2VyQWdlbnQpIHtcclxuICB2YXIgX3RoaXMgPSB0aGlzO1xyXG5cclxuICB0aGlzLnN0b3AoKTtcclxuXHJcbiAgaWYgKCF0YXJnZXRXaW5kb3cpIHtcclxuICAgIGlmICghZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIgJiYgIWdsb2JhbC5hdHRhY2hFdmVudCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGdsb2JhbCBmdW5jdGlvbnMgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudC4nKTtcclxuICAgIH1cclxuICAgIHRhcmdldFdpbmRvdyA9IGdsb2JhbDtcclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2YgdGFyZ2V0V2luZG93Lm5vZGVUeXBlID09PSAnbnVtYmVyJykge1xyXG4gICAgdGFyZ2V0VXNlckFnZW50ID0gdGFyZ2V0UGxhdGZvcm07XHJcbiAgICB0YXJnZXRQbGF0Zm9ybSAgPSB0YXJnZXRFbGVtZW50O1xyXG4gICAgdGFyZ2V0RWxlbWVudCAgID0gdGFyZ2V0V2luZG93O1xyXG4gICAgdGFyZ2V0V2luZG93ICAgID0gZ2xvYmFsO1xyXG4gIH1cclxuICBcclxuICBpZiAoIXRhcmdldFdpbmRvdy5hZGRFdmVudExpc3RlbmVyICYmICF0YXJnZXRXaW5kb3cuYXR0YWNoRXZlbnQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudCBtZXRob2RzIG9uIHRhcmdldFdpbmRvdy4nKTtcclxuICB9XHJcbiAgXHJcbiAgdGhpcy5faXNNb2Rlcm5Ccm93c2VyID0gISF0YXJnZXRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcclxuXHJcbiAgdmFyIHVzZXJBZ2VudCA9IHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IgJiYgdGFyZ2V0V2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQgfHwgJyc7XHJcbiAgdmFyIHBsYXRmb3JtICA9IHRhcmdldFdpbmRvdy5uYXZpZ2F0b3IgJiYgdGFyZ2V0V2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSAgfHwgJyc7XHJcblxyXG4gIHRhcmdldEVsZW1lbnQgICAmJiB0YXJnZXRFbGVtZW50ICAgIT09IG51bGwgfHwgKHRhcmdldEVsZW1lbnQgICA9IHRhcmdldFdpbmRvdy5kb2N1bWVudCk7XHJcbiAgdGFyZ2V0UGxhdGZvcm0gICYmIHRhcmdldFBsYXRmb3JtICAhPT0gbnVsbCB8fCAodGFyZ2V0UGxhdGZvcm0gID0gcGxhdGZvcm0pO1xyXG4gIHRhcmdldFVzZXJBZ2VudCAmJiB0YXJnZXRVc2VyQWdlbnQgIT09IG51bGwgfHwgKHRhcmdldFVzZXJBZ2VudCA9IHVzZXJBZ2VudCk7XHJcblxyXG4gIHRoaXMuX3RhcmdldEtleURvd25CaW5kaW5nID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIF90aGlzLnByZXNzS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcclxuICB9O1xyXG4gIHRoaXMuX3RhcmdldEtleVVwQmluZGluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBfdGhpcy5yZWxlYXNlS2V5KGV2ZW50LmtleUNvZGUsIGV2ZW50KTtcclxuICB9O1xyXG4gIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBfdGhpcy5yZWxlYXNlQWxsS2V5cyhldmVudClcclxuICB9O1xyXG5cclxuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCB0aGlzLl90YXJnZXRLZXlEb3duQmluZGluZyk7XHJcbiAgdGhpcy5fYmluZEV2ZW50KHRhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcclxuICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0V2luZG93LCAgJ2ZvY3VzJywgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xyXG4gIHRoaXMuX2JpbmRFdmVudCh0YXJnZXRXaW5kb3csICAnYmx1cicsICAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XHJcblxyXG4gIHRoaXMuX3RhcmdldEVsZW1lbnQgICA9IHRhcmdldEVsZW1lbnQ7XHJcbiAgdGhpcy5fdGFyZ2V0V2luZG93ICAgID0gdGFyZ2V0V2luZG93O1xyXG4gIHRoaXMuX3RhcmdldFBsYXRmb3JtICA9IHRhcmdldFBsYXRmb3JtO1xyXG4gIHRoaXMuX3RhcmdldFVzZXJBZ2VudCA9IHRhcmdldFVzZXJBZ2VudDtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIF90aGlzID0gdGhpcztcclxuXHJcbiAgaWYgKCF0aGlzLl90YXJnZXRFbGVtZW50IHx8ICF0aGlzLl90YXJnZXRXaW5kb3cpIHsgcmV0dXJuOyB9XHJcblxyXG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXlkb3duJywgdGhpcy5fdGFyZ2V0S2V5RG93bkJpbmRpbmcpO1xyXG4gIHRoaXMuX3VuYmluZEV2ZW50KHRoaXMuX3RhcmdldEVsZW1lbnQsICdrZXl1cCcsICAgdGhpcy5fdGFyZ2V0S2V5VXBCaW5kaW5nKTtcclxuICB0aGlzLl91bmJpbmRFdmVudCh0aGlzLl90YXJnZXRXaW5kb3csICAnZm9jdXMnLCAgIHRoaXMuX3RhcmdldFJlc2V0QmluZGluZyk7XHJcbiAgdGhpcy5fdW5iaW5kRXZlbnQodGhpcy5fdGFyZ2V0V2luZG93LCAgJ2JsdXInLCAgICB0aGlzLl90YXJnZXRSZXNldEJpbmRpbmcpO1xyXG5cclxuICB0aGlzLl90YXJnZXRXaW5kb3cgID0gbnVsbDtcclxuICB0aGlzLl90YXJnZXRFbGVtZW50ID0gbnVsbDtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5wcmVzc0tleSA9IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KSB7XHJcbiAgaWYgKHRoaXMuX3BhdXNlZCkgeyByZXR1cm47IH1cclxuICBpZiAoIXRoaXMuX2xvY2FsZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0xvY2FsZSBub3Qgc2V0Jyk7IH1cclxuXHJcbiAgdGhpcy5fbG9jYWxlLnByZXNzS2V5KGtleUNvZGUpO1xyXG4gIHRoaXMuX2FwcGx5QmluZGluZ3MoZXZlbnQpO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnJlbGVhc2VLZXkgPSBmdW5jdGlvbihrZXlDb2RlLCBldmVudCkge1xyXG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XHJcbiAgaWYgKCF0aGlzLl9sb2NhbGUpIHsgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgbm90IHNldCcpOyB9XHJcblxyXG4gIHRoaXMuX2xvY2FsZS5yZWxlYXNlS2V5KGtleUNvZGUpO1xyXG4gIHRoaXMuX2NsZWFyQmluZGluZ3MoZXZlbnQpO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnJlbGVhc2VBbGxLZXlzID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICBpZiAodGhpcy5fcGF1c2VkKSB7IHJldHVybjsgfVxyXG4gIGlmICghdGhpcy5fbG9jYWxlKSB7IHRocm93IG5ldyBFcnJvcignTG9jYWxlIG5vdCBzZXQnKTsgfVxyXG5cclxuICB0aGlzLl9sb2NhbGUucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcclxuICB0aGlzLl9jbGVhckJpbmRpbmdzKGV2ZW50KTtcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xyXG4gIGlmICh0aGlzLl9wYXVzZWQpIHsgcmV0dXJuOyB9XHJcbiAgaWYgKHRoaXMuX2xvY2FsZSkgeyB0aGlzLnJlbGVhc2VBbGxLZXlzKCk7IH1cclxuICB0aGlzLl9wYXVzZWQgPSB0cnVlO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnJlc3VtZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5yZWxlYXNlQWxsS2V5cygpO1xyXG4gIHRoaXMuX2xpc3RlbmVycy5sZW5ndGggPSAwO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLl9iaW5kRXZlbnQgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpIHtcclxuICByZXR1cm4gdGhpcy5faXNNb2Rlcm5Ccm93c2VyID9cclxuICAgIHRhcmdldEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKSA6XHJcbiAgICB0YXJnZXRFbGVtZW50LmF0dGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGhhbmRsZXIpO1xyXG59O1xyXG5cclxuS2V5Ym9hcmQucHJvdG90eXBlLl91bmJpbmRFdmVudCA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xyXG4gIHJldHVybiB0aGlzLl9pc01vZGVybkJyb3dzZXIgP1xyXG4gICAgdGFyZ2V0RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpIDpcclxuICAgIHRhcmdldEVsZW1lbnQuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50TmFtZSwgaGFuZGxlcik7XHJcbn07XHJcblxyXG5LZXlib2FyZC5wcm90b3R5cGUuX2dldEdyb3VwZWRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgbGlzdGVuZXJHcm91cHMgICA9IFtdO1xyXG4gIHZhciBsaXN0ZW5lckdyb3VwTWFwID0gW107XHJcblxyXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XHJcbiAgaWYgKHRoaXMuX2N1cnJlbnRDb250ZXh0ICE9PSAnZ2xvYmFsJykge1xyXG4gICAgbGlzdGVuZXJzID0gW10uY29uY2F0KGxpc3RlbmVycywgdGhpcy5fY29udGV4dHMuZ2xvYmFsKTtcclxuICB9XHJcblxyXG4gIGxpc3RlbmVycy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgIHJldHVybiBhLmtleUNvbWJvLmtleU5hbWVzLmxlbmd0aCA8IGIua2V5Q29tYm8ua2V5TmFtZXMubGVuZ3RoO1xyXG4gIH0pLmZvckVhY2goZnVuY3Rpb24obCkge1xyXG4gICAgdmFyIG1hcEluZGV4ID0gLTE7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgaWYgKGxpc3RlbmVyR3JvdXBNYXBbaV0uaXNFcXVhbChsLmtleUNvbWJvKSkge1xyXG4gICAgICAgIG1hcEluZGV4ID0gaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKG1hcEluZGV4ID09PSAtMSkge1xyXG4gICAgICBtYXBJbmRleCA9IGxpc3RlbmVyR3JvdXBNYXAubGVuZ3RoO1xyXG4gICAgICBsaXN0ZW5lckdyb3VwTWFwLnB1c2gobC5rZXlDb21ibyk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWxpc3RlbmVyR3JvdXBzW21hcEluZGV4XSkge1xyXG4gICAgICBsaXN0ZW5lckdyb3Vwc1ttYXBJbmRleF0gPSBbXTtcclxuICAgIH1cclxuICAgIGxpc3RlbmVyR3JvdXBzW21hcEluZGV4XS5wdXNoKGwpO1xyXG4gIH0pO1xyXG4gIHJldHVybiBsaXN0ZW5lckdyb3VwcztcclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5fYXBwbHlCaW5kaW5ncyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgdmFyIHByZXZlbnRSZXBlYXQgPSBmYWxzZTtcclxuXHJcbiAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xyXG4gIGV2ZW50LnByZXZlbnRSZXBlYXQgPSBmdW5jdGlvbigpIHsgcHJldmVudFJlcGVhdCA9IHRydWU7IH07XHJcbiAgZXZlbnQucHJlc3NlZEtleXMgICA9IHRoaXMuX2xvY2FsZS5wcmVzc2VkS2V5cy5zbGljZSgwKTtcclxuXHJcbiAgdmFyIHByZXNzZWRLZXlzICAgID0gdGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzLnNsaWNlKDApO1xyXG4gIHZhciBsaXN0ZW5lckdyb3VwcyA9IHRoaXMuX2dldEdyb3VwZWRMaXN0ZW5lcnMoKTtcclxuXHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJHcm91cHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBsaXN0ZW5lcnMgPSBsaXN0ZW5lckdyb3Vwc1tpXTtcclxuICAgIHZhciBrZXlDb21ibyAgPSBsaXN0ZW5lcnNbMF0ua2V5Q29tYm87XHJcblxyXG4gICAgaWYgKGtleUNvbWJvID09PSBudWxsIHx8IGtleUNvbWJvLmNoZWNrKHByZXNzZWRLZXlzKSkge1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxpc3RlbmVycy5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tqXTtcclxuXHJcbiAgICAgICAgaWYgKGtleUNvbWJvID09PSBudWxsKSB7XHJcbiAgICAgICAgICBsaXN0ZW5lciA9IHtcclxuICAgICAgICAgICAga2V5Q29tYm8gICAgICAgICAgICAgICA6IG5ldyBLZXlDb21ibyhwcmVzc2VkS2V5cy5qb2luKCcrJykpLFxyXG4gICAgICAgICAgICBwcmVzc0hhbmRsZXIgICAgICAgICAgIDogbGlzdGVuZXIucHJlc3NIYW5kbGVyLFxyXG4gICAgICAgICAgICByZWxlYXNlSGFuZGxlciAgICAgICAgIDogbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIsXHJcbiAgICAgICAgICAgIHByZXZlbnRSZXBlYXQgICAgICAgICAgOiBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0LFxyXG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0QnlEZWZhdWx0IDogbGlzdGVuZXIucHJldmVudFJlcGVhdEJ5RGVmYXVsdFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsaXN0ZW5lci5wcmVzc0hhbmRsZXIgJiYgIWxpc3RlbmVyLnByZXZlbnRSZXBlYXQpIHtcclxuICAgICAgICAgIGxpc3RlbmVyLnByZXNzSGFuZGxlci5jYWxsKHRoaXMsIGV2ZW50KTtcclxuICAgICAgICAgIGlmIChwcmV2ZW50UmVwZWF0KSB7XHJcbiAgICAgICAgICAgIGxpc3RlbmVyLnByZXZlbnRSZXBlYXQgPSBwcmV2ZW50UmVwZWF0O1xyXG4gICAgICAgICAgICBwcmV2ZW50UmVwZWF0ICAgICAgICAgID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobGlzdGVuZXIucmVsZWFzZUhhbmRsZXIgJiYgdGhpcy5fYXBwbGllZExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSA9PT0gLTEpIHtcclxuICAgICAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoa2V5Q29tYm8pIHtcclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleUNvbWJvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XHJcbiAgICAgICAgICB2YXIgaW5kZXggPSBwcmVzc2VkS2V5cy5pbmRleE9mKGtleUNvbWJvLmtleU5hbWVzW2pdKTtcclxuICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcHJlc3NlZEtleXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgaiAtPSAxO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbktleWJvYXJkLnByb3RvdHlwZS5fY2xlYXJCaW5kaW5ncyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgZXZlbnQgfHwgKGV2ZW50ID0ge30pO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnNbaV07XHJcbiAgICB2YXIga2V5Q29tYm8gPSBsaXN0ZW5lci5rZXlDb21ibztcclxuICAgIGlmIChrZXlDb21ibyA9PT0gbnVsbCB8fCAha2V5Q29tYm8uY2hlY2sodGhpcy5fbG9jYWxlLnByZXNzZWRLZXlzKSkge1xyXG4gICAgICBsaXN0ZW5lci5wcmV2ZW50UmVwZWF0ID0gbGlzdGVuZXIucHJldmVudFJlcGVhdEJ5RGVmYXVsdDtcclxuICAgICAgbGlzdGVuZXIucmVsZWFzZUhhbmRsZXIuY2FsbCh0aGlzLCBldmVudCk7XHJcbiAgICAgIHRoaXMuX2FwcGxpZWRMaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICBpIC09IDE7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBLZXlib2FyZDtcclxuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklteHBZaTlyWlhsaWIyRnlaQzVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBGQlFVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRU0lzSW1acGJHVWlPaUpuWlc1bGNtRjBaV1F1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaVhISmNiblpoY2lCTWIyTmhiR1VnUFNCeVpYRjFhWEpsS0NjdUwyeHZZMkZzWlNjcE8xeHlYRzUyWVhJZ1MyVjVRMjl0WW04Z1BTQnlaWEYxYVhKbEtDY3VMMnRsZVMxamIyMWlieWNwTzF4eVhHNWNjbHh1WEhKY2JtWjFibU4wYVc5dUlFdGxlV0p2WVhKa0tIUmhjbWRsZEZkcGJtUnZkeXdnZEdGeVoyVjBSV3hsYldWdWRDd2djR3hoZEdadmNtMHNJSFZ6WlhKQloyVnVkQ2tnZTF4eVhHNGdJSFJvYVhNdVgyeHZZMkZzWlNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRDBnYm5Wc2JEdGNjbHh1SUNCMGFHbHpMbDlqZFhKeVpXNTBRMjl1ZEdWNGRDQWdJQ0FnSUNBOUlHNTFiR3c3WEhKY2JpQWdkR2hwY3k1ZlkyOXVkR1Y0ZEhNZ0lDQWdJQ0FnSUNBZ0lDQWdQU0I3ZlR0Y2NseHVJQ0IwYUdsekxsOXNhWE4wWlc1bGNuTWdJQ0FnSUNBZ0lDQWdJQ0E5SUZ0ZE8xeHlYRzRnSUhSb2FYTXVYMkZ3Y0d4cFpXUk1hWE4wWlc1bGNuTWdJQ0FnSUQwZ1cxMDdYSEpjYmlBZ2RHaHBjeTVmYkc5allXeGxjeUFnSUNBZ0lDQWdJQ0FnSUNBZ1BTQjdmVHRjY2x4dUlDQjBhR2x6TGw5MFlYSm5aWFJGYkdWdFpXNTBJQ0FnSUNBZ0lDQTlJRzUxYkd3N1hISmNiaUFnZEdocGN5NWZkR0Z5WjJWMFYybHVaRzkzSUNBZ0lDQWdJQ0FnUFNCdWRXeHNPMXh5WEc0Z0lIUm9hWE11WDNSaGNtZGxkRkJzWVhSbWIzSnRJQ0FnSUNBZ0lEMGdKeWM3WEhKY2JpQWdkR2hwY3k1ZmRHRnlaMlYwVlhObGNrRm5aVzUwSUNBZ0lDQWdQU0FuSnp0Y2NseHVJQ0IwYUdsekxsOXBjMDF2WkdWeWJrSnliM2R6WlhJZ0lDQWdJQ0E5SUdaaGJITmxPMXh5WEc0Z0lIUm9hWE11WDNSaGNtZGxkRXRsZVVSdmQyNUNhVzVrYVc1bklEMGdiblZzYkR0Y2NseHVJQ0IwYUdsekxsOTBZWEpuWlhSTFpYbFZjRUpwYm1ScGJtY2dJQ0E5SUc1MWJHdzdYSEpjYmlBZ2RHaHBjeTVmZEdGeVoyVjBVbVZ6WlhSQ2FXNWthVzVuSUNBZ1BTQnVkV3hzTzF4eVhHNGdJSFJvYVhNdVgzQmhkWE5sWkNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRDBnWm1Gc2MyVTdYSEpjYmx4eVhHNGdJSFJvYVhNdWMyVjBRMjl1ZEdWNGRDZ25aMnh2WW1Gc0p5azdYSEpjYmlBZ2RHaHBjeTUzWVhSamFDaDBZWEpuWlhSWGFXNWtiM2NzSUhSaGNtZGxkRVZzWlcxbGJuUXNJSEJzWVhSbWIzSnRMQ0IxYzJWeVFXZGxiblFwTzF4eVhHNTlYSEpjYmx4eVhHNUxaWGxpYjJGeVpDNXdjbTkwYjNSNWNHVXVjMlYwVEc5allXeGxJRDBnWm5WdVkzUnBiMjRvYkc5allXeGxUbUZ0WlN3Z2JHOWpZV3hsUW5WcGJHUmxjaWtnZTF4eVhHNGdJSFpoY2lCc2IyTmhiR1VnUFNCdWRXeHNPMXh5WEc0Z0lHbG1JQ2gwZVhCbGIyWWdiRzlqWVd4bFRtRnRaU0E5UFQwZ0ozTjBjbWx1WnljcElIdGNjbHh1WEhKY2JpQWdJQ0JwWmlBb2JHOWpZV3hsUW5WcGJHUmxjaWtnZTF4eVhHNGdJQ0FnSUNCc2IyTmhiR1VnUFNCdVpYY2dURzlqWVd4bEtHeHZZMkZzWlU1aGJXVXBPMXh5WEc0Z0lDQWdJQ0JzYjJOaGJHVkNkV2xzWkdWeUtHeHZZMkZzWlN3Z2RHaHBjeTVmZEdGeVoyVjBVR3hoZEdadmNtMHNJSFJvYVhNdVgzUmhjbWRsZEZWelpYSkJaMlZ1ZENrN1hISmNiaUFnSUNCOUlHVnNjMlVnZTF4eVhHNGdJQ0FnSUNCc2IyTmhiR1VnUFNCMGFHbHpMbDlzYjJOaGJHVnpXMnh2WTJGc1pVNWhiV1ZkSUh4OElHNTFiR3c3WEhKY2JpQWdJQ0I5WEhKY2JpQWdmU0JsYkhObElIdGNjbHh1SUNBZ0lHeHZZMkZzWlNBZ0lDQWdQU0JzYjJOaGJHVk9ZVzFsTzF4eVhHNGdJQ0FnYkc5allXeGxUbUZ0WlNBOUlHeHZZMkZzWlM1ZmJHOWpZV3hsVG1GdFpUdGNjbHh1SUNCOVhISmNibHh5WEc0Z0lIUm9hWE11WDJ4dlkyRnNaU0FnSUNBZ0lDQWdJQ0FnSUNBZ1BTQnNiMk5oYkdVN1hISmNiaUFnZEdocGN5NWZiRzlqWVd4bGMxdHNiMk5oYkdWT1lXMWxYU0E5SUd4dlkyRnNaVHRjY2x4dUlDQnBaaUFvYkc5allXeGxLU0I3WEhKY2JpQWdJQ0IwYUdsekxsOXNiMk5oYkdVdWNISmxjM05sWkV0bGVYTWdQU0JzYjJOaGJHVXVjSEpsYzNObFpFdGxlWE03WEhKY2JpQWdmVnh5WEc1OU8xeHlYRzVjY2x4dVMyVjVZbTloY21RdWNISnZkRzkwZVhCbExtZGxkRXh2WTJGc1pTQTlJR1oxYm1OMGFXOXVLR3h2WTJGc1RtRnRaU2tnZTF4eVhHNGdJR3h2WTJGc1RtRnRaU0I4ZkNBb2JHOWpZV3hPWVcxbElEMGdkR2hwY3k1ZmJHOWpZV3hsTG14dlkyRnNaVTVoYldVcE8xeHlYRzRnSUhKbGRIVnliaUIwYUdsekxsOXNiMk5oYkdWelcyeHZZMkZzVG1GdFpWMGdmSHdnYm5Wc2JEdGNjbHh1ZlR0Y2NseHVYSEpjYmt0bGVXSnZZWEprTG5CeWIzUnZkSGx3WlM1aWFXNWtJRDBnWm5WdVkzUnBiMjRvYTJWNVEyOXRZbTlUZEhJc0lIQnlaWE56U0dGdVpHeGxjaXdnY21Wc1pXRnpaVWhoYm1Sc1pYSXNJSEJ5WlhabGJuUlNaWEJsWVhSQ2VVUmxabUYxYkhRcElIdGNjbHh1SUNCcFppQW9hMlY1UTI5dFltOVRkSElnUFQwOUlHNTFiR3dnZkh3Z2RIbHdaVzltSUd0bGVVTnZiV0p2VTNSeUlEMDlQU0FuWm5WdVkzUnBiMjRuS1NCN1hISmNiaUFnSUNCd2NtVjJaVzUwVW1Wd1pXRjBRbmxFWldaaGRXeDBJRDBnY21Wc1pXRnpaVWhoYm1Sc1pYSTdYSEpjYmlBZ0lDQnlaV3hsWVhObFNHRnVaR3hsY2lBZ0lDQWdJQ0FnSUQwZ2NISmxjM05JWVc1a2JHVnlPMXh5WEc0Z0lDQWdjSEpsYzNOSVlXNWtiR1Z5SUNBZ0lDQWdJQ0FnSUNBOUlHdGxlVU52YldKdlUzUnlPMXh5WEc0Z0lDQWdhMlY1UTI5dFltOVRkSElnSUNBZ0lDQWdJQ0FnSUNBOUlHNTFiR3c3WEhKY2JpQWdmVnh5WEc1Y2NseHVJQ0JwWmlBb1hISmNiaUFnSUNCclpYbERiMjFpYjFOMGNpQW1KbHh5WEc0Z0lDQWdkSGx3Wlc5bUlHdGxlVU52YldKdlUzUnlJRDA5UFNBbmIySnFaV04wSnlBbUpseHlYRzRnSUNBZ2RIbHdaVzltSUd0bGVVTnZiV0p2VTNSeUxteGxibWQwYUNBOVBUMGdKMjUxYldKbGNpZGNjbHh1SUNBcElIdGNjbHh1SUNBZ0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2dhMlY1UTI5dFltOVRkSEl1YkdWdVozUm9PeUJwSUNzOUlERXBJSHRjY2x4dUlDQWdJQ0FnZEdocGN5NWlhVzVrS0d0bGVVTnZiV0p2VTNSeVcybGRMQ0J3Y21WemMwaGhibVJzWlhJc0lISmxiR1ZoYzJWSVlXNWtiR1Z5S1R0Y2NseHVJQ0FnSUgxY2NseHVJQ0FnSUhKbGRIVnlianRjY2x4dUlDQjlYSEpjYmx4eVhHNGdJSFJvYVhNdVgyeHBjM1JsYm1WeWN5NXdkWE5vS0h0Y2NseHVJQ0FnSUd0bGVVTnZiV0p2SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdPaUJyWlhsRGIyMWliMU4wY2lBL0lHNWxkeUJMWlhsRGIyMWlieWhyWlhsRGIyMWliMU4wY2lrZ09pQnVkV3hzTEZ4eVhHNGdJQ0FnY0hKbGMzTklZVzVrYkdWeUlDQWdJQ0FnSUNBZ0lDQTZJSEJ5WlhOelNHRnVaR3hsY2lBZ0lDQWdJQ0FnSUNBZ2ZId2diblZzYkN4Y2NseHVJQ0FnSUhKbGJHVmhjMlZJWVc1a2JHVnlJQ0FnSUNBZ0lDQWdPaUJ5Wld4bFlYTmxTR0Z1Wkd4bGNpQWdJQ0FnSUNBZ0lIeDhJRzUxYkd3c1hISmNiaUFnSUNCd2NtVjJaVzUwVW1Wd1pXRjBJQ0FnSUNBZ0lDQWdJRG9nY0hKbGRtVnVkRkpsY0dWaGRFSjVSR1ZtWVhWc2RDQjhmQ0JtWVd4elpTeGNjbHh1SUNBZ0lIQnlaWFpsYm5SU1pYQmxZWFJDZVVSbFptRjFiSFFnT2lCd2NtVjJaVzUwVW1Wd1pXRjBRbmxFWldaaGRXeDBJSHg4SUdaaGJITmxYSEpjYmlBZ2ZTazdYSEpjYm4wN1hISmNia3RsZVdKdllYSmtMbkJ5YjNSdmRIbHdaUzVoWkdSTWFYTjBaVzVsY2lBOUlFdGxlV0p2WVhKa0xuQnliM1J2ZEhsd1pTNWlhVzVrTzF4eVhHNUxaWGxpYjJGeVpDNXdjbTkwYjNSNWNHVXViMjRnSUNBZ0lDQWdJQ0FnUFNCTFpYbGliMkZ5WkM1d2NtOTBiM1I1Y0dVdVltbHVaRHRjY2x4dVhISmNia3RsZVdKdllYSmtMbkJ5YjNSdmRIbHdaUzUxYm1KcGJtUWdQU0JtZFc1amRHbHZiaWhyWlhsRGIyMWliMU4wY2l3Z2NISmxjM05JWVc1a2JHVnlMQ0J5Wld4bFlYTmxTR0Z1Wkd4bGNpa2dlMXh5WEc0Z0lHbG1JQ2hyWlhsRGIyMWliMU4wY2lBOVBUMGdiblZzYkNCOGZDQjBlWEJsYjJZZ2EyVjVRMjl0WW05VGRISWdQVDA5SUNkbWRXNWpkR2x2YmljcElIdGNjbHh1SUNBZ0lISmxiR1ZoYzJWSVlXNWtiR1Z5SUQwZ2NISmxjM05JWVc1a2JHVnlPMXh5WEc0Z0lDQWdjSEpsYzNOSVlXNWtiR1Z5SUNBZ1BTQnJaWGxEYjIxaWIxTjBjanRjY2x4dUlDQWdJR3RsZVVOdmJXSnZVM1J5SUQwZ2JuVnNiRHRjY2x4dUlDQjlYSEpjYmx4eVhHNGdJR2xtSUNoY2NseHVJQ0FnSUd0bGVVTnZiV0p2VTNSeUlDWW1YSEpjYmlBZ0lDQjBlWEJsYjJZZ2EyVjVRMjl0WW05VGRISWdQVDA5SUNkdlltcGxZM1FuSUNZbVhISmNiaUFnSUNCMGVYQmxiMllnYTJWNVEyOXRZbTlUZEhJdWJHVnVaM1JvSUQwOVBTQW5iblZ0WW1WeUoxeHlYRzRnSUNrZ2UxeHlYRzRnSUNBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQnJaWGxEYjIxaWIxTjBjaTVzWlc1bmRHZzdJR2tnS3owZ01Ta2dlMXh5WEc0Z0lDQWdJQ0IwYUdsekxuVnVZbWx1WkNoclpYbERiMjFpYjFOMGNsdHBYU3dnY0hKbGMzTklZVzVrYkdWeUxDQnlaV3hsWVhObFNHRnVaR3hsY2lrN1hISmNiaUFnSUNCOVhISmNiaUFnSUNCeVpYUjFjbTQ3WEhKY2JpQWdmVnh5WEc1Y2NseHVJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Ec2dhU0E4SUhSb2FYTXVYMnhwYzNSbGJtVnljeTVzWlc1bmRHZzdJR2tnS3owZ01Ta2dlMXh5WEc0Z0lDQWdkbUZ5SUd4cGMzUmxibVZ5SUQwZ2RHaHBjeTVmYkdsemRHVnVaWEp6VzJsZE8xeHlYRzVjY2x4dUlDQWdJSFpoY2lCamIyMWliMDFoZEdOb1pYTWdJQ0FnSUNBZ0lDQWdQU0FoYTJWNVEyOXRZbTlUZEhJZ0ppWWdJV3hwYzNSbGJtVnlMbXRsZVVOdmJXSnZJSHg4WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYkdsemRHVnVaWEl1YTJWNVEyOXRZbTh1YVhORmNYVmhiQ2hyWlhsRGIyMWliMU4wY2lrN1hISmNiaUFnSUNCMllYSWdjSEpsYzNOSVlXNWtiR1Z5VFdGMFkyaGxjeUFnSUQwZ0lYQnlaWE56U0dGdVpHeGxjaUFtSmlBaGNtVnNaV0Z6WlVoaGJtUnNaWElnZkh4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBaGNISmxjM05JWVc1a2JHVnlJQ1ltSUNGc2FYTjBaVzVsY2k1d2NtVnpjMGhoYm1Sc1pYSWdmSHhjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J3Y21WemMwaGhibVJzWlhJZ1BUMDlJR3hwYzNSbGJtVnlMbkJ5WlhOelNHRnVaR3hsY2p0Y2NseHVJQ0FnSUhaaGNpQnlaV3hsWVhObFNHRnVaR3hsY2sxaGRHTm9aWE1nUFNBaGNISmxjM05JWVc1a2JHVnlJQ1ltSUNGeVpXeGxZWE5sU0dGdVpHeGxjaUI4ZkZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNGeVpXeGxZWE5sU0dGdVpHeGxjaUFtSmlBaGJHbHpkR1Z1WlhJdWNtVnNaV0Z6WlVoaGJtUnNaWElnZkh4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpXeGxZWE5sU0dGdVpHeGxjaUE5UFQwZ2JHbHpkR1Z1WlhJdWNtVnNaV0Z6WlVoaGJtUnNaWEk3WEhKY2JseHlYRzRnSUNBZ2FXWWdLR052YldKdlRXRjBZMmhsY3lBbUppQndjbVZ6YzBoaGJtUnNaWEpOWVhSamFHVnpJQ1ltSUhKbGJHVmhjMlZJWVc1a2JHVnlUV0YwWTJobGN5a2dlMXh5WEc0Z0lDQWdJQ0IwYUdsekxsOXNhWE4wWlc1bGNuTXVjM0JzYVdObEtHa3NJREVwTzF4eVhHNGdJQ0FnSUNCcElDMDlJREU3WEhKY2JpQWdJQ0I5WEhKY2JpQWdmVnh5WEc1OU8xeHlYRzVMWlhsaWIyRnlaQzV3Y205MGIzUjVjR1V1Y21WdGIzWmxUR2x6ZEdWdVpYSWdQU0JMWlhsaWIyRnlaQzV3Y205MGIzUjVjR1V1ZFc1aWFXNWtPMXh5WEc1TFpYbGliMkZ5WkM1d2NtOTBiM1I1Y0dVdWIyWm1JQ0FnSUNBZ0lDQWdJQ0FnUFNCTFpYbGliMkZ5WkM1d2NtOTBiM1I1Y0dVdWRXNWlhVzVrTzF4eVhHNWNjbHh1UzJWNVltOWhjbVF1Y0hKdmRHOTBlWEJsTG5ObGRFTnZiblJsZUhRZ1BTQm1kVzVqZEdsdmJpaGpiMjUwWlhoMFRtRnRaU2tnZTF4eVhHNGdJR2xtS0hSb2FYTXVYMnh2WTJGc1pTa2dleUIwYUdsekxuSmxiR1ZoYzJWQmJHeExaWGx6S0NrN0lIMWNjbHh1WEhKY2JpQWdhV1lnS0NGMGFHbHpMbDlqYjI1MFpYaDBjMXRqYjI1MFpYaDBUbUZ0WlYwcElIdGNjbHh1SUNBZ0lIUm9hWE11WDJOdmJuUmxlSFJ6VzJOdmJuUmxlSFJPWVcxbFhTQTlJRnRkTzF4eVhHNGdJSDFjY2x4dUlDQjBhR2x6TGw5c2FYTjBaVzVsY25NZ0lDQWdJQ0E5SUhSb2FYTXVYMk52Ym5SbGVIUnpXMk52Ym5SbGVIUk9ZVzFsWFR0Y2NseHVJQ0IwYUdsekxsOWpkWEp5Wlc1MFEyOXVkR1Y0ZENBOUlHTnZiblJsZUhST1lXMWxPMXh5WEc1OU8xeHlYRzVjY2x4dVMyVjVZbTloY21RdWNISnZkRzkwZVhCbExtZGxkRU52Ym5SbGVIUWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0J5WlhSMWNtNGdkR2hwY3k1ZlkzVnljbVZ1ZEVOdmJuUmxlSFE3WEhKY2JuMDdYSEpjYmx4eVhHNUxaWGxpYjJGeVpDNXdjbTkwYjNSNWNHVXVkMmwwYUVOdmJuUmxlSFFnUFNCbWRXNWpkR2x2YmloamIyNTBaWGgwVG1GdFpTd2dZMkZzYkdKaFkyc3BJSHRjY2x4dUlDQjJZWElnY0hKbGRtbHZkWE5EYjI1MFpYaDBUbUZ0WlNBOUlIUm9hWE11WjJWMFEyOXVkR1Y0ZENncE8xeHlYRzRnSUhSb2FYTXVjMlYwUTI5dWRHVjRkQ2hqYjI1MFpYaDBUbUZ0WlNrN1hISmNibHh5WEc0Z0lHTmhiR3hpWVdOcktDazdYSEpjYmx4eVhHNGdJSFJvYVhNdWMyVjBRMjl1ZEdWNGRDaHdjbVYyYVc5MWMwTnZiblJsZUhST1lXMWxLVHRjY2x4dWZUdGNjbHh1WEhKY2JrdGxlV0p2WVhKa0xuQnliM1J2ZEhsd1pTNTNZWFJqYUNBOUlHWjFibU4wYVc5dUtIUmhjbWRsZEZkcGJtUnZkeXdnZEdGeVoyVjBSV3hsYldWdWRDd2dkR0Z5WjJWMFVHeGhkR1p2Y20wc0lIUmhjbWRsZEZWelpYSkJaMlZ1ZENrZ2UxeHlYRzRnSUhaaGNpQmZkR2hwY3lBOUlIUm9hWE03WEhKY2JseHlYRzRnSUhSb2FYTXVjM1J2Y0NncE8xeHlYRzVjY2x4dUlDQnBaaUFvSVhSaGNtZGxkRmRwYm1SdmR5a2dlMXh5WEc0Z0lDQWdhV1lnS0NGbmJHOWlZV3d1WVdSa1JYWmxiblJNYVhOMFpXNWxjaUFtSmlBaFoyeHZZbUZzTG1GMGRHRmphRVYyWlc1MEtTQjdYSEpjYmlBZ0lDQWdJSFJvY205M0lHNWxkeUJGY25KdmNpZ25RMkZ1Ym05MElHWnBibVFnWjJ4dlltRnNJR1oxYm1OMGFXOXVjeUJoWkdSRmRtVnVkRXhwYzNSbGJtVnlJRzl5SUdGMGRHRmphRVYyWlc1MExpY3BPMXh5WEc0Z0lDQWdmVnh5WEc0Z0lDQWdkR0Z5WjJWMFYybHVaRzkzSUQwZ1oyeHZZbUZzTzF4eVhHNGdJSDFjY2x4dVhISmNiaUFnYVdZZ0tIUjVjR1Z2WmlCMFlYSm5aWFJYYVc1a2IzY3VibTlrWlZSNWNHVWdQVDA5SUNkdWRXMWlaWEluS1NCN1hISmNiaUFnSUNCMFlYSm5aWFJWYzJWeVFXZGxiblFnUFNCMFlYSm5aWFJRYkdGMFptOXliVHRjY2x4dUlDQWdJSFJoY21kbGRGQnNZWFJtYjNKdElDQTlJSFJoY21kbGRFVnNaVzFsYm5RN1hISmNiaUFnSUNCMFlYSm5aWFJGYkdWdFpXNTBJQ0FnUFNCMFlYSm5aWFJYYVc1a2IzYzdYSEpjYmlBZ0lDQjBZWEpuWlhSWGFXNWtiM2NnSUNBZ1BTQm5iRzlpWVd3N1hISmNiaUFnZlZ4eVhHNGdJRnh5WEc0Z0lHbG1JQ2doZEdGeVoyVjBWMmx1Wkc5M0xtRmtaRVYyWlc1MFRHbHpkR1Z1WlhJZ0ppWWdJWFJoY21kbGRGZHBibVJ2ZHk1aGRIUmhZMmhGZG1WdWRDa2dlMXh5WEc0Z0lDQWdkR2h5YjNjZ2JtVjNJRVZ5Y205eUtDZERZVzV1YjNRZ1ptbHVaQ0JoWkdSRmRtVnVkRXhwYzNSbGJtVnlJRzl5SUdGMGRHRmphRVYyWlc1MElHMWxkR2h2WkhNZ2IyNGdkR0Z5WjJWMFYybHVaRzkzTGljcE8xeHlYRzRnSUgxY2NseHVJQ0JjY2x4dUlDQjBhR2x6TGw5cGMwMXZaR1Z5YmtKeWIzZHpaWElnUFNBaElYUmhjbWRsZEZkcGJtUnZkeTVoWkdSRmRtVnVkRXhwYzNSbGJtVnlPMXh5WEc1Y2NseHVJQ0IyWVhJZ2RYTmxja0ZuWlc1MElEMGdkR0Z5WjJWMFYybHVaRzkzTG01aGRtbG5ZWFJ2Y2lBbUppQjBZWEpuWlhSWGFXNWtiM2N1Ym1GMmFXZGhkRzl5TG5WelpYSkJaMlZ1ZENCOGZDQW5KenRjY2x4dUlDQjJZWElnY0d4aGRHWnZjbTBnSUQwZ2RHRnlaMlYwVjJsdVpHOTNMbTVoZG1sbllYUnZjaUFtSmlCMFlYSm5aWFJYYVc1a2IzY3VibUYyYVdkaGRHOXlMbkJzWVhSbWIzSnRJQ0I4ZkNBbkp6dGNjbHh1WEhKY2JpQWdkR0Z5WjJWMFJXeGxiV1Z1ZENBZ0lDWW1JSFJoY21kbGRFVnNaVzFsYm5RZ0lDQWhQVDBnYm5Wc2JDQjhmQ0FvZEdGeVoyVjBSV3hsYldWdWRDQWdJRDBnZEdGeVoyVjBWMmx1Wkc5M0xtUnZZM1Z0Wlc1MEtUdGNjbHh1SUNCMFlYSm5aWFJRYkdGMFptOXliU0FnSmlZZ2RHRnlaMlYwVUd4aGRHWnZjbTBnSUNFOVBTQnVkV3hzSUh4OElDaDBZWEpuWlhSUWJHRjBabTl5YlNBZ1BTQndiR0YwWm05eWJTazdYSEpjYmlBZ2RHRnlaMlYwVlhObGNrRm5aVzUwSUNZbUlIUmhjbWRsZEZWelpYSkJaMlZ1ZENBaFBUMGdiblZzYkNCOGZDQW9kR0Z5WjJWMFZYTmxja0ZuWlc1MElEMGdkWE5sY2tGblpXNTBLVHRjY2x4dVhISmNiaUFnZEdocGN5NWZkR0Z5WjJWMFMyVjVSRzkzYmtKcGJtUnBibWNnUFNCbWRXNWpkR2x2YmlobGRtVnVkQ2tnZTF4eVhHNGdJQ0FnWDNSb2FYTXVjSEpsYzNOTFpYa29aWFpsYm5RdWEyVjVRMjlrWlN3Z1pYWmxiblFwTzF4eVhHNGdJSDA3WEhKY2JpQWdkR2hwY3k1ZmRHRnlaMlYwUzJWNVZYQkNhVzVrYVc1bklEMGdablZ1WTNScGIyNG9aWFpsYm5RcElIdGNjbHh1SUNBZ0lGOTBhR2x6TG5KbGJHVmhjMlZMWlhrb1pYWmxiblF1YTJWNVEyOWtaU3dnWlhabGJuUXBPMXh5WEc0Z0lIMDdYSEpjYmlBZ2RHaHBjeTVmZEdGeVoyVjBVbVZ6WlhSQ2FXNWthVzVuSUQwZ1puVnVZM1JwYjI0b1pYWmxiblFwSUh0Y2NseHVJQ0FnSUY5MGFHbHpMbkpsYkdWaGMyVkJiR3hMWlhsektHVjJaVzUwS1Z4eVhHNGdJSDA3WEhKY2JseHlYRzRnSUhSb2FYTXVYMkpwYm1SRmRtVnVkQ2gwWVhKblpYUkZiR1Z0Wlc1MExDQW5hMlY1Wkc5M2JpY3NJSFJvYVhNdVgzUmhjbWRsZEV0bGVVUnZkMjVDYVc1a2FXNW5LVHRjY2x4dUlDQjBhR2x6TGw5aWFXNWtSWFpsYm5Rb2RHRnlaMlYwUld4bGJXVnVkQ3dnSjJ0bGVYVndKeXdnSUNCMGFHbHpMbDkwWVhKblpYUkxaWGxWY0VKcGJtUnBibWNwTzF4eVhHNGdJSFJvYVhNdVgySnBibVJGZG1WdWRDaDBZWEpuWlhSWGFXNWtiM2NzSUNBblptOWpkWE1uTENBZ0lIUm9hWE11WDNSaGNtZGxkRkpsYzJWMFFtbHVaR2x1WnlrN1hISmNiaUFnZEdocGN5NWZZbWx1WkVWMlpXNTBLSFJoY21kbGRGZHBibVJ2ZHl3Z0lDZGliSFZ5Snl3Z0lDQWdkR2hwY3k1ZmRHRnlaMlYwVW1WelpYUkNhVzVrYVc1bktUdGNjbHh1WEhKY2JpQWdkR2hwY3k1ZmRHRnlaMlYwUld4bGJXVnVkQ0FnSUQwZ2RHRnlaMlYwUld4bGJXVnVkRHRjY2x4dUlDQjBhR2x6TGw5MFlYSm5aWFJYYVc1a2IzY2dJQ0FnUFNCMFlYSm5aWFJYYVc1a2IzYzdYSEpjYmlBZ2RHaHBjeTVmZEdGeVoyVjBVR3hoZEdadmNtMGdJRDBnZEdGeVoyVjBVR3hoZEdadmNtMDdYSEpjYmlBZ2RHaHBjeTVmZEdGeVoyVjBWWE5sY2tGblpXNTBJRDBnZEdGeVoyVjBWWE5sY2tGblpXNTBPMXh5WEc1OU8xeHlYRzVjY2x4dVMyVjVZbTloY21RdWNISnZkRzkwZVhCbExuTjBiM0FnUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNCMllYSWdYM1JvYVhNZ1BTQjBhR2x6TzF4eVhHNWNjbHh1SUNCcFppQW9JWFJvYVhNdVgzUmhjbWRsZEVWc1pXMWxiblFnZkh3Z0lYUm9hWE11WDNSaGNtZGxkRmRwYm1SdmR5a2dleUJ5WlhSMWNtNDdJSDFjY2x4dVhISmNiaUFnZEdocGN5NWZkVzVpYVc1a1JYWmxiblFvZEdocGN5NWZkR0Z5WjJWMFJXeGxiV1Z1ZEN3Z0oydGxlV1J2ZDI0bkxDQjBhR2x6TGw5MFlYSm5aWFJMWlhsRWIzZHVRbWx1WkdsdVp5azdYSEpjYmlBZ2RHaHBjeTVmZFc1aWFXNWtSWFpsYm5Rb2RHaHBjeTVmZEdGeVoyVjBSV3hsYldWdWRDd2dKMnRsZVhWd0p5d2dJQ0IwYUdsekxsOTBZWEpuWlhSTFpYbFZjRUpwYm1ScGJtY3BPMXh5WEc0Z0lIUm9hWE11WDNWdVltbHVaRVYyWlc1MEtIUm9hWE11WDNSaGNtZGxkRmRwYm1SdmR5d2dJQ2RtYjJOMWN5Y3NJQ0FnZEdocGN5NWZkR0Z5WjJWMFVtVnpaWFJDYVc1a2FXNW5LVHRjY2x4dUlDQjBhR2x6TGw5MWJtSnBibVJGZG1WdWRDaDBhR2x6TGw5MFlYSm5aWFJYYVc1a2IzY3NJQ0FuWW14MWNpY3NJQ0FnSUhSb2FYTXVYM1JoY21kbGRGSmxjMlYwUW1sdVpHbHVaeWs3WEhKY2JseHlYRzRnSUhSb2FYTXVYM1JoY21kbGRGZHBibVJ2ZHlBZ1BTQnVkV3hzTzF4eVhHNGdJSFJvYVhNdVgzUmhjbWRsZEVWc1pXMWxiblFnUFNCdWRXeHNPMXh5WEc1OU8xeHlYRzVjY2x4dVMyVjVZbTloY21RdWNISnZkRzkwZVhCbExuQnlaWE56UzJWNUlEMGdablZ1WTNScGIyNG9hMlY1UTI5a1pTd2daWFpsYm5RcElIdGNjbHh1SUNCcFppQW9kR2hwY3k1ZmNHRjFjMlZrS1NCN0lISmxkSFZ5YmpzZ2ZWeHlYRzRnSUdsbUlDZ2hkR2hwY3k1ZmJHOWpZV3hsS1NCN0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lnblRHOWpZV3hsSUc1dmRDQnpaWFFuS1RzZ2ZWeHlYRzVjY2x4dUlDQjBhR2x6TGw5c2IyTmhiR1V1Y0hKbGMzTkxaWGtvYTJWNVEyOWtaU2s3WEhKY2JpQWdkR2hwY3k1ZllYQndiSGxDYVc1a2FXNW5jeWhsZG1WdWRDazdYSEpjYm4wN1hISmNibHh5WEc1TFpYbGliMkZ5WkM1d2NtOTBiM1I1Y0dVdWNtVnNaV0Z6WlV0bGVTQTlJR1oxYm1OMGFXOXVLR3RsZVVOdlpHVXNJR1YyWlc1MEtTQjdYSEpjYmlBZ2FXWWdLSFJvYVhNdVgzQmhkWE5sWkNrZ2V5QnlaWFIxY200N0lIMWNjbHh1SUNCcFppQW9JWFJvYVhNdVgyeHZZMkZzWlNrZ2V5QjBhSEp2ZHlCdVpYY2dSWEp5YjNJb0oweHZZMkZzWlNCdWIzUWdjMlYwSnlrN0lIMWNjbHh1WEhKY2JpQWdkR2hwY3k1ZmJHOWpZV3hsTG5KbGJHVmhjMlZMWlhrb2EyVjVRMjlrWlNrN1hISmNiaUFnZEdocGN5NWZZMnhsWVhKQ2FXNWthVzVuY3lobGRtVnVkQ2s3WEhKY2JuMDdYSEpjYmx4eVhHNUxaWGxpYjJGeVpDNXdjbTkwYjNSNWNHVXVjbVZzWldGelpVRnNiRXRsZVhNZ1BTQm1kVzVqZEdsdmJpaGxkbVZ1ZENrZ2UxeHlYRzRnSUdsbUlDaDBhR2x6TGw5d1lYVnpaV1FwSUhzZ2NtVjBkWEp1T3lCOVhISmNiaUFnYVdZZ0tDRjBhR2x6TGw5c2IyTmhiR1VwSUhzZ2RHaHliM2NnYm1WM0lFVnljbTl5S0NkTWIyTmhiR1VnYm05MElITmxkQ2NwT3lCOVhISmNibHh5WEc0Z0lIUm9hWE11WDJ4dlkyRnNaUzV3Y21WemMyVmtTMlY1Y3k1c1pXNW5kR2dnUFNBd08xeHlYRzRnSUhSb2FYTXVYMk5zWldGeVFtbHVaR2x1WjNNb1pYWmxiblFwTzF4eVhHNTlPMXh5WEc1Y2NseHVTMlY1WW05aGNtUXVjSEp2ZEc5MGVYQmxMbkJoZFhObElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdhV1lnS0hSb2FYTXVYM0JoZFhObFpDa2dleUJ5WlhSMWNtNDdJSDFjY2x4dUlDQnBaaUFvZEdocGN5NWZiRzlqWVd4bEtTQjdJSFJvYVhNdWNtVnNaV0Z6WlVGc2JFdGxlWE1vS1RzZ2ZWeHlYRzRnSUhSb2FYTXVYM0JoZFhObFpDQTlJSFJ5ZFdVN1hISmNibjA3WEhKY2JseHlYRzVMWlhsaWIyRnlaQzV3Y205MGIzUjVjR1V1Y21WemRXMWxJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnZEdocGN5NWZjR0YxYzJWa0lEMGdabUZzYzJVN1hISmNibjA3WEhKY2JseHlYRzVMWlhsaWIyRnlaQzV3Y205MGIzUjVjR1V1Y21WelpYUWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0IwYUdsekxuSmxiR1ZoYzJWQmJHeExaWGx6S0NrN1hISmNiaUFnZEdocGN5NWZiR2x6ZEdWdVpYSnpMbXhsYm1kMGFDQTlJREE3WEhKY2JuMDdYSEpjYmx4eVhHNUxaWGxpYjJGeVpDNXdjbTkwYjNSNWNHVXVYMkpwYm1SRmRtVnVkQ0E5SUdaMWJtTjBhVzl1S0hSaGNtZGxkRVZzWlcxbGJuUXNJR1YyWlc1MFRtRnRaU3dnYUdGdVpHeGxjaWtnZTF4eVhHNGdJSEpsZEhWeWJpQjBhR2x6TGw5cGMwMXZaR1Z5YmtKeWIzZHpaWElnUDF4eVhHNGdJQ0FnZEdGeVoyVjBSV3hsYldWdWRDNWhaR1JGZG1WdWRFeHBjM1JsYm1WeUtHVjJaVzUwVG1GdFpTd2dhR0Z1Wkd4bGNpd2dabUZzYzJVcElEcGNjbHh1SUNBZ0lIUmhjbWRsZEVWc1pXMWxiblF1WVhSMFlXTm9SWFpsYm5Rb0oyOXVKeUFySUdWMlpXNTBUbUZ0WlN3Z2FHRnVaR3hsY2lrN1hISmNibjA3WEhKY2JseHlYRzVMWlhsaWIyRnlaQzV3Y205MGIzUjVjR1V1WDNWdVltbHVaRVYyWlc1MElEMGdablZ1WTNScGIyNG9kR0Z5WjJWMFJXeGxiV1Z1ZEN3Z1pYWmxiblJPWVcxbExDQm9ZVzVrYkdWeUtTQjdYSEpjYmlBZ2NtVjBkWEp1SUhSb2FYTXVYMmx6VFc5a1pYSnVRbkp2ZDNObGNpQS9YSEpjYmlBZ0lDQjBZWEpuWlhSRmJHVnRaVzUwTG5KbGJXOTJaVVYyWlc1MFRHbHpkR1Z1WlhJb1pYWmxiblJPWVcxbExDQm9ZVzVrYkdWeUxDQm1ZV3h6WlNrZ09seHlYRzRnSUNBZ2RHRnlaMlYwUld4bGJXVnVkQzVrWlhSaFkyaEZkbVZ1ZENnbmIyNG5JQ3NnWlhabGJuUk9ZVzFsTENCb1lXNWtiR1Z5S1R0Y2NseHVmVHRjY2x4dVhISmNia3RsZVdKdllYSmtMbkJ5YjNSdmRIbHdaUzVmWjJWMFIzSnZkWEJsWkV4cGMzUmxibVZ5Y3lBOUlHWjFibU4wYVc5dUtDa2dlMXh5WEc0Z0lIWmhjaUJzYVhOMFpXNWxja2R5YjNWd2N5QWdJRDBnVzEwN1hISmNiaUFnZG1GeUlHeHBjM1JsYm1WeVIzSnZkWEJOWVhBZ1BTQmJYVHRjY2x4dVhISmNiaUFnZG1GeUlHeHBjM1JsYm1WeWN5QTlJSFJvYVhNdVgyeHBjM1JsYm1WeWN6dGNjbHh1SUNCcFppQW9kR2hwY3k1ZlkzVnljbVZ1ZEVOdmJuUmxlSFFnSVQwOUlDZG5iRzlpWVd3bktTQjdYSEpjYmlBZ0lDQnNhWE4wWlc1bGNuTWdQU0JiWFM1amIyNWpZWFFvYkdsemRHVnVaWEp6TENCMGFHbHpMbDlqYjI1MFpYaDBjeTVuYkc5aVlXd3BPMXh5WEc0Z0lIMWNjbHh1WEhKY2JpQWdiR2x6ZEdWdVpYSnpMbk52Y25Rb1puVnVZM1JwYjI0b1lTd2dZaWtnZTF4eVhHNGdJQ0FnY21WMGRYSnVJR0V1YTJWNVEyOXRZbTh1YTJWNVRtRnRaWE11YkdWdVozUm9JRHdnWWk1clpYbERiMjFpYnk1clpYbE9ZVzFsY3k1c1pXNW5kR2c3WEhKY2JpQWdmU2t1Wm05eVJXRmphQ2htZFc1amRHbHZiaWhzS1NCN1hISmNiaUFnSUNCMllYSWdiV0Z3U1c1a1pYZ2dQU0F0TVR0Y2NseHVJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2JHbHpkR1Z1WlhKSGNtOTFjRTFoY0M1c1pXNW5kR2c3SUdrZ0t6MGdNU2tnZTF4eVhHNGdJQ0FnSUNCcFppQW9iR2x6ZEdWdVpYSkhjbTkxY0UxaGNGdHBYUzVwYzBWeGRXRnNLR3d1YTJWNVEyOXRZbThwS1NCN1hISmNiaUFnSUNBZ0lDQWdiV0Z3U1c1a1pYZ2dQU0JwTzF4eVhHNGdJQ0FnSUNCOVhISmNiaUFnSUNCOVhISmNiaUFnSUNCcFppQW9iV0Z3U1c1a1pYZ2dQVDA5SUMweEtTQjdYSEpjYmlBZ0lDQWdJRzFoY0VsdVpHVjRJRDBnYkdsemRHVnVaWEpIY205MWNFMWhjQzVzWlc1bmRHZzdYSEpjYmlBZ0lDQWdJR3hwYzNSbGJtVnlSM0p2ZFhCTllYQXVjSFZ6YUNoc0xtdGxlVU52YldKdktUdGNjbHh1SUNBZ0lIMWNjbHh1SUNBZ0lHbG1JQ2doYkdsemRHVnVaWEpIY205MWNITmJiV0Z3U1c1a1pYaGRLU0I3WEhKY2JpQWdJQ0FnSUd4cGMzUmxibVZ5UjNKdmRYQnpXMjFoY0VsdVpHVjRYU0E5SUZ0ZE8xeHlYRzRnSUNBZ2ZWeHlYRzRnSUNBZ2JHbHpkR1Z1WlhKSGNtOTFjSE5iYldGd1NXNWtaWGhkTG5CMWMyZ29iQ2s3WEhKY2JpQWdmU2s3WEhKY2JpQWdjbVYwZFhKdUlHeHBjM1JsYm1WeVIzSnZkWEJ6TzF4eVhHNTlPMXh5WEc1Y2NseHVTMlY1WW05aGNtUXVjSEp2ZEc5MGVYQmxMbDloY0hCc2VVSnBibVJwYm1keklEMGdablZ1WTNScGIyNG9aWFpsYm5RcElIdGNjbHh1SUNCMllYSWdjSEpsZG1WdWRGSmxjR1ZoZENBOUlHWmhiSE5sTzF4eVhHNWNjbHh1SUNCbGRtVnVkQ0I4ZkNBb1pYWmxiblFnUFNCN2ZTazdYSEpjYmlBZ1pYWmxiblF1Y0hKbGRtVnVkRkpsY0dWaGRDQTlJR1oxYm1OMGFXOXVLQ2tnZXlCd2NtVjJaVzUwVW1Wd1pXRjBJRDBnZEhKMVpUc2dmVHRjY2x4dUlDQmxkbVZ1ZEM1d2NtVnpjMlZrUzJWNWN5QWdJRDBnZEdocGN5NWZiRzlqWVd4bExuQnlaWE56WldSTFpYbHpMbk5zYVdObEtEQXBPMXh5WEc1Y2NseHVJQ0IyWVhJZ2NISmxjM05sWkV0bGVYTWdJQ0FnUFNCMGFHbHpMbDlzYjJOaGJHVXVjSEpsYzNObFpFdGxlWE11YzJ4cFkyVW9NQ2s3WEhKY2JpQWdkbUZ5SUd4cGMzUmxibVZ5UjNKdmRYQnpJRDBnZEdocGN5NWZaMlYwUjNKdmRYQmxaRXhwYzNSbGJtVnljeWdwTzF4eVhHNWNjbHh1WEhKY2JpQWdabTl5SUNoMllYSWdhU0E5SURBN0lHa2dQQ0JzYVhOMFpXNWxja2R5YjNWd2N5NXNaVzVuZEdnN0lHa2dLejBnTVNrZ2UxeHlYRzRnSUNBZ2RtRnlJR3hwYzNSbGJtVnljeUE5SUd4cGMzUmxibVZ5UjNKdmRYQnpXMmxkTzF4eVhHNGdJQ0FnZG1GeUlHdGxlVU52YldKdklDQTlJR3hwYzNSbGJtVnljMXN3WFM1clpYbERiMjFpYnp0Y2NseHVYSEpjYmlBZ0lDQnBaaUFvYTJWNVEyOXRZbThnUFQwOUlHNTFiR3dnZkh3Z2EyVjVRMjl0WW04dVkyaGxZMnNvY0hKbGMzTmxaRXRsZVhNcEtTQjdYSEpjYmlBZ0lDQWdJR1p2Y2lBb2RtRnlJR29nUFNBd095QnFJRHdnYkdsemRHVnVaWEp6TG14bGJtZDBhRHNnYWlBclBTQXhLU0I3WEhKY2JpQWdJQ0FnSUNBZ2RtRnlJR3hwYzNSbGJtVnlJRDBnYkdsemRHVnVaWEp6VzJwZE8xeHlYRzVjY2x4dUlDQWdJQ0FnSUNCcFppQW9hMlY1UTI5dFltOGdQVDA5SUc1MWJHd3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lHeHBjM1JsYm1WeUlEMGdlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnJaWGxEYjIxaWJ5QWdJQ0FnSUNBZ0lDQWdJQ0FnSURvZ2JtVjNJRXRsZVVOdmJXSnZLSEJ5WlhOelpXUkxaWGx6TG1wdmFXNG9KeXNuS1Nrc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhCeVpYTnpTR0Z1Wkd4bGNpQWdJQ0FnSUNBZ0lDQWdPaUJzYVhOMFpXNWxjaTV3Y21WemMwaGhibVJzWlhJc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGJHVmhjMlZJWVc1a2JHVnlJQ0FnSUNBZ0lDQWdPaUJzYVhOMFpXNWxjaTV5Wld4bFlYTmxTR0Z1Wkd4bGNpeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2NISmxkbVZ1ZEZKbGNHVmhkQ0FnSUNBZ0lDQWdJQ0E2SUd4cGMzUmxibVZ5TG5CeVpYWmxiblJTWlhCbFlYUXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIQnlaWFpsYm5SU1pYQmxZWFJDZVVSbFptRjFiSFFnT2lCc2FYTjBaVzVsY2k1d2NtVjJaVzUwVW1Wd1pXRjBRbmxFWldaaGRXeDBYSEpjYmlBZ0lDQWdJQ0FnSUNCOU8xeHlYRzRnSUNBZ0lDQWdJSDFjY2x4dVhISmNiaUFnSUNBZ0lDQWdhV1lnS0d4cGMzUmxibVZ5TG5CeVpYTnpTR0Z1Wkd4bGNpQW1KaUFoYkdsemRHVnVaWEl1Y0hKbGRtVnVkRkpsY0dWaGRDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ2JHbHpkR1Z1WlhJdWNISmxjM05JWVc1a2JHVnlMbU5oYkd3b2RHaHBjeXdnWlhabGJuUXBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ2FXWWdLSEJ5WlhabGJuUlNaWEJsWVhRcElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2JHbHpkR1Z1WlhJdWNISmxkbVZ1ZEZKbGNHVmhkQ0E5SUhCeVpYWmxiblJTWlhCbFlYUTdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIQnlaWFpsYm5SU1pYQmxZWFFnSUNBZ0lDQWdJQ0FnUFNCbVlXeHpaVHRjY2x4dUlDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0I5WEhKY2JseHlYRzRnSUNBZ0lDQWdJR2xtSUNoc2FYTjBaVzVsY2k1eVpXeGxZWE5sU0dGdVpHeGxjaUFtSmlCMGFHbHpMbDloY0hCc2FXVmtUR2x6ZEdWdVpYSnpMbWx1WkdWNFQyWW9iR2x6ZEdWdVpYSXBJRDA5UFNBdE1Ta2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ2RHaHBjeTVmWVhCd2JHbGxaRXhwYzNSbGJtVnljeTV3ZFhOb0tHeHBjM1JsYm1WeUtUdGNjbHh1SUNBZ0lDQWdJQ0I5WEhKY2JpQWdJQ0FnSUgxY2NseHVYSEpjYmlBZ0lDQWdJR2xtSUNoclpYbERiMjFpYnlrZ2UxeHlYRzRnSUNBZ0lDQWdJR1p2Y2lBb2RtRnlJR29nUFNBd095QnFJRHdnYTJWNVEyOXRZbTh1YTJWNVRtRnRaWE11YkdWdVozUm9PeUJxSUNzOUlERXBJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lIWmhjaUJwYm1SbGVDQTlJSEJ5WlhOelpXUkxaWGx6TG1sdVpHVjRUMllvYTJWNVEyOXRZbTh1YTJWNVRtRnRaWE5iYWwwcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnYVdZZ0tHbHVaR1Y0SUNFOVBTQXRNU2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J3Y21WemMyVmtTMlY1Y3k1emNHeHBZMlVvYVc1a1pYZ3NJREVwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JxSUMwOUlERTdYSEpjYmlBZ0lDQWdJQ0FnSUNCOVhISmNiaUFnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdJQ0I5WEhKY2JpQWdJQ0I5WEhKY2JpQWdmVnh5WEc1OU8xeHlYRzVjY2x4dVMyVjVZbTloY21RdWNISnZkRzkwZVhCbExsOWpiR1ZoY2tKcGJtUnBibWR6SUQwZ1puVnVZM1JwYjI0b1pYWmxiblFwSUh0Y2NseHVJQ0JsZG1WdWRDQjhmQ0FvWlhabGJuUWdQU0I3ZlNrN1hISmNibHh5WEc0Z0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2dkR2hwY3k1ZllYQndiR2xsWkV4cGMzUmxibVZ5Y3k1c1pXNW5kR2c3SUdrZ0t6MGdNU2tnZTF4eVhHNGdJQ0FnZG1GeUlHeHBjM1JsYm1WeUlEMGdkR2hwY3k1ZllYQndiR2xsWkV4cGMzUmxibVZ5YzF0cFhUdGNjbHh1SUNBZ0lIWmhjaUJyWlhsRGIyMWlieUE5SUd4cGMzUmxibVZ5TG10bGVVTnZiV0p2TzF4eVhHNGdJQ0FnYVdZZ0tHdGxlVU52YldKdklEMDlQU0J1ZFd4c0lIeDhJQ0ZyWlhsRGIyMWlieTVqYUdWamF5aDBhR2x6TGw5c2IyTmhiR1V1Y0hKbGMzTmxaRXRsZVhNcEtTQjdYSEpjYmlBZ0lDQWdJR3hwYzNSbGJtVnlMbkJ5WlhabGJuUlNaWEJsWVhRZ1BTQnNhWE4wWlc1bGNpNXdjbVYyWlc1MFVtVndaV0YwUW5sRVpXWmhkV3gwTzF4eVhHNGdJQ0FnSUNCc2FYTjBaVzVsY2k1eVpXeGxZWE5sU0dGdVpHeGxjaTVqWVd4c0tIUm9hWE1zSUdWMlpXNTBLVHRjY2x4dUlDQWdJQ0FnZEdocGN5NWZZWEJ3YkdsbFpFeHBjM1JsYm1WeWN5NXpjR3hwWTJVb2FTd2dNU2s3WEhKY2JpQWdJQ0FnSUdrZ0xUMGdNVHRjY2x4dUlDQWdJSDFjY2x4dUlDQjlYSEpjYm4wN1hISmNibHh5WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUV0bGVXSnZZWEprTzF4eVhHNGlYWDA9IiwiXHJcbnZhciBLZXlDb21ibyA9IHJlcXVpcmUoJy4va2V5LWNvbWJvJyk7XHJcblxyXG5cclxuZnVuY3Rpb24gTG9jYWxlKG5hbWUpIHtcclxuICB0aGlzLmxvY2FsZU5hbWUgICAgID0gbmFtZTtcclxuICB0aGlzLnByZXNzZWRLZXlzICAgID0gW107XHJcbiAgdGhpcy5fYXBwbGllZE1hY3JvcyA9IFtdO1xyXG4gIHRoaXMuX2tleU1hcCAgICAgICAgPSB7fTtcclxuICB0aGlzLl9raWxsS2V5Q29kZXMgID0gW107XHJcbiAgdGhpcy5fbWFjcm9zICAgICAgICA9IFtdO1xyXG59XHJcblxyXG5Mb2NhbGUucHJvdG90eXBlLmJpbmRLZXlDb2RlID0gZnVuY3Rpb24oa2V5Q29kZSwga2V5TmFtZXMpIHtcclxuICBpZiAodHlwZW9mIGtleU5hbWVzID09PSAnc3RyaW5nJykge1xyXG4gICAga2V5TmFtZXMgPSBba2V5TmFtZXNdO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5fa2V5TWFwW2tleUNvZGVdID0ga2V5TmFtZXM7XHJcbn07XHJcblxyXG5Mb2NhbGUucHJvdG90eXBlLmJpbmRNYWNybyA9IGZ1bmN0aW9uKGtleUNvbWJvU3RyLCBrZXlOYW1lcykge1xyXG4gIGlmICh0eXBlb2Yga2V5TmFtZXMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICBrZXlOYW1lcyA9IFsga2V5TmFtZXMgXTtcclxuICB9XHJcblxyXG4gIHZhciBoYW5kbGVyID0gbnVsbDtcclxuICBpZiAodHlwZW9mIGtleU5hbWVzID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICBoYW5kbGVyID0ga2V5TmFtZXM7XHJcbiAgICBrZXlOYW1lcyA9IG51bGw7XHJcbiAgfVxyXG5cclxuICB2YXIgbWFjcm8gPSB7XHJcbiAgICBrZXlDb21ibyA6IG5ldyBLZXlDb21ibyhrZXlDb21ib1N0ciksXHJcbiAgICBrZXlOYW1lcyA6IGtleU5hbWVzLFxyXG4gICAgaGFuZGxlciAgOiBoYW5kbGVyXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5fbWFjcm9zLnB1c2gobWFjcm8pO1xyXG59O1xyXG5cclxuTG9jYWxlLnByb3RvdHlwZS5nZXRLZXlDb2RlcyA9IGZ1bmN0aW9uKGtleU5hbWUpIHtcclxuICB2YXIga2V5Q29kZXMgPSBbXTtcclxuICBmb3IgKHZhciBrZXlDb2RlIGluIHRoaXMuX2tleU1hcCkge1xyXG4gICAgdmFyIGluZGV4ID0gdGhpcy5fa2V5TWFwW2tleUNvZGVdLmluZGV4T2Yoa2V5TmFtZSk7XHJcbiAgICBpZiAoaW5kZXggPiAtMSkgeyBrZXlDb2Rlcy5wdXNoKGtleUNvZGV8MCk7IH1cclxuICB9XHJcbiAgcmV0dXJuIGtleUNvZGVzO1xyXG59O1xyXG5cclxuTG9jYWxlLnByb3RvdHlwZS5nZXRLZXlOYW1lcyA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcclxuICByZXR1cm4gdGhpcy5fa2V5TWFwW2tleUNvZGVdIHx8IFtdO1xyXG59O1xyXG5cclxuTG9jYWxlLnByb3RvdHlwZS5zZXRLaWxsS2V5ID0gZnVuY3Rpb24oa2V5Q29kZSkge1xyXG4gIGlmICh0eXBlb2Yga2V5Q29kZSA9PT0gJ3N0cmluZycpIHtcclxuICAgIHZhciBrZXlDb2RlcyA9IHRoaXMuZ2V0S2V5Q29kZXMoa2V5Q29kZSk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleUNvZGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgIHRoaXMuc2V0S2lsbEtleShrZXlDb2Rlc1tpXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0aGlzLl9raWxsS2V5Q29kZXMucHVzaChrZXlDb2RlKTtcclxufTtcclxuXHJcbkxvY2FsZS5wcm90b3R5cGUucHJlc3NLZXkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XHJcbiAgaWYgKHR5cGVvZiBrZXlDb2RlID09PSAnc3RyaW5nJykge1xyXG4gICAgdmFyIGtleUNvZGVzID0gdGhpcy5nZXRLZXlDb2RlcyhrZXlDb2RlKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Q29kZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgdGhpcy5wcmVzc0tleShrZXlDb2Rlc1tpXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB2YXIga2V5TmFtZXMgPSB0aGlzLmdldEtleU5hbWVzKGtleUNvZGUpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIGlmICh0aGlzLnByZXNzZWRLZXlzLmluZGV4T2Yoa2V5TmFtZXNbaV0pID09PSAtMSkge1xyXG4gICAgICB0aGlzLnByZXNzZWRLZXlzLnB1c2goa2V5TmFtZXNbaV0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdGhpcy5fYXBwbHlNYWNyb3MoKTtcclxufTtcclxuXHJcbkxvY2FsZS5wcm90b3R5cGUucmVsZWFzZUtleSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcclxuICBpZiAodHlwZW9mIGtleUNvZGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICB2YXIga2V5Q29kZXMgPSB0aGlzLmdldEtleUNvZGVzKGtleUNvZGUpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlDb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICB0aGlzLnJlbGVhc2VLZXkoa2V5Q29kZXNbaV0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZWxzZSB7XHJcbiAgICB2YXIga2V5TmFtZXMgICAgICAgICA9IHRoaXMuZ2V0S2V5TmFtZXMoa2V5Q29kZSk7XHJcbiAgICB2YXIga2lsbEtleUNvZGVJbmRleCA9IHRoaXMuX2tpbGxLZXlDb2Rlcy5pbmRleE9mKGtleUNvZGUpO1xyXG4gICAgXHJcbiAgICBpZiAoa2lsbEtleUNvZGVJbmRleCA+IC0xKSB7XHJcbiAgICAgIHRoaXMucHJlc3NlZEtleXMubGVuZ3RoID0gMDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnByZXNzZWRLZXlzLmluZGV4T2Yoa2V5TmFtZXNbaV0pO1xyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fY2xlYXJNYWNyb3MoKTtcclxuICB9XHJcbn07XHJcblxyXG5Mb2NhbGUucHJvdG90eXBlLl9hcHBseU1hY3JvcyA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBtYWNyb3MgPSB0aGlzLl9tYWNyb3Muc2xpY2UoMCk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYWNyb3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBtYWNybyA9IG1hY3Jvc1tpXTtcclxuICAgIGlmIChtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xyXG4gICAgICBpZiAobWFjcm8uaGFuZGxlcikge1xyXG4gICAgICAgIG1hY3JvLmtleU5hbWVzID0gbWFjcm8uaGFuZGxlcih0aGlzLnByZXNzZWRLZXlzKTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucHJlc3NlZEtleXMuaW5kZXhPZihtYWNyby5rZXlOYW1lc1tqXSkgPT09IC0xKSB7XHJcbiAgICAgICAgICB0aGlzLnByZXNzZWRLZXlzLnB1c2gobWFjcm8ua2V5TmFtZXNbal0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB0aGlzLl9hcHBsaWVkTWFjcm9zLnB1c2gobWFjcm8pO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbkxvY2FsZS5wcm90b3R5cGUuX2NsZWFyTWFjcm9zID0gZnVuY3Rpb24oKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9hcHBsaWVkTWFjcm9zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICB2YXIgbWFjcm8gPSB0aGlzLl9hcHBsaWVkTWFjcm9zW2ldO1xyXG4gICAgaWYgKCFtYWNyby5rZXlDb21iby5jaGVjayh0aGlzLnByZXNzZWRLZXlzKSkge1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1hY3JvLmtleU5hbWVzLmxlbmd0aDsgaiArPSAxKSB7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5wcmVzc2VkS2V5cy5pbmRleE9mKG1hY3JvLmtleU5hbWVzW2pdKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgdGhpcy5wcmVzc2VkS2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAobWFjcm8uaGFuZGxlcikge1xyXG4gICAgICAgIG1hY3JvLmtleU5hbWVzID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLl9hcHBsaWVkTWFjcm9zLnNwbGljZShpLCAxKTtcclxuICAgICAgaSAtPSAxO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsZTtcclxuIiwiXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obG9jYWxlLCBwbGF0Zm9ybSwgdXNlckFnZW50KSB7XHJcblxyXG4gIC8vIGdlbmVyYWxcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMywgICBbJ2NhbmNlbCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoOCwgICBbJ2JhY2tzcGFjZSddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoOSwgICBbJ3RhYiddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTIsICBbJ2NsZWFyJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMywgIFsnZW50ZXInXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE2LCAgWydzaGlmdCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTcsICBbJ2N0cmwnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4LCAgWydhbHQnLCAnbWVudSddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTksICBbJ3BhdXNlJywgJ2JyZWFrJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMCwgIFsnY2Fwc2xvY2snXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDI3LCAgWydlc2NhcGUnLCAnZXNjJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzMiwgIFsnc3BhY2UnLCAnc3BhY2ViYXInXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDMzLCAgWydwYWdldXAnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM0LCAgWydwYWdlZG93biddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMzUsICBbJ2VuZCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMzYsICBbJ2hvbWUnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM3LCAgWydsZWZ0J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgzOCwgIFsndXAnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDM5LCAgWydyaWdodCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoNDAsICBbJ2Rvd24nXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQxLCAgWydzZWxlY3QnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQyLCAgWydwcmludHNjcmVlbiddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoNDMsICBbJ2V4ZWN1dGUnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ0LCAgWydzbmFwc2hvdCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoNDUsICBbJ2luc2VydCcsICdpbnMnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDQ2LCAgWydkZWxldGUnLCAnZGVsJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0NywgIFsnaGVscCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTQ1LCBbJ3Njcm9sbGxvY2snLCAnc2Nyb2xsJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxODcsIFsnZXF1YWwnLCAnZXF1YWxzaWduJywgJz0nXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE4OCwgWydjb21tYScsICcsJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxOTAsIFsncGVyaW9kJywgJy4nXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE5MSwgWydzbGFzaCcsICdmb3J3YXJkc2xhc2gnLCAnLyddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTkyLCBbJ2dyYXZlYWNjZW50JywgJ2AnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIxOSwgWydvcGVuYnJhY2tldCcsICdbJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgyMjAsIFsnYmFja3NsYXNoJywgJ1xcXFwnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDIyMSwgWydjbG9zZWJyYWNrZXQnLCAnXSddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMjIyLCBbJ2Fwb3N0cm9waGUnLCAnXFwnJ10pO1xyXG5cclxuICAvLyAwLTlcclxuICBsb2NhbGUuYmluZEtleUNvZGUoNDgsIFsnemVybycsICcwJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg0OSwgWydvbmUnLCAnMSddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoNTAsIFsndHdvJywgJzInXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUxLCBbJ3RocmVlJywgJzMnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDUyLCBbJ2ZvdXInLCAnNCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoNTMsIFsnZml2ZScsICc1J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg1NCwgWydzaXgnLCAnNiddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoNTUsIFsnc2V2ZW4nLCAnNyddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoNTYsIFsnZWlnaHQnLCAnOCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoNTcsIFsnbmluZScsICc5J10pO1xyXG5cclxuICAvLyBudW1wYWRcclxuICBsb2NhbGUuYmluZEtleUNvZGUoOTYsIFsnbnVtemVybycsICdudW0wJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSg5NywgWydudW1vbmUnLCAnbnVtMSddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoOTgsIFsnbnVtdHdvJywgJ251bTInXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDk5LCBbJ251bXRocmVlJywgJ251bTMnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMCwgWydudW1mb3VyJywgJ251bTQnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMSwgWydudW1maXZlJywgJ251bTUnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwMiwgWydudW1zaXgnLCAnbnVtNiddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTAzLCBbJ251bXNldmVuJywgJ251bTcnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwNCwgWydudW1laWdodCcsICdudW04J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDUsIFsnbnVtbmluZScsICdudW05J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDYsIFsnbnVtbXVsdGlwbHknLCAnbnVtKiddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTA3LCBbJ251bWFkZCcsICdudW0rJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMDgsIFsnbnVtZW50ZXInXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDEwOSwgWydudW1zdWJ0cmFjdCcsICdudW0tJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTAsIFsnbnVtZGVjaW1hbCcsICdudW0uJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTEsIFsnbnVtZGl2aWRlJywgJ251bS8nXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDE0NCwgWydudW1sb2NrJywgJ251bSddKTtcclxuXHJcbiAgLy8gZnVuY3Rpb24ga2V5c1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTIsIFsnZjEnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExMywgWydmMiddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTE0LCBbJ2YzJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTUsIFsnZjQnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExNiwgWydmNSddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTE3LCBbJ2Y2J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMTgsIFsnZjcnXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKDExOSwgWydmOCddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoMTIwLCBbJ2Y5J10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjEsIFsnZjEwJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjIsIFsnZjExJ10pO1xyXG4gIGxvY2FsZS5iaW5kS2V5Q29kZSgxMjMsIFsnZjEyJ10pO1xyXG5cclxuICAvLyBzZWNvbmRhcnkga2V5IHN5bWJvbHNcclxuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIGAnLCBbJ3RpbGRlJywgJ34nXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAxJywgWydleGNsYW1hdGlvbicsICdleGNsYW1hdGlvbnBvaW50JywgJyEnXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAyJywgWydhdCcsICdAJ10pO1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMycsIFsnbnVtYmVyJywgJyMnXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA0JywgWydkb2xsYXInLCAnZG9sbGFycycsICdkb2xsYXJzaWduJywgJyQnXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA1JywgWydwZXJjZW50JywgJyUnXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyA2JywgWydjYXJldCcsICdeJ10pO1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgNycsIFsnYW1wZXJzYW5kJywgJ2FuZCcsICcmJ10pO1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOCcsIFsnYXN0ZXJpc2snLCAnKiddKTtcclxuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIDknLCBbJ29wZW5wYXJlbicsICcoJ10pO1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgMCcsIFsnY2xvc2VwYXJlbicsICcpJ10pO1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLScsIFsndW5kZXJzY29yZScsICdfJ10pO1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgPScsIFsncGx1cycsICcrJ10pO1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgWycsIFsnb3BlbmN1cmx5YnJhY2UnLCAnb3BlbmN1cmx5YnJhY2tldCcsICd7J10pO1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgXScsIFsnY2xvc2VjdXJseWJyYWNlJywgJ2Nsb3NlY3VybHlicmFja2V0JywgJ30nXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyBcXFxcJywgWyd2ZXJ0aWNhbGJhcicsICd8J10pO1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgOycsIFsnY29sb24nLCAnOiddKTtcclxuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIFxcJycsIFsncXVvdGF0aW9ubWFyaycsICdcXCcnXSk7XHJcbiAgbG9jYWxlLmJpbmRNYWNybygnc2hpZnQgKyAhLCcsIFsnb3BlbmFuZ2xlYnJhY2tldCcsICc8J10pO1xyXG4gIGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgLicsIFsnY2xvc2VhbmdsZWJyYWNrZXQnLCAnPiddKTtcclxuICBsb2NhbGUuYmluZE1hY3JvKCdzaGlmdCArIC8nLCBbJ3F1ZXN0aW9ubWFyaycsICc/J10pO1xyXG5cclxuICAvL2EteiBhbmQgQS1aXHJcbiAgZm9yICh2YXIga2V5Q29kZSA9IDY1OyBrZXlDb2RlIDw9IDkwOyBrZXlDb2RlICs9IDEpIHtcclxuICAgIHZhciBrZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlICsgMzIpO1xyXG4gICAgdmFyIGNhcGl0YWxLZXlOYW1lID0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlKTtcclxuICBcdGxvY2FsZS5iaW5kS2V5Q29kZShrZXlDb2RlLCBrZXlOYW1lKTtcclxuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ3NoaWZ0ICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcclxuICBcdGxvY2FsZS5iaW5kTWFjcm8oJ2NhcHNsb2NrICsgJyArIGtleU5hbWUsIGNhcGl0YWxLZXlOYW1lKTtcclxuICB9XHJcblxyXG4gIC8vIGJyb3dzZXIgY2F2ZWF0c1xyXG4gIHZhciBzZW1pY29sb25LZXlDb2RlID0gdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykgPyA1OSAgOiAxODY7XHJcbiAgdmFyIGRhc2hLZXlDb2RlICAgICAgPSB1c2VyQWdlbnQubWF0Y2goJ0ZpcmVmb3gnKSA/IDE3MyA6IDE4OTtcclxuICB2YXIgbGVmdENvbW1hbmRLZXlDb2RlO1xyXG4gIHZhciByaWdodENvbW1hbmRLZXlDb2RlO1xyXG4gIGlmIChwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgKHVzZXJBZ2VudC5tYXRjaCgnU2FmYXJpJykgfHwgdXNlckFnZW50Lm1hdGNoKCdDaHJvbWUnKSkpIHtcclxuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSA5MTtcclxuICAgIHJpZ2h0Q29tbWFuZEtleUNvZGUgPSA5MztcclxuICB9IGVsc2UgaWYocGxhdGZvcm0ubWF0Y2goJ01hYycpICYmIHVzZXJBZ2VudC5tYXRjaCgnT3BlcmEnKSkge1xyXG4gICAgbGVmdENvbW1hbmRLZXlDb2RlICA9IDE3O1xyXG4gICAgcmlnaHRDb21tYW5kS2V5Q29kZSA9IDE3O1xyXG4gIH0gZWxzZSBpZihwbGF0Zm9ybS5tYXRjaCgnTWFjJykgJiYgdXNlckFnZW50Lm1hdGNoKCdGaXJlZm94JykpIHtcclxuICAgIGxlZnRDb21tYW5kS2V5Q29kZSAgPSAyMjQ7XHJcbiAgICByaWdodENvbW1hbmRLZXlDb2RlID0gMjI0O1xyXG4gIH1cclxuICBsb2NhbGUuYmluZEtleUNvZGUoc2VtaWNvbG9uS2V5Q29kZSwgICAgWydzZW1pY29sb24nLCAnOyddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUoZGFzaEtleUNvZGUsICAgICAgICAgWydkYXNoJywgJy0nXSk7XHJcbiAgbG9jYWxlLmJpbmRLZXlDb2RlKGxlZnRDb21tYW5kS2V5Q29kZSwgIFsnY29tbWFuZCcsICd3aW5kb3dzJywgJ3dpbicsICdzdXBlcicsICdsZWZ0Y29tbWFuZCcsICdsZWZ0d2luZG93cycsICdsZWZ0d2luJywgJ2xlZnRzdXBlciddKTtcclxuICBsb2NhbGUuYmluZEtleUNvZGUocmlnaHRDb21tYW5kS2V5Q29kZSwgWydjb21tYW5kJywgJ3dpbmRvd3MnLCAnd2luJywgJ3N1cGVyJywgJ3JpZ2h0Y29tbWFuZCcsICdyaWdodHdpbmRvd3MnLCAncmlnaHR3aW4nLCAncmlnaHRzdXBlciddKTtcclxuXHJcbiAgLy8ga2lsbCBrZXlzXHJcbiAgbG9jYWxlLnNldEtpbGxLZXkoJ2NvbW1hbmQnKTtcclxufTtcclxuIl19
