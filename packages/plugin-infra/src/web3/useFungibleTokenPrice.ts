import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useChainId } from './useChainId'
import { useWeb3Hub } from './useWeb3Hub'

export function useFungibleTokenPrice<T extends NetworkPluginID>(
    pluginID: T,
    address?: string,
    options?: Web3Helper.Web3HubOptions<T>,
) {
    type GetFungibleTokenPrice = (chainId: Web3Helper.Definition[T]['ChainId'], address: string) => Promise<number>

    const chainId = useChainId(pluginID, options?.chainId)
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry(async () => {
        if (!chainId || !hub) return 0
        return (hub.getFungibleTokenPrice as GetFungibleTokenPrice)(chainId, address ?? '')
    }, [chainId, address, hub])
}
