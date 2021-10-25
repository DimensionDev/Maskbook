import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { HashRouter } from 'react-router-dom'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra'
import { PopupRoutes } from '.'
import { useClassicMaskFullPageTheme } from '../../utils'
import '../../social-network-adaptor/browser-action'
import { Web3Provider } from '@masknet/web3-shared-evm'
import { PopupWeb3Context } from '../../web3/context'
import { PopupFrame } from './components/PopupFrame'
import { Appearance } from '@masknet/theme'
import { MaskUIRoot } from '../../UIRoot'

function useAlwaysLightTheme() {
    return useClassicMaskFullPageTheme({ forcePalette: Appearance.light })
}
const Wallet = lazy(() => import('./pages/Wallet'))
const Personas = lazy(() => import('./pages/Personas'))
const SwapPage = lazy(() => import('./pages/Swap'))
const RequestPermissionPage = lazy(() => import('./RequestPermission'))
const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect'))
const ThirdPartyRequestPermission = lazy(() => import('./ThirdPartyRequestPermission'))
const SignRequest = lazy(() => import('./SignRequest'))

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

export default function Popups() {
    return (
        <MaskUIRoot useTheme={useAlwaysLightTheme} kind="page">
            <Web3Provider value={PopupWeb3Context}>
                <HashRouter>
                    {/* ! Don't remove this suspense. Otherwise react-router v5 doesn't work while changing routes.  */}
                    <Suspense fallback="">
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
                    </Suspense>
                </HashRouter>
                {/*
// TODO: Should only load plugins when the page is plugin-aware.
                 */}
                <PluginRender />
            </Web3Provider>
        </MaskUIRoot>
    )
}

function frame(x: React.ReactNode) {
    return <PopupFrame children={x} />
}
