import { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useQuery } from '@tanstack/react-query'

export function useNonFungibleAsset<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: HubOptions<T>,
) {
    const { account } = useChainContext({ account: options?.account })
    const Hub = useWeb3Hub(pluginID, {
        account,
        ...options,
    } as HubOptions<T>)

    return useQuery({
        enabled: !!address,
        queryKey: ['non-fungible-asset', pluginID, address, id, account, options],
        queryFn: async () => {
            if (!address || (!id && pluginID !== NetworkPluginID.PLUGIN_SOLANA)) return null
            return Hub.getNonFungibleAsset(address, id ?? '')
        },
    })
}
