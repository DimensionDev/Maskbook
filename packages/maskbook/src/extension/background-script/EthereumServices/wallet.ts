import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import { getWallets } from '../../../plugins/Wallet/services'
import { currentSelectedWalletAddressSettings } from '../../../plugins/Wallet/settings'
import { startEffects } from '../../../utils/side-effects'
import { isSameAddress } from '../../../web3/helpers'

const effect = startEffects(module.hot)

//#region tracking wallets
let wallets: WalletRecord[] = []
const revalidateWallets = async () => {
    wallets = await getWallets()
}
effect(() => WalletMessages.events.walletsUpdated.on(revalidateWallets))
revalidateWallets()
//#endregion

export function getWalletCached(address = currentSelectedWalletAddressSettings.value) {
    return wallets.find((x) => isSameAddress(x.address, address))
}

export function getWalletsCached() {
    return wallets
}
