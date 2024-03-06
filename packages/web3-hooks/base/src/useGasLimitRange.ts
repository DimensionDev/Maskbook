import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useGasLimitRange<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T, options?: HubOptions<T>) {
    const { chainId } = useChainContext<T>({ chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, options)
    return Hub.getGasLimit?.(chainId) || EMPTY_LIST
}
