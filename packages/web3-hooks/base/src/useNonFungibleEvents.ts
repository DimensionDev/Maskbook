import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import type { HubIndicator } from '@masknet/web3-shared-base'
import { usePageableAsync } from './usePageableAsync.js'

export function useNonFungibleEvents<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
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
            return hub.getNonFungibleTokenEvents?.(address ?? '', id ?? '', { ...options, indicator: nextIndicator })
        },
        [address, id, hub],
        `${address}_${id}`,
    )
}
