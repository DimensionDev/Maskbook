import { ValueRef } from '@dimensiondev/holoflows-kit'
import { first } from 'lodash-es'
import { WalletMessages, WalletRPC } from '../messages'
import type { ProviderType } from '../../../web3/types'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { WalletRecord } from '../database/types'
import { WalletArrayComparer } from '../helpers'
import { isSameAddress } from '../../../web3/helpers'
import { currentSelectedWalletAddressSettings } from '../settings'

//#region tracking wallets
const walletsRef = new ValueRef<WalletRecord[]>([], WalletArrayComparer)
async function revalidate() {
    walletsRef.value = await WalletRPC.getWallets()
}
WalletMessages.events.walletsUpdated.on(revalidate)
revalidate()
//#endregion

export function useSelectedWallet() {
    const address = useValueRef(currentSelectedWalletAddressSettings)
    const wallets = useWallets()
    return wallets.find((x) => isSameAddress(x.address, address)) ?? first(wallets)
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
