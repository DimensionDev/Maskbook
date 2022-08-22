import { PluginId } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import type { CollectionType } from '@masknet/web3-providers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { differenceWith } from 'lodash-unified'
import { useMemo } from 'react'
import type { Proof } from '../types'

export const useAvailableCollections = (
    proofs: Proof[],
    collections: Array<Web3Helper.NonFungibleTokenScope<void, NetworkPluginID>>,
    type: CollectionType,
    twitterId?: string,
    address?: string,
) => {
    return useMemo(() => {
        if (!address || !twitterId) return EMPTY_LIST

        const proof = proofs.find(
            (x) => x.platform === NextIDPlatform.Twitter && x.identity === twitterId.toLowerCase(),
        )
        const hiddenList =
            proof?.content?.[PluginId.Web3Profile]?.unListedCollections?.[address.toLowerCase()]?.[type] ?? []
        if (!hiddenList.length) return collections
        return differenceWith(
            collections,
            hiddenList,
            (collection, id) => `${collection.id}_${collection.tokenId}` === id,
        )
    }, [address, twitterId, type, proofs, collections])
}
