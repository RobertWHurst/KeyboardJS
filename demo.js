$(function (){

	setInterval(function(){
		var keys = KeyboardJS.activeKeys();
		var keysString;
		if(keys.length) {
			keysString = keys.join(', ');
		} else {
			keysString = 'Press some keys...';
		}
		$('.demoReadout').html(keysString);
	}, 10);

});