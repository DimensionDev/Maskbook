import React, { lazy, Suspense } from 'react'
import { Route, Routes, Navigate, HashRouter } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { useDashboardTrans } from '../locales/index.js'
import { TermsGuard } from './TermsGuard.js'
import { DashboardFrame } from '../components/DashboardFrame/index.js'
import { Modals } from '../modals/index.js'

const SetupPersona = lazy(() => import(/* webpackPrefetch: true */ './SetupPersona/index.js'))
const SignUp = lazy(() => import('./SignUp/index.js'))
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy/index.js'))

const CreateWallet = lazy(() => import('./CreateMaskWallet/index.js'))

export function Pages() {
    const t = useDashboardTrans()

    return (
        <Suspense fallback={null}>
            <HashRouter>
                <TermsGuard>
                    <Routes>
                        <Route path={`${DashboardRoutes.Setup}/*`} element={<SetupPersona />} />
                        <Route path={`${DashboardRoutes.SignUp}/*`} element={<SignUp />} />
                        <Route path={DashboardRoutes.PrivacyPolicy} element={<PrivacyPolicy />} />
                        <Route path={`${DashboardRoutes.CreateMaskWallet}/*`} element={<CreateWallet />} />
                        <Route path="*" element={<Navigate to={DashboardRoutes.Personas} />} />
                    </Routes>
                </TermsGuard>
                <Modals />
            </HashRouter>
        </Suspense>
    )
}

function frame(x: React.ReactNode) {
    return <DashboardFrame children={x} />
}
