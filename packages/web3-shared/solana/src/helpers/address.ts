import { memoize } from 'lodash-es'
import { getEnumAsArray } from '@masknet/kit'
import { isSameAddress } from '@masknet/web3-shared-base'
import { NetworkPluginID, createLookupTableResolver } from '@masknet/shared-base'
import { ChainId, NetworkType, ProviderType, SchemaType } from '../types.js'
import { getTokenConstant } from '../constants/constants.js'
import { ZERO_ADDRESS } from '../constants/primitives.js'

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
    return false
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
