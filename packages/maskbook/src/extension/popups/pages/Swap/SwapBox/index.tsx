import { useState, useMemo } from 'react'
import type { TradeProvider } from '@masknet/public-api'
import { Trader } from '../../../../../plugins/Trader/SNSAdaptor/trader/Trader'
import { TradeFooter } from '../../../../../plugins/Trader/SNSAdaptor/trader/TradeFooter'
import { TradeContext, useTradeContext } from '../../../../../plugins/Trader/trader/useTradeContext'
import { SettingsDialog } from '../../../../../plugins/Trader/SNSAdaptor/trader/SettingsDialog'
import { useCurrentTradeProvider } from '../../../../../plugins/Trader/trending/useCurrentTradeProvider'
import { useAvailableTraderProviders } from '../../../../../plugins/Trader/trending/useAvailableTraderProviders'
import { SelectTokenDialog } from '../../../../../plugins/Wallet/SNSAdaptor/SelectTokenDialog'
import { WalletRiskWarningDialog } from '../../../../../plugins/Wallet/SNSAdaptor/RiskWarningDialog'
import { Coin, TagType } from '../../../../../plugins/Trader/types'
import { useLocation } from 'react-router'

export function SwapBox() {
    const location = useLocation()
    const [currentProvider, setCurrentProvider] = useState<TradeProvider | null>(null)
    const tradeProvider = useCurrentTradeProvider()
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
            <SelectTokenDialog />
            <SettingsDialog />
            <WalletRiskWarningDialog />
        </TradeContext.Provider>
    )
}
