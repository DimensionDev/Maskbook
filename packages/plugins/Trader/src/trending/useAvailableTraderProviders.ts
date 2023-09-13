import { useMemo } from 'react'
import type { TradeProvider } from '@masknet/public-api'
import type { NetworkType } from '@masknet/web3-shared-evm'
import { useChainContext, useNetworkContext, useWeb3Others } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { getEVMAvailableTraderProviders } from '../helpers/index.js'

export function useAvailableTraderProviders(targetChainId?: Web3Helper.ChainIdAll): TradeProvider[] {
    const { chainId } = useChainContext({
        chainId: targetChainId,
    })
    const { pluginID } = useNetworkContext()
    const Others = useWeb3Others()
    const networkType = Others.chainResolver.networkType(chainId)

    return useMemo(() => {
        switch (pluginID) {
            case NetworkPluginID.PLUGIN_EVM:
                return getEVMAvailableTraderProviders(networkType as NetworkType)
            case NetworkPluginID.PLUGIN_FLOW:
            case NetworkPluginID.PLUGIN_SOLANA:
            default:
                return EMPTY_LIST
        }
    }, [networkType, pluginID])
}
