/**
 * Title: KeyboardJS
 * Version: v0.3.0
 * Description: KeyboardJS is a flexible and easy to use keyboard binding library.
 * Author: Robert Hurst.
 *
 * Copyright 2011, Robert William Hurst
 * Licenced under the BSD License.
 * See https://raw.github.com/RobertWHurst/KeyboardJS/master/license.txt
 */
(function(context, factory) {
	var _KeyboardJS, KeyboardJS;
	if(typeof define === 'function' && define.amd) {
		define(function() { return factory('amd'); });
	} else {
		_KeyboardJS = context.KeyboardJS;
		context.KeyboardJS = KeyboardJS = factory('global');
		KeyboardJS.noConflict = function(namespace) {
			if(typeof namespace === 'string') {
				context[namespace] = KeyboardJS;
				context.KeyboardJS = _KeyboardJS;
			} else if(namespace === false) {
				delete context[namespace];
				context.KeyboardJS = _KeyboardJS;
			}
			return KeyboardJS;
		};
	}
})(function(env) {
	var KeyboardJS = {}, locales, locale, map, activeKeys = [], bindings = [], macroKeys = {}, activeMacroInjectedKeys = {};

	[].indexOf||(Array.prototype.indexOf=function(a,b,c){for(c=this.length,b=(c+~~b)%c;b<c&&(!(b in this)||this[b]!==a);b++);return b^c?b:-1;});

	locales = {
		'us': {
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
		}

		//If you create a new locale please submit it as a pull request or post it in the issue tracker at
		// http://github.com/RobertWhurst/KeyboardJS/issues/
	};
	locale = 'us';
	map = locales[locale];
	if(window.addEventListener) {
		window.addEventListener('keydown', keydown, false);
		window.addEventListener('keyup', keyup, false);
	} else if(window.attachEvent) {
		window.attachEvent('onkeydown', keydown);
		window.attachEvent('onkeyup', keyup);
	} else {
		throw new Error('Cannot bind to keydown event. Both addEventListener and attachEvent are unsupported by your browser.');
	}
	KeyboardJS.on = createBinding;
	KeyboardJS.clear = removeBinding;
	KeyboardJS.locale = getSetLocale;
	KeyboardJS.locale.register = registerLocale;
	return KeyboardJS;

	function keydown(event) {
		var keyName;
		keyName = lookupKeyCode(event.keyCode);
		if(keyName === false) { return; }
		addActiveKey(keyName);
		executeMacroKeys();
		executeBindings(event);
	}
	function keyup(event) {
		var keyName;
		keyName = lookupKeyCode(event.keyCode);
		if(keyName === false) { return; }
		removeActiveKey(keyName);
		pruneMacroKeys();
		pruneBindings(event);
	}
	function lookupKeyCode(keyCode) {
		var keyName;
		for(keyName in map) {
			if(map[keyCode] === keyCode) {
				return keyName;
			}
		}
		return false;
	}
	function createMacroKey(macroKeyName, callback) {
		var macroKey = {};
		macroKey.name = macroKeyName;
		macroKey.callback = callback;
		macroKeys[macroKeyName] = macroKey;
	}
	function removeMacroKey(macroKeyName) {
		delete macroKeys[macroKeyName];
	}
	function executeMacroKeys() {
		var injectedKeys, macroKeyName, iI;
		for(macroKeyName in macroKeys) {
			if(!macroKeys.hasOwnProperty(macroKeyName)) { continue; }
			injectedKeys = macroKeys.callback(activeKeys);
			if(typeof injectedKeys === 'object' && typeof injectedKeys.push === 'function' && injectedKeys.length > 0) {
				for(iI = 0; iI < injectedKeys.length; iI += 1) {
					addActiveKey(injectedKeys[iI]);
				}
				activeMacroInjectedKeys[macroKeyName] = injectedKeys;
			}
		}
	}
	function pruneMacroKeys() {
		var injectedKeys, macroKeyName, iI;
		for(macroKeyName in macroKeys) {
			if(!macroKeys.hasOwnProperty(macroKeyName)) { continue; }
			if(macroKeys.callback(activeKeys) === false) {
				injectedKeys = activeMacroInjectedKeys[macroKeyName];
				for(iI = 0; iI < injectedKeys.length; iI += 1) {
					removeActiveKey(injectedKeys[iI]);
				}
				delete activeMacroInjectedKeys[macroKeyName];
			}
		}
	}
	function createBinding(keyCombo, keyDownCallback, keyUpCallback) {
		var binding = {}, bindingApi = {};
		if(typeof keyCombo === 'object' && typeof keyCombo.push === 'function') {
			keyCombo = stringifyKeyCombo(keyCombo);
		}
		if(typeof keyCombo !== 'string') { throw new Error('Failed to bind key combo. The key combo must be string.'); }
		binding.keyCombo = keyCombo;
		binding.keyDownCallback = keyDownCallback;
		binding.keyUpCallback = keyUpCallback;
		binding.parsedkeyCombo = parseKeyCombo(keyCombo);
		bindings.push(binding);
		return {
			"remove": remove
		};

		function remove() {
			bindings.splice(bindings.indexOf(binding), 1);
		}
	}
	function removeBindingByKeyCombo(keyCombo) {
		var bI, binding, keyName;
		for(bI = 0; bI < bindings.length; bI += 1) {
			binding = bindings[bi];
			if(compareCombos(keyCombo, binding.keyCombo)) {
				bindings.splice(bI, 1); bI -= 1;
			}
		}
	}
	function removeBindingByKeyName(keyName) {
		var bI, cI, binding;
		for(bI = 0; bI < bindings.length; bI += 1) {
			binding = bindings[bi];
			for(cI = 0; cI < binding.keyCombo.length; cI += 1) {
				if(binding.keyCombo[kI].indexOf(keyName) > -1) {
					bindings.splice(bI, 1); bI -= 1;
					break;
				}
			}
		}
	}
	function executeBindings(event) {

	}
	function pruneBindings(event) {

	}
	function getActiveKeys() {
		return [].concat(activeKeys);
	}
	function addActiveKey(keyName) {
		if(keyName.match(/\s/)) { throw new Error('Cannot add key name ' + ' to active keys because it contains whitespace.'); }
		if(activeKeys.indexOf(keyName) > -1) { return; }
		activeKeys.push(keyName);
	}
	function removeActiveKey(keyName) {
		activeKeys.splice(activeKeys.indexOf(keyName), 1);
	}
	function registerLocale(localeName, localeMap) {
		if(typeof localeName !== 'string') { throw new Error('Cannot register new locale. The locale name must be a string.'); }
		if(typeof localeMap !== 'object') { throw new Error('Cannot register ' + localeName + ' locale. The locale map must be an object.'); }
		locales[localeName] = localeMap;
	}
	function getSetLocale(localeName) {
		if(!localeName) { return locale; }
		if(typeof localeName !== 'string') { throw new Error('Cannot set locale. The locale name must be a string.'); }
		if(!locales[localeName]) { throw new Error('Cannot set locale to ' + localeName + ' because it does not exist. If you would like to submit a ' + localeName + ' locale map for KeyboardJS please submit it at https://github.com/RobertWHurst/KeyboardJS/issues.'); }
		locale = localeName;
		map = locales[locale];
	}
	function compareCombos(keyComboArrayA, keyComboArrayB) {
		if(typeof keyComboArrayA === 'string') { keyComboArrayA = parseKeyCombo(keyComboArrayA); }
		if(typeof keyComboArrayB === 'string') { keyComboArrayB = parseKeyCombo(keyComboArrayB); }

	}
	function parseKeyCombo(keyCombo) {
		var kI, parsedKeyCombo = [];
		keyCombo = keyCombo.replace(/\s+/g, '').split(',');
		for(kI = 0; kI < keyCombo.length; kI += 1) {
			parsedKeyCombo[kI] = keyCombo[kI].split('+');
		}
		return parsedKeyCombo;
	}
	function stringifyKeyCombo(keyComboArray) {
		var cI;
		if(typeof keyComboArray === 'object' && typeof keyComboArray.push === 'function' && typeof keyComboArray[0] === 'string') {
			keyComboArray = [keyComboArray];
		}
		for(cI = 0; cI < keyComboArray.length; cI += 1) {
			keyComboArray[cI] = keyComboArray[cI].join(' + ');
		}
		return keyComboArray.join(', ');
	}
});
