import { createPromise, sendEvent } from './utils.js'

export abstract class InjectedWalletBridge {
    protected events = new Map<string, Set<(data: unknown) => void>>()
    protected isReadyInternal = false
    protected isConnectedInternal = false

    constructor(public pathname: string) {
        this.startup()
    }

    private async startup() {
        await this.untilAvailable()

        // if a provider is not ready, it will not be able to connect
        if (!this.isReady) return

        this.on('connected', () => {
            this.isConnectedInternal = true
        })
        this.on('disconnect', () => {
            this.isConnectedInternal = false
        })

        this.isConnectedInternal = (await this.getProperty<boolean | null>('isConnected')) ?? false
    }

    get isReady() {
        return this.isReadyInternal
    }

    get isConnected() {
        return this.isConnectedInternal
    }

    /**
     * Build the connection.
     */
    connect(options: unknown): Promise<unknown> {
        return createPromise((id) => sendEvent('web3BridgeExecute', [this.pathname, 'connect'].join('.'), id, options))
    }

    /**
     * Break the connections.
     */
    async disconnect(): Promise<void> {
        try {
            // some providers do not support disconnect
            return await createPromise((id) =>
                sendEvent('web3BridgeExecute', [this.pathname, 'disconnect'].join('.'), id),
            )
        } catch {
            return
        }
    }

    /**
     * Wait until the sdk object injected into the page.
     */
    untilAvailable(validator: () => Promise<boolean> = () => Promise.resolve(true)): Promise<void> {
        return createPromise((id) => sendEvent('web3UntilBridgeOnline', this.pathname.split('.')[0], id))
            .then(validator, () => false)
            .then((ok) => {
                this.isReadyInternal = ok
            })
    }

    /**
     * Send RPC request to the sdk object.
     */
    request<T>(data: unknown): Promise<T> {
        return createPromise((id) => sendEvent('web3BridgeExecute', [this.pathname, 'request'].join('.'), id, data))
    }

    /**
     * Add event listener on the sdk object.
     */
    on(event: string, callback: (...args: any) => void): () => void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set())
            sendEvent('web3BridgeBindEvent', this.pathname, 'web3BridgeEmitEvent', event)
        }
        const set = this.events.get(event)!
        set.add(callback)
        return () => void set.delete(callback)
    }

    /**
     * Remove event listener from the sdk object.
     */
    off(event: string, callback: (...args: any) => void): void {
        this.events.get(event)?.delete(callback)
    }

    /**
     * Emit event and invoke registered listeners
     */
    emit(event: string, data: unknown[]) {
        for (const f of this.events.get(event) || []) {
            try {
                Reflect.apply(f, null, data)
            } catch {}
        }
    }

    /**
     * Access primitive property on the sdk object.
     */
    getProperty<T = unknown>(key: string, pathname = this.pathname): Promise<T | null> {
        return createPromise((id) => sendEvent('web3BridgePrimitiveAccess', pathname, id, key))
    }
}
