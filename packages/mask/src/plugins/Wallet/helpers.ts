import { Asset, CurrencyType, isSameAddress } from '@masknet/web3-shared-evm'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-base'
import type { ERC20TokenRecord } from './database/types'

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

export const getTokenUSDValue = (token: Asset) => (token.value ? Number.parseFloat(token.value[CurrencyType.USD]) : 0)
