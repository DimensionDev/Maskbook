import { createContainer } from 'unstated-next'
import { NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import {
    useFungibleAssets,
    useChainContext,
    useFungibleTokensFromTokenList,
    useWeb3Others,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isNativeTokenAddress, ProviderType } from '@masknet/web3-shared-evm'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useMemo } from 'react'

function useContext(initialState?: {
    account?: string
    chainId?: Web3Helper.ChainIdAll
    setSelectedNetwork?: (x: Web3Helper.NetworkDescriptorAll | null) => void
    pluginID?: NetworkPluginID
    connectedChainId?: Web3Helper.ChainIdAll
}) {
    const { account, chainId, providerType } = useChainContext({
        account: initialState?.account,
        chainId: initialState?.chainId,
    })
    const Others = useWeb3Others(initialState?.pluginID)
    const fungibleAssets = useFungibleAssets<'all'>(initialState?.pluginID, undefined, {
        account,
        chainId,
    })
    const { value: fungibleTokens = EMPTY_LIST, loading } = useFungibleTokensFromTokenList(initialState?.pluginID, {
        chainId,
    })

    const assets = useMemo(() => {
        if (!fungibleAssets?.data) return EMPTY_LIST
        return fungibleAssets.data.map((x) => {
            if (isNativeTokenAddress(x.address))
                return { ...x, logoURL: Others.chainResolver.nativeCurrency(x.chainId)?.logoURL || x.logoURL }
            const token = fungibleTokens.find((y) => isSameAddress(x.address, y.address) && x.chainId === y.chainId)
            if (!token?.logoURL) return x
            return { ...x, logoURL: token.logoURL }
        })
    }, [fungibleAssets.data, fungibleTokens, Others.chainResolver.nativeCurrency])
    return {
        account,
        chainId,
        setSelectedNetwork: initialState?.setSelectedNetwork,
        isWalletConnectNetworkNotMatch:
            (providerType === ProviderType.WalletConnect || providerType === ProviderType.WalletConnectV2) &&
            initialState?.connectedChainId !== chainId,
        pluginID: initialState?.pluginID ?? NetworkPluginID.PLUGIN_EVM,
        fungibleAssets: { ...fungibleAssets, data: assets, isLoading: loading || fungibleAssets.isLoading },
    }
}

export const Context = createContainer(useContext)
Context.Provider.displayName = 'FungibleAssetsProvider'
