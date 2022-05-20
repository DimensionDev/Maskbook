import { useAsyncRetry } from 'react-use'
import type { GasOptionType, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useChainId } from './useChainId'
import { useWeb3Hub } from './useWeb3Hub'

export function useGasOptions<T extends NetworkPluginID>(pluginID?: T, options?: Web3Helper.Web3HubOptions<T>) {
    type GetGasOptions = (
        chainId: Web3Helper.Definition[T]['ChainId'],
        options?: Web3Helper.Web3HubOptions<T>,
    ) => Promise<Record<GasOptionType, Web3Helper.Definition[T]['GasOption']>>

    const chainId = useChainId(pluginID)
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry(async () => {
        if (!chainId || !hub) return
        return (hub.getGasOptions as GetGasOptions)(chainId)
    }, [chainId, hub])
}
