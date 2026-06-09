import { Navigate, Route, Routes } from 'react-router-dom'
import { RoutePaths } from '../constants.js'
import { CreateTokenRedPacket } from './views/CreateTokenRedPacket.js'
import { CustomCover } from './views/CustomCover.js'
import { TokenRedPacketConfirm } from './views/TokenRedPacketConfirm.js'
import { History } from './views/History.js'
import { HistoryDetail } from './views/HistoryDetail.js'

export function RedPacketRoutes() {
    return (
        <Routes>
            <Route path={RoutePaths.Create}>
                <Route index path={RoutePaths.CreateTokenRedPacket} element={<CreateTokenRedPacket />} />
            </Route>
            <Route path={RoutePaths.CustomCover} element={<CustomCover />} />
            <Route path={RoutePaths.History}>
                <Route index element={<History />} />
                <Route path={RoutePaths.HistoryDetail} element={<HistoryDetail />} />
            </Route>
            <Route path={RoutePaths.Confirm}>
                <Route index path={RoutePaths.ConfirmTokenRedPacket} element={<TokenRedPacketConfirm />} />
            </Route>
            {/* If router is embedded inside a dialog, */}
            {/* which should know it's time to close itself once we enter Exit */}
            <Route path={RoutePaths.Exit} element={null} />
            <Route path="*" element={<Navigate replace to={RoutePaths.CreateTokenRedPacket} />} />
        </Routes>
    )
}
