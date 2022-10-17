import bs58 from 'bs58'
import * as Web3 from '@solana/web3.js'
import { getEnumAsArray } from '@dimensiondev/kit'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, NetworkType, ProviderType, SchemaType } from '../types.js'
import { getTokenConstant, ZERO_ADDRESS } from '../constants/index.js'
import { createLookupTableResolver } from '@masknet/shared-base'

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

export const formatSchemaType = createLookupTableResolver<SchemaType, string>(
    {
        [SchemaType.Native]: 'Native',
        [SchemaType.Fungible]: 'Fungible',
        [SchemaType.NonFungible]: 'NonFungible',
    },
    '',
)

export function formatTokenId(tokenId = '', size_ = 4) {
    const size = Math.max(2, size_)
    if (tokenId.length < size * 2) return `#${tokenId}`
    const head = tokenId.slice(0, size)
    const tail = tokenId.slice(-size)
    return `#${head}...${tail}`
}

export function isValidAddress(address?: string) {
    const length = address?.length
    if (!length) return false
    try {
        return length >= 32 && length <= 44 && !!bs58.decode(address)
    } catch {
        return false
    }
}

export function isValidChainId(chainId: ChainId) {
    return getEnumAsArray(ChainId).some((x) => x.value === chainId)
}

export function isZeroAddress(address?: string) {
    return isSameAddress(address, ZERO_ADDRESS)
}

export function isNativeTokenAddress(address?: string) {
    const set = new Set(getEnumAsArray(ChainId).map((x) => getTokenConstant(x.value, 'SOL_ADDRESS')))
    return !!(address && set.has(address))
}

export function getDefaultChainId() {
    return ChainId.Mainnet
}

export function getDefaultNetworkType() {
    return NetworkType.Solana
}

export function getDefaultProviderType() {
    return ProviderType.None
}

export function getZeroAddress() {
    return ZERO_ADDRESS
}

export function getMaskTokenAddress(chainId = ChainId.Mainnet) {
    return ''
}

export function getNativeTokenAddress(chainId = ChainId.Mainnet) {
    return getTokenConstant(chainId, 'SOL_ADDRESS') ?? ''
}
