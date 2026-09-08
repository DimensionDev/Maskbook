import { RoutePaths } from '@masknet/plugin-trader'
import type { RouteObject } from 'react-router-dom'

const loadTrader = () => import('./index.js')

export const traderRoutes: RouteObject[] = [
    { index: true, lazy: async () => ({ Component: (await loadTrader()).TradeView }) },
    { path: RoutePaths.Trade.slice(1), lazy: async () => ({ Component: (await loadTrader()).TradeView }) },
    { path: RoutePaths.History.slice(1), lazy: async () => ({ Component: (await loadTrader()).HistoryView }) },
    { path: RoutePaths.Confirm.slice(1), lazy: async () => ({ Component: (await loadTrader()).Confirm }) },
    { path: RoutePaths.BridgeConfirm.slice(1), lazy: async () => ({ Component: (await loadTrader()).BridgeConfirm }) },
    {
        path: RoutePaths.SelectLiquidity.slice(1),
        lazy: async () => ({ Component: (await loadTrader()).SelectLiquidity }),
    },
    { path: RoutePaths.Slippage.slice(1), lazy: async () => ({ Component: (await loadTrader()).Slippage }) },
    { path: RoutePaths.QuoteRoute.slice(1), lazy: async () => ({ Component: (await loadTrader()).QuoteRoute }) },
    {
        path: RoutePaths.BridgeQuoteRoute.slice(1),
        lazy: async () => ({ Component: (await loadTrader()).BridgeQuoteRoute }),
    },
    {
        path: RoutePaths.TradingRoute.slice(1),
        lazy: async () => ({ Component: (await loadTrader()).TradingRoute }),
    },
    { path: RoutePaths.NetworkFee.slice(1), lazy: async () => ({ Component: (await loadTrader()).NetworkFee }) },
    {
        path: RoutePaths.Transaction.slice(1),
        lazy: async () => ({ Component: (await loadTrader()).Transaction }),
    },
]
