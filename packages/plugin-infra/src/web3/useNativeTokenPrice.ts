import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useNativeTokenAddress } from './useNativeTokenAddress'
import { useChainId } from '../entry-web3'
import { useWeb3Hub } from './useWeb3Hub'

export function useNativeTokenPrice<T extends NetworkPluginID>(pluginID: T, options?: Web3Helper.Web3HubOptions<T>) {
    type GetFungibleTokenPrice = (
        chainId: Web3Helper.Definition[T]['ChainId'],
        address: string,
        options?: Web3Helper.Web3HubOptions<T>,
    ) => Promise<number>

    const chainId = useChainId(pluginID)
    const hub = useWeb3Hub(pluginID, options)
    const nativeTokenAddress = useNativeTokenAddress(pluginID, options)

    return useAsyncRetry(async () => {
        return (hub?.getFungibleTokenPrice as GetFungibleTokenPrice)(chainId, nativeTokenAddress)
    }, [chainId, nativeTokenAddress, hub])
}
