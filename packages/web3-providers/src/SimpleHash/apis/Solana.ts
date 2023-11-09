import urlcat from 'urlcat'
import {
    EMPTY_LIST,
    NetworkPluginID,
    createIndicator,
    createNextIndicator,
    createPageable,
    type PageIndicator,
    type Pageable,
} from '@masknet/shared-base'
import { type NonFungibleAsset, type NonFungibleCollection } from '@masknet/web3-shared-base'
import { ChainId, isValidChainId, type SchemaType } from '@masknet/web3-shared-solana'
import { fetchFromSimpleHash, resolveChain } from '../helpers.js'
import type { BaseHubOptions, NonFungibleTokenAPI } from '../../entry-types.js'
import {
    createSolanaNonFungibleAsset,
    createSolanaNonFungibleCollection,
    resolveSolanaChainId,
} from '../solana-helpers.js'
import { SPAM_SCORE } from '../constants.js'
import type { SimpleHash } from '../../types/SimpleHash.js'

class SimpleHashAPI_Solana implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {}) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_SOLANA, chainId)
        if (!chain || !address || !isValidChainId(chainId)) return
        const path = urlcat('/api/v0/nfts/:chain/:address', {
            chain,
            address,
            tokenId,
        })
        const response = await fetchFromSimpleHash<SimpleHash.Asset>(path)
        return createSolanaNonFungibleAsset(response)
    }

    async getAssets(account: string, { chainId = ChainId.Mainnet, indicator }: BaseHubOptions<ChainId> = {}) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_SOLANA, chainId)
        if (!account || !isValidChainId(chainId) || !chain) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }
        const path = urlcat('/api/v0/nfts/owners', {
            chains: chain,
            wallet_addresses: account,
            contract_addresses: '',
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        })

        const response = await fetchFromSimpleHash<{ next_cursor: string; nfts: SimpleHash.Asset[] }>(path)
        const assets = response.nfts.map((x) => createSolanaNonFungibleAsset(x)).filter(Boolean) as Array<
            NonFungibleAsset<ChainId, SchemaType>
        >

        return createPageable(
            assets,
            indicator,
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        )
    }

    async getAssetsByCollection(
        address: string,
        { chainId = ChainId.Mainnet, indicator }: BaseHubOptions<ChainId> = {},
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_SOLANA, chainId)
        if (!chain || !address || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }

        const path = urlcat(`/api/v0/nfts/${chain}/:address`, {
            address,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        })

        const response = await fetchFromSimpleHash<{ next_cursor: string; nfts: SimpleHash.Asset[] }>(path)

        const assets = response.nfts.map((x) => createSolanaNonFungibleAsset(x)).filter(Boolean) as Array<
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
        { chainId, indicator }: BaseHubOptions<ChainId> = {},
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>> {
        if (!account || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }

        const path = urlcat('/api/v0/nfts/collections_by_wallets', {
            chains: 'solana',
            wallet_addresses: account,
        })

        const response = await fetchFromSimpleHash<{ collections: SimpleHash.Collection[] }>(path)

        const collections = response.collections
            // Might got bad data responded including id field and other fields empty
            .filter((x) => {
                return (
                    x.id &&
                    isValidChainId(resolveSolanaChainId(x.chain)) &&
                    (x.spam_score === null || x.spam_score <= SPAM_SCORE)
                )
            })
            .map((x) => createSolanaNonFungibleCollection(x))

        return createPageable(collections, createIndicator(indicator))
    }

    async getAssetsByCollectionAndOwner(
        collectionId: string,
        owner: string,
        { chainId = ChainId.Mainnet, indicator, size = 50 }: BaseHubOptions<ChainId> = {},
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_SOLANA, chainId)
        if (!chain || !isValidChainId(chainId) || !collectionId || !owner)
            return createPageable(EMPTY_LIST, createIndicator(indicator))

        const path = urlcat('/api/v0/nfts/owners', {
            chains: chain,
            wallet_addresses: owner,
            collection_ids: collectionId,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
            limit: size,
        })

        const response = await fetchFromSimpleHash<{ nfts: SimpleHash.Asset[]; next_cursor: string }>(path)

        const assets = response.nfts.map((x) => createSolanaNonFungibleAsset(x)).filter(Boolean) as Array<
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
        const response = await fetchFromSimpleHash<{ collections: SimpleHash.Collection[] }>(path)
        if (!response.collections.length) return []
        const marketplaces = response.collections[0].marketplace_pages?.filter((x) => x.verified) || []
        return marketplaces.map((x) => x.marketplace_name)
    }
}
export const SimpleHashSolana = new SimpleHashAPI_Solana()
