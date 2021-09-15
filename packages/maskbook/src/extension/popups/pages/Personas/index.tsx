import { lazy, memo, Suspense } from 'react'
import { makeStyles } from '@masknet/theme'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder'
import { ProfileList } from './components/ProfileList'
import { EnterDashboard } from '../../components/EnterDashboard'
import { PersonaContext } from './hooks/usePersonaContext'
import { PopupRoutes } from '../../index'
import { Route, Switch } from 'react-router'
import { PersonaHeader } from './components/PersonaHeader'

const Logout = lazy(() => import('./Logout'))

const useStyles = makeStyles()({
    content: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
    },
})

const Persona = memo(() => {
    const { classes } = useStyles()
    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <PersonaContext.Provider>
                <Switch>
                    <Route path={PopupRoutes.Personas} exact>
                        <div className={classes.content}>
                            <PersonaHeader />
                            <ProfileList />
                        </div>
                        <EnterDashboard />
                    </Route>
                    <Route path={PopupRoutes.Logout} exact children={<Logout />} />
                </Switch>
            </PersonaContext.Provider>
        </Suspense>
    )
})

export default Persona
