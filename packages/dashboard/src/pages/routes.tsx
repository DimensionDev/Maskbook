import React, { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { DashboardFrame } from '../components/DashboardFrame/index.js'
import { DashboardRoutes } from '@masknet/shared-base'
import NoPersonaGuardRoute from '../GuardRoute.js'
const Wallets = lazy(() => import(/* webpackPrefetch: true */ './Wallets/index.js'))
const Setup = lazy(() => import('./Setup/index.js'))
const SignUp = lazy(() => import('./SignUp/index.js'))
const SignIn = lazy(() => import('./SignIn/index.js'))
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy/index.js'))
const Welcome = lazy(() => import('./Welcome/index.js'))
const Personas = lazy(() => import(/* webpackPrefetch: true */ './Personas/index.js'))
const Settings = lazy(() => import(/* webpackPrefetch: true */ './Settings/index.js'))
const CreateWallet = lazy(() => import('./CreateMaskWallet/index.js'))

export function Pages() {
    return (
        <Suspense fallback={null}>
            <Routes>
                <Route
                    path={DashboardRoutes.Welcome}
                    element={
                        <NoPersonaGuardRoute redirectTo={DashboardRoutes.Personas}>
                            <Welcome />
                        </NoPersonaGuardRoute>
                    }
                />
                <Route path={DashboardRoutes.Setup} element={<Setup />} />
                <Route path={`${DashboardRoutes.SignUp}/*`} element={<SignUp />} />
                <Route path={DashboardRoutes.SignIn} element={<SignIn />} />
                <Route path={DashboardRoutes.PrivacyPolicy} element={<PrivacyPolicy />} />
                <Route path={DashboardRoutes.Personas} element={frame(<Personas />)} />
                <Route path={`${DashboardRoutes.Wallets}/*`} element={frame(<Wallets />)} />
                <Route path={DashboardRoutes.Settings} element={frame(<Settings />)} />
                <Route path={`${DashboardRoutes.CreateMaskWallet}/*`} element={<CreateWallet />} />
                <Route path="*" element={<Navigate to={DashboardRoutes.Personas} />} />
            </Routes>
        </Suspense>
    )
}
function frame(x: React.ReactNode) {
    return <DashboardFrame children={x} />
}
