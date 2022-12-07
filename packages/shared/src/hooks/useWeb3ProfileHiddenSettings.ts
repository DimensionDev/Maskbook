import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { NextIDPlatform, EMPTY_LIST, PluginID, NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { CollectionType } from '@masknet/web3-providers/types'
import type { Web3ProfileStorage } from '../types.js'

export function useWeb3ProfileHiddenSettings(
    identity?: string,
    publicKeyAsHex?: string,
    options?: {
        address?: string
        hiddenAddressesKey?: 'NFTs' | 'donations' | 'footprints'
        collectionKey?: CollectionType
    },
) {
    const { Storage } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const { value } = useAsync(async () => {
        if (!Storage || !publicKeyAsHex || !identity) return
        const storage = Storage.createNextIDStorage(identity, NextIDPlatform.Twitter, publicKeyAsHex)

        return storage.get<Web3ProfileStorage>(PluginID.Web3Profile)
    }, [Storage, publicKeyAsHex, identity])

    const isHiddenAddress = useMemo(() => {
        if (!value?.hiddenAddresses || !options?.address || !options.hiddenAddressesKey) return false
        return (
            value.hiddenAddresses[options.hiddenAddressesKey]?.some((x) => isSameAddress(x.address, options.address)) ??
            false
        )
    }, [value?.hiddenAddresses, options?.address, options?.hiddenAddressesKey])

    const hiddenList = useMemo(() => {
        if (!options?.address || !options?.collectionKey) return EMPTY_LIST
        return value?.unListedCollections[options?.address.toLowerCase()]?.[options.collectionKey] ?? EMPTY_LIST
    }, [value?.unListedCollections, options?.address])

    return {
        isHiddenAddress,
        hiddenList,
    }
}
