import { HashRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, StyledEngineProvider, Theme } from '@mui/material'
import {
    CustomSnackbarProvider,
    MaskLightTheme,
    applyMaskColorVars,
    MaskDarkTheme,
    useSystemPreferencePalette,
} from '@masknet/theme'
import { I18NextProviderHMR, SharedContextProvider } from '@masknet/shared'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import {
    PluginsWeb3ContextProvider,
    useAllPluginsWeb3State,
    useCurrentWeb3NetworkPluginID,
} from '@masknet/plugin-infra/web3'
import { i18NextInstance, queryRemoteI18NBundle } from '@masknet/shared-base'

import '../utils/kv-storage'

import './PluginHost'
import { Pages } from '../pages/routes'
import { useAppearance } from '../pages/Personas/api'
import { PersonaContext } from '../pages/Personas/hooks/usePersonaContext'
import { useEffect } from 'react'
import { Services } from '../API'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

export default function DashboardRoot() {
    const pluginID = useCurrentWeb3NetworkPluginID()
    const PluginsWeb3State = useAllPluginsWeb3State()

    useEffect(queryRemoteI18NBundle(Services.Helper.queryRemoteI18NBundle), [])

    // #region theme
    const appearance = useAppearance()
    const mode = useSystemPreferencePalette()
    const themes: Record<typeof appearance, Theme> = {
        dark: MaskDarkTheme,
        light: MaskLightTheme,
        default: mode === 'dark' ? MaskDarkTheme : MaskLightTheme,
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
