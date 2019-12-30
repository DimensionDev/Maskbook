const WebCrypto = require('@trust/webcrypto')
const elliptic = require('elliptic/lib/elliptic')
Object.assign(global, {
    crypto: WebCrypto,
    self: global,
    window: globalThis,
    elliptic,
    navigator: {
        // Pretend to be IE11 so webcrypto-liner will apply all the polyfills for node.
        userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko',
    },
})
require('webcrypto-liner/build/webcrypto-liner.shim')
crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey', 'deriveBits']).then(console.log)
