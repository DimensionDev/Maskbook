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
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra'
import { Web3Provider } from '@masknet/web3-shared-evm'

import i18n from 'i18next'
import { I18nextProvider } from 'react-i18next'

import './PluginHost'
import { Pages } from '../pages/routes'
import { Web3Context } from '../web3/context'
import { useAppearance } from '../pages/Personas/api'
import { PersonaContext } from '../pages/Personas/hooks/usePersonaContext'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

export default function DashboardRoot() {
    const settings = useAppearance()
    const mode = useSystemPreferencePalette()
    const themes: Record<typeof settings, Theme> = {
        dark: MaskDarkTheme,
        light: MaskLightTheme,
        default: mode === 'dark' ? MaskDarkTheme : MaskLightTheme,
    }
    const theme = themes[settings]

    applyMaskColorVars(document.body, settings === 'default' ? mode : settings)

    return (
        <NoEffectUsePortalShadowRootContext.Provider value={true}>
            <Web3Provider value={Web3Context}>
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
            </Web3Provider>
        </NoEffectUsePortalShadowRootContext.Provider>
    )
}
