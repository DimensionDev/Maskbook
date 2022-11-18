import { uniq } from 'lodash-es'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useAddressType, useNetworkContext, useChainContext } from '@masknet/web3-hooks-base'
import { DataProvider } from '@masknet/public-api'
import { AddressType } from '@masknet/web3-shared-evm'
import { TrendingView } from './TrendingView.js'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders.js'
import type { SearchResult } from '../../trending/usePayloadFromTokenSearchKeyword.js'

export interface SearchResultInspectorProps {
    keyword: string
    searchResult: SearchResult
}

export function SearchResultInspector({ keyword, searchResult }: SearchResultInspectorProps) {
    const { id, name, asset, type, searchedContractAddress, isNFT } = searchResult
    const { pluginID } = useNetworkContext()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: addressType } = useAddressType(pluginID, keyword)
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
    if (!name || name === 'UNKNOWN' || addressType === AddressType.ExternalOwned || !dataProviders?.length) return null
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
