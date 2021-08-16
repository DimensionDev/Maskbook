import { Route, Routes, Navigate } from 'react-router'
import React, { lazy, Suspense } from 'react'
import { DashboardFrame } from '../components/DashboardFrame'
import { RoutePaths } from '../type'
import NotLoginGuardRoute from '../GuardRoute'
const Wallets = lazy(() => import('./Wallets'))
const Setup = lazy(() => import('./Setup'))
const SignUp = lazy(() => import('./SignUp'))
const SignIn = lazy(() => import('./SignIn'))
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'))
const Welcome = lazy(() => import('./Welcome'))
const Personas = lazy(() => import('./Personas'))
const Settings = lazy(() => import('./Settings'))
const Labs = lazy(() => import('./Labs'))

export function Pages() {
    return (
        <Suspense fallback="loading...">
            <Routes>
                <NotLoginGuardRoute path={RoutePaths.Welcome} element={<Welcome />} redirectTo={RoutePaths.Personas} />
                <Route path={RoutePaths.Setup} element={<Setup />} />
                <Route path={`${RoutePaths.SignUp}/*`} element={<SignUp />} />
                <NotLoginGuardRoute path={RoutePaths.SignIn} element={<SignIn />} redirectTo={RoutePaths.Personas} />
                <Route path={RoutePaths.PrivacyPolicy} element={<PrivacyPolicy />} />
                <Route path={RoutePaths.Personas} element={frame(<Personas />)} />
                <Route path={`${RoutePaths.Wallets}/*`} element={frame(<Wallets />)} />
                <Route path={RoutePaths.Settings} element={frame(<Settings />)} />
                <Route path={RoutePaths.Labs} element={frame(<Labs />)} />
                <Route element={<Navigate to={RoutePaths.Personas} />} />
            </Routes>
        </Suspense>
    )
}
function frame(x: React.ReactNode) {
    return <DashboardFrame children={x} />
}
