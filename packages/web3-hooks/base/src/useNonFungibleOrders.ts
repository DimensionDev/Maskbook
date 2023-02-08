import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { HubIndicator } from '@masknet/web3-shared-base'
import { useChainContext } from './useContext.js'
import { usePageableAsync } from './usePageableAsync.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleOrders<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const { account } = useChainContext({ account: options?.account })
    const hub = useWeb3Hub(pluginID, {
        account,
        ...options,
    })

    return usePageableAsync(
        async (nextIndicator?: HubIndicator) => {
            if (!hub) return
            return hub.getNonFungibleTokenOffers?.(address ?? '', id ?? '', options)
        },
        [address, id, hub],
    )
}
