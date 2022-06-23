import { IdentityResolved, PluginId } from '@masknet/plugin-infra'
import { NextIDPlatform } from '@masknet/shared-base'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import type { GeneralAsset, proof } from '../../types'

export const useCollectionFilter = (
    hiddenInfo: proof[],
    collections: GeneralAsset[],
    type: 'Donations' | 'Footprints',
    currentVisitingProfile?: IdentityResolved,
    address?: SocialAddress<NetworkPluginID>,
) => {
    if (!address || !currentVisitingProfile) return
    const proof = hiddenInfo?.find(
        (proof) =>
            proof?.platform === NextIDPlatform.Twitter &&
            proof?.identity === currentVisitingProfile?.identifier?.userId,
    )
    const hiddenList = proof?.content?.[PluginId.Web3Profile]?.unListedCollections?.[address?.address]?.[type] ?? []
    return collections?.filter((collection) => hiddenList?.findIndex((url) => url === collection?.id) === -1)
}
