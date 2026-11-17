import keyboardJS, { bind, unbind, Keyboard, type KeyEvent } from 'keyboardjs';

const handler = (e: KeyEvent) => e.preventRepeat();
const keyboard: typeof keyboardJS = bind('a', handler);
unbind('a', handler);
new Keyboard().bind('b', (e) => e.pressedKeys);
