import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import { PageUIProvider, PersonaContext } from '@masknet/shared'
import {
    CrossIsolationMessages,
    PopupModalRoutes,
    PopupRoutes as PopupPaths,
    PopupsHistory,
} from '@masknet/shared-base'
import { PopupSnackbarProvider } from '@masknet/theme'
import { DefaultWeb3ContextProvider } from '@masknet/web3-hooks-base'
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
import { usePopupTheme } from '../../utils/theme/usePopupTheme.js'
import Services from '#services'
import { LoadingPlaceholder } from './components/LoadingPlaceholder/index.js'
import { PopupLayout } from './components/PopupLayout/index.js'
import { wrapModal } from './components/index.js'
import { PageTitleContext } from './context.js'
import { PopupContext, UserContext } from './hooks/index.js'
import { ConnectProviderModal } from './modals/ConnectProvider/index.js'
import { SelectProviderModal } from './modals/SelectProviderModal/index.js'
import {
    ChooseCurrencyModal,
    ChooseNetworkModal,
    ConnectSocialAccountModal,
    Modals,
    PersonaRenameModal,
    PersonaSettingModal,
    SetBackupPasswordModal,
    SwitchPersonaModal,
    VerifyBackupPasswordModal,
    WalletGroupModal,
    SelectLanguageModal,
    SelectAppearanceModal,
    SupportedSitesModal,
} from './modals/index.js'
import SwitchWallet from './pages/Wallet/SwitchWallet/index.js'
import { noop } from 'lodash-es'

const Wallet = lazy(() => import(/* webpackPreload: true */ './pages/Wallet/index.js'))
const Personas = lazy(() => import(/* webpackPreload: true */ './pages/Personas/index.js'))
const SwapPage = lazy(() => import('./pages/Swap/index.js'))
const RequestPermissionPage = lazy(() => import('./RequestPermission/index.js'))
const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect/index.js'))
const ThirdPartyRequestPermission = lazy(() => import('./ThirdPartyRequestPermission/index.js'))
const Contacts = lazy(() => import('./pages/Friends/index.js'))
const Settings = lazy(() => import('./pages/Settings/index.js'))

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

function PluginRenderDelayed() {
    const [canRenderPlugin, setRenderPlugins] = useState(false)
    useEffect(() => setRenderPlugins(true), [])
    if (!canRenderPlugin) return null
    return <PluginRender />
}

const personaInitialState = {
    queryOwnedPersonaInformation: Services.Identity.queryOwnedPersonaInformation,
    queryPersonaAvatarLastUpdateTime: Services.Identity.getPersonaAvatarLastUpdateTime,
}
const PopupRoutes = memo(function PopupRoutes() {
    const location = useLocation()
    const mainLocation = location.state?.mainLocation as Location | undefined
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
                            <Route path={PopupPaths.Personas + '/*'} element={<Personas />} />
                            <Route path={PopupPaths.Wallet + '/*'} element={<Wallet />} />
                            <Route path={PopupPaths.Friends + '/*'} element={<Contacts />} />
                            <Route path={PopupPaths.Settings} element={<Settings />} />
                        </Route>
                        <Route path={PopupPaths.Swap} element={<SwapPage />} />
                        <Route path={PopupPaths.RequestPermission} element={<RequestPermissionPage />} />
                        <Route path={PopupPaths.PermissionAwareRedirect} element={<PermissionAwareRedirect />} />
                        <Route
                            path={PopupPaths.ThirdPartyRequestPermission}
                            element={<ThirdPartyRequestPermission />}
                        />
                        <Route path="*" element={<Navigate replace to={PopupPaths.Personas} />} />
                    </Routes>
                    {mainLocation ? (
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
                        </Routes>
                    ) : null}
                </UserContext.Provider>
            </PersonaContext.Provider>
        </Suspense>
    )
})

export default function Popups() {
    const [title, setTitle] = useState('')
    const [extension, setExtension] = useState<ReactNode>()
    const [customBackHandler, setCustomBackHandler] = useState<() => void>()
    const titleContext = useMemo(
        () => ({ title, setTitle, extension, setExtension, customBackHandler, setCustomBackHandler }),
        [title, extension, customBackHandler],
    )

    useIdleTimer({
        onAction: !location.hash.includes('/swap') ? Services.Wallet.setAutoLockTimer : noop,
        throttle: 10000,
    })
    useEffect(() => {
        if (location.hash.includes('/swap')) return
        return CrossIsolationMessages.events.popupRouteUpdated.on((url) => PopupsHistory.replace(url))
    }, [])

    return PageUIProvider(
        usePopupTheme,
        <PopupSnackbarProvider>
            <DefaultWeb3ContextProvider value={{ providerType: ProviderType.MaskWallet }}>
                <PopupContext.Provider>
                    <PageTitleContext.Provider value={titleContext}>
                        <HistoryRouter history={PopupsHistory as unknown as HistoryRouterProps['history']}>
                            <PopupRoutes />
                            <Modals />
                            {/* TODO: Should only load plugins when the page is plugin-aware. */}
                            <PluginRenderDelayed />
                        </HistoryRouter>
                    </PageTitleContext.Provider>
                </PopupContext.Provider>
            </DefaultWeb3ContextProvider>
        </PopupSnackbarProvider>,
        null,
    )
}
