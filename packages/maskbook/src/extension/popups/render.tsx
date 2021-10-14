import { lazy } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { HashRouter } from 'react-router-dom'
import { createInjectHooksRenderer, startPluginDashboard, useActivatedPluginsDashboard } from '@masknet/plugin-infra'
import { PopupRoutes } from '.'
import { createNormalReactRoot, useClassicMaskFullPageTheme } from '../../utils'
import '../../social-network-adaptor/browser-action'
import { Web3Provider } from '@masknet/web3-shared'
import { PopupWeb3Context } from '../../web3/context'
import { PopupFrame } from './components/PopupFrame'
import { Appearance } from '@masknet/theme'
import { createPluginHost } from '../../../src/plugin-infra/host'
import { MaskUIRoot } from '../../UIRoot'
import { status } from '../../setup.ui'

const Wallet = lazy(() => import('./pages/Wallet'))
const Personas = lazy(() => import('./pages/Personas'))
const SwapPage = lazy(() => import('./pages/Swap'))
const RequestPermissionPage = lazy(() => import('./RequestPermission'))
const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect'))
const ThirdPartyRequestPermission = lazy(() => import('./ThirdPartyRequestPermission'))
const SignRequest = lazy(() => import('./SignRequest'))

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

function useAlwaysLightTheme() {
    return useClassicMaskFullPageTheme({ forcePalette: Appearance.light })
}
function Dialogs() {
    return (
        <MaskUIRoot useTheme={useAlwaysLightTheme} kind="fullpage">
            <Web3Provider value={PopupWeb3Context}>
                <HashRouter>
                    <Switch>
                        <Route path={PopupRoutes.Wallet} children={frame(<Wallet />)} />
                        <Route path={PopupRoutes.Personas} children={frame(<Personas />)} />
                        <Route path={PopupRoutes.Swap} children={<SwapPage />} />
                        <Route path={PopupRoutes.RequestPermission} exact>
                            <RequestPermissionPage />
                        </Route>
                        <Route path={PopupRoutes.PermissionAwareRedirect} exact>
                            <PermissionAwareRedirect />
                        </Route>
                        <Route path={PopupRoutes.ThirdPartyRequestPermission} exact>
                            <ThirdPartyRequestPermission />
                        </Route>
                        <Route path={PopupRoutes.SignRequest} exact>
                            <SignRequest />
                        </Route>
                        <Route children={<Redirect to={PopupRoutes.Wallet} />} />
                    </Switch>
                </HashRouter>
                <PluginRender />
            </Web3Provider>
        </MaskUIRoot>
    )
}
status.then(() => createNormalReactRoot(<Dialogs />))
startPluginDashboard(createPluginHost())

function frame(x: React.ReactNode) {
    return <PopupFrame children={x} />
}
