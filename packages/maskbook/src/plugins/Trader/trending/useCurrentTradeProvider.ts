import { useEffect, useState } from 'react'
import { useValueRef } from '@dimensiondev/maskbook-shared'
import { currentTradeProviderSettings } from '../settings'
import { TradeProvider } from '../types'

export function useCurrentTradeProvider(availableTradeProviders: TradeProvider[]) {
    const [tradeProvider, setTradeProvider] = useState(
        availableTradeProviders.length ? availableTradeProviders[0] : TradeProvider.UNISWAP,
    )
    const currentTradeProvider = useValueRef(currentTradeProviderSettings)

    // sync trade provider
    useEffect(() => {
        // cached trade provider unavailable
        if (!availableTradeProviders.includes(currentTradeProvider)) return
        setTradeProvider(currentTradeProvider)
    }, [availableTradeProviders.sort().join(','), currentTradeProvider])
    return tradeProvider
}
