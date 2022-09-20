import { useState } from 'react'
import { createContainer } from 'unstated-next'
import {
    useNonFungibleAsset,
    useNonFungibleOrders,
    useNonFungibleEvents,
    useNonFungibleRarity,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'

interface InitialState {
    pluginID: NetworkPluginID
    chainId: Web3Helper.ChainIdAll
    tokenId: string
    tokenAddress: string
}

function useContext(initialState?: InitialState) {
    const { pluginID, chainId, tokenId, tokenAddress } = initialState ?? {}
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
