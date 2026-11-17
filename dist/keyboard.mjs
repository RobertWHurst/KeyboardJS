import keyboard from './keyboard.js';

export default keyboard;

export const Keyboard = keyboard.Keyboard;
export const Locale = keyboard.Locale;
export const KeyCombo = keyboard.KeyCombo;

export const setLocale = (...args) => keyboard.setLocale(...args);
export const getLocale = (...args) => keyboard.getLocale(...args);
export const bind = (...args) => keyboard.bind(...args);
export const addListener = (...args) => keyboard.addListener(...args);
export const on = (...args) => keyboard.on(...args);
export const bindPress = (...args) => keyboard.bindPress(...args);
export const bindRelease = (...args) => keyboard.bindRelease(...args);
export const unbind = (...args) => keyboard.unbind(...args);
export const removeListener = (...args) => keyboard.removeListener(...args);
export const off = (...args) => keyboard.off(...args);
export const setContext = (...args) => keyboard.setContext(...args);
export const getContext = (...args) => keyboard.getContext(...args);
export const withContext = (...args) => keyboard.withContext(...args);
export const watch = (...args) => keyboard.watch(...args);
export const stop = (...args) => keyboard.stop(...args);
export const pressKey = (...args) => keyboard.pressKey(...args);
export const releaseKey = (...args) => keyboard.releaseKey(...args);
export const releaseAllKeys = (...args) => keyboard.releaseAllKeys(...args);
export const pause = (...args) => keyboard.pause(...args);
export const resume = (...args) => keyboard.resume(...args);
export const reset = (...args) => keyboard.reset(...args);
