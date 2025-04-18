import { useMatch, type RouteObject } from 'react-router-dom'
import { DashboardRoutes, relativeRoute as rr, relativeRouteOf } from '@masknet/shared-base'
import { SetupFrame } from '../../components/SetupFrame/index.js'

const r = relativeRouteOf(DashboardRoutes.Setup)
const Routes = DashboardRoutes
export const personaRoutes: RouteObject[] = [
    { path: r(Routes.Welcome), lazy: () => import('./Welcome/index.js') },
    { path: r(Routes.Permissions), lazy: () => import('./Permissions/index.js') },
    { path: r(Routes.PermissionsOnboarding), lazy: () => import('./PermissionOnboarding/index.js') },
    { path: r(Routes.SignUpPersona), lazy: () => import('./SignUp/index.js') },
    { path: r(Routes.SignUpPersonaMnemonic), lazy: () => import('./Mnemonic/index.js') },
    { path: r(Routes.SignUpPersonaOnboarding), lazy: () => import('./Onboarding/index.js') },
    {
        path: r(Routes.Backup),
        lazy: () => import('./Backup/index.js'),
        children: [
            {
                index: true,
                lazy: () => import('./Backup/Local.js'),
            },
            {
                path: rr(Routes.Backup, Routes.BackupLocal),
                lazy: () => import('./Backup/Local.js'),
            },
            {
                path: rr(Routes.Backup, Routes.BackupCloud),
                lazy: () => import('./Backup/Cloud/index.js'),
                children: [
                    {
                        index: true,
                        lazy: () => import('./Backup/Cloud/MaskNetwork.js'),
                    },
                    {
                        path: rr(Routes.BackupCloud, Routes.BackupCloudMaskNetwork),
                        lazy: () => import('./Backup/Cloud/MaskNetwork.js'),
                    },
                    {
                        path: rr(Routes.BackupCloud, Routes.BackupCloudGoogleDrive),
                        lazy: () => import('./Backup/Cloud/GoogleDrive.js'),
                    },
                    {
                        path: rr(Routes.BackupCloud, Routes.BackupPreview),
                        lazy: () => import('./Backup/Cloud/Preview.js'),
                    },
                ],
            },
        ],
    },
    {
        path: r(Routes.Recovery),
        lazy: () => import('./Recovery/index.js'),
        children: [
            {
                index: true,
                lazy: () => import('./Recovery/Phrase.js'),
            },
            {
                path: rr(Routes.Recovery, Routes.RecoveryPhrase),
                lazy: () => import('./Recovery/Phrase.js'),
            },
            {
                path: rr(Routes.Recovery, Routes.RecoveryPrivateKey),
                lazy: () => import('./Recovery/PrivateKey.js'),
            },
            {
                path: rr(Routes.Recovery, Routes.RecoveryLocal),
                lazy: () => import('./Recovery/Local.js'),
            },
            {
                path: rr(Routes.Recovery, Routes.RecoveryCloud),
                lazy: () => import('./Recovery/Cloud/index.js'),
                children: [
                    {
                        index: true,
                        lazy: () => import('./Recovery/Cloud/MaskNetwork.js'),
                    },
                    {
                        path: rr(Routes.RecoveryCloud, Routes.RecoveryCloudMaskNetwork),
                        lazy: () => import('./Recovery/Cloud/MaskNetwork.js'),
                    },
                    {
                        path: rr(Routes.RecoveryCloud, Routes.RecoveryCloudGoogleDrive),
                        lazy: () => import('./Recovery/Cloud/GoogleDrive.js'),
                    },
                ],
            },
        ],
    },
]
export function PersonaFrame() {
    const matchPersonaOnboarding = useMatch(DashboardRoutes.SignUpPersonaOnboarding)
    const matchPermissionOnboarding = useMatch(DashboardRoutes.PermissionsOnboarding)
    return <SetupFrame hiddenSpline={!!matchPersonaOnboarding || !!matchPermissionOnboarding} />
}
