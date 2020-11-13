type ctor = [stringUrl: string | URL, options?: WorkerOptions]
const DelayAfterWorkerCreated = 50
const WorkerShouldTerminateInterval = 60 * 1000
const InactiveTimeToTerminateDefault = 10 * 1000
export class OnDemandWorker extends Worker {
    protected readonly init: ctor
    protected worker: Worker | undefined = this
    protected readonly id = Math.random().toString(16).slice(2)
    public inactiveTimeToTerminate = InactiveTimeToTerminateDefault
    constructor(...init: ctor) {
        super(...init)
        this.init = init
        this.log('created with', ...init)
        this.watchUsage()
    }
    protected watchUsage() {
        const i = setInterval(() => {
            if (!this.worker) {
                clearInterval(i)
                return
            }
            if (Date.now() - this.lastUsed > this.inactiveTimeToTerminate) {
                this.log('inactive for ', this.inactiveTimeToTerminate / 1000, 'sec')
                this.terminate()
                clearInterval(i)
            }
        }, WorkerShouldTerminateInterval)
    }
    protected log(...args: any[]) {
        console.log(`OnDemandWorker ${this.id}`, this, ...args)
    }
    protected lastUsed = Date.now()
    protected use(onReady: () => void) {
        this.lastUsed = Date.now()
        this.log('keep alive')

        if (this.worker) return onReady()
        this.worker = new Worker(...this.init)
        this.worker.addEventListener('error', (e) => this.dispatchEvent(cloneEvent(e)))
        this.worker.addEventListener('message', (e) => this.dispatchEvent(cloneEvent(e)))
        this.worker.addEventListener('messageerror', (e) => this.dispatchEvent(cloneEvent(e)))
        this.watchUsage()
        setTimeout(onReady, DelayAfterWorkerCreated)
    }
    terminate() {
        this.worker && Worker.prototype.terminate.call(this.worker)
        this.worker = undefined
        this.log('terminated')
    }
}
OnDemandWorker.prototype.postMessage = function (this: OnDemandWorker, ...args: [any, any]) {
    this.use(() => this.worker && Worker.prototype.postMessage.call(this.worker, ...args))
}

function cloneEvent(e: MessageEvent | ErrorEvent) {
    // @ts-ignore
    return new e.constructor(e.type, e)
}
