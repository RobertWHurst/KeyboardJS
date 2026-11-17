import keyboardJS from './index.js';

export default keyboardJS;

export type KeyEvent = keyboardJS.KeyEvent;
export type KeyReleaseEvent = keyboardJS.KeyReleaseEvent;
export type Callback = keyboardJS.Callback;
export type ReleaseCallback = keyboardJS.ReleaseCallback;
export type LocaleBuilder = keyboardJS.LocaleBuilder;
export type MacroHandler = keyboardJS.MacroHandler;
export type WatchTarget = keyboardJS.WatchTarget;
export type Keyboard = keyboardJS.Keyboard;
export type Locale = keyboardJS.Locale;
export type KeyCombo = keyboardJS.KeyCombo;
export type KeyboardJS = keyboardJS.KeyboardJS;

export declare const Keyboard: keyboardJS.KeyboardConstructor;
export declare const Locale: keyboardJS.LocaleConstructor;
export declare const KeyCombo: keyboardJS.KeyComboConstructor;

export declare const setLocale: keyboardJS.KeyboardJS['setLocale'];
export declare const getLocale: keyboardJS.KeyboardJS['getLocale'];
export declare const bind: keyboardJS.KeyboardJS['bind'];
export declare const addListener: keyboardJS.KeyboardJS['addListener'];
export declare const on: keyboardJS.KeyboardJS['on'];
export declare const bindPress: keyboardJS.KeyboardJS['bindPress'];
export declare const bindRelease: keyboardJS.KeyboardJS['bindRelease'];
export declare const unbind: keyboardJS.KeyboardJS['unbind'];
export declare const removeListener: keyboardJS.KeyboardJS['removeListener'];
export declare const off: keyboardJS.KeyboardJS['off'];
export declare const setContext: keyboardJS.KeyboardJS['setContext'];
export declare const getContext: keyboardJS.KeyboardJS['getContext'];
export declare const withContext: keyboardJS.KeyboardJS['withContext'];
export declare const watch: keyboardJS.KeyboardJS['watch'];
export declare const stop: keyboardJS.KeyboardJS['stop'];
export declare const pressKey: keyboardJS.KeyboardJS['pressKey'];
export declare const releaseKey: keyboardJS.KeyboardJS['releaseKey'];
export declare const releaseAllKeys: keyboardJS.KeyboardJS['releaseAllKeys'];
export declare const pause: keyboardJS.KeyboardJS['pause'];
export declare const resume: keyboardJS.KeyboardJS['resume'];
export declare const reset: keyboardJS.KeyboardJS['reset'];
