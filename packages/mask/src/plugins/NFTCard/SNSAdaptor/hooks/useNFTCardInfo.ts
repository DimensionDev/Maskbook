import { useState } from 'react'
import {
    useNonFungibleAsset,
    useNonFungibleOrders,
    useNonFungibleEvents,
    useNonFungibleRarity,
} from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export function useNFTCardInfo(address?: string, tokenId?: string, source?: SourceType) {
    const [provider, setProvider] = useState(source ?? SourceType.Gem)
    console.log(provider, 'hhh')
    const asset = useNonFungibleAsset(NetworkPluginID.PLUGIN_EVM, address ?? '', tokenId ?? '', {
        sourceType: provider,
        chainId: ChainId.Mainnet,
    })

    const orders = useNonFungibleOrders(NetworkPluginID.PLUGIN_EVM, address ?? '', tokenId ?? '', {
        sourceType: provider,
        chainId: ChainId.Mainnet,
    })

    const events = useNonFungibleEvents(NetworkPluginID.PLUGIN_EVM, address ?? '', tokenId ?? '', {
        sourceType: provider,
        chainId: ChainId.Mainnet,
    })
    const rarity = useNonFungibleRarity(NetworkPluginID.PLUGIN_EVM, address ?? '', tokenId ?? '', {
        sourceType: provider,
        chainId: ChainId.Mainnet,
    })
    return {
        asset,
        orders,
        events,
        rarity,
        provider,
        setProvider,
    }
}
