import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useNativeTokenAddress } from './useNativeTokenAddress'
import { useChainId } from './useChainId'
import { useWeb3Hub } from './useWeb3Hub'
import type { Web3Helper } from '../web3-helpers'

export function useNativeTokenPrice<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID: T,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const chainId = useChainId(pluginID, options?.chainId)
    const hub = useWeb3Hub(pluginID, options)
    const nativeTokenAddress = useNativeTokenAddress(pluginID, options)

    return useAsyncRetry(async () => {
        return hub?.getFungibleTokenPrice?.(chainId, nativeTokenAddress)
    }, [chainId, nativeTokenAddress, hub])
}
