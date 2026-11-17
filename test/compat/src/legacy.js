import keyboardJS from 'keyboardjs';
import * as namespace from 'keyboardjs';
import { Keyboard } from 'keyboardjs/lib/keyboard';
import { Keyboard as KeyboardWithExt } from 'keyboardjs/lib/keyboard.js';
import { Locale } from 'keyboardjs/lib/locale';
import { KeyCombo } from 'keyboardjs/lib/key-combo';
import { us } from 'keyboardjs/locales/us';
import { check } from './check';
import required from './required.cjs';

export function checkLegacy() {
  check('default import', typeof keyboardJS.bind === 'function');
  check('namespace import', typeof (namespace.default || namespace).bind === 'function');
  check('require is the same instance as import', required.keyboardJS === keyboardJS);
  check('min build', typeof required.min.bind === 'function');
  check('extensionless dist path', typeof required.dist.bind === 'function');
  check('lib deep imports', [Keyboard, KeyboardWithExt, Locale, KeyCombo].every(c => typeof c === 'function'));
  check('locale deep import', typeof us === 'function');
  check('chaining', keyboardJS.bind('a', () => {}).unbind('a') === keyboardJS);
  return keyboardJS;
}
