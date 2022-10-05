import { useAsyncRetry } from 'react-use'
import type { PluginID } from '@masknet/plugin-infra'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

/**
 *
 * @param pluginId The plugin id as store key
 * @param identity The persona identifier's hex string
 * @returns
 */
export function useHiddenAddressSetting(pluginId: PluginID, identity?: string) {
    const { Storage } = useWeb3State()

    return useAsyncRetry(async () => {
        if (!Storage || !pluginId || !identity) return EMPTY_LIST
        const storage = Storage.createNextIDStorage(identity, NextIDPlatform.NextID, identity)
        const result = await storage.get<{
            hiddenAddresses?: string[]
        }>(pluginId)

        // When the tips data is legacy
        if (!Array.isArray(result)) return result?.hiddenAddresses ?? EMPTY_LIST

        if (!result) return EMPTY_LIST

        const { hiddenAddresses } = result
        return hiddenAddresses
    }, [pluginId, Storage, identity])
}
