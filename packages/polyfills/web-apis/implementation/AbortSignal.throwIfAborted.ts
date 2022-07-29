try {
    if (!AbortSignal.prototype.throwIfAborted) {
        AbortSignal.prototype.throwIfAborted = function throwIfAborted(this: AbortSignal) {
            if (this.aborted) {
                if (this.reason) throw this.reason
                throw new DOMException('signal is aborted without reason', 'AbortError')
            }
        }
    }
} catch {}
export {}
