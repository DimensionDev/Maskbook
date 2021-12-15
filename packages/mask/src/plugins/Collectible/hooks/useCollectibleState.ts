import { useRef, useState } from 'react'
import { createContainer } from 'unstated-next'
import { OrderSide } from 'opensea-js/lib/types'
import { currentCollectibleProviderSettings } from '../settings'
import { CollectibleTab, CollectibleToken } from '../types'
import { useAsset, useHistory, useOrders } from '../../EVM/hooks'
import { useAssetOrder } from './useAssetOrder'
import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm/types'

function useCollectibleState(token?: CollectibleToken) {
    const [tabIndex, setTabIndex] = useState(CollectibleTab.ARTICLE)

    currentCollectibleProviderSettings.value = token?.provider ?? NonFungibleAssetProvider.OPENSEA

    const asset = useAsset(
        token?.contractAddress ?? '',
        token?.tokenId ?? '',
        token?.provider ?? NonFungibleAssetProvider.OPENSEA,
    )

    //#region asset order from sdk
    const assetOrder = useAssetOrder(token?.provider ?? NonFungibleAssetProvider.OPENSEA, token)
    //#endregion

    //#region offers
    const [offerPage, setOfferPage] = useState(0)
    const offers = useOrders(
        currentCollectibleProviderSettings.value,
        offerPage,
        50,
        tabIndex === CollectibleTab.OFFER ? token?.contractAddress : undefined,
        tabIndex === CollectibleTab.OFFER ? token?.tokenId : undefined,
        OrderSide.Buy,
    )
    //#endregion

    //#region orders
    const [orderPage, setOrderPage] = useState(0)
    const orders = useOrders(
        currentCollectibleProviderSettings.value,
        orderPage,
        50,
        tabIndex === CollectibleTab.LISTING ? token?.contractAddress : undefined,
        tabIndex === CollectibleTab.LISTING ? token?.tokenId : undefined,
        OrderSide.Sell,
    )
    //#endregion

    //#region events
    const [eventPage, setEventPage] = useState(0)
    const cursors = useRef<string[]>([])
    const events = useHistory(
        currentCollectibleProviderSettings.value,
        eventPage,
        50,
        tabIndex === CollectibleTab.HISTORY ? token?.contractAddress : undefined,
        tabIndex === CollectibleTab.HISTORY ? token?.tokenId : undefined,
    )
    //#endregion

    return {
        token,
        asset,
        provider: token?.provider ?? NonFungibleAssetProvider.OPENSEA,

        assetOrder,

        tabIndex,
        setTabIndex,

        offers,
        offerPage,
        setOfferPage,

        orders,
        orderPage,
        setOrderPage,

        events,
        eventPage,
        setEventPage,
    }
}

export const CollectibleState = createContainer(useCollectibleState)
