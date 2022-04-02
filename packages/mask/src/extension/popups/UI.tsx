import { lazy, useEffect, useState } from 'react'
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra'
import { PopupRoutes } from '@masknet/shared-base'
import '../../social-network-adaptor/browser-action'
import { Web3Provider } from '@masknet/web3-shared-evm'
import { PopupWeb3Context } from '../../web3/context'
import { PopupFrame } from './components/PopupFrame'
import { Appearance } from '@masknet/theme'
import { MaskUIRoot } from '../../UIRoot'
import { useThemeLanguage } from '../../utils/theme'
import { useClassicMaskFullPageTheme } from '../../utils/theme/useClassicMaskFullPageTheme'
import { useMyPersonas } from '../../components/DataSource/useMyPersonas'
import { useValueRef } from '@masknet/shared-base-ui'
import { languageSettings } from '../../settings/settings'

function useAlwaysLightTheme() {
    return useClassicMaskFullPageTheme(Appearance.light, useThemeLanguage(useValueRef(languageSettings)))
}
const Wallet = lazy(() => import('./pages/Wallet'))
const Personas = lazy(() => import('./pages/Personas'))
const SwapPage = lazy(() => import('./pages/Swap'))
const RequestPermissionPage = lazy(() => import('./RequestPermission'))
const PermissionAwareRedirect = lazy(() => import('./PermissionAwareRedirect'))
const ThirdPartyRequestPermission = lazy(() => import('./ThirdPartyRequestPermission'))

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

export default function Popups() {
    const personaLength = useMyPersonas().length
    const [client, setClient] = useState(false)
    useEffect(() => setClient(true), [])

    return (
        <MaskUIRoot useTheme={useAlwaysLightTheme} kind="page">
            <Web3Provider value={PopupWeb3Context}>
                <HashRouter>
                    <Routes>
                        <Route path={PopupRoutes.Personas + '/*'} element={frame(personaLength, <Personas />)} />
                        <Route path={PopupRoutes.Wallet + '/*'} element={frame(personaLength, <Wallet />)} />
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
                    {client ? <PluginRender /> : null}
                </HashRouter>
            </Web3Provider>
        </MaskUIRoot>
    )
}

function frame(personaLength: number, x: React.ReactNode) {
    return <PopupFrame personaLength={personaLength} children={x} />
}
