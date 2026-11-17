import keyboardJS from 'keyboardjs';

keyboardJS.bind('a', (e) => e.preventRepeat()).unbind('a');
