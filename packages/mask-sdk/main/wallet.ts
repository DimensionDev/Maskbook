import { contentScript } from './bridge.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import image from '../../icons/brands/MaskBlue.svg'
import type { Ethereum } from '../public-api/mask-wallet.js'

class EthereumEventEmitter extends EventTarget implements Ethereum.MaskEthereumEventEmitter {
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
class MaskProvider extends EthereumEventEmitter implements Ethereum.ProviderObject {
    async request(param: any): Promise<any> {
        return contentScript.eth_request(param)
    }
}
export const ethereum = new MaskProvider()

{
    const detail: Ethereum.EIP6963ProviderDetail = {
        info: {
            uuid: 'f113ee3f-49e3-4576-8f77-c3991d82af41',
            name: 'Mask Wallet',
            rdns: 'io.mask',
            icon: String(image),
        },
        provider: ethereum,
    }
    Object.freeze(detail)
    Object.freeze(detail.info)
    const event = new CustomEvent('eip6963:announceProvider', { detail })

    window.dispatchEvent(event)
    window.addEventListener('eip6963:requestProvider', () => window.dispatchEvent(event))
}
