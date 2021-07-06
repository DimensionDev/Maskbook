import { RowLayout } from '../../components/RegisterFrame/RowLayout'
import { SignUpRoutes } from './routes'
import { PersonaContext } from '../Personas/hooks/usePersonaContext'

export default function SignUp() {
    return (
        <PersonaContext.Provider>
            <RowLayout>
                <SignUpRoutes />
            </RowLayout>
        </PersonaContext.Provider>
    )
}
