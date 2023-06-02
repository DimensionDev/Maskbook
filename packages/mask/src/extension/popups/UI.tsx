import { lazy, useEffect, useState, useMemo } from 'react'
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import { Web3ContextProvider, TelemetryProvider, useMountReport } from '@masknet/web3-hooks-base'
import { NetworkPluginID, PopupRoutes, queryRemoteI18NBundle } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { PopupSnackbarProvider } from '@masknet/theme'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EventID } from '@masknet/web3-telemetry/types'
import { usePopupFullPageTheme } from '../../utils/theme/useClassicMaskFullPageTheme.js'
import { languageSettings } from '../../../shared/legacy-settings/settings.js'
import { LoadingPlaceholder } from './components/LoadingPlaceholder/index.js'
import '../../social-network-adaptor/browser-action/index.js'
import { PopupFrame } from './components/PopupFrame/index.js'
import { PopupContext } from './hook/usePopupContext.js'
import { MaskUIRootPage } from '../../UIRoot-page.js'
import { PageTitleContext } from './context.js'
import Services from '../service.js'

function usePopupTheme() {
    return usePopupFullPageTheme(useValueRef(languageSettings))
}

const Wallet = lazy(() => import(/* webpackPreload: true */ './pages/Wallet/index.js'))
const Personas = lazy(() => import(/* webpackPreload: true */ './pages/Personas/index.js'))
const SwapPage = lazy(() => import('./pages/Swap/index.js'))
const RequestPermissionPage = lazy(() => import('./RequestPermission/index.js'))
const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect/index.js'))
const ThirdPartyRequestPermission = lazy(() => import('./ThirdPartyRequestPermission/index.js'))

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

function PluginRenderDelayed() {
    const [canRenderPlugin, setRenderPlugins] = useState(false)
    useEffect(() => setRenderPlugins(true), [])
    if (!canRenderPlugin) return null
    return <PluginRender />
}

const Web3ContextType = { pluginID: NetworkPluginID.PLUGIN_EVM, providerType: ProviderType.MaskWallet }

export default function Popups() {
    const [title, setTitle] = useState('')
    const titleContext = useMemo(() => ({ title, setTitle }), [title])

    useEffect(() => queryRemoteI18NBundle(Services.Helper.queryRemoteI18NBundle), [])
    useMountReport(EventID.AccessPopups)

    return MaskUIRootPage(
        usePopupTheme,
        <PopupSnackbarProvider>
            <Web3ContextProvider value={Web3ContextType}>
                <TelemetryProvider>
                    <PopupContext.Provider>
                        <PageTitleContext.Provider value={titleContext}>
                            <HashRouter>
                                <Routes>
                                    <Route path={PopupRoutes.Personas + '/*'} element={frame(<Personas />)} />
                                    <Route path={PopupRoutes.Wallet + '/*'} element={frame(<Wallet />)} />
                                    <Route path={PopupRoutes.Swap} element={<SwapPage />} />
                                    <Route path={PopupRoutes.RequestPermission} element={<RequestPermissionPage />} />
                                    <Route
                                        path={PopupRoutes.PermissionAwareRedirect}
                                        element={<PermissionAwareRedirect />}
                                    />
                                    <Route
                                        path={PopupRoutes.ThirdPartyRequestPermission}
                                        element={<ThirdPartyRequestPermission />}
                                    />
                                    <Route path="*" element={<Navigate replace to={PopupRoutes.Personas} />} />
                                </Routes>
                                {/* TODO: Should only load plugins when the page is plugin-aware. */}
                                <PluginRenderDelayed />
                            </HashRouter>
                        </PageTitleContext.Provider>
                    </PopupContext.Provider>
                </TelemetryProvider>
            </Web3ContextProvider>
        </PopupSnackbarProvider>,
        frame(<LoadingPlaceholder />),
    )
}

function frame(x: React.ReactNode) {
    return <PopupFrame children={x} />
}
