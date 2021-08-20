import { Asset, isSameAddress, CurrencyType, ERC721TokenDetailed } from '@masknet/web3-shared'
import stringify from 'json-stable-stringify'
import type { WalletRecord, ERC20TokenRecord, ERC1155TokenRecord, PhraseRecord } from './database/types'

function serializeWalletRecord(record: WalletRecord) {
    return stringify({
        ...record,
        erc20_token_whitelist: Array.from(record.erc20_token_whitelist.values()),
        erc20_token_blacklist: Array.from(record.erc20_token_blacklist.values()),
        erc721_token_whitelist: Array.from(record.erc721_token_whitelist.values()),
        erc721_token_blacklist: Array.from(record.erc721_token_blacklist.values()),
        erc1155_token_whitelist: Array.from(record.erc1155_token_whitelist.values()),
        erc1155_token_blacklist: Array.from(record.erc1155_token_blacklist.values()),
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

export function PhraseComparer(a: PhraseRecord | null, b: PhraseRecord | null) {
    if (!a || !b) return false
    return a.id === b.id && a.index === b.index
}

export function PhrasesComparer(a: PhraseRecord[], b: PhraseRecord[]) {
    if (a.length !== b.length) return false
    return a.every((phrase, index) => PhraseComparer(phrase, b[index]))
}

export function ERC20TokenComparer(a: ERC20TokenRecord | null, b: ERC20TokenRecord | null) {
    if (!a || !b) return false
    return isSameAddress(a.address, b.address)
}

export function ERC20TokenArrayComparer(a: ERC20TokenRecord[], b: ERC20TokenRecord[]) {
    if (a.length !== b.length) return false
    return a.every((token, index) => ERC20TokenComparer(token, b[index]))
}

export function ERC721TokenComparer(a: ERC721TokenDetailed | null, b: ERC721TokenDetailed | null) {
    if (!a || !b) return false
    return a.tokenId === b.tokenId
}

export function ERC721TokenArrayComparer(a: ERC721TokenDetailed[], b: ERC721TokenDetailed[]) {
    if (a.length !== b.length) return false
    return a.every((token, index) => ERC721TokenComparer(token, b[index]))
}

export function ERC1155TokenComparer(a: ERC1155TokenRecord | null, b: ERC1155TokenRecord | null) {
    if (!a || !b) return false
    return a.tokenId === b.tokenId
}

export function ERC1155TokenArrayComparer(a: ERC1155TokenRecord[], b: ERC1155TokenRecord[]) {
    if (a.length !== b.length) return false
    return a.every((token, index) => ERC1155TokenComparer(token, b[index]))
}

export const getTokenUSDValue = (token: Asset) => (token.value ? Number.parseFloat(token.value[CurrencyType.USD]) : 0)
