import { lazy, memo, Suspense, useEffect } from 'react'
import { Route, Routes, useSearchParams, useMatch } from 'react-router-dom'
import { NetworkPluginID, PopupModalRoutes, PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder/index.js'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { useModalNavigate, NormalHeader } from '../../components/index.js'
import { FriendsDetail } from './Detail/index.js'

const Home = lazy(() => import(/* webpackPreload: true */ './Home/index.js'))
const r = relativeRouteOf(PopupRoutes.Friends)

const Contacts = memo(() => {
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
            <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                <Routes>
                    <Route path="*" element={<Home />} />
                    <Route path={`${r(PopupRoutes.FriendsDetail)}/:id?`} element={<FriendsDetail />} />
                </Routes>
            </Web3ContextProvider>
        </Suspense>
    )
})

export default Contacts
