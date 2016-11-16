
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
