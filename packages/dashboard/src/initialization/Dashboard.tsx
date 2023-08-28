import { useEffect } from 'react'
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
import { I18NextProviderHMR, SharedContextProvider } from '@masknet/shared'
import { ErrorBoundary, queryClient } from '@masknet/shared-base-ui'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { NetworkPluginID, i18NextInstance, queryRemoteI18NBundle } from '@masknet/shared-base'

import '../utils/kv-storage.js'

import { Pages } from '../pages/routes.js'
import { useAppearance } from '../pages/Personas/api.js'
import { Services } from '../API.js'
import { PersonaContext } from '../pages/Personas/hooks/usePersonaContext.js'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

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
        <RootWeb3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
            <QueryClientProvider client={queryClient}>
                {process.env.NODE_ENV === 'development' ? (
                    <ReactQueryDevtools position="bottom-right" toggleButtonProps={{ style: { width: 24 } }} />
                ) : null}
                <I18NextProviderHMR i18n={i18NextInstance}>
                    <StyledEngineProvider injectFirst>
                        <ThemeProvider theme={theme}>
                            <DialogStackingProvider>
                                <PersonaContext.Provider>
                                    <ErrorBoundary>
                                        <CssBaseline />
                                        <CustomSnackbarProvider>
                                            <SharedContextProvider>
                                                <Pages />
                                                <PluginRender />
                                            </SharedContextProvider>
                                        </CustomSnackbarProvider>
                                    </ErrorBoundary>
                                </PersonaContext.Provider>
                            </DialogStackingProvider>
                        </ThemeProvider>
                    </StyledEngineProvider>
                </I18NextProviderHMR>
            </QueryClientProvider>
        </RootWeb3ContextProvider>
    )
}
