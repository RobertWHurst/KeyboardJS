/**
 * #### Overview ####
 *
 * `TangibleKeyboard` is a a flexible and easy to use keyboard binding library allowing
 * the user to attach events to key presses, key sequences and key combos. It is a
 * spin-off of the nice `KeyboardJS` library created by
 * <a href="https://github.com/RobertWHurst/KeyboardJS">Robert Hurst</a>.
 *
 * This particular version adds layouts for various keyboard emulators often used in
 * physical computing to gather input from switches. It also adds explicit support for key
 * repeat prevention. This means you can, if you so wish, ignore repeated `keydown` events
 * sent by the OS when a key is being held down. This version also allows you to specify
 * whether browser actions tied to certain key combinations should be triggered or not
 * (preventDefault).
 *
 * #### Usage ####
 *
 * To complete
 *
 * @todo Check why a reset is issued upon fullscreenchange.
 * @todo the issue for long-held keys that trigger a bunch of crap on release
 *
 * @class TangibleKeyboard
 * @static
 * @version @@version
 * @author @@author
 */

/* global define, module */
/*jshint bitwise: false*/

(function(context, factory) {

    'use strict';

	// indexOf polyfill
	[].indexOf||(Array.prototype.indexOf=function(a,b,c){for(c=this.length,b=(c+~~b)%c;b<c&&(!(b in this)||this[b]!==a);b++);return b^c?b:-1;});

    if (typeof define === 'function' && define.amd) {   // AMD/RequireJS
        define(constructAMD);
    } else if(typeof module !== 'undefined') {          //CommonJS
        constructCommonJS();
    } else {                                            // Global
        constructGlobal();
    }

	// Construct AMD version of the library
	function constructAMD() {

		//create a library instance
		return init(context);

		//spawns a library instance
		function init(context) {
			var library;
			library = factory(context, 'amd');
			library.fork = init;
			return library;
		}
	}

	// Construct CommonJS version of the library
	function constructCommonJS() {

		//create a library instance
		module.exports = init(context);

		//spawns a library instance
		function init(context) {
			var library;
			library = factory(context, 'CommonJS');
			library.fork = init;
			return library;
		}

	}

	// Construct a global version of the library
	function constructGlobal() {
		var library;

		//create a library instance
		library = init(context);

		//spawns a library instance
		function init(context) {
			var library, namespaces = [], previousValues = {};

			library = factory(context, 'global');
			library.fork = init;
			library.noConflict = noConflict;
			library.noConflict('TangibleKeyboard', 'k');
			return library;

			//sets library namespaces
			function noConflict(    ) {
				var nI, newNamespaces;

				newNamespaces = Array.prototype.slice.apply(arguments);

				for(nI = 0; nI < namespaces.length; nI += 1) {
					if(typeof previousValues[namespaces[nI]] === 'undefined') {
						delete context[namespaces[nI]];
					} else {
						context[namespaces[nI]] = previousValues[namespaces[nI]];
					}
				}

				previousValues = {};

				for(nI = 0; nI < newNamespaces.length; nI += 1) {
					if(typeof newNamespaces[nI] !== 'string') {
						throw new Error(
                            'Cannot replace namespaces. All new namespaces must be ' +
                            'strings.'
                        );
					}
					previousValues[newNamespaces[nI]] = context[newNamespaces[nI]];
					context[newNamespaces[nI]] = library;
				}

				namespaces = newNamespaces;

				return namespaces;
			}
		}
	}

})(this, function(targetWindow, env) {

    'use strict';

	var TangibleKeyboard = {},
        layouts = {},
        layout,
        map,
        macros,
        activeKeys = [],
        bindings = [],
        activeBindings = [],
	    activeMacros = [],
        aI,
        qwertyLayout;

    targetWindow = targetWindow || window;

	///////////////////////
	// DEFAULT US LAYOUT //
	///////////////////////

    qwertyLayout = {
		"map": {

			//general
			"3": ["cancel"],
			"8": ["backspace"],
			"9": ["tab"],
			"12": ["clear"],
			"13": ["enter"],
			"16": ["shift"],
			"17": ["ctrl"],
			"18": ["alt", "menu"],
			"19": ["pause", "break"],
			"20": ["capslock"],
			"27": ["escape", "esc"],
			"32": ["space", "spacebar"],
			"33": ["pageup"],
			"34": ["pagedown"],
			"35": ["end"],
			"36": ["home"],
			"37": ["left"],
			"38": ["up"],
			"39": ["right"],
			"40": ["down"],
			"41": ["select"],
			"42": ["printscreen"],
			"43": ["execute"],
			"44": ["snapshot"],
			"45": ["insert", "ins"],
			"46": ["delete", "del"],
			"47": ["help"],
			"91": ["command", "windows", "win", "super", "leftcommand", "leftwindows", "leftwin", "leftsuper"],
			"92": ["command", "windows", "win", "super", "rightcommand", "rightwindows", "rightwin", "rightsuper"],
			"145": ["scrolllock", "scroll"],
			"186": ["semicolon", ";"],
			"187": ["equal", "equalsign", "="],
			"188": ["comma", ","],
			"189": ["dash", "-"],
			"190": ["period", "."],
			"191": ["slash", "forwardslash", "/"],
			"192": ["graveaccent", "`"],
			"219": ["openbracket", "["],
			"220": ["backslash", "\\"],
			"221": ["closebracket", "]"],
			"222": ["apostrophe", "'"],

			//0-9
			"48": ["zero", "0"],
			"49": ["one", "1"],
			"50": ["two", "2"],
			"51": ["three", "3"],
			"52": ["four", "4"],
			"53": ["five", "5"],
			"54": ["six", "6"],
			"55": ["seven", "7"],
			"56": ["eight", "8"],
			"57": ["nine", "9"],

			//numpad
			"96": ["numzero", "num0"],
			"97": ["numone", "num1"],
			"98": ["numtwo", "num2"],
			"99": ["numthree", "num3"],
			"100": ["numfour", "num4"],
			"101": ["numfive", "num5"],
			"102": ["numsix", "num6"],
			"103": ["numseven", "num7"],
			"104": ["numeight", "num8"],
			"105": ["numnine", "num9"],
			"106": ["nummultiply", "num*"],
			"107": ["numadd", "num+"],
			"108": ["numenter"],
			"109": ["numsubtract", "num-"],
			"110": ["numdecimal", "num."],
			"111": ["numdivide", "num/"],
			"144": ["numlock", "num"],

			//function keys
			"112": ["f1"],
			"113": ["f2"],
			"114": ["f3"],
			"115": ["f4"],
			"116": ["f5"],
			"117": ["f6"],
			"118": ["f7"],
			"119": ["f8"],
			"120": ["f9"],
			"121": ["f10"],
			"122": ["f11"],
			"123": ["f12"]
		},
		"macros": [

			//secondary key symbols
			['shift + `', ["tilde", "~"]],
			['shift + 1', ["exclamation", "exclamationpoint", "!"]],
			['shift + 2', ["at", "@"]],
			['shift + 3', ["number", "#"]],
			['shift + 4', ["dollar", "dollars", "dollarsign", "$"]],
			['shift + 5', ["percent", "%"]],
			['shift + 6', ["caret", "^"]],
			['shift + 7', ["ampersand", "and", "&"]],
			['shift + 8', ["asterisk", "*"]],
			['shift + 9', ["openparen", "("]],
			['shift + 0', ["closeparen", ")"]],
			['shift + -', ["underscore", "_"]],
			['shift + =', ["plus", "+"]],
			['shift + (', ["opencurlybrace", "opencurlybracket", "{"]],
			['shift + )', ["closecurlybrace", "closecurlybracket", "}"]],
			['shift + \\', ["verticalbar", "|"]],
			['shift + ;', ["colon", ":"]],
			['shift + \'', ["quotationmark", "\""]],
			['shift + !,', ["openanglebracket", "<"]],
			['shift + .', ["closeanglebracket", ">"]],
			['shift + /', ["questionmark", "?"]]
		]
	};

	//a-z and A-Z
	for (aI = 65; aI <= 90; aI += 1) {
        qwertyLayout.map[aI] = String.fromCharCode(aI + 32);
        qwertyLayout.macros.push(
            [
                'shift + ' + String.fromCharCode(aI + 32) + ', capslock + ' + String.fromCharCode(aI + 32),
                [String.fromCharCode(aI)]
            ]
        );
	}

	registerLayout('qwerty', qwertyLayout);
	setLayout('qwerty');


	//////////
	// INIT //
	//////////

    //enable the library
    enable();

	/////////
	// API //
	/////////

    /**
     * Version of this library.
     *
     * @property version
     * @static
     * @type String
     */
    TangibleKeyboard.version = '@@version';

    /**
     * [read-only] An array of the names of all the currently active keys (i.e. keydown
     * state). This array will include all the names of all the keys that are currently
     * pressed as long as they are defined in the currently-active layout.
     *
     * @property activeKeys
     * @readOnly
     * @type {Array}
     */
    TangibleKeyboard.activeKeys = activeKeys;

    /**
     * Enables the library. It should be noted that the library is enabled by default.
     * This method is only useful if the library has been manually disabled through the
     * `disable()` method.
     *
     * Enabling the library basically means attaching the appropriate listeners to the
     * host environment.
     *
     * @method enable
     */
	TangibleKeyboard.enable = enable;

    /**
     * Removes all active user-defined bindings and completely disables the library. The
     * library can be re-enabled afterwards with the `enable()` method.
     *
     * @method disable
     */
    TangibleKeyboard.disable = disable;

    /**
     * Removes a key from the array of currently active keys.
     *
     * @method removeActiveKey
     * @param  {String}	keyName	The name of the key.
     */
    TangibleKeyboard.removeActiveKey = removeActiveKey;

    /**
     * Adds a key to the array of active keys (if it not there already).
     *
     * @method addActiveKey
     * @param {String}	keyName	The name of the key.
     */
    TangibleKeyboard.addActiveKey = addActiveKey;

    /**
     * Binds keys or combinations of keys to user-defined functions. The keys are defined
     * by using a key selector string. This string is simply a list of key names separated
     * by one of the following operators:
     *
     * + <code>&nbsp;</code> (space)
     * + <code>,</code>
     * + <code>+</code>
     * + <code>&gt;</code>
     *
     * Here are some examples of valid selectors:
     *
     * + `'a'           ` : Pressing the 'a' key will trigger the user-defined callbacks.
     * + `'a, b'        ` : Pressing the 'a' key or the 'b' key will trigger the
     * user-defined callbacks.
     * + `'a + b'       ` : Simultaneously pressing both the 'a' and 'b' keys will trigger
     * the user-defined callbacks.
     * + `'a > b'       ` : Pressing the 'a' key, holding it down and then pressing the 'b'
     * key will trigger the user-defined callbacks.
     * + `'a + b, b + c'` : Simultaneously pressing the 'a' and 'b' keys or the 'b' and 'c'
     * keys will trigger the user-defined callbacks.
     *
     * The second and third arguments define the functions to trigger when a keydown or
     * keyup event is detected. The `onDownCallback` is fired once the key or combo
     * becomes active. The `onUpCallback` is fired when the key or combo is no longer
     * active (as soon as a single key is released).
     *
     * When triggered, the user-defined callbacks are passed three arguments:
     *
     * 1. the keydown or keyup `Event` object (as received from the host environment)
     * 2. the array of currently active keys
     * 3. the key selector string
     *
     * @method on
     *
     * @param keySelector {String} The key selector is a string defining the key(s) or key
     *      combination(s) that will trigger the callbacks. See the documentation for the
     *      `TangibleKeyboard.on()` method for full key selector syntax.
     * @param [keyDownCallback] {Function} The function to execute when the key(s) or key
     *      combination(s) are engaged.
     * @param [keyUpCallback] {Function} The function to execute when the key(s) or key
     *      combination(s) are disengaged.
     * @param [options] {Object}
     * @param [options.preventRepeat=false] {Boolean} Whether to prevent repeated events
     *      from firing when the key is being held down.
     * @param [options.preventDefault=false] {Boolean} Whether to prevent default browser
     *      callbacks from being triggered.
     *
     * @return {Object} This object contains a `clear` and an `on` property which are both
     * reference to functions. You can use the `clear()` function to remove the binding
     * when you are done.
     *
     * You can use the `on()` function to add additional callbacks for keyup and keydown
     * events. You simply pass the event name as the first parameter and any number of
     * callbacks that should be fired for that event as the second parameter.
     */
    TangibleKeyboard.on = createBinding;

    /**
     * Clears all bindings attached to a given key selector string. The key name order
     * does not matter as long as the key selectors equate.
     *
     * @method removeBindingByKeySelector
     * @param  {String}	keySelector
     */
    TangibleKeyboard.removeBindingByKeySelector = removeBindingByKeySelector;

    /**
     * Clears all bindings attached to key selectors matching the supplied key name.
     *
     * @method removeBindingByKeyName
     * @param  {String}	keyName
     */
    TangibleKeyboard.removeBindingByKeyName = removeBindingByKeyName;

    /**
     * Assigns a new key layout. The new layout must have been previously registered with
     * the `registerLayout()` function. By default, only the 'qwerty' layout is
     * registered.
     *
     * @method setLayout
     *
     * @param  {String}	layoutName	The new layout to use.
     * @return {Object}
     */
    TangibleKeyboard.setLayout = setLayout;

    /**
     * Returns the currently-assigned layout.
     *
     * @method getLayout
     * @return {String} The layout identifier.
     */
    TangibleKeyboard.getLayout = getLayout;

    /**
     * Registers a new layout. This is useful if you would like to add support for a new
     * keyboard layout. It could also be useful for alternative key names. For example, if
     * you program games you could create a layout for your key mappings. Instead of key
     * 65 mapped to 'a' you could map it to 'jump'.
     *
     * @method registerLayout
     * @param  {String}	layoutName	The name of the new key layout.
     * @param  {Object}	layoutMap	The layout map.
     */
    TangibleKeyboard.registerLayout = registerLayout;

    /**
     * Registers a new key layout and immediately assigns it as the currently-active
     * layout.
     *
     * @method registerAndSetLayout
     * @param  {String}	layoutName	The name of the new key layout.
     * @param  {Object}	layoutMap	The layout map.
     */
    TangibleKeyboard.registerAndSetLayout = function (layoutName, layoutMap) {
        registerLayout(layoutName, layoutMap);
        setLayout(layoutName);
    };

    /**
     * Accepts a key code and returns the key names defined by the current key layout.
     *
     * @method getKeyName
     * @param  {Number}	keyCode
     * @return {Array}	keyNames	An array of key names defined for the key code as
     * defined by the current layout.
     */
    TangibleKeyboard.getKeyName = getKeyName;

    /**
     * Accepts a key name and returns the key code defined by the current key layout.
     *
     * @method getKeyCode
     * @param  {String}	keyName
     * @return {Number|Boolean}
     */
    TangibleKeyboard.getKeyCode = getKeyCode;

    /**
     * Transforms an array of key selectors into a single key selection string. If a
     * single selector is passed in, it will be returned as is.
     *
     * @param  {Array|String} keySelectorArray An array of key selectors. If a key
     * selector string is passed instead, it will simply be returned.
     * @return {String}
     */
    TangibleKeyboard.stringify = stringifyKeyCombo;






    /**
     * Accepts a key selector and an array of key names to inject once the key selector is
     * satisfied. TO COMPLETE!!
     *
     * @method createMacro
     *
     * @param  {String}	combo
     * @param  {Array}	injectedKeys
     */
    TangibleKeyboard.createMacro = createMacro;

    /**
     * Clears all macros bound to the specified key selector. TO COMPLETE!!
     *
     * @method removeMacro
     * @param  {String} combo
     */
    TangibleKeyboard.removeMacro = removeMacro;

    /**
     * Checks to see if a key combo string or key array is satisfied by the currently
     * active keys. It does not take into account spent keys.
     *
     * @param  {String|Array}	keyCombo	A key combo string or array.
     * @return {Boolean}
     */
    TangibleKeyboard.combo = {};
    TangibleKeyboard.combo.active = isSatisfiedCombo;

    /**
     * Parses a key combo string into a 3 dimensional array.
     * - Level 1 - sub combos.
     * - Level 2 - combo stages. A stage is a set of key name pairs that must
     *  be satisfied in the order they are defined.
     * - Level 3 - each key name to the stage.
     * @param  {String|Array}	keyCombo	A key combo string.
     * @return {Array}
     */
    TangibleKeyboard.combo.parse = parseKeyCombo;

	return TangibleKeyboard;


	//////////////////////
	// INSTANCE METHODS //
	//////////////////////

    function enable() {
        if(targetWindow.addEventListener) {
            targetWindow.document.addEventListener('keydown', keydown, false);
            targetWindow.document.addEventListener('keyup', keyup, false);
            targetWindow.addEventListener('blur', reset, false);
            targetWindow.addEventListener('webkitfullscreenchange', reset, false);
            targetWindow.addEventListener('mozfullscreenchange', reset, false);
        } else if(targetWindow.attachEvent) {
            targetWindow.document.attachEvent('onkeydown', keydown);
            targetWindow.document.attachEvent('onkeyup', keyup);
            targetWindow.attachEvent('onblur', reset);
        }
    }

	function disable() {
		reset();
		if(targetWindow.removeEventListener) {
			targetWindow.document.removeEventListener('keydown', keydown, false);
			targetWindow.document.removeEventListener('keyup', keyup, false);
			targetWindow.removeEventListener('blur', reset, false);
			targetWindow.removeEventListener('webkitfullscreenchange', reset, false);
			targetWindow.removeEventListener('mozfullscreenchange', reset, false);
		} else if(targetWindow.detachEvent) {
			targetWindow.document.detachEvent('onkeydown', keydown);
			targetWindow.document.detachEvent('onkeyup', keyup);
			targetWindow.detachEvent('onblur', reset);
		}
	}


	////////////////////
	// EVENT HANDLERS //
	////////////////////

	/**
	 * Exits all active bindings. Optionally passes an event to all binding
	 *  handlers.
	 * @param  {KeyboardEvent}	[event]
	 */
	function reset(event) {
		activeKeys = [];
		pruneMacros();
		pruneBindings(event);
	}

	// Key down event handler.
	function keydown(event) {

        var keyNames,
            keyName,
            kI;

		keyNames = getKeyName(event.keyCode);

		if(keyNames.length < 1) { return; }

		event.isRepeat = false;

		for(kI = 0; kI < keyNames.length; kI += 1) {
		    keyName = keyNames[kI];
		    if (activeKeys.indexOf(keyName) !== -1) {
		        event.isRepeat = true;
            }
			addActiveKey(keyName);
		}
		executeMacros();
		executeBindings(event);
	}

	// Key up event handler.
	function keyup(event) {

		var keyNames, kI;

		keyNames = getKeyName(event.keyCode);
		if(keyNames.length < 1) { return; }
		for(kI = 0; kI < keyNames.length; kI += 1) {
			removeActiveKey(keyNames[kI]);
		}
		pruneMacros();
		pruneBindings(event);
	}

	function getKeyName(keyCode) {
		return map[keyCode] || [];
	}

	function getKeyCode(keyName) {
		var keyCode;
		for(keyCode in map) {
			if(!map.hasOwnProperty(keyCode)) { continue; }
			if(map[keyCode].indexOf(keyName) > -1) { return keyCode; }
		}
		return false;
	}


	////////////
	// MACROS //
	////////////

	function createMacro(combo, injectedKeys) {
		if(typeof combo !== 'string' && (typeof combo !== 'object' || typeof combo.push !== 'function')) {
			throw new Error("Cannot create macro. The combo must be a string or array.");
		}
		if(typeof injectedKeys !== 'object' || typeof injectedKeys.push !== 'function') {
			throw new Error("Cannot create macro. The injectedKeys must be an array.");
		}
		macros.push([combo, injectedKeys]);
	}

	function removeMacro(combo) {
		var macro;
		if(typeof combo !== 'string' && (typeof combo !== 'object' || typeof combo.push !== 'function')) { throw new Error("Cannot remove macro. The combo must be a string or array."); }
		for(var mI = 0; mI < macros.length; mI += 1) {
			macro = macros[mI];
			if(compareCombos(combo, macro[0])) {
				removeActiveKey(macro[1]);
				macros.splice(mI, 1);
				break;
			}
		}
	}

	/**
	 * Executes macros against the active keys. Each macro's key combo is
	 *  checked and if found to be satisfied, the macro's key names are injected
	 *  into active keys.
	 */
	function executeMacros() {
		var mI, combo, kI;
		for(mI = 0; mI < macros.length; mI += 1) {
			combo = parseKeyCombo(macros[mI][0]);
			if(activeMacros.indexOf(macros[mI]) === -1 && isSatisfiedCombo(combo)) {
				activeMacros.push(macros[mI]);
				for(kI = 0; kI < macros[mI][1].length; kI += 1) {
					addActiveKey(macros[mI][1][kI]);
				}
			}
		}
	}

	/**
	 * Prunes active macros. Checks each active macro's key combo and if found
	 *  to no longer to be satisfied, each of the macro's key names are removed
	 *  from active keys.
	 */
	function pruneMacros() {
		var mI, combo, kI;
		for(mI = 0; mI < activeMacros.length; mI += 1) {
			combo = parseKeyCombo(activeMacros[mI][0]);
			if(isSatisfiedCombo(combo) === false) {
				for(kI = 0; kI < activeMacros[mI][1].length; kI += 1) {
					removeActiveKey(activeMacros[mI][1][kI]);
				}
				activeMacros.splice(mI, 1);
				mI -= 1;
			}
		}
	}


	//////////////
	// BINDINGS //
	//////////////

	function createBinding(keyCombo, keyDownCallback, keyUpCallback, options) {
		var api = {}, binding, subBindings = [], kI,
		subCombo;

        if (typeof(keyDownCallback) !== "function" && keyDownCallback !== undefined) {
            throw new Error('Keydown callback must be a function.');
        }
        if (typeof(keyUpCallback) !== "function" && keyUpCallback !== undefined) {
            throw new Error('Keyup callback must be a function.');
        }
        options = options || {};

		//break the combo down into a combo array
		if(typeof keyCombo === 'string') {
			keyCombo = parseKeyCombo(keyCombo);
		}

		//bind each sub combo contained within the combo string
		for(kI = 0; kI < keyCombo.length; kI += 1) {
			binding = {};

			//stringify the combo again
			subCombo = stringifyKeyCombo([keyCombo[kI]]);

			//validate the sub combo
			if(typeof subCombo !== 'string') { throw new Error('Failed to bind key combo. The key combo must be string.'); }

			//create the binding
			binding.keyCombo = subCombo;
			binding.keyDownCallback = [];
			binding.keyUpCallback = [];
            binding.options = {
                preventDefault: options.preventDefault || false,
                preventRepeat: options.preventRepeat || false
            };

			//inject the key down and key up callbacks if given
			if(keyDownCallback) { binding.keyDownCallback.push(keyDownCallback); }
			if(keyUpCallback) { binding.keyUpCallback.push(keyUpCallback); }

			//stash the new binding
			bindings.push(binding);
			subBindings.push(binding);
		}

		//build the binding api
		api.clear = clear;
		api.on = on;
		return api;

		/**
		 * Clears the binding
		 */
		function clear() {
			var bI;
			for(bI = 0; bI < subBindings.length; bI += 1) {
				bindings.splice(bindings.indexOf(subBindings[bI]), 1);
			}
		}

		/**
		 * Accepts an event name. and any number of callbacks. When the event is
		 *  emitted, all callbacks are executed. Available events are key up and
		 *  key down.
		 * @param  {String}	eventName
		 * @return {Object}	subBinding
		 */
		function on(eventName    ) {
			var api = {}, callbacks, cI, bI;

			//validate event name
			if(typeof eventName !== 'string') { throw new Error('Cannot bind callback. The event name must be a string.'); }
			if(eventName !== 'keyup' && eventName !== 'keydown') { throw new Error('Cannot bind callback. The event name must be a "keyup" or "keydown".'); }

			//gather the callbacks
			callbacks = Array.prototype.slice.apply(arguments, [1]);

			//stash each the new binding
			for(cI = 0; cI < callbacks.length; cI += 1) {
				if(typeof callbacks[cI] === 'function') {
					if(eventName === 'keyup') {
						for(bI = 0; bI < subBindings.length; bI += 1) {
							subBindings[bI].keyUpCallback.push(callbacks[cI]);
						}
					} else if(eventName === 'keydown') {
						for(bI = 0; bI < subBindings.length; bI += 1) {
							subBindings[bI].keyDownCallback.push(callbacks[cI]);
						}
					}
				}
			}

			//construct and return the sub binding api
			api.clear = function () {
                var cI, bI;
                for(cI = 0; cI < callbacks.length; cI += 1) {
                    if(typeof callbacks[cI] === 'function') {
                        if(eventName === 'keyup') {
                            for(bI = 0; bI < subBindings.length; bI += 1) {
                                subBindings[bI].keyUpCallback.splice(subBindings[bI].keyUpCallback.indexOf(callbacks[cI]), 1);
                            }
                        } else {
                            for(bI = 0; bI < subBindings.length; bI += 1) {
                                subBindings[bI].keyDownCallback.splice(subBindings[bI].keyDownCallback.indexOf(callbacks[cI]), 1);
                            }
                        }
                    }
                }
            };
			return api;

		}
	}

	function removeBindingByKeySelector(keyCombo) {
		var bI, binding;
		for(bI = 0; bI < bindings.length; bI += 1) {
			binding = bindings[bI];
			if(compareCombos(keyCombo, binding.keyCombo)) {
				bindings.splice(bI, 1); bI -= 1;
			}
		}
	}

	function removeBindingByKeyName(keyName) {
		var bI, kI, binding;
		if(keyName) {
			for(bI = 0; bI < bindings.length; bI += 1) {
				binding = bindings[bI];
				for(kI = 0; kI < binding.keyCombo.length; kI += 1) {
					if(binding.keyCombo[kI].indexOf(keyName) > -1) {
						bindings.splice(bI, 1); bI -= 1;
						break;
					}
				}
			}
		} else {
			bindings = [];
		}
	}

	/**
	 * Executes bindings that are active. Only allows the keys to be used once
	 *  as to prevent binding overlap.
	 * @param  {KeyboardEvent}	event	The keyboard event.
	 */
	function executeBindings(event) {
		var bI,
            sBI,
            binding,
            bindingKeys,
            remainingKeys,
            cI,
            killEventBubble,
            kI,
            bindingKeysSatisfied,
            index,
            sortedBindings = [],
            bindingWeight;

		remainingKeys = [].concat(activeKeys);
		for(bI = 0; bI < bindings.length; bI += 1) {
			bindingWeight = extractComboKeys(bindings[bI].keyCombo).length;
			if(!sortedBindings[bindingWeight]) { sortedBindings[bindingWeight] = []; }
			sortedBindings[bindingWeight].push(bindings[bI]);
		}
		for(sBI = sortedBindings.length - 1; sBI >= 0; sBI -= 1) {
			if(!sortedBindings[sBI]) { continue; }
			for(bI = 0; bI < sortedBindings[sBI].length; bI += 1) {
				binding = sortedBindings[sBI][bI];
				bindingKeys = extractComboKeys(binding.keyCombo);
				bindingKeysSatisfied = true;
				for(kI = 0; kI < bindingKeys.length; kI += 1) {
					if(remainingKeys.indexOf(bindingKeys[kI]) === -1) {
						bindingKeysSatisfied = false;
						break;
					}
				}
				if(bindingKeysSatisfied && isSatisfiedCombo(binding.keyCombo)) {

                    //if (binding.options.preventRepeat !== true) {
                    //if (activeBindings.indexOf(binding) < 0) {
                        activeBindings.push(binding);
                    //}
                    //}

                    for(kI = 0; kI < bindingKeys.length; kI += 1) {
						index = remainingKeys.indexOf(bindingKeys[kI]);
						if(index > -1) {
							remainingKeys.splice(index, 1);
							kI -= 1;
						}
					}
					for(cI = 0; cI < binding.keyDownCallback.length; cI += 1) {

                        if (
                            binding.options.preventRepeat === true &&
                            event.isRepeat === true
                        ) {
                            continue;
                        }


						if (binding.keyDownCallback[cI](event, activeKeys, binding.keyCombo) === false) {
							killEventBubble = true;
						}
					}
                    if (
                        killEventBubble === true ||
                        binding.options.preventDefault === true
                    ) {
						event.preventDefault();
						event.stopPropagation();
					}
				}
			}
		}
	}

	/**
	 * Removes bindings that are no longer satisfied by the active keys. Also
	 *  fires the key up callbacks.
	 * @param  {KeyboardEvent}	event
	 */
	function pruneBindings(event) {

		var bI,
            cI,
            binding,
            killEventBubble;

        //console.log("COUCOUC!!!!!");
        //console.log(activeBindings.length);
        //console.log(activeBindings);

		for (bI = 0; bI < activeBindings.length; bI += 1) {

			binding = activeBindings[bI];

			if(isSatisfiedCombo(binding.keyCombo) === false) {

				for(cI = 0; cI < binding.keyUpCallback.length; cI += 1) {
					if (
                        binding.keyUpCallback[cI](
                            event,
                            activeKeys,
                            binding.keyCombo
                        ) === false) {
						killEventBubble = true;
					}
				}

				if(
                    killEventBubble === true ||
                    binding.options.preventDefault === true
                ) {
					event.preventDefault();
					event.stopPropagation();
				}

				activeBindings.splice(bI, 1);
				bI -= 1;

			}

		}
	}


	///////////////////
	// COMBO STRINGS //
	///////////////////

	/**
	 * Compares two key combos returning true when they are functionally
	 *  equivalent.
	 * @param  {String|Array}	keyComboArrayA keyCombo A key combo string or array.
	 * @param  {String|Array}	keyComboArrayB keyCombo A key combo string or array.
	 * @return {Boolean}
	 */
	function compareCombos(keyComboArrayA, keyComboArrayB) {
		var cI, sI, kI;
		keyComboArrayA = parseKeyCombo(keyComboArrayA);
		keyComboArrayB = parseKeyCombo(keyComboArrayB);
		if(keyComboArrayA.length !== keyComboArrayB.length) { return false; }
		for(cI = 0; cI < keyComboArrayA.length; cI += 1) {
			if(keyComboArrayA[cI].length !== keyComboArrayB[cI].length) {
                return false;
            }
			for(sI = 0; sI < keyComboArrayA[cI].length; sI += 1) {
				if(keyComboArrayA[cI][sI].length !== keyComboArrayB[cI][sI].length) {
                    return false;
                }
				for(kI = 0; kI < keyComboArrayA[cI][sI].length; kI += 1) {
					if(keyComboArrayB[cI][sI].indexOf(keyComboArrayA[cI][sI][kI]) === -1) {
                        return false;
                    }
				}
			}
		}
		return true;
	}

	function isSatisfiedCombo(keyCombo) {
		var cI, sI, stage, kI, stageOffset = 0, index, comboMatches;
		keyCombo = parseKeyCombo(keyCombo);
		for(cI = 0; cI < keyCombo.length; cI += 1) {
			comboMatches = true;
			stageOffset = 0;
			for(sI = 0; sI < keyCombo[cI].length; sI += 1) {
				stage = [].concat(keyCombo[cI][sI]);
				for(kI = stageOffset; kI < activeKeys.length; kI += 1) {
					index = stage.indexOf(activeKeys[kI]);
					if(index > -1) {
						stage.splice(index, 1);
						stageOffset = kI;
					}
				}
				if(stage.length !== 0) { comboMatches = false; break; }
			}
			if(comboMatches) { return true; }
		}
		return false;
	}

	/**
	 * Accepts a key combo array or string and returns a flat array containing all keys referenced by
	 * the key combo.
	 * @param  {String|Array}	keyCombo	A key combo string or array.
	 * @return {Array}
	 */
	function extractComboKeys(keyCombo) {
		var cI, sI, keys = [];
		keyCombo = parseKeyCombo(keyCombo);
		for(cI = 0; cI < keyCombo.length; cI += 1) {
			for(sI = 0; sI < keyCombo[cI].length; sI += 1) {
				keys = keys.concat(keyCombo[cI][sI]);
			}
		}
		return keys;
	}


	function parseKeyCombo(keyCombo) {

		var s = keyCombo,
            i = 0,
            op = 0,
            ws = false,
            nc = false,
            combos = [],
            combo = [],
            stage = [],
            key = '';

		if(typeof keyCombo === 'object' && typeof keyCombo.push === 'function') {
            return keyCombo;
        }

		if(typeof keyCombo !== 'string') {
            throw new Error(
                'Cannot parse "keyCombo" because its type is "' + (typeof keyCombo) +
                '". It must be a "string".'
            );
        }

		//remove leading whitespace
		while(s.charAt(i) === ' ') { i += 1; }

		while(true) {
			if(s.charAt(i) === ' ') {
				//white space & next combo op
				while(s.charAt(i) === ' ') { i += 1; }
				ws = true;
			} else if(s.charAt(i) === ',') {
				if(op || nc) { throw new Error('Failed to parse key combo. Unexpected , at character index ' + i + '.'); }
				nc = true;
				i += 1;
			} else if(s.charAt(i) === '+') {
				//next key
				if(key.length) { stage.push(key); key = ''; }
				if(op || nc) { throw new Error('Failed to parse key combo. Unexpected + at character index ' + i + '.'); }
				op = true;
				i += 1;
			} else if(s.charAt(i) === '>') {
				//next stage op
				if(key.length) { stage.push(key); key = ''; }
				if(stage.length) { combo.push(stage); stage = []; }
				if(op || nc) { throw new Error('Failed to parse key combo. Unexpected > at character index ' + i + '.'); }
				op = true;
				i += 1;
			} else if(i < s.length - 1 && s.charAt(i) === '!' && (s.charAt(i + 1) === '>' || s.charAt(i + 1) === ',' || s.charAt(i + 1) === '+')) {
				key += s.charAt(i + 1);
				op = false;
				ws = false;
				nc = false;
				i += 2;
			} else if(i < s.length && s.charAt(i) !== '+' && s.charAt(i) !== '>' && s.charAt(i) !== ',' && s.charAt(i) !== ' ') {
				//end combo
				if(op === false && ws === true || nc === true) {
					if(key.length) { stage.push(key); key = ''; }
					if(stage.length) { combo.push(stage); stage = []; }
					if(combo.length) { combos.push(combo); combo = []; }
				}
				op = false;
				ws = false;
				nc = false;
				//key
				while(i < s.length && s.charAt(i) !== '+' && s.charAt(i) !== '>' && s.charAt(i) !== ',' && s.charAt(i) !== ' ') {
					key += s.charAt(i);
					i += 1;
				}
			} else {
				//unknown char
				i += 1;
				continue;
			}
			//end of combos string
			if(i >= s.length) {
				if(key.length) { stage.push(key); key = ''; }
				if(stage.length) { combo.push(stage); stage = []; }
				if(combo.length) { combos.push(combo); combo = []; }
				break;
			}
		}
		return combos;
	}

	function stringifyKeyCombo(keyComboArray) {

		var cI, ccI, output = [];

		if(typeof keyComboArray === 'string') { return keyComboArray; }

		if(
            typeof keyComboArray !== 'object' ||
            typeof keyComboArray.push !== 'function') {
            throw new Error('Cannot stringify key combo.');
        }

		for(cI = 0; cI < keyComboArray.length; cI += 1) {
			output[cI] = [];
			for(ccI = 0; ccI < keyComboArray[cI].length; ccI += 1) {
				output[cI][ccI] = keyComboArray[cI][ccI].join(' + ');
			}
			output[cI] = output[cI].join(' > ');
		}
		return output.join(' ');

	}


	/////////////////
	// ACTIVE KEYS //
	/////////////////
    //
	//function getActiveKeys() {
	//	return [].concat(activeKeys);
	//}

	function addActiveKey(keyName) {

		if(keyName.match(/\s/)) {
            throw new Error(
                'Cannot add key name "' + keyName + '" to active keys because it ' +
                'contains whitespace.'
            );
        }

		if(activeKeys.indexOf(keyName) > -1) { return; }
		activeKeys.push(keyName);
	}

	function removeActiveKey(keyName) {

		var keyCode = getKeyCode(keyName);

		if(keyCode === '91' || keyCode === '92') {
            activeKeys = []; //remove all key on release of super.
        } else {
            activeKeys.splice(activeKeys.indexOf(keyName), 1);
        }

	}

	/////////////
	// LAYOUTS //
	/////////////

	function registerLayout(layoutName, layoutMap) {

		// Validate arguments
		if(typeof layoutName !== 'string') {
            throw new Error(
                'Cannot register new layout. The layout name must be a string.'
            );
        }

		if(typeof layoutMap !== 'object') {
            throw new Error(
                'Cannot register "' + layoutName + '" layout. The layout map must be ' +
                'an object.'
            );
        }

		if(typeof layoutMap.map !== 'object') {
            throw new Error(
                'Cannot register "' + layoutName + '" layout. The layout map is invalid.'
            );
        }

		// Stash the layout
		if(!layoutMap.macros) { layoutMap.macros = []; }
        layouts[layoutName] = layoutMap;
	}


	function setLayout(layoutName) {

        if (typeof layoutName !== 'string') {
            throw new Error('Cannot set layout. The layout name must be a string.');
        }

        if (!layouts[layoutName]) {
            throw new Error(
                'Cannot set layout to "' + layoutName + '" because no such layout ' +
                'has been registered.');
        }

        // Set the requested map and macros
        map = layouts[layoutName].map;
        macros = layouts[layoutName].macros;

        // Set the current layout
        layout = layoutName;

	}

    function getLayout() {
        return layout;
    }

});
