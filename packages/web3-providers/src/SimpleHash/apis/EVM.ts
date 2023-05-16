import urlcat from 'urlcat'
import {
    EMPTY_LIST,
    createPageable,
    type Pageable,
    type PageIndicator,
    createIndicator,
    createNextIndicator,
    NetworkPluginID,
} from '@masknet/shared-base'
import { type HubOptions, type NonFungibleAsset, type NonFungibleCollection } from '@masknet/web3-shared-base'
import { ChainId, type SchemaType, isValidChainId } from '@masknet/web3-shared-evm'
import {
    fetchFromSimpleHash,
    createNonFungibleAsset,
    resolveChain,
    createNonFungibleCollection,
    resolveChainId,
    getAllChainNames,
} from '../helpers.js'
import { type Asset, type Collection } from '../type.js'
import type { NonFungibleTokenAPI } from '../../entry-types.js'

export class SimpleHashAPI_EVM implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
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
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!account || !isValidChainId(chainId) || !chain) {
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
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
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
        { chainId, indicator, allChains }: HubOptions<ChainId> = {},
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>> {
        const pluginId = NetworkPluginID.PLUGIN_EVM
        const chain = allChains || !chainId ? getAllChainNames(pluginId) : resolveChain(pluginId, chainId)
        if (!chain || !account || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }

        const path = urlcat('/api/v0/nfts/collections_by_wallets', {
            chains: chain,
            wallet_addresses: account,
        })

        const response = await fetchFromSimpleHash<{ collections: Collection[] }>(path)

        const collections = response.collections
            // Might got bad data responded including id field and other fields empty
            .filter((x) => x?.id && isValidChainId(resolveChainId(x.chain)) && x.spam_score !== 100)
            .map((x) => createNonFungibleCollection(x))

        return createPageable(collections, createIndicator(indicator))
    }

    async getAssetsByCollectionAndOwner(
        collectionId: string,
        owner: string,
        { chainId = ChainId.Mainnet, indicator, size = 50 }: HubOptions<ChainId> = {},
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!chain || !isValidChainId(chainId) || !collectionId || !owner)
            return createPageable(EMPTY_LIST, createIndicator(indicator))

        const path = urlcat('/api/v0/nfts/owners', {
            chains: chain,
            wallet_addresses: owner,
            collection_ids: collectionId,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
            limit: size,
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

    async getCollectionVerifiedBy(id: string) {
        const path = urlcat('/api/v0/nfts/collections/ids', {
            collection_ids: id,
        })
        const response = await fetchFromSimpleHash<{ collections: Collection[] }>(path)
        if (!response.collections.length) return []
        const marketplaces = response.collections[0].marketplace_pages?.filter((x) => x.verified) || []
        return marketplaces.map((x) => x.marketplace_name)
    }
}
