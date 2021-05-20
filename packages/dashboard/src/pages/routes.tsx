import { Route, Switch, Redirect } from 'react-router'
import React, { lazy, Suspense } from 'react'
import { DashboardFrame } from '../components/DashboardFrame'
import { Routes } from '../type'

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
                <Route path={Routes.Personas} children={frame(<Personas />)} exact />
                {/* This is intentional. Wallets has subroutes and we want to make it selected in the subroutes */}
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
