import { compact, first, unionWith } from 'lodash-es'
import {
    createPageable,
    createIndicator,
    createNextIndicator,
    type Pageable,
    EMPTY_LIST,
    type PageIndicator,
} from '@masknet/shared-base'
import {
    type Transaction,
    isSameAddress,
    TokenType,
    SourceType,
    GasOptionType,
    toFixed,
} from '@masknet/web3-shared-base'
import { ChainId, type GasOption, SchemaType, isValidChainId, resolveImageURL } from '@masknet/web3-shared-evm'
import type { ZerionNonFungibleTokenItem, ZerionNonFungibleCollection } from './types.js'
import { formatAsset, formatRestTransaction, isValidAsset, zerionChainIdResolver } from './helpers.js'
import { getAssetsList, getGasOptions, getNonFungibleAsset, getNonFungibleAssets } from './base-api.js'
import { getAssetFullName } from '../helpers/getAssetFullName.js'
import { getNativeAssets } from '../helpers/getNativeAssets.js'
import type {
    FungibleTokenAPI,
    BaseGasOptions,
    HistoryAPI,
    BaseHubOptions,
    NonFungibleTokenAPI,
} from '../entry-types.js'
import urlcat from 'urlcat'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import type { TransactionsResponse } from './reset-types.js'

const ZERION_NFT_DETAIL_URL = 'https://app.zerion.io/nfts/'
const filterAssetType = ['compound', 'trash', 'uniswap', 'uniswap-v2', 'nft']
const ZERION_REST_API = 'https://zerion-proxy.r2d2.to/'

class ZerionAPI implements FungibleTokenAPI.Provider<ChainId, SchemaType>, HistoryAPI.Provider<ChainId, SchemaType> {
    async getAssets(address: string, options?: BaseHubOptions<ChainId>) {
        const { meta, payload } = await getAssetsList(address, 'positions')
        if (meta.status !== 'ok') return createPageable(EMPTY_LIST, createIndicator(options?.indicator))

        const assets =
            payload.positions?.positions
                .filter(
                    (x) =>
                        x.type === 'asset' &&
                        x.asset.icon_url &&
                        x.asset.is_displayable &&
                        !filterAssetType.includes(x.asset.type) &&
                        isValidAsset(x) &&
                        zerionChainIdResolver(x.chain),
                )
                ?.map((x) => {
                    return formatAsset(zerionChainIdResolver(x.chain)!, x)
                }) ?? EMPTY_LIST

        return createPageable(
            unionWith(
                assets,
                getNativeAssets(),
                (a, z) => isSameAddress(a.address, z.address) && a.chainId === z.chainId,
            ),
            createIndicator(options?.indicator),
        )
    }

    async getTransactions(
        address: string,
        { indicator, size = 20 }: BaseHubOptions<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const url = urlcat(ZERION_REST_API, '/v1/wallets/:address/transactions', {
            address,
            'page[after]': indicator?.id,
            'page[size]': size,
            'filter[trash]': 'only_non_trash',
        })
        const res = await fetchJSON<TransactionsResponse>(url)
        const transactions = compact(res.data.map((x) => formatRestTransaction(x)))
        let nextIndicator: PageIndicator | undefined = undefined
        if (res.links.next) {
            const url = new URL(res.links.next)
            const pageAfter = url ? url.searchParams.get('page[after]') : undefined
            nextIndicator = pageAfter ? createNextIndicator(indicator, pageAfter) : undefined
        }

        return createPageable(transactions, createIndicator(indicator), nextIndicator)
    }
}

class ZerionNonFungibleTokenAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    createNonFungibleCollectionFromCollectionData(chainId: ChainId, collection: ZerionNonFungibleCollection) {
        return {
            chainId,
            scheme: SchemaType.ERC721,
            name: collection.name,
            slug: collection.collection_id,
            description: collection.description,
            iconURL: collection.icon_url,
            source: SourceType.Zerion,
        }
    }
    createNonFungibleTokenPermalink(address?: string, tokenId?: string) {
        if (!address || !tokenId) return
        return ZERION_NFT_DETAIL_URL + `${address}:${tokenId}`
    }

    createNonFungibleTokenAssetFromNFT(chainId: ChainId, nft: ZerionNonFungibleTokenItem) {
        const name = getAssetFullName(
            nft.asset.contract_address,
            nft.asset.collection.name,
            nft.asset.name,
            nft.asset.token_id,
        )
        return {
            chainId,
            id: `${chainId}_${nft.asset.contract_address}_${nft.asset.token_id}`,
            type: TokenType.NonFungible,
            schema: nft.standard === 'ERC1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
            address: nft.asset.contract_address,
            tokenId: nft.asset.token_id,
            contract: {
                chainId,
                schema: nft.standard === 'ERC1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
                address: nft.asset.contract_address,
                name: nft.asset.collection.name,
                symbol: nft.asset.symbol,
            },
            metadata: {
                chainId,
                name,
                symbol: nft.asset.symbol,
                imageURL: resolveImageURL(nft.asset.preview.url, name, nft.asset.contract_address),
                mediaURL: nft.asset.detail.url,
                mediaType: nft.asset.detail.meta.type,
                source: SourceType.Zerion,
            },
            collection: {
                chainId,
                name: nft.asset.collection_info.name,
                slug: nft.asset.collection_info.slug,
                description: nft.asset.collection_info.description,
                address: nft.asset.contract_address,
                iconURL: nft.asset.collection_info.icon_url ?? nft.asset.collection.icon_url,
                verified: nft.asset.is_verified,
            },
            source: SourceType.Zerion,
            link: this.createNonFungibleTokenPermalink(nft.asset.contract_address, nft.asset.token_id),
        }
    }

    async getAsset(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, account }: BaseHubOptions<ChainId> = {},
    ) {
        if (!account || !isValidChainId(chainId)) return
        const response = await getNonFungibleAsset(account, address, tokenId)
        if (!response?.payload.nft.length) return
        const payload = first(response.payload.nft)
        if (!payload) return
        return this.createNonFungibleTokenAssetFromNFT(chainId, payload)
    }
    async getAssets(account: string, { chainId = ChainId.Mainnet, indicator, size }: BaseHubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const response = await getNonFungibleAssets(account, indicator?.index, size)
        if (!response?.payload.nft.length) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const assets = response.payload.nft.map((x) => this.createNonFungibleTokenAssetFromNFT(chainId, x))

        return createPageable(
            assets,
            createIndicator(indicator),
            assets.length ? createNextIndicator(indicator) : undefined,
        )
    }

    async getAssetsByCollection(
        address: string,
        { chainId = ChainId.Mainnet, indicator, size, account }: BaseHubOptions<ChainId> = {},
    ) {
        if (!account || !isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const response = await getNonFungibleAssets(account, indicator?.index, size, address)
        if (!response) return
        const assets = response.payload.nft.map((x) => this.createNonFungibleTokenAssetFromNFT(chainId, x))

        return createPageable(
            assets,
            createIndicator(indicator),
            assets.length ? createNextIndicator(indicator) : undefined,
        )
    }
}

class ZerionGasAPI implements BaseGasOptions.Provider<ChainId, GasOption> {
    async getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption> | undefined> {
        if (!isValidChainId(chainId)) return
        const result = await getGasOptions(chainId)
        return {
            [GasOptionType.FAST]: {
                estimatedSeconds: 15,
                suggestedMaxFeePerGas: toFixed(result?.fast),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.NORMAL]: {
                estimatedSeconds: 30,
                suggestedMaxFeePerGas: toFixed(result?.standard),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.SLOW]: {
                estimatedSeconds: 60,
                suggestedMaxFeePerGas: toFixed(result?.slow),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.CUSTOM]: {
                estimatedSeconds: 0,
                suggestedMaxFeePerGas: '',
                suggestedMaxPriorityFeePerGas: '',
            },
        }
    }
}
export const Zerion = new ZerionAPI()
export const ZerionNonFungibleToken = new ZerionNonFungibleTokenAPI()
export const ZerionGas = new ZerionGasAPI()
