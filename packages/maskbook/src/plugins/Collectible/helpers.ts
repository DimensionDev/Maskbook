import type { Asset, OpenSeaFungibleToken, WyvernSchemaName } from 'opensea-js/lib/types'
import BigNumber from 'bignumber.js'
import { ChainId, createERC20Token, createNativeToken, pow10 } from '@masknet/web3-shared'
import { createRenderWithMetadata, createTypedMessageMetadataReader } from '../../protocols/typed-message'
import { PLUGIN_META_KEY, RaribleIPFSURL } from './constants'
import type { CollectibleJSON_Payload, CollectibleToken } from './types'
import schema from './schema.json'

export const CollectibleMetadataReader = createTypedMessageMetadataReader<CollectibleJSON_Payload>(
    PLUGIN_META_KEY,
    schema,
)
export const renderWithCollectibleMetadata = createRenderWithMetadata(CollectibleMetadataReader)

export function toAsset(asset: { tokenId: string; tokenAddress: string; schemaName?: WyvernSchemaName }): Asset {
    return {
        tokenId: asset.tokenId,
        tokenAddress: asset.tokenAddress,
        schemaName: asset.schemaName,
    }
}

export function toTokenDetailed(chainId: ChainId, token: OpenSeaFungibleToken) {
    if (token.symbol === 'ETH') return createNativeToken(chainId)
    return createERC20Token(chainId, token.address, token.decimals, token.name, token.symbol)
}

export function toTokenIdentifier(token?: CollectibleToken) {
    if (!token) return ''
    return `${token.contractAddress}_${token.tokenId}`
}

export function toDecimalAmount(weiAmount: string, decimals: number) {
    return new BigNumber(weiAmount).dividedBy(pow10(decimals)).toNumber()
}

export function toUnixTimestamp(date: Date) {
    return Math.floor(date.getTime() / 1000)
}

export function toDate(timestamp: number) {
    if (timestamp === 0) return null
    return new Date(timestamp * 1000)
}

export function toRaribleImage(url?: string) {
    if (!url) return ''
    return `${RaribleIPFSURL}${url.replace('ipfs://ipfs/', '')}`
}
