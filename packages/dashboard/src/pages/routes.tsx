import { Route, Switch, Redirect } from 'react-router'
import React, { lazy, Suspense } from 'react'
import { DashboardFrame } from '../components/DashboardFrame'
export enum Routes {
    Welcome = '/welcome',
    Personas = '/personas',
    Wallets = '/wallets',
    WalletsTransfer = '/wallets/transfer',
    WalletsSwap = '/wallets/swap',
    WalletsRedPacket = '/wallets/red-packet',
    WalletsSell = '/wallets/sell',
    WalletsHistory = '/wallets/history',
    Settings = '/settings',
}
const Wallets = lazy(() => import('./Wallets'))
const Welcome = lazy(() => import('./Welcome'))
const Personas = lazy(() => import('./Personas'))
const Settings = lazy(() => import('./Settings'))
export function Pages() {
    return (
        <Suspense fallback="loading...">
            <Switch>
                <Route path={Routes.Welcome} children={<Welcome />} />
                <Route path={Routes.Personas} children={frame(<Personas />)} exact />
                <Route path={Routes.Wallets} children={frame(<Wallets />)} />
                <Route path={Routes.Settings} children={frame(<Settings />)} exact />
                <Route children={<Redirect to={Routes.Personas} />} />
            </Switch>
        </Suspense>
    )
}
function frame(x: React.ReactNode) {
    return <DashboardFrame children={x} />
}
