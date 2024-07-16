import type { RouteObject } from 'react-router-dom'
import { SignUpRoutePath } from './routePath.js'

export const signUpRoutes: RouteObject[] = [
    { path: SignUpRoutePath.PersonaRecovery, lazy: () => import('./steps/PersonaRecovery.js') },
]

export { SetupFrame as SignUpFrame } from '../../components/SetupFrame/index.js'
