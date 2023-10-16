import { useEffect } from 'react'
import { CssBaseline, ThemeProvider, StyledEngineProvider, GlobalStyles } from '@mui/material'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
    CustomSnackbarProvider,
    applyMaskColorVars,
    MaskLightTheme,
    MaskDarkTheme,
    useSystemPreferencePalette,
    DialogStackingProvider,
} from '@masknet/theme'
import { I18NextProviderHMR, PersonaContext, SharedContextProvider, persistOptions } from '@masknet/shared'
import { ErrorBoundary, queryClient } from '@masknet/shared-base-ui'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { NetworkPluginID, i18NextInstance, queryRemoteI18NBundle } from '@masknet/shared-base'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

import { Pages } from '../pages/routes.js'
import { UserContext, useAppearance } from '../../shared-ui/index.js'
import Services from '#services'

const GlobalCss = (
    <GlobalStyles
        styles={{
            '[data-hide-scrollbar]': {
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            },
        }}
    />
)

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

const PersonaContextIO = {
    queryOwnedPersonaInformation: Services.Identity.queryOwnedPersonaInformation,
    queryPersonaAvatarLastUpdateTime: Services.Identity.getPersonaAvatarLastUpdateTime,
}
export default function DashboardRoot(props: React.PropsWithChildren<{}>) {
    useEffect(() => queryRemoteI18NBundle(Services.Helper.queryRemoteI18NBundle), [])

    // #region theme
    const appearance = useAppearance()
    const mode = useSystemPreferencePalette()
    const theme = {
        dark: MaskDarkTheme,
        light: MaskLightTheme,
        default: mode === 'dark' ? MaskDarkTheme : MaskLightTheme,
    }[appearance]

    applyMaskColorVars(document.body, appearance === 'default' ? mode : appearance)
    // #endregion

    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
            <RootWeb3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                {process.env.NODE_ENV === 'development' ? (
                    <ReactQueryDevtools position="bottom-right" toggleButtonProps={{ style: { width: 24 } }} />
                ) : null}
                <I18NextProviderHMR i18n={i18NextInstance}>
                    <StyledEngineProvider injectFirst>
                        <ThemeProvider theme={theme}>
                            <DialogStackingProvider>
                                <UserContext.Provider>
                                    <PersonaContext.Provider initialState={PersonaContextIO}>
                                        <ErrorBoundary>
                                            <CssBaseline />
                                            <CustomSnackbarProvider>
                                                <SharedContextProvider>
                                                    {GlobalCss}
                                                    <Pages />
                                                    <PluginRender />
                                                    {props.children}
                                                </SharedContextProvider>
                                            </CustomSnackbarProvider>
                                        </ErrorBoundary>
                                    </PersonaContext.Provider>
                                </UserContext.Provider>
                            </DialogStackingProvider>
                        </ThemeProvider>
                    </StyledEngineProvider>
                </I18NextProviderHMR>
            </RootWeb3ContextProvider>
        </PersistQueryClientProvider>
    )
}
