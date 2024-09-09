import { Navigate, Route, Routes } from 'react-router-dom'
import { RoutePaths } from '../constants.js'
import { Confirm } from './views/Confirm.js'
import { HistoryView } from './views/History.js'
import { NetworkFee } from './views/NetworkFee.js'
import { QuoteRoute } from './views/QuoteRoute.js'
import { SelectLiquidity } from './views/SelectLiquidity.js'
import { Slippage } from './views/Slippage.js'
import { SwapView } from './views/Swap/index.js'
import { TradingRoute } from './views/TradingRoute.js'
import { Transaction } from './views/Transaction.js'

export function ExchangeRoutes() {
    return (
        <Routes>
            <Route path={RoutePaths.Swap} element={<SwapView />} />
            <Route path={RoutePaths.History} element={<HistoryView />} />
            <Route path={RoutePaths.Confirm} element={<Confirm />} />
            <Route path={RoutePaths.SelectLiquidity} element={<SelectLiquidity />} />
            <Route path={RoutePaths.Slippage} element={<Slippage />} />
            <Route path={RoutePaths.QuoteRoute} element={<QuoteRoute />} />
            <Route path={RoutePaths.TradingRoute} element={<TradingRoute />} />
            <Route path={RoutePaths.NetworkFee} element={<NetworkFee />} />
            <Route path={RoutePaths.Transaction} element={<Transaction />} />
            {/* If router is embedded inside a dialog, */}
            {/* which should know it's time to close itself once we enter Exit */}
            <Route path={RoutePaths.Exit} element={null} />
            <Route path="*" element={<Navigate replace to={RoutePaths.Swap} />} />
        </Routes>
    )
}
