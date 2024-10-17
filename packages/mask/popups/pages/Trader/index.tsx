import {
    BridgeConfirm,
    BridgeQuoteRoute,
    Confirm,
    HistoryView,
    NetworkFee,
    QuoteRoute,
    RoutePaths,
    SelectLiquidity,
    Slippage,
    TradeView,
    TradingRoute,
    Transaction,
    Providers,
} from '@masknet/plugin-trader'
import { RestorableScrollContext } from '@masknet/shared'
import { memo, Suspense } from 'react'
import { Outlet, type RouteObject } from 'react-router-dom'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder/index.js'
import { Header } from './Header.js'

export const traderRoutes: RouteObject[] = [
    { index: true, element: <TradeView /> },
    { path: RoutePaths.Trade, element: <TradeView /> },
    { path: RoutePaths.History, element: <HistoryView /> },
    { path: RoutePaths.Confirm, element: <Confirm /> },
    { path: RoutePaths.BridgeConfirm, element: <BridgeConfirm /> },
    { path: RoutePaths.SelectLiquidity, element: <SelectLiquidity /> },
    { path: RoutePaths.Slippage, element: <Slippage /> },
    { path: RoutePaths.QuoteRoute, element: <QuoteRoute /> },
    { path: RoutePaths.BridgeQuoteRoute, element: <BridgeQuoteRoute /> },
    { path: RoutePaths.TradingRoute, element: <TradingRoute /> },
    { path: RoutePaths.NetworkFee, element: <NetworkFee /> },
    { path: RoutePaths.Transaction, element: <Transaction /> },
].map((x) => ({
    ...x,
    path: x.path ? x.path.slice(1) : undefined,
}))
export const TraderFrame = memo(function TraderFrame() {
    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <RestorableScrollContext>
                <Providers>
                    <Header />
                    <Outlet />
                </Providers>
            </RestorableScrollContext>
        </Suspense>
    )
})
