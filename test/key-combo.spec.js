
var assert   = require('assert');
var KeyCombo = require('../lib/key-combo');


describe('KeyCombo', function() {


  describe('.parseComboStr', function() {

    it('can parse combo strings', function() {
      var comboArr = KeyCombo.parseComboStr('a + b');

      assert.equal(comboArr[0][0], 'a');
      assert.equal(comboArr[0][1], 'b');
    });

    it('can parse combo strings containing combo deliminators', function() {
      var comboArr = KeyCombo.parseComboStr('a + b > c + d');

      assert.equal(comboArr[0][0], 'a');
      assert.equal(comboArr[0][1], 'b');
      assert.equal(comboArr[1][0], 'c');
      assert.equal(comboArr[1][1], 'd');
    });

    it('can parse combo strings containing sequence deliminators');
  });


  describe('#check', function() {

    it('can check the combo against an array of key names', function() {
      var keyCombo1 = new KeyCombo('a + b');
      var keyCombo2 = new KeyCombo('a + \\+');

      assert.ok(keyCombo1.check(['a', 'b']));
      assert.ok(keyCombo1.check(['b', 'a']));
      assert.ok(keyCombo1.check(['a', 'b', 'c']));
      assert.ok(keyCombo1.check(['z', 'a', 'b']));
      assert.ok(keyCombo1.check(['z', 'a', 'b', 'c']));

      assert.ok(keyCombo2.check(['a', '+']));
    });

    it('can check the combo containing combo deliminators against an array of key names', function() {
      var keyCombo = new KeyCombo('a + b > c + d');

      assert.ok(keyCombo.check(['a', 'b', 'c', 'd']));
      assert.ok(keyCombo.check(['b', 'a', 'd', 'c']));
      assert.ok(keyCombo.check(['a', 'b', 'e', 'c', 'd', 'f']));
      assert.ok(keyCombo.check(['z', 'a', 'b', 'y', 'c', 'd']));
      assert.ok(keyCombo.check(['z', 'a', 'b', 'y', 'x', 'c', 'd', 'w']));

      assert.equal(keyCombo.check(['c', 'd', 'a', 'b']), false);
      assert.equal(keyCombo.check(['d', 'c', 'b', 'a']), false);
    });

    it('can check the combo containing sequence deliminators against an array of key names');
  });
  describe('#isEqual', function() {

    it('can correctly equate two the combo to a given one', function() {
      var keyCombo1 = new KeyCombo('a + b');
      var keyCombo2 = new KeyCombo('a + b');
      var keyCombo3 = new KeyCombo('b + a');
      var keyCombo4 = new KeyCombo('a + b + c');
      var keyCombo5 = new KeyCombo('a > b');

      assert.ok(keyCombo1.isEqual(keyCombo2));
      assert.ok(keyCombo1.isEqual(keyCombo3));
      assert.equal(keyCombo1.isEqual(keyCombo4), false);
      assert.equal(keyCombo1.isEqual(keyCombo5), false);
    });
  });
});
