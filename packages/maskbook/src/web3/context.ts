import { ChainId, Web3Context as Context } from '@dimensiondev/web3-shared'
import Services from '../extension/service'
import {
    currentCustomNetworkChainIdSettings,
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../plugins/Wallet/settings'
import { ProviderType } from './types'

let currentChain: ChainId = ChainId.Mainnet
export const Web3Context: Context = {
    currentChain: {
        getCurrentValue: () => currentChain,
        subscribe(f) {
            function listener() {
                Services.Ethereum.getChainId().then((chain) => {
                    currentChain = chain
                    f()
                })
            }
            const providers: Record<ProviderType, () => void> = {
                [ProviderType.Maskbook]: currentMaskbookChainIdSettings.addListener(listener),
                [ProviderType.MetaMask]: currentMetaMaskChainIdSettings.addListener(listener),
                [ProviderType.WalletConnect]: currentWalletConnectChainIdSettings.addListener(listener),
                [ProviderType.CustomNetwork]: currentCustomNetworkChainIdSettings.addListener(listener),
            }
            return () => {
                Object.values(providers).forEach((f) => f())
            }
        },
    },
}
