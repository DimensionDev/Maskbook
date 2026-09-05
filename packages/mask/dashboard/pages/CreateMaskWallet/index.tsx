import type { RouteObject } from 'react-router-dom'
import { DashboardRoutes, relativeRouteOf } from '@masknet/shared-base'
import { SetupFrame } from '../../components/SetupFrame/index.js'

const r = relativeRouteOf(DashboardRoutes.CreateMaskWallet)
export const walletRoutes: RouteObject[] = [
    { path: r(DashboardRoutes.CreateFireflyWallet), lazy: () => import('./FireflyWallet/index.js') },
]

export function WalletFrame() {
    return <SetupFrame />
}
