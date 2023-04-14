import { SourceType, TokenType, type NonFungibleAsset, type NonFungibleCollection } from '@masknet/web3-shared-base'
import {
    ChainId,
    SchemaType,
    WNATIVE,
    chainResolver,
    isValidChainId,
    isValidDomain,
    resolveImageURL,
} from '@masknet/web3-shared-evm'
import { isEmpty } from 'lodash-es'
import { createPermalink } from '../NFTScan/helpers/EVM.js'
import { fetchJSON, getAssetFullName } from '../entry-helpers.js'
import { SIMPLE_HASH_URL } from './constants.js'
import type { Asset, Collection } from './type.js'

export async function fetchFromSimpleHash<T>(path: string, init?: RequestInit) {
    return fetchJSON<T>(
        `${SIMPLE_HASH_URL}${path}`,
        {
            method: 'GET',
            mode: 'cors',
            headers: { 'content-type': 'application/json' },
        },
        {
            enableSquash: true,
        },
    )
}

export function createNonFungibleAsset(asset: Asset): NonFungibleAsset<ChainId, SchemaType> | undefined {
    if (isEmpty(asset)) return
    const chainId = resolveChainId(asset.chain)
    const address = asset.contract_address
    const schema = asset.contract.type === 'ERC721' ? SchemaType.ERC721 : SchemaType.ERC1155
    if (!chainId || !isValidChainId(chainId) || !address || asset.collection.spam_score === 100) return
    const name = isValidDomain(asset.name)
        ? asset.name
        : getAssetFullName(asset.contract_address, asset.contract.name, asset.name, asset.token_id)

    return {
        id: address,
        chainId,
        link: createPermalink(chainId, address, asset.token_id),
        tokenId: asset.token_id,
        type: TokenType.NonFungible,
        address,
        schema,
        creator: {
            address: asset.contract.deployed_by,
        },
        owner: {
            address: asset.owners?.[0].owner_address,
        },
        priceInToken: asset.last_sale
            ? {
                  amount: asset.last_sale.total_price?.toString() || '',
                  // FIXME: cannot get payment token
                  token:
                      asset.last_sale.payment_token?.symbol === 'ETH'
                          ? chainResolver.nativeCurrency(chainId) ?? WNATIVE[chainId]
                          : WNATIVE[chainId],
              }
            : undefined,
        metadata: {
            chainId,
            name,
            tokenId: asset.token_id,
            symbol: asset.contract.symbol,
            description: asset.description,
            imageURL: resolveImageURL(asset.image_url || asset.previews.image_large_url, name, asset.contract_address),
            previewImageURL: resolveImageURL(asset.previews.image_small_url, name, asset.contract_address),
            blurhash: asset.previews.blurhash,
            mediaURL: asset.image_url || asset.previews.image_large_url,
        },
        contract: {
            chainId,
            schema,
            address: asset.contract_address,
            name: asset.contract.name,
            symbol: asset.contract.symbol,
        },
        collection: {
            chainId,
            name: asset.collection.name || '',
            slug: asset.contract.name,
            description: asset.collection.description,
            address: asset.contract_address,
            iconURL: asset.collection.image_url,
            verified: Boolean(asset.collection.marketplace_pages?.some((x) => x.verified)),
            createdAt: new Date(asset.created_date).getTime(),
        },
        source: SourceType.SimpleHash,
    }
}

export function createNonFungibleCollection(collection: Collection): NonFungibleCollection<ChainId, SchemaType> {
    const chainId = resolveChainId(collection.chain)!

    const verifiedMarketplaces = collection.marketplace_pages?.filter((x) => x.verified) || []
    return {
        id: collection.id,
        chainId,
        name: collection.name || '',
        slug: collection.name,
        schema: SchemaType.ERC721,
        balance: collection.distinct_nfts_owned,
        iconURL: collection.image_url,
        ownersTotal: collection.total_quantity,
        source: SourceType.SimpleHash,
        address: collection.top_contracts?.[0]?.split('.')?.[1] ?? '',
        verified: verifiedMarketplaces.length > 0,
        verifiedBy: verifiedMarketplaces.map((x) => x.marketplace_name),
    }
}

export function resolveChainId(chain: string): ChainId | undefined {
    // Some of the `chainResolver.chainId()` results do not match.
    switch (chain) {
        case 'ethereum':
            return ChainId.Mainnet
        case 'polygon':
            return ChainId.Matic
        case 'arbitrum':
            return ChainId.Arbitrum
        case 'optimism':
            return ChainId.Optimism
        case 'avalanche':
            return ChainId.Avalanche
        case 'gnosis':
            return ChainId.xDai
        case 'bsc':
            return ChainId.BSC
        default:
            return undefined
    }
}

export const allChainNames = [
    ChainId.Mainnet,
    ChainId.Matic,
    ChainId.Arbitrum,
    ChainId.Optimism,
    ChainId.Optimism,
    ChainId.xDai,
    ChainId.BSC,
]
    .map(resolveChain)
    .join(',')
export function resolveChain(chainId: ChainId): string | undefined {
    switch (chainId) {
        case ChainId.Mainnet:
            return 'ethereum'
        case ChainId.Matic:
            return 'polygon'
        case ChainId.Arbitrum:
            return 'arbitrum'
        case ChainId.Optimism:
            return 'optimism'
        case ChainId.Avalanche:
            return 'avalanche'
        case ChainId.xDai:
            return 'gnosis'
        case ChainId.BSC:
            return 'bsc'
        default:
            return undefined
    }
}
