import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'

export function useZeroAddress<T extends NetworkPluginID>(pluginID?: T, options?: Web3Helper.Web3ConnectionOptions<T>) {
    type GetZeroAddress = (chainId?: Web3Helper.Definition[T]['ChainId']) => string

    const { Others } = useWeb3State(pluginID)
    return (Others?.getZeroAddress as GetZeroAddress)(options?.chainId) ?? ''
}
