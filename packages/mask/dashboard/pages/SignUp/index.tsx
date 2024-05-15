import type { RouteObject } from 'react-router-dom'
import { SignUpRoutePath } from './routePath.js'

export const signUpRoutes: RouteObject[] = [
    { path: SignUpRoutePath.MnemonicReveal, lazy: () => import('./steps/MnemonicRevealForm.js') },
    { path: SignUpRoutePath.PersonaCreate, lazy: () => import('./steps/PersonaCreate.js') },
    { path: SignUpRoutePath.PersonaRecovery, lazy: () => import('./steps/PersonaRecovery.js') },
    { path: SignUpRoutePath.ConnectSocialMedia, lazy: () => import('./steps/ConnectSocialMedia.js') },
]

export { SetupFrame as SignUpFrame } from '../../components/SetupFrame/index.js'
