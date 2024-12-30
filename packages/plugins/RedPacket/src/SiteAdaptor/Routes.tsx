import { Navigate, Route, Routes } from 'react-router-dom'
import { RoutePaths } from '../constants.js'
import { CreateTokenRedPacket } from './views/CreateTokenRedPacket.js'
import { CreateNftRedPacket } from './views/CreateNftRedPacket.js'
import { CustomCover } from './views/CustomCover.js'
import { TokenRedPacketConfirm } from './views/TokenRedPacketConfirm.js'
import { History } from './views/History.js'
import { HistoryDetail } from './views/HistoryDetail.js'
import { NftHistory } from './views/NftHistory.js'
import { NftRedPacketConfirm } from './views/NftRedPacketConfirm.js'
import { SelectCollectibles } from './views/SelectCollectibles.js'

export function RedPacketRoutes() {
    return (
        <Routes>
            <Route path={RoutePaths.Create}>
                <Route index path={RoutePaths.CreateTokenRedPacket} element={<CreateTokenRedPacket />} />
                <Route path={RoutePaths.CreateNftRedPacket} element={<CreateNftRedPacket />} />
            </Route>
            <Route path={RoutePaths.CustomCover} element={<CustomCover />} />
            <Route path={RoutePaths.SelectCollectibles} element={<SelectCollectibles />} />
            <Route path={RoutePaths.History}>
                <Route index element={<History />} />
                <Route path={RoutePaths.HistoryDetail} element={<HistoryDetail />} />
            </Route>
            <Route path={RoutePaths.NftHistory} element={<NftHistory />} />
            <Route path={RoutePaths.Confirm}>
                <Route index path={RoutePaths.ConfirmTokenRedPacket} element={<TokenRedPacketConfirm />} />
                <Route path={RoutePaths.ConfirmNftRedPacket} element={<NftRedPacketConfirm />} />
            </Route>
            {/* If router is embedded inside a dialog, */}
            {/* which should know it's time to close itself once we enter Exit */}
            <Route path={RoutePaths.Exit} element={null} />
            <Route path="*" element={<Navigate replace to={RoutePaths.CreateTokenRedPacket} />} />
        </Routes>
    )
}
