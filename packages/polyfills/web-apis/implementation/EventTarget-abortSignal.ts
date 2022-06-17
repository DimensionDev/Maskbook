try {
    const abort = new AbortController()
    const signal = abort.signal
    const event = new EventTarget()
    event.addEventListener(
        'patch',
        () => {
            const old = EventTarget.prototype.addEventListener
            EventTarget.prototype.addEventListener = function (type, listener, options) {
                old.call(this, type, listener)
                if (typeof options === 'object' && options && options.signal) {
                    options.signal!.addEventListener('abort', () => this.removeEventListener(type, listener), {
                        once: true,
                    })
                }
            }
        },
        { once: true, signal },
    )
    abort.abort()
    event.dispatchEvent(new Event('patch'))
} catch {}
export {}
