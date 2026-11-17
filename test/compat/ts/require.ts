import keyboardJS = require('keyboardjs');

const keyboard: keyboardJS.KeyboardJS = keyboardJS.bind('a', (e: keyboardJS.KeyEvent) => e.preventRepeat());
keyboard.unbind('a');
new keyboardJS.Keyboard().setLocale('us');
