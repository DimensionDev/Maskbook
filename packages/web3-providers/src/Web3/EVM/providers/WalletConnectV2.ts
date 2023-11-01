import { ProviderType, type ChainId, isValidChainId, type Web3, type Web3Provider } from '@masknet/web3-shared-evm'
import { BaseWagmiProvider } from './BaseWagmi.js'
import type { WalletAPI } from '../../../entry-types.js'
import { wagmiWalletConnectProvider } from '@masknet/injected-script'

export class WalletConnectV2Provider
    extends BaseWagmiProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    constructor() {
        super(ProviderType.WalletConnectV2, wagmiWalletConnectProvider)
    }

    override async switchChain(chainId: ChainId): Promise<void> {
        if (!isValidChainId(chainId)) throw new Error('Invalid chain id.')

        let clean: () => boolean | undefined
        return new Promise<void>((resolve, reject) => {
            super.switchChain(chainId).catch((error) => {
                reject(error)
            })
            clean = this.emitter.on('chainId', () => {
                resolve()
            })
        }).finally(() => {
            clean?.()
        })
    }
}
