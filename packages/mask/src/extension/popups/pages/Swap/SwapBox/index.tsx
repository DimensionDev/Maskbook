import type { TradeProvider } from '@masknet/public-api'
import { useChainId } from '@masknet/web3-shared-evm'
import { useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useUpdateEffect } from 'react-use'
import { currentTradeProviderSettings } from '../../../../../plugins/Trader/settings'
import type { FootnoteMenuOption } from '../../../../../plugins/Trader/SNSAdaptor/trader/FootnoteMenu'
import { Trader } from '../../../../../plugins/Trader/SNSAdaptor/trader/Trader'
import { TradeContext, useTradeContext } from '../../../../../plugins/Trader/trader/useTradeContext'
import { useAvailableTraderProviders } from '../../../../../plugins/Trader/trending/useAvailableTraderProviders'
import { useCurrentTradeProvider } from '../../../../../plugins/Trader/trending/useCurrentTradeProvider'
import { Coin, TagType } from '../../../../../plugins/Trader/types'
import { PopupRoutes } from '@masknet/shared-base'

export function SwapBox() {
    const location = useLocation()
    const history = useHistory()
    const chainId = useChainId()
    const tradeProvider = useCurrentTradeProvider(chainId)
    const tradeContext = useTradeContext(tradeProvider)
    const { value: tradeProviders = [] } = useAvailableTraderProviders(TagType.CASH, 'MASK')

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

    const onTradeProviderChange = useCallback((option: FootnoteMenuOption) => {
        currentTradeProviderSettings.value = option.value as TradeProvider
    }, [])

    return (
        <TradeContext.Provider value={tradeContext}>
            <Trader coin={coin} />
        </TradeContext.Provider>
    )
}
