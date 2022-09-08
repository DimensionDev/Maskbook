import { useState } from 'react'
import {
    useNonFungibleAsset,
    useNonFungibleOrders,
    useNonFungibleEvents,
    useNonFungibleRarity,
} from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'

export function useNFTCardInfo(address?: string, tokenId?: string, source?: SourceType) {
    const [provider, setProvider] = useState(source ?? SourceType.Gem)
    const asset = useNonFungibleAsset(NetworkPluginID.PLUGIN_EVM, address ?? '', tokenId ?? '')
    const orders = useNonFungibleOrders(NetworkPluginID.PLUGIN_EVM, address ?? '', tokenId ?? '')
    const events = useNonFungibleEvents(NetworkPluginID.PLUGIN_EVM, address ?? '', tokenId ?? '')
    const rarity = useNonFungibleRarity(NetworkPluginID.PLUGIN_EVM, address ?? '', tokenId ?? '')

    return {
        asset,
        orders,
        events,
        rarity,
        provider,
        setProvider,
    }
}
