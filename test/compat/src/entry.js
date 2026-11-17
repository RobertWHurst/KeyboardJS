import keyboardJS, { bind, unbind, Keyboard, Locale, KeyCombo } from 'keyboardjs';
import { checkLegacy } from './legacy';
import { check } from './check';

check('legacy checks share the instance', checkLegacy() === keyboardJS);
check('named bind returns the instance', bind('a', () => {}) === keyboardJS);
check('named unbind returns the instance', unbind('a') === keyboardJS);
check('named classes', Keyboard === keyboardJS.Keyboard && Locale === keyboardJS.Locale && KeyCombo === keyboardJS.KeyCombo);
console.log('ok');
