type ctor = [stringUrl: string | URL, options?: WorkerOptions]
const WorkerCheckTerminateInterval = 60 * 1000
const InactiveTimeToTerminateDefault = 15 * 10000
interface OnDemandWorkerEventMap extends WorkerEventMap {
    terminated: Event
}
export class OnDemandWorker extends EventTarget implements Worker {
    protected readonly init: ctor
    protected worker: Worker | undefined = undefined
    public inactiveTimeToTerminate = InactiveTimeToTerminateDefault
    constructor(...init: ctor) {
        super()
        this.init = init
        this.log(init[1]?.name, 'created with', ...init)
    }
    protected watchUsage() {
        const i = setInterval(() => {
            if (!this.worker) {
                clearInterval(i)
                return
            }
            if (Date.now() - this.lastUsed > this.inactiveTimeToTerminate) {
                this.log('inactive for', this.inactiveTimeToTerminate / 1000, 'sec')
                this.terminate()
                clearInterval(i)
            }
        }, Math.min(this.inactiveTimeToTerminate, WorkerCheckTerminateInterval))
    }
    protected log(...args: any[]) {
        // console.log(`OnDemandWorker ${this.init[1]?.name}`, ...args)
    }
    protected lastUsed = Date.now()
    protected use(onReady: () => void) {
        this.keepAlive()
        if (this.worker) return onReady()
        this.worker = new Worker(...this.init)
        // After the Worker is alive, it will send a message "Alive" in setup.worker.ts
        // then to start forwarding message
        // TODO: what if the worker does not start successfully?
        this.worker.addEventListener(
            'message',
            () => {
                this.worker!.addEventListener('message', (e) => this.dispatchEvent(cloneEvent(e)))
                onReady()
            },
            { once: true },
        )
        this.worker.addEventListener('error', (e) => this.dispatchEvent(cloneEvent(e)))
        this.worker.addEventListener('messageerror', (e) => this.dispatchEvent(cloneEvent(e)))
        this.watchUsage()
    }
    terminate() {
        this.worker && Worker.prototype.terminate.call(this.worker)
        this.worker = undefined
        this.log('terminated')
        this.dispatchEvent(new Event('terminated'))
    }
    keepAlive() {
        this.log('keep alive')
        this.lastUsed = Date.now()
    }
    onTerminated(callback: () => void) {
        this.addEventListener('terminated', callback, { once: true })
        return () => this.removeEventListener('terminated', callback)
    }
    postMessage(message: any, transfer: Transferable[]): void
    postMessage(message: any, options?: StructuredSerializeOptions): void
    postMessage(...args: [any, any]) {
        this.use(() => this.worker && Worker.prototype.postMessage.apply(this.worker, args))
    }
    set onmessage(_: never) {
        throws()
    }
    set onerror(_: never) {
        throws()
    }
    set onmessageerror(_: never) {
        throws()
    }
    // @ts-ignore
    addEventListener<K extends keyof OnDemandWorkerEventMap>(
        type: K,
        listener: (this: OnDemandWorker, ev: OnDemandWorkerEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void {
        super.addEventListener(type, listener as any, options)
    }
    // @ts-ignore
    removeEventListener<K extends keyof OnDemandWorkerEventMap>(
        type: K,
        listener: (this: OnDemandWorker, ev: OnDemandWorkerEventMap[K]) => any,
        options?: boolean | EventListenerOptions,
    ): void {
        super.removeEventListener(type, listener as any, options)
    }
}
// Worker does not exist in MV3
typeof Worker === 'function' && Object.setPrototypeOf(OnDemandWorker.prototype, Worker.prototype)
const throws = () => {
    throw new TypeError('Please use addEventListener')
}

function cloneEvent(e: MessageEvent | ErrorEvent) {
    // @ts-ignore
    return new e.constructor(e.type, e)
}
