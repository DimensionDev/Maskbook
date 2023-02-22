export class TimeoutController extends AbortController {
    constructor(private duration: number, private reason = 'Timeout') {
        super()

        const timer = setTimeout(() => {
            if (!this.signal.aborted) this.abort(reason)
        }, duration)

        this.signal.addEventListener('abort', () => {
            clearTimeout(timer)
        })

        return this
    }
}
