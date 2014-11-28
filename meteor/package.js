// package metadata file for Meteor.js
'use strict';

var packageName = 'keyboardjs:keyboardjs';  // http://atmospherejs.com/keyboardjs/keyboardjs
var where = 'client';  // where to install: 'client' or 'server'. For both, pass nothing.

var packageJson = JSON.parse(Npm.require("fs").readFileSync('package.json'));

Package.describe({
  name: packageName,
  summary: 'KeyboardJS (official): easy to use keyboard wrapper. Advanced combos, overlap prevention, locales.',
  version: packageJson.version,
  git: 'https://github.com/RobertWHurst/KeyboardJS.git'
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.0');
  api.export('KeyboardJS');
  api.addFiles([
    'keyboard.js',
    'meteor/export.js'
  ], where);
});

Package.onTest(function (api) {
  api.use(packageName, where);
  api.use('tinytest', where);

  api.addFiles('meteor/test.js', where);
});
