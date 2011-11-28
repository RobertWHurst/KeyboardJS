KeyboardJS
==========

Getting Started
---------------
Download the [module](https://github.com/RobertWHurst/KeyboardJS/zipball/master) and
place it somewhere in your project.

* Example Structure

    /
    /modules/
    /modules/keyboard.js
    /modules/require.js
    /app.js
    /index.html

Import the module with an AMD module loader such as RequireJS.

* Example app.js

    require(['modules/keyboard'], function(keyboard) {
        //logic goes here...
    });

* Example index.html

    <doctype html>
    <html>
        <head>
            <title>KeyboardJS Demo</title>
            <script data-main="app.js" src="modules/require.js"></script>
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

Language Support
----------------
KeyboardJS is an amd module for binding to keyboards with the US character set.
Adding other character sets is also possible by editing the key code map variable
named 'keys' in the module.

Credits
-------
I made this to enable better access to key controls in my appications. I'd like to share
it with fellow devs. Feel free to fork this project and make your own changes.
