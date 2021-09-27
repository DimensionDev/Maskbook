import { useState, useMemo } from 'react'
import type { TradeProvider } from '@masknet/public-api'
import { Trader } from '../../../../../plugins/Trader/SNSAdaptor/trader/Trader'
import { TradeFooter } from '../../../../../plugins/Trader/SNSAdaptor/trader/TradeFooter'
import { TradeContext, useTradeContext } from '../../../../../plugins/Trader/trader/useTradeContext'
import { useCurrentTradeProvider } from '../../../../../plugins/Trader/trending/useCurrentTradeProvider'
import { useAvailableTraderProviders } from '../../../../../plugins/Trader/trending/useAvailableTraderProviders'
import { TagType } from '../../../../../plugins/Trader/types'

export function SwapBox() {
    const [currentProvider, setCurrentProvider] = useState<TradeProvider | null>(null)
    const tradeProvider = useCurrentTradeProvider()
    const tradeContext = useTradeContext(tradeProvider)
    const { value: tradeProviders = [] } = useAvailableTraderProviders(TagType.CASH, 'MASK')

    const provider = useMemo(() => {
        return currentProvider ?? tradeProvider
    }, [currentProvider, tradeProvider])

    return (
        <TradeContext.Provider value={tradeContext}>
            <Trader />
            <TradeFooter
                showDataProviderIcon={false}
                showTradeProviderIcon
                tradeProvider={provider}
                tradeProviders={tradeProviders}
                onTradeProviderChange={(newProvider) => setCurrentProvider(newProvider.value)}
            />
        </TradeContext.Provider>
    )
}
