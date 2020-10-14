import type { IDBPSafeTransaction } from '../../../database/helpers/openDB'
import type { WalletDB } from '../database/Wallet.db'
import type {
    WalletRecord,
    ERC20TokenRecord,
    WalletRecordInDatabase,
    ERC20TokenRecordInDatabase,
} from '../database/types'
import { resolveChainId } from '../../../web3/pipes'
import { formatChecksumAddress } from '../formatter'
import { ChainId, ProviderType } from '../../../web3/types'

function fixWalletRecordProviderType(record: WalletRecord | WalletRecordInDatabase) {
    if (record.provider) return
    const record_ = record as { type?: 'managed' | 'exotic' } & WalletRecord
    record.provider =
        record_.type === 'managed' || record_._private_key_ || record_.mnemonic.length
            ? ProviderType.Maskbook
            : ProviderType.MetaMask
    delete record_.type
}

export async function getWalletByAddress(t: IDBPSafeTransaction<WalletDB, ['Wallet'], 'readonly'>, address: string) {
    const record = await t.objectStore('Wallet').get(formatChecksumAddress(address))
    return record ? WalletRecordOutDB(record) : null
}

export function WalletRecordIntoDB(x: WalletRecord) {
    const record = x as WalletRecordInDatabase
    fixWalletRecordProviderType(record)
    record.address = formatChecksumAddress(x.address)
    return record
}

export function WalletRecordOutDB(x: WalletRecordInDatabase) {
    const record = x as WalletRecord
    fixWalletRecordProviderType(record)
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
