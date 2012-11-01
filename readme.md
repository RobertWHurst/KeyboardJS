KeyboardJS Library
==================

Getting Started
---------------

Download the [library](https://github.com/RobertWHurst/KeyboardJS/zipball/master) and
place it somewhere in your project. All methods are accessed via the KeyboardJS namespace unless the library
is loaded with an AMD module loader.

##### Example Structure

    /
    /keyboard.js
    /app.js
    /index.html

load the script with a script tag.

##### Example index.html

    <doctype html>
    <html>
        <head>
            <title>KeyboardJS Demo</title>
            <script src="keyboard.js"></script>
            <script src="app.js"></script>
        </head>
        <body>
            <!-- Markup goes here... -->
        </body>
    </html>

What can I do with KeyboardJS?
------------------------------

KeyboardJS will allow you to bind to any key the browser can detect. It allows for
setting up complex key combos or even single key binds with ease. It is aware of combo
overlap and will not fire simpler combos or single key bindings when they share key with
larger combos.

Basically if you want to use the keyboard, this will let you do it without restrictions.

KeyboardJS has full support for AMD module loaders such as [RequireJS](http://requirejs.org/).

Methods
-------

### KeyboardJS.on

###### Usage

    KeyboardJS.on(keyCombo, onDownCallback, onUpCallback);

Binds any key or key combo. See 'keyCombo' definition below for details. The onDownCallback is fired once the key or key combo becomes active. The onUpCallback is fired when the combo no longer active (a single key is released).

Both the onUpCallback and the onUpCallback are passed three arguments. The first is the key event, the second is the keys pressed, and the third is the key combo string.

###### Returned
Returns an object containing the following methods.

* clear() - Removes the key or key combo binding.
* on() - Allows you to bind to the keyup and keydown event of the given combo. An alternative to adding the onDownCallback and onUpCallback.

### KeyboardJS.activeKeys

###### Usage

    KeyboardJS.activeKeys();

Returns an array of active keys by name.

### KeyboardJS.clear

###### Usage

    KeyboardJS.clear(keyCombo);

Removes all bindings with the given key combo. See 'keyCombo' definition for more details.

Please note that if you are just trying to remove a single binding should use the clear method in the object returned by KeyboardJS.on instead of this. This function is for removing all binding that use a certain key.

### KeyboardJS.clear.key

###### Usage

    KeyboardJS.clear.key(keyCombo);

Removes all bindings that use the given key.

### KeyboardJS.locale

###### Usage

    KeyboardJS.locale(localeName);

Changes the locale keyboardJS uses to map key presses. Out of the box KeyboardJS only supports US keyboards, however it is possible to add additional locales via KeyboardJS.locale.register().

### KeyboardJS.locale.register

###### Usage

    KeyboardJS.locale.register(localeName, localeDefinition);

Adds new locale definitions to KeyboardJS.

Definitions
-----------

### keyCombo

A string containing key names separated by whitespace, `>`, `+`, and `,`.

###### examples

* 'a' - binds to the 'a' key. Pressing 'a' will match this keyCombo.
* 'a, b' - binds to the 'a' and 'b' keys. Pressing ether of these keys will match this keyCombo.
* 'a + b' - binds to the 'a' and 'b' keys. Pressing both of these keys will match this keyCombo.
* 'a + b, c + d' - binds to the 'a', 'b', 'c' and 'd' keys. Pressing ether the 'a' key and the 'b' key,
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

[![endorse](http://api.coderwall.com/robertwhurst/endorsecount.png)](http://coderwall.com/robertwhurst)
