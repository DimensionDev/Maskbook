import { first } from 'lodash'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { WalletMessages, WalletRPC } from '../messages'
import { ProviderType } from '../../../web3/types'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { WalletRecord } from '../database/types'
import { WalletArrayComparer } from '../helpers'
import { isSameAddress } from '../../../web3/helpers'
import { currentSelectedWalletAddressSettings, currentSelectedWalletProviderSettings } from '../settings'

//#region tracking wallets
const walletsRef = new ValueRef<WalletRecord[]>([], WalletArrayComparer)
async function revalidate() {
    walletsRef.value = await WalletRPC.getWallets()
}
WalletMessages.events.walletsUpdated.on(revalidate)
revalidate()
//#endregion

export function useWallet(address?: string) {
    const address_ = useValueRef(currentSelectedWalletAddressSettings)
    const wallets = useWallets()
    return wallets.find((x) => isSameAddress(x.address, address ?? address_))
}

export function useWallets(provider?: ProviderType) {
    const wallets = useValueRef(walletsRef)
    const selectedWalletProvider = useValueRef(currentSelectedWalletProviderSettings)
    if (provider === ProviderType.Maskbook) return wallets.filter((x) => x._private_key_ || x.mnemonic.length)
    if (provider === selectedWalletProvider)
        return wallets.filter((x) => isSameAddress(x.address, selectedWalletProvider))
    if (provider) return []
    return wallets
}

export function useWalletHD() {
    const wallets = useWallets()
    const selectedWallet = useWallet()
    // the select wallet is a HD wallet
    if (selectedWallet?.mnemonic.length) return selectedWallet
    // the earliest HD wallet
    return (
        first(wallets.filter((x) => x.mnemonic.length).sort((a, z) => a.createdAt.getTime() - z.createdAt.getTime())) ??
        null
    )
}
