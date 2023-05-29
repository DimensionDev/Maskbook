import bs58 from 'bs58'
import * as Web3 from '@solana/web3.js'
import { getEnumAsArray } from '@masknet/kit'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, NetworkType, ProviderType, SchemaType } from '../types.js'
import { getTokenConstant, ZERO_ADDRESS } from '../constants/index.js'
import { NetworkPluginID, createLookupTableResolver } from '@masknet/shared-base'
import { isTronAddress } from './isTronAddress.js'
import { memoize } from 'lodash-es'

export function encodePublicKey(key: Web3.PublicKey) {
    return key.toBase58()
}

export function decodeAddress(initData: string | Buffer | Uint8Array) {
    const data = typeof initData === 'string' ? bs58.decode(initData) : initData
    if (!Web3.PublicKey.isOnCurve(data)) throw new Error(`Failed to create public key from ${bs58.encode(data)}.`)
    return new Web3.PublicKey(data)
}

export function formatAddress(address: string, size = 0) {
    if (!isValidAddress(address, false)) return address
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

export function isValidAddress(address?: string, strict?: boolean): address is string {
    const length = address?.length
    if (!length || length < 32 || length > 44) return false
    try {
        const buffer = bs58.decode(address)
        return strict === false ? true : Web3.PublicKey.isOnCurve(buffer) && !isTronAddress(address)
    } catch {
        return false
    }
}

export const isValidChainId: (chainId?: ChainId) => boolean = memoize((chainId?: ChainId): chainId is ChainId => {
    return getEnumAsArray(ChainId).some((x) => x.value === chainId)
})

export function isZeroAddress(address?: string) {
    return isSameAddress(address, ZERO_ADDRESS)
}

const nativeTokenSet = new Set(getEnumAsArray(ChainId).map((x) => getTokenConstant(x.value, 'SOL_ADDRESS')))

export function isNativeTokenAddress(address?: string) {
    return !!(address && nativeTokenSet.has(address))
}

export function getNetworkPluginID() {
    return NetworkPluginID.PLUGIN_SOLANA
}

export function getDefaultChainId() {
    return ChainId.Mainnet
}

export function getInvalidChainId() {
    return ChainId.Invalid
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
