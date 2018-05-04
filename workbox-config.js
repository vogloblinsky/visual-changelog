module.exports = {
  "globDirectory": "dist/",
  "globPatterns": [
    "**/*.{json,png,html}"
  ],
  "swDest": "dist/sw.js",
  runtimeCaching: [{
    urlPattern: /\.(?:js|css)$/,

    handler: 'staleWhileRevalidate',

    options: {
      // Only cache 10 images.
      cacheName: 'static-resources'
    }
  }]
};