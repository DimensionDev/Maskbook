import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { useAsync } from 'react-use'
import { useWeb3State } from '../entry-web3.js'
import type { PluginID } from '../types.js'

/**
 *
 * @param pluginId The plugin id as store key
 * @param identity The persona identifier's hex string
 * @returns
 */
export function useHiddenAddressSetting(pluginId: PluginID, identity?: string) {
    const { Storage } = useWeb3State()

    return useAsync(async () => {
        if (!Storage || !pluginId || !identity) return EMPTY_LIST
        const storage = Storage.createNextIDStorage(identity, NextIDPlatform.NextID, identity)
        const result = await storage.get<{
            hiddenAddresses?: string[]
        }>(pluginId)

        if (!result) return EMPTY_LIST

        const { hiddenAddresses } = result
        return hiddenAddresses
    }, [pluginId, Storage, identity])
}
