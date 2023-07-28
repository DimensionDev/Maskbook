try {
    importScripts(
        './worker_env.js',
        './gun.js',
        './polyfill/browser-polyfill.js',
        './sandboxed-modules/mv3-preload.js',
        './js/backgroundWorker.js',
    )
} catch (error) {
    // Note: this try catch is for Safari. If Safari extension failed to initialize, we cannot see the error message without this try-catch.
    console.error('Initialization failed', error)
}
