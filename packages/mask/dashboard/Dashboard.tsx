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
import { I18NextProviderHMR, LinguiProviderHMR, PersonaContext, SharedContextProvider, Modals } from '@masknet/shared'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { DashboardRoutes, i18NextInstance, queryRemoteI18NBundle, compose } from '@masknet/shared-base'

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
export default function Dashboard() {
    useEffect(() => queryRemoteI18NBundle(Services.Helper.queryRemoteI18NBundle), [])

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

    return compose(
        (children) => <RootWeb3ContextProvider enforceEVM children={children} />,
        (children) => <I18NextProviderHMR i18n={i18NextInstance} children={children} />,
        (children) => <LinguiProviderHMR i18n={i18n} children={children} />,
        (children) => <StyledEngineProvider injectFirst children={children} />,
        (children) => <ThemeProvider theme={theme} children={children} />,
        (children) => <DialogStackingProvider children={children} />,
        (children) => <UserContext.Provider children={children} />,
        (children) => <PersonaContext.Provider initialState={PersonaContextIO} children={children} />,
        (children) => <ErrorBoundary children={children} />,
        (children) => <CustomSnackbarProvider children={children} />,
        (children) => <SharedContextProvider children={children} />,
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
