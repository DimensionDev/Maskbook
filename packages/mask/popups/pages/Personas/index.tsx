import { memo, useEffect } from 'react'
import { useMount, useAsync } from 'react-use'
import { Navigate, Outlet, useNavigate, useSearchParams, type RouteObject } from 'react-router-dom'
import { CrossIsolationMessages, PopupModalRoutes, PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { PersonaHeader } from './components/PersonaHeader/index.js'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { useModalNavigate } from '../../components/index.js'
import Services from '#services'

const r = relativeRouteOf(PopupRoutes.Personas)
export const personaRoute: RouteObject[] = [
    { index: true, lazy: () => import('./Home/index.js') },
    { path: r(PopupRoutes.Logout), lazy: () => import('./Logout/index.js') },
    { path: r(PopupRoutes.PersonaSignRequest), lazy: () => import('./PersonaSignRequest/index.js') },
    { path: r(PopupRoutes.AccountDetail), lazy: () => import('./AccountDetail/index.js') },
    { path: r(PopupRoutes.ConnectWallet), lazy: () => import('./ConnectWallet/index.js') },
    { path: r(PopupRoutes.WalletConnect), lazy: () => import('./WalletConnect/index.js') },
    { path: r(PopupRoutes.ExportPrivateKey), lazy: () => import('./ExportPrivateKey/index.js') },
    { path: r(PopupRoutes.PersonaAvatarSetting), lazy: () => import('./PersonaAvatarSetting/index.js') },
    { path: '*', element: <Navigate replace to={PopupRoutes.Personas} /> },
]

export const PersonaFrame = memo(function PersonaFrame() {
    const navigate = useNavigate()
    const modalNavigate = useModalNavigate()

    const [params] = useSearchParams()

    useMount(() => {
        return CrossIsolationMessages.events.popupWalletConnectEvent.on(({ open, uri }) => {
            if (!open || location.href.includes(PopupRoutes.WalletConnect)) return
            navigate(PopupRoutes.WalletConnect, {
                replace: params.get('modal')?.includes(PopupModalRoutes.SelectProvider),
                state: { uri },
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

    useAsync(async () => {
        const groups = await Services.SiteAdaptor.getOriginsWithoutPermission()
        const origins = groups.flatMap((x) => x.origins)

        if (origins.length && origins.every((x) => x === 'https://www.x.com/*' || x === 'https://x.com/*')) {
            modalNavigate(PopupModalRoutes.UpdatePermissions)
        }
    }, [])

    return (
        <EVMWeb3ContextProvider>
            <PersonaHeader />
            <Outlet />
        </EVMWeb3ContextProvider>
    )
})
