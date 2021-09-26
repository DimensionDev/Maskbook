import { Route, Routes, Navigate } from 'react-router-dom'
import React, { lazy, Suspense } from 'react'
import { DashboardFrame } from '../components/DashboardFrame'
import { RoutePaths } from '../type'
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
                <NoPersonaGuardRoute path={RoutePaths.Welcome} element={<Welcome />} redirectTo={RoutePaths.Personas} />
                <Route path={RoutePaths.Setup} element={<Setup />} />
                <Route path={`${RoutePaths.SignUp}/*`} element={<SignUp />} />
                <Route path={RoutePaths.SignIn} element={<SignIn />} />
                <Route path={RoutePaths.PrivacyPolicy} element={<PrivacyPolicy />} />
                <Route path={RoutePaths.Personas} element={frame(<Personas />)} />
                <Route path={`${RoutePaths.Wallets}/*`} element={frame(<Wallets />)} />
                <Route path={RoutePaths.Settings} element={frame(<Settings />)} />
                <Route path={RoutePaths.Labs} element={frame(<Labs />)} />
                <Route path={`${RoutePaths.CreateMaskWallet}/*`} element={<CreateWallet />} />
                <Route element={<Navigate to={RoutePaths.Personas} />} />
            </Routes>
        </Suspense>
    )
}
function frame(x: React.ReactNode) {
    return <DashboardFrame children={x} />
}
