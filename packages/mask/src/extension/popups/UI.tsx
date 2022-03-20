import { lazy } from 'react'
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra'
import { PopupRoutes } from '@masknet/shared-base'
import { useClassicMaskFullPageTheme } from '../../utils'
import '../../social-network-adaptor/browser-action'
import { Web3Provider } from '@masknet/web3-shared-evm'
import { PopupWeb3Context } from '../../web3/context'
import { PopupFrame } from './components/PopupFrame'
import { Appearance } from '@masknet/theme'
import { MaskUIRoot } from '../../UIRoot'

function useAlwaysLightTheme() {
    return useClassicMaskFullPageTheme({ forcePalette: Appearance.light })
}
const Wallet = lazy(() => import('./pages/Wallet'))
const Personas = lazy(() => import('./pages/Personas'))
const SwapPage = lazy(() => import('./pages/Swap'))
const RequestPermissionPage = lazy(() => import('./RequestPermission'))
const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect'))
const ThirdPartyRequestPermission = lazy(() => import('./ThirdPartyRequestPermission'))

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

export default function Popups() {
    return (
        <MaskUIRoot useTheme={useAlwaysLightTheme} kind="page">
            <Web3Provider value={PopupWeb3Context}>
                <HashRouter>
                    <Routes>
                        <Route path={PopupRoutes.Personas + '/*'} element={frame(<Personas />)} />
                        <Route path={PopupRoutes.Wallet + '/*'} element={frame(<Wallet />)} />
                        <Route path={PopupRoutes.Swap} element={<SwapPage />} />
                        <Route path={PopupRoutes.RequestPermission} element={<RequestPermissionPage />} />
                        <Route path={PopupRoutes.PermissionAwareRedirect} element={<PermissionAwareRedirect />} />
                        <Route
                            path={PopupRoutes.ThirdPartyRequestPermission}
                            element={<ThirdPartyRequestPermission />}
                        />
                        <Route path="*" element={<Navigate replace to={PopupRoutes.Personas} />} />
                    </Routes>
                    {/* TODO: Should only load plugins when the page is plugin-aware. */}
                    <PluginRender />
                </HashRouter>
            </Web3Provider>
        </MaskUIRoot>
    )
}

function frame(x: React.ReactNode) {
    return <PopupFrame children={x} />
}
