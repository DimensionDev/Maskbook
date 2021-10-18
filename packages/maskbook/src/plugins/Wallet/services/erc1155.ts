import { createTransaction } from '../../../database/helpers/openDB'
import { createWalletDBAccess } from '../database/Wallet.db'
import { WalletMessages } from '../messages'
import { assert } from '../../../utils/utils'
import type { ERC1155TokenDetailed } from '@masknet/web3-shared-evm'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { ERC1155TokenRecordIntoDB, getWalletByAddress, WalletRecordIntoDB } from './helpers'

export async function getERC1155Tokens() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC1155Token', 'Wallet')
    return t.objectStore('ERC1155Token').getAll()
}

export async function addERC1155Token(token: ERC1155TokenDetailed) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC1155Token', 'Wallet')
    await t.objectStore('ERC1155Token').put(ERC1155TokenRecordIntoDB(token))
    WalletMessages.events.erc1155TokensUpdated.sendToAll(undefined)
}

export async function removeERC1155Token(token: PartialRequired<ERC1155TokenDetailed, 'address'>) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC1155Token', 'Wallet')
    await t.objectStore('ERC1155Token').delete(formatEthereumAddress(token.address))
    WalletMessages.events.erc1155TokensUpdated.sendToAll(undefined)
}

export async function trustERC1155Token(
    address: string,
    token: PartialRequired<ERC1155TokenDetailed, 'address' | 'tokenId'>,
) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC1155Token', 'Wallet')
    const wallet = await getWalletByAddress(t, formatEthereumAddress(address))
    assert(wallet)
    let updated = false
    const key = `${formatEthereumAddress(token.address)}_${token.tokenId}`
    if (!wallet.erc1155_token_whitelist.has(key)) {
        wallet.erc1155_token_whitelist.add(key)
        updated = true
    }
    if (wallet.erc1155_token_blacklist.has(key)) {
        wallet.erc1155_token_blacklist.delete(key)
        updated = true
    }
    if (!updated) return false
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
    return updated
}

export async function blockERC1155Token(
    address: string,
    token: PartialRequired<ERC1155TokenDetailed, 'address' | 'tokenId'>,
) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC1155Token', 'Wallet')
    const wallet = await getWalletByAddress(t, formatEthereumAddress(address))
    assert(wallet)
    let updated = false
    const key = `${formatEthereumAddress(token.address)}_${token.tokenId}`
    if (wallet.erc1155_token_whitelist.has(key)) {
        wallet.erc1155_token_whitelist.delete(key)
        updated = true
    }
    if (!wallet.erc1155_token_blacklist.has(key)) {
        wallet.erc1155_token_blacklist.add(key)
        updated = true
    }
    if (!updated) return
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}
