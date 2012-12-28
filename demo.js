$(function() {
	var $demoReadout, konami, kI = 0;

	$demoReadout = $('.demoReadout');
	$demoReadout.HTML('Press some keys...');
	konami = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];

	$(document).on('keydown', updateReadout);
	$(document).on('keyup', updateReadout);

	function updateReadout() {
		setTimeout(function() {
			var keys, keysString;

			keys = KeyboardJS.activeKeys();
			if(keys.length) {
				keysString = keys.join(', ');
				for(var i = 0; i < keys.length; i += 1) {
					//check to see if the key is part of the konami code
					if(keys[i] === konami[kI]) {
						if(kI < konami.length - 1) {
							kI += 1;
						} else {
							window.location = "http://en.wikipedia.org/wiki/Konami_Code";
						}
					} else {
						kI = 0;
					}
				}
			} else {
				keysString = 'Press some keys...';
			}
			$demoReadout.html(keysString);
		}, 0);
	}
});
