try {
    // iOS 15.4-
    if (!('reason' in AbortSignal.prototype)) {
        const old_abort = AbortController.prototype.abort
        AbortController.prototype.abort = function abort(this: AbortController, reason?: any) {
            old_abort.call(this)
            Object.defineProperty(this.signal, 'reason', { value: reason, configurable: true })
        }
    }
} catch {}
export {}
