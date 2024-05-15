import { PageUIProvider, PersonaContext } from '@masknet/shared'
import { MaskMessages, PopupModalRoutes, PopupRoutes as PopupPaths, PopupsHistory } from '@masknet/shared-base'
import { PopupSnackbarProvider } from '@masknet/theme'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Box } from '@mui/material'
import { Suspense, lazy, memo, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import {
    unstable_HistoryRouter as HistoryRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
    type HistoryRouterProps,
} from 'react-router-dom'
import { usePopupTheme } from './hooks/usePopupTheme.js'
import Services from '#services'
import { LoadingPlaceholder } from './components/LoadingPlaceholder/index.js'
import { PopupLayout } from './components/PopupLayout/index.js'
import { wrapModal } from './components/index.js'
import { PopupContext, PageTitleContext } from './hooks/index.js'
import { ConnectProviderModal } from './modals/ConnectProvider/index.js'
import { SelectProviderModal } from './modals/SelectProviderModal/index.js'
import {
    ChooseCurrencyModal,
    ChooseNetworkModal,
    ConnectSocialAccountModal,
    PersonaRenameModal,
    PersonaSettingModal,
    SetBackupPasswordModal,
    SwitchPersonaModal,
    VerifyBackupPasswordModal,
    WalletGroupModal,
    SelectLanguageModal,
    SelectAppearanceModal,
    SupportedSitesModal,
    ChangeBackupPasswordModal,
} from './modals/modals.js'
import { Modals } from './modals/index.js'
import SwitchWallet from './pages/Wallet/SwitchWallet/index.js'
import { UserContext, queryPersistOptions } from '../shared-ui/index.js'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient } from '@masknet/shared-base-ui'

const Wallet = lazy(() => import(/* webpackPreload: true */ './pages/Wallet/index.js'))
const Personas = lazy(() => import(/* webpackMode: 'eager' */ './pages/Personas/index.js'))
const RequestPermissionPage = lazy(() => import('./pages/RequestPermission/index.js'))
const Contacts = lazy(() => import('./pages/Friends/index.js'))
const Settings = lazy(() => import('./pages/Settings/index.js'))

const personaInitialState = {
    queryOwnedPersonaInformation: Services.Identity.queryOwnedPersonaInformation,
    queryPersonaAvatarLastUpdateTime: Services.Identity.getPersonaAvatarLastUpdateTime,
    queryPersonaAvatar: Services.Identity.getPersonaAvatar,
}
const PopupRoutes = memo(function PopupRoutes() {
    const location = useLocation()
    const mainLocation = location.state?.mainLocation as Location | undefined

    useEffect(() => {
        document.getElementById('app-spinner')?.remove()
    }, [])

    return (
        <Suspense
            fallback={
                <Box height="100vh" display="flex">
                    <LoadingPlaceholder />
                </Box>
            }>
            <PersonaContext.Provider initialState={personaInitialState}>
                <UserContext.Provider>
                    <Routes location={mainLocation || location}>
                        <Route path="/" element={<PopupLayout />}>
                            <Route path={PopupPaths.Personas + '/*'} element={withSuspense(<Personas />)} />
                            <Route path={PopupPaths.Wallet + '/*'} element={withSuspense(<Wallet />)} />
                            <Route path={PopupPaths.Friends + '/*'} element={withSuspense(<Contacts />)} />
                            <Route path={PopupPaths.Settings} element={withSuspense(<Settings />)} />
                        </Route>

                        <Route path={PopupPaths.RequestPermission} element={<RequestPermissionPage />} />
                        <Route path="*" element={<Navigate replace to={PopupPaths.Personas} />} />
                    </Routes>
                    {mainLocation ?
                        <Routes>
                            <Route
                                path={PopupModalRoutes.verifyBackupPassword}
                                element={wrapModal(<VerifyBackupPasswordModal />)}
                            />
                            <Route
                                path={PopupModalRoutes.SetBackupPassword}
                                element={wrapModal(<SetBackupPasswordModal />)}
                            />
                            <Route path={PopupModalRoutes.PersonaRename} element={wrapModal(<PersonaRenameModal />)} />
                            <Route
                                path={PopupModalRoutes.PersonaSettings}
                                element={wrapModal(<PersonaSettingModal />)}
                            />
                            <Route path={PopupModalRoutes.SwitchPersona} element={wrapModal(<SwitchPersonaModal />)} />
                            <Route
                                path={PopupModalRoutes.ChooseCurrency}
                                element={wrapModal(<ChooseCurrencyModal />)}
                            />
                            <Route path={PopupModalRoutes.ChooseNetwork} element={wrapModal(<ChooseNetworkModal />)} />
                            <Route path={PopupModalRoutes.SwitchWallet} element={wrapModal(<SwitchWallet />)} />
                            <Route
                                path={PopupModalRoutes.ConnectSocialAccount}
                                element={wrapModal(<ConnectSocialAccountModal />)}
                            />
                            <Route
                                path={PopupModalRoutes.SelectProvider}
                                element={wrapModal(<SelectProviderModal />)}
                            />
                            <Route
                                path={PopupModalRoutes.ConnectProvider}
                                element={wrapModal(<ConnectProviderModal />)}
                            />
                            <Route path={PopupModalRoutes.WalletAccount} element={wrapModal(<WalletGroupModal />)} />
                            <Route
                                path={PopupModalRoutes.SelectLanguage}
                                element={wrapModal(<SelectLanguageModal />)}
                            />
                            <Route
                                path={PopupModalRoutes.SelectAppearance}
                                element={wrapModal(<SelectAppearanceModal />)}
                            />
                            <Route
                                path={PopupModalRoutes.SupportedSitesModal}
                                element={wrapModal(<SupportedSitesModal />)}
                            />
                            <Route
                                path={PopupModalRoutes.ChangeBackupPassword}
                                element={wrapModal(<ChangeBackupPasswordModal />)}
                            />
                        </Routes>
                    :   null}
                </UserContext.Provider>
            </PersonaContext.Provider>
        </Suspense>
    )
})
PopupRoutes.displayName = 'PopupRoutes'
function withSuspense(children: ReactNode) {
    return (
        <Suspense
            fallback={
                <Box height="100vh" display="flex">
                    <LoadingPlaceholder />
                </Box>
            }>
            {children}
        </Suspense>
    )
}

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
    useEffect(() => {
        return MaskMessages.events.popupRouteUpdated.on((url) => PopupsHistory.replace(url))
    }, [])

    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions}>
            {/* https://github.com/TanStack/query/issues/5417 */}
            {process.env.NODE_ENV === 'development' ?
                <ReactQueryDevtools buttonPosition="bottom-right" />
            :   null}
            {PageUIProvider(
                usePopupTheme,
                <PopupSnackbarProvider>
                    <EVMWeb3ContextProvider providerType={ProviderType.MaskWallet}>
                        <PopupContext.Provider>
                            <PageTitleContext.Provider value={titleContext}>
                                <HistoryRouter history={PopupsHistory as unknown as HistoryRouterProps['history']}>
                                    <PopupRoutes />
                                    <Modals />
                                </HistoryRouter>
                            </PageTitleContext.Provider>
                        </PopupContext.Provider>
                    </EVMWeb3ContextProvider>
                </PopupSnackbarProvider>,
                null,
            )}
        </PersistQueryClientProvider>
    )
}
