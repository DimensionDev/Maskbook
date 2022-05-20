import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useChainId } from './useChainId'
import { useWeb3Hub } from './useWeb3Hub'

export function useNonFungibleTokenPrice<T extends NetworkPluginID>(
    pluginID: T,
    address?: string,
    tokenId?: string,
    options?: Web3Helper.Web3HubOptions<T>,
) {
    type GetNonFungibleTokenPrice = (
        chainId: Web3Helper.Definition[T]['ChainId'],
        address: string,
        tokenId: string,
        options?: Web3Helper.Web3HubOptions<T>,
    ) => Promise<number>

    const chainId = useChainId(pluginID, options?.chainId)
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry(async () => {
        if (!chainId || !address || !tokenId) return 0
        return (hub?.getNonFungibleTokenPrice as GetNonFungibleTokenPrice)(chainId, address, tokenId)
    }, [chainId, address, tokenId, hub])
}
