import { useMatch, type RouteObject } from 'react-router-dom'
import { DashboardRoutes, relativeRouteOf } from '@masknet/shared-base'
import { SetupFrame } from '../../components/SetupFrame/index.js'

const r = relativeRouteOf(DashboardRoutes.Setup)
export const personaRoutes: RouteObject[] = [
    { path: r(DashboardRoutes.Welcome), lazy: () => import('./Welcome/index.js') },
    { path: r(DashboardRoutes.Permissions), lazy: () => import('./Permissions/index.js') },
    { path: r(DashboardRoutes.PermissionsOnboarding), lazy: () => import('./PermissionOnboarding/index.js') },
    { path: r(DashboardRoutes.SignUpPersona), lazy: () => import('./SignUp/index.js') },
    { path: r(DashboardRoutes.RecoveryPersona), lazy: () => import('./Recovery/index.js') },
    { path: r(DashboardRoutes.SignUpPersonaMnemonic), lazy: () => import('./Mnemonic/index.js') },
    { path: r(DashboardRoutes.SignUpPersonaOnboarding), lazy: () => import('./Onboarding/index.js') },
    { path: r(DashboardRoutes.LocalBackup), lazy: () => import('./LocalBackup/index.js') },
    { path: r(DashboardRoutes.CloudBackup), lazy: () => import('./CloudBackup/index.js') },
    { path: r(DashboardRoutes.CloudBackupPreview), lazy: () => import('./CloudBackupPreview/index.js') },
]
export function PersonaFrame() {
    const matchPersonaOnboarding = useMatch(DashboardRoutes.SignUpPersonaOnboarding)
    const matchPermissionOnboarding = useMatch(DashboardRoutes.PermissionsOnboarding)
    return <SetupFrame hiddenSpline={!!matchPersonaOnboarding || !!matchPermissionOnboarding} />
}
