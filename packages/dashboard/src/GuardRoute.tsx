import { PersonaContext } from './pages/Personas/hooks/usePersonaContext'
import { Navigate, Route } from 'react-router-dom'
import type { RoutePaths } from './type'

interface GuardRouteProps {
    path: RoutePaths
    element?: JSX.Element
    redirectTo?: string
}

export default function NoPersonaGuardRoute(props: GuardRouteProps) {
    const { currentPersona } = PersonaContext.useContainer()
    const { redirectTo, ...rest } = props

    return currentPersona ? <Navigate to={redirectTo ?? '/'} replace /> : <Route {...rest} />
}
