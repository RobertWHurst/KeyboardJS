import { Keyboard } from './lib/keyboard';
import { Locale } from './lib/locale';
import { KeyCombo } from './lib/key-combo';
import { us } from './locales/us';

const keyboard = new Keyboard();

keyboard.setLocale('us', us);

keyboard.Keyboard = Keyboard;
keyboard.Locale = Locale;
keyboard.KeyCombo = KeyCombo;

export default keyboard;
