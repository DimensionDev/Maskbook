import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useNativeTokenAddress } from './useNativeTokenAddress.js'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNativeTokenPrice<T extends NetworkPluginID = NetworkPluginID>(pluginID: T, options?: HubOptions<T>) {
    const { chainId } = useChainContext({ chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, options)
    const nativeTokenAddress = useNativeTokenAddress(pluginID, options)

    return useAsyncRetry(async () => {
        if (!nativeTokenAddress) return
        return Hub.getFungibleTokenPrice(chainId, nativeTokenAddress)
    }, [chainId, nativeTokenAddress, Hub])
}
