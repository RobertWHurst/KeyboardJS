/* global define, module, TangibleKeyboard */

/**
 * #### Overview ####
 *
 * The I-PAC 4 is a 56-input keyboard emulator manufactured by
 * <a href="http://www.ultimarc.com/">Ultimarc</a>. It is mostly used in arcade game
 * simulators but is also a popular way to connect switches in physical computing
 * projects. This layout will enable you to specify bindings using the labels printed on
 * the I-PAC 4 board (`1RGHT`, `2B`, `1SW6`, etc.). This will save you from having to
 * look up which keycodes are triggered by which inputs.
 *
 * #### Usage ####
 *
 * Using it is quite simple. Simply link to the file and call the `setLayout()` method
 * with the `ipac4` identifier:
 *
 *      <script src="tangiblekeyboard.js"></script>
 *      <script src="layouts/tangiblekeyboard.layout.ipac4.js"></script>
 *
 *      <script>
 *          TangibleKeyboard.setLayout('ipac4');
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
 *          var layout = require('layouts/tangiblekeyboard.layout.ipac4');
 *          tk.registerAndSetLayout("ipac4", layout);
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
 * The I-PAC 4 uses the <a href="http://en.wikipedia.org/wiki/MAME">MAME</a> key mappings
 * by default. This means that the `1STRT` input actually behaves like a shift key and
 * modifies the key assignment of other inputs when activated. It also means that this
 * input will trigger both down and up callbacks at once when released. If you are not
 * building a MAME-type arcade simulator, I would urge you not to use this input.
 *
 * Also note that some inputs are not mapped in the default MAME configuration. For that
 * reason, the following inputs are not assigned in this layout:
 *
 * * `3SW5`
 * * `3SW6`
 * * `3SW7`
 * * `3SW8`
 * * `4SW5`
 * * `4SW6`
 * * `4SW7`
 * * `4SW8`
 *
 * Finally, please note that a few default MAME mappings overlap. This means that the
 * following pairs share the same keycode. They are, effectively, interchangeable and
 * synonymous:
 *
 * * `1B` and `3SW3`
 * * `2SW7` and 3LEFT`
 * * `2SW6` and 3DOWN`
 * * `2SW8` and 3RGHT`
 * * `1SW8` and 4LEFT`
 * * "1SW4", "3SW2"
 *
 * @module layouts
 * @class TangibleKeyboard.layouts.ipac4
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
            "9": ["2A"],                // tab
            "13": ["1B", "3SW3"],       // enter
            "16": ["1SW4", "3SW2"],     // left shift, right shift
            "17": ["1SW1", "3SW1"],     // left control, right control
            "18": ["1SW2"],             // left alt
            "27": ["2B"],               // escape
            "32": ["1SW3"],             // space
            "37": ["1LEFT"],            // left arrow
            "38": ["1UP"],              // up arrow
            "39": ["1RGHT"],            // right arrow
            "40": ["1DOWN"],            // down arrow
            "49": ["1STRT"],            // 1
            "50": ["2STRT"],            // 2
            "53": ["1COIN"],            // 5
            "54": ["2COIN"],            // 6

            "65": ["2SW1"],	            // a
            "67": ["1SW7"],	            // c
            "68": ["2LEFT"],            // d
            "70": ["2DOWN"],            // f
            "71": ["2RGHT"],            // g
            "73": ["2SW5"],	            // i
            "74": ["2SW7", "3LEFT"],	// j
            "75": ["2SW6", "3DOWN"],	// k
            "76": ["2SW8", "3RGHT"],	// l
            "80": ["1A"],	            // p
            "81": ["2SW3"],	            // q
            "82": ["2UP"],	            // r
            "83": ["2SW2"],	            // s
            "86": ["1SW8", "4LEFT"],	// v
            "87": ["2SW4"],	            // w
            "88": ["1SW6"],	            // x
            "90": ["1SW5"],	            // z

            "55": ["3COIN"],	        // 7
            "56": ["4COIN"],	        // 8

            "51": ["3STRT"],	        // 3
            "52": ["4STRT"],	        // 4

            "79": ["3SW4"],	            // o
            "85": ["4RGHT"],	        // u
            "89": ["4UP"],	            // y
            "78": ["4DOWN"],	        // n

            "66": ["4SW1"],	            // b
            "69": ["4SW2"],	            // e
            "72": ["4SW3"],	            // h
            "77": ["4SW4"],	            // m

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