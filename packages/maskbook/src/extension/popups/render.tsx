import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router'
import { HashRouter } from 'react-router-dom'
import { MaskUIRoot } from '../../UIRoot'
import { PopupRoutes } from '.'
import { createNormalReactRoot } from '../../utils/createNormalReactRoot'

const RequestPermissionPage = lazy(() => import('./RequestPermission'))
const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect'))
const ThirdPartyRequestPermission = lazy(() => import('./ThirdPartyRequestPermission'))
const PostInspectorReplica = lazy(() => import('./PostInspector'))
const SignRequest = lazy(() => import('./SignRequest'))
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
                    <Route path={PopupRoutes.SignRequest} exact>
                        <SignRequest />
                    </Route>
                </Switch>
            </HashRouter>
        </Suspense>,
    )
}
createNormalReactRoot(<Dialogs />)
