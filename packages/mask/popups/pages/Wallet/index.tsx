import { Suspense } from 'react'
import { Navigate, Outlet, type RouteObject } from 'react-router-dom'
import { PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { RestorableScrollContext } from '@masknet/shared'
import { LoadingPlaceholder } from '@masknet/injected-ui/LoadingPlaceholder'
import { WalletGuard } from './WalletGuard/index.js'
import { NoWalletGuard } from './NoWalletGuard/index.js'

const r = relativeRouteOf(PopupRoutes.Wallet)
export const walletRoutes: RouteObject[] = [
    {
        element: <WalletGuard />,
        children: [
            { index: true, lazy: () => import('./components/WalletAssets/index.js') },
            {
                path: r(`${PopupRoutes.Contacts}/:address?` as PopupRoutes),
                lazy: () => import('./ContactList/index.js'),
            },
            {
                path: r(`${PopupRoutes.AddToken}/:chainId/:assetType` as PopupRoutes),
                lazy: () => import('./AddToken/index.js'),
            },
            { path: r(PopupRoutes.Transfer), lazy: () => import('./Transfer/index.js') },
            { path: r(PopupRoutes.ContractInteraction), lazy: () => import('./Interaction/page.js') },
            { path: r(PopupRoutes.NetworkManagement), lazy: () => import('./NetworkManagement/index.js') },
            { path: r(PopupRoutes.AddNetwork), lazy: () => import('./EditNetwork/index.js') },
            { path: r(`${PopupRoutes.EditNetwork}/:id?` as PopupRoutes), lazy: () => import('./EditNetwork/index.js') },
            { path: r(PopupRoutes.Receive), lazy: () => import('./Receive/index.js') },
            { path: r(PopupRoutes.SyncTwitterCookies), lazy: () => import('./SyncTwitterCookies/index.js') },
        ],
    },
    {
        element: <NoWalletGuard />,
        children: [
            { path: r(PopupRoutes.TokenDetail), lazy: () => import('./TokenDetail/index.js') },
            { path: r(PopupRoutes.TransactionDetail), lazy: () => import('./TransactionDetail/index.js') },
            { path: '*', element: <Navigate to={PopupRoutes.Wallet} /> },
        ],
    },
]
export function WalletFrame() {
    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <RestorableScrollContext>
                <Outlet />
            </RestorableScrollContext>
        </Suspense>
    )
}
