import { createPromise, sendEvent } from './utils.js'

export class BaseProvider {
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
        throw new Error('To be implemented.')
    }

    /**
     * Break the connections.
     */
    async disconnect(): Promise<void> {
        throw new Error('To be implemented.')
    }

    /**
     * Wait until the sdk object injected into the page.
     */
    async untilAvailable(validator: () => Promise<boolean> = () => Promise.resolve(true)): Promise<void> {
        return
    }

    /**
     * Send RPC request to the sdk object.
     */
    request<T>(data: unknown): Promise<T> {
        throw new Error('To be implemented.')
    }

    /**
     * Add event listener on the sdk object.
     */
    on(event: string, callback: (...args: any) => void): () => void {
        throw new Error('To be implemented.')
    }

    /**
     * Remove event listener from the sdk object.
     */
    off(event: string, callback: (...args: any) => void): void {
        throw new Error('To be implemented.')
    }

    /**
     * Emit event and invoke registered listeners
     */
    emit(event: string, data: unknown[]) {
        throw new Error('To be implemented.')
    }

    /**
     * Access primitive property on the sdk object.
     */
    getProperty<T = unknown>(key: string): Promise<T | null> {
        return createPromise((id) => sendEvent('web3BridgePrimitiveAccess', this.pathname, id, key))
    }
}
