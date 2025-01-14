import { Navigate, Route, Routes } from 'react-router-dom'
import { RoutePaths } from '../constants.js'
import { CreateERC20RedPacket } from './views/CreateERC20RedPacket.js'
import { CreateNftRedPacket } from './views/CreateNftRedPacket.js'
import { CustomCover } from './views/CustomCover.js'
import { Erc20RedPacketConfirm } from './views/Erc20RedPacketConfirm.js'
import { History } from './views/History.js'
import { HistoryDetail } from './views/HistoryDetail.js'
import { NftHistory } from './views/NftHistory.js'
import { NftRedPacketConfirm } from './views/NftRedPacketConfirm.js'
import { SelectNft } from './views/SelectNft.js'

export function RedPacketRoutes() {
    return (
        <Routes>
            <Route path={RoutePaths.Create}>
                <Route index path={RoutePaths.CreateErc20RedPacket} element={<CreateERC20RedPacket />} />
                <Route path={RoutePaths.CreateNftRedPacket} element={<CreateNftRedPacket />} />
            </Route>
            <Route path={RoutePaths.CustomCover} element={<CustomCover />} />
            <Route path={RoutePaths.SelectNft} element={<SelectNft />} />
            <Route path={RoutePaths.History}>
                <Route index element={<History />} />
                <Route path={RoutePaths.HistoryDetail} element={<HistoryDetail />} />
            </Route>
            <Route path={RoutePaths.NftHistory} element={<NftHistory />} />
            <Route path={RoutePaths.Confirm}>
                <Route index path={RoutePaths.ConfirmErc20RedPacket} element={<Erc20RedPacketConfirm />} />
                <Route path={RoutePaths.ConfirmNftRedPacket} element={<NftRedPacketConfirm />} />
            </Route>
            {/* If router is embedded inside a dialog, */}
            {/* which should know it's time to close itself once we enter Exit */}
            <Route path={RoutePaths.Exit} element={null} />
            <Route path="*" element={<Navigate replace to={RoutePaths.CreateErc20RedPacket} />} />
        </Routes>
    )
}
