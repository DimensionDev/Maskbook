import { useAsyncRetry } from 'react-use'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useNativeTokenAddress } from './useNativeTokenAddress.js'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNativeTokenPrice<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID: T,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const { chainId } = useChainContext({ chainId: options?.chainId })
    const hub = useWeb3Hub(pluginID, options)
    const nativeTokenAddress = useNativeTokenAddress(pluginID, options)

    return useAsyncRetry(async () => {
        if (!nativeTokenAddress) return
        return hub?.getFungibleTokenPrice?.(chainId, nativeTokenAddress)
    }, [chainId, nativeTokenAddress, hub])
}
