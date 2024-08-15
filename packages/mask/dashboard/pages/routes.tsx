import { createHashRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { TermsGuard } from './TermsGuard.js'
import { PersonaFrame, personaRoutes } from './SetupPersona/index.js'
import { SignUpFrame, signUpRoutes } from './SignUp/index.js'
import { WalletFrame, walletRoutes } from './CreateMaskWallet/index.js'
import { Modals } from '../modals/index.js'

const routes: RouteObject[] = [
    { path: DashboardRoutes.Setup, element: <PersonaFrame />, children: personaRoutes },
    { path: DashboardRoutes.SignUp, element: <SignUpFrame />, children: signUpRoutes },
    { path: DashboardRoutes.CreateMaskWallet, element: <WalletFrame />, children: walletRoutes },
]
const rootElement = (
    <>
        <TermsGuard />
        <Modals />
    </>
)
const root = createHashRouter([{ element: rootElement, children: routes }], {
    future: { v7_normalizeFormMethod: true },
})

export function Pages() {
    return <RouterProvider router={root} fallbackElement={null} future={{ v7_startTransition: true }} />
}
