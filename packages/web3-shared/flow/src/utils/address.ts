import { getEnumAsArray } from '@dimensiondev/kit'
import { isSameAddress } from '@masknet/web3-shared-base'
import { getTokenConstant, ZERO_ADDRESS } from '../constants/index.js'
import { ChainId, NetworkType, ProviderType } from '../types.js'

export function formatAddress(address: string, size = 0) {
    if (!isValidAddress(address)) return address
    if (size === 0 || size >= 8) return address
    return `${address.slice(0, Math.max(0, 2 + size))}...${address.slice(-size)}`
}

export function formatTokenId(id: string) {
    return `#${id}`
}

export function isValidAddress(address: string) {
    return /0x\w{16}/.test(address)
}

export function isValidChainId(chainId: ChainId) {
    return getEnumAsArray(ChainId).some((x) => x.value === chainId)
}

export function getDefaultChainId() {
    return ChainId.Mainnet
}

export function getDefaultNetworkType() {
    return NetworkType.Flow
}

export function getDefaultProviderType() {
    return ProviderType.None
}

export function getZeroAddress() {
    return ZERO_ADDRESS
}

export function getNativeTokenAddress(chainId = ChainId.Mainnet) {
    return getTokenConstant(chainId, 'FLOW_ADDRESS')
}

export function getMaskTokenAddress(chainId = ChainId.Mainnet) {
    return ''
}

export function isZeroAddress(address?: string) {
    return isSameAddress(address, ZERO_ADDRESS)
}

export function isNativeTokenAddress(address?: string) {
    const set = new Set(getEnumAsArray(ChainId).map((x) => getTokenConstant(x.value, 'FLOW_ADDRESS')))
    return !!(address && set.has(address))
}
