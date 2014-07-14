$(function () {
    var sync = _.partial(couchr.put, '/_api/_plugins/appcache/_api/update');
    var getConfig = _.partial(couchr.get, '/_api/plugins/plugin%2Fhoodie-plugin-appcache');

    function updateManifest(text) {
      var code = text.replace(/\n/g, '<br/>');
      $('[name=manifest]').html('<code>' + code + '</code>');
    }

    $('#reset').click(function (ev) {
        $('[name=manifest]').html('<img src="assets/images/loading32.gif"></img>');
        sync(function(err, doc) {
          if (err) {
            alert("Error trying to sync");
          }

          var text = JSON.parse(doc).manifest;
          updateManifest(text);
        });
    });

    getConfig(function(err, doc) {
      updateManifest(doc.config.manifest);
    })
});
