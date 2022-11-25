import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { DataProvider } from '@masknet/public-api'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SearchResultType, SearchResult } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { TrendingAPI } from '@masknet/web3-providers'
import { useTrendingById, useCoinInfoByAddress } from '../trending/useTrending.js'

export interface TrendingSearchResult {
    pluginID: NetworkPluginID
    type: TrendingAPI.TagType
    id?: string
    name: string
    chainId?: ChainId
    asset?: AsyncState<{
        currency?: TrendingAPI.Currency
        trending?: TrendingAPI.Trending | null
    }>
    isNFT: boolean
    searchedContractAddress?: string
}

export function usePayloadFromTokenSearchKeyword(result: SearchResult<Web3Helper.ChainIdAll>): TrendingSearchResult {
    const { keyword } = result
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const searchedContractAddress = result.type === SearchResultType.TrendingTokenByAddress ? keyword : ''
    const type = result.type === SearchResultType.TrendingTokenByKeyword ? result.trendingSearchType : '$'
    const name = result.type === SearchResultType.TrendingTokenByKeyword ? result.name : ''

    const trendingByIdResult = useTrendingById(searchedContractAddress, DataProvider.NFTScan)
    const { value: nonFungibleAsset } = trendingByIdResult
    const { value: fungibleAsset } = useCoinInfoByAddress(searchedContractAddress)

    const nonFungibleAssetName = nonFungibleAsset?.trending?.coin.symbol || nonFungibleAsset?.trending?.coin.name
    const isNFT = !!nonFungibleAssetName

    return {
        pluginID: NetworkPluginID.PLUGIN_EVM,
        type: type === '$' ? TrendingAPI.TagType.CASH : TrendingAPI.TagType.HASH,
        name: searchedContractAddress ? (isNFT ? nonFungibleAssetName : fungibleAsset?.name ?? '') : name,
        id: searchedContractAddress
            ? isNFT
                ? nonFungibleAsset?.trending?.coin.id
                : fungibleAsset?.id ?? ''
            : undefined,
        chainId: isNFT ? nonFungibleAsset.trending?.coin.chainId : (fungibleAsset?.chainId as ChainId),
        asset: isNFT ? trendingByIdResult : undefined,
        isNFT,
        searchedContractAddress: Others?.isValidAddress(keyword) ? keyword : undefined,
    }
}
