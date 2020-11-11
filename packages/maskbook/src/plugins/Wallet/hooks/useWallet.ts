import { ValueRef } from '@dimensiondev/holoflows-kit/es'
import { first } from 'lodash-es'
import { PluginMessageCenter } from '../../PluginMessages'
import Services from '../../../extension/service'
import { ProviderType } from '../../../web3/types'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { WalletRecord } from '../database/types'
import { WalletArrayComparer } from '../helpers'
import { isSameAddress } from '../../../web3/helpers'
import { currentSelectedWalletAddressSettings } from '../settings'
import { currentMetaMaskConnectedSettings, currentWalletConnectConnectedSettings } from '../../../settings/settings'

//#region tracking wallets
const walletsRef = new ValueRef<WalletRecord[]>([], WalletArrayComparer)
async function revalidate() {
    walletsRef.value = await Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets')
}
PluginMessageCenter.on('maskbook.wallets.update', revalidate)
revalidate()
//#endregion

export function useWallet() {
    const address = useValueRef(currentSelectedWalletAddressSettings)
    const wallets = useWallets()
    return wallets.find((x) => isSameAddress(x.address, address)) ?? first(wallets)
}

export function useWalletConnected() {
    const MetaMaskConnected = useValueRef(currentMetaMaskConnectedSettings)
    const WalletConnectConnected = useValueRef(currentWalletConnectConnectedSettings)
    const wallet = useWallet()
    if (!wallet) return false
    if (wallet.provider === ProviderType.Maskbook) return true
    if (wallet.provider === ProviderType.MetaMask) return MetaMaskConnected
    if (wallet.provider === ProviderType.WalletConnect) return WalletConnectConnected
    return false
}

export function useWallets(provider?: ProviderType) {
    const wallets = useValueRef(walletsRef)
    if (typeof provider === 'undefined') return wallets
    return wallets.filter((x) => x.provider === provider).sort((a, z) => a.updatedAt.getTime() - z.updatedAt.getTime())
}
