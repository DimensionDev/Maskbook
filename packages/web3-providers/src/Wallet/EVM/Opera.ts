import { toHex } from 'web3-utils'
import { injectedOperaProvider } from '@masknet/injected-script'
import {
    type ChainId,
    chainResolver,
    EthereumMethodType,
    ProviderType,
    type Web3Provider,
    type Web3,
} from '@masknet/web3-shared-evm'
import { BaseInjectedProvider } from './BaseInjected.js'
import type { WalletAPI } from '../../entry-types.js'

export class OperaProvider
    extends BaseInjectedProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    private isOpera() {
        return navigator.userAgent.includes('OPR/')
    }

    constructor() {
        super(ProviderType.Opera, injectedOperaProvider)
    }

    override get ready() {
        if (!this.isOpera) return true
        return super.ready
    }

    override get readyPromise() {
        if (!this.isOpera) return Promise.resolve(undefined)
        return super.readyPromise
    }

    override async switchChain(chainId?: ChainId): Promise<void> {
        if (!chainId) throw new Error(`Failed to switch to ${chainResolver.chainFullName(chainId)}.`)
        await this.request({
            method: EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN,
            params: [
                {
                    chainId: toHex(chainId),
                },
            ],
        })
    }
}
