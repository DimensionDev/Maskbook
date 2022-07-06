import { IdentityResolved, PluginId } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { NextIDPlatform } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { proof, COLLECTION_TYPE } from '../types'

export const useCollectionFilter = (
    hiddenInfo: proof[],
    collections: Array<Web3Helper.NonFungibleTokenScope<void, NetworkPluginID>>,
    type: COLLECTION_TYPE,
    currentVisitingProfile?: IdentityResolved,
    address?: string,
) => {
    if (!address || !currentVisitingProfile) return []
    const proof = hiddenInfo?.find(
        (proof) =>
            proof?.platform === NextIDPlatform.Twitter &&
            proof?.identity === currentVisitingProfile?.identifier?.userId?.toLowerCase(),
    )

    const hiddenList = proof?.content?.[PluginId.Web3Profile]?.unListedCollections?.[address]?.[type] ?? []
    return collections?.filter(
        (collection) => hiddenList?.findIndex((url) => url === `${collection?.address}+${collection?.tokenId}`) === -1,
    )
}
