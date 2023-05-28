import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useChainContext } from './useContext.js'

export function useNonFungibleRarity<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: HubOptions<T>,
) {
    const { account } = useChainContext({ account: options?.account })
    const Hub = useWeb3Hub(pluginID, {
        account,
        ...options,
    })

    return useAsyncRetry(async () => {
        if (!address && !id) return
        return Hub.getNonFungibleRarity(address || '', id || '')
    }, [address, id, Hub])
}
