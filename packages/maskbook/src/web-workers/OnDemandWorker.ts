type ctor = [stringUrl: string | URL, options?: WorkerOptions]
export class OnDemandWorker extends Worker {
    protected readonly init: ctor
    protected worker: Worker | undefined = this
    protected readonly id = Math.random().toString(16).slice(2)
    constructor(...init: ctor) {
        super(...init)
        this.init = init
        this.log('created with', ...init)
    }
    protected log(...args: any[]) {
        console.log(`OnDemandWorker ${this.id}`, ...args)
    }
    protected lastUsed = Date.now()
    protected use(onReady: () => void) {
        this.lastUsed = Date.now()
        this.log('keep alive')

        if (this.worker) return onReady()
        this.worker = new Worker(...this.init)
        this.worker.addEventListener('error', (e) => this.dispatchEvent(e))
        this.worker.addEventListener('message', (e) => this.dispatchEvent(e))
        this.worker.addEventListener('messageerror', (e) => this.dispatchEvent(e))
        setTimeout(onReady, 50)
    }
    terminate() {
        this.worker?.terminate()
        this.worker = undefined
        this.log('terminated')
    }
}
OnDemandWorker.prototype.postMessage = function (this: OnDemandWorker, ...args: [any, any]) {
    this.use(() => this.worker?.postMessage(...args))
}
