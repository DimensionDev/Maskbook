import { IdentityResolved, PluginId } from '@masknet/plugin-infra'
import { NextIDPlatform } from '@masknet/shared-base'
import type { AddressName } from '@masknet/web3-shared-evm'
import type { GeneralAsset, proof } from '../../types'

export const useCollectionFilter = (
    hiddenInfo: proof[],
    collections: GeneralAsset[],
    type: 'Donations' | 'Footprints',
    currentVisitingProfile?: IdentityResolved,
    address?: AddressName,
) => {
    if (!address || !currentVisitingProfile) return
    const proof = hiddenInfo?.find(
        (proof) =>
            proof?.platform === NextIDPlatform.Twitter &&
            proof?.identity === currentVisitingProfile?.identifier?.userId,
    )
    const hiddenList =
        proof?.content?.[PluginId.Web3Profile]?.unListedCollections?.[address?.resolvedAddress]?.[type] ?? []
    return collections?.filter(
        (collection) => hiddenList?.findIndex((url) => url === collection?.info?.image_preview_url) === -1,
    )
}
