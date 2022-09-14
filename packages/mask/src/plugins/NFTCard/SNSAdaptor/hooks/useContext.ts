import { createContainer } from 'unstated-next'
import {
    useNonFungibleAsset,
    useNonFungibleOrders,
    useNonFungibleEvents,
    useNonFungibleRarity,
    useChainId,
    useCurrentWeb3NetworkPluginID,
} from '@masknet/plugin-infra/web3'

function useContext(initialState?: { tokenId?: string; tokenAddress?: string }) {
    const { tokenAddress, tokenId } = initialState ?? {}
    const pluginID = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()

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

        tokenAddress,
        tokenId,

        asset,
        orders,
        events,
        rarity,
    }
}

export const Context = createContainer(useContext)
