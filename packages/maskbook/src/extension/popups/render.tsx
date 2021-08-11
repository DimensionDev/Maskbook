import type {} from 'react/next'
import type {} from 'react-dom/next'

import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router'
import { HashRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { MaskUIRoot } from '../../UIRoot'
import { DialogRoutes } from '.'

const root = document.createElement('div')
document.body.insertBefore(root, document.body.children[0] || null)
ReactDOM.createRoot(root).render(<Dialogs />)

const RequestPermissionPage = lazy(() => import('./RequestPermission'))
const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect'))
const ThirdPartyRequestPermission = lazy(() => import('./ThirdPartyRequestPermission'))
const SignRequest = lazy(() => import('./SignRequest'))
function Dialogs() {
    return MaskUIRoot(
        <Suspense fallback="">
            <HashRouter>
                <Switch>
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
                </Switch>
            </HashRouter>
        </Suspense>,
    )
}
