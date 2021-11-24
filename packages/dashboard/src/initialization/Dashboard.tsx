import { HashRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, StyledEngineProvider, Theme } from '@mui/material'
import {
    CustomSnackbarProvider,
    MaskLightTheme,
    applyMaskColorVars,
    MaskDarkTheme,
    useSystemPreferencePalette,
} from '@masknet/theme'
import { ErrorBoundary } from '@masknet/shared'
import {
    createInjectHooksRenderer,
    NetworkPluginID,
    PluginsWeb3ContextProvider,
    useActivatedPluginsDashboard,
    useAllPluginsWeb3State,
    usePluginIDContext,
} from '@masknet/plugin-infra'
import { Web3Provider } from '@masknet/web3-shared-evm'

import i18n from 'i18next'
import { I18nextProvider } from 'react-i18next'

import '../utils/kv-storage'

import './PluginHost'
import { Pages } from '../pages/routes'
import { Web3Context } from '../web3/context'
import { useAppearance } from '../pages/Personas/api'
import { PersonaContext } from '../pages/Personas/hooks/usePersonaContext'
import { fixWeb3State } from '../../../mask/src/plugins/EVM/UI/Web3State'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

export default function DashboardRoot() {
    const pluginID = usePluginIDContext()
    const PluginsWeb3State = useAllPluginsWeb3State()

    // TODO:
    // migrate EVM plugin
    fixWeb3State(PluginsWeb3State[NetworkPluginID.PLUGIN_EVM], Web3Context)

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
        <Web3Provider value={Web3Context}>
            <PluginsWeb3ContextProvider pluginID={pluginID} value={PluginsWeb3State}>
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
            </PluginsWeb3ContextProvider>
        </Web3Provider>
    )
}
