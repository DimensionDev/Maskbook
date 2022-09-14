import type BigNumber from 'bignumber.js'
import type { Asset, WyvernSchemaName } from 'opensea-js/lib/types'
import { createRenderWithMetadata, createTypedMessageMetadataReader } from '@masknet/typed-message/dom'
import { leftShift } from '@masknet/web3-shared-base'
import { PLUGIN_META_KEY } from './constants.js'
import type { CollectibleJSON_Payload, CollectibleToken } from './types/index.js'
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

export function toTokenIdentifier(token?: CollectibleToken) {
    if (!token) return ''
    return `${token.contractAddress}_${token.tokenId}`
}

export function toDecimalAmount(weiAmount: BigNumber.Value, decimals: number) {
    return leftShift(weiAmount, decimals).toNumber()
}
