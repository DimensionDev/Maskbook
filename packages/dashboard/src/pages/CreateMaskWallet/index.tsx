import { Routes, Route, useMatch } from 'react-router-dom'
import { lazy } from 'react'
import { SetupFrame } from '../../components/CreateWalletFrame/index.js'
import { DashboardRoutes, relativeRouteOf } from '@masknet/shared-base'

const CreateWalletForm = lazy(() => import('./CreateWalletForm/index.js'))
const CreateMnemonic = lazy(() => import('./CreateMnemonic/index.js'))
const OnBoarding = lazy(() => import('./Onboarding/index.js'))

const r = relativeRouteOf(DashboardRoutes.CreateMaskWallet)
export default function CreateWallet() {
    return (
        <SetupFrame hiddenSpline={!!useMatch(DashboardRoutes.SignUpMaskWalletOnboarding)}>
            <Routes>
                <Route path={r(DashboardRoutes.CreateMaskWalletForm)} element={<CreateWalletForm />} />
                <Route path={r(DashboardRoutes.CreateMaskWalletMnemonic)} element={<CreateMnemonic />} />
                <Route path={r(DashboardRoutes.SignUpMaskWalletOnboarding)} element={<OnBoarding />} />
            </Routes>
        </SetupFrame>
    )
}
