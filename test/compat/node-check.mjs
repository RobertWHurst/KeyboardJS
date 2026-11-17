import assert from 'assert';
import { createRequire } from 'module';
import keyboardJS from 'keyboardjs';
import * as namespace from 'keyboardjs';
import { bind, unbind, Keyboard } from 'keyboardjs';

const require = createRequire(import.meta.url);

assert.strictEqual(require('keyboardjs'), keyboardJS);
assert.strictEqual(namespace.default, keyboardJS);
assert.strictEqual(bind('a', () => {}), keyboardJS);
assert.strictEqual(unbind('a'), keyboardJS);
assert.strictEqual(Keyboard, keyboardJS.Keyboard);
console.log('ok');
