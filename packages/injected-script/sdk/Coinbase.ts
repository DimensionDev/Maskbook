import { InjectedProvider } from './Base.js'
import { createPromise, sendEvent } from './utils.js'

export class CoinbaseProvider extends InjectedProvider {
    constructor() {
        super('coinbaseWalletExtension')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(async () => {
            const isCoinbaseWallet = await super.getProperty<boolean>('isCoinbaseWallet')
            return isCoinbaseWallet
        })
    }

    override connect(options: unknown): Promise<void> {
        return createPromise((id) => sendEvent('web3BridgeExecute', [this.pathname, 'enable'].join('.'), id, options))
    }
}
