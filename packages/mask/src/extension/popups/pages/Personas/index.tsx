import { lazy, memo, Suspense } from 'react'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder'

import { PersonaContext } from './hooks/usePersonaContext'
import { PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { Route, Routes } from 'react-router-dom'
import { PersonaHeader } from './components/PersonaHeader'

const Home = lazy(() => import('./Home'))
const Logout = lazy(() => import('./Logout'))
const PersonaRename = lazy(() => import('./Rename'))
const PersonaSignRequest = lazy(() => import('./PersonaSignRequest'))
const SelectPersona = lazy(() => import('./SelectPersona'))

const r = relativeRouteOf(PopupRoutes.Personas)
const Persona = memo(() => {
    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <PersonaContext.Provider>
                <PersonaHeader />
                <Routes>
                    <Route path={r(PopupRoutes.Logout)} element={<Logout />} />
                    <Route path={r(PopupRoutes.PersonaRename)} element={<PersonaRename />} />
                    <Route path={r(PopupRoutes.PersonaSignRequest)} element={<PersonaSignRequest />} />
                    <Route path={r(PopupRoutes.SelectPersona)} element={<SelectPersona />} />
                    <Route path="*" element={<Home />} />
                </Routes>
            </PersonaContext.Provider>
        </Suspense>
    )
})

export default Persona
