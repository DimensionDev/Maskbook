importScripts(
    '/js/patches.js',
    '/js/polyfill/ecmascript.js',
    '/js/polyfill/lockdown.js',
    '/js/lockdown.js',
    '/js/module-loader.js',
)

// Workaround: Webpack child compiler doesn't inherit plugins but inherit loaders,
//             therefore react-refresh (by swc-loader) breaks the worker code.
self.$RefreshReg$ = function () {}
self.$RefreshSig$ = function () {
    return function (type) {
        return type
    }
}
