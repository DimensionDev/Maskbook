import { getEnumAsArray } from '@masknet/kit'
import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { getTokenConstant } from '../constants/constants.js'
import { ZERO_ADDRESS } from '../constants/primitives.js'
import { ChainId, NetworkType, ProviderType } from '../types.js'

export function formatAddress(address: string, size = 0) {
    const format = (partial: string) => {
        if (size === 0 || size >= 8) return partial
        return `${partial.slice(0, Math.max(0, 2 + size))}...${partial.slice(-size)}`
    }
    if (isValidAccountAddress(address)) return format(address)
    if (isValidContractAddress(address)) return format(`0x${address.split(/\./g)[1]}`)
    return address
}

export function formatTokenId(id: string) {
    return `#${id}`
}

export function isValidAccountAddress(address: string) {
    return /0x\w{16}/.test(address)
}

export function isValidContractAddress(address: string) {
    return /A\.\w{16}\.\w+/.test(address)
}

export function isValidAddress(address?: string): address is string {
    if (!address) return false
    return isValidAccountAddress(address) || isValidContractAddress(address)
}

export function isValidChainId(chainId?: ChainId) {
    return getEnumAsArray(ChainId).some((x) => x.value === chainId)
}

export function getNetworkPluginID() {
    return NetworkPluginID.PLUGIN_FLOW
}

export function getDefaultChainId() {
    return ChainId.Mainnet
}

export function getInvalidChainId() {
    return ChainId.Invalid
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

export function getContractAddress(address: string) {
    if (isValidContractAddress(address)) {
        const [_, contractAddress, ...identifierFragments] = address.split(/\./g)
        return {
            address: `0x${contractAddress}`,
            identifier: identifierFragments.join('.'),
        }
    }
    return
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
