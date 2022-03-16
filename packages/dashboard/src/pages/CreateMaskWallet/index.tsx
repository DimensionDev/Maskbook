import { Routes, Route } from 'react-router-dom'
import { lazy } from 'react'
import { CreateMaskWalletFrame } from '../../components/CreateWalletFrame'
import { DashboardRoutes, relativeRouteOf } from '@masknet/shared-base'

const Welcome = lazy(() => import('./components/Welcome'))
const CreateWalletForm = lazy(() => import('./components/CreateWalletForm'))
const CreateMnemonic = lazy(() => import('./components/CreateMnemonic'))

const r = relativeRouteOf(DashboardRoutes.CreateMaskWallet)
export default function CreateWallet() {
    return (
        <CreateMaskWalletFrame>
            <Routes>
                <Route path="*" element={<Welcome />} />
                <Route path={r(DashboardRoutes.CreateMaskWalletForm)} element={<CreateWalletForm />} />
                <Route path={r(DashboardRoutes.CreateMaskWalletMnemonic)} element={<CreateMnemonic />} />
            </Routes>
        </CreateMaskWalletFrame>
    )
}
