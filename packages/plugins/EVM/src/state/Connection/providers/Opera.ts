import { injectedOperaProvider } from '@masknet/injected-script'
import { ChainId, chainResolver, EthereumMethodType, ProviderType } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types.js'
import { BaseInjectedProvider } from './BaseInjected.js'
import { toHex } from 'web3-utils'

export class OperaProvider extends BaseInjectedProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.Opera, injectedOperaProvider)
    }

    override get ready() {
        const isOpera = navigator.userAgent.includes('OPR/')
        if (!isOpera) return true
        return super.ready
    }

    override get readyPromise() {
        const isOpera = navigator.userAgent.includes('OPR/')
        if (!isOpera) return Promise.resolve(undefined)
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
