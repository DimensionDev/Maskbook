import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders.js'
import { TagType } from '../../types/index.js'
import { TrendingView } from './TrendingView.js'

export interface SearchResultInspectorProps {
    keyword: string
}

export function SearchResultInspector({ keyword }: SearchResultInspectorProps) {
    const [_, type, name = ''] = keyword.match(/([#$])(\w+)/) ?? []
    const type_ = type === '$' ? TagType.CASH : TagType.HASH
    const { value: dataProviders = EMPTY_LIST } = useAvailableDataProviders(type_, name)

    if (!name || !dataProviders?.length) return null
    return (
        <Web3ContextProvider value={{ chainId: ChainId.Mainnet, pluginID: NetworkPluginID.PLUGIN_EVM }}>
            <TrendingView isPopper={false} name={name} tagType={type_} dataProviders={dataProviders} />
        </Web3ContextProvider>
    )
}
