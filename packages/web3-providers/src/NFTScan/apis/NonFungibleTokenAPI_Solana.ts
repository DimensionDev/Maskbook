import urlcat from 'urlcat'
import { createIndicator, createNextIndicator, createPageable, type Pageable, EMPTY_LIST } from '@masknet/shared-base'
import {
    type NonFungibleCollection,
    type NonFungibleTokenContract,
    type NonFungibleTokenEvent,
} from '@masknet/web3-shared-base'
import { ChainId, type SchemaType, isValidChainId } from '@masknet/web3-shared-solana'
import {
    createNonFungibleAsset,
    createNonFungibleCollection,
    createNonFungibleTokenContract,
    createNonFungibleTokenEvent,
    fetchFromNFTScanV2,
} from '../helpers/Solana.js'
import type { PageableResponse, Response, Solana } from '../types/index.js'
import type { BaseHubOptions, NonFungibleTokenAPI } from '../../entry-types.js'

class NFTScanNonFungibleTokenAPI_Solana implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(address: string, _?: string, { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return
        const path = urlcat('/api/sol/assets/:address', {
            address,
            show_attribute: true,
        })
        const response = await fetchFromNFTScanV2<Response<Solana.Asset>>(chainId, path)
        if (!response?.data) return
        const asset = createNonFungibleAsset(chainId, response.data)
        return asset
    }

    async getAssets(
        account: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: BaseHubOptions<ChainId> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const path = urlcat('/api/sol/account/own/:from', {
            from: account,
            account_address: account,
            cursor: indicator?.id,
            limit: size,
            show_attribute: true,
        })
        const response = await fetchFromNFTScanV2<PageableResponse<Solana.Asset>>(chainId, path)
        const assets = response?.data.content.map((x) => createNonFungibleAsset(chainId, x)) ?? EMPTY_LIST
        return createPageable(
            assets,
            createIndicator(indicator),
            response?.data.next ? createNextIndicator(indicator, response.data.next) : undefined,
        )
    }

    async getAssetsByCollection(
        name: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: BaseHubOptions<ChainId> = {},
    ) {
        if (!isValidChainId(chainId) || !name) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const path = urlcat('/api/sol/assets/collection/:name', {
            name,
            collection: name,
            cursor: indicator?.id,
            limit: size,
        })
        const response = await fetchFromNFTScanV2<PageableResponse<Solana.Asset>>(chainId, path)
        const assets = response?.data.content.map((x) => createNonFungibleAsset(chainId, x)) ?? EMPTY_LIST
        return createPageable(
            assets,
            createIndicator(indicator),
            response?.data.next ? createNextIndicator(indicator, response.data.next) : undefined,
        )
    }

    async getCollection(
        name: string,
        { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {},
    ): Promise<NonFungibleCollection<ChainId, SchemaType> | undefined> {
        const path = urlcat('/api/sol/collections/:name', {
            collection: name,
        })
        const response = await fetchFromNFTScanV2<Response<Solana.Collection>>(chainId, path)
        if (!response?.data) return
        return createNonFungibleCollection(chainId, response.data)
    }

    async getContract(
        address: string,
        { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {},
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType> | undefined> {
        const path = urlcat('/api/v2/collections/:address', {
            address,
        })
        const response = await fetchFromNFTScanV2<Response<Solana.Collection>>(chainId, path)
        if (!response?.data) return
        return createNonFungibleTokenContract(chainId, response.data)
    }

    async getEvents(
        address: string,
        _: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: BaseHubOptions<ChainId> = {},
    ): Promise<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>> {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const path = urlcat('/api/sol/transactions/:address', {
            address,
            token_address: address,
            limit: size,
            cursor: indicator?.id,
        })
        const response = await fetchFromNFTScanV2<PageableResponse<Solana.Transaction>>(chainId, path)
        const events = response?.data.content.map((x) => createNonFungibleTokenEvent(chainId, x)) ?? EMPTY_LIST
        return createPageable(
            events,
            createIndicator(indicator),
            response?.data.next ? createNextIndicator(indicator, response.data.next) : undefined,
        )
    }
}
export const NFTScanNonFungibleTokenSolana = new NFTScanNonFungibleTokenAPI_Solana()
