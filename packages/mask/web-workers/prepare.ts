/// <reference path="../../polyfills/types/dom.d.ts" />
if (typeof trustedTypes === 'object' && location.protocol.includes('extension')) {
    trustedTypes.createPolicy('default', {
        // do not add createHTML or createScript.
        // createScriptURL is safe because according to the CSP we have, it is impossible to
        // include/create a script from cross-origin.
        createScriptURL: (string) => string,
    })
}

importScripts('/worker.js')
if (typeof self !== 'undefined') {
    /**
     * Workaround: Webpack child compiler doesn't inherit plugins but inherit loaders.
     * That make loaders/plugins settings mismatch and cause runtime errors.
     */
    Reflect.set(self, '$RefreshReg$', function () {})
    Reflect.set(self, '$RefreshSig$', function () {
        return function (type: any) {
            return type
        }
    })
}
export {}
setTimeout(() => self.postMessage('Alive'), 0)
