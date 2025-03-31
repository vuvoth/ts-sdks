const wasm = require('./walrus_wasm.js');
module.exports = function init() {}
Object.assign(module.exports, wasm, { default: init });
