import { contentScript } from './bridge.js'

class EthereumEventEmitter extends EventTarget implements Mask.Ethereum.MaskEthereumEventEmitter {
    #mapping = new WeakMap()
    #getMappedFunction(listener: unknown) {
        if (typeof listener !== 'function') return undefined
        if (!this.#mapping.has(listener)) {
            const mapped = (event: CustomEvent<unknown>) => {
                listener(event.detail)
            }
            this.#mapping.set(listener, mapped)
            return mapped
        }
        return this.#mapping.get(listener)
    }
    on(eventName: string | symbol, listener: (...args: any[]) => void): this {
        if (typeof eventName === 'symbol') return this
        const f = this.#getMappedFunction(listener)
        if (!f) return this
        super.addEventListener(eventName, f)
        return this
    }
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        if (typeof eventName === 'symbol') return this
        super.removeEventListener(eventName, this.#getMappedFunction(listener))
        return this
    }
}
class MaskProvider extends EthereumEventEmitter implements Mask.Ethereum.ProviderObject {
    async request(param: any): Promise<any> {
        return contentScript.eth_request(param)
    }
}
export const ethereum = new MaskProvider()
