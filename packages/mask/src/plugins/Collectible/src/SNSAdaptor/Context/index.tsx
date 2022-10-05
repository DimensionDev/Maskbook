import { useState } from 'react'
import { createContainer } from 'unstated-next'
import type { NetworkPluginID } from '@masknet/shared-base'
import {
    useNonFungibleAsset,
    useNonFungibleOrders,
    useNonFungibleEvents,
    useNonFungibleRarity,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SourceType } from '@masknet/web3-shared-base'

interface InitialState {
    pluginID: NetworkPluginID
    chainId: Web3Helper.ChainIdAll
    tokenId: string
    tokenAddress: string
    origin?: string
}

function useContext(initialState?: InitialState) {
    const { pluginID, chainId, tokenId, tokenAddress, origin } = initialState ?? {}
    const [sourceType, setSourceType] = useState(SourceType.NFTScan)

    const asset = useNonFungibleAsset(pluginID, tokenAddress, tokenId, {
        chainId,
    })
    const orders = useNonFungibleOrders(pluginID, tokenAddress, tokenId, {
        chainId,
    })
    const events = useNonFungibleEvents(pluginID, tokenAddress, tokenId, {
        chainId,
    })
    const rarity = useNonFungibleRarity(pluginID, tokenAddress, tokenId, {
        chainId,
    })

    return {
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
