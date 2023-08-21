import { lazy, memo, Suspense, useEffect } from 'react'
import { Route, Routes, useSearchParams, useMatch } from 'react-router-dom'
import { PopupModalRoutes, PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder/index.js'
import { useModalNavigate, NormalHeader } from '../../components/index.js'
import { FriendsDetail } from './Detail/index.js'
import { RestorableScrollContext } from '@masknet/shared'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const Home = lazy(() => import(/* webpackPreload: true */ './Home/index.js'))
const r = relativeRouteOf(PopupRoutes.Friends)

const Contacts = memo(function Contacts() {
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
                <QueryClientProvider client={new QueryClient()}>
                    <Routes>
                        <Route path="*" element={<Home />} />
                        <Route path={`${r(PopupRoutes.FriendsDetail)}/:id?`} element={<FriendsDetail />} />
                    </Routes>
                </QueryClientProvider>
            </RestorableScrollContext.Provider>
        </Suspense>
    )
})

export default Contacts
