import { BaseProvider } from './Base.js'
import { createPromise, sendEvent } from './utils.js'

export class BaseInjectedProvider extends BaseProvider {
    /**
     * Build the connection.
     */
    override connect(options: unknown): Promise<unknown> {
        return createPromise((id) => sendEvent('web3BridgeExecute', [this.pathname, 'connect'].join('.'), id, options))
    }

    /**
     * Break the connections.
     */
    override async disconnect(): Promise<void> {
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
    override async untilAvailable(validator: () => Promise<boolean> = () => Promise.resolve(true)): Promise<void> {
        await createPromise((id) => sendEvent('web3UntilBridgeOnline', this.pathname.split('.')[0], id))
        if (await validator()) {
            this.isReadyInternal = true
        }
    }

    /**
     * Send RPC request to the sdk object.
     */
    override request<T>(data: unknown): Promise<T> {
        return createPromise((id) => sendEvent('web3BridgeExecute', [this.pathname, 'request'].join('.'), id, data))
    }

    /**
     * Add event listener on the sdk object.
     */
    override on(event: string, callback: (...args: any) => void): () => void {
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
    override off(event: string, callback: (...args: any) => void): void {
        this.events.get(event)?.delete(callback)
    }

    /**
     * Emit event and invoke registered listeners
     */
    override emit(event: string, data: unknown[]) {
        for (const f of this.events.get(event) || []) {
            try {
                Reflect.apply(f, null, data)
            } catch {}
        }
    }
}
