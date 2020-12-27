import { Route, Switch, Redirect } from 'react-router'
import { Wallets } from './Wallets'

export enum Routes {
    Welcome = '/welcome',
    Personas = '/personas',
    Wallets = '/wallets',
    Settings = '/settings',
}
export function Pages() {
    return (
        <Switch>
            <Route path={Routes.Welcome}></Route>
            <Route path={Routes.Personas}></Route>
            <Route path={Routes.Wallets}>
                <Wallets />
            </Route>
            <Route path={Routes.Settings}></Route>
            <Route exact path="/">
                {/* Cause other pages not done yet */}
                <Redirect to={Routes.Wallets} />
            </Route>
        </Switch>
    )
}
