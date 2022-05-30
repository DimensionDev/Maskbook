import { InjectedProvider } from './Base'
import { createPromise, sendEvent } from './utils'

export class WalletLinkProvider extends InjectedProvider {
    constructor() {
        super('walletLinkExtension')
    }

    override connect(options: unknown): Promise<void> {
        return createPromise((id) => sendEvent('web3BridgeExecute', [this.pathname, 'enable'].join('.'), id, options))
    }
}
