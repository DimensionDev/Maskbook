import { Route, Switch, Redirect } from 'react-router'
import React, { lazy, Suspense } from 'react'
import { PersonaDrawerState } from '../hooks/usePersonaDrawerState'
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
    Plugins = '/plugins',
}
const Wallets = lazy(() => import('./Wallets'))
const Welcome = lazy(() => import('./Welcome'))
const Personas = lazy(() => import('./Personas'))
const Settings = lazy(() => import('./Settings'))
const Plugins = lazy(() => import('./Plugins'))
export function Pages() {
    return (
        <Suspense fallback="loading...">
            <Switch>
                <Route path={Routes.Welcome} children={<Welcome />} />
                <Route
                    path={Routes.Personas}
                    children={<PersonaDrawerState.Provider>{frame(<Personas />)}</PersonaDrawerState.Provider>}
                    exact
                />
                <Route path={Routes.Wallets} children={frame(<Wallets />)} />
                <Route path={Routes.Settings} children={frame(<Settings />)} exact />
                <Route path={Routes.Plugins} children={frame(<Plugins />)} exact />
                <Route children={<Redirect to={Routes.Personas} />} />
            </Switch>
        </Suspense>
    )
}
function frame(x: React.ReactNode) {
    return <DashboardFrame children={x} />
}
