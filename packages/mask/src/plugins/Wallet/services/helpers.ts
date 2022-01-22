import { omit } from 'lodash-unified'
import type { IDBPSafeTransaction } from '../../../../background/database/utils/openDB'
import type { WalletDB } from '../database/Wallet.db'
import type {
    ERC1155TokenRecord,
    ERC1155TokenRecordInDatabase,
    ERC20TokenRecord,
    ERC20TokenRecordInDatabase,
    LegacyWalletRecord,
    TransactionChunkRecord,
    TransactionChunkRecordInDatabase,
    LegacyWalletRecordInDatabase,
} from '../database/types'
import {
    ChainId,
    formatEthereumAddress,
    getChainIdFromName,
    ERC721TokenDetailed,
    ERC721TokenRecordInDatabase,
} from '@masknet/web3-shared-evm'

export async function getWalletByAddress(t: IDBPSafeTransaction<WalletDB, ['Wallet'], 'readonly'>, address: string) {
    const record = await t.objectStore('Wallet').get(formatEthereumAddress(address))
    return record ? LegacyWalletRecordOutDB(record) : null
}

export function LegacyWalletRecordIntoDB(x: LegacyWalletRecord) {
    const record = x as LegacyWalletRecordInDatabase
    record.address = formatEthereumAddress(x.address)
    return record
}

export function LegacyWalletRecordOutDB(x: LegacyWalletRecordInDatabase) {
    const record = x as LegacyWalletRecord
    record.address = formatEthereumAddress(record.address)
    record.erc20_token_whitelist = x.erc20_token_whitelist ?? new Set()
    record.erc20_token_blacklist = x.erc20_token_blacklist ?? new Set()
    record.erc721_token_whitelist = x.erc721_token_whitelist ?? new Set()
    record.erc721_token_blacklist = x.erc721_token_blacklist ?? new Set()
    record.erc1155_token_whitelist = x.erc1155_token_whitelist ?? new Set()
    record.erc1155_token_blacklist = x.erc1155_token_blacklist ?? new Set()
    return record
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

export function ERC721TokenRecordIntoDB(x: ERC721TokenDetailed): ERC721TokenRecordInDatabase {
    // NFT cannot be divided and store each token separately
    return { ...x, record_id: getERC721TokenRecordIntoDBKey(x.contractDetailed.address, x.tokenId) }
}

export function ERC721TokenRecordOutDB(x: ERC721TokenRecordInDatabase): ERC721TokenDetailed {
    return omit(x, 'record_id')
}

export function ERC1155TokenRecordIntoDB(x: ERC1155TokenRecord): ERC1155TokenRecordInDatabase {
    // NFT cannot be divided and store each token separately
    return { ...x, record_id: `${formatEthereumAddress(x.address)}_${x.tokenId}` }
}

export function ERC1155TokenRecordOutDB(x: ERC1155TokenRecordInDatabase): ERC1155TokenRecord {
    return omit(x, 'record_id')
}

export function TransactionChunkRecordIntoDB(x: TransactionChunkRecord): TransactionChunkRecordInDatabase {
    return { ...x, record_id: `${x.chain_id}_${formatEthereumAddress(x.address)}` }
}

export function TransactionChunkRecordOutDB(x: TransactionChunkRecordInDatabase): TransactionChunkRecord {
    return omit(x, 'record_id')
}
