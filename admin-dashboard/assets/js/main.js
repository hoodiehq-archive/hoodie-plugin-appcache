$(function () {
  var hoodieAdmin = top.hoodieAdmin;

  function getManifest(callback) {
    hoodieAdmin.request('GET', '/_plugins/appcache/_api/update')
      .fail(function(error) { callback(error); })
      .done(function(response) { callback(null, response); })
  }
  function getConfig(callback) {
    hoodieAdmin.request('GET', '/plugins/plugin%2Fhoodie-plugin-appcache')
      .fail(function(error) { callback(error); })
      .done(function(response) { callback(null, response); })
  }

  function updateManifest(text) {
    var code = text.replace(/\n/g, '<br/>');
    $('[name=manifest]').html('<code>' + code + '</code>');
  }

  $('#reset').click(function (ev) {
      $('[name=manifest]').html('<img src="assets/images/loading32.gif"></img>');
      getManifest(function(err, doc) {
        if (err) {
          alert("Error trying to sync");
        }

        var text = doc.manifest;
        updateManifest(text);
      });
  });

  getConfig(function(err, doc) {
    updateManifest(doc.config.manifest);
  })
});
