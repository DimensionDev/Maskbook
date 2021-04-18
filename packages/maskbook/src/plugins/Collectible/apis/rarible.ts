import { RaribleBaseURL } from '../constants'
import { Flags } from '../../../utils/flags'
import type { RaribleCollectionResponse, RaribleNFTItemMetaResponse, RaribleNFTItemResponse } from '../types'

async function fetchFromRarible<T>(subPath: string) {
    const response = await (
        await fetch(`${RaribleBaseURL}${subPath}`, {
            cache: Flags.trader_all_api_cached_enabled ? 'force-cache' : undefined,
            mode: 'cors',
        })
    ).json()

    return response as T
}

export async function getNFTItem(tokenAddress: string, tokenId: string) {
    const itemResponse = await fetchFromRarible<RaribleNFTItemResponse>(`nft/items/${tokenAddress}:${tokenId}`)
    const metaResponse = await fetchFromRarible<RaribleNFTItemMetaResponse>(`nft/items/${tokenAddress}:${tokenId}/meta`)
    const collectionResponse = await fetchFromRarible<RaribleCollectionResponse>(`nft/collections/${tokenAddress}`)

    return {
        ...itemResponse,
        ...metaResponse,
        assetContract: collectionResponse,
    }
}
