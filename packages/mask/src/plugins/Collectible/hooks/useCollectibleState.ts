import { useState } from 'react'
import { createContainer } from 'unstated-next'
import type { CollectibleToken } from '../types'
import { useNonFungibleAsset, useNonFungibleOrders, useNonFungibleEvents } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

function useCollectibleState(token?: CollectibleToken) {
    const [provider, setProvider] = useState(token?.provider ?? SourceType.OpenSea)

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
    console.log(asset, orders, events, 'data')
    return {
        token,
        asset,
        orders,
        events,
        provider,
        setProvider,
    }
}

export const CollectibleState = createContainer(useCollectibleState)
