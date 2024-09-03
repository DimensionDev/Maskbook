import { Navigate, Route, Routes } from 'react-router-dom'
import { RoutePaths } from '../constants.js'
import { SwapView } from './views/Swap/index.js'
import { HistoryView } from './views/History.js'
import { Confirm } from './views/Confirm.js'

export function ExchangeRoutes() {
    return (
        <Routes>
            <Route path={RoutePaths.Swap} element={<SwapView />} />
            <Route path={RoutePaths.History} element={<HistoryView />} />
            <Route path={RoutePaths.Confirm} element={<Confirm />} />
            {/* If router is embedded inside a dialog, */}
            {/* which should know it's time to close itself once we enter Exit */}
            <Route path={RoutePaths.Exit} element={null} />
            <Route path="*" element={<Navigate replace to={RoutePaths.Swap} />} />
        </Routes>
    )
}
