import type {} from 'react/next'
import type {} from 'react-dom/next'
import '../../social-network-adaptor/browser-action'
import { status } from '../../setup.ui'
import { lazy, Suspense } from 'react'
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { MaskUIRoot } from '../../UIRoot'
import { PopupFrame } from './components/PopupFrame'

import { Web3Provider } from '@masknet/web3-shared'
import { DialogRoutes } from './index'
import { Web3Context } from '../../web3/context'

if (location.pathname === '/popups.html' && !document.getElementById('root')) {
    const root = document.createElement('div')
    root.setAttribute('id', 'root')
    document.body.insertBefore(root, document.body.children[0] || null)
    status.then(() => ReactDOM.createRoot(root).render(<Dialogs />))
}

const Wallet = lazy(() => import('./pages/Wallet'))
const Personas = lazy(() => import('./pages/Personas'))
const RequestPermissionPage = lazy(() => import('./RequestPermission'))
const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect'))
const ThirdPartyRequestPermission = lazy(() => import('./ThirdPartyRequestPermission'))

export function Dialogs() {
    return MaskUIRoot(
        <Web3Provider value={Web3Context}>
            <HashRouter>
                <Suspense fallback="">
                    <Switch>
                        <Route path={DialogRoutes.Wallet} children={frame(<Wallet />)} exact />
                        <Route path={DialogRoutes.Personas} children={frame(<Personas />)} exact />
                        <Route path={DialogRoutes.RequestPermission} exact children={<RequestPermissionPage />} />
                        <Route
                            path={DialogRoutes.PermissionAwareRedirect}
                            exact
                            children={<PermissionAwareRedirect />}
                        />
                        <Route
                            path={DialogRoutes.ThirdPartyRequestPermission}
                            exact
                            children={<ThirdPartyRequestPermission />}
                        />
                        <Route children={<Redirect to={DialogRoutes.Wallet} />} />
                    </Switch>
                </Suspense>
            </HashRouter>
        </Web3Provider>,
    )
}

function frame(x: React.ReactNode) {
    return <PopupFrame children={x} />
}
