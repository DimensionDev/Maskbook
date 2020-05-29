//#region WebCrypto
delete globalThis.self
delete globalThis.window
// If don't delete those, elliptic will not work well
const elliptic = require('elliptic/lib/elliptic')
require = require('esm')(module)
Object.assign(globalThis, {
    elliptic,
    self: globalThis,
    window: globalThis,
    crypto: require('webcrypto').crypto,
})

//#endregion

/* global TextEncoder, TextDecoder */
Object.assign(globalThis, require('@sinonjs/text-encoding/index'))

// TODO:
// can not find a handy createRange and getSelection polyfill for jest
// remove these polyfill if we find one in the future
document.createRange = () => {
    return {
        endContainer: null,
        selectNodeContents(element) {
            this.endContainer = element
        },
    }
}
globalThis.getSelection = () => {
    return {
        _ranges: [],
        rangeCount: 0,
        removeAllRanges() {},
        addRange(range) {
            this._ranges.push(range)
            this.rangeCount = this._ranges.length
        },
        getRangeAt(index) {
            return this._ranges[index]
        },
    }
}

// webkit rpc handler
globalThis.webkit = globalThis.webkit || {}
globalThis.webkit.messageHandlers = globalThis.webkit.messageHandlers || {}
globalThis.webkit.messageHandlers.maskbookjsonrpc = {
    postMessage(data) {},
}

// webpack env
globalThis.webpackEnv = {
    target: 'Chromium',
}
