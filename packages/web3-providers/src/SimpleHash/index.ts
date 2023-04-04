import urlcat from 'urlcat'
import {
    EMPTY_LIST,
    createPageable,
    type Pageable,
    type PageIndicator,
    createIndicator,
    createNextIndicator,
} from '@masknet/shared-base'
import { type HubOptions, type NonFungibleAsset, type NonFungibleCollection } from '@masknet/web3-shared-base'
import { ChainId, type SchemaType, isValidChainId } from '@masknet/web3-shared-evm'
import { fetchFromSimpleHash, createNonFungibleAsset, resolveChain, createNonFungibleCollection } from './helpers.js'
import { type Asset, type Collection } from './type.js'
import type { NonFungibleTokenAPI } from '../entry-types.js'

export class SimpleHashProviderAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const chain = resolveChain(chainId)
        if (!chain || !address || !tokenId || !isValidChainId(chainId)) return
        const path = urlcat('/api/v0/nfts/:chain/:address/:tokenId', {
            chain,
            address,
            tokenId,
        })
        const response = await fetchFromSimpleHash<Asset>(path)
        return createNonFungibleAsset(response)
    }

    async getAssets(account: string, { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId> = {}) {
        const chain = resolveChain(chainId)
        if (!account || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }
        const path = urlcat('/api/v0/nfts/owners', {
            chains: chain,
            wallet_addresses: account,
            contract_addresses: '',
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        })

        const response = await fetchFromSimpleHash<{ next_cursor: string; nfts: Asset[] }>(path)
        const assets = response.nfts.map((x) => createNonFungibleAsset(x)).filter(Boolean) as Array<
            NonFungibleAsset<ChainId, SchemaType>
        >

        return createPageable(
            assets,
            indicator,
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        )
    }

    async getAssetsByCollection(address: string, { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId> = {}) {
        const chain = resolveChain(chainId)
        if (!chain || !address || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }

        const path = urlcat(`/api/v0/nfts/${chain}/:address`, {
            address,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        })

        const response = await fetchFromSimpleHash<{ next_cursor: string; nfts: Asset[] }>(path)

        const assets = response.nfts.map((x) => createNonFungibleAsset(x)).filter(Boolean) as Array<
            NonFungibleAsset<ChainId, SchemaType>
        >

        return createPageable(
            assets,
            createIndicator(indicator),
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        )
    }

    async getCollectionsByOwner(
        account: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId> = {},
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>> {
        const chain = resolveChain(chainId)
        if (!chain || !account || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }

        const path = urlcat('/api/v0/nfts/collections_by_wallets', {
            chains: chain,
            wallet_addresses: account,
        })

        const response = await fetchFromSimpleHash<{ collections: Collection[] }>(path)

        const collections = response.collections.map((x) => createNonFungibleCollection(x)).filter(Boolean) as Array<
            NonFungibleCollection<ChainId, SchemaType>
        >

        return createPageable(collections, createIndicator(indicator))
    }

    async getAssetsByCollectionAndOwner(
        collectionId: string,
        owner: string,
        { chainId = ChainId.Mainnet, indicator, size = 50 }: HubOptions<ChainId> = {},
    ) {
        const chain = resolveChain(chainId)
        if (!chain || !isValidChainId(chainId) || !collectionId || !owner)
            return createPageable(EMPTY_LIST, createIndicator(indicator))

        const path = urlcat('/api/v0/nfts/owners', {
            chains: chain,
            wallet_addresses: owner,
            collection_ids: collectionId,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        })

        const response = await fetchFromSimpleHash<{ nfts: Asset[]; next_cursor: string }>(path)

        const assets = response.nfts.map((x) => createNonFungibleAsset(x)).filter(Boolean) as Array<
            NonFungibleAsset<ChainId, SchemaType>
        >

        return createPageable(
            assets,
            createIndicator(indicator),
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        )
    }
}
