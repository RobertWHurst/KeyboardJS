const demoReadoutEl = document.querySelector('.demoReadout');

const fireUpTheMagic = function () {
	// TODO: Do something cool instead of going to wikipedia.
	window.location = "http://en.wikipedia.org/wiki/Konami_Code";
}

const updateReadout = function (pressedKeys) {
	demoReadoutEl.innerText = pressedKeys.length
		? pressedKeys.join(', ')
		: 'Press some keys...';
};
updateReadout([]);

keyboardJS.bind('up > up > down > down > left > right > left > right > b > a', fireUpTheMagic);

keyboardJS.bind(e => updateReadout(e.pressedKeys), e => updateReadout(e.pressedKeys));
