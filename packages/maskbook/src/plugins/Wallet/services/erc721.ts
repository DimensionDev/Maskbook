import Fuse from 'fuse.js'
import { EthereumAddress } from 'wallet.ts'
import { ERC721TokenDetailed, formatEthereumAddress, isSameAddress } from '@masknet/web3-shared-evm'
import { createTransaction } from '../../../database/helpers/openDB'
import { createWalletDBAccess } from '../database/Wallet.db'
import { WalletMessages } from '../messages'
import { assert } from '../../../utils/utils'
import {
    ERC721TokenRecordIntoDB,
    ERC721TokenRecordOutDB,
    getERC721TokenRecordIntoDBKey,
    getWalletByAddress,
    WalletRecordIntoDB,
} from './helpers'
import { queryTransactionPaged } from '../../../database/helpers/pagination'

export async function getERC721Tokens() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC721Token')
    return t.objectStore('ERC721Token').getAll()
}

export async function getERC721Token(address: string, tokenId: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC721Token')
    return t.objectStore('ERC721Token').get(getERC721TokenRecordIntoDBKey(address, tokenId))
}

const fuse = new Fuse([] as ERC721TokenDetailed[], {
    shouldSort: true,
    threshold: 0.45,
    minMatchCharLength: 1,
    keys: [
        { name: 'name', weight: 0.8 },
        { name: 'symbol', weight: 0.2 },
    ],
})

export async function getERC721TokensPaged(index: number, count: number, query?: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC721Token')
    const records = await queryTransactionPaged(t, 'ERC721Token', {
        skip: index * count,
        count,
        predicate: (record) => {
            if (!query) return true
            if (EthereumAddress.isValid(query) && !isSameAddress(query, record.contractDetailed.address)) return false
            fuse.setCollection([record])
            return !!fuse.search(query).length
        },
    })
    return records.map(ERC721TokenRecordOutDB)
}

export async function addERC721Token(token: ERC721TokenDetailed) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC721Token', 'Wallet')
    await t.objectStore('ERC721Token').put(ERC721TokenRecordIntoDB(token))
    WalletMessages.events.erc721TokensUpdated.sendToAll(undefined)
}

export async function removeERC721Token(token: ERC721TokenDetailed) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC721Token', 'Wallet')
    await t.objectStore('ERC721Token').delete(ERC721TokenRecordIntoDB(token).record_id)
    WalletMessages.events.erc721TokensUpdated.sendToAll(undefined)
}

export async function trustERC721Token(address: string, token: ERC721TokenDetailed) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC721Token', 'Wallet')
    const wallet = await getWalletByAddress(t, formatEthereumAddress(address))
    assert(wallet)
    let updated = false
    const key = `${formatEthereumAddress(token.contractDetailed.address)}_${token.tokenId}`
    if (!wallet.erc721_token_whitelist.has(key)) {
        wallet.erc721_token_whitelist.add(key)
        updated = true
    }
    if (wallet.erc721_token_blacklist.has(key)) {
        wallet.erc721_token_blacklist.delete(key)
        updated = true
    }
    if (!updated) return false
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
    return updated
}

export async function blockERC721Token(address: string, token: ERC721TokenDetailed) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC721Token', 'Wallet')
    const wallet = await getWalletByAddress(t, formatEthereumAddress(address))
    assert(wallet)
    let updated = false
    const key = `${formatEthereumAddress(token.contractDetailed.address)}_${token.tokenId}`
    if (wallet.erc721_token_whitelist.has(key)) {
        wallet.erc721_token_whitelist.delete(key)
        updated = true
    }
    if (!wallet.erc721_token_blacklist.has(key)) {
        wallet.erc721_token_blacklist.add(key)
        updated = true
    }
    if (!updated) return
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}
