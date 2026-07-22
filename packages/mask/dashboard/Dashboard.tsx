import { cloneElement } from 'react'
import { CssBaseline, GlobalStyles } from '@mui/material'
import { StyledEngineProvider } from '@mui/material/styles'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { CustomSnackbarProvider, DialogStackingProvider, MaskThemeProvider } from '@masknet/theme'
import { LinguiProviderHMR, PersonaContext, SharedContextProvider, Modals } from '@masknet/shared'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { DashboardRoutes, jsxCompose } from '@masknet/shared-base'

import { Pages } from './pages/routes.js'
import { UserContext, usePageThemePalette, useThemeLanguage } from '../shared-ui/index.js'
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
export default function Dashboard() {
    const mode = usePageThemePalette()
    const [localization] = useThemeLanguage()

    return jsxCompose(
        <RootWeb3ContextProvider enforceEVM />,
        <LinguiProviderHMR i18n={i18n} />,
        <StyledEngineProvider injectFirst enableCssLayer />,
        <MaskThemeProvider palette={mode} localization={localization} />,
        <DialogStackingProvider />,
        <UserContext.Provider />,
        <PersonaContext.Provider initialState={PersonaContextIO} />,
        <ErrorBoundary />,
        <CustomSnackbarProvider> </CustomSnackbarProvider>,
        <SharedContextProvider />,
    )(
        cloneElement,
        <>
            <CssBaseline />
            {GlobalCss}
            {/* https://github.com/TanStack/query/issues/5417 */}
            {process.env.NODE_ENV === 'development' ?
                <ReactQueryDevtools buttonPosition="bottom-right" />
            :   null}
            <Modals createWallet={() => Services.Helper.openDashboard(DashboardRoutes.CreateMaskWalletForm)} />
            <Pages />
        </>,
    )
}
