import { useAsync } from 'react-use'
import type { NetworkType } from '@masknet/web3-shared-evm'
import type { TradeProvider } from '@masknet/public-api'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginTraderRPC } from '../messages.js'
import { useChainContext, useNetworkContext, useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useAvailableTraderProviders(targetChainId?: Web3Helper.ChainIdAll): AsyncState<TradeProvider[]> {
    const { chainId } = useChainContext({
        chainId: targetChainId,
    })
    const { pluginID } = useNetworkContext()
    const { Others } = useWeb3State()
    const networkType = Others?.chainResolver.networkType(chainId)

    return useAsync(async () => {
        switch (pluginID) {
            case NetworkPluginID.PLUGIN_EVM:
                return PluginTraderRPC.getEVMAvailableTraderProviders(networkType as NetworkType)
            case NetworkPluginID.PLUGIN_FLOW:
            case NetworkPluginID.PLUGIN_SOLANA:
            default:
                return []
        }
    }, [networkType, pluginID])
}
