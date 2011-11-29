KeyboardJS (NonAMD)
==================

Getting Started
---------------
Download the [script](https://github.com/RobertWHurst/KeyboardJS/zipball/NonAMD) and
place it somewhere in your project. All methods are accessed via the KeyboardJS namespace.

Your also need [jQuery](http://code.jquery.com/jquery-1.7.js).

##### Example Structure

    /
    /jQuery.js
    /keyboard.js
    /app.js
    /index.html

load the script with a script tag.

##### Example index.html

    <doctype html>
    <html>
        <head>
            <title>KeyboardJS Demo</title>
            <script src="jQuery.js"></script>
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

Methods
-------

### KeyboardJS.bind.key

###### Usage

    KeyboardJS.bind.key(keyCombo, onDownCallback, onUpCallback, element);

Binds any key or key combo. See 'keyCombo' definition below
for details. The onDownCallback is fired once the key or key combo becomes active. The
onUpCallback is fired when the combo no longer active (a single key is released).
If an element is provided the combo will become active if the element passed is
in focus.

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

Language Support
----------------
KeyboardJS is an amd module for binding to keyboards with the US character set.
Adding other character sets is also possible by editing the key code map variable
named 'keys' in the module.

Credits
-------
I made this to enable better access to key controls in my appications. I'd like to share
it with fellow devs. Feel free to fork this project and make your own changes.
