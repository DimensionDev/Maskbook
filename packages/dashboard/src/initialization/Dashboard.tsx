import { HashRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, StyledEngineProvider, Theme } from '@mui/material'
import {
    CustomSnackbarProvider,
    applyMaskColorVars,
    DashboardDarkTheme,
    DashboardLightTheme,
    useSystemPreferencePalette,
} from '@masknet/theme'
import { I18NextProviderHMR, SharedContextProvider } from '@masknet/shared'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import { useAllPluginsWeb3State } from '@masknet/plugin-infra'
import { PluginsWeb3ContextProvider, useCurrentWeb3NetworkPluginID } from '@masknet/web3-hooks-base'
import { i18NextInstance, queryRemoteI18NBundle } from '@masknet/shared-base'

import '../utils/kv-storage.js'

import { Pages } from '../pages/routes.js'
import { useAppearance } from '../pages/Personas/api.js'
import { PersonaContext } from '../pages/Personas/hooks/usePersonaContext.js'
import { useEffect } from 'react'
import { Services } from '../API.js'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

export default function DashboardRoot() {
    const pluginID = useCurrentWeb3NetworkPluginID()
    const PluginsWeb3State = useAllPluginsWeb3State()

    useEffect(queryRemoteI18NBundle(Services.Helper.queryRemoteI18NBundle), [])

    // #region theme
    const appearance = useAppearance()
    const mode = useSystemPreferencePalette()
    const themes: Record<typeof appearance, Theme> = {
        dark: DashboardDarkTheme,
        light: DashboardLightTheme,
        default: mode === 'dark' ? DashboardDarkTheme : DashboardLightTheme,
    }
    const theme = themes[appearance]

    applyMaskColorVars(document.body, appearance === 'default' ? mode : appearance)
    // #endregion

    return (
        <PluginsWeb3ContextProvider pluginID={pluginID} value={PluginsWeb3State}>
            <I18NextProviderHMR i18n={i18NextInstance}>
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={theme}>
                        <PersonaContext.Provider>
                            <ErrorBoundary>
                                <CssBaseline />
                                <CustomSnackbarProvider>
                                    <SharedContextProvider>
                                        <HashRouter>
                                            <Pages />
                                        </HashRouter>
                                        <PluginRender />
                                    </SharedContextProvider>
                                </CustomSnackbarProvider>
                            </ErrorBoundary>
                        </PersonaContext.Provider>
                    </ThemeProvider>
                </StyledEngineProvider>
            </I18NextProviderHMR>
        </PluginsWeb3ContextProvider>
    )
}
