import { lazy, memo, Suspense, useEffect } from 'react'
import { Route, Routes, useSearchParams } from 'react-router-dom'
import { NetworkPluginID, PopupModalRoutes } from '@masknet/shared-base'

import { LoadingPlaceholder } from '../../components/LoadingPlaceholder/index.js'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { useModalNavigate } from '../../components/index.js'

const Home = lazy(() => import(/* webpackPreload: true */ './Home/index.js'))

const Contacts = memo(() => {
    const modalNavigate = useModalNavigate()

    const [params] = useSearchParams()
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
                <Routes>
                    <Route path="*" element={<Home />} />
                </Routes>
            </Web3ContextProvider>
        </Suspense>
    )
})

export default Contacts
