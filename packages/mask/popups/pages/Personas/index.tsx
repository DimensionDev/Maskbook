import { lazy, memo, useEffect } from 'react'
import { useMount } from 'react-use'
import { Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
import { CrossIsolationMessages, PopupModalRoutes, PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { PersonaHeader } from './components/PersonaHeader/index.js'
import { DefaultWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { useModalNavigate } from '../../components/index.js'

const Home = lazy(() => import(/* webpackMode: 'eager' */ './Home/index.js'))
const Logout = lazy(() => import('./Logout/index.js'))
const PersonaSignRequest = lazy(() => import(/* webpackMode: 'eager' */ './PersonaSignRequest/index.js'))
const AccountDetail = lazy(() => import(/* webpackMode: 'eager' */ './AccountDetail/index.js'))
const ConnectWallet = lazy(() => import(/* webpackMode: 'eager' */ './ConnectWallet/index.js'))
const WalletConnect = lazy(() => import(/* webpackMode: 'eager' */ './WalletConnect/index.js'))
const ExportPrivateKey = lazy(() => import('./ExportPrivateKey/index.js'))
const PersonaAvatarSetting = lazy(() => import('./PersonaAvatarSetting/index.js'))

const r = relativeRouteOf(PopupRoutes.Personas)

const Persona = memo(() => {
    const navigate = useNavigate()
    const modalNavigate = useModalNavigate()

    const [params] = useSearchParams()

    useMount(() => {
        return CrossIsolationMessages.events.popupWalletConnectEvent.on(({ open, uri }) => {
            if (!open || location.href.includes(PopupRoutes.WalletConnect)) return
            navigate(PopupRoutes.WalletConnect, {
                replace: location.hash.includes('/modal/select-provider'),
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
        <DefaultWeb3ContextProvider>
            <PersonaHeader />
            <Routes>
                <Route path={r(PopupRoutes.Logout)} element={<Logout />} />
                <Route path={r(PopupRoutes.PersonaSignRequest)} element={<PersonaSignRequest />} />
                <Route path={r(PopupRoutes.AccountDetail)} element={<AccountDetail />} />
                <Route path={r(PopupRoutes.ConnectWallet)} element={<ConnectWallet />} />
                <Route path={r(PopupRoutes.WalletConnect)} element={<WalletConnect />} />
                <Route path={r(PopupRoutes.ExportPrivateKey)} element={<ExportPrivateKey />} />
                <Route path={r(PopupRoutes.PersonaAvatarSetting)} element={<PersonaAvatarSetting />} />
                <Route path="*" element={<Home />} />
            </Routes>
        </DefaultWeb3ContextProvider>
    )
})

export default Persona
