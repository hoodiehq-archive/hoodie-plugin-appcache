module.exports = function (hoodie) {

  return {
    'server.api.plugin-request': function (request, reply) {

      switch(request.params.p) {
        case 'update':
          hoodie.task.on('appcache:updated', function(text) {
            reply(JSON.stringify({
              'status': 'ok',
              'manifest': text
            }));
          });
          hoodie.task.emit('appcache:update');
          break;
        case 'loader':
          reply(hoodie.config.get('loader'));
          break;
        case 'manifest.appcache':
          reply(hoodie.config.get('manifest'))
            .type('text/cache-manifest');
          break;
        default:
          reply(JSON.stringify({
              'status': 'error',
              'message': 'method not found for appCacheNanny plugin.'
            }));
      }
      return true;
    }
  };
};
