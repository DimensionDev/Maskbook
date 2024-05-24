import { Suspense } from 'react'
import { Navigate, Outlet, type RouteObject } from 'react-router-dom'
import { PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { RestorableScrollContext } from '@masknet/shared'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder/index.js'
import { WalletGuard } from './WalletGuard/index.js'
import { NoWalletGuard } from './NoWalletGuard/index.js'
import { DeriveStateContext } from './CreateWallet/context.js'

const r = relativeRouteOf(PopupRoutes.Wallet)
export const walletRoutes: RouteObject[] = [
    {
        element: <WalletGuard />,
        children: [
            { index: true, lazy: () => import('./components/WalletAssets/index.js') },
            { path: r(PopupRoutes.WalletUnlock), element: null },
            { path: r(PopupRoutes.WalletSettings), lazy: () => import('./WalletSettings/index.js') },
            { path: r(PopupRoutes.CreateWallet), lazy: () => import('./CreateWallet/index.js') },
            { path: r(PopupRoutes.DeriveWallet), lazy: () => import('./CreateWallet/Derive.js') },
            {
                path: r(`${PopupRoutes.Contacts}/:address?` as PopupRoutes),
                lazy: () => import('./ContactList/index.js'),
            },
            {
                path: r(`${PopupRoutes.AddToken}/:chainId/:assetType` as PopupRoutes),
                lazy: () => import('./AddToken/index.js'),
            },
            { path: r(PopupRoutes.GasSetting), lazy: () => import('./GasSetting/index.js') },
            { path: r(PopupRoutes.Transfer), lazy: () => import('./Transfer/index.js') },
            { path: r(PopupRoutes.ContractInteraction), lazy: () => import('./Interaction/page.js') },
            { path: r(PopupRoutes.SelectWallet), lazy: () => import('./SelectWallet/index.js') },
            { path: r(PopupRoutes.ChangeOwner), lazy: () => import('./ChangeOwner/index.js') },
            { path: r(PopupRoutes.NetworkManagement), lazy: () => import('./NetworkManagement/index.js') },
            { path: r(PopupRoutes.AddNetwork), lazy: () => import('./EditNetwork/index.js') },
            { path: r(`${PopupRoutes.EditNetwork}/:id?` as PopupRoutes), lazy: () => import('./EditNetwork/index.js') },
            { path: r(PopupRoutes.Receive), lazy: () => import('./Receive/index.js') },
            { path: r(PopupRoutes.ExportWalletPrivateKey), lazy: () => import('./ExportPrivateKey/index.js') },
            { path: r(PopupRoutes.ConnectedSites), lazy: () => import('./ConnectedSites/index.js') },
        ],
    },
    {
        element: <NoWalletGuard />,
        children: [
            { path: r(PopupRoutes.SetPaymentPassword), lazy: () => import('./SetPaymentPassword/index.js') },
            { path: r(PopupRoutes.TokenDetail), lazy: () => import('./TokenDetail/index.js') },
            { path: r(PopupRoutes.TransactionDetail), lazy: () => import('./TransactionDetail/index.js') },
            { path: r(PopupRoutes.CollectibleDetail), lazy: () => import('./CollectibleDetail/index.js') },
            { path: r(PopupRoutes.ResetWallet), lazy: () => import('./ResetWallet/index.js') },
            { path: '*', element: <Navigate to={PopupRoutes.Wallet} /> },
        ],
    },
]
export function WalletFrame() {
    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <RestorableScrollContext>
                <DeriveStateContext>
                    <Outlet />
                </DeriveStateContext>
            </RestorableScrollContext>
        </Suspense>
    )
}
