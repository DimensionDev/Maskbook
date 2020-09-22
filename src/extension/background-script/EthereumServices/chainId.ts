import { ChainId, ProviderType } from '../../../web3/types'
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
const resetWallet = async () => (defaultWallet = await getDefaultWallet())
PluginMessageCenter.on('maskbook.wallets.reset', resetWallet)
//#endregion

export function getChainId() {
    if (defaultWallet?.provider === ProviderType.Maskbook) return currentMaskbookChainIdSettings.value
    if (defaultWallet?.provider === ProviderType.MetaMask) return currentMetaMaskChainIdSettings.value
    if (defaultWallet?.provider === ProviderType.WalletConnect) return currentWalletConnectChainIdSettings.value
    return ChainId.Mainnet
}
