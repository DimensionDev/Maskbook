import { ValueRef } from '@dimensiondev/holoflows-kit/es'
import { first } from 'lodash-es'
import { PluginMessageCenter } from '../../PluginMessages'
import Services from '../../../extension/service'
import type { ProviderType } from '../../../web3/types'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { WalletArrayComparer } from '../helpers'
import { isSameAddress } from '../../../web3/helpers'
import { currentSelectedWalletAddressSettings, currentSelectedWalletProviderSettings } from '../settings'
import type { WalletRecordDetailed } from '../database/types'

//#region tracking wallets
const walletsRef = new ValueRef<WalletRecordDetailed[]>([], WalletArrayComparer)
async function revalidate() {
    walletsRef.value = await Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets')
}
PluginMessageCenter.on('maskbook.wallets.update', revalidate)
revalidate()
//#endregion

export function useSelectedWallet() {
    const address = useValueRef(currentSelectedWalletAddressSettings)
    const provider = useValueRef(currentSelectedWalletProviderSettings)
    const wallets = useWallets()
    const wallet = wallets.find((x) => isSameAddress(x.address, address)) ?? first(wallets)
    return {
        ...wallet,
        provider,
    } as typeof wallet
}

export function useWallet(address: string) {
    const wallets = useWallets()
    return wallets.find((x) => isSameAddress(x.address, address))
}

export function useWallets(provider?: ProviderType) {
    const wallets = useValueRef(walletsRef)
    if (typeof provider === 'undefined') return wallets
    return wallets.filter((x) => x.provider === provider).sort((a, z) => a.updatedAt.getTime() - z.updatedAt.getTime())
}
