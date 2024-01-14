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
        const stack = new Error().stack?.replace(/^Error\n/, '')
        const result = await contentScript.eth_request(param)
        if (result.e) {
            result.e.stack = `MaskEthereumProviderRpcError: ${result.e.message}\n${stack}`
            throw result.e
        }
        return result.d
    }
}
export const ethereum = new MaskProvider()

const detail: Ethereum.EIP6963ProviderDetail = {
    info: {
        // MetaMask generate a random UUID each connect
        uuid: crypto.randomUUID(),
        name: 'Mask Wallet',
        rdns: 'io.mask',
        icon: String(image),
    },
    provider: ethereum,
}
Object.freeze(detail)
Object.freeze(detail.info)
const event = () => new CustomEvent('eip6963:announceProvider', { detail })

window.dispatchEvent(event())
window.addEventListener('eip6963:requestProvider', () => window.dispatchEvent(event()))
