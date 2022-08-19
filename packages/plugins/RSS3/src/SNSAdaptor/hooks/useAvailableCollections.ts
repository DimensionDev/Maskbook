import { PluginId } from '@masknet/plugin-infra'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import type { CollectionType, RSS3BaseAPI } from '@masknet/web3-providers'
import { useMemo } from 'react'
import type { Proof } from '../../types'

export const useAvailableCollections = (
    proofs: Proof[],
    type: CollectionType,
    collections: RSS3BaseAPI.Collection[],
    userId?: string,
    address?: string,
) => {
    return useMemo(() => {
        if (!address || !userId) return EMPTY_LIST

        const proof = proofs.find(
            (proof) => proof.platform === NextIDPlatform.Twitter && proof.identity === userId.toLowerCase(),
        )
        const hiddenList =
            proof?.content?.[PluginId.Web3Profile]?.unListedCollections?.[address.toLowerCase()]?.[type] ?? []
        if (!hiddenList.length) return collections
        return collections.filter((collection) => hiddenList?.findIndex((url) => url === collection?.id) === -1)
    }, [address, userId, type, proofs, collections])
}
