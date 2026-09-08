import { PersonaContext, LinguiProviderHMR, PrivySetup, SharedContextProvider } from '@masknet/shared'
import { jsxCompose, MaskMessages, PopupRoutes } from '@masknet/shared-base'
import { DialogStackingProvider, MaskThemeProvider } from '@masknet/theme'
import { EVMWeb3ContextProvider, RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Box } from '@mui/material'
import React, { Suspense, cloneElement, lazy, memo, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
    createHashRouter,
    Navigate,
    Outlet,
    RouterProvider,
    useNavigate,
    useSearchParams,
    useRouteError,
} from 'react-router-dom'
import Services from '#services'
import { LoadingPlaceholder } from '@masknet/injected-ui/LoadingPlaceholder'
import { PopupLayout } from './components/PopupLayout/index.js'
import { PopupContext, PageTitleContext } from './hooks/index.js'
import { UserContext, queryPersistOptions, usePageThemePalette, useThemeLanguage } from '../shared-ui/index.js'
import { Modals } from './modals/index.js'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, ErrorBoundary } from '@masknet/shared-base-ui'
import { PersonaFrame, personaRoute } from './pages/Personas/index.js'
import { walletRoutes } from './pages/Wallet/routes.js'
import { contactsRoutes } from './pages/Friends/routes.js'
import { traderRoutes } from './pages/Trader/routes.js'
import { ErrorBoundaryUIOfError } from '../../shared-base-ui/src/components/ErrorBoundary/ErrorBoundary.js'
import { StyledEngineProvider } from '@mui/material/styles'
import { i18n } from '@lingui/core'
import { PopupSnackbarProvider } from './components/PopupSnackbarProvider/index.js'

const personaInitialState = {
    queryOwnedPersonaInformation: Services.Identity.queryOwnedPersonaInformation,
    queryPersonaAvatarLastUpdateTime: Services.Identity.getPersonaAvatarLastUpdateTime,
    queryPersonaAvatar: Services.Identity.getPersonaAvatar,
}

const pending = (
    <Box sx={{ height: '100vh', display: 'flex' }}>
        <LoadingPlaceholder />
    </Box>
)
// Modals hosts the imperative SingletonModal targets; it must mount with the
// first commit; otherwise openAndWaitForClose callers hang when the host has
// not registered yet.
const RoutedModals = lazy(() => import('./modals/modals.js'))
const ReactQueryDevtools = lazy(async () => {
    const { ReactQueryDevtools } = await import('@tanstack/react-query-devtools')
    return { default: ReactQueryDevtools }
})
const loadTrader = () => import('./pages/Trader/index.js')
const loadWallet = () => import('./pages/Wallet/index.js')
const loadContacts = () => import('./pages/Friends/index.js')
const PopupShell = memo(function PopupShell() {
    const [searchParams] = useSearchParams()
    const modal = searchParams.get('modal')

    const navigate = useNavigate()
    useEffect(() => {
        return MaskMessages.events.popupRouteUpdated.on((url) => navigate(url, { replace: true }))
    }, [navigate])

    useEffect(() => {
        document.querySelector('#app-spinner')?.remove()
    }, [])

    return (
        <PersonaContext initialState={personaInitialState}>
            <UserContext>
                <Suspense fallback={pending}>
                    <Outlet />
                </Suspense>
                <Modals />
                <Suspense>
                    {modal ?
                        <ErrorBoundary>
                            <RoutedModals path={modal} />
                        </ErrorBoundary>
                    :   null}
                </Suspense>
            </UserContext>
        </PersonaContext>
    )
})

const router = createHashRouter([
    {
        element: <PopupShell />,
        hydrateFallbackElement: pending,
        errorElement: <ErrorPageBoundary />,
        children: [
            {
                element: <PopupLayout />,
                children: [
                    { path: PopupRoutes.Personas, element: <PersonaFrame />, children: personaRoute },
                    {
                        path: PopupRoutes.Wallet,
                        lazy: async () => ({ Component: (await loadWallet()).WalletFrame }),
                        children: walletRoutes,
                    },
                    {
                        path: PopupRoutes.Friends,
                        lazy: async () => ({ Component: (await loadContacts()).ContactsFrame }),
                        children: contactsRoutes,
                    },
                    { path: PopupRoutes.Settings, lazy: () => import('./pages/Settings/index.js') },
                    {
                        path: PopupRoutes.Trader,
                        lazy: async () => ({ Component: (await loadTrader()).TraderFrame }),
                        children: traderRoutes,
                    },
                ],
            },
            { path: PopupRoutes.RequestPermission, lazy: () => import('./pages/RequestPermission/index.js') },
            { path: PopupRoutes.GetTwitterTokenByQR, lazy: () => import('./pages/GetTwitterTokenByQR/index.js') },
            { path: '*', element: <Navigate replace to={PopupRoutes.Personas} /> },
        ],
    },
])

export default function Popups() {
    const [title, setTitle] = useState('')
    const [extension, setExtension] = useState<ReactNode>()
    const [customBackHandler, setCustomBackHandler] = useState<() => void>()
    const titleContext = useMemo(
        () => ({ title, setTitle, extension, setExtension, customBackHandler, setCustomBackHandler }),
        [title, extension, customBackHandler],
    )

    return jsxCompose(
        <Suspense />,

        // Provide the minimal environment (i18n, material theme) for CrashUI in page mode
        <LinguiProviderHMR i18n={i18n} />,
        <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions} />,
        <MaskPopupThemeProvider />,
        <StyledEngineProvider injectFirst enableCssLayer />,
        <ErrorBoundary />,

        <Suspense />,
        <DialogStackingProvider hasGlobalBackdrop={false} />,
        <RootWeb3ContextProvider />,
        <SharedContextProvider />,
        <PopupSnackbarProvider />,
        <EVMWeb3ContextProvider providerType={ProviderType.None} />,
        <PopupContext />,
        <PageTitleContext value={titleContext} />,
    )(
        cloneElement,
        <>
            <PrivySetup />
            {/* https://github.com/TanStack/query/issues/5417 */}
            {process.env.NODE_ENV === 'development' ?
                <Suspense fallback={null}>
                    <ReactQueryDevtools buttonPosition="bottom-right" />
                </Suspense>
            :   null}
            <RouterProvider router={router} />
        </>,
    )
}

function ErrorPageBoundary() {
    const error = useRouteError()
    return <ErrorBoundaryUIOfError error={error} hasError />
}

function MaskPopupThemeProvider({ children }: React.PropsWithChildren) {
    // those two hooks depends on tanstack's provider
    const palette = usePageThemePalette()
    const [localization] = useThemeLanguage()
    return (
        <MaskThemeProvider palette={palette} localization={localization}>
            {children}
        </MaskThemeProvider>
    )
}
