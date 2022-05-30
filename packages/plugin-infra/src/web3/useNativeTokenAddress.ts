import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'

export function useNativeTokenAddress<T extends NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    type GetNativeTokenAddress = (chainId?: Web3Helper.Definition[T]['ChainId']) => string

    const { Others } = useWeb3State(pluginID)
    const nativeTokenAddress = (Others?.getNativeTokenAddress as GetNativeTokenAddress)(options?.chainId)

    if (!nativeTokenAddress) throw new Error('No native token address.')
    return nativeTokenAddress
}
