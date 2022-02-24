// Remove this file after iOS 14- is dropped.
try {
    if (typeof globalThis.EventTarget?.call === 'function') {
        try {
            new EventTarget()
        } catch {
            shim()
        }
    }
    function shim() {
        globalThis.EventTarget = new Proxy(EventTarget, {
            construct() {
                return new AbortController().signal
            },
        })
    }
} catch (err) {
    console.warn('Failed to polyfill EventTarget.constructor:', err)
}
export {}
