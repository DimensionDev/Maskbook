import { ChainId, Wallet, Web3Context as Context } from '@dimensiondev/web3-shared'
import Services from '../extension/service'
import { WalletMessages, WalletRPC } from '../plugins/Wallet/messages'
import {
    currentCustomNetworkChainIdSettings,
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentSelectedWalletProviderSettings,
    currentWalletConnectChainIdSettings,
} from '../plugins/Wallet/settings'
import { ProviderType } from './types'

let currentChain: ChainId = ChainId.Mainnet
let wallets: Wallet[] = []
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
    walletProvider: {
        getCurrentValue: () => currentSelectedWalletProviderSettings.value,
        subscribe: (f) => currentSelectedWalletProviderSettings.addListener(f),
    },
    wallets: {
        getCurrentValue: () => wallets,
        subscribe: (f) =>
            WalletMessages.events.walletsUpdated.on(async () => {
                const raw = await WalletRPC.getWallets()
                wallets = raw.map<Wallet>(({ address, name, _private_key_, mnemonic }) => ({
                    address,
                    name,
                    hasPrivateKey: Boolean(_private_key_ || mnemonic),
                }))
                f()
            }),
    },
}
