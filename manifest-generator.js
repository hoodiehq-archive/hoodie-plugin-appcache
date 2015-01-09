var fs = require('fs');
var watch = require('node-watch');
var radm = require('render-appcache-manifest');
var glob = require('glob');

module.exports = function(directory, outFilename) {
	var result = {};

	var watcher;
	var dir = directory;

	result.generate = function(cb, options, err) {
		options = options || {};

		var contents = {
			// By default we want to completely disable all access to the
			// outside world for static resources

      // NOTE: we cannot set NETWORK to /_api, as it conflicts
      // with /_api/_files/hoodie.js
      // network: options.network || ['/_api'],
			network: options.network || ['*'],
			cache: [],
			fallback: options.fallback || {'/': '/'},
			lastModified: options.modified || new Date(),
			comment: options.comment
		};

		glob('**/*.*', {cwd: dir}, function(error, files) {
			if (error && err) {
				return err(error);
			}

			files.forEach(function(element, index, array) {
				// exclude files on blacklist; include only files (no directories)
                		if (element.indexOf(outFilename) == -1 && fs.lstatSync(dir + element).isFile()) {					if (element == 'index.html') {
						contents.cache.push('/');
					} else {
						contents.cache.push('/' + element);
					}
				}
			})

      contents.cache.push('/_api/_files/hoodie.js');
		})
			.on('end', function() {
				var output = radm(contents);

				if (outFilename) {
					fs.writeFile(outFilename, output, function(error) {
						if (error) {
							if (err) err(error);
							return;
						}
					});
				}

				if (cb) cb(output);
			});
	}

	result.startWatching = function(cb, options, error) {
		if (watcher) {
			this.stopWatching();
		}

		watcher = watch(dir, function(file) {
			if (file.indexOf(outFilename) == -1) {
				fs.stat(file, function (err, stats) {
					if (err) {
						if (error) error(err);
						return;
					}
  				options.modified = stats.mtime;
					result.generate(cb, options, error);
				});
			}
		});
	}

	result.stopWatching = function() {
		watcher.close();
		watcher = undefined;
	}

	return result;
}
