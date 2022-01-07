import React, { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { DashboardFrame } from '../components/DashboardFrame'
import { DashboardRoutes } from '@masknet/shared-base'
import NoPersonaGuardRoute from '../GuardRoute'
const Wallets = lazy(() => import('./Wallets'))
const Setup = lazy(() => import('./Setup'))
const SignUp = lazy(() => import('./SignUp'))
const SignIn = lazy(() => import('./SignIn'))
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'))
const Welcome = lazy(() => import('./Welcome'))
const Personas = lazy(() => import('./Personas'))
const Settings = lazy(() => import('./Settings'))
const CreateWallet = lazy(() => import('./CreateMaskWallet'))
const Labs = lazy(() => import('./Labs'))

export function Pages() {
    return (
        <Suspense fallback={null}>
            <Routes>
                <NoPersonaGuardRoute
                    path={DashboardRoutes.Welcome}
                    element={<Welcome />}
                    redirectTo={DashboardRoutes.Personas}
                />
                <Route path={DashboardRoutes.Setup} element={<Setup />} />
                <Route path={`${DashboardRoutes.SignUp}/*`} element={<SignUp />} />
                <Route path={DashboardRoutes.SignIn} element={<SignIn />} />
                <Route path={DashboardRoutes.PrivacyPolicy} element={<PrivacyPolicy />} />
                <Route path={DashboardRoutes.Personas} element={frame(<Personas />)} />
                <Route path={`${DashboardRoutes.Wallets}/*`} element={frame(<Wallets />)} />
                <Route path={DashboardRoutes.Settings} element={frame(<Settings />)} />
                <Route path={DashboardRoutes.Labs} element={frame(<Labs />)} />
                <Route path={`${DashboardRoutes.CreateMaskWallet}/*`} element={<CreateWallet />} />
                <Route element={<Navigate to={DashboardRoutes.Personas} />} />
            </Routes>
        </Suspense>
    )
}
function frame(x: React.ReactNode) {
    return <DashboardFrame children={x} />
}
