import { Navigate, Route, Routes } from 'react-router-dom'
import { RoutePaths } from '../constants.js'
import { Main } from './Main.js'
import { UserDetail } from './UserDetail.js'
import { Order } from './Order.js'

export function FriendTechRoutes() {
    return (
        <Routes>
            <Route path={RoutePaths.Main} element={<Main />} />
            <Route path={RoutePaths.Detail} element={<UserDetail />} />
            <Route path={RoutePaths.Order} element={<Order />} />
            {/* If router is embedded inside a dialog, */}
            {/* which should know it's time to close itself once we enter Exit */}
            <Route path={RoutePaths.Exit} element={null} />
            <Route path="*" element={<Navigate replace to={RoutePaths.Main} />} />
        </Routes>
    )
}
