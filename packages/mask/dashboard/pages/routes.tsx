import { lazy, Suspense } from 'react'
import { Route, Routes, HashRouter } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { TermsGuard } from './TermsGuard.js'
import { Modals } from '../modals/index.js'

const SetupPersona = lazy(() => import(/* webpackMode: 'eager' */ './SetupPersona/index.js'))
const SignUp = lazy(() => import(/* webpackMode: 'eager' */ './SignUp/index.js'))
const PrivacyPolicy = lazy(() => import(/* webpackMode: 'eager' */ './PrivacyPolicy/index.js'))
const CreateWallet = lazy(() => import(/* webpackMode: 'eager' */ './CreateMaskWallet/index.js'))

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
