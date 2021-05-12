import React, { StrictMode } from 'react'
import { HashRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, StyledEngineProvider } from '@material-ui/core'
import { StylesProvider } from '@material-ui/styles'
import { MaskLightTheme, ErrorBoundary, applyMaskColorVars } from '@dimensiondev/maskbook-theme'
import { ChainId } from '@dimensiondev/maskbook-shared'
import { Emitter } from '@servie/events'

import i18n from 'i18next'
import { I18nextProvider } from 'react-i18next'

import './plugins'
import {
    startPluginDashboard,
    createInjectHooksRenderer,
    useActivatedPluginsDashboard,
} from '@dimensiondev/mask-plugin-infra'
import { Pages } from '../pages/routes'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

applyMaskColorVars(document.body, 'light')
// TODO: implement
startPluginDashboard({
    enabled: { events: new Emitter(), isEnabled: () => true },
    eth: { current: () => ChainId.Mainnet, events: new Emitter() },
})
export default function DashboardRoot() {
    return (
        <StrictMode>
            <I18nextProvider i18n={i18n}>
                <StyledEngineProvider injectFirst>
                    <StylesProvider>
                        <ThemeProvider theme={MaskLightTheme}>
                            <ErrorBoundary>
                                <CssBaseline />
                                <HashRouter>
                                    <Pages />
                                </HashRouter>
                                <PluginRender />
                            </ErrorBoundary>
                        </ThemeProvider>
                    </StylesProvider>
                </StyledEngineProvider>
            </I18nextProvider>
        </StrictMode>
    )
}
