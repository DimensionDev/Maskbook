import { first, unionWith } from 'lodash-es'
import { getEnumAsArray } from '@masknet/kit'
import { EMPTY_LIST } from '@masknet/shared-base'
import {
    Transaction,
    HubOptions,
    createPageable,
    createIndicator,
    Pageable,
    isSameAddress,
    TokenType,
    SourceType,
    createNextIndicator,
    HubIndicator,
    scale10,
    GasOptionType,
    toFixed,
} from '@masknet/web3-shared-base'
import { ChainId, createNativeToken, GasOption, SchemaType, isValidChainId } from '@masknet/web3-shared-evm'
import type { ZerionNonFungibleTokenItem, ZerionNonFungibleCollection, ZerionCoin } from './type.js'
import { formatAsset, formatTransactions } from './format.js'
import type { FungibleTokenAPI, GasOptionAPI, HistoryAPI, NonFungibleTokenAPI, TrendingAPI } from '../types/index.js'
import { getAllEVMNativeAssets, getAssetFullName } from '../helpers.js'
import {
    getAssetsList,
    getCoinsByKeyword,
    getGasOptions,
    getNonFungibleAsset,
    getNonFungibleAssets,
    getNonFungibleInfo,
    getTransactionList,
    zerionChainIdResolver,
} from './base-api.js'

const ZERION_NFT_DETAIL_URL = 'https://app.zerion.io/nfts/'
const filterAssetType = ['compound', 'trash', 'uniswap', 'uniswap-v2', 'nft']

export class ZerionAPI
    implements FungibleTokenAPI.Provider<ChainId, SchemaType>, HistoryAPI.Provider<ChainId, SchemaType>
{
    async getAssets(address: string, options?: HubOptions<ChainId>) {
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
                        zerionChainIdResolver(x.chain),
                )
                ?.map((x) => {
                    return formatAsset(zerionChainIdResolver(x.chain)!, x)
                }) ?? EMPTY_LIST

        return createPageable(
            unionWith(
                assets,
                getAllEVMNativeAssets(),
                (a, z) => isSameAddress(a.address, z.address) && a.chainId === z.chainId,
            ),
            createIndicator(options?.indicator),
        )
    }

    async getTransactions(
        address: string,
        { indicator }: HubOptions<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const pairs = getEnumAsArray(ChainId).map((x) => [x.value, 'transactions'] as const)
        const allSettled = await Promise.allSettled(
            pairs.map(async ([chainId, scope]) => {
                if (!scope) return EMPTY_LIST
                const { meta, payload } = await getTransactionList(address, scope)
                if (meta.status !== 'ok') return EMPTY_LIST
                return formatTransactions(chainId, payload.transactions)
            }),
        )
        const transactions = allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))

        return createPageable(transactions, createIndicator(indicator))
    }
}

export class ZerionNonFungibleTokenAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
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
                name: getAssetFullName(
                    nft.asset.contract_address,
                    nft.asset.collection.name,
                    nft.asset.name,
                    nft.asset.token_id,
                ),
                symbol: nft.asset.symbol,
                imageURL: nft.asset.preview.url,
                mediaURL: nft.asset.detail.url,
                mediaType: nft.asset.detail.meta.type,
                source: SourceType.Zerion,
            },
            source: SourceType.Zerion,
            link: this.createNonFungibleTokenPermalink(nft.asset.contract_address, nft.asset.token_id),
        }
    }

    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet, account }: HubOptions<ChainId> = {}) {
        if (!account || !isValidChainId(chainId)) return
        const response = await getNonFungibleAsset(account, address, tokenId)
        if (!response.payload.nft.length) return
        const payload = first(response.payload.nft)
        if (!payload) return
        return this.createNonFungibleTokenAssetFromNFT(chainId, payload)
    }
    async getAssets(
        account: string,
        { chainId = ChainId.Mainnet, indicator, size }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const response = await getNonFungibleAssets(account, indicator?.index, size)
        if (!response.payload.nft.length) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const assets = response.payload.nft.map((x) => this.createNonFungibleTokenAssetFromNFT(chainId, x))

        return createPageable(
            assets,
            createIndicator(indicator),
            assets.length ? createNextIndicator(indicator) : undefined,
        )
    }

    async getAssetsByCollection(
        address: string,
        { chainId = ChainId.Mainnet, indicator, size, account }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        if (!account || !isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const response = await getNonFungibleAssets(account, indicator?.index, size, address)
        const assets = response.payload.nft.map((x) => this.createNonFungibleTokenAssetFromNFT(chainId, x))

        return createPageable(
            assets,
            createIndicator(indicator),
            assets.length ? createNextIndicator(indicator) : undefined,
        )
    }

    async getFloorPrice(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return
        const response = await getNonFungibleInfo(address, tokenId)

        if (!response.payload['nft-info'].asset.floor_price) return

        const nativeToken = createNativeToken(chainId)
        return {
            amount: scale10(response.payload['nft-info'].asset.floor_price, nativeToken.decimals).toFixed(0),
            token: nativeToken,
        }
    }
}

export class ZerionTrendingAPI implements TrendingAPI.Provider<ChainId> {
    private createCoinFromData(data: ZerionCoin) {
        return {
            id: data.asset.id,
            name: data.asset.name,
            symbol: data.asset.symbol,
            type: TokenType.Fungible,
            decimals: data.asset.decimals,
        }
    }
    async getAllCoins(keyword?: string): Promise<TrendingAPI.Coin[]> {
        if (!keyword) return EMPTY_LIST
        const response = await getCoinsByKeyword(keyword)

        if (!response?.payload?.info?.length) return EMPTY_LIST

        return response.payload.info.filter((x) => !x.asset.type).map(this.createCoinFromData)
    }

    getCoinsByKeyword(chainId: ChainId, keyword: string): Promise<TrendingAPI.Coin[]> {
        throw new Error('Method not implemented.')
    }
    getCoinTrending(chainId: ChainId, id: string, currency: TrendingAPI.Currency): Promise<TrendingAPI.Trending> {
        throw new Error('Method not implemented.')
    }
    getCoinPriceStats(
        chainId: ChainId,
        coinId: string,
        currency: TrendingAPI.Currency,
        days: number,
    ): Promise<TrendingAPI.Stat[]> {
        throw new Error('Method not implemented.')
    }
}

export class ZerionGasAPI implements GasOptionAPI.Provider<ChainId, GasOption> {
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
        }
    }
}
