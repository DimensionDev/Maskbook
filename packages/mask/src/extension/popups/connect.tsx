import { PopupRoutes, queryRemoteI18NBundle } from '@masknet/shared-base'
import { lazy, useEffect, useState } from 'react'
import { MaskUIRootPage } from '../../UIRoot-page.js'
import { usePopupFullPageTheme } from '../../utils/theme/useClassicMaskFullPageTheme.js'
import { useValueRef } from '@masknet/shared-base-ui'
import { languageSettings } from '../../../shared/legacy-settings/settings.js'
import { PopupContext } from './hook/usePopupContext.js'
import Services from '../service.js'
import { PopupSnackbarProvider } from '@masknet/theme'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { PageTitleContext } from './context.js'
import { PopupFrame } from './components/PopupFrame/index.js'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'

function usePopupTheme() {
    return usePopupFullPageTheme(useValueRef(languageSettings))
}

const ConnectWallet = lazy(() => import('./pages/Wallet/ConnectWallet/index.js'))
const VerifyWallet = lazy(() => import('./pages/Personas/VerifyWallet/index.js'))

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)
function PluginRenderDelayed() {
    const [canRenderPlugin, setRenderPlugins] = useState(false)
    useEffect(() => setRenderPlugins(true), [])
    if (!canRenderPlugin) return null
    return <PluginRender />
}

export default function PopupsConnect() {
    const [title, setTitle] = useState('')
    useEffect(queryRemoteI18NBundle(Services.Helper.queryRemoteI18NBundle), [])

    return MaskUIRootPage(
        usePopupTheme,
        <PopupSnackbarProvider>
            <PopupContext.Provider>
                <PageTitleContext.Provider value={{ title, setTitle }}>
                    <HashRouter>
                        <Routes>
                            <Route path={PopupRoutes.ConnectWallet} element={frame(<ConnectWallet />)} />
                            <Route path={PopupRoutes.VerifyWallet} element={frame(<VerifyWallet />)} />
                        </Routes>
                        <PluginRenderDelayed />
                    </HashRouter>
                </PageTitleContext.Provider>
            </PopupContext.Provider>
        </PopupSnackbarProvider>,
    )
}

function frame(x: React.ReactNode) {
    return <PopupFrame children={x} />
}
