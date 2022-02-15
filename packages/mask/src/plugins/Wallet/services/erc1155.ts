import { ERC1155TokenDetailed, formatEthereumAddress } from '@masknet/web3-shared-evm'
import * as backgroundService from '@masknet/background-service'
import { createWalletDBAccess } from '../database/Wallet.db'
import { WalletMessages } from '../messages'
import { ERC1155TokenRecordIntoDB } from './helpers'

/** @deprecated */
export async function getERC1155Tokens() {
    const t = backgroundService.createTransaction(await createWalletDBAccess(), 'readonly')('ERC1155Token', 'Wallet')
    return t.objectStore('ERC1155Token').getAll()
}

/** @deprecated */
export async function addERC1155Token(token: ERC1155TokenDetailed) {
    const t = backgroundService.createTransaction(await createWalletDBAccess(), 'readwrite')('ERC1155Token', 'Wallet')
    await t.objectStore('ERC1155Token').put(ERC1155TokenRecordIntoDB(token))
    WalletMessages.events.erc1155TokensUpdated.sendToAll(undefined)
}

/** @deprecated */
export async function removeERC1155Token(token: PartialRequired<ERC1155TokenDetailed, 'address'>) {
    const t = backgroundService.createTransaction(await createWalletDBAccess(), 'readwrite')('ERC1155Token', 'Wallet')
    await t.objectStore('ERC1155Token').delete(formatEthereumAddress(token.address))
    WalletMessages.events.erc1155TokensUpdated.sendToAll(undefined)
}
