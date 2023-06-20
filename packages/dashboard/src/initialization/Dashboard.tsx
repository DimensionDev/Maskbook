import { useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, StyledEngineProvider } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
    CustomSnackbarProvider,
    applyMaskColorVars,
    DashboardDarkTheme,
    DashboardLightTheme,
    useSystemPreferencePalette,
    DialogStackingProvider,
} from '@masknet/theme'
import { I18NextProviderHMR, PersonaContext, SharedContextProvider } from '@masknet/shared'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import { TelemetryProvider, EnvironmentContextProvider, Web3ContextProvider } from '@masknet/web3-hooks-base'
import { i18NextInstance, NetworkPluginID, queryRemoteI18NBundle, queryClient } from '@masknet/shared-base'

import '../utils/kv-storage.js'

import { Pages } from '../pages/routes.js'
import { useAppearance } from '../pages/Personas/api.js'
import { Services } from '../API.js'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)
const Web3ContextType = { pluginID: NetworkPluginID.PLUGIN_EVM }

export default function DashboardRoot() {
    useEffect(() => queryRemoteI18NBundle(Services.Helper.queryRemoteI18NBundle), [])

    // #region theme
    const appearance = useAppearance()
    const mode = useSystemPreferencePalette()
    const theme = {
        dark: DashboardDarkTheme,
        light: DashboardLightTheme,
        default: mode === 'dark' ? DashboardDarkTheme : DashboardLightTheme,
    }[appearance]

    applyMaskColorVars(document.body, appearance === 'default' ? mode : appearance)
    // #endregion

    return (
        <EnvironmentContextProvider value={Web3ContextType}>
            <Web3ContextProvider value={Web3ContextType}>
                <QueryClientProvider client={queryClient}>
                    {process.env.NODE_ENV === 'development' ? (
                        <ReactQueryDevtools position="bottom-right" toggleButtonProps={{ style: { width: 24 } }} />
                    ) : null}
                    <TelemetryProvider>
                        <I18NextProviderHMR i18n={i18NextInstance}>
                            <StyledEngineProvider injectFirst>
                                <ThemeProvider theme={theme}>
                                    <DialogStackingProvider>
                                        <PersonaContext.Provider
                                            initialState={{
                                                queryOwnedPersonaInformation:
                                                    Services.Identity.queryOwnedPersonaInformation,
                                            }}>
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
                                    </DialogStackingProvider>
                                </ThemeProvider>
                            </StyledEngineProvider>
                        </I18NextProviderHMR>
                    </TelemetryProvider>
                </QueryClientProvider>
            </Web3ContextProvider>
        </EnvironmentContextProvider>
    )
}
