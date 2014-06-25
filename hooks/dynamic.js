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
          reply.file(__dirname + '/../appcache-loader.html');
          break;
        case 'manifest':
          reply.file(__dirname + '/../../../manifest.appcache');
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
