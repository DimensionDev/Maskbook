import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleTokenPrice<T extends NetworkPluginID = NetworkPluginID>(
    pluginID: T,
    address?: string,
    tokenId?: string,
    options?: HubOptions<T>,
) {
    const { chainId } = useChainContext({ chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry(async () => {
        if (!chainId || !address || !tokenId) return 0
        const price = await Hub.getNonFungibleTokenPrice(chainId, address, tokenId)
        return price ?? 0
    }, [chainId, address, tokenId, Hub])
}
