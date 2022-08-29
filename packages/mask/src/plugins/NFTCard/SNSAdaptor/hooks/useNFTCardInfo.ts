import { useState } from 'react'
import {
    useNonFungibleAsset,
    useNonFungibleOrders,
    useNonFungibleEvents,
    useNonFungibleRarity,
} from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export function useNFTCardInfo(address?: string, tokenId?: string, source?: SourceType, chainId?: ChainId) {
    const [provider, setProvider] = useState(source ?? SourceType.Gem)
    const _chainId = chainId ?? ChainId.Mainnet
    const asset = useNonFungibleAsset(NetworkPluginID.PLUGIN_EVM, address ?? '', tokenId ?? '', {
        sourceType: provider,
        chainId: _chainId,
    })

    const orders = useNonFungibleOrders(NetworkPluginID.PLUGIN_EVM, address ?? '', tokenId ?? '', {
        sourceType: provider,
        chainId: _chainId,
    })

    const events = useNonFungibleEvents(NetworkPluginID.PLUGIN_EVM, address ?? '', tokenId ?? '', {
        sourceType: provider,
        chainId: _chainId,
    })
    const rarity = useNonFungibleRarity(NetworkPluginID.PLUGIN_EVM, address ?? '', tokenId ?? '', {
        sourceType: provider,
        chainId: _chainId,
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
