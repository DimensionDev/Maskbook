import { HashRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, StyledEngineProvider, Theme } from '@mui/material'
import {
    CustomSnackbarProvider,
    MaskLightTheme,
    applyMaskColorVars,
    MaskDarkTheme,
    useSystemPreferencePalette,
    NoEffectUsePortalShadowRootContext,
} from '@masknet/theme'
import { ErrorBoundary } from '@masknet/shared'
import {
    createInjectHooksRenderer,
    PluginWeb3ContextProvider,
    useActivatedPluginsDashboard,
    useActivatedPluginWeb3Context,
} from '@masknet/plugin-infra'
import { Web3Provider } from '@masknet/web3-shared-evm'

import i18n from 'i18next'
import { I18nextProvider } from 'react-i18next'

import './PluginHost'
import { Pages } from '../pages/routes'
import { Web3Context } from '../web3/context'
import { useAppearance, usePluginID } from '../pages/Personas/api'
import { PersonaContext } from '../pages/Personas/hooks/usePersonaContext'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

export default function DashboardRoot() {
    const pluginID = usePluginID()
    const PluginWeb3Context = useActivatedPluginWeb3Context(pluginID)

    //#region theme
    const appearance = useAppearance()
    const mode = useSystemPreferencePalette()
    const themes: Record<typeof appearance, Theme> = {
        dark: MaskDarkTheme,
        light: MaskLightTheme,
        default: mode === 'dark' ? MaskDarkTheme : MaskLightTheme,
    }
    const theme = themes[appearance]

    applyMaskColorVars(document.body, appearance === 'default' ? mode : appearance)
    //#endregion

    return (
        <NoEffectUsePortalShadowRootContext.Provider value={true}>
            <Web3Provider value={Web3Context}>
                <PluginWeb3ContextProvider value={PluginWeb3Context!}>
                    <I18nextProvider i18n={i18n}>
                        <StyledEngineProvider injectFirst>
                            <ThemeProvider theme={theme}>
                                <PersonaContext.Provider>
                                    <ErrorBoundary>
                                        <CssBaseline />
                                        <CustomSnackbarProvider>
                                            <HashRouter>
                                                <Pages />
                                            </HashRouter>
                                            <PluginRender />
                                        </CustomSnackbarProvider>
                                    </ErrorBoundary>
                                </PersonaContext.Provider>
                            </ThemeProvider>
                        </StyledEngineProvider>
                    </I18nextProvider>
                </PluginWeb3ContextProvider>
            </Web3Provider>
        </NoEffectUsePortalShadowRootContext.Provider>
    )
}
