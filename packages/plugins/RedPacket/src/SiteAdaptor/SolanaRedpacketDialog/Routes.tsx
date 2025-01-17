import { Route, Routes, Navigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { CreateSolRedPacket } from './CreateRedpacket.js'
import { SolanaRedPacketConfirm } from './RedpacketConfirm.js'
import { CustomCover } from '../views/CustomCover.js'
import { History } from '../views/History.js'
import { HistoryDetail } from '../views/HistoryDetail.js'

export function SolRedPacketRoutes() {
    return (
        <Routes>
            <Route path={RoutePaths.Create}>
                <Route index path={RoutePaths.CreateSolanaRedPacket} element={<CreateSolRedPacket />} />
            </Route>
            <Route path={RoutePaths.History}>
                <Route index element={<History />} />
                <Route path={RoutePaths.HistoryDetail} element={<HistoryDetail />} />
            </Route>
            <Route path={RoutePaths.CustomCover} element={<CustomCover />} />
            <Route path={RoutePaths.Confirm}>
                <Route path={RoutePaths.ConfirmSolanaRedPacket} element={<SolanaRedPacketConfirm />} />
            </Route>
            {/* If router is embedded inside a dialog, */}
            {/* which should know it's time to close itself once we enter Exit */}
            <Route path={RoutePaths.Exit} element={null} />
            <Route path="*" element={<Navigate replace to={RoutePaths.CreateSolanaRedPacket} />} />
        </Routes>
    )
}
