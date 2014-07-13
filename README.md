appCache Hoodie Plugin
======================

> Auto Updates and more for Offline First Applications

Hoodie has offline-support built in—for data. If you want to make your app
work offline as well, you have work with Application Cache – [and he's a
douchebag](http://alistapart.com/article/application-cache-is-a-douchebag).

Until now.

The appCache Hoodie Plugin gives you a JavaScript API that gives you full
control on whether you want to make your app work offline or not. It provides
a beautiful JavaScript API for the initial caching, for updating, and much more.

The appCache Hoodie Plugin is basically a wrapper around [The appCache Nanny](https://github.com/gr2m/appcache-nanny),
with the addition that it serves an auto-generated `manifest.appcache` file and
appCacheNanny's [appcache-loader.html](https://github.com/gr2m/appcache-nanny/blob/gh-pages/appcache-loader.html).

No extra setup needed, you can make your app work offline with a single line of JavaScript.

Installation
------------

```
hoodie install appcache
```

Usage
-----

First thing to learn is that you won't add `manifest="path/to/manifest.appcache"`
properties to `<html>` tags any more. Your app doesn't get cached automatically,
you have to start the caching explicitely:

```js
hoodie.appCache.start().then(showAppIsCachedNotification)
// NOTE: start() does not yet return a promise: #5
```

That's it. Not only does your app work without internet connection now, it also
automatically starts to check for update with an interval of 30 seconds.

Here's a list of all avialable methods:

```js
// start initial caching & auto-updating, returns promise
hoodie.appCache.start({
  // in ms
  checkInterval: 10000,

  // if you have a custom manifest file
  manifest: '/myapp.manifest',

  // if you have a custom manifest loader,
  // makes `manifest` option obsolete
  appCacheLoader: '/appcache-loder.html',
});
// manually check for updates, returns promise
hoodie.appCache.update()
// stops auto-updating, returns promise
hoodie.appCache.stop()
// returns true / false
hoodie.appCache.hasUpdate()
// returns true / false
hoodie.appCache.isSupported()
// returns true / false
hoodie.appCache.isCheckingForUpdates()
```

The appCache comes also with a list of events that you can react on

```js
hoodie.appCache.on('update', handleUpdate)
hoodie.appCache.on('error', handleError)
hoodie.appCache.on('noupdate', handleNoUpdate)
hoodie.appCache.on('downloading', handleDownloading)
hoodie.appCache.on('progress', handleProgress)
hoodie.appCache.on('cached', handleCached)
hoodie.appCache.on('updateready', handleUpdateReady)
hoodie.appCache.on('start', handleStart)
hoodie.appCache.on('stop', handleStop)
hoodie.appCache.on('init:downloading', handleInitialDownloading)
hoodie.appCache.on('init:progress', handleInitialProgress)
hoodie.appCache.on('init:cached', handleInitialCached)
```

How it works
------------

The appCache Hoodie Plugin automatically scans your app's `www/` folder
and adds all assets to the `manifest.appcache` to make them available
offline. Each time an asset changes the `manifest.appcache` gets changed
to trigger an update.

`hoodie.appCache.start()` add's a hidden `<iframe>` to the page that loads
`appcache-loader.html`. That's an empty HTML file has the `manifest` property
on its `<html>` tag to start or update the local cache. Both files are served
from the appCache Hoodie Plugin's hook API.


Fine Print
----------

[appCache Hoodie Plugin](https://github.com/gr2m/hoodie-plugin-appcache)
has been authored by [Gregor Martynus](https://github.com/gr2m),
proud member of [Team Hoodie](http://hood.ie/).
Please support our work: [gittip us](https://www.gittip.com/hoodiehq/).

License: MIT
