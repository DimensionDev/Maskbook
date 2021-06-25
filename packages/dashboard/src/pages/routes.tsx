import { Route, Routes, Navigate } from 'react-router'
import React, { lazy, Suspense } from 'react'
import { DashboardFrame } from '../components/DashboardFrame'
//import { useRouteMatch } from 'react-router-dom'
export enum RoutePaths {
    Welcome = '/welcome',
    Personas = '/personas',
    Wallets = '/wallets',
    WalletsTransfer = '/wallets/transfer',
    WalletsSwap = '/wallets/swap',
    WalletsRedPacket = '/wallets/red-packet',
    WalletsSell = '/wallets/sell',
    WalletsHistory = '/wallets/history',
    Settings = '/settings',
    Plugins = '/plugins',

    CreatePersona = '/create-persona',
    ConnectNetwork = '/connect-network',
}
const Wallets = lazy(() => import('./Wallets'))
const Welcome = lazy(() => import('./Welcome'))
const CreatePersona = lazy(() => import('./Register/CreatePersona'))
const ConnectNetwork = lazy(() => import('./Register/ConnectNetwork'))
const Personas = lazy(() => import('./Personas'))
const Settings = lazy(() => import('./Settings'))
const Plugins = lazy(() => import('./Plugins'))
export function Pages() {
    //   const { path } = useRouteMatch()
    return (
        <Suspense fallback="loading...">
            <Routes>
                <Route path={RoutePaths.CreatePersona} element={<CreatePersona />} />
                <Route path={RoutePaths.ConnectNetwork} element={<ConnectNetwork />} />
                <Route path={RoutePaths.Welcome} element={<Welcome />} />
                <Route path={RoutePaths.Personas} element={frame(<Personas />)} />
                <Route path={`${RoutePaths.Wallets}/*`} element={frame(<Wallets />)} />
                <Route path={RoutePaths.Settings} element={frame(<Settings />)} />
                <Route path={RoutePaths.Plugins} element={frame(<Plugins />)} />
                <Route element={<Navigate to={RoutePaths.Personas} />} />
            </Routes>
        </Suspense>
    )
}
function frame(x: React.ReactNode) {
    return <DashboardFrame children={x} />
}
