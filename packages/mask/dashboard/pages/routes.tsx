import { lazy, Suspense } from 'react'
import { Route, Routes, HashRouter } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { TermsGuard } from './TermsGuard.js'
import { Modals } from '../modals/index.js'

const SetupPersona = lazy(() => import(/* webpackPrefetch: true */ './SetupPersona/index.js'))
const SignUp = lazy(() => import('./SignUp/index.js'))
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy/index.js'))
const CreateWallet = lazy(() => import('./CreateMaskWallet/index.js'))

export function Pages() {
    return (
        <Suspense fallback={null}>
            <HashRouter>
                <TermsGuard>
                    <Routes>
                        <Route path={`${DashboardRoutes.Setup}/*`} element={<SetupPersona />} />
                        <Route path={`${DashboardRoutes.SignUp}/*`} element={<SignUp />} />
                        <Route path={DashboardRoutes.PrivacyPolicy} element={<PrivacyPolicy />} />
                        <Route path={`${DashboardRoutes.CreateMaskWallet}/*`} element={<CreateWallet />} />
                    </Routes>
                </TermsGuard>
                <Modals />
            </HashRouter>
        </Suspense>
    )
}
