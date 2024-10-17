import { PageUIProvider, PersonaContext } from '@masknet/shared'
import { jsxCompose, MaskMessages, PopupRoutes } from '@masknet/shared-base'
import { PopupSnackbarProvider } from '@masknet/theme'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Box } from '@mui/material'
import { Suspense, cloneElement, lazy, memo, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import {
    createHashRouter,
    Navigate,
    Outlet,
    RouterProvider,
    useNavigate,
    useSearchParams,
    useRouteError,
} from 'react-router-dom'
import { usePopupTheme } from './hooks/usePopupTheme.js'
import Services from '#services'
import { LoadingPlaceholder } from './components/LoadingPlaceholder/index.js'
import { PopupLayout } from './components/PopupLayout/index.js'
import { PopupContext, PageTitleContext } from './hooks/index.js'
import { Modals } from './modals/index.js'
import { UserContext, queryPersistOptions } from '../shared-ui/index.js'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient } from '@masknet/shared-base-ui'
import { PersonaFrame, personaRoute } from './pages/Personas/index.js'
import { WalletFrame, walletRoutes } from './pages/Wallet/index.js'
import { ContactsFrame, contactsRoutes } from './pages/Friends/index.js'
import { ErrorBoundaryUIOfError } from '../../shared-base-ui/src/components/ErrorBoundary/ErrorBoundary.js'
import { TraderFrame, traderRoutes } from './pages/Trader/index.js'

const personaInitialState = {
    queryOwnedPersonaInformation: Services.Identity.queryOwnedPersonaInformation,
    queryPersonaAvatarLastUpdateTime: Services.Identity.getPersonaAvatarLastUpdateTime,
    queryPersonaAvatar: Services.Identity.getPersonaAvatar,
}

const pending = (
    <Box height="100vh" display="flex">
        <LoadingPlaceholder />
    </Box>
)
const RoutedModals = lazy(() => import('./modals/modals.js'))
const PopupShell = memo(function PopupShell() {
    const [searchParams] = useSearchParams()
    const modal = searchParams.get('modal')

    const navigate = useNavigate()
    useEffect(() => {
        return MaskMessages.events.popupRouteUpdated.on((url) => navigate(url, { replace: true }))
    }, [])

    useEffect(() => {
        document.getElementById('app-spinner')?.remove()
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
                        <RoutedModals path={modal} />
                    :   null}
                </Suspense>
            </UserContext>
        </PersonaContext>
    )
})

const router = createHashRouter([
    {
        element: <PopupShell />,
        errorElement: <ErrorPageBoundary />,
        children: [
            {
                element: <PopupLayout />,
                children: [
                    { path: PopupRoutes.Personas, element: <PersonaFrame />, children: personaRoute },
                    { path: PopupRoutes.Wallet, element: <WalletFrame />, children: walletRoutes },
                    { path: PopupRoutes.Friends, element: <ContactsFrame />, children: contactsRoutes },
                    { path: PopupRoutes.Settings, lazy: () => import('./pages/Settings/index.js') },
                    { path: PopupRoutes.Trader, element: <TraderFrame />, children: traderRoutes },
                ],
            },
            { path: PopupRoutes.RequestPermission, lazy: () => import('./pages/RequestPermission/index.js') },
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

    useIdleTimer({
        onAction: () => Services.Wallet.setAutoLockTimer(),
        throttle: 10000,
    })

    return jsxCompose(
        <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions} />,
        <PageUIProvider useTheme={usePopupTheme} />,
        <PopupSnackbarProvider children={null!} />,
        <EVMWeb3ContextProvider providerType={ProviderType.MaskWallet} />,
        <PopupContext />,
        <PageTitleContext value={titleContext} />,
    )(
        cloneElement,
        <>
            {/* https://github.com/TanStack/query/issues/5417 */}
            {process.env.NODE_ENV === 'development' ?
                <ReactQueryDevtools buttonPosition="bottom-right" />
            :   null}
            <RouterProvider router={router} fallbackElement={pending} future={{ v7_startTransition: true }} />
        </>,
    )
}

function ErrorPageBoundary() {
    const error = useRouteError()
    return <ErrorBoundaryUIOfError error={error} hasError />
}
