import { type RouteObject } from 'react-router-dom'
import { DashboardRoutes, relativeRouteOf } from '@masknet/shared-base'
import { useMatch } from 'react-router-dom'
import { ResetWalletContext } from './context.js'
import { SetupFrame } from '../../components/SetupFrame/index.js'

const r = relativeRouteOf(DashboardRoutes.CreateMaskWallet)
export const walletRoutes: RouteObject[] = [
    { path: r(DashboardRoutes.CreateMaskWalletForm), lazy: () => import('./CreateWalletForm/index.js') },
    { path: r(DashboardRoutes.CreateMaskWalletMnemonic), lazy: () => import('./CreateMnemonic/index.js') },
    { path: r(DashboardRoutes.SignUpMaskWalletOnboarding), lazy: () => import('./Onboarding/index.js') },
    { path: r(DashboardRoutes.RecoveryMaskWallet), lazy: () => import('./Recovery/index.js') },
    { path: r(DashboardRoutes.AddDeriveWallet), lazy: () => import('./AddDeriveWallet/index.js') },
]

export function WalletFrame() {
    return (
        <ResetWalletContext>
            <SetupFrame hiddenSpline={!!useMatch(DashboardRoutes.SignUpMaskWalletOnboarding)} />
        </ResetWalletContext>
    )
}
