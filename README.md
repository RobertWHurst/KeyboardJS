
KeyboardJS
==========

[![Build Status](http://img.shields.io/github/workflow/status/RobertWHurst/KeyboardJS/Unit%20Tests.svg?style=flat)](https://github.com/RobertWHurst/KeyboardJS/actions)
[![NPM Version](http://img.shields.io/npm/v/keyboardjs.svg?style=flat)](https://www.npmjs.org/package/keyboardjs)
[![Downloads This Week](http://img.shields.io/npm/dm/keyboardjs.svg?style=flat)](https://www.npmjs.org/package/keyboardjs)
[![License](http://img.shields.io/npm/l/keyboardjs.svg?style=flat)](https://www.npmjs.org/package/keyboardjs)

KeyboardJS is a library for use in the browser (node.js compatible). It Allows
developers to easily setup key bindings. Use key combos to setup complex
bindings. KeyboardJS also provides contexts. Contexts are great for single page
applications. They allow you to scope your bindings to various parts of your
application. Out of the box keyboardJS uses a US keyboard locale. If you need
support for a different type of keyboard KeyboardJS provides custom locale
support so you can create with a locale that better matches your needs.

KeyboardJS is available as a NPM module. If you're not using a build system
like webpack, simply add
[keyboard.js](https://github.com/RobertWHurst/KeyboardJS/blob/master/dist/keyboard.js)
or
[keyboard.min.js](https://github.com/RobertWHurst/KeyboardJS/blob/master/dist/keyboard.min.js)
from the dist folder in this repo to your project via a script tag.

```shell
npm install keyboardjs
```

Note that all key names can be found in [./locales/us.js](https://github.com/RobertWHurst/KeyboardJS/blob/master/locales/us.js).

__Setting up bindings is easy__

```javascript
keyboardJS.bind('a', (e) => {
  console.log('a is pressed');
});
keyboardJS.bind('a + b', (e) => {
  console.log('a and b is pressed');
});
keyboardJS.bind('a + b > c', (e) => {
  console.log('a and b then c is pressed');
});
keyboardJS.bind(['a + b > c', 'z + y > z'], (e) => {
  console.log('a and b then c or z and y then z is pressed');
});
keyboardJS.bind('', (e) => {
  console.log('any key was pressed');
});
//alt, shift, ctrl, etc must be lowercase
keyboardJS.bind('alt + shift > a', (e) => {
  console.log('alt, shift and a is pressed');
});

// keyboardJS.bind === keyboardJS.on === keyboardJS.addListener
```


__keydown vs a keyup__

```javascript
keyboardJS.bind('a', (e) => {
  console.log('a is pressed');
}, (e) => {
  console.log('a is released');
});
keyboardJS.bind('a', null, (e) => {
  console.log('a is released');
});
```


__Prevent keydown repeat__

```javascript
keyboardJS.bind('a', (e) => {
  // this will run once even if a is held
  e.preventRepeat();
  console.log('a is pressed');
});
```


__Unbind things__

```javascript
keyboardJS.unbind('a', previouslyBoundHandler);
// keyboardJS.unbind === keyboardJS.off === keyboardJS.removeListener
```


__Using contexts__

```javascript

  // these will execute in all contexts
  keyboardJS.bind('a', (e) => {});
  keyboardJS.bind('b', (e) => {});
  keyboardJS.bind('c', (e) => {});

  // these will execute in the index context
  keyboardJS.setContext('index');
  keyboardJS.bind('1', (e) => {});
  keyboardJS.bind('2', (e) => {});
  keyboardJS.bind('3', (e) => {});

  // these will execute in the foo context
  keyboardJS.setContext('foo');
  keyboardJS.bind('x', (e) => {});
  keyboardJS.bind('y', (e) => {});
  keyboardJS.bind('z', (e) => {});

  // if we have a router we can activate these contexts when appropriate
  myRouter.on('/', (e) => {
    keyboardJS.setContext('index');
  });
  myRouter.on('/foo', (e) => {
    keyboardJS.setContext('foo');
  });

  // you can always figure out your context too
  const contextName = keyboardJS.getContext();

  // you can also set up handlers for a context without losing the current context
  keyboardJS.withContext('bar', ()  =>{
    // these will execute in the bar context
    keyboardJS.bind('7', (e) => {});
    keyboardJS.bind('8', (e) => {});
    keyboardJS.bind('9', (e) => {});
  });
```


__pause, resume, and reset__

```javascript

// the keyboard will no longer trigger bindings
keyboardJS.pause();

// the keyboard will once again trigger bindings
keyboardJS.resume();

// all active bindings will released and unbound,
// pressed keys will be cleared
keyboardJS.reset();
```


__pressKey, releaseKey, and releaseAllKeys__

```javascript

// pressKey
keyboardJS.pressKey('a');
// or
keyboardJS.pressKey(65);

// releaseKey
keyboardJS.releaseKey('a');
// or
keyboardJS.releaseKey(65);

// releaseAllKeys
keyboardJS.releaseAllKeys();
```


__watch and stop__

```javascript
// bind to the window and document in the current window
keyboardJS.watch();

// or pass your own window and document
keyboardJS.watch(myDoc);
keyboardJS.watch(myWin, myDoc);

// or scope to a specific element
keyboardJS.watch(myForm);
keyboardJS.watch(myWin, myForm);

// detach KeyboardJS from the window and document/element
keyboardJS.stop();
```
