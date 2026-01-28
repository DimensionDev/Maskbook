import { createHashRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { TermsGuard } from './TermsGuard.js'
import { PersonaFrame, personaRoutes } from './SetupPersona/index.js'
import { SignUpFrame, signUpRoutes } from './SignUp/index.js'
import { WalletFrame, walletRoutes } from './CreateMaskWallet/index.js'
import { Modals } from '../modals/index.js'
import { Suspense } from 'react'

const routes: RouteObject[] = [
    { path: DashboardRoutes.Setup, element: <PersonaFrame />, children: personaRoutes, hydrateFallbackElement: null },
    { path: DashboardRoutes.SignUp, element: <SignUpFrame />, children: signUpRoutes, hydrateFallbackElement: null },
    {
        path: DashboardRoutes.CreateMaskWallet,
        element: <WalletFrame />,
        children: walletRoutes,
        hydrateFallbackElement: null,
    },
]
const rootElement = (
    <Suspense>
        <TermsGuard />
        <Modals />
    </Suspense>
)
const root = createHashRouter([{ element: rootElement, children: routes }], {})

export function Pages() {
    return <RouterProvider router={root} />
}
