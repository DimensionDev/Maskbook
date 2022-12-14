import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { NetworkPluginID } from '@masknet/shared-base'
import type { DataProvider } from '@masknet/public-api'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SearchResult, SearchResultType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { TrendingAPI } from '@masknet/web3-providers/types'

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
    dataProviders?: DataProvider[]
    searchedContractAddress?: string
}

export function usePayloadFromTokenSearchKeyword(
    result: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
): TrendingSearchResult {
    const { keyword, type, id, name = '', pluginID, address } = result
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    return {
        pluginID,
        type: type === SearchResultType.FungibleToken ? TrendingAPI.TagType.CASH : TrendingAPI.TagType.HASH,
        name,
        id: type === SearchResultType.FungibleToken ? id : undefined,
        isNFT: false,
        searchedContractAddress: Others?.isValidAddress(keyword)
            ? keyword
            : Others?.isValidAddress(address)
            ? address
            : undefined,
    }
}
