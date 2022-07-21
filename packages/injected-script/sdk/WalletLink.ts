import { InjectedProvider } from './Base'
import { createRequest, sendEvent } from '../shared/rpc'

export class WalletLinkProvider extends InjectedProvider {
    constructor() {
        super('walletLinkExtension')
    }

    override connect(options: unknown): Promise<void> {
        return createRequest((id) => sendEvent('web3BridgeExecute', [this.pathname, 'enable'].join('.'), id, options))
    }
}
