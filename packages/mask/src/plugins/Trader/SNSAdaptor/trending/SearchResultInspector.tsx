import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider, useWeb3State, useAddressType } from '@masknet/web3-hooks-base'
import { AddressType, ChainId } from '@masknet/web3-shared-evm'
import { useFungibleTokenBaseOnChainIdList } from '@masknet/web3-hooks-evm'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders.js'
import { TagType } from '../../types/index.js'
import { TrendingView } from './TrendingView.js'

export interface SearchResultInspectorProps {
    keyword: string
}

export function SearchResultInspector({ keyword }: SearchResultInspectorProps) {
    const regexResult = keyword.match(/([#$])(\w+)/) ?? []
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const type = Others?.isValidAddress(keyword) ? '$' : regexResult[1]
    const { value: addressType } = useAddressType(NetworkPluginID.PLUGIN_EVM, keyword, { chainId: ChainId.Mainnet })

    const [_, _type, name = ''] = keyword.match(/([#$])(\w+)/) ?? []
    const { value: fungibleToken } = useFungibleTokenBaseOnChainIdList(
        NetworkPluginID.PLUGIN_EVM,
        Others?.isValidAddress(keyword) ? keyword : '',
        [ChainId.Mainnet],
    )
    const type_ = type === '$' ? TagType.CASH : TagType.HASH
    const name_ = Others?.isValidAddress(keyword) ? fungibleToken?.symbol ?? '' : name

    const { value: dataProviders = EMPTY_LIST } = useAvailableDataProviders(type_, name_)

    if (!name_ || name_ === 'UNKNOWN' || addressType === AddressType.ExternalOwned || !dataProviders?.length)
        return null
    return (
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet }}>
            <TrendingView isPopper={false} name={name_} tagType={type_} dataProviders={dataProviders} />
        </Web3ContextProvider>
    )
}
