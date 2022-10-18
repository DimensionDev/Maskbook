import { EMPTY_LIST } from '@masknet/shared-base'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    HubIndicator,
    HubOptions,
    NonFungibleCollection,
    NonFungibleTokenContract,
    NonFungibleTokenEvent,
    NonFungibleTokenTrait,
    Pageable,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-solana'
import urlcat from 'urlcat'
import type { NonFungibleTokenAPI } from '../../types/index.js'
import { NFTSCAN_SOLANA_API } from '../constants.js'
import {
    createNonFungibleAsset,
    createNonFungibleCollection,
    createNonFungibleTokenContract,
    createNonFungibleTokenEvent,
    fetchFromNFTScan,
    fetchFromNFTScanV2,
} from '../helpers/Solana.js'
import type { PageableResponse, Response, Solana } from '../types/index.js'

export class NFTScanNonFungibleTokenAPI_Solana implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    private async getAssetTraits(mintAddress: string): Promise<NonFungibleTokenTrait[]> {
        const url = urlcat(NFTSCAN_SOLANA_API, '/nftscan/getNFTBasicInfo', {
            token_address: mintAddress,
        })
        const { data: basicInfo } = await fetchFromNFTScan<Response<Solana.BasicInfo>>(url)

        return basicInfo.attributes.map((x) => ({
            type: x.attributes_name,
            value: x.attributes_value,
            rarity: x.percentage,
        }))
    }
    async getAsset(address: string, _: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const path = urlcat('/api/sol/assets/:address', {
            address,
        })
        const response = await fetchFromNFTScanV2<Response<Solana.Asset>>(chainId, path)
        if (!response?.data) return
        const traits = await this.getAssetTraits(address)
        const asset = createNonFungibleAsset(chainId, response.data)
        // prefer traits from the getNFTBasicInfo API, since it provides rarities
        asset.traits = traits
        return asset
    }

    async getAssets(account: string, { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId> = {}) {
        const path = urlcat('/api/sol/account/own/:from', {
            from: account,
            account_address: account,
            cursor: indicator?.id,
            limit: size,
        })
        const response = await fetchFromNFTScanV2<PageableResponse<Solana.Asset>>(chainId, path)
        const assets = response?.data.content.map((x) => createNonFungibleAsset(chainId, x)) ?? EMPTY_LIST
        return createPageable(
            assets,
            createIndicator(indicator),
            response?.data.next ? createNextIndicator(indicator, response?.data.next) : undefined,
        )
    }

    async getAssetsByCollection(
        name: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId> = {},
    ) {
        const path = urlcat('/api/sol/assets/collection/:name', {
            name,
            collection: name,
            cursor: indicator?.id,
            limit: size,
        })
        const response = await fetchFromNFTScanV2<PageableResponse<Solana.Asset>>(chainId, path)
        const assets = response?.data?.content.map((x) => createNonFungibleAsset(chainId, x)) ?? EMPTY_LIST
        return createPageable(
            assets,
            createIndicator(indicator),
            response?.data.next ? createNextIndicator(indicator, response?.data.next) : undefined,
        )
    }

    async getCollectionsByKeyword(
        keyword: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId, HubIndicator> = {},
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, HubIndicator>> {
        const path = '/api/sol/collections/filters'
        const response = await fetchFromNFTScanV2<Response<Solana.Collection[]>>(chainId, path, {
            method: 'POST',
            body: JSON.stringify({
                symbol: keyword,
                offset: (indicator?.index ?? 0) * size,
                limit: size.toString(),
            }),
        })
        const collections = response?.data.map((x) => createNonFungibleCollection(chainId, x)) ?? EMPTY_LIST
        return createPageable(collections, createIndicator(indicator))
    }

    async getCollection(
        name: string,
        { chainId = ChainId.Mainnet }: HubOptions<ChainId, HubIndicator> = {},
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
        { chainId = ChainId.Mainnet }: HubOptions<ChainId, HubIndicator> = {},
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
        { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId, HubIndicator> = {},
    ): Promise<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>> {
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
            response?.data.next ? createNextIndicator(indicator, response?.data.next) : undefined,
        )
    }
}
