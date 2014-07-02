var fs = require('fs');
var generator = require('./manifest-generator.js');

module.exports = function (hoodie, callback) {
	// Hack until I can get a path var from hoodie
	var path = __dirname + '/../../www/';

	var loaderHTML = 
		'<!DOCTYPE html>' +
		'<html manifest="/_api/_plugins/appcache/_api/manifest.appcache">' +
		'<head><meta charset="utf-8" /><title>appCache loader</title></head>' +
		'<body></body></html>';

	hoodie.config.set('loader', loaderHTML);

	// Omitting an output file path will make the generator only 
	// pass the resulting text to the callback.
	var gen = generator(path);

	var updated = function(manifestText) {
		hoodie.config.set('manifest', manifestText);
		hoodie.config.set('lastUpdated', (new Date()).toString());
		hoodie.task.emit('appcache:updated', manifestText);
	}

	var error = function(err) {
		console.log("Error: " + err);
	}

	var update = function(originDb, message) {
		gen.generate(updated, error);
	}

	hoodie.task.on('appcache:update', update);

	gen.generate(updated, {}, error);
	gen.startWatching(updated, {}, error);

  callback();
};
