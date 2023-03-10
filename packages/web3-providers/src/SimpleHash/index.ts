import urlcat from 'urlcat'
import type { NonFungibleTokenAPI } from '../entry-types.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import {
    type HubOptions,
    createPageable,
    type HubIndicator,
    type NonFungibleAsset,
    type NonFungibleCollection,
    createIndicator,
    type Pageable,
} from '@masknet/web3-shared-base'
import { ChainId, type SchemaType, isValidChainId } from '@masknet/web3-shared-evm'
import { fetchFromSimpleHash, createNonFungibleAsset, resolveChain, createNonFungibleCollection } from './helpers.js'

import { type Asset, type Collection } from './type.js'

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
        if (!chain || !account || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }
        const path = urlcat('/api/v0/nfts/owners', {
            chains: chain,
            wallet_addresses: account,
            contract_addresses: '',
        })

        const response = await fetchFromSimpleHash<Asset[]>(path)
        const assets = response.map((x) => createNonFungibleAsset(x)).filter(Boolean) as Array<
            NonFungibleAsset<ChainId, SchemaType>
        >

        return createPageable(assets, indicator)
    }

    async getCollectionsByOwner(
        account: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId> = {},
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, HubIndicator>> {
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
}
