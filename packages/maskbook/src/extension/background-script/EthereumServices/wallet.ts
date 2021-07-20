import { currySameAddress } from '@masknet/web3-shared'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import { getWallets } from '../../../plugins/Wallet/services'
import { currentAccountSettings } from '../../../plugins/Wallet/settings'
import { startEffects } from '../../../utils/side-effects'

const effect = startEffects(import.meta.webpackHot)

//#region tracking wallets
let wallets: WalletRecord[] = []
const revalidateWallets = async () => {
    wallets = await getWallets()
}
effect(() => WalletMessages.events.walletsUpdated.on(revalidateWallets))
revalidateWallets()
//#endregion

export function getWalletCached(address = currentAccountSettings.value) {
    return wallets.find(currySameAddress(address))
}

export function getWalletsCached() {
    return wallets
}
