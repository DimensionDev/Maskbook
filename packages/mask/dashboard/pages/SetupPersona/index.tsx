import { useMatch, type RouteObject } from 'react-router-dom'
import { DashboardRoutes, relativeRoute as rr, relativeRouteOf } from '@masknet/shared-base'
import { SetupFrame } from '../../components/SetupFrame/index.js'
import { Backup } from './Backup/index.js'

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
        element: <Backup />,
        children: [
            {
                index: true,
                lazy: () => import('./Backup/LocalBackup.js'),
            },
            {
                path: rr(Routes.Backup, Routes.BackupLocal),
                lazy: () => import('./Backup/LocalBackup.js'),
                index: true,
            },
            {
                path: rr(Routes.Backup, Routes.BackupCloud),
                lazy: () => import('./Backup/CloudBackup/index.js'),
                children: [
                    {
                        index: true,
                        lazy: () => import('./Backup/CloudBackup/MaskNetworkBackup.js'),
                    },
                    {
                        path: rr(Routes.BackupCloud, Routes.BackupCloudMaskNetwork),
                        lazy: () => import('./Backup/CloudBackup/MaskNetworkBackup.js'),
                    },
                    {
                        path: rr(Routes.BackupCloud, Routes.BackupCloudGoogleDrive),
                        lazy: () => import('./Backup/CloudBackup/GoogleDriveBackup.js'),
                    },
                    {
                        path: rr(Routes.BackupCloud, Routes.BackupPreview),
                        lazy: () => import('./Backup/CloudBackup/Preview.js'),
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
    { path: r(Routes.LocalBackup), lazy: () => import('./LocalBackup/index.js') },
    { path: r(Routes.CloudBackup), lazy: () => import('./CloudBackup/index.js') },
    { path: r(Routes.CloudBackupPreview), lazy: () => import('./CloudBackupPreview/index.js') },
]
export function PersonaFrame() {
    const matchPersonaOnboarding = useMatch(DashboardRoutes.SignUpPersonaOnboarding)
    const matchPermissionOnboarding = useMatch(DashboardRoutes.PermissionsOnboarding)
    return <SetupFrame hiddenSpline={!!matchPersonaOnboarding || !!matchPermissionOnboarding} />
}
