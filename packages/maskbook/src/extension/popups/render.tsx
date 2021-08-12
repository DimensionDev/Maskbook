import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router'
import { HashRouter } from 'react-router-dom'
import { MaskUIRoot } from '../../UIRoot'
import { DialogRoutes } from '.'
import { createNormalReactRoot } from '../../utils/createNormalReactRoot'

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
createNormalReactRoot(<Dialogs />)
