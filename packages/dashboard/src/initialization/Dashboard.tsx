import { HashRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, StyledEngineProvider, Theme } from '@material-ui/core'
import { StylesProvider } from '@material-ui/styles'
import {
    CustomSnackbarProvider,
    MaskLightTheme,
    applyMaskColorVars,
    MaskDarkTheme,
    useSystemPreferencePalatte,
} from '@masknet/theme'
import { Emitter } from '@servie/events'
import { ErrorBoundary } from '@masknet/shared'

import i18n from 'i18next'
import { I18nextProvider } from 'react-i18next'

import './plugins'
import { startPluginDashboard, createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra'
import { Pages } from '../pages/routes'
import { useAppearance } from '../pages/Personas/api'
import { Web3Provider } from '@masknet/web3-shared'
import { Web3Context } from '../web3/context'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

// TODO: implement
startPluginDashboard({
    enabled: { events: new Emitter(), isEnabled: () => true },
})
export default function DashboardRoot() {
    const settings = useAppearance()
    const mode = useSystemPreferencePalatte()
    const themes: Record<typeof settings, Theme> = {
        dark: MaskDarkTheme,
        light: MaskLightTheme,
        default: mode === 'dark' ? MaskDarkTheme : MaskLightTheme,
    }
    const theme = themes[settings]

    applyMaskColorVars(document.body, settings === 'default' ? mode : settings)

    return (
        <Web3Provider value={Web3Context}>
            <I18nextProvider i18n={i18n}>
                <StyledEngineProvider injectFirst>
                    <StylesProvider>
                        <ThemeProvider theme={theme}>
                            <ErrorBoundary>
                                <CssBaseline />
                                <CustomSnackbarProvider>
                                    <HashRouter>
                                        <Pages />
                                    </HashRouter>
                                    <PluginRender />
                                </CustomSnackbarProvider>
                            </ErrorBoundary>
                        </ThemeProvider>
                    </StylesProvider>
                </StyledEngineProvider>
            </I18nextProvider>
        </Web3Provider>
    )
}
