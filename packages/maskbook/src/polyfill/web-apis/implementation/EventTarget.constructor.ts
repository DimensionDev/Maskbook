// This file make EventTarget newable & extendable
// Remove this file after iOS 14- is dropped.
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
export {}
