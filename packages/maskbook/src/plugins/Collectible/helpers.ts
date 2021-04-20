import type { Asset, WyvernSchemaName } from 'opensea-js/lib/types'
import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message'
import { PLUGIN_META_KEY, RaribleIPFSURL } from './constants'
import type { CollectibleJSON_Payload } from './types'
import schema from './schema.json'
import BigNumber from 'bignumber.js'

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

export function toDecimalAmount(weiAmount: string, decimals: number) {
    return new BigNumber(weiAmount).dividedBy(new BigNumber(10).pow(decimals)).toNumber()
}

export function toUnixTimestamp(date: Date) {
    return Math.round(date.getTime() / 1000)
}

export function toRaribleImage(url?: string) {
    if (!url) return ''
    return `${RaribleIPFSURL}${url.replace('ipfs://ipfs/', '')}`
}
