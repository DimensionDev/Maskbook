import React, { lazy, Suspense, useCallback, useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { useCustomSnackbar } from '@masknet/theme'
import { SmartPayOwner, SmartPayBundler } from '@masknet/web3-providers'
import { useMountReport } from '@masknet/web3-telemetry/hooks'
import { TelemetryAPI } from '@masknet/web3-providers/types'
import { DashboardRoutes, type RestoreSuccessEvent } from '@masknet/shared-base'
import { Messages } from '../API.js'
import { useDashboardI18N } from '../locales/index.js'
import { TermsGuard } from './TermsGuard.js'
import { DashboardFrame } from '../components/DashboardFrame/index.js'

const Wallets = lazy(() => import(/* webpackPrefetch: true */ './Wallets/index.js'))
const Setup = lazy(() => import('./Setup/index.js'))
const SignUp = lazy(() => import('./SignUp/index.js'))
const SignIn = lazy(() => import('./SignIn/index.js'))
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy/index.js'))
const Welcome = lazy(() => import('./NewWelcome/index.js'))
const Personas = lazy(() => import(/* webpackPrefetch: true */ './Personas/index.js'))
const Settings = lazy(() => import(/* webpackPrefetch: true */ './Settings/index.js'))
const CreateWallet = lazy(() => import('./CreateMaskWallet/index.js'))

export function Pages() {
    const t = useDashboardI18N()
    const { showSnackbar } = useCustomSnackbar()
    const restoreCallback = useCallback(
        async ({ wallets, count }: RestoreSuccessEvent) => {
            if (count) {
                showSnackbar(t.recovery_smart_pay_wallet_title(), {
                    variant: 'success',
                    message: t.recovery_smart_pay_wallet_description({
                        count,
                    }),
                })
            } else if (wallets) {
                const chainId = await SmartPayBundler.getSupportedChainId()
                const accounts = await SmartPayOwner.getAccountsByOwners(chainId, wallets)
                const deployedWallet = accounts.filter((x) => x.deployed)
                if (!deployedWallet.length) return
                showSnackbar(t.recovery_smart_pay_wallet_title(), {
                    variant: 'success',
                    message: t.recovery_smart_pay_wallet_description({
                        count: deployedWallet.length,
                    }),
                })
            }
        },
        [t, showSnackbar],
    )

    useEffect(() => {
        return Messages.events.restoreSuccess.on(restoreCallback)
    }, [restoreCallback])

    useMountReport(TelemetryAPI.EventID.AccessDashboard)

    return (
        <Suspense fallback={null}>
            <TermsGuard>
                <Routes>
                    <Route path={DashboardRoutes.Welcome} element={<Welcome />} />
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
            </TermsGuard>
        </Suspense>
    )
}

function frame(x: React.ReactNode) {
    return <DashboardFrame children={x} />
}
