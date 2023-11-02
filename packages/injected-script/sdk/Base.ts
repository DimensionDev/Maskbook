export abstract class BaseProvider {
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
    abstract connect(options: unknown): Promise<unknown>

    /**
     * Break the connections.
     */
    abstract disconnect(): Promise<void>

    /**
     * Wait until the sdk object injected into the page.
     */
    abstract untilAvailable(validator?: () => Promise<boolean>): Promise<void>

    /**
     * Send RPC request to the sdk object.
     */
    abstract request<T>(data: unknown): Promise<T>

    /**
     * Add event listener on the sdk object.
     */
    abstract on(event: string, callback: (...args: any) => void): () => void

    /**
     * Remove event listener from the sdk object.
     */
    abstract off(event: string, callback: (...args: any) => void): void

    /**
     * Emit event and invoke registered listeners
     */
    abstract emit(event: string, data: unknown[]): void

    /**
     * Access primitive property on the sdk object.
     */
    abstract getProperty<T = unknown>(key: string): Promise<T | null>
}
