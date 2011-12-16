/*!
 * KeyboardJS
 * 
 * Copyright 2011, Robert William Hurst
 * Licenced under the BSD License.
 * See license.txt
 */
(function(context) {
	var keys = {
			"backspace": 8,
			"tab": 9,
			"enter": 13,
			"shift": 16,
			"ctrl": 17,
			"alt": 18,
			"pause": 19, "break": 19,
			"capslock": 20,
			"escape": 27, "esc": 27,
			"space": 32, "spacebar": 32,
			"pageup": 33,
			"pagedown": 34,
			"end": 35,
			"home": 36,
			"left": 37,
			"up": 38,
			"right": 39,
			"down": 40,
			"insert": 45,
			"delete": 46,
			"0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55, "8": 56, "9": 57,
			"a": 65, "b": 66, "c": 67, "d": 68, "e": 69, "f": 70, "g": 71, "h": 72, "i": 73, "j": 74, "k": 75, "l": 76, "m": 77, "n": 78, "o": 79, "p": 80, "q": 81, "r": 82, "s": 83, "t": 84, "u": 85, "v": 86, "w": 87, "x": 88, "y": 89, "z": 90,
			"meta": 91, "command": 91, "windows": 91, "win": 91,
			"_91": 92,
			"select": 93,
			"num0": 96, "num1": 97, "num2": 98, "num3": 99, "num4": 100, "num5": 101, "num6": 102, "num7": 103, "num8": 104, "num9": 105,
			"multiply": 106,
			"add": 107,
			"subtract": 109,
			"decimal": 110,
			"divide": 111,
			"f1": 112, "f2": 113, "f3": 114, "f4": 115, "f5": 116, "f6": 117, "f7": 118, "f8": 119, "f9": 120, "f10": 121, "f11": 122, "f12": 123,
			"numlock": 144, "num": 144,
			"scrolllock": 145, "scroll": 145,
			"semicolon": 186,
			"equal": 187, "equalsign": 187,
			"comma": 188,
			"dash": 189,
			"period": 190,
			"slash": 191, "forwardslash": 191,
			"graveaccent": 192,
			"openbracket": 219,
			"backslash": 220,
			"closebracket": 221,
			"singlequote": 222
		},
		activeKeys = [],
		activeBindings = {},
		keyBindingGroups = [];
		
	// IE prior to IE9 doesn't support addEventListener
	var addEvent = function(target, type, handler) {
		if (target.addEventListener)
			target.addEventListener(type, handler, false);

		else
			target.attachEvent("on" + type, 
								function(event) {
									return handler.call(target, event);
								});
	};
	
	// oldIE (again, < IE9) can't handle .indexOf() on arrays, but Mozilla proposes the following
	// solution: (https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf#Compatibility)
	if (!Array.prototype.indexOf) {
	    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
	        "use strict";
	        if (this == null) {
	            throw new TypeError();
	        }
	        var t = Object(this);
	        var len = t.length >>> 0;
	        if (len === 0) {
	            return -1;
	        }
	        var n = 0;
	        if (arguments.length > 0) {
	            n = Number(arguments[1]);
	            if (n != n) { // shortcut for verifying if it's NaN
	                n = 0;
	            } else if (n != 0 && n != Infinity && n != -Infinity) {
	                n = (n > 0 || -1) * Math.floor(Math.abs(n));
	            }
	        }
	        if (n >= len) {
	            return -1;
	        }
	        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
	        for (; k < len; k++) {
	            if (k in t && t[k] === searchElement) {
	                return k;
	            }
	        }
	        return -1;
	    }
	}

	//adds keys to the active keys array
	addEvent(document, "keydown", function(event) {

		//lookup the key pressed and save it to the active keys array
		for (var key in keys) {
			if(keys.hasOwnProperty(key) && event.keyCode === keys[key]) {
				if(activeKeys.indexOf(key) < 0) {
					activeKeys.push(key);
				}
			}
		}

		//execute the first callback the longest key binding that matches the active keys
		return executeActiveKeyBindings(event);

	});

	//removes keys from the active array
	addEvent(document, "keyup", function (event) {

		//lookup the key released and prune it from the active keys array
		for(var key in keys) {
			if(keys.hasOwnProperty(key) && event.keyCode === keys[key]) {

				var iAK = activeKeys.indexOf(key);

				if(iAK > -1) {
					activeKeys.splice(iAK, 1);
				}
			}
		}

		//execute the end callback on the active key binding
		return pruneActiveKeyBindings(event);

	});

	/**
	 * queryActiveBindings - Generates an array of active key bindings
	 */
	function queryActiveBindings() {
		var bindingStack = [];

		//loop through the key binding groups by number of keys.
		for(var keyCount = keyBindingGroups.length; keyCount > -1; keyCount -= 1) {
			if(keyBindingGroups[keyCount]) {
				var KeyBindingGroup = keyBindingGroups[keyCount];

				//loop through the key bindings of the same key length.
				for(var bindingIndex = 0; bindingIndex < KeyBindingGroup.length; bindingIndex += 1) {
					var binding = KeyBindingGroup[bindingIndex],

					//assume the binding is active till a required key is found to be unsatisfied
						keyBindingActive = true;

					//loop through each key required by the binding.
					for(var keyIndex = 0; keyIndex < binding.keys.length;  keyIndex += 1) {
						var key = binding.keys[keyIndex];

						//if the current key is not in the active keys array the mark the binding as inactive
						if(activeKeys.indexOf(key) < 0) {
							keyBindingActive = false;
						}
					}

					//if the key combo is still active then push it into the binding stack
					if(keyBindingActive) {
						bindingStack.push(binding);
					}
				}
			}
		}

		return bindingStack;
	}

	function executeActiveKeyBindings(event) {

		if(activeKeys < 1) {
			return true;
		}

		var bindingStack = queryActiveBindings(),
			spentKeys = [],
			output;

		//loop through each active binding
		for (var bindingIndex = 0; bindingIndex < bindingStack.length; bindingIndex += 1) {
			var binding = bindingStack[bindingIndex],
				usesSpentKey = false;

			//check each of the required keys. Make sure they have not been used by another binding
			for(var keyIndex = 0; keyIndex < binding.keys.length; keyIndex += 1) {
				var key = binding.keys[keyIndex];
				if(spentKeys.indexOf(key) > -1) {
					usesSpentKey = true;
					break;
				}
			}

			//if the binding does not use a key that has been spent then execute it
			if(!usesSpentKey) {

				//fire the callback
				if(typeof binding.callback === "function") {
					if(!binding.callback(event, binding.keys, binding.keyCombo)) {
						output = false
					}
				}

				//add the binding's combo to the active bindings array
				if(!activeBindings[binding.keyCombo]) {
					activeBindings[binding.keyCombo] = binding;
				}

				//add the current key binding's keys to the spent keys array
				for(var keyIndex = 0; keyIndex < binding.keys.length; keyIndex += 1) {
					var key = binding.keys[keyIndex];
					if(spentKeys.indexOf(key) < 0) {
						spentKeys.push(key);
					}
				}
			}
		}

		//if there are spent keys then we know a binding was fired
		// and that we need to tell jQuery to prevent event bubbling.
		if(spentKeys.length) {
			return false;
		}

		return output;
	}

	/**
	 * pruneActiveKeyBindings - Fires the end callback for key bindings
	 */
	function pruneActiveKeyBindings(event) {
		var bindingStack = queryActiveBindings();
		var output;

		//loop through the active combos
		for(var bindingCombo in activeBindings) {
			if(activeBindings.hasOwnProperty(bindingCombo)) {
				var binding = activeBindings[bindingCombo],
					active = false;

				//loop thorugh the active bindings
				for(var bindingIndex = 0; bindingIndex < bindingStack.length; bindingIndex += 1) {
					var activeCombo = bindingStack[bindingIndex].keyCombo;

					//check to see if the combo is still active
					if(activeCombo === bindingCombo) {
						active = true;
						break;
					}
				}

				//if the combo is no longer active then fire its end callback and remove it
				if(!active) {

					if(typeof binding.endCallback === "function") {
						if(!binding.endCallback(event, binding.keys, binding.keyCombo)) {
							output = false
						}
					}

					delete activeBindings[bindingCombo];
				}
			}
		}

		return output;
	}


	function bindKey(keyCombo, callback, endCallback) {

		function clear() {
			if(keys && keys.length) {
				var keyBindingGroup = keyBindingGroups[keys.length];

				if(keyBindingGroup.indexOf(keyBinding) > -1) {
					var index = keyBindingGroups[keys.length].indexOf(keyBinding);
					delete keyBindingGroups[keys.length][index];
				}
			}
		}

		//create an array of combos from the first argument
		var bindSets = keyCombo.toLowerCase().replace(/\s/g, '').split(',');

		//create a binding for each key combo
		for(var i = 0; i < bindSets.length; i += 1) {

			//split up the keys
			var keys = bindSets[i].split('+');

			//if there are keys in the current combo
			if(keys.length) {
				if(!keyBindingGroups[keys.length]) { keyBindingGroups[keys.length] = []; }

				//define the
				var keyBinding = {
					"callback": callback,
					"endCallback": endCallback,
					"keyCombo": bindSets[i],
					"keys": keys
				};

				//save the binding sorted by length
				keyBindingGroups[keys.length].push(keyBinding);
			}
		}

		return {
			"clear": clear
		}
	}

	function bindAxis(up, down, left, right, callback) {

		function clear() {
			if(typeof clearUp === 'function') { clearUp(); }
			if(typeof clearDown === 'function') { clearDown(); }
			if(typeof clearLeft === 'function') { clearLeft(); }
			if(typeof clearRight === 'function') { clearRight(); }
			if(typeof timer === 'function') { clearInterval(timer); }
		}

		var axis = [0, 0];

		if(typeof callback !== 'function') {
			return;
		}

		//up
		var clearUp = bindKey(up, function () {
			if(axis[0] === 0) {
				axis[0] = -1;
			}
		}, function() {
			axis[0] = 0;
		}).clear;

		//down
		var clearDown = bindKey(down, function () {
			if(axis[0] === 0) {
				axis[0] = 1;
			}
		}, function() {
			axis[0] = 0;
		}).clear;

		//left
		var clearLeft = bindKey(left, function () {
			if(axis[1] === 0) {
				axis[1] = -1;
			}
		}, function() {
			axis[1] = 0;
		}).clear;

		//right
		var clearRight = bindKey(right, function () {
			if(axis[1] === 0) {
				axis[1] = 1;
			}
		}, function() {
			axis[1] = 0;
		}).clear;

		var timer = setInterval(function(){
			var degree;

			//NO CHANGE
			if(axis[0] === 0 && axis[1] === 0) {
				return;
			}

			//ON 45 ANGLE
			//up left
			else if(axis[0] === -1 && axis[1] === -1) {
				degree = 315;
			}

			//up right
			else if(axis[0] === -1 && axis[1] === 1) {
				degree = 45;
			}

			//down left
			else if(axis[0] === 1 && axis[1] === -1) {
				degree = 225;
			}

			//down right
			else if(axis[0] === 1 && axis[1] === 1) {
				degree = 135;
			}

			//ON 90 ANGLE
			//up
			else if(axis[0] === -1 && axis[1] === 0) {
				degree = 0;
			}

			//down
			else if(axis[0] === 1 && axis[1] === 0) {
				degree = 180;
			}

			//left
			else if(axis[0] === 0 && axis[1] === -1) {
				degree = 270;
			}

			//right
			else if(axis[0] === 0 && axis[1] === 1) {
				degree = 90;
			}

			//run the callback
			callback(degree);

		}, 1);

		return {
			"clear": clear
		}
	}

	function unbindKey(keys) {

		if(keys === 'all') {
			keyBindingGroups = [];
			return;
		}

		keys = keys.replace(/\s/g, '').split(',');

		//loop through the key binding groups.
		for(var iKCL = keyBindingGroups.length; iKCL > -1; iKCL -= 1) {
			if(keyBindingGroups[iKCL]) {
				var KeyBindingGroup = keyBindingGroups[iKCL],
					remove = true;

				//loop through the key bindings.
				for(var iB = 0; iB < KeyBindingGroup.length; iB += 1) {
					var keyBinding = KeyBindingGroup[iB];

					//loop through the current key binding keys.
					for(var iKB = 0; iKB < keyBinding.keys.length;  iKB += 1) {
						var key = keyBinding.keys[iKB];

						//loop through the keys to be removed
						for(var iKR = 0; iKR < keys.length; iKR += 1) {
							var keyToRemove = keys[iKR];
							if(keyToRemove === key) {
								remove = true;
								break;
							}
						}
						if(remove) { break; }
					}
					if(remove) { break; }
				}
				if(remove) {
					delete keyBindingGroups[iKCL];
				}
			}
		}
	}

	function getActiveKeys() {
		return activeKeys;
	}

	context.KeyboardJS = {
		"bind": {
			"key": bindKey,
			"axis": bindAxis
		},
		"activeKeys": getActiveKeys,
		"unbind": {
			"key": unbindKey
		}
	}

})(this);