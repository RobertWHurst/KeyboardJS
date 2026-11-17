import keyboardJS, { bind, Keyboard, type KeyEvent } from 'keyboardjs';

const handler = (e: KeyEvent) => e.preventRepeat();
bind('a', handler).unbind('a', handler);
new Keyboard().bind('b', (e) => e.pressedKeys);
keyboardJS.pause();
