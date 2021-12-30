import Fuse from 'fuse.js'
import { EthereumAddress } from 'wallet.ts'
import { ERC721TokenDetailed, isSameAddress } from '@masknet/web3-shared-evm'
import { createTransaction } from '../../../../background/database/utils/openDB'
import { createWalletDBAccess } from '../database/Wallet.db'
import { WalletMessages } from '../messages'
import { ERC721TokenRecordIntoDB, ERC721TokenRecordOutDB, getERC721TokenRecordIntoDBKey } from './helpers'
import { queryTransactionPaged } from '../../../database/helpers/pagination'

/** @deprecated */
export async function getERC721Tokens() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC721Token')
    return t.objectStore('ERC721Token').getAll()
}

/** @deprecated */
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

/** @deprecated */
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

/** @deprecated */
export async function addERC721Token(token: ERC721TokenDetailed) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC721Token', 'Wallet')
    await t.objectStore('ERC721Token').put(ERC721TokenRecordIntoDB(token))
    WalletMessages.events.erc721TokensUpdated.sendToAll(undefined)
}

/** @deprecated */
export async function removeERC721Token(token: ERC721TokenDetailed) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC721Token', 'Wallet')
    await t.objectStore('ERC721Token').delete(ERC721TokenRecordIntoDB(token).record_id)
    WalletMessages.events.erc721TokensUpdated.sendToAll(undefined)
}
