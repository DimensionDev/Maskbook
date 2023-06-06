import { EMPTY_LIST, EMPTY_OBJECT, NextIDPlatform, type PluginID, type PersonaIdentifier } from '@masknet/shared-base'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { Web3Storage } from '@masknet/web3-providers'
import { useCallback, useMemo } from 'react'

type AddressData = Record<string, string[]> | string[]
type StorageValueV1 = string[]
type StorageValueV2 = { hiddenAddresses?: string[] }
type StorageValueV3 = { hiddenAddresses?: Record<string, string[]> }
type CurrentStorageValue = StorageValueV3
type StorageValue = StorageValueV1 | StorageValueV2 | StorageValueV3

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
        // Identities of Twitter proof get lowered case.
        data: result.data ? getHiddenAddressesOf(result.data, socialId?.toLowerCase()) : undefined,
    }
}

interface Options {
    /** To update storage, a signer is required */
    identifier?: PersonaIdentifier
    pluginID: PluginID
    /** For data migration */
    socialIds?: string[]
}

type ConfigResult = [UseQueryResult<Record<string, string[]>>, (config: Record<string, string[]>) => Promise<void>]
/**
 * Provider address config and data updater
 */
export function useUnlistedAddressConfig({ identifier, pluginID, socialIds }: Options): ConfigResult {
    const query = useHiddenAddressConfig(identifier?.publicKeyAsHex, pluginID)
    const { data: unlistedAddressConfig } = query

    const migratedUnlistedAddressConfig = useMemo(() => {
        if (!unlistedAddressConfig || !socialIds?.length) return EMPTY_OBJECT
        if (!Array.isArray(unlistedAddressConfig)) return unlistedAddressConfig

        return hiddenAddressesAdapter(unlistedAddressConfig, socialIds)
    }, [unlistedAddressConfig, socialIds])

    const updateConfig = useCallback(
        async (config: Record<string, string[]>) => {
            if (!identifier) return
            const storage = Web3Storage.createNextIDStorage(
                identifier.publicKeyAsHex,
                NextIDPlatform.NextID,
                identifier,
            )
            await storage.set<CurrentStorageValue>(pluginID, {
                hiddenAddresses: config,
            })
        },
        [pluginID, identifier],
    )

    return [{ ...query, data: migratedUnlistedAddressConfig } as UseQueryResult<Record<string, string[]>>, updateConfig]
}

export function hiddenAddressesAdapter(list: string[], accounts: string[]): Record<string, string[]> {
    return Object.fromEntries(accounts.map((account) => [account, list]))
}

export function getHiddenAddressesOf(config?: AddressData, socialId?: string) {
    if (!config) return EMPTY_LIST
    if (Array.isArray(config)) return config
    return socialId ? config[socialId] ?? EMPTY_LIST : EMPTY_LIST
}
