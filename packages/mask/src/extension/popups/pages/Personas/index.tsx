import { lazy, memo, Suspense, useEffect } from 'react'
import { useMount } from 'react-use'
import { Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
import {
    CrossIsolationMessages,
    NetworkPluginID,
    PopupModalRoutes,
    PopupRoutes,
    relativeRouteOf,
} from '@masknet/shared-base'

import { LoadingPlaceholder } from '../../components/LoadingPlaceholder/index.js'
import { PersonaHeader } from './components/PersonaHeader/index.js'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { useModalNavigate } from '../../components/index.js'

const Home = lazy(() => import(/* webpackPreload: true */ './Home/index.js'))
const Logout = lazy(() => import('./Logout/index.js'))
const PersonaRename = lazy(() => import('./Rename/index.js'))
const PersonaSignRequest = lazy(() => import('./PersonaSignRequest/index.js'))
const SelectPersona = lazy(() => import('./SelectPersona/index.js'))
const AccountDetail = lazy(() => import('./AccountDetail/index.js'))
const ConnectedWallets = lazy(() => import('./ConnectedWallets/index.js'))
const ConnectWallet = lazy(() => import('./ConnectWallet/index.js'))
const WalletConnect = lazy(() => import('./WalletConnect/index.js'))

const r = relativeRouteOf(PopupRoutes.Personas)

const Persona = memo(() => {
    const navigate = useNavigate()
    const modalNavigate = useModalNavigate()

    const [params] = useSearchParams()

    useMount(() => {
        return CrossIsolationMessages.events.popupWalletConnectEvent.on(({ open, uri }) => {
            if (!open || location.href.includes(PopupRoutes.WalletConnect)) return
            navigate(PopupRoutes.WalletConnect, {
                state: {
                    uri,
                },
            })
        })
    })

    useEffect(() => {
        const from = params.get('from')
        const providerType = params.get('providerType')
        if (from === PopupModalRoutes.SelectProvider && !!providerType) {
            modalNavigate(PopupModalRoutes.ConnectProvider, { providerType })
        }
    }, [params])

    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                <PersonaHeader />
                <Routes>
                    <Route path={r(PopupRoutes.Logout)} element={<Logout />} />
                    <Route path={r(PopupRoutes.PersonaRename)} element={<PersonaRename />} />
                    <Route path={r(PopupRoutes.PersonaSignRequest)} element={<PersonaSignRequest />} />
                    <Route path={r(PopupRoutes.SelectPersona)} element={<SelectPersona />} />
                    <Route path={r(PopupRoutes.AccountDetail)} element={<AccountDetail />} />
                    <Route path={r(PopupRoutes.ConnectedWallets)} element={<ConnectedWallets />} />
                    <Route path={r(PopupRoutes.ConnectWallet)} element={<ConnectWallet />} />
                    <Route path={r(PopupRoutes.WalletConnect)} element={<WalletConnect />} />
                    <Route path="*" element={<Home />} />
                </Routes>
            </Web3ContextProvider>
        </Suspense>
    )
})

export default Persona
