import { lazy, useEffect, useState } from 'react'
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import { PopupRoutes } from '@masknet/shared-base'
import { usePopupFullPageTheme } from '../../utils/theme/useClassicMaskFullPageTheme'
import '../../social-network-adaptor/browser-action'
import { PopupContext } from './hook/usePopupContext'
import { PopupFrame } from './components/PopupFrame'
import { MaskUIRoot } from '../../UIRoot'
import { PageTitleContext } from './context'
import { useValueRef } from '@masknet/shared-base-ui'
import { languageSettings } from '../../../shared/legacy-settings/settings'
import { PopupSnackbarProvider } from '@masknet/theme'
import { LoadingPlaceholder } from './components/LoadingPlaceholder'

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
