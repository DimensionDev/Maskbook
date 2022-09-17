import { Routes, Route } from 'react-router-dom'
import { lazy } from 'react'
import { CreateMaskWalletFrame } from '../../components/CreateWalletFrame/index.js'
import { DashboardRoutes, relativeRouteOf } from '@masknet/shared-base'

const Welcome = lazy(() => import('./components/Welcome/index.js'))
const CreateWalletForm = lazy(() => import('./components/CreateWalletForm/index.js'))
const CreateMnemonic = lazy(() => import('./components/CreateMnemonic/index.js'))

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
