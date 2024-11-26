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
import {
    type NonFungibleAsset,
    type NonFungibleCollection,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType, isValidChainId, isValidAddress } from '@masknet/web3-shared-evm'
import {
    fetchFromSimpleHash,
    createNonFungibleAsset,
    resolveChain,
    createNonFungibleCollection,
    resolveChainId,
    getAllChainNames,
    isLensFollower,
} from '../helpers.js'
import type { BaseHubOptions, NonFungibleTokenAPI } from '../../entry-types.js'
import { SPAM_SCORE } from '../constants.js'
import { SimpleHash } from '../../types/SimpleHash.js'

class SimpleHashAPI_EVM implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getCollectionByContractAddress(
        address: string,
        { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {},
    ): Promise<SimpleHash.Collection | undefined> {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!chain || !address || !isValidChainId(chainId)) return
        const path = urlcat('/api/v0/nfts/collections/:chain/:address', {
            chain,
            address,
        })

        const { collections } = await fetchFromSimpleHash<{ collections: SimpleHash.Collection[] }>(path)

        return collections[0]
    }

    async getAsset(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, account }: BaseHubOptions<ChainId> = {},
        skipScoreCheck = false,
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!chain || !address || !tokenId || !isValidChainId(chainId)) return
        const path = urlcat('/api/v0/nfts/:chain/:address/:tokenId', {
            chain,
            address,
            tokenId,
        })
        const response = await fetchFromSimpleHash<SimpleHash.Asset>(path)
        const asset = createNonFungibleAsset(response, skipScoreCheck)

        if (asset?.schema === SchemaType.ERC1155 && account) {
            const pathToQueryOwner = urlcat('/api/v0/nfts/contracts', {
                chains: chain,
                wallet_addresses: account,
                contract_addresses: asset.address,
            })

            const ownershipResponse = await fetchFromSimpleHash<{ wallets: SimpleHash.Ownership[] }>(pathToQueryOwner)

            if (ownershipResponse.wallets?.[0]?.contracts?.[0].token_ids?.includes(asset.tokenId)) {
                asset.owner = { address: account }
            }
        }

        return asset
    }

    async getPoapEvent(eventId: number, { indicator, size = 20 }: Omit<BaseHubOptions<ChainId>, 'chainId'> = {}) {
        const path = urlcat('/api/v0/nfts/poap_event/:event_id', {
            cursor: indicator?.id || undefined,
            limit: size,
            event_id: eventId,
            count: 1,
        })
        const response = await fetchFromSimpleHash<{ next_cursor: string; nfts: SimpleHash.Asset[]; count?: number }>(
            path,
        )
        return createPageable(
            response.nfts,
            indicator,
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
            response.count,
        )
    }

    async getTopCollectorsByCollectionId(
        collectionId: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: BaseHubOptions<ChainId> = {},
    ) {
        const path = urlcat('/api/v0/nfts/top_collectors/collection/:collectionId', {
            collectionId,
            cursor: indicator?.id || undefined,
            limit: size,
            include_owner_image: '1',
        })
        const response = await fetchFromSimpleHash<{ next_cursor: string; top_collectors: SimpleHash.TopCollector[] }>(
            path,
        )
        return createPageable(
            response.top_collectors,
            indicator,
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        )
    }

    async getAssets(
        account: string,
        {
            chainId = ChainId.Mainnet,
            indicator,
            contractAddress = '',
        }: BaseHubOptions<ChainId> & {
            contractAddress?: string
        } = {},
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!account || !isValidChainId(chainId) || !chain) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }
        const path = urlcat('/api/v0/nfts/owners', {
            chains: chain,
            wallet_addresses: account,
            contract_addresses: contractAddress,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        })

        const response = await fetchFromSimpleHash<{ next_cursor: string; nfts: SimpleHash.Asset[] }>(path)
        const assets = response.nfts.map((x) => createNonFungibleAsset(x)).filter(Boolean) as Array<
            NonFungibleAsset<ChainId, SchemaType>
        >

        return createPageable(
            assets,
            indicator,
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        )
    }

    async getAssetsByCollectionId(
        collectionId: string,
        { chainId = ChainId.Mainnet, indicator }: BaseHubOptions<ChainId> = {},
        skipScoreCheck = false,
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!collectionId || !isValidChainId(chainId) || !chain) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }
        const path = urlcat('/api/v0/nfts/collection/:collectionId', {
            chains: chain,
            collectionId,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        })

        const response = await fetchFromSimpleHash<{ next_cursor: string; nfts: SimpleHash.Asset[] }>(path)
        const assets = response.nfts.map((x) => createNonFungibleAsset(x, skipScoreCheck)).filter(Boolean) as Array<
            NonFungibleAsset<ChainId, SchemaType>
        >

        return createPageable(
            assets,
            createIndicator(indicator),
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        )
    }

    async getAssetsByCollection(
        address: string,
        { chainId = ChainId.Mainnet, indicator }: BaseHubOptions<ChainId> = {},
        skipScoreCheck = false,
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!chain || !address || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }

        const path = urlcat(`/api/v0/nfts/${chain}/:address`, {
            address,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        })

        const response = await fetchFromSimpleHash<{ next_cursor: string; nfts: SimpleHash.Asset[] }>(path)

        const assets = response.nfts.map((x) => createNonFungibleAsset(x, skipScoreCheck)).filter(Boolean) as Array<
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
        { chainId, indicator, allChains, schemaType }: BaseHubOptions<ChainId> = {},
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>> {
        const pluginId = NetworkPluginID.PLUGIN_EVM
        const isERC712Only = schemaType === SchemaType.ERC721
        const chain = allChains || !chainId ? getAllChainNames(pluginId) : resolveChain(pluginId, chainId)
        if (!chain || !account || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }

        const path = urlcat('/api/v0/nfts/collections_by_wallets', {
            chains: chain,
            wallet_addresses: account,
            nft_ids: 1,
        })

        const response = await fetchFromSimpleHash<{ collections: SimpleHash.Collection[] }>(path)

        const filteredCollections = response.collections
            // Might got bad data responded including id field and other fields empty
            .filter((x) => {
                if (!x.id || (x.spam_score !== null && x.spam_score >= SPAM_SCORE)) return false
                return (
                    isValidChainId(resolveChainId(x.chain)) &&
                    x.top_contracts.length > 0 &&
                    (!isLensFollower(x.name) || !isERC712Only)
                )
            })

        let erc721CollectionIdList: string[] = EMPTY_LIST

        if (isERC712Only) {
            const nftIdList = filteredCollections.map((x) => x.nft_ids?.[0] || '').filter(Boolean)
            while (nftIdList.length) {
                const batchAssetsPath = urlcat('/api/v0/nfts/assets', {
                    nft_ids: nftIdList.splice(0, 50).join(','),
                })

                const batchAssetsResponse = await fetchFromSimpleHash<{
                    nfts: SimpleHash.Asset[]
                }>(batchAssetsPath)

                erc721CollectionIdList = erc721CollectionIdList.concat(
                    batchAssetsResponse.nfts
                        .filter((x) => x.contract.type === 'ERC721')
                        .map((x) => x.collection.collection_id),
                )
            }
        }

        const collections = filteredCollections
            .filter((x) => !isERC712Only || erc721CollectionIdList.includes(x.id))
            .map((x) => createNonFungibleCollection(x))

        return createPageable(collections, createIndicator(indicator))
    }

    async getAssetsByCollectionAndOwner(
        collectionId: string,
        owner: string,
        { chainId = ChainId.Mainnet, indicator, size = 50 }: BaseHubOptions<ChainId> = {},
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

        const response = await fetchFromSimpleHash<{ nfts: SimpleHash.Asset[]; next_cursor: string }>(path)

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
        const collection = await this.getSimpleHashCollection(id)
        if (!collection) return []
        const marketplaces = collection.marketplace_pages?.filter((x) => x.verified) || []
        return marketplaces.map((x) => x.marketplace_name)
    }

    async getSimpleHashCollection(id: string): Promise<SimpleHash.Collection | undefined> {
        // SimpleHash collection id is not address
        if (isValidAddress(id)) return
        const path = urlcat('/api/v0/nfts/collections/ids', {
            collection_ids: id,
        })
        const response = await fetchFromSimpleHash<{ collections: SimpleHash.Collection[] }>(path)
        return response.collections[0]
    }
}
export const SimpleHashEVM = new SimpleHashAPI_EVM()
