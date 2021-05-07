/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />

import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router'
import { HashRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { MaskUIRoot } from '../../UIRoot'
import { DialogRoutes } from '.'

const root = document.createElement('div')
document.body.insertBefore(root, document.body.children[0] || null)
ReactDOM.unstable_createRoot(root).render(<Dialogs />)

const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect'))
function Dialogs() {
    return MaskUIRoot(
        <Suspense fallback="">
            <HashRouter>
                <Switch>
                    <Route path={DialogRoutes.PermissionAwareRedirect} children={<PermissionAwareRedirect />} exact />
                </Switch>
            </HashRouter>
        </Suspense>,
    )
}
