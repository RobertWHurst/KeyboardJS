
import Keyboard from './lib/keyboard';
import Locale from './lib/locale';
import KeyCombo from './lib/key-combo';
import usLocale from './locales/us';

const keyboard = new Keyboard();
keyboard.setLocale('us', usLocale);

module.exports = keyboard;
export { Keyboard };
export { Locale} ;
export { KeyCombo };
