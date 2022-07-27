import bs58 from 'bs58'
import * as Web3 from '@solana/web3.js'
import { getEnumAsArray } from '@dimensiondev/kit'
import { ChainId } from '../types'
import { ZERO_ADDRESS } from '../constants'
import { currySameAddress } from '@masknet/web3-shared-base'

export function encodePublicKey(key: Web3.PublicKey) {
    return key.toBase58()
}

export function decodeAddress(initData: string | Buffer) {
    const data = typeof initData === 'string' ? bs58.decode(initData) : initData
    if (!Web3.PublicKey.isOnCurve(data)) throw new Error(`Failed to create public key from ${bs58.encode(data)}.`)
    return new Web3.PublicKey(data)
}

export function formatAddress(address: string, size = 0) {
    if (!isValidAddress(address)) return address
    if (size === 0 || size >= 22) return address
    return `${address.slice(0, Math.max(0, size))}...${address.slice(-size)}`
}
export function formatTokenId(id: string) {
    return id
}
export function isValidAddress(address?: string) {
    const length = address?.length
    if (!length) return false
    try {
        return length >= 32 && length <= 44 && Web3.PublicKey.isOnCurve(bs58.decode(address))
    } catch {
        return false
    }
}

export function isValidChainId(chainId: number) {
    return getEnumAsArray(ChainId).some((x) => x.value === chainId)
}

export const isZeroAddress = currySameAddress(ZERO_ADDRESS)
