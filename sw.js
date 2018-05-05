/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "data/changelogswithstars.json",
    "revision": "c9d52f7fbe4fca33d06a6666bd2dd584"
  },
  {
    "url": "images/app.png",
    "revision": "5cc9d531c56520ebbb651f684ebd505f"
  },
  {
    "url": "images/icon-blue.png",
    "revision": "f1989236b4679f9f44d5a59c69faa073"
  },
  {
    "url": "images/icon.png",
    "revision": "bbb991bc241cde0ce8ca0dec063c432e"
  },
  {
    "url": "images/icons/icon-128x128.png",
    "revision": "39fa5e71cc626f77406c9fce19619414"
  },
  {
    "url": "images/icons/icon-144x144.png",
    "revision": "3ac3e8e164174f29e94e975f9fe3396f"
  },
  {
    "url": "images/icons/icon-152x152.png",
    "revision": "ca0ccb6b0072a474fde8e5846cb48e78"
  },
  {
    "url": "images/icons/icon-192x192.png",
    "revision": "a6bb1d77f7e116e1dc5f24dea6a0c727"
  },
  {
    "url": "images/icons/icon-384x384.png",
    "revision": "bcdd3ad6b4f08054d52e76a04d84c81f"
  },
  {
    "url": "images/icons/icon-512x512.png",
    "revision": "7f8f2db5cca72de36b95a4b21546e434"
  },
  {
    "url": "images/icons/icon-72x72.png",
    "revision": "226708b9225568441cdc1401cef57fb6"
  },
  {
    "url": "images/icons/icon-96x96.png",
    "revision": "7c0829972936a60b46a59eeaee5e8670"
  },
  {
    "url": "index.html",
    "revision": "02340b053315923ea32adeb803b21e4d"
  },
  {
    "url": "manifest.json",
    "revision": "9b351b62b941454a61db4504408d4293"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/\.(?:js|css)$/, workbox.strategies.staleWhileRevalidate({ cacheName: "static-resources", plugins: [] }), 'GET');
