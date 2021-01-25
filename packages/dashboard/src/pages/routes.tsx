import { Route, Switch, Redirect } from 'react-router'
import { lazy, Suspense } from 'react'
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
                <Route path={Routes.Personas} children={<Personas />} exact />
                <Route path={Routes.Wallets} children={<Wallets />} />
                <Route path={Routes.Settings} children={<Settings />} exact />
                <Route path="/" exact>
                    <Redirect to={Routes.Personas} />
                </Route>
            </Switch>
        </Suspense>
    )
}
