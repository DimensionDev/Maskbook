import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { Sniffings } from '@masknet/shared-base'
import { injectedOperaProvider } from '@masknet/injected-script'
import { type ChainId, EthereumMethodType, ProviderType, isValidChainId } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

export class OperaProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.Opera, injectedOperaProvider)
    }

    override get ready() {
        if (Sniffings.is_opera) return true
        return super.ready
    }

    override get readyPromise() {
        if (Sniffings.is_opera) return Promise.resolve()
        return super.readyPromise
    }

    override async switchChain(chainId: ChainId): Promise<void> {
        if (!isValidChainId(chainId)) throw new Error('Invalid chain id.')

        await this.request({
            method: EthereumMethodType.wallet_switchEthereumChain,
            params: [
                {
                    chainId: web3_utils.toHex(chainId),
                },
            ],
        })
    }
}
