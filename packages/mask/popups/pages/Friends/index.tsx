import { RestorableScrollContext } from '@masknet/shared'
import { PopupModalRoutes, PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { memo, Suspense, useEffect } from 'react'
import { Navigate, Outlet, useMatch, useSearchParams, type RouteObject } from 'react-router-dom'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder/index.js'
import { NormalHeader, useModalNavigate } from '../../components/index.js'

const r = relativeRouteOf(PopupRoutes.Friends)

export const contactsRoutes: RouteObject[] = [
    { index: true, lazy: () => import('./Home/index.js') },
    { path: `${r(PopupRoutes.FriendsDetail)}/:id?`, lazy: () => import('./Detail/index.js') },
    { path: '*', element: <Navigate to={PopupRoutes.Contacts} /> },
]

export const ContactsFrame = memo(function Contacts() {
    const modalNavigate = useModalNavigate()
    const [params] = useSearchParams()
    const matchDetail = useMatch(`${PopupRoutes.FriendsDetail}/:id`)
    useEffect(() => {
        const from = params.get('from')
        const providerType = params.get('providerType')
        if (from === PopupModalRoutes.SelectProvider && !!providerType) {
            modalNavigate(PopupModalRoutes.ConnectProvider, { providerType })
        }
    }, [params])

    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            {matchDetail ? null : <NormalHeader />}
            <RestorableScrollContext>
                <Outlet />
            </RestorableScrollContext>
        </Suspense>
    )
})
