import { useState } from 'react'
import {
    useChainId,
    useNonFungibleAsset,
    useNonFungibleOrders,
    useNonFungibleEvents,
    useNonFungibleRarity,
    useCurrentWeb3NetworkPluginID,
} from '@masknet/plugin-infra/web3'
import { SourceType } from '@masknet/web3-shared-base'

export function useNFTCardInfo(address: string, tokenId?: string, source?: SourceType) {
    const [provider, setProvider] = useState(source ?? SourceType.Gem)
    const chainId = useChainId()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const asset = useNonFungibleAsset(pluginID, address, tokenId, {
        chainId,
    })
    const orders = useNonFungibleOrders(pluginID, address, tokenId, {
        chainId,
    })
    const events = useNonFungibleEvents(pluginID, address, tokenId, {
        chainId,
    })
    const rarity = useNonFungibleRarity(pluginID, address, tokenId, {
        chainId,
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
