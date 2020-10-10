import { ChainId, ProviderType, EthereumNetwork } from '../../../web3/types'
import { getDefaultWallet } from '../../../plugins/Wallet/services'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../../settings/settings'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { PluginMessageCenter } from '../../../plugins/PluginMessages'
import { unreachable } from '../../../utils/utils'

//#region tracking default wallet
let defaultWallet: WalletRecord | null = null
const revalidate = async () => (defaultWallet = await getDefaultWallet())
PluginMessageCenter.on('maskbook.wallets.update', revalidate)
revalidate()
//#endregion

export async function getChainId() {
    if (!defaultWallet) return currentMaskbookChainIdSettings.value
    if (defaultWallet.provider === ProviderType.Maskbook) return currentMaskbookChainIdSettings.value
    if (defaultWallet.provider === ProviderType.MetaMask) return currentMetaMaskChainIdSettings.value
    if (defaultWallet.provider === ProviderType.WalletConnect) return currentWalletConnectChainIdSettings.value
    unreachable(defaultWallet.provider)
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
