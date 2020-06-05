import assert from 'assert';
import { KeyCombo } from '../lib/key-combo';


describe('KeyCombo', () => {


  describe('.parseComboStr', () => {

    it('can parse combo strings', () => {
      const comboArr = KeyCombo.parseComboStr('a + b');

      assert.equal(comboArr[0][0], 'a');
      assert.equal(comboArr[0][1], 'b');
    });

    it('can parse combo strings containing combo deliminators', () => {
      const comboArr = KeyCombo.parseComboStr('a + b > c + d');

      assert.equal(comboArr[0][0], 'a');
      assert.equal(comboArr[0][1], 'b');
      assert.equal(comboArr[1][0], 'c');
      assert.equal(comboArr[1][1], 'd');
    });
  });


  describe('#check', () => {

    it('can check the combo against an array of key names', () => {
      const keyCombo1 = new KeyCombo('a + b');
      const keyCombo2 = new KeyCombo('a + \\+');

      assert.ok(keyCombo1.check(['a', 'b']));
      assert.ok(keyCombo1.check(['b', 'a']));
      assert.ok(keyCombo1.check(['a', 'b', 'c']));
      assert.ok(keyCombo1.check(['z', 'a', 'b']));
      assert.ok(keyCombo1.check(['z', 'a', 'b', 'c']));

      assert.ok(keyCombo2.check(['a', '+']));
    });

    it('can check the combo containing combo deliminators against an array of key names', () => {
      const keyCombo = new KeyCombo('a + b > c + d');

      assert.ok(keyCombo.check(['a', 'b', 'c', 'd']));
      assert.ok(keyCombo.check(['b', 'a', 'd', 'c']));
      assert.ok(keyCombo.check(['a', 'b', 'e', 'c', 'd', 'f']));
      assert.ok(keyCombo.check(['z', 'a', 'b', 'y', 'c', 'd']));
      assert.ok(keyCombo.check(['z', 'a', 'b', 'y', 'x', 'c', 'd', 'w']));

      assert.equal(keyCombo.check(['c', 'd', 'a', 'b']), false);
      assert.equal(keyCombo.check(['d', 'c', 'b', 'a']), false);
    });
  });


  describe('#isEqual', () => {

    it('can correctly equate two the combo to a given one', () => {
      const keyCombo1 = new KeyCombo('a + b');
      const keyCombo2 = new KeyCombo('a + b');
      const keyCombo3 = new KeyCombo('b + a');
      const keyCombo4 = new KeyCombo('a + b + c');
      const keyCombo5 = new KeyCombo('a > b');

      assert.ok(keyCombo1.isEqual(keyCombo2));
      assert.ok(keyCombo1.isEqual(keyCombo3));
      assert.equal(keyCombo1.isEqual(keyCombo4), false);
      assert.equal(keyCombo1.isEqual(keyCombo5), false);
    });
  });
});
