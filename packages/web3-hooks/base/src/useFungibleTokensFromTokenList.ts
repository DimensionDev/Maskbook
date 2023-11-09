import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useFungibleTokensFromTokenList<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
>(pluginID?: T, options?: HubOptions<T>) {
    const { chainId } = useChainContext({ chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, {
        chainId,
        ...options,
    } as HubOptions<T>)

    return useAsyncRetry<Array<Web3Helper.FungibleTokenScope<S, T>> | undefined>(async () => {
        return Hub.getFungibleTokensFromTokenList(chainId, { chainId })
    }, [chainId, Hub])
}
