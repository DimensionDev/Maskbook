import type { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import type { UseQueryResult } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useWeb3Utils } from './useWeb3Utils.js'
import type { GasOptionType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useGasOptions<T extends NetworkPluginID = NetworkPluginID>(
    pluginID: T,
    options: HubOptions<T>,
    live?: boolean,
): UseQueryResult<Record<GasOptionType, Web3Helper.Definition[T]['GasOption']> | null> {
    const { chainId } = useChainContext<T>({ chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, options)
    const Utils = useWeb3Utils(pluginID)

    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    return useQuery({
        queryKey: ['get-gas-options', pluginID, chainId, JSON.stringify(options)],
        queryFn: async () => {
            if (!Utils.isValidChainId(chainId)) return null
            return (await Hub.getGasOptions!(chainId, options)) || null
        },
        refetchInterval: live ? (Utils.getAverageBlockDelay?.(chainId) ?? 10) : false,
    })
}
