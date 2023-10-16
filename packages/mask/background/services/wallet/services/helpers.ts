import type { LegacyWalletRecord } from '@masknet/shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import type { LegacyWalletRecordInDatabase } from '../database/types.js'

export function LegacyWalletRecordOutDB(x: LegacyWalletRecordInDatabase) {
    const record = x as LegacyWalletRecord
    record.address = formatEthereumAddress(record.address)
    record.erc20_token_whitelist ??= new Set()
    record.erc20_token_blacklist ??= new Set()
    record.erc721_token_whitelist ??= new Set()
    record.erc721_token_blacklist ??= new Set()
    record.erc1155_token_whitelist ??= new Set()
    record.erc1155_token_blacklist ??= new Set()
    return record
}
