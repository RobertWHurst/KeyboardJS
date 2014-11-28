# KeyboardJS

[![Endorse](http://api.coderwall.com/robertwhurst/endorsecount.png)](http://coderwall.com/robertwhurst)
[![Flattr This](http://api.flattr.com/button/flattr-badge-large.png)](http://flattr.com/thing/1381991)

KeyboardJS is an easy to use keyboard wrapper. It supports the following:

+ Advanced key combos - Support for advanced combos with ordered stages.
+ Key combo overlap prevention - Prevents against bindings with shorter combos firing when another binding with a longer combo, sharing the same keys, has already been executed.
+ Macro keys - Support for adding vurtual keys backed by a key combo instead of a physical key.
+ Keyboard locales - Support for multiple locales. Comes with US locale.

## Examples

### Key Binding

```javascript
KeyboardJS.on('a', function() {
    console.log('you pressed a!');
});

*** User presses 'a'
>>> 'you pressed a!'
*** User releases 'a'

```

### Key Combo Binding

```javascript
KeyboardJS.on('ctrl + m', function() {
    console.log('ctrl m!');
});

//note the user can press the keys in any order
*** User presses 'ctrl' and 'm'
>>> 'ctrl m!'
*** User releases 'ctrl' and 'm'
```
### Ordered Combo Binding

```javascript
KeyboardJS.on('ctrl > m', function() {
    console.log('ctrl m!');
});

*** User presses 'ctrl'
*** User presses 'm'
>>> 'ctrl m!'
*** User releases 'ctrl' and 'm'

//if the keys are pressed in the wrong order the binding will not be triggered
*** User presses 'm'
*** User presses 'ctrl'

*** User releases 'm' and 'ctrl'
```

### Overlap Prevention

```javascript
KeyboardJS.on('ctrl > m', function() {
    console.log('ctrl m!');
});
KeyboardJS.on('shift + ctrl > m', function() {
    console.log('shift ctrl m!');
});

*** User presses 'ctrl'
*** User presses 'm'
>>> 'ctrl m!'
*** User releases 'ctrl' and 'm'

//note that shift ctrl m does not trigger the ctrl m binding
*** User presses 'shift' and 'ctrl'
*** User presses 'm'
>>> 'shift ctrl m!'
*** User releases 'shift', 'ctrl' and 'm'
```

Methods
-------



### KeyboardJS.on

###### Usage

    KeyboardJS.on(string keyCombo[, function onDownCallback[, function onUpCallback]]) => object binding

Binds any key or key combo. See 'keyCombo' definition below for details. The onDownCallback is fired once the key or key combo becomes active. The onUpCallback is fired when the combo no longer active (a single key is released).

Both the onDownCallback and the onUpCallback are passed three arguments. The first is the key event, the second is the keys pressed, and the third is the key combo string.

###### Returned
Returns an object containing the following methods.

* clear() - Removes the key or key combo binding.
* on() - Allows you to bind to the keyup and keydown event of the given combo. An alternative to adding the onDownCallback and onUpCallback.



### KeyboardJS.activeKeys

###### Usage

    KeyboardJS.activeKeys() => array activeKeys

Returns an array of active keys by name.

### KeyboardJS.clear

###### Usage

    KeyboardJS.clear(string keyCombo)

Removes all bindings with the given key combo. See 'keyCombo' definition for more details.

Please note that if you are just trying to remove a single binding should use the clear method in the object returned by KeyboardJS.on instead of this. This function is for removing all binding that use a certain key.



### KeyboardJS.clear.key

###### Usage

    KeyboardJS.clear.key(string keyCombo)

Removes all bindings that use the given key.

### KeyboardJS.locale

###### Usage

    KeyboardJS.locale([string localeName]) => string localeName

Changes the locale keyboardJS uses to map key presses. Out of the box KeyboardJS only supports US keyboards, however it is possible to add additional locales via KeyboardJS.locale.register().



### KeyboardJS.locale.register

###### Usage

    KeyboardJS.locale.register(string localeName, object localeDefinition)

Adds new locale definitions to KeyboardJS.



### KeyboardJS.macro

###### Usage

    KeyboardJS.macro(string keyCombo, array keyNames)

Accepts a key combo and an array of key names to inject once the key combo is satisfied.



### KeyboardJS.macro.remove

###### Usage

    KeyboardJS.macro.remove(string keyCombo)

Accepts a key combo and clears any and all macros bound to that key combo.



### KeyboardJS.key.name

###### Usage

    KeyboardJS.key.name(number keyCode) => array keyNames

Accepts a key code and returns the key names defined by the current locale.



### KeyboardJS.key.code

###### Usage

    KeyboardJS.key.code(string keyName) => number keyCode

Accepts a key name and returns the key code defined by the current locale.



### KeyboardJS.combo.parse

###### Usage

    KeyboardJS.combo.parse(string keyCombo) => array keyComboArray

Parses a key combo string into a 3 dimensional array.

- Level 1 - sub combos.
- Level 2 - combo stages. A stage is a set of key name pairs that must be satisfied in the order they are defined.
- Level 3 - each key name to the stage.



### KeyboardJS.combo.stringify

###### Usage

    KeyboardJS.combo.stringify(array keyComboArray) => string KeyCombo

Stringifys a parsed key combo.


### KeyboardJS.pressKey

###### Usage

    KeyboardJS.pressKey(string keyName)

Add an active key to an array of active keys by name.


### KeyboardJS.releaseKey

###### Usage

    KeyboardJS.releaseKey(string keyName)

Removes an active key from an array of active keys by name.



Definitions
-----------

### keyCombo

A string containing key names separated by whitespace, `>`, `+`, and `,`.

###### examples

* 'a' - binds to the 'a' key. Pressing 'a' will match this keyCombo.
* 'a, b' - binds to the 'a' and 'b' keys. Pressing either of these keys will match this keyCombo.
* 'a + b' - binds to the 'a' and 'b' keys. Pressing both of these keys will match this keyCombo.
* 'a + b, c + d' - binds to the 'a', 'b', 'c' and 'd' keys. Pressing either the 'a' key and the 'b' key,
or the 'c' and the 'd' key will match this keyCombo.

###localeDefinitions

An object that maps keyNames to their keycode and stores locale specific macros. Used for mapping keys on different locales.

###### example

    {
        "map": {
            "65": ["a"],
            "66": ["b"],
            ...
        },
        "macros": [
            ["shift + `", ["tilde", "~"]],
            ["shift + 1", ["exclamation", "!"]],
            ...
        ]
    }

Language Support
----------------

KeyboardJS can support any locale, however out of the box it just comes with the US locale (for now..,). Adding a new
locale is easy. Map your keyboard to an object and pass it to KeyboardJS.locale.register('myLocale', {/*localeDefinition*/}) then call
KeyboardJS.locale('myLocale').

If you create a new locale please consider sending me a pull request or submit it to the
[issue tracker](http://github.com/RobertWHurst/KeyboardJS/issues) so I can add it to the library.

Credits
-------

I made this to enable better access to key controls in my applications. I'd like to share
it with fellow devs. Feel free to fork this project and make your own changes.
