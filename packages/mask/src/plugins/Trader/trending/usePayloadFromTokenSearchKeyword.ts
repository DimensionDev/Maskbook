import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { DataProvider } from '@masknet/public-api'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { TrendingAPI } from '@masknet/web3-providers'
import { TagType } from '../types/index.js'
import { useTrendingById, useCoinInfoByAddress } from '../trending/useTrending.js'

export interface SearchResult {
    pluginID: NetworkPluginID
    type: TagType
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

export function usePayloadFromTokenSearchKeyword(keyword = ''): SearchResult {
    const regexResult = keyword.match(/([#$])(\w+)/) ?? []
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const searchedContractAddress = Others?.isValidAddress(keyword) ? keyword : ''
    const type = searchedContractAddress ? '$' : regexResult[1]

    const [_, _type, name = ''] = keyword.match(/([#$])(\w+)/) ?? []

    const trendingByIdResult = useTrendingById(searchedContractAddress, DataProvider.NFTScan)
    const { value: nonFungibleAsset } = trendingByIdResult
    const { value: fungibleAsset } = useCoinInfoByAddress(searchedContractAddress)

    const nonFungibleAssetName = nonFungibleAsset?.trending?.coin.symbol || nonFungibleAsset?.trending?.coin.name
    const isNFT = !!nonFungibleAssetName

    return {
        pluginID: NetworkPluginID.PLUGIN_EVM,
        type: type === '$' ? TagType.CASH : TagType.HASH,
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
