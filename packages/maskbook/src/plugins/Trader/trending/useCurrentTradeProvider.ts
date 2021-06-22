import { useEffect, useState } from 'react'
import { useValueRef } from '@masknet/shared'
import { currentTradeProviderSettings } from '../settings'
import { TradeProvider } from '../types'

export function useCurrentTradeProvider(availableTradeProviders: TradeProvider[]) {
    const [tradeProvider, setTradeProvider] = useState(
        availableTradeProviders.length ? availableTradeProviders[0] : TradeProvider.UNISWAP,
    )
    const currentTradeProvider = useValueRef(currentTradeProviderSettings)

    // sync the trade provider
    useEffect(() => {
        if (!availableTradeProviders.length) return
        setTradeProvider(
            availableTradeProviders.includes(currentTradeProvider) ? currentTradeProvider : availableTradeProviders[0],
        )
    }, [availableTradeProviders.sort().join(), currentTradeProvider])
    return tradeProvider
}
