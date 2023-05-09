import { EMPTY_LIST, EMPTY_OBJECT, NextIDPlatform, type PluginID } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'
import { Web3Storage } from '@masknet/web3-providers'

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
 * @param personaPubkey The persona identifier in hex string
 * @param pluginID The plugin id as store key
 * @returns
 */
export function useHiddenAddressConfig(personaPubkey?: string, pluginID?: PluginID) {
    return useQuery({
        queryKey: ['next-id', 'hidden-address', pluginID, personaPubkey],
        enabled: !!personaPubkey,
        queryFn: async () => {
            if (!pluginID || !personaPubkey) return EMPTY_OBJECT
            const storage = Web3Storage.createNextIDStorage(personaPubkey, NextIDPlatform.NextID, personaPubkey)

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

export function useHiddenAddressConfigOf(personaPubkey?: string, pluginID?: PluginID, socialId?: string) {
    const result = useHiddenAddressConfig(personaPubkey, pluginID)
    return {
        ...result,
        data: result.data ? getHiddenAddressesOf(result.data, socialId) : undefined,
    }
}

export function hiddenAddressesAdapter(list: string[], accounts: string[]): Record<string, string[]> {
    return Object.fromEntries(accounts.map((account) => [account, list]))
}

export function getHiddenAddressesOf(config?: Result, socialId?: string) {
    if (!config) return EMPTY_LIST
    if (Array.isArray(config)) return config
    return socialId ? config[socialId] ?? EMPTY_LIST : EMPTY_LIST
}
