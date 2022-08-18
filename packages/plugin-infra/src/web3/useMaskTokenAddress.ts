import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'

export function useMaskTokenAddress<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const { Others } = useWeb3State(pluginID)
    const maskTokenAddress = Others?.getMaskTokenAddress?.(options?.chainId)

    if (!maskTokenAddress) throw new Error('No mask token address.')
    return maskTokenAddress
}
