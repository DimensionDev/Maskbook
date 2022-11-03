import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleTokenPrice<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID: T,
    address?: string,
    tokenId?: string,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const { chainId } = useChainContext({ chainId: options?.chainId })
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry(async () => {
        if (!chainId || !address || !tokenId) return 0
        const price = await hub?.getNonFungibleTokenPrice?.(chainId, address, tokenId)
        return price ?? 0
    }, [chainId, address, tokenId, hub])
}
