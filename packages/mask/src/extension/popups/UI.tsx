import { lazy, useState } from 'react'
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import { PopupRoutes } from '@masknet/shared-base'
import { usePopupFullPageTheme } from '../../utils/theme/useClassicMaskFullPageTheme'
import '../../social-network-adaptor/browser-action'
import { PopupContext } from './hook/usePopupContext'
import { Web3Provider } from '@masknet/web3-shared-evm'
import { PopupWeb3Context } from '../../web3/context'
import { PopupFrame } from './components/PopupFrame'
import { MaskUIRoot } from '../../UIRoot'
import { PageTitleContext } from './context'
import { useValueRef } from '@masknet/shared-base-ui'
import { languageSettings } from '../../settings/settings'
import { PopupSnackbarProvider } from '@masknet/theme'

function usePopupTheme() {
    return usePopupFullPageTheme(useValueRef(languageSettings))
}
const Wallet = lazy(() => import('./pages/Wallet'))
const Personas = lazy(() => import('./pages/Personas'))
const SwapPage = lazy(() => import('./pages/Swap'))
const RequestPermissionPage = lazy(() => import('./RequestPermission'))
const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect'))
const ThirdPartyRequestPermission = lazy(() => import('./ThirdPartyRequestPermission'))

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

export default function Popups() {
    const [title, setTitle] = useState('')
    return (
        <MaskUIRoot useTheme={usePopupTheme} kind="page">
            <PopupSnackbarProvider>
                <Web3Provider value={PopupWeb3Context}>
                    <PopupContext.Provider>
                        <PageTitleContext.Provider value={{ title, setTitle }}>
                            <HashRouter>
                                <Routes>
                                    <Route path={PopupRoutes.Personas + '/*'} element={frame(<Personas />)} />
                                    <Route path={PopupRoutes.Wallet + '/*'} element={frame(<Wallet />)} />
                                    <Route path={PopupRoutes.Swap} element={<SwapPage />} />
                                    <Route path={PopupRoutes.RequestPermission} element={<RequestPermissionPage />} />
                                    <Route
                                        path={PopupRoutes.PermissionAwareRedirect}
                                        element={<PermissionAwareRedirect />}
                                    />
                                    <Route
                                        path={PopupRoutes.ThirdPartyRequestPermission}
                                        element={<ThirdPartyRequestPermission />}
                                    />
                                    <Route path="*" element={<Navigate replace to={PopupRoutes.Personas} />} />
                                </Routes>
                                {/* TODO: Should only load plugins when the page is plugin-aware. */}
                                <PluginRender />
                            </HashRouter>
                        </PageTitleContext.Provider>
                    </PopupContext.Provider>
                </Web3Provider>
            </PopupSnackbarProvider>
        </MaskUIRoot>
    )
}

function frame(x: React.ReactNode) {
    return <PopupFrame children={x} />
}
