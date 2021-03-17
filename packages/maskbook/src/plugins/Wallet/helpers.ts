import stringify from 'json-stable-stringify'
import type { WalletRecord, ERC20TokenRecord, ERC721TokenRecord } from './database/types'
import { currentSelectedWalletAddressSettings, currentSelectedWalletProviderSettings } from './settings'
import { isSameAddress } from '../../web3/helpers'
import { ProviderType } from '../../web3/types'

function serializeWalletRecord(record: WalletRecord) {
    return stringify({
        ...record,
        erc20_token_whitelist: Array.from(record.erc20_token_whitelist.values()),
        erc20_token_blacklist: Array.from(record.erc20_token_blacklist.values()),
        erc721_token_whitelist: Array.from(record.erc721_token_whitelist.values()),
        erc721_token_blacklist: Array.from(record.erc721_token_blacklist.values()),
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

export function ERC20TokenComparer(a: ERC20TokenRecord | null, b: ERC20TokenRecord | null) {
    if (!a || !b) return false
    return isSameAddress(a.address, b.address)
}

export function ERC20TokenArrayComparer(a: ERC20TokenRecord[], b: ERC20TokenRecord[]) {
    if (a.length !== b.length) return false
    return a.every((token, index) => ERC20TokenComparer(token, b[index]))
}

export function ERC721TokenComparer(a: ERC721TokenRecord | null, b: ERC721TokenRecord | null) {
    if (!a || !b) return false
    return a.tokenId === b.tokenId
}

export function ERC721TokenArrayComparer(a: ERC721TokenRecord[], b: ERC721TokenRecord[]) {
    if (a.length !== b.length) return false
    return a.every((token, index) => ERC721TokenComparer(token, b[index]))
}

export function selectMaskbookWallet(wallet: WalletRecord) {
    currentSelectedWalletAddressSettings.value = wallet.address
    currentSelectedWalletProviderSettings.value = ProviderType.Maskbook
}
