// this file must be in the root due to limitation of mv3 service worker.
if (typeof trustedTypes === 'object') {
    trustedTypes.createPolicy('default', { createScriptURL: (string) => string })
}
importScripts(
    '/js/patches.js',
    '/js/gun.js',
    '/js/polyfill/ecmascript.js',
    '/js/polyfill/browser-polyfill.js',
    '/js/polyfill/lockdown.js',
    // '/js/trusted-types.js',
    '/js/lockdown.js',
    //
    './sw.js',
)
