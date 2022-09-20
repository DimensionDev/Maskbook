import { useState } from 'react'
import { createContainer } from 'unstated-next'
import {
    useNonFungibleAsset,
    useNonFungibleOrders,
    useNonFungibleEvents,
    useNonFungibleRarity,
} from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import type { CollectibleToken } from '../../../types.js'

function useContext(token?: CollectibleToken) {
    const [pluginID, setPluginID] = useState(NetworkPluginID.PLUGIN_EVM)
    const [chainId, setChainId] = useState(ChainId.Mainnet)
    const [provider, setProvider] = useState(SourceType.NFTScan)

    const asset = useNonFungibleAsset(pluginID, token?.contractAddress ?? '', token?.tokenId ?? '', {
        chainId,
    })

    const orders = useNonFungibleOrders(pluginID, token?.contractAddress ?? '', token?.tokenId ?? '', {
        chainId,
    })

    const events = useNonFungibleEvents(pluginID, token?.contractAddress ?? '', token?.tokenId ?? '', {
        chainId,
    })
    const rarity = useNonFungibleRarity(pluginID, token?.contractAddress ?? '', token?.tokenId ?? '', {
        chainId,
        sourceType: SourceType.Gem,
    })

    return {
        token,
        asset,
        orders,
        events,
        rarity,

        chainId,
        setChainId,

        pluginID,
        setPluginID,

        provider,
        setProvider,
    }
}

export const Context = createContainer(useContext)
