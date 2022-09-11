import { lazy, useEffect, useState } from 'react'
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import { PopupRoutes, queryRemoteI18NBundle } from '@masknet/shared-base'
import { usePopupFullPageTheme } from '../../utils/theme/useClassicMaskFullPageTheme.js'
import '../../social-network-adaptor/browser-action/index.js'
import { PopupContext } from './hook/usePopupContext.js'
import { PopupFrame } from './components/PopupFrame/index.js'
import { MaskUIRoot } from '../../UIRoot.js'
import { PageTitleContext } from './context.js'
import { useValueRef } from '@masknet/shared-base-ui'
import { languageSettings } from '../../../shared/legacy-settings/settings.js'
import { PopupSnackbarProvider } from '@masknet/theme'
import { LoadingPlaceholder } from './components/LoadingPlaceholder/index.js'
import Services from '../service.js'

function usePopupTheme() {
    return usePopupFullPageTheme(useValueRef(languageSettings))
}
const Wallet = lazy(() => import(/* webpackPreload: true */ './pages/Wallet'))
const Personas = lazy(() => import(/* webpackPreload: true */ './pages/Personas'))
const SwapPage = lazy(() => import('./pages/Swap'))
const RequestPermissionPage = lazy(() => import('./RequestPermission'))
const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect'))
const ThirdPartyRequestPermission = lazy(() => import('./ThirdPartyRequestPermission'))

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)
function PluginRenderDelayed() {
    const [canRenderPlugin, setRenderPlugins] = useState(false)
    useEffect(() => setRenderPlugins(true), [])
    if (!canRenderPlugin) return null
    return <PluginRender />
}

export default function Popups() {
    const [title, setTitle] = useState('')
    useEffect(queryRemoteI18NBundle(Services.Helper.queryRemoteI18NBundle), [])
    return (
        <MaskUIRoot fallback={frame(<LoadingPlaceholder />)} useTheme={usePopupTheme} kind="page">
            <PopupSnackbarProvider>
                <PopupContext.Provider>
                    <PageTitleContext.Provider value={{ title, setTitle }}>
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
            </PopupSnackbarProvider>
        </MaskUIRoot>
    )
}

function frame(x: React.ReactNode) {
    return <PopupFrame children={x} />
}
