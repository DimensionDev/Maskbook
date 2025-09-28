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
import { LinguiProviderHMR, PersonaContext, SharedContextProvider, Modals } from '@masknet/shared'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { DashboardRoutes, PrivySetupProvider } from '@masknet/shared-base'

import { Pages } from './pages/routes.js'
import { UserContext, useAppearance } from '../shared-ui/index.js'
import Services from '#services'
import { i18n } from '@lingui/core'

const GlobalCss = (
    <GlobalStyles
        styles={{
            '[data-hide-scrollbar]': {
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            },
        }}
    />
)

const PersonaContextIO = {
    queryOwnedPersonaInformation: Services.Identity.queryOwnedPersonaInformation,
    queryPersonaAvatarLastUpdateTime: Services.Identity.getPersonaAvatarLastUpdateTime,
    queryPersonaAvatar: Services.Identity.getPersonaAvatar,
}
const createWallet = () => Services.Helper.openDashboard(DashboardRoutes.CreateMaskWalletForm)
export default function Dashboard() {
    // #region theme
    const appearance = useAppearance()
    const mode = useSystemPreferencePalette()
    const theme = {
        dark: MaskDarkTheme,
        light: MaskLightTheme,
        default: mode === 'dark' ? MaskDarkTheme : MaskLightTheme,
    }[appearance]

    useEffect(() => {
        applyMaskColorVars(document.body, appearance === 'default' ? mode : appearance)
    }, [appearance])
    // #endregion

    // prettier-ignore
    return (
      <PrivySetupProvider>
        <RootWeb3ContextProvider enforceEVM>
          <LinguiProviderHMR i18n={i18n}>
            <StyledEngineProvider injectFirst>
              <ThemeProvider theme={theme}>
                <DialogStackingProvider hasGlobalBackdrop={false}>
                  <UserContext.Provider>
                    <PersonaContext.Provider initialState={PersonaContextIO}>
                      <ErrorBoundary>
                        <CustomSnackbarProvider >
                          <SharedContextProvider>
                            <CssBaseline />
                            {GlobalCss}
                            {/* https://github.com/TanStack/query/issues/5417 */}
                            {process.env.NODE_ENV === 'development' ?
                                <ReactQueryDevtools buttonPosition="bottom-right" />
                            :   null}
                            <Modals createWallet={createWallet} />

                            <Pages />
                          </SharedContextProvider>
                        </CustomSnackbarProvider>
                      </ErrorBoundary>
                    </PersonaContext.Provider>
                  </UserContext.Provider>
                </DialogStackingProvider>
              </ThemeProvider>
            </StyledEngineProvider>
          </LinguiProviderHMR>
        </RootWeb3ContextProvider>
      </PrivySetupProvider>
    )
}
