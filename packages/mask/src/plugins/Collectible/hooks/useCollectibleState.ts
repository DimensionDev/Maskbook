import { useState } from 'react'
import { createContainer } from 'unstated-next'
import type { CollectibleToken } from '../types'
import {
    useNonFungibleAsset,
    useNonFungibleOrders,
    useNonFungibleEvents,
    useNonFungibleRarity,
} from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

function useCollectibleState(token?: CollectibleToken) {
    const [provider, setProvider] = useState(token?.provider ?? SourceType.Gem)

    const asset = useNonFungibleAsset(NetworkPluginID.PLUGIN_EVM, token?.contractAddress ?? '', token?.tokenId ?? '', {
        sourceType: provider,
        chainId: ChainId.Mainnet,
    })

    const orders = useNonFungibleOrders(
        NetworkPluginID.PLUGIN_EVM,
        token?.contractAddress ?? '',
        token?.tokenId ?? '',
        {
            sourceType: provider,
            chainId: ChainId.Mainnet,
        },
    )

    const events = useNonFungibleEvents(
        NetworkPluginID.PLUGIN_EVM,
        token?.contractAddress ?? '',
        token?.tokenId ?? '',
        {
            sourceType: provider,
            chainId: ChainId.Mainnet,
        },
    )
    const rarity = useNonFungibleRarity(
        NetworkPluginID.PLUGIN_EVM,
        token?.contractAddress ?? '',
        token?.tokenId ?? '',
        {
            sourceType: SourceType.Gem,
            chainId: ChainId.Mainnet,
        },
    )

    return {
        token,
        asset,
        orders,
        events,
        rarity,
        provider,
        setProvider,
    }
}

export const CollectibleState = createContainer(useCollectibleState)
