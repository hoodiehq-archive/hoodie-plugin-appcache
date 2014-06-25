var fs = require('fs');
var generator = require('./manifest-generator.js');

module.exports = function (hoodie, callback) {
	// Hack until I can get a path var from hoodie
	var path = __dirname + '/../../www/';

	// Manually copy file until we can get appcache-nanny to work with 
	// the plugin API
	fs.createReadStream(__dirname + '/appcache-loader.html')
		.pipe(fs.createWriteStream(path + 'appcache-loader.html'));

	var gen = generator(path, 'manifest.appcache');

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
