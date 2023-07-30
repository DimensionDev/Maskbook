// this file must be in the root due to limitation of mv3 service worker.
try {
    importScripts(
        './worker.js',
        './js/gun.js',
        './js/polyfill/browser-polyfill.js',
        './sandboxed-modules/mv3-preload.js',
        './bundled/backgroundWorker.js',
    )
} catch (error) {
    // Note: this try catch is for Safari. If Safari extension failed to initialize, we cannot see the error message without this try-catch.
    console.error('Initialization failed', error)
}
