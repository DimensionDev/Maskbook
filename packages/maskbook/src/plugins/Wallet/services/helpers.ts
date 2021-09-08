import { omit } from 'lodash-es'
import type { IDBPSafeTransaction } from '../../../database/helpers/openDB'
import type { WalletDB } from '../database/Wallet.db'
import type {
    ERC1155TokenRecord,
    ERC1155TokenRecordInDatabase,
    ERC20TokenRecord,
    ERC20TokenRecordInDatabase,
    PhraseRecord,
    PhraseRecordInDatabase,
    TransactionChunkRecord,
    TransactionChunkRecordInDatabase,
    WalletRecord,
    WalletRecordInDatabase,
} from '../database/types'
import {
    ChainId,
    formatEthereumAddress,
    getChainIdFromName,
    ERC721TokenDetailed,
    ERC721TokenRecordInDatabase,
} from '@masknet/web3-shared'

export async function getWalletByAddress(t: IDBPSafeTransaction<WalletDB, ['Wallet'], 'readonly'>, address: string) {
    const record = await t.objectStore('Wallet').get(formatEthereumAddress(address))
    return record ? WalletRecordOutDB(record) : null
}

export function WalletRecordIntoDB(x: WalletRecord) {
    const record = x as WalletRecordInDatabase
    record.address = formatEthereumAddress(x.address)
    return record
}

export function WalletRecordOutDB(x: WalletRecordInDatabase) {
    const record = x as WalletRecord
    record.address = formatEthereumAddress(record.address)
    record.erc20_token_whitelist = x.erc20_token_whitelist ?? new Set()
    record.erc20_token_blacklist = x.erc20_token_blacklist ?? new Set()
    record.erc721_token_whitelist = x.erc721_token_whitelist ?? new Set()
    record.erc721_token_blacklist = x.erc721_token_blacklist ?? new Set()
    record.erc1155_token_whitelist = x.erc1155_token_whitelist ?? new Set()
    record.erc1155_token_blacklist = x.erc1155_token_blacklist ?? new Set()
    return record
}

export function PhraseRecordIntoDB(x: PhraseRecord) {
    return x as PhraseRecordInDatabase
}

export function PhraseRecordOutDB(x: PhraseRecordInDatabase) {
    return x as PhraseRecord
}

export function ERC20TokenRecordIntoDB(x: ERC20TokenRecord) {
    x.address = formatEthereumAddress(x.address)
    return x as ERC20TokenRecordInDatabase
}

export function ERC20TokenRecordOutDB(x: ERC20TokenRecordInDatabase) {
    const record = x as ERC20TokenRecord
    {
        // fix: network has been renamed to chainId
        const record_ = record as any
        if (!record.chainId) record.chainId = getChainIdFromName(record_.network) ?? ChainId.Mainnet
    }
    record.address = formatEthereumAddress(record.address)
    return record
}

export function getERC721TokenRecordIntoDBKey(address: string, tokenId: string) {
    return `${formatEthereumAddress(address)}_${tokenId}`
}

export function ERC721TokenRecordIntoDB(x: ERC721TokenDetailed) {
    const record: ERC721TokenRecordInDatabase = {
        ...x,
        // NFT cannot be divided and store each token separately
        record_id: getERC721TokenRecordIntoDBKey(x.contractDetailed.address, x.tokenId),
    }
    return record
}

export function ERC721TokenRecordOutDB(x: ERC721TokenRecordInDatabase) {
    const record: ERC721TokenDetailed = omit(x, 'record_id')
    return record
}

export function ERC1155TokenRecordIntoDB(x: ERC1155TokenRecord) {
    const record: ERC1155TokenRecordInDatabase = {
        ...x,
        // NFT cannot be divided and store each token separately
        record_id: `${formatEthereumAddress(x.address)}_${x.tokenId}`,
    }
    return record
}

export function ERC1155TokenRecordOutDB(x: ERC1155TokenRecordInDatabase) {
    const record: ERC1155TokenRecord = omit(x, 'record_id')
    return record
}

export function TransactionChunkRecordIntoDB(x: TransactionChunkRecord) {
    const record: TransactionChunkRecordInDatabase = {
        ...x,
        record_id: `${x.chain_id}_${formatEthereumAddress(x.address)}`,
    }
    return record
}

export function TransactionChunkRecordOutDB(x: TransactionChunkRecordInDatabase) {
    const record: TransactionChunkRecord = omit(x, 'record_id')
    return record
}
