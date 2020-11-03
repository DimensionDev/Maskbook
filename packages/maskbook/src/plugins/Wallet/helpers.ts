import stringify from 'json-stable-stringify'
import type { WalletRecord, ERC20TokenRecord } from './database/types'
import { isSameAddress } from '../../web3/helpers'

function serializeWalletRecord(record: WalletRecord) {
    return stringify({
        ...record,
        erc20_token_whitelist: Array.from(record.erc20_token_whitelist.values()),
        erc20_token_blacklist: Array.from(record.erc20_token_blacklist.values()),
    })
}

export function WalletComparer(a: WalletRecord | null, b: WalletRecord | null) {
    if (!a || !b) return false
    return serializeWalletRecord(a) === serializeWalletRecord(b)
}

export function WalletArrayComparer(a: WalletRecord[], b: WalletRecord[]) {
    if (a.length !== b.length) return false
    return a.every((wallet, index) => WalletComparer(wallet, b[index]))
}

export function TokenComparer(a: ERC20TokenRecord | null, b: ERC20TokenRecord | null) {
    if (!a || !b) return false
    return isSameAddress(a.address, b.address)
}

export function TokenArrayComparer(a: ERC20TokenRecord[], b: ERC20TokenRecord[]) {
    if (a.length !== b.length) return false
    return a.every((token, index) => TokenComparer(token, b[index]))
}
