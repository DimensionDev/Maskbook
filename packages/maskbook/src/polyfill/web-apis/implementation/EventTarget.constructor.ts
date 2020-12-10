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
            // Obviously an HTMLElement is a EventTarget,
            // TODO: but we need to find another side-effect free subclass of EventTarget because DOM is not available in the WorkerGlobalScope
            return document.createElement('div')
        },
    })
}
export {}
