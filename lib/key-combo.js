
export class KeyCombo {
  constructor(keyComboStr) {
    this.sourceStr = keyComboStr;
    this.subCombos = KeyCombo.parseComboStr(keyComboStr);
    this.keyNames  = this.subCombos.reduce((memo, nextSubCombo) =>
      memo.concat(nextSubCombo), []);
  }

  check(pressedKeyNames) {
    let startingKeyNameIndex = 0;
    for (let i = 0; i < this.subCombos.length; i += 1) {
      startingKeyNameIndex = this._checkSubCombo(
        this.subCombos[i],
        startingKeyNameIndex,
        pressedKeyNames
      );
      if (startingKeyNameIndex === -1) { return false; }
    }
    return true;
  };

  isEqual(otherKeyCombo) {
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
    for (let i = 0; i < this.subCombos.length; i += 1) {
      if (this.subCombos[i].length !== otherKeyCombo.subCombos[i].length) {
        return false;
      }
    }

    for (let i = 0; i < this.subCombos.length; i += 1) {
      const subCombo      = this.subCombos[i];
      const otherSubCombo = otherKeyCombo.subCombos[i].slice(0);

      for (let j = 0; j < subCombo.length; j += 1) {
        const keyName = subCombo[j];
        const index   = otherSubCombo.indexOf(keyName);

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

  _checkSubCombo(subCombo, startingKeyNameIndex, pressedKeyNames) {
    subCombo = subCombo.slice(0);
    pressedKeyNames = pressedKeyNames.slice(startingKeyNameIndex);

    let endIndex = startingKeyNameIndex;
    for (let i = 0; i < subCombo.length; i += 1) {

      let keyName = subCombo[i];
      if (keyName[0] === '\\') {
        const escapedKeyName = keyName.slice(1);
        if (
          escapedKeyName === KeyCombo.comboDeliminator ||
          escapedKeyName === KeyCombo.keyDeliminator
        ) {
          keyName = escapedKeyName;
        }
      }

      const index = pressedKeyNames.indexOf(keyName);
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
}

KeyCombo.comboDeliminator = '>';
KeyCombo.keyDeliminator   = '+';

KeyCombo.parseComboStr = function(keyComboStr) {
  const subComboStrs = KeyCombo._splitStr(keyComboStr, KeyCombo.comboDeliminator);
  const combo        = [];

  for (let i = 0 ; i < subComboStrs.length; i += 1) {
    combo.push(KeyCombo._splitStr(subComboStrs[i], KeyCombo.keyDeliminator));
  }
  return combo;
}

KeyCombo._splitStr = function(str, deliminator) {
  const s  = str;
  const d  = deliminator;
  let c  = '';
  const ca = [];

  for (let ci = 0; ci < s.length; ci += 1) {
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
