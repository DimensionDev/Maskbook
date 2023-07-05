export interface OnDemandWorkerEventMap extends WorkerEventMap {
    terminated: Event
}

/**
 * A Worker-like class that create/destroy Worker on demand.
 *
 * The worker passed in MUST post a message "Alive" to notify the OnDemandWorker it is ready to receive message.
 * This "Alive" MUST be the first message.
 */
export class OnDemandWorker extends EventTarget {
    protected readonly __init: WorkerConstructorParameters
    protected worker?: Worker = undefined
    protected inactiveTimeToTerminate = 15 * 60 * 1000
    /**
     * A Worker-like class that create/destroy Worker on demand.
     *
     * The worker passed in MUST post a message "Alive" to notify the OnDemandWorker it is ready to receive message.
     * This "Alive" MUST be the first message.
     */
    constructor(...init: WorkerConstructorParameters) {
        super()
        this.__init = init
        this.log(init[1]?.name ?? 'anonymous Worker', 'created with', ...init)
    }
    protected watchUsage() {
        const i = setInterval(
            () => {
                if (!this.worker) {
                    clearInterval(i)
                    return
                }
                if (Date.now() - this.lastUsed > this.inactiveTimeToTerminate) {
                    this.log('inactive for', this.inactiveTimeToTerminate / 1000, 'sec')
                    this.terminate()
                    clearInterval(i)
                }
            },
            Math.min(this.inactiveTimeToTerminate, 60 * 1000),
        )
    }
    protected log(...args: any[]) {
        // console.log(`OnDemandWorker ${this.init[1]?.name}`, ...args)
    }
    protected lastUsed = Date.now()
    protected use(onReady: () => void) {
        this.keepAlive()
        if (this.worker) return onReady()
        this.worker = new Worker(...this.__init)
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
        this.worker?.terminate()
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

    override addEventListener<K extends keyof OnDemandWorkerEventMap>(
        type: K,
        listener: (this: OnDemandWorker, ev: OnDemandWorkerEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void {
        super.addEventListener(type, listener as any, options)
    }
    override removeEventListener<K extends keyof OnDemandWorkerEventMap>(
        type: K,
        listener: (this: OnDemandWorker, ev: OnDemandWorkerEventMap[K]) => any,
        options?: boolean | EventListenerOptions,
    ): void {
        super.removeEventListener(type, listener as any, options)
    }
    postMessage(message: any, transfer: Transferable[]): void
    postMessage(message: any, options?: StructuredSerializeOptions): void
    postMessage(...args: [any, any]) {
        this.use(() => this.worker?.postMessage(...args))
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
}

function throws() {
    throw new TypeError('Please use addEventListener')
}

function cloneEvent(e: MessageEvent | ErrorEvent) {
    if (e instanceof MessageEvent) return new MessageEvent(e.type, { data: e.data })
    return new ErrorEvent(e.type, e)
}
type WorkerConstructorParameters = [stringUrl: string | URL, options?: WorkerOptions]
