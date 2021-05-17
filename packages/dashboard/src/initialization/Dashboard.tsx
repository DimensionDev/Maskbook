import React, { StrictMode } from 'react'
import { HashRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, StyledEngineProvider, Theme } from '@material-ui/core'
import { StylesProvider } from '@material-ui/styles'
import {
    MaskLightTheme,
    ErrorBoundary,
    applyMaskColorVars,
    MaskDarkTheme,
    useSystemPreferencePalatte,
} from '@dimensiondev/maskbook-theme'
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
import { useAppearance } from '../pages/Personas/api'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

applyMaskColorVars(document.body, 'light')
// TODO: implement
startPluginDashboard({
    enabled: { events: new Emitter(), isEnabled: () => true },
    eth: { current: () => ChainId.Mainnet, events: new Emitter() },
})
export default function DashboardRoot() {
    const settings = useAppearance()
    const themes: Record<typeof settings, Theme> = {
        dark: MaskDarkTheme,
        light: MaskLightTheme,
        default: useSystemPreferencePalatte() === 'dark' ? MaskDarkTheme : MaskLightTheme,
    }
    const theme = themes[settings]
    return (
        <StrictMode>
            <I18nextProvider i18n={i18n}>
                <StyledEngineProvider injectFirst>
                    <StylesProvider>
                        <ThemeProvider theme={theme}>
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
