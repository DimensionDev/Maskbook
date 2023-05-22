import { EMPTY_LIST, EMPTY_OBJECT, NextIDPlatform, type PluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { useQuery } from '@tanstack/react-query'

type Result = Record<string, string[]> | string[]
type StorageValue =
    | string[]
    | { hiddenAddresses?: string[] }
    | {
          hiddenAddresses?: Result
      }
/**
 *
 * Get unlisted address by persona pubkey.
 *
 * @param pluginID The plugin id as store key
 * @param personaPubkey The persona identifier in hex string
 * @returns
 */
export function useHiddenAddressConfig(pluginID: PluginID, personaPubkey?: string) {
    const { Storage } = useWeb3State()

    return useQuery({
        queryKey: ['next-id', 'hidden-address', pluginID, personaPubkey],
        enabled: !!Storage && !!personaPubkey,
        queryFn: async () => {
            if (!Storage || !pluginID || !personaPubkey) return EMPTY_OBJECT
            const storage = Storage.createNextIDStorage(personaPubkey, NextIDPlatform.NextID, personaPubkey)
            const result = await storage.get<StorageValue>(pluginID)

            if (!result) return EMPTY_OBJECT

            // When the tips data is legacy
            if (Array.isArray(result)) return result

            if (!result.hiddenAddresses) return EMPTY_OBJECT

            if (Array.isArray(result.hiddenAddresses)) return result.hiddenAddresses
            return result.hiddenAddresses ?? EMPTY_OBJECT
        },
    })
}

export function useHiddenAddressConfigOf(pluginID: PluginID, personaPubkey?: string, socialId?: string) {
    const result = useHiddenAddressConfig(pluginID, personaPubkey)
    return {
        ...result,
        data: result.data ? getHiddenAddressesOf(result.data, socialId) : undefined,
    }
}

export function useMyHiddenAddresses(pluginID: PluginID, personaPubkey?: string) {
    const identity = useLastRecognizedIdentity()
    return useHiddenAddressConfigOf(pluginID, personaPubkey, identity?.identifier?.userId)
}

export function hiddenAddressesAdapter(list: string[], accounts: string[]): Record<string, string[]> {
    return Object.fromEntries(accounts.map((account) => [account, list]))
}

export function getHiddenAddressesOf(config?: Result, socialId?: string) {
    if (!config) return EMPTY_LIST
    if (Array.isArray(config)) return config
    return socialId ? config[socialId] ?? EMPTY_LIST : EMPTY_LIST
}
