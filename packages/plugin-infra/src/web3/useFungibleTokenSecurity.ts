import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useChainId } from './useChainId'
import { useWeb3Hub } from './useWeb3Hub'

export function useFungibleTokenSecurity<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const chainId = useChainId(pluginID, options?.chainId)
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry<Web3Helper.FungibleTokenSecurityScope<S, T> | undefined>(async () => {
        if (!address) return
        return hub?.getFungibleTokenSecurity?.(chainId, address)
    }, [chainId, address, hub])
}
