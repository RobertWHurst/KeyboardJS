document.addEventListener('DOMContentLoaded', function (){

	var exampleElement = document.getElementsByClassName('demoReadout')[0];

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