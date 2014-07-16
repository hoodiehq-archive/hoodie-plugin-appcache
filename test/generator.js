var expect = require('chai').expect;
var gen = require('../manifest-generator.js');

var manifest_generator = gen('.');

describe('ManifestGenerator', function() {
	it('should have generate, startWatching, and stopWatching properties', function () {
  	expect(manifest_generator).to.have.property('generate');
  	expect(manifest_generator).to.have.property('startWatching');
  	expect(manifest_generator).to.have.property('stopWatching');
	});

	it('should create a manifest file without error', function(done) {
		manifest_generator.generate(function(m) {
			expect(m).to.not.be.empty;
			done();
		}, {}, function(err) {
			throw err;
		});
	});

	it('should include the date when specified', function(done) {
		var specificDate = new Date(1405428748059);

		manifest_generator.generate(function(m) {
			expect(m).to.contain('# Last modified at ' + specificDate.toUTCString());
			done();
		}, {modified: specificDate}, function(err) {
			throw err;
		});
	});
});