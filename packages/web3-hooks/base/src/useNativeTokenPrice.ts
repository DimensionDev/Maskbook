import type { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'
import { useChainContext } from './useContext.js'
import { useNativeTokenAddress } from './useNativeTokenAddress.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNativeTokenPrice<T extends NetworkPluginID = NetworkPluginID>(pluginID: T, options?: HubOptions<T>) {
    const { chainId } = useChainContext({ chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, options)
    const nativeTokenAddress = useNativeTokenAddress(pluginID, options)

    return useQuery({
        enabled: !!nativeTokenAddress,
        queryKey: ['native-token', 'price', pluginID, chainId, nativeTokenAddress, options],
        queryFn: async () =>
            Hub.getFungibleTokenPrice(chainId, nativeTokenAddress!, {
                chainId,
            }),
    })
}
