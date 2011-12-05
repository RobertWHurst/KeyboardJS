document.addEventListener('DOMContentLoaded', function (){

	var exampleElement = document.getElementsByClassName('demoReadout')[0];

	//watch for konami code
	var konami = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'],
		kI = 0;


	document.addEventListener('keydown', function(){

		var keys = KeyboardJS.activeKeys();

		if(keys.length) {
			for(var i = 0; i < keys.length; i += 1) {

				//check to see if the key is part of the konami code
				if(keys[i] === konami[kI]) {
					if(kI < konami.length - 1) {
						kI += 1;
					} else {
						location = "http://en.wikipedia.org/wiki/Konami_Code";
					}
				} else {
					kI = 0;
				}

			}
		}
	});

	setInterval(function(){

		var keys = KeyboardJS.activeKeys();

		var keysString;
		if(keys.length) {
			keysString = keys.join(', ');
		} else {
			keysString = 'Press some keys...';
		}
		exampleElement.innerHTML = keysString;
	}, 10);
	
});