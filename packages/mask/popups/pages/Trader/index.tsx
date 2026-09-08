import { Providers, RuntimeProvider } from '@masknet/plugin-trader'
import { RestorableScrollContext } from '@masknet/shared'
import { memo, Suspense, type PropsWithChildren } from 'react'
import { Outlet } from 'react-router-dom'
import { LoadingPlaceholder } from '@masknet/injected-ui/LoadingPlaceholder'
import { Header } from './Header.js'
import { useImplementRuntime } from './useImplementRuntime.js'
import '../../initialization/trader.js'

export {
    BridgeConfirm,
    BridgeQuoteRoute,
    Confirm,
    HistoryView,
    NetworkFee,
    QuoteRoute,
    SelectLiquidity,
    Slippage,
    TradeView,
    TradingRoute,
    Transaction,
} from '@masknet/plugin-trader'

function Runtime({ children }: PropsWithChildren) {
    const runtime = useImplementRuntime()
    return <RuntimeProvider runtime={runtime}>{children}</RuntimeProvider>
}

export const TraderFrame = memo(function TraderFrame() {
    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <RestorableScrollContext>
                <Providers>
                    <Runtime>
                        <Header />
                        <Outlet />
                    </Runtime>
                </Providers>
            </RestorableScrollContext>
        </Suspense>
    )
})
