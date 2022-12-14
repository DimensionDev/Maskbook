import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { DataProvider } from '@masknet/public-api'
import { TrendingView } from './TrendingView.js'
import type { TrendingSearchResult } from '../../trending/usePayloadFromTokenSearchKeyword.js'

export interface SearchResultInspectorProps {
    keyword: string
    searchResult: TrendingSearchResult
    dataProvider: DataProvider
    setDataProvider: (x: DataProvider) => void
    dataProviders: DataProvider[]
}

export function SearchResultInspector({
    searchResult,
    dataProviders,
    dataProvider,
    setDataProvider,
}: SearchResultInspectorProps) {
    const { id, name, type, searchedContractAddress } = searchResult
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    if (!name || name === 'UNKNOWN' || !dataProviders?.length) return null
    return (
        <TrendingView
            isPopper={false}
            name={name}
            id={id}
            tagType={type}
            expectedChainId={chainId}
            searchedContractAddress={searchedContractAddress}
            setDataProvider={setDataProvider}
            dataProvider={dataProvider}
            dataProviders={dataProviders}
        />
    )
}
