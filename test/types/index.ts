import keyboardJS = require('../../index');

keyboardJS.bind('a', (e) => {
  e.preventRepeat();
  e.pressedKeys.indexOf('a');
  e.preventDefault?.();
  const key: string | undefined = e.key;
});
keyboardJS.bind('a', function (e) {
  this.pause();
}, function (e) {
  this.resume();
  e.pressedKeys.indexOf('a');
  // @ts-expect-error release events cannot prevent repeat
  e.preventRepeat();
});
keyboardJS.bind('a + b > c', (e) => {}, (e) => {});
keyboardJS.bind(['a + b > c', 'z + y > z'], (e) => {});
keyboardJS.bind('', (e) => {});
keyboardJS.bind('a', null, (e) => {});
keyboardJS.bind('a', (e) => {}, null, true);
keyboardJS.bind((e) => {}, (e) => {});
keyboardJS.bind(null, (e) => {}, true);
keyboardJS.on('a', (e) => {});
keyboardJS.addListener('a', (e) => {});
keyboardJS.bindPress('a', (e) => {}, true);
keyboardJS.bindRelease('a', (e) => {});

const callback: keyboardJS.Callback = (e) => {};
const releaseCallback: keyboardJS.ReleaseCallback = (e) => {};
const handler = (e?: keyboardJS.KeyEvent) => {};
keyboardJS.bind('a', callback, releaseCallback);
keyboardJS.unbind('a', handler);
keyboardJS.unbind('a', null, releaseCallback);
keyboardJS.unbind(handler);
keyboardJS.off('a', handler);
keyboardJS.removeListener('a', handler);

keyboardJS.setContext('index');
const contextName: string = keyboardJS.getContext();
keyboardJS.withContext(contextName, () => {});

keyboardJS.pause();
keyboardJS.resume();
keyboardJS.reset();

keyboardJS.pressKey('a');
keyboardJS.pressKey(65);
keyboardJS.releaseKey('a');
keyboardJS.releaseKey(65);
keyboardJS.releaseAllKeys();

keyboardJS.watch();
keyboardJS.watch(window);
keyboardJS.watch(window, document);
keyboardJS.watch(document);
keyboardJS.watch(document.createElement('form'));
keyboardJS.watch(window, document.createElement('div'), 'MacIntel', 'Mozilla/5.0');
keyboardJS.stop();

keyboardJS.setLocale('us');
keyboardJS.setLocale('custom', (locale, platform, userAgent) => {
  locale.bindKeyCode(65, ['a']);
  locale.bindMacro('shift + a', ['A']);
  locale.bindMacro('shift + b', (pressedKeys) => ['B']);
  locale.setKillKey('command');
});
const locale: keyboardJS.Locale | null = keyboardJS.getLocale();

const keyboard = new keyboardJS.Keyboard(window, document);
keyboardJS.bind('a', (e) => {}).bind('b', (e) => {}).Keyboard;

keyboard
  .setLocale('us', (l) => l.bindKeyCode(65, 'a'))
  .bind('a', (e) => {})
  .bindPress('b', (e) => {})
  .bindRelease('c', (e) => {})
  .unbind('a')
  .withContext('x', () => {})
  .pressKey('a')
  .releaseKey('a')
  .releaseAllKeys()
  .pause()
  .resume()
  .reset()
  .stop();

const keyCombo = new keyboardJS.KeyCombo('a + b > c');
const matches: boolean = keyCombo.check(['a', 'b', 'c']) && keyCombo.isEqual('a + b > c');
const subCombos: string[][] = keyboardJS.KeyCombo.parseComboStr('a + b');
new keyboardJS.Locale('test').pressKey(65);
