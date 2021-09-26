import { PersonaContext } from './pages/Personas/hooks/usePersonaContext'
import { Navigate, Route, RouteProps } from 'react-router-dom'

interface GuardRouteProps extends RouteProps {
    redirectTo?: string
}

export default function NoPersonaGuardRoute(props: GuardRouteProps) {
    const { currentPersona } = PersonaContext.useContainer()
    const { redirectTo, ...rest } = props

    return currentPersona ? <Navigate to={redirectTo ?? '/'} replace /> : <Route {...rest} />
}
