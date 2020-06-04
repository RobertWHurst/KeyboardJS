import assert from 'assert';
import { Locale } from '../lib/locale';
import { KeyCombo } from '../lib/key-combo';


describe('Locale', () => {

  let locale;
  beforeEach(() => {
    locale = new Locale('test');
  });


  describe('#bindKeyCode', () => {

    it('binds a key code to a key name', () => {
      locale.bindKeyCode(0, 'a');

      assert.equal(locale._keyMap[0][0], 'a');
    });

    it('binds a key code to a set of key names', () => {
      locale.bindKeyCode(0, ['a', 'b', 'c']);

      assert.equal(locale._keyMap[0][0], 'a');
      assert.equal(locale._keyMap[0][1], 'b');
      assert.equal(locale._keyMap[0][2], 'c');
    });
  });


  describe('#bindMacro', () => {

    it('binds a key combo to a key name', () => {
      locale.bindMacro('a', 'b');

      assert.equal(locale._macros[0].keyCombo.sourceStr, 'a');
      assert.equal(locale._macros[0].keyNames[0], 'b');
    });

    it('binds a key combo to a set of key names', () => {
      locale.bindMacro('a', ['b', 'c', 'd']);

      assert.equal(locale._macros[0].keyCombo.sourceStr, 'a');
      assert.equal(locale._macros[0].keyNames[0], 'b');
      assert.equal(locale._macros[0].keyNames[1], 'c');
      assert.equal(locale._macros[0].keyNames[2], 'd');
    });

    it('binds a key combo to a macro handler', () => {
      const macroHandler = () => {};
      locale.bindMacro('a', macroHandler);

      assert.equal(locale._macros[0].keyCombo.sourceStr, 'a');
      assert.equal(locale._macros[0].handler, macroHandler);
    });
  });


  describe('#getKeyCodes', () => {

    it('gets all key codes associated with a key name', () => {
      locale._keyMap[0] = ['a'];
      locale._keyMap[1] = ['b'];
      locale._keyMap[2] = ['a'];

      const keyCodes = locale.getKeyCodes('a');

      assert.equal(keyCodes[0], 0);
      assert.equal(keyCodes[1], 2);
    });
  });


  describe('#getKeyNames', () => {

    it('gets all key names associated with a key code', () => {
      locale._keyMap[0] = ['a', 'b'];

      const keyNames = locale.getKeyNames(0);

      assert.equal(keyNames[0], 'a');
      assert.equal(keyNames[1], 'b');
    });
  });


  describe('#setKillKey', () => {

    it('marks a key code as a kill key', () => {
      locale.setKillKey(0);

      assert.equal(locale._killKeyCodes[0], 0);
    });

    it('marks all key codes matching a key name as a kill key', () => {
      locale._keyMap[0] = ['a'];
      locale._keyMap[1] = ['a'];

      locale.setKillKey('a');

      assert.equal(locale._killKeyCodes[0], 0);
      assert.equal(locale._killKeyCodes[1], 1);
    });
  });


  describe('#pressKey', () => {

    beforeEach(() => {
      locale._keyMap = {
        0: ['a', 'b'],
        1: ['a', 'c'],
      };
    });

    it('adds all key names associated with a given key code to pressedKeys', () => {
      locale.pressKey(0);

      assert.equal(locale.pressedKeys[0], 'a');
      assert.equal(locale.pressedKeys[1], 'b');
    });

    it('adds all other key names associated with the same key code of a given key name to pressedKeys', () => {
      locale.pressKey('a');

      assert.equal(locale.pressedKeys[0], 'a');
      assert.equal(locale.pressedKeys[1], 'b');
      assert.equal(locale.pressedKeys[2], 'c');
    });

    it('applies macros with combos that match the pressed keys', () => {
      locale._keyMap = {
        0: ['a'],
        1: ['b']
      };
      locale._macros = [
        {
          keyCombo : new KeyCombo('a + b'),
          keyNames : ['c', 'd'],
          handler  : null
        }, {
          keyCombo : new KeyCombo('a + b'),
          handler  : function(pressedKeys) {

            assert.equal(pressedKeys, locale.pressedKeys);

            return ['e', 'f'];
          },
          keyNames : null
        }
      ];

      locale.pressKey('a');
      locale.pressKey('b');

      assert.equal(locale.pressedKeys[0], 'a');
      assert.equal(locale.pressedKeys[1], 'b');
      assert.equal(locale.pressedKeys[2], 'c');
      assert.equal(locale.pressedKeys[3], 'd');
      assert.equal(locale.pressedKeys[4], 'e');
      assert.equal(locale.pressedKeys[5], 'f');
      assert.equal(locale._appliedMacros[0], locale._macros[0]);
      assert.equal(locale._appliedMacros[1], locale._macros[1]);
      assert.equal(locale._appliedMacros[1].keyNames[0], 'e');
      assert.equal(locale._appliedMacros[1].keyNames[1], 'f');
    });
  });


  describe('#releaseKey', () => {

    beforeEach(() => {
      locale._keyMap = {
        0: ['a', 'b'],
        1: ['a', 'c'],
      };
      locale.pressedKeys = ['a', 'b', 'c'];
    });

    it('removes all key names associated with a given key code from pressedKeys', () => {
      locale.releaseKey(0);

      assert.equal(locale.pressedKeys[0], 'c');
    });

    it('removes all other key names associated with the same key code of a given key name from pressedKeys', () => {
      locale.releaseKey('a');

      assert.equal(locale.pressedKeys.length, 0);
    });

    it('clears applied macros with combos that no longer match the pressed keys', () => {
      locale._keyMap = {
        0: ['a'],
        1: ['b'],
      };
      locale._macros = [
        {
          keyCombo : new KeyCombo('a + b'),
          keyNames : ['c', 'd'],
          handler  : null
        }, {
          keyCombo : new KeyCombo('a + b'),
          keyNames : ['e', 'f'],
          handler  : function(pressedKeys) {

            assert.equal(pressedKeys, locale.pressedKeys);

            return ['e', 'f'];
          }
        }
      ];
      locale.pressedKeys = ['a', 'b', 'c', 'd', 'e', 'f'];
      locale._appliedMacros = locale._macros.slice(0);

      locale.releaseKey('a');

      assert.equal(locale.pressedKeys[0], 'b');
      assert.equal(locale.pressedKeys.length, 1);
      assert.equal(locale._appliedMacros.length, 0);
    });
  });
});
