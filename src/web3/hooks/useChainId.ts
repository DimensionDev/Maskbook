import { useValueRef } from '../../utils/hooks/useValueRef'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../settings/settings'
import { ProviderType } from '../types'
import type { WalletRecord } from '../../plugins/Wallet/database/types'
import { ValueRef } from '@holoflows/kit/es'
import { PluginMessageCenter } from '../../plugins/PluginMessages'
import Services from '../../extension/service'
import { WalletComparer } from '../../plugins/Wallet/helpers'
import { unreachable } from '../../utils/utils'

//#region cache service query result
const defaultWalletRef = new ValueRef<WalletRecord | null>(null, WalletComparer)
async function revalidate() {
    const wallets = await Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets')
    defaultWalletRef.value = wallets.find((x) => x._wallet_is_default) ?? wallets[0] ?? null
}
PluginMessageCenter.on('maskbook.wallets.update', revalidate)
revalidate()
//#endregion

/**
 * Get the chain id which is using by current wallet
 */
export function useChainId() {
    const wallet = useValueRef(defaultWalletRef)
    const maskbookChainId = useValueRef(currentMaskbookChainIdSettings)
    const metamaskChainId = useValueRef(currentMetaMaskChainIdSettings)
    const walletconnectChainId = useValueRef(currentWalletConnectChainIdSettings)
    if (!wallet) return maskbookChainId
    if (wallet.provider === ProviderType.Maskbook) return maskbookChainId
    if (wallet.provider === ProviderType.MetaMask) return metamaskChainId
    if (wallet.provider === ProviderType.WalletConnect) return walletconnectChainId
    unreachable(wallet.provider)
}
