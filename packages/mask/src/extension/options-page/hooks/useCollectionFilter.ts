import { IdentityResolved, PluginId } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { NextIDPlatform } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useMemo } from 'react'
import { differenceWith } from 'lodash-unified'
import type { Proof, COLLECTION_TYPE } from '../types'

export const useCollectionFilter = (
    hiddenInfo: Proof[],
    collections: Array<Web3Helper.NonFungibleTokenScope<void, NetworkPluginID>>,
    type: COLLECTION_TYPE,
    currentVisitingProfile?: IdentityResolved,
    address?: string,
) => {
    return useMemo(() => {
        if (!address || !currentVisitingProfile) return []

        const proof = hiddenInfo.find(
            (proof) =>
                proof?.platform === NextIDPlatform.Twitter &&
                proof?.identity === currentVisitingProfile?.identifier?.userId?.toLowerCase(),
        )
        const hiddenList =
            proof?.content?.[PluginId.Web3Profile]?.unListedCollections?.[address?.toLowerCase()]?.[type] ?? []

        return differenceWith(
            collections,
            hiddenList,
            (collection, id) => `${collection.id}_${collection.tokenId}` === id,
        )
    }, [address, currentVisitingProfile?.identifier?.userId, type, hiddenInfo, collections])
}
