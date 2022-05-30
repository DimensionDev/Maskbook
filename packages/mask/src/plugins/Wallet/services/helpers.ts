import type { IDBPSafeTransaction } from '../../../../background/database/utils/openDB'
import type { WalletDB } from '../database/Wallet.db'
import type { LegacyWalletRecord, LegacyWalletRecordInDatabase } from '../database/types'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'

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
