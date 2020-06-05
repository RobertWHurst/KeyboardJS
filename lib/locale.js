import { KeyCombo } from './key-combo';


export class Locale {
  constructor(name) {
    this.localeName          = name;
    this.activeTargetKeys = [];
    this.pressedKeys         = [];
    this._appliedMacros      = [];
    this._keyMap             = {};
    this._killKeyCodes       = [];
    this._macros             = [];
  }

  bindKeyCode(keyCode, keyNames) {
    if (typeof keyNames === 'string') {
      keyNames = [keyNames];
    }

    this._keyMap[keyCode] = keyNames;
  };

  bindMacro(keyComboStr, keyNames) {
    if (typeof keyNames === 'string') {
      keyNames = [ keyNames ];
    }

    let handler = null;
    if (typeof keyNames === 'function') {
      handler = keyNames;
      keyNames = null;
    }

    const macro = {
      keyCombo : new KeyCombo(keyComboStr),
      keyNames : keyNames,
      handler  : handler
    };

    this._macros.push(macro);
  };

  getKeyCodes(keyName) {
    const keyCodes = [];
    for (const keyCode in this._keyMap) {
      const index = this._keyMap[keyCode].indexOf(keyName);
      if (index > -1) { keyCodes.push(keyCode|0); }
    }
    return keyCodes;
  };

  getKeyNames(keyCode) {
    return this._keyMap[keyCode] || [];
  };

  setKillKey(keyCode) {
    if (typeof keyCode === 'string') {
      const keyCodes = this.getKeyCodes(keyCode);
      for (let i = 0; i < keyCodes.length; i += 1) {
        this.setKillKey(keyCodes[i]);
      }
      return;
    }

    this._killKeyCodes.push(keyCode);
  };

  pressKey(keyCode) {
    if (typeof keyCode === 'string') {
      const keyCodes = this.getKeyCodes(keyCode);
      for (let i = 0; i < keyCodes.length; i += 1) {
        this.pressKey(keyCodes[i]);
      }
      return;
    }

    this.activeTargetKeys.length = 0;
    const keyNames = this.getKeyNames(keyCode);
    for (let i = 0; i < keyNames.length; i += 1) {
      this.activeTargetKeys.push(keyNames[i]);
      if (this.pressedKeys.indexOf(keyNames[i]) === -1) {
        this.pressedKeys.push(keyNames[i]);
      }
    }

    this._applyMacros();
  };

  releaseKey(keyCode) {
    if (typeof keyCode === 'string') {
      const keyCodes = this.getKeyCodes(keyCode);
      for (let i = 0; i < keyCodes.length; i += 1) {
        this.releaseKey(keyCodes[i]);
      }

    } else {
      const keyNames         = this.getKeyNames(keyCode);
      const killKeyCodeIndex = this._killKeyCodes.indexOf(keyCode);

      if (killKeyCodeIndex !== -1) {
        this.pressedKeys.length = 0;
      } else {
        for (let i = 0; i < keyNames.length; i += 1) {
          const index = this.pressedKeys.indexOf(keyNames[i]);
          if (index > -1) {
            this.pressedKeys.splice(index, 1);
          }
        }
      }

      this.activeTargetKeys.length = 0;
      this._clearMacros();
    }
  };

  _applyMacros() {
    const macros = this._macros.slice(0);
    for (let i = 0; i < macros.length; i += 1) {
      const macro = macros[i];
      if (macro.keyCombo.check(this.pressedKeys)) {
        if (macro.handler) {
          macro.keyNames = macro.handler(this.pressedKeys);
        }
        for (let j = 0; j < macro.keyNames.length; j += 1) {
          if (this.pressedKeys.indexOf(macro.keyNames[j]) === -1) {
            this.pressedKeys.push(macro.keyNames[j]);
          }
        }
        this._appliedMacros.push(macro);
      }
    }
  };

  _clearMacros() {
    for (let i = 0; i < this._appliedMacros.length; i += 1) {
      const macro = this._appliedMacros[i];
      if (!macro.keyCombo.check(this.pressedKeys)) {
        for (let j = 0; j < macro.keyNames.length; j += 1) {
          const index = this.pressedKeys.indexOf(macro.keyNames[j]);
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
}
