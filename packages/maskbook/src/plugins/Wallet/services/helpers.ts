import { omit } from 'lodash-es'
import type { IDBPSafeTransaction } from '../../../database/helpers/openDB'
import type { WalletDB } from '../database/Wallet.db'
import type {
    WalletRecord,
    ERC20TokenRecord,
    WalletRecordInDatabase,
    ERC20TokenRecordInDatabase,
    ERC721TokenRecord,
    ERC721TokenRecordInDatabase,
} from '../database/types'
import { resolveChainId } from '../../../web3/pipes'
import { formatChecksumAddress } from '../formatter'
import { ChainId } from '../../../web3/types'

export async function getWalletByAddress(t: IDBPSafeTransaction<WalletDB, ['Wallet'], 'readonly'>, address: string) {
    const record = await t.objectStore('Wallet').get(formatChecksumAddress(address))
    return record ? WalletRecordOutDB(record) : null
}

export function WalletRecordIntoDB(x: WalletRecord) {
    const record = x as WalletRecordInDatabase
    record.address = formatChecksumAddress(x.address)
    return record
}

export function WalletRecordOutDB(x: WalletRecordInDatabase) {
    const record = x as WalletRecord
    record.address = formatChecksumAddress(record.address)
    record.erc20_token_whitelist = x.erc20_token_whitelist ?? new Set()
    record.erc20_token_blacklist = x.erc20_token_blacklist ?? new Set()
    return record
}

export function ERC20TokenRecordIntoDB(x: ERC20TokenRecord) {
    x.address = formatChecksumAddress(x.address)
    return x as ERC20TokenRecordInDatabase
}

export function ERC20TokenRecordOutDB(x: ERC20TokenRecordInDatabase) {
    const record = x as ERC20TokenRecord
    {
        // fix: network has been renamed to chainId
        const record_ = record as any
        if (!record.chainId) record.chainId = resolveChainId(record_.network) ?? ChainId.Mainnet
    }
    record.address = formatChecksumAddress(record.address)
    return record
}

export function ERC721TokenRecordIntoDB(x: ERC721TokenRecord) {
    const record: ERC721TokenRecordInDatabase = {
        ...x,
        // NFT cannot be divided and store each token separately
        record_id: `${formatChecksumAddress(x.address)}_${x.tokenId}`,
    }
    return record
}

export function ERC721TokenRecordOutDB(x: ERC721TokenRecordInDatabase) {
    const record: ERC721TokenRecord = omit(x, 'record_id')
    return record
}
