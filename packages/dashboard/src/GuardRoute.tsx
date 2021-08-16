import { PersonaContext } from './pages/Personas/hooks/usePersonaContext'
import { Navigate, Route, RouteProps } from 'react-router'

interface GuardRouteProps extends RouteProps {
    redirectTo?: string
}

export default function NotLoginGuardRoute(props: GuardRouteProps) {
    const { currentPersona } = PersonaContext.useContainer()
    const { redirectTo, ...rest } = props

    return currentPersona ? <Navigate to={redirectTo ?? '/'} replace /> : <Route {...rest} />
}
