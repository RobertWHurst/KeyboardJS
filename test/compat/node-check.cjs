const assert = require('assert');
const keyboardJS = require('keyboardjs');

assert.strictEqual(typeof keyboardJS.bind, 'function');
assert.strictEqual(require('keyboardjs/dist/keyboard.js'), keyboardJS);
assert.strictEqual(require('keyboardjs/dist/keyboard'), keyboardJS);
assert.strictEqual(typeof require('keyboardjs/dist/keyboard.min.js').bind, 'function');
assert.strictEqual(require('keyboardjs/package.json').name, 'keyboardjs');
assert.strictEqual(keyboardJS.bind('a', () => {}).unbind('a'), keyboardJS);
console.log('ok');
