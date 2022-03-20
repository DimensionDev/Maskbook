import { PersonaContext } from './pages/Personas/hooks/usePersonaContext'
import { Navigate } from 'react-router-dom'

interface GuardRouteProps {
    redirectTo: string
}

export default function NoPersonaGuardRoute(props: React.PropsWithChildren<GuardRouteProps>) {
    const { redirectTo } = props
    const { currentPersona } = PersonaContext.useContainer()
    return currentPersona ? <Navigate to={redirectTo} replace /> : <>{props.children}</>
}
