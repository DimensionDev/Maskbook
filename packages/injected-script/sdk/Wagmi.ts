import { type RequestArguments } from '../shared/index.js'
import { createPromise, sendEvent } from './utils.js'

export class WagmiProvider {
    protected events = new Map<string, Set<(data: unknown) => void>>()
    protected isReadyInternal = false

    constructor(
        public providerType: string,
        public pathname?: string,
    ) {}

    get isReady() {
        return this.isReadyInternal
    }

    connect(chainId?: number): Promise<unknown> {
        return createPromise((id) => sendEvent('wagmiExecute', this.providerType, id, 'connect', [chainId]))
    }

    disconnect() {
        return createPromise((id) => sendEvent('wagmiExecute', this.providerType, id, 'disconnect', []))
    }

    /**
     * Wait until the sdk object injected into the page.
     */
    async untilAvailable(validator: () => Promise<boolean> = () => Promise.resolve(true)): Promise<void> {
        const pathname = this.pathname

        if (!pathname) {
            this.isReadyInternal = true
            return
        }

        await createPromise((id) => sendEvent('web3UntilBridgeOnline', pathname.split('.')[0], id))
        if (await validator()) {
            this.isReadyInternal = true
        }
    }

    /**
     * Send RPC request to the sdk object.
     */
    async request<T>(requestArguments: RequestArguments): Promise<T> {
        console.log('DEBUG: requestArguments', requestArguments)

        switch (requestArguments.method) {
            case 'eth_chainId':
                const network = await createPromise<{ chain?: { chainId: number } }>((id) =>
                    sendEvent('wagmiExecute', this.providerType, id, 'getNetwork', []),
                )
                if (!network.chain) throw new Error('No connection found.')
                return `0x${network.chain.chainId.toString(16)}` as T
            default:
                throw new Error('To be implemented - request.')
        }
    }

    /**
     * Add event listener on the sdk object.
     */
    on(event_: string, callback: (...args: any) => void): () => void {
        const event = `${this.providerType}:${event_}`
        if (!this.events.has(event)) this.events.set(event, new Set())
        const set = this.events.get(event)!
        set.add(callback)
        return () => void set.delete(callback)
    }

    /**
     * Remove event listener from the sdk object.
     */
    off(event_: string, callback: (...args: any) => void): void {
        const event = `${this.providerType}:${event_}`
        this.events.get(event)?.delete(callback)
    }

    /**
     * Emit event and invoke registered listeners
     */
    emit(event_: string, data: unknown[]) {
        const event = `${this.providerType}:${event_}`
        for (const f of this.events.get(event) || []) {
            try {
                Reflect.apply(f, null, data)
            } catch {}
        }
    }

    /**
     * Access primitive property on the sdk object.
     */
    getProperty<T = unknown>(key: string): Promise<T | null> {
        const pathname = this.pathname
        if (!pathname) throw new Error('No pathname found.')
        return createPromise((id) => sendEvent('web3BridgePrimitiveAccess', pathname, id, key))
    }
}
