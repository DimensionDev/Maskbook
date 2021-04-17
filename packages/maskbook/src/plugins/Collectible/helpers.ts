import type { Asset, OpenSeaAsset } from 'opensea-js/lib/types'
import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { PLUGIN_META_KEY } from './constants'
import type { CollectibleJSON_Payload, OpenSeaResponse } from './UI/types'
import schema from './schema.json'

export const CollectibleMetadataReader = createTypedMessageMetadataReader<CollectibleJSON_Payload>(
    PLUGIN_META_KEY,
    schema,
)
export const renderWithCollectibleMetadata = createRenderWithMetadata(CollectibleMetadataReader)

export function toAsset(asset: OpenSeaAsset): Asset {
    return {
        tokenId: asset.tokenId,
        tokenAddress: asset.tokenAddress,
        schemaName: asset.assetContract.schemaName,
    }
}

export function toDecimalAmount(weiAmount: string) {}
