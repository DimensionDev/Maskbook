import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider, useAddressType } from '@masknet/web3-hooks-base'
import { DataProvider } from '@masknet/public-api'
import { AddressType, ChainId } from '@masknet/web3-shared-evm'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders.js'
import { TrendingView } from './TrendingView.js'
import { uniq } from 'lodash-es'
import { usePayloadFromTokenSearchKeyword } from '../../trending/usePayloadFromTokenSearchKeyword.js'

export interface SearchResultInspectorProps {
    keyword: string
}

export function SearchResultInspector({ keyword }: SearchResultInspectorProps) {
    const { name, type, isNFT, chainId, searchedContractAddress, asset, id } = usePayloadFromTokenSearchKeyword(
        NetworkPluginID.PLUGIN_EVM,
        keyword,
    )
    const { value: addressType } = useAddressType(NetworkPluginID.PLUGIN_EVM, keyword, {
        chainId: chainId ?? ChainId.Mainnet,
    })

    const { value: dataProviders_ = EMPTY_LIST } = useAvailableDataProviders(chainId, type, name)
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
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet }}>
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
        </Web3ContextProvider>
    )
}
