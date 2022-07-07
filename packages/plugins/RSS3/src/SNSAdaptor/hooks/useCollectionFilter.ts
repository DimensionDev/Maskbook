import { IdentityResolved, PluginId } from '@masknet/plugin-infra'
import { NextIDPlatform } from '@masknet/shared-base'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { useMemo } from 'react'
import type { CollectionType, GeneralAsset, Proof } from '../../types'

export const useCollectionFilter = (
    hiddenInfo: Proof[],
    collections: GeneralAsset[],
    type: CollectionType,
    currentVisitingProfile?: IdentityResolved,
    address?: SocialAddress<NetworkPluginID>,
) => {
    return useMemo(() => {
        if (!address || !currentVisitingProfile) return

        const proof = hiddenInfo?.find(
            (proof) =>
                proof?.platform === NextIDPlatform.Twitter &&
                proof?.identity === currentVisitingProfile?.identifier?.userId?.toLowerCase(),
        )
        const hiddenList =
            proof?.content?.[PluginId.Web3Profile]?.unListedCollections?.[address?.address?.toLowerCase()]?.[type] ?? []
        return collections?.filter((collection) => hiddenList?.findIndex((url) => url === collection?.id) === -1)
    }, [address, currentVisitingProfile?.identifier?.userId, type, hiddenInfo?.length, collections?.length])
}
