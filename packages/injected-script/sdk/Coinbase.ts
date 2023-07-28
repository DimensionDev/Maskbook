import { InjectedProvider } from './Base.js'
import { createPromise, sendEvent } from './utils.js'

export class CoinbaseProvider extends InjectedProvider {
    constructor() {
        super('coinbaseWalletExtension')
    }

    override connect(options: unknown): Promise<void> {
        return createPromise((id) => sendEvent('web3BridgeExecute', [this.pathname, 'enable'].join('.'), id, options))
    }
}
