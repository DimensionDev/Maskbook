import type { TransactionConfig } from 'web3-core'
import { web3 } from '../../../plugins/Wallet/web3'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { getWallets } from '../../../plugins/Wallet/wallet'
import { PluginMessageCenter } from '../../../plugins/PluginMessages'
import { isSameAddr } from '../../../plugins/Wallet/token'

//#region tracking wallets
let wallets: WalletRecord[] = []
const resetWallet = async () => (wallets = await getWallets())
PluginMessageCenter.on('maskbook.wallets.reset', resetWallet)
//#endregion

export async function callTransaction(from: string, config: TransactionConfig) {
    const wallet = wallets.find((x) => isSameAddr(x.address, from))
    if (!wallet) throw new Error('the wallet does not exists')

    return web3.eth.call(config)
}
