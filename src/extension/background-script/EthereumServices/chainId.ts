import { ChainId, ProviderType, EthereumNetwork } from '../../../web3/types'
import { getDefaultWallet } from '../../../plugins/Wallet/wallet'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../../settings/settings'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { PluginMessageCenter } from '../../../plugins/PluginMessages'

//#region tracking default wallet
let defaultWallet: WalletRecord | null = null
const updateDefaultWallet = async () => (defaultWallet = await getDefaultWallet())
PluginMessageCenter.on('maskbook.wallets.update', updateDefaultWallet)
updateDefaultWallet()
//#endregion

export async function getChainId() {
    if (defaultWallet?.provider === ProviderType.Maskbook) return currentMaskbookChainIdSettings.value
    if (defaultWallet?.provider === ProviderType.MetaMask) return currentMetaMaskChainIdSettings.value
    if (defaultWallet?.provider === ProviderType.WalletConnect) return currentWalletConnectChainIdSettings.value
    return ChainId.Mainnet
}

export async function getLegacyEthereumNetwork() {
    const chainId = await getChainId()
    switch (chainId) {
        case ChainId.Ropsten:
            return EthereumNetwork.Ropsten
        case ChainId.Rinkeby:
            return EthereumNetwork.Rinkeby
        default:
            return EthereumNetwork.Mainnet
    }
}
