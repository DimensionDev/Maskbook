try {
    // iOS 15-
    if (!AbortSignal.timeout) {
        AbortSignal.timeout = function timeout(milliseconds: number) {
            const controller = new AbortController()
            setTimeout(() => controller.abort(new DOMException('Timeout', 'TimeoutError')), milliseconds)
            return controller.signal
        }
    }
} catch {}
export {}
