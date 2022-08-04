import { useAsyncRetry } from 'react-use'
import { NetworkPluginID, OrderSide } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from '../entry-web3'
import { useWeb3Hub } from './useWeb3Hub'

export function useNonFungibleOrders<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const account = useAccount(pluginID, options?.account)
    const hub = useWeb3Hub(pluginID, {
        account,
        ...options,
    })

    return useAsyncRetry(async () => {
        if (!address || !id || !hub) return
        return hub.getNonFungibleTokenOrders?.(address, id, OrderSide.Sell, options)
    }, [address, id, hub])
}
