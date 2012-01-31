KeyboardJS Library
==================

Getting Started
---------------

Download the [library](https://github.com/RobertWHurst/KeyboardJS/zipball/master) and
place it somewhere in your project. All methods are accessed via the KeyboardJS namespace enless the library
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

### KeyboardJS.bind.key

###### Usage

    KeyboardJS.bind.key(keyCombo, onDownCallback, onUpCallback);

Binds any key or key combo. See 'keyCombo' definition below
for details. The onDownCallback is fired once the key or key combo becomes active. The
onUpCallback is fired when the combo no longer active (a single key is released).

Both the onUpCallback and the onDownCallback are passed three arguments. The first is the
key event, the second is the keys pressed, and the third is the key combo string.

###### Returned
Returns an object containing the following methods.

* clear - Removes the key or key combo binding.

### KeyboardJS.bind.axis

###### Usage

    KeyboardJS.bind.axis(upkeyCombo, downkeyCombo, leftkeyCombo, rightkeyCombo, callback);

Binds four keys or key combos as an up, down, left, right 
axis. See 'keyCombo' definition above for details. The callback is fired when any of the key
combos are active. It is passed an axis object. See 'axis' definition below for more details.

###### Returned
Returns an object containing the following methods.

* clear - Removes the axis binding.

### KeyboardJS.activeKeys

###### Usage

    KeyboardJS.activeKeys();

Returns an array of active keys by name.

### KeyboardJS.unbind.key

###### Usage

	KeyboardJS.unbind.key(keyCombo);

Removes all bindings with a key or key combo. See 'keyCombo' definition for more details.

Please note that if you are just trying to remove one binding you should use the clear method in the object returned
by KeyboardJS.bind.key or KeybaordJS.bind.axis instead of this. This function is for removing all binding that use
a certain key.

### KeyboardJS.locale.set

###### Usage

    KeyboardJS.locale.set(localeName);

Changes the locale keyboardJS uses to map key presses. Currently only US is possible unless more locales have been
added via KeyboardJS.locale.add

### KeyboardJS.locale.add

###### Usage

    KeyboardJS.locale.add(localeName, keyMap);

Adds support for new locals to KeyboardJS. The name of the local and a keyMap are expected. See 'keyMap' definition
for more details.

Definitions
-----------

### keyCombo

A comma separated string of keys. Combos can be created using the + sign instead of a comma.

###### examples

* 'a' - binds to the 'a' key. Pressing 'a' will match this keyCombo.
* 'a, b' - binds to the 'a' and 'b' keys. Pressing ether of these keys will match this keyCombo.
* 'a + b' - binds to the 'a' and 'b' keys. Pressing both of these keys will match this keyCombo.
* 'a + b, c + d' - binds to the 'a', 'b', 'c' and 'd' keys. Pressing ether the 'a' key and the 'b' key,
or the 'c' and the 'd' key will match this keyCombo.

### axis

An array containing two numbers. The first value represents x and the second represents y. These values
are 1, 0, or -1.

###### example

    [x, y]

### keyMap

An object that maps key names to their key code. Used for mapping keys on different locales.

###### example

    {
        "keyName": keyCode,
        ...
    }

Language Support
----------------

KeyboardJS can support any locale, however out of the box it just comes with the US locale (for now..,). Adding a new
locale is easy. Map your keyboard to an object and pass it to KeyboardJS.locale.add('myLocale', {/*MAP*/}) then call
KeyboardJS.locale.set('myLocale').

If you create a new locale please consider sending me a pull request or submit it to the
[issue tracker](http://github.com/RobertWHurst/KeyboardJS/issues) so I can add it to the library.

Credits
-------

I made this to enable better access to key controls in my appications. I'd like to share
it with fellow devs. Feel free to fork this project and make your own changes.

[![endorse](http://api.coderwall.com/robertwhurst/endorsecount.png)](http://coderwall.com/robertwhurst)
