import { useChainId } from '@masknet/web3-shared-evm'
import { useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useUpdateEffect } from 'react-use'
import { Trader } from '../../../../../plugins/Trader/SNSAdaptor/trader/Trader'
import { TradeContext, useTradeContext } from '../../../../../plugins/Trader/trader/useTradeContext'
import { useCurrentTradeProvider } from '../../../../../plugins/Trader/trending/useCurrentTradeProvider'
import type { Coin } from '../../../../../plugins/Trader/types'
import { PopupRoutes } from '@masknet/shared-base'

export function SwapBox() {
    const location = useLocation()
    const history = useHistory()
    const chainId = useChainId()
    const tradeProvider = useCurrentTradeProvider(chainId)
    const tradeContext = useTradeContext(tradeProvider)

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
            <Trader coin={coin} chainId={chainId} />
        </TradeContext.Provider>
    )
}
