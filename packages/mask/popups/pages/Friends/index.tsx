import { RestorableScrollContext } from '@masknet/shared'
import { PopupModalRoutes, PopupRoutes } from '@masknet/shared-base'
import { memo, Suspense, useEffect } from 'react'
import { Outlet, useMatch, useSearchParams } from 'react-router-dom'
import { LoadingPlaceholder } from '@masknet/injected-ui/LoadingPlaceholder'
import { NormalHeader, useModalNavigate } from '../../components/index.js'

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
