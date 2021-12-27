import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { OrderSide } from 'opensea-js/lib/types'
import { TabState, Token } from '../types'
import { useAsset } from './useAsset'
import { useOrders } from './useOrders'
import { useEvents } from './useEvents'

function useCollectibleState(token?: Token) {
    const [tabIndex, setTabIndex] = useState(TabState.ARTICLE)

    const asset = useAsset(token)
    const offers = useOrders(tabIndex === TabState.OFFER ? token : undefined, OrderSide.Buy)
    const events = useEvents(token)

    return {
        token,
        asset,
        tabIndex,
        setTabIndex,
        offers,
        events,
    }
}

export const CollectibleState = createContainer(useCollectibleState)
