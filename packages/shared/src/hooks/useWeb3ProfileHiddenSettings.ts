import { useWeb3State } from '@masknet/plugin-infra/web3'
import { PluginId } from '@masknet/plugin-infra'
import { NextIDPlatform, EMPTY_LIST } from '@masknet/shared-base'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsync } from 'react-use'
import { useMemo } from 'react'
import type { CollectionType } from '@masknet/web3-providers'
import type { Web3ProfileStorage } from '../types'

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

        return storage.get<Web3ProfileStorage>(PluginId.Web3Profile)
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
