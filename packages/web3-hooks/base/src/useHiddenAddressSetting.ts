import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST, NextIDPlatform, PluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

/**
 *
 * @param pluginID The plugin id as store key
 * @param identity The persona identifier's hex string
 * @returns
 */
export function useHiddenAddressSetting(pluginID: PluginID, identity?: string) {
    const { Storage } = useWeb3State()

    return useAsyncRetry(async () => {
        if (!Storage || !pluginID || !identity) return EMPTY_LIST
        const storage = Storage.createNextIDStorage(identity, NextIDPlatform.NextID, identity)
        const result = await storage.get<{
            hiddenAddresses?: string[]
        }>(pluginID)

        // When the tips data is legacy
        if (!Array.isArray(result)) return result?.hiddenAddresses ?? EMPTY_LIST

        if (!result) return EMPTY_LIST

        const { hiddenAddresses } = result
        return hiddenAddresses
    }, [pluginID, Storage, identity])
}
