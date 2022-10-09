import { useState } from 'react'
import { createContainer } from 'unstated-next'
import {
    useNonFungibleAsset,
    useNonFungibleOrders,
    useNonFungibleEvents,
    useNonFungibleRarity,
} from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'

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
    const [sourceType, setSourceType] = useState(SourceType.NFTScan)

    const asset = useNonFungibleAsset(pluginID, tokenAddress, tokenId, {
        chainId,
        account: ownerAddress,
    })
    const orders = useNonFungibleOrders(pluginID, tokenAddress, tokenId, {
        chainId,
        account: ownerAddress,
    })
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

        asset,
        orders,
        events,
        rarity,
    }
}

export const Context = createContainer(useContext)
