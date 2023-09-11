import { useMemo } from 'react'
import type { NetworkType } from '@masknet/web3-shared-evm'
import type { TradeProvider } from '@masknet/public-api'
import { useChainContext, useNetworkContext, useWeb3Others } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { getEVMAvailableTraderProviders } from '../getEVMAvailableTraderProviders.js'

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
                return []
        }
    }, [networkType, pluginID])
}
