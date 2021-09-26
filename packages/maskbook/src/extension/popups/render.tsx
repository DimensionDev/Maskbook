import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router'
import { HashRouter } from 'react-router-dom'
import { PopupRoutes } from '.'
import { createNormalReactRoot, useClassicMaskTheme } from '../../utils'
import '../../social-network-adaptor/browser-action'

import { Web3Provider } from '@masknet/web3-shared'
import { PopupWeb3Context, SwapWeb3Context } from '../../web3/context'
import { PopupFrame } from './components/PopupFrame'
import { StyledEngineProvider, ThemeProvider } from '@material-ui/core'
import { Appearance } from '@masknet/theme'
import { MaskUIRoot } from '../../UIRoot'
import { status } from '../../setup.ui'

const Wallet = lazy(() => import('./pages/Wallet'))
const Personas = lazy(() => import('./pages/Personas'))
const SwapPage = lazy(() => import('./pages/Swap'))
const RequestPermissionPage = lazy(() => import('./RequestPermission'))
const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect'))
const ThirdPartyRequestPermission = lazy(() => import('./ThirdPartyRequestPermission'))
const SignRequest = lazy(() => import('./SignRequest'))

function Dialogs() {
    const theme = useClassicMaskTheme({ appearance: Appearance.light })
    return MaskUIRoot(
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <Web3Provider value={PopupWeb3Context}>
                    <HashRouter>
                        <Suspense fallback="">
                            <Switch>
                                <Route path={PopupRoutes.Wallet} children={frame(<Wallet />)} />
                                <Route path={PopupRoutes.Personas} children={frame(<Personas />)} />
                                <Web3Provider value={SwapWeb3Context}>
                                    <Route path={PopupRoutes.Swap} children={<SwapPage />} />
                                </Web3Provider>
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
                </Web3Provider>
            </ThemeProvider>
        </StyledEngineProvider>,
    )
}
status.then(() => createNormalReactRoot(<Dialogs />))

function frame(x: React.ReactNode) {
    return <PopupFrame children={x} />
}
