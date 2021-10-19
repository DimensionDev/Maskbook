import { useState, useMemo } from 'react'
import { useUpdateEffect } from 'react-use'
import { useLocation, useHistory } from 'react-router-dom'
import type { TradeProvider } from '@masknet/public-api'
import { useChainId } from '@masknet/web3-shared-evm'
import { Trader } from '../../../../../plugins/Trader/SNSAdaptor/trader/Trader'
import { TradeFooter } from '../../../../../plugins/Trader/SNSAdaptor/trader/TradeFooter'
import { TradeContext, useTradeContext } from '../../../../../plugins/Trader/trader/useTradeContext'
import { useCurrentTradeProvider } from '../../../../../plugins/Trader/trending/useCurrentTradeProvider'
import { useAvailableTraderProviders } from '../../../../../plugins/Trader/trending/useAvailableTraderProviders'
import { Coin, TagType } from '../../../../../plugins/Trader/types'
import { PopupRoutes } from '../../../index'

export function SwapBox() {
    const location = useLocation()
    const history = useHistory()
    const chainId = useChainId()
    const [currentProvider, setCurrentProvider] = useState<TradeProvider | null>(null)
    const tradeProvider = useCurrentTradeProvider(chainId)
    const tradeContext = useTradeContext(tradeProvider)
    const { value: tradeProviders = [] } = useAvailableTraderProviders(TagType.CASH, 'MASK')

    const provider = useMemo(() => {
        return currentProvider ?? tradeProvider
    }, [currentProvider, tradeProvider])

    const coin = useMemo(() => {
        if (!location.search) return undefined
        const params = new URLSearchParams(location.search)
        return {
            id: params.get('id'),
            name: params.get('name'),
            symbol: params.get('symbol'),
            contract_address: params.get('contract_address'),
            decimals: Number.parseInt(params.get('decimals') ?? '0', 10),
        } as Coin
    }, [location])

    useUpdateEffect(() => {
        history.replace(PopupRoutes.Swap)
    }, [chainId])

    return (
        <TradeContext.Provider value={tradeContext}>
            <Trader coin={coin} />
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
