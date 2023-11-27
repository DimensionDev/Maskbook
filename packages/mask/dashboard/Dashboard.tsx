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
import { I18NextProviderHMR, PersonaContext, SharedContextProvider, persistOptions, Modals } from '@masknet/shared'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { DashboardRoutes, i18NextInstance, queryRemoteI18NBundle, compose } from '@masknet/shared-base'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

import { Pages } from './pages/routes.js'
import { UserContext, useAppearance } from '../shared-ui/index.js'
import Services from '#services'
import { useQueryClient } from '@tanstack/react-query'

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

const PersonaContextIO = {
    queryOwnedPersonaInformation: Services.Identity.queryOwnedPersonaInformation,
    queryPersonaAvatarLastUpdateTime: Services.Identity.getPersonaAvatarLastUpdateTime,
}
export default function Dashboard() {
    const queryClient = useQueryClient()
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
        (children) => (
            <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions} children={children} />
        ),
        (children) => <RootWeb3ContextProvider enforceEVM children={children} />,
        (children) => <I18NextProviderHMR i18n={i18NextInstance} children={children} />,
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
            {process.env.NODE_ENV === 'development' ?
                <ReactQueryDevtools buttonPosition="bottom-right" />
            :   null}
            <Modals createWallet={() => Services.Helper.openDashboard(DashboardRoutes.CreateMaskWalletForm)} />
            <Pages />
        </>,
    )
}
