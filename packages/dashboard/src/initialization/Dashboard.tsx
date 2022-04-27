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
import { NetworkPluginID, PluginsWeb3ContextProvider, useAllPluginsWeb3State } from '@masknet/plugin-infra/web3'
import { Web3Provider } from '@masknet/web3-shared-evm'

import { i18NextInstance } from '@masknet/shared-base'

import '../utils/kv-storage'

import './PluginHost'
import { Pages } from '../pages/routes'
import { Web3Context } from '../web3/context'
import { useAppearance, usePluginID } from '../pages/Personas/api'
import { PersonaContext } from '../pages/Personas/hooks/usePersonaContext'
import { fixWeb3State } from '../../../mask/src/plugins/EVM/UI/Web3State'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

export default function DashboardRoot() {
    const pluginID = usePluginID()
    const PluginsWeb3State = useAllPluginsWeb3State()

    // TODO:
    // migrate EVM plugin
    fixWeb3State(PluginsWeb3State[NetworkPluginID.PLUGIN_EVM], Web3Context)

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
        <Web3Provider value={Web3Context}>
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
                                                <PluginRender />
                                            </HashRouter>
                                        </SharedContextProvider>
                                    </CustomSnackbarProvider>
                                </ErrorBoundary>
                            </PersonaContext.Provider>
                        </ThemeProvider>
                    </StyledEngineProvider>
                </I18NextProviderHMR>
            </PluginsWeb3ContextProvider>
        </Web3Provider>
    )
}
