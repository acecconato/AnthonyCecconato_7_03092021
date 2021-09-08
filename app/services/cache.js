const persistentCache = require('persistent-cache');

const cache = persistentCache({
  base: 'var',
  name: 'persistent-cache',
  duration: 1000 * 3600 * 24,
});

module.exports = cache;
