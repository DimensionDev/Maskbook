import type { Asset, OpenSeaFungibleToken, WyvernSchemaName } from 'opensea-js/lib/types'
import { ChainId, createERC20Token, createNativeToken } from '@masknet/web3-shared-evm'
import { createRenderWithMetadata, createTypedMessageMetadataReader } from '@masknet/shared-base'
import { PLUGIN_META_KEY, RaribleIPFSURL } from './constants'
import type { CollectibleJSON_Payload, CollectibleToken } from './types'
import schema from './schema.json'
import type BigNumber from 'bignumber.js'
import { leftShift } from '@masknet/web3-shared-base'

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

export function toDecimalAmount(weiAmount: BigNumber.Value, decimals: number) {
    return leftShift(weiAmount, decimals).toNumber()
}

export function toRaribleImage(url?: string) {
    if (!url) return ''
    return `${RaribleIPFSURL}${url.replace('ipfs://ipfs/', '')}`
}
