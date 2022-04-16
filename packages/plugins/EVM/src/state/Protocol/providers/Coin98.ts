import { isExtensionSiteType } from '@masknet/shared-base'
import type { EIP1193Provider } from '@masknet/web3-shared-evm'
import type { Provider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class Coin98Provider extends BaseInjectedProvider implements Provider {
    constructor() {
        super('coin98')
    }

    protected override createEIP1193Provider() {
        if (isExtensionSiteType()) return null
        this.provider = Reflect.get(Reflect.get(window, 'coin98'), 'provider') as EIP1193Provider
        this.provider.on('accountsChanged', this.onAccountsChanged.bind(this))
        this.provider.on('chainChanged', this.onChainChanged.bind(this))
        return this.provider
    }
}
