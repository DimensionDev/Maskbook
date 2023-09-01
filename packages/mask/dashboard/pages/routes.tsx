import React, { lazy, Suspense } from 'react'
import { Route, Routes, Navigate, HashRouter } from 'react-router-dom'
import { useCustomSnackbar } from '@masknet/theme'
import { DashboardRoutes } from '@masknet/shared-base'
import { useDashboardI18N } from '../locales/index.js'
import { TermsGuard } from './TermsGuard.js'
import { DashboardFrame } from '../components/DashboardFrame/index.js'

const SetupPersona = lazy(() => import(/* webpackPrefetch: true */ './SetupPersona/index.js'))
const Wallets = lazy(() => import(/* webpackPrefetch: true */ './Wallets/index.js'))
const SignUp = lazy(() => import('./SignUp/index.js'))
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy/index.js'))
const Personas = lazy(() => import(/* webpackPrefetch: true */ './Personas/index.js'))
const Settings = lazy(() => import(/* webpackPrefetch: true */ './Settings/index.js'))
const CreateWallet = lazy(() => import('./CreateMaskWallet/index.js'))

export function Pages() {
    const t = useDashboardI18N()
    const { showSnackbar } = useCustomSnackbar()

    return (
        <Suspense fallback={null}>
            <HashRouter>
                <TermsGuard>
                    <Routes>
                        <Route path={`${DashboardRoutes.Setup}/*`} element={<SetupPersona />} />
                        <Route path={`${DashboardRoutes.SignUp}/*`} element={<SignUp />} />
                        <Route path={DashboardRoutes.PrivacyPolicy} element={<PrivacyPolicy />} />
                        <Route path={DashboardRoutes.Personas} element={frame(<Personas />)} />
                        <Route path={`${DashboardRoutes.Wallets}/*`} element={frame(<Wallets />)} />
                        <Route path={DashboardRoutes.Settings} element={frame(<Settings />)} />
                        <Route path={`${DashboardRoutes.CreateMaskWallet}/*`} element={<CreateWallet />} />
                        <Route path="*" element={<Navigate to={DashboardRoutes.Personas} />} />
                    </Routes>
                </TermsGuard>
            </HashRouter>
        </Suspense>
    )
}

function frame(x: React.ReactNode) {
    return <DashboardFrame children={x} />
}
