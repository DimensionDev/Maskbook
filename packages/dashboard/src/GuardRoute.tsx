import { PersonaContext } from './pages/Personas/hooks/usePersonaContext'
import { Navigate, Route } from 'react-router-dom'
import type { DashboardRoutes } from '@masknet/shared-base'

interface GuardRouteProps {
    path: DashboardRoutes
    element?: JSX.Element
    redirectTo?: string
}

export default function NoPersonaGuardRoute(props: GuardRouteProps) {
    const { redirectTo, ...rest } = props
    const { currentPersona } = PersonaContext.useContainer()
    return currentPersona ? <Navigate to={redirectTo ?? '/'} replace /> : <Route {...rest} />
}
