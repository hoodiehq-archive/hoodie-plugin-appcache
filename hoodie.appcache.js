/* global Hoodie */
Hoodie.extend(function(hoodie, lib, utils) {
  'use strict';

  var appCacheNanny = require('appcache-nanny');
  var appCache = {};
  var updateDefer;

  var APPCACHE_UPDATED_KEY = '_hoodie_appcache_updated';
  var store = utils.localStorageWrapper;
  var appCacheUpdated = store.getItem(APPCACHE_UPDATED_KEY) || false;

  // use the appcache loader provided by the plugin
  appCacheNanny.set( 'loaderPath', '/_api/_plugins/appcache/_api/loader');

  // use the appCacheNanny connection events to
  // check hoodie's connection
  appCacheNanny.on('offline', hoodie.checkConnection);
  appCacheNanny.on('online', hoodie.checkConnection);

  // add events API
  utils.events(hoodie, appCache, 'appcache');

  // proxy events
  appCacheNanny.on('error', proxyEvent('error'));
  appCacheNanny.on('noupdate', proxyEvent('noupdate'));
  appCacheNanny.on('downloading', proxyEvent('downloading'));
  appCacheNanny.on('progress', proxyEvent('progress'));
  appCacheNanny.on('cached', proxyEvent('cached'));
  appCacheNanny.on('updateready', proxyEvent('updateready'));
  appCacheNanny.on('start', proxyEvent('start'));
  appCacheNanny.on('stop', proxyEvent('stop'));
  appCacheNanny.on('init:downloading', proxyEvent('init:downloading'));
  appCacheNanny.on('init:progress', proxyEvent('init:progress'));
  appCacheNanny.on('init:cached', proxyEvent('init:cached'));

  appCacheNanny.on('updateready', setAppcacheUpdatedFlag);

  function proxyEvent(eventname) {
    return function() {
      appCache.trigger(eventname);
    };
  }

  // wraps `appCacheNanny.start` into a promise
  appCache.start = function start(options) {
    return wrapIntoUpdatePromise('start', options)
    .done(function() {
      // appCache.start & appCache.update are throttled using the same promise.
      // In case appCache.start is called but a promise by a previous
      // appCache.update is still pending, we need to make sure that appCache
      // nanny still starts the interval checking
      if (appCacheNanny.isCheckingForUpdates()) {
        return;
      }
      appCacheNanny.start(options);
    });
  };

  // wraps `appCacheNanny.update` into a promise
  appCache.update = function update() {
    appCache.trigger('update');
    return wrapIntoUpdatePromise('update');
  };

  appCache.stop = function stop() {
    appCacheNanny.stop();
    return utils.promise.resolve();
  };
  appCache.hasUpdate = function hasUpdate() {
    return appCacheNanny.hasUpdate();
  };
  appCache.isSupported = function isSupported() {
    return appCacheNanny.isSupported();
  };
  appCache.isCheckingForUpdates = function isCheckingForUpdates() {
    return appCacheNanny.isCheckingForUpdates();
  };
  appCache.set = function set() {
    return appCacheNanny.set.apply(appCacheNanny, arguments);
  };
  appCache.get = function get() {
    return appCacheNanny.get.apply(appCacheNanny, arguments);
  };

  function setAppcacheUpdatedFlag() {
    store.setItem(APPCACHE_UPDATED_KEY, 1);
  }

  // - rejects on error
  // - resolves with true if update downloaded and ready
  // - resolves with false if there is no update
  // - calls progress callbacks on 'downloading' event.
  // - throttles multiple update calls
  function wrapIntoUpdatePromise (method, options) {
    if (updateDefer && updateDefer.state() === 'pending') {
      return updateDefer.promise;
    }
    updateDefer = utils.promise.defer();

    if (! appCacheNanny.isSupported()) {
      appCache.trigger('notsupported');
      return utils.promise.rejectWith('notsupported');
    }

    function reject() {
      updateDefer.reject();
      toggleBind('off');
    }

    function resolve() {
      updateDefer.resolve(false);
      toggleBind('off');
    }

    function handleUpdateReady() {
      updateDefer.resolve(true);
      toggleBind('off');
    }

    function toggleBind(method) {
      appCacheNanny[method]('error', reject);
      appCacheNanny[method]('noupdate', resolve);
      appCacheNanny[method]('updateready', handleUpdateReady);
      appCacheNanny[method]('downloading', updateDefer.notify);
      appCacheNanny[method]('progress', updateDefer.notify);
      appCacheNanny[method]('obsolete', resolve);
      appCacheNanny[method]('cached', resolve);
      appCacheNanny[method]('init:downloading', resolve);
      appCacheNanny[method]('init:progress', resolve);
      appCacheNanny[method]('init:cached', resolve);
    }

    toggleBind('on');
    appCacheNanny[method](options);

    return updateDefer.promise;
  }

  if (appCacheUpdated) {
    setTimeout(function() {
      appCache.trigger('updated');
    }, 1000);
    store.removeItem(APPCACHE_UPDATED_KEY);
  }
  hoodie.appCache = appCache;
});
