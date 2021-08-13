import { lazy } from 'react'
import ReactDOM from 'react-dom'
import { Route, Switch, Redirect } from 'react-router'
import { HashRouter } from 'react-router-dom'
import { MaskUIRoot } from '../../UIRoot'
import { DialogRoutes } from '.'
import { createNormalReactRoot } from '../../utils/createNormalReactRoot'
import '../../social-network-adaptor/browser-action'
import { status } from '../../setup.ui'
import { Web3Provider } from '@masknet/web3-shared'
import { Web3Context } from '../../web3/context'
import { PopupFrame } from './components/PopupFrame'

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
const SignRequest = lazy(() => import('./SignRequest'))

function Dialogs() {
    return MaskUIRoot(
        <Web3Provider value={Web3Context}>
            <HashRouter>
                <Switch>
                    <Route path={DialogRoutes.Wallet} children={frame(<Wallet />)} />
                    <Route path={DialogRoutes.Personas} children={frame(<Personas />)} exact />
                    <Route path={DialogRoutes.RequestPermission} exact>
                        <RequestPermissionPage />
                    </Route>
                    <Route path={DialogRoutes.PermissionAwareRedirect} exact>
                        <PermissionAwareRedirect />
                    </Route>
                    <Route path={DialogRoutes.ThirdPartyRequestPermission} exact>
                        <ThirdPartyRequestPermission />
                    </Route>
                    <Route path={DialogRoutes.SignRequest} exact>
                        <SignRequest />
                    </Route>
                    <Route children={<Redirect to={DialogRoutes.Wallet} />} />
                </Switch>
            </HashRouter>
        </Web3Provider>,
    )
}
createNormalReactRoot(<Dialogs />)

function frame(x: React.ReactNode) {
    return <PopupFrame children={x} />
}
