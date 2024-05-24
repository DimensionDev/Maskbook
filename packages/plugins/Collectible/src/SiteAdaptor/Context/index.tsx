import { useMemo, useState } from 'react'
import { createContainer } from '@masknet/shared-base-ui'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import {
    useNonFungibleAsset,
    useNonFungibleListings,
    useNonFungibleEvents,
    useNonFungibleRarity,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { SourceType } from '@masknet/web3-shared-base'

interface InitialState {
    parentPluginID: NetworkPluginID
    pluginID: NetworkPluginID
    chainId: Web3Helper.ChainIdAll
    tokenId: string
    tokenAddress: string
    ownerAddress?: string
    origin?: string
}

function useContext(initialState?: InitialState) {
    const { parentPluginID, pluginID, chainId, tokenId, tokenAddress, ownerAddress, origin } = initialState ?? {}
    const [sourceType, setSourceType] = useState<SourceType>()

    const asset = useNonFungibleAsset(pluginID, tokenAddress, tokenId, {
        chainId,
        account: ownerAddress,
    })
    const orders = useNonFungibleListings(pluginID, tokenAddress, tokenId, {
        chainId,
        account: ownerAddress,
        sourceType,
    })
    const offers = useMemo(() => orders.data?.pages.flatMap((x) => x.data) ?? EMPTY_LIST, [orders.data?.pages])
    const events = useNonFungibleEvents(pluginID, tokenAddress, tokenId, {
        chainId,
        account: ownerAddress,
    })
    const rarity = useNonFungibleRarity(pluginID, tokenAddress, tokenId, {
        chainId,
        account: ownerAddress,
    })

    return {
        parentPluginID,

        pluginID,
        chainId,

        origin,

        sourceType,
        setSourceType,

        tokenId,
        tokenAddress,
        ownerAddress,

        asset,
        orders,
        offers,
        events,
        rarity,
    }
}

export const Context = createContainer(useContext)
Context.Provider.displayName = 'CollectibleContextProvider'
