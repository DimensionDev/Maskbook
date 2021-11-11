import { useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { createContainer } from 'unstated-next'
import { OrderSide } from 'opensea-js/lib/types'
import { useValueRef } from '@masknet/shared'
import { currentCollectibleProviderSettings } from '../settings'
import { CollectibleTab, CollectibleToken } from '../types'
import { useAsset } from './useAsset'
import { useEvents } from './useEvents'
import { useAssetOrder } from './useAssetOrder'

function useCollectibleState(token?: CollectibleToken) {
    const [tabIndex, setTabIndex] = useState(CollectibleTab.ARTICLE)

    const provider = useValueRef(currentCollectibleProviderSettings)
    const asset = useAsset(provider, token)

    //#region asset order
    const assetOrder = useAssetOrder(provider, token)
    //#endregion

    //#region offers
    const [offerPage, setOfferPage] = useState(0)
    const offers = useMemo(() => {
        if (!asset.value?.orders) return []
        const _orders = asset.value?.orders?.filter((x) => x.side === OrderSide.Buy)

        return _orders.slice(offerPage * 10, (offerPage + 1) * 10)
    }, [asset.value?.orders, offerPage])
    //#endregion

    //#region orders
    const [orderPage, setOrderPage] = useState(0)
    const orders = useMemo(() => {
        if (!asset.value?.orders) return []
        const _orders = asset.value?.orders?.filter((x) => x.side === OrderSide.Sell)

        return _orders.slice(orderPage * 10, (orderPage + 1) * 10)
    }, [asset.value?.orders, orderPage])
    //#endregion

    //#region events
    const [eventPage, setEventPage] = useState(0)
    const cursors = useRef<string[]>([])
    const events = useEvents(
        provider,
        tabIndex === CollectibleTab.HISTORY ? token : undefined,
        cursors.current[eventPage - 1],
    )

    useUpdateEffect(() => {
        if (
            events.value?.pageInfo.endCursor &&
            !cursors.current.some((item) => events.value && item === events.value.pageInfo.endCursor)
        ) {
            cursors.current.push(events.value.pageInfo.endCursor)
        }
    }, [events, cursors])
    //#endregion

    return {
        token,
        asset,
        provider,

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
