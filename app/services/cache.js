const { LocalStorage } = require('node-localstorage');

const localStorage = new LocalStorage('var/cache/local-storage');

module.exports = localStorage;
