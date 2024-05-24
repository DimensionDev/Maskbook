import { memo, Suspense, useEffect } from 'react'
import { useSearchParams, useMatch, type RouteObject, Navigate, Outlet } from 'react-router-dom'
import { PopupModalRoutes, PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder/index.js'
import { useModalNavigate, NormalHeader } from '../../components/index.js'
import { RestorableScrollContext } from '@masknet/shared'

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
            <RestorableScrollContext.Provider>
                <Outlet />
            </RestorableScrollContext.Provider>
        </Suspense>
    )
})
