
var KeyBoard = require('./keyboard');
var KeyEvent = KeyBoard.KeyEvent;
var Readable = require('stream').Readable;

function WindowReadable(targetWindow, targetElement, targetPlatform, targetUserAgent){
  Readable.call(this, {objectMode : true});

  targetWindow && targetWindow !== null || (targetWindow = global);

  if (typeof targetWindow.nodeType === 'number') {
    targetUserAgent = targetPlatform;
    targetPlatform  = targetElement;
    targetElement   = targetWindow;
    targetWindow    = global;
  }

  var userAgent = targetWindow.navigator && targetWindow.navigator.userAgent || '';
  var platform  = targetWindow.navigator && targetWindow.navigator.platform  || '';

  targetElement   && targetElement   !== null || (targetElement   = targetWindow.document);
  targetPlatform  && targetPlatform  !== null || (targetPlatform  = platform);
  targetUserAgent && targetUserAgent !== null || (targetUserAgent = userAgent);

  this._isModernBrowser = !!targetWindow.addEventListener;
  this._targetKeyDownBinding = function(event) {
    _this.push(new KeyEvent(KeyBoard.PRESS, event.keyCode, event ));
  };
  this._targetKeyUpBinding = function(event) {
    _this.push(new KeyEvent(KeyBoard.RELEASE, event.keyCode, event ));
  };
  this._targetResetBinding = function(event) {
    _this.push(new KeyEvent(KeyBoard.RESET, null, event ));
  };

  this._bindEvent(targetElement, 'keydown', this._targetKeyDownBinding);
  this._bindEvent(targetElement, 'keyup',   this._targetKeyUpBinding);
  this._bindEvent(targetWindow,  'focus',   this._targetResetBinding);
  this._bindEvent(targetWindow,  'blur',    this._targetResetBinding);

  this._targetElement   = targetElement;
  this._targetWindow    = targetWindow;
  this._targetPlatform  = targetPlatform;
  this._targetUserAgent = targetUserAgent;

}

WindowReadable.prototype = Object.create(Readable.prototype);

WindowReadable.prototype.constructor = WindowReadable;

WindowReadable.prototype._bindEvent = function(targetElement, eventName, handler) {
  return this._isModernBrowser ?
    targetElement.addEventListener(eventName, handler, false) :
    targetElement.attachEvent('on' + eventName, handler);
}

WindowReadable.prototype._unbindEvent = function(targetElement, eventName, handler) {
  return this._isModernBrowser ?
    targetElement.removeEventListener(eventName, handler, false) :
    targetElement.detachEvent('on' + eventName, handler);
};

WindowReadable.prototype.stop = function(){
  var _this = this;
  this._unbindEvent(this._targetElement, 'keydown', this._targetKeyDownBinding);
  this._unbindEvent(this._targetElement, 'keyup',   this._targetKeyUpBinding);
  this._unbindEvent(this._targetWindow,  'focus',   this._targetResetBinding);
  this._unbindEvent(this._targetWindow,  'blur',    this._targetResetBinding);

  this._targetWindow  = null;
  this._targetElement = null;
  this._targetPlatform  = null;
  this._targetUserAgent = null;
  this.push(null);
}

WindowReadable.prototype._read = function(){
  return false;
}

module.exports = WindowReadable;
