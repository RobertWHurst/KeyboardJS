/* global define, module, TangibleKeyboard */

/**
 * #### Overview ####
 *
 * The IpacVE is a 32-input keyboard emulator manufactured by
 * <a href="http://www.ultimarc.com/">Ultimarc</a>. It is mostly used in arcade game
 * emulators but is also a popular way to connect switches in physical computing projects.
 * This layout will enable you to specify bindings using the labels printed on the board
 * (`1RGHT`, `2B`, `1SW6`, etc.). This will save you from having to research which
 * keycodes are triggered by which inputs.
 *
 * #### Usage ####
 *
 * Using it is quite simple. Simply link to the file and call the `setLayout()` method
 * with the `ipacve` identifier:
 *
 *      <script src="tangiblekeyboard.js"></script>
 *      <script src="layouts/tangiblekeyboard.layout.ipacve.js"></script>
 *
 *      <script>
 *          TangibleKeyboard.setLayout('ipacve');
 *
 *          TangibleKeyboard.on(
 *              '1RGHT',
 *              {
 *                  onKeyDown: function(e, keys, combo) { console.log(e); }
 *              }
 *          );
 *      </script>
 *
 * That's it.
 *
 * If you are using AMD or CommonJS, there's an extra step. You will need to
 * explicitely register and assign the layout. Here's an example with AMD:
 *
 *      define(function (require) {
 *
 *          var tk = require('tangiblekeyboard');
 *          var layout = require('layouts/tangiblekeyboard.layout.ipacve');
 *          tk.registerAndSetLayout("ipacve", layout);
 *
 *          tk.on(
 *              '1RGHT',
 *              {
 *                  onKeyDown: function(e, keys, combo) { console.log(e); }
 *              }
 *          );
 *
 *      });
 *
 * #### Warning ####
 *
 * The IpacVE uses the <a href="http://en.wikipedia.org/wiki/MAME">MAME</a> key mappings
 * by default. This means that the `1STRT` input actually behaves like a shift key and
 * modifies the key assignment of other inputs when activated. It also means that this
 * input will trigger both down and up callbacks at once when released. If you are not
 * building a MAME-type arcade simulator, I would urge you not to use this input.
 *
 * @module layouts
 * @class TangibleKeyboard.layouts.IpacVE
 */

(function(scope) {

    'use strict';

    var layout = {


        /**
         * An enumeration object containing keycode-to-identifier mappings. For example,
         * `map["9"]` contains the array `["2A"]`. This means that listening to the "2A"
         * key selector will actually listen for events triggered from pressing a key with
         * a keycode of 9.
         *
         *  * 9: 2A -> tab
         *  * 13: 1B -> enter
         *  * 16: 1SW4 -> left shift
         *  * 17: 1SW1 -> left control
         *  * 18: 1SW2 -> left alt
         *  * 27: 2B -> escape
         *  * 32: 1SW3 -> space
         *  * 37: 1LEFT -> left arrow
         *  * 38: 1UP -> up arrow
         *  * 39: 1RGHT -> right arrow
         *  * 40: 1DOWN -> down arrow
         *  * 49: 1STRT -> 1
         *  * 50: 2STRT -> 2
         *  * 53: 1COIN -> 5
         *  * 54: 2COIN -> 6
         *  * 65: 2SW1 -> a
         *  * 67: 1SW7 -> c
         *  * 68: 2LEFT -> d
         *  * 70: 2DOWN -> f
         *  * 71: 2RGHT -> g
         *  * 73: 2SW5 -> i
         *  * 74: 2SW7 -> j
         *  * 75: 2SW6 -> k
         *  * 76: 2SW8 -> l
         *  * 80: 1A -> p
         *  * 81: 2SW3 -> q
         *  * 82: 2UP -> r
         *  * 83: 2SW2 -> s
         *  * 86: 1SW8 -> v
         *  * 87: 2SW4 -> w
         *  * 88: 1SW6 -> x
         *  * 90: 1SW5 -> z
         *  * 192: ` -> grave accent
         *
         * @property map
         * @type Object
         *
         */

        "map": {
             "9": ["2A"],       // tab
            "13": ["1B"],       // enter
            "16": ["1SW4"],     // left shift
            "17": ["1SW1"],     // left control
            "18": ["1SW2"],     // left alt
            "27": ["2B"],       // escape
            "32": ["1SW3"],     // space
            "37": ["1LEFT"],    // left arrow
            "38": ["1UP"],      // up arrow
            "39": ["1RGHT"],    // right arrow
            "40": ["1DOWN"],    // down arrow
            "49": ["1STRT"],    // 1
            "50": ["2STRT"],    // 2
            "53": ["1COIN"],    // 5
            "54": ["2COIN"],    // 6

            "65": ["2SW1"],	    // a
            "67": ["1SW7"],	    // c
            "68": ["2LEFT"],    // d
            "70": ["2DOWN"],    // f
            "71": ["2RGHT"],    // g
            "73": ["2SW5"],	    // i
            "74": ["2SW7"],	    // j
            "75": ["2SW6"],	    // k
            "76": ["2SW8"],	    // l
            "80": ["1A"],	    // p
            "81": ["2SW3"],	    // q
            "82": ["2UP"],	    // r
            "83": ["2SW2"],	    // s
            "86": ["1SW8"],	    // v
            "87": ["2SW4"],	    // w
            "88": ["1SW6"],	    // x
            "90": ["1SW5"],	    // z

            "192": ["`"]
        },

        /**
         * An array of all macros defined by this layout. Please note that the IpacVE
         * only sends the resulting key and not all keys in the macro sequence. This is
         * different from how most regular keyboards work.
         *
         *  * 1STRT + 2STRT : 2B
         *  * 1STRT + 1RGHT : 2A
         *  * 1STRT + 1LEFT : 1B
         *  * 1STRT + 1UP : ` or grave
         *  * 1STRT + 1DOWN : 1A
         *  * 1STRT + 1SW1 : 1COIN
         *
         * @property macros
         * @type Array
         */
        "macros": [
            // Those are hardcore macros. The IpacVE will only send the resulting key (not
            // 1STRT then 2STRT1, for example).
            ['1STRT + 2STRT', ["2B"]],
            ['1STRT + 1RGHT', ["2A"]],
            ['1STRT + 1LEFT', ["1B"]],
            ['1STRT + 1UP',   ["`", "grave"]],
            ['1STRT + 1DOWN', ["1A"]],
            ['1STRT + 1SW1',  ["1COIN"]]
        ]
    };

    // AMD/RequireJS
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return layout;
        });
    }

    // CommonJS
    else if (typeof module !== 'undefined') {
        module.exports = layout;
    }

    // Global
    else if (scope.TangibleKeyboard) {
        scope.TangibleKeyboard.registerLayout('ipacve', layout);
    }

}(window));
