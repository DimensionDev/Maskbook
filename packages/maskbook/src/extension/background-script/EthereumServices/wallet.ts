import { currySameAddress } from '@masknet/web3-shared'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { WalletMessages, WalletRPC } from '../../../plugins/Wallet/messages'
import { currentAccountSettings } from '../../../plugins/Wallet/settings'
import { startEffects } from '../../../utils/side-effects'

const effect = startEffects(import.meta.webpackHot)

//#region tracking wallets
let wallets: WalletRecord[] = []
const revalidateWallets = async () => {
    wallets = await WalletRPC.getWallets()
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
