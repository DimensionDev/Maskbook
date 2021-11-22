import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { OrderSide } from 'opensea-js/lib/types'
import { CryptoartAITab, CryptoartAIToken } from '../types'
import { useAsset } from './useAsset'
import { useOrders } from './useOrders'
import { useEvents } from './useEvents'

function useCollectibleState(token?: CryptoartAIToken) {
    const [tabIndex, setTabIndex] = useState(CryptoartAITab.ARTICLE)

    const asset = useAsset(token)
    const offers = useOrders(tabIndex === CryptoartAITab.OFFER ? token : undefined, OrderSide.Buy)
    const events = useEvents(tabIndex === CryptoartAITab.HISTORY ? token : undefined)

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
