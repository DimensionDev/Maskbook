import { isEmpty, memoize } from 'lodash-es'
import { unreachable } from '@masknet/kit'
import {
    SourceType,
    TokenType,
    type NonFungibleAsset,
    type NonFungibleCollection,
    ActivityType,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType, WNATIVE, isValidChainId, resolveImageURL } from '@masknet/web3-shared-evm'
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana'
import { Days, NetworkPluginID, createLookupTableResolver } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { createPermalink } from '../NFTScan/helpers/EVM.js'
import { EVMChainResolver } from '../Web3/EVM/apis/ResolverAPI.js'
import { ETH_BLUR_TOKEN_ADDRESS, SIMPLE_HASH_URL, SPAM_SCORE } from './constants.js'
import { fetchSquashedJSON } from '../helpers/fetchJSON.js'
import { getAssetFullName } from '../helpers/getAssetFullName.js'
import { queryClient } from '../helpers/queryClient.js'
import { SimpleHash } from '../types/SimpleHash.js'

export async function fetchFromSimpleHash<T>(path: string, init?: RequestInit) {
    return queryClient.fetchQuery<T>({
        queryKey: ['simple-hash', path],
        staleTime: 10_000,
        queryFn: async () => {
            return fetchSquashedJSON<T>(`${SIMPLE_HASH_URL}${path}`, {
                method: 'GET',
                mode: 'cors',
                headers: { 'content-type': 'application/json' },
            })
        },
    })
}

export function createNonFungibleAsset(
    asset: SimpleHash.Asset,
    skipScoreCheck?: boolean,
): NonFungibleAsset<ChainId, SchemaType> | undefined {
    if (isEmpty(asset)) return
    const chainId = resolveChainId(asset.chain)
    const address = asset.contract_address

    const spam_score = asset.collection.spam_score
    if (
        !chainId ||
        !isValidChainId(chainId) ||
        !address ||
        (spam_score !== null && spam_score >= SPAM_SCORE && !skipScoreCheck)
    )
        return
    const schema = ['ERC721', 'CRYPTOPUNKS'].includes(asset.contract.type) ? SchemaType.ERC721 : SchemaType.ERC1155
    const name = asset.name || getAssetFullName(asset.contract_address, asset.contract.name, asset.name, asset.token_id)

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
            address: asset.owners?.[0]?.owner_address,
        },
        priceInToken:
            asset.last_sale ?
                {
                    amount: asset.last_sale.total_price?.toString() || '',
                    // FIXME: cannot get payment token
                    token:
                        asset.last_sale.payment_token?.symbol === 'ETH' ?
                            EVMChainResolver.nativeCurrency(chainId) ?? WNATIVE[chainId]
                        :   WNATIVE[chainId],
                }
            :   undefined,
        metadata: {
            chainId,
            name,
            tokenId: asset.token_id,
            symbol: asset.contract.symbol,
            description: asset.description,
            imageURL: resolveImageURL(
                asset.image_url || asset.previews.image_large_url,
                asset.name,
                asset.collection.name,
                asset.contract_address,
            ),
            previewImageURL: resolveImageURL(
                asset.previews.image_small_url,
                asset.name,
                asset.collection.name,
                asset.contract_address,
            ),
            blurhash: asset.previews.blurhash,
            mediaURL: asset.image_url || asset.previews.image_large_url,
            eventId: asset.extra_metadata?.event_id,
        },
        contract: {
            chainId,
            schema,
            address: asset.contract_address,
            name: asset.contract.name,
            symbol: asset.contract.symbol,
        },
        collection: {
            id: asset.collection.collection_id,
            chainId,
            name: asset.collection.name || '',
            slug: asset.contract.name,
            description: asset.collection.description,
            address: asset.contract_address,
            iconURL: asset.collection.image_url,
            verified: Boolean(asset.collection.marketplace_pages?.some((x) => x.verified)),
            createdAt: new Date(asset.created_date).getTime(),
            floorPrices: asset.collection.floor_prices,
        },
        source: SourceType.SimpleHash,
        traits:
            asset.extra_metadata?.attributes.map((x) => ({
                type: x.trait_type,
                value: x.value,
                displayType: x.display_type,
            })) || [],
        tokenCount: asset.token_count,
    }
}

export function createNonFungibleCollection(
    collection: SimpleHash.Collection,
): NonFungibleCollection<ChainId, SchemaType> {
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

export const resolveChainId: (chainId: string) => ChainId | undefined = memoize(function resolveChainId(
    chain: string,
): ChainId | undefined {
    // Some of the `chainResolver.chainId()` results do not match.
    switch (chain) {
        case 'ethereum':
            return ChainId.Mainnet
        case 'polygon':
            return ChainId.Polygon
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
        case 'base':
            return ChainId.Base
        case 'scroll':
            return ChainId.Scroll
        case 'celo':
            return ChainId.Celo
        case 'zora':
            return ChainId.Zora
        case 'zksync-era':
            return ChainId.ZkSyncEra
        case 'linea':
            return ChainId.Linea
        default:
            return undefined
    }
})

const ChainNameMap: Record<NetworkPluginID, Record<number, string>> = {
    [NetworkPluginID.PLUGIN_EVM]: {
        [ChainId.Mainnet]: 'ethereum',
        [ChainId.BSC]: 'bsc',
        [ChainId.Polygon]: 'polygon',
        [ChainId.Arbitrum]: 'arbitrum',
        [ChainId.Optimism]: 'optimism',
        [ChainId.Avalanche]: 'avalanche',
        [ChainId.xDai]: 'gnosis',
        [ChainId.Base]: 'base',
        [ChainId.Scroll]: 'scroll',
        [ChainId.Celo]: 'celo',
        [ChainId.Zora]: 'zora',
        [ChainId.ZkSyncEra]: 'zksync-era',
        [ChainId.Linea]: 'linea',
    },
    [NetworkPluginID.PLUGIN_SOLANA]: {
        [SolanaChainId.Mainnet]: 'solana',
    },
}

export function getAllChainNames(pluginID: NetworkPluginID) {
    return Object.values(ChainNameMap[pluginID]).join(',')
}

export function resolveChain(pluginId: NetworkPluginID, chainId: Web3Helper.ChainIdAll): string | undefined {
    return ChainNameMap[pluginId][chainId]
}

export function checkBlurToken(pluginId: NetworkPluginID, chainId: Web3Helper.ChainIdAll, address: string): boolean {
    return `${resolveChain(pluginId, chainId)}.${address.toLowerCase()}` === `ethereum.${ETH_BLUR_TOKEN_ADDRESS}`
}

export function isLensFollower(name: string) {
    if (!name) return false
    return name.endsWith('.lens-Follower')
}

export const resolveSimpleHashRange = createLookupTableResolver<Days, number>(
    {
        [Days.ONE_DAY]: 60 * 60 * 24,
        [Days.ONE_WEEK]: 60 * 60 * 24 * 7,
        [Days.ONE_MONTH]: 60 * 60 * 24 * 30,
        [Days.THREE_MONTHS]: 60 * 60 * 24 * 90,
        [Days.ONE_YEAR]: 0,
        [Days.MAX]: 0,
    },
    () => 0,
)

export function resolveEventType(event: SimpleHash.ActivityType) {
    switch (event) {
        case SimpleHash.ActivityType.Sale:
            return ActivityType.Sale
        case SimpleHash.ActivityType.Transfer:
            return ActivityType.Transfer
        case SimpleHash.ActivityType.Burn:
            return ActivityType.Burn
        case SimpleHash.ActivityType.Mint:
            return ActivityType.Mint
        default:
            unreachable(event)
    }
}
