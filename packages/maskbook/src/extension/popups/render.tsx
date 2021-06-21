import type {} from 'react/next'
import type {} from 'react-dom/next'

import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router'
import { HashRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { MaskUIRoot } from '../../UIRoot'
import { PopupRoutes } from '.'

const root = document.createElement('div')
document.body.insertBefore(root, document.body.children[0] || null)
ReactDOM.createRoot(root).render(<Dialogs />)

const RequestPermissionPage = lazy(() => import('./RequestPermission'))
const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect'))
const ThirdPartyRequestPermission = lazy(() => import('./ThirdPartyRequestPermission'))
const PostInspectorReplica = lazy(() => import('./PostInspector'))
function Dialogs() {
    return MaskUIRoot(
        <Suspense fallback="">
            <HashRouter>
                <Switch>
                    <Route path={PopupRoutes.RequestPermission} exact>
                        <RequestPermissionPage />
                    </Route>
                    <Route path={PopupRoutes.PermissionAwareRedirect} exact>
                        <PermissionAwareRedirect />
                    </Route>
                    <Route path={PopupRoutes.ThirdPartyRequestPermission} exact>
                        <ThirdPartyRequestPermission />
                    </Route>
                    <Route path={PopupRoutes.PostInspector + '/:SNSAdaptor/'}>
                        <PostInspectorReplica />
                    </Route>
                </Switch>
            </HashRouter>
        </Suspense>,
    )
}
