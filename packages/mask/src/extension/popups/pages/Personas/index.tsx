import { lazy, memo, Suspense } from 'react'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder'

import { PersonaContext } from './hooks/usePersonaContext'
import { PopupRoutes } from '@masknet/shared-base'
import { Route, Switch } from 'react-router-dom'

const Home = lazy(() => import('./Home'))
const Logout = lazy(() => import('./Logout'))
const PersonaRename = lazy(() => import('./Rename'))
const PersonaSignRequest = lazy(() => import('./PersonaSignRequest'))

const Persona = memo(() => {
    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <PersonaContext.Provider>
                <Switch>
                    <Route path={PopupRoutes.Personas} exact children={<Home />} />
                    <Route path={PopupRoutes.Logout} exact children={<Logout />} />
                    <Route path={PopupRoutes.PersonaRename} exact children={<PersonaRename />} />
                    <Route path={PopupRoutes.PersonaSignRequest} exact children={<PersonaSignRequest />} />
                </Switch>
            </PersonaContext.Provider>
        </Suspense>
    )
})

export default Persona
