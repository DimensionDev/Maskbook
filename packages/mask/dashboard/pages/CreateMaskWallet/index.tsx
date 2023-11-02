import { Routes, Route, useMatch } from 'react-router-dom'
import { lazy } from 'react'
import { DashboardRoutes, relativeRouteOf } from '@masknet/shared-base'
import { ResetWalletContext } from './context.js'
import { SetupFrame } from '../../components/SetupFrame/index.js'

const CreateWalletForm = lazy(() => import(/* webpackMode: 'eager' */ './CreateWalletForm/index.js'))
const CreateMnemonic = lazy(() => import(/* webpackMode: 'eager' */ './CreateMnemonic/index.js'))
const OnBoarding = lazy(() => import(/* webpackMode: 'eager' */ './Onboarding/index.js'))
const OnRecovery = lazy(() => import(/* webpackMode: 'eager' */ './Recovery/index.js'))
const AddDeriveWallet = lazy(() => import(/* webpackMode: 'eager' */ './AddDeriveWallet/index.js'))

const r = relativeRouteOf(DashboardRoutes.CreateMaskWallet)
export default function CreateWallet() {
    return (
        <SetupFrame hiddenSpline={!!useMatch(DashboardRoutes.SignUpMaskWalletOnboarding)}>
            <ResetWalletContext.Provider>
                <Routes>
                    <Route path={r(DashboardRoutes.CreateMaskWalletForm)} element={<CreateWalletForm />} />
                    <Route path={r(DashboardRoutes.CreateMaskWalletMnemonic)} element={<CreateMnemonic />} />
                    <Route path={r(DashboardRoutes.SignUpMaskWalletOnboarding)} element={<OnBoarding />} />
                    <Route path={r(DashboardRoutes.RecoveryMaskWallet)} element={<OnRecovery />} />
                    <Route path={r(DashboardRoutes.AddDeriveWallet)} element={<AddDeriveWallet />} />
                </Routes>
            </ResetWalletContext.Provider>
        </SetupFrame>
    )
}
