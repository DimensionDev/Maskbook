//#region WebCrypto
const WebCrypto = require('@trust/webcrypto')
delete globalThis.self
delete globalThis.window
// If don't delete those, elliptic will not work well
const elliptic = require('elliptic/lib/elliptic')
require = require('esm')(module)
Object.assign(globalThis, {
    crypto: WebCrypto,
    elliptic,
    self: globalThis,
    window: globalThis,
    navigator: {
        // Pretend to be IE11 so webcrypto-liner will apply all the polyfills for node.
        userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko',
    },
    asmCrypto: require(require('path').join(__dirname, '../npm-debug.log.asmcrypto.js'))
})

require('webcrypto-liner/build/webcrypto-liner.shim')
//#endregion

/* global TextEncoder, TextDecoder */
Object.assign(globalThis, require('@sinonjs/text-encoding/index'))
