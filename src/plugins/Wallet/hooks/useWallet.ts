import { ValueRef } from '@holoflows/kit/es'
import { PluginMessageCenter } from '../../PluginMessages'
import Services from '../../../extension/service'
import type { ProviderType } from '../../../web3/types'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { WalletRecord } from '../database/types'
import { WalletArrayComparer, WalletComparer } from '../helpers'
import { isSameAddress } from '../../../web3/helpers'

//#region tracking wallets
const defaultWalletRef = new ValueRef<WalletRecord | null>(null, WalletComparer)
const walletsRef = new ValueRef<WalletRecord[]>([], WalletArrayComparer)

async function revalidate() {
    const wallets = await Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets')
    walletsRef.value = wallets
    defaultWalletRef.value = wallets.find((x) => x._wallet_is_default) ?? wallets[0] ?? null
}
PluginMessageCenter.on('maskbook.wallets.update', revalidate)
revalidate()
//#endregion

export function useDefaultWallet() {
    return useValueRef(defaultWalletRef)
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
