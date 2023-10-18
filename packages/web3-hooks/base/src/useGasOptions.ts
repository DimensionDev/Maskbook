import type { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useWeb3Others } from './useWeb3Others.js'

export function useGasOptions<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: HubOptions<T>,
    live?: boolean,
) {
    const { chainId } = useChainContext<T>({ chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, options)
    const Others = useWeb3Others(pluginID)

    return useQuery(
        ['get-gas-options', pluginID, chainId, options],
        async () => {
            if (!Others.isValidChainId(chainId)) return
            return Hub.getGasOptions!(chainId, options)
        },
        {
            refetchInterval: live ? Others.getAverageBlockDelay?.(chainId) ?? 10 : false,
        },
    )
}
