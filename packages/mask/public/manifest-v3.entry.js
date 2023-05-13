try {
    importScripts(
        './worker_env.js',
        './gun.js',
        './polyfill/browser-polyfill.js',
        './sandboxed-modules/mv3-preload.js',
        './js/background.js',
    )
} catch (error) {
    console.error(error)
}
