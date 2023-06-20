import { lazy, memo, Suspense } from 'react'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder/index.js'

import { PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { Route, Routes } from 'react-router-dom'
import { PersonaHeader } from './components/PersonaHeader/index.js'
import { PersonaContext } from '@masknet/shared'
import Services from '../../../service.js'

const Home = lazy(() => import(/* webpackPreload: true */ './Home/index.js'))
const Logout = lazy(() => import('./Logout/index.js'))
const PersonaRename = lazy(() => import('./Rename/index.js'))
const PersonaSignRequest = lazy(() => import('./PersonaSignRequest/index.js'))
const SelectPersona = lazy(() => import('./SelectPersona/index.js'))
const Accounts = lazy(() => import('./Accounts/index.js'))
const AccountDetail = lazy(() => import('./AccountDetail/index.js'))
const ConnectedWallets = lazy(() => import('./ConnectedWallets/index.js'))

const r = relativeRouteOf(PopupRoutes.Personas)
const Persona = memo(() => {
    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <PersonaContext.Provider
                initialState={{
                    queryOwnedPersonaInformation: Services.Identity.queryOwnedPersonaInformation,
                }}>
                <PersonaHeader />
                <Routes>
                    <Route path={r(PopupRoutes.Logout)} element={<Logout />} />
                    <Route path={r(PopupRoutes.PersonaRename)} element={<PersonaRename />} />
                    <Route path={r(PopupRoutes.PersonaSignRequest)} element={<PersonaSignRequest />} />
                    <Route path={r(PopupRoutes.SelectPersona)} element={<SelectPersona />} />
                    <Route path={r(PopupRoutes.SocialAccounts)} element={<Accounts />} />
                    <Route path={r(PopupRoutes.AccountDetail)} element={<AccountDetail />} />
                    <Route path={r(PopupRoutes.ConnectedWallets)} element={<ConnectedWallets />} />
                    <Route path="*" element={<Home />} />
                </Routes>
            </PersonaContext.Provider>
        </Suspense>
    )
})

export default Persona
