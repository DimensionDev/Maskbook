/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />

import { Suspense } from 'react'
import { Route, Switch } from 'react-router'
import { HashRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { MaskUIRoot } from '../../UIRoot'
import { DialogRoutes } from '.'
import { RequestPermissionPage } from './RequestPermission'

const root = document.createElement('div')
document.body.insertBefore(root, document.body.children[0] || null)
ReactDOM.unstable_createRoot(root).render(<Dialogs />)

function Dialogs() {
    return MaskUIRoot(
        <Suspense fallback="">
            <HashRouter>
                <Switch>
                    <Route path={DialogRoutes.RequestPermission}>
                        <RequestPermissionPage />
                    </Route>
                </Switch>
            </HashRouter>
        </Suspense>,
    )
}
