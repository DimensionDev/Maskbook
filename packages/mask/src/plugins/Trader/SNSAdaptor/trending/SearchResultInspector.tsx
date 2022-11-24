import { uniq } from 'lodash-es'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { DataProvider } from '@masknet/public-api'
import { TrendingView } from './TrendingView.js'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders.js'
import type { TrendingSearchResult } from '../../trending/usePayloadFromTokenSearchKeyword.js'

export interface SearchResultInspectorProps {
    keyword: string
    searchResult: TrendingSearchResult
}

export function SearchResultInspector({ keyword, searchResult }: SearchResultInspectorProps) {
    const { id, name, asset, type, searchedContractAddress, isNFT } = searchResult
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: dataProviders_ = EMPTY_LIST } = useAvailableDataProviders(type, name)
    const dataProviders = searchedContractAddress
        ? isNFT
            ? [DataProvider.NFTScan]
            : uniq([
                  ...dataProviders_.filter((x) => {
                      return x !== DataProvider.NFTScan
                  }),
                  ...(id ? [DataProvider.CoinGecko] : []),
              ])
        : dataProviders_
    if (!name || name === 'UNKNOWN' || !dataProviders?.length) return null
    return (
        <TrendingView
            isPopper={false}
            name={name}
            id={id}
            asset={asset}
            tagType={type}
            expectedChainId={chainId}
            searchedContractAddress={searchedContractAddress}
            dataProviders={dataProviders}
        />
    )
}
