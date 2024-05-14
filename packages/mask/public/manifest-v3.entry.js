// this file must be in the root due to limitation of mv3 service worker.
try {
    if (typeof trustedTypes === 'object') {
        trustedTypes.createPolicy('default', { createScriptURL: (string) => string })
    }
    importScripts(
        '/js/patches.js',
        '/js/gun.js',
        '/js/polyfill/ecmascript.js',
        '/js/polyfill/browser-polyfill.js',
        '/js/sentry.js',
        '/js/sentry-patch.js',
        '/js/polyfill/lockdown.js',
        // '/js/trusted-types.js',
        '/js/lockdown.js',
        '/js/module-loader.js',
        '/sandboxed-modules/mv3-preload.js',
        '/entry/backgroundWorker.js',
    )
} catch (error) {
    // Note: this try catch is for Safari. If Safari extension failed to initialize, we cannot see the error message without this try-catch.
    console.error('Initialization failed', error)
}
