import React from 'react'
import { DialogContentItem, DialogRouter } from './DialogBase'

import ActionButton from '../DashboardComponents/ActionButton'
import Services from '../../service'
import { decompressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'
import { useI18N } from '../../../utils/i18n-next-ui'
import { BackupJSONFileLatest, UpgradeBackupJSONFile } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { useHistory } from 'react-router-dom'
import { extraPermissions, notifyPermissionUpdate } from '../../../utils/permissions'

export function DatabaseBackupDialog() {
    const { t } = useI18N()
    return (
        <DialogContentItem
            title="Backup Database"
            content="A file <Maskbook-Backup-2019.11.13.db> should appear in your downloads folder. Please keep the backup file carefully."
            actionsAlign="center"
            actions={
                <ActionButton variant="contained" color="primary">
                    {t('ok')}
                </ActionButton>
            }></DialogContentItem>
    )
}

export function DatabaseRestoreDialog() {
    const { t } = useI18N()
    const ref = React.useRef<HTMLInputElement>(null)
    const history = useHistory()
    const [json, setJson] = React.useState<BackupJSONFileLatest | null>(null)
    const [restoreState, setRestoreState] = React.useState<'success' | Error | null>(null)
    const [requiredPermissions, setRequiredPermissions] = React.useState<string[] | null>(null)
    const fileReceiver = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fr = new FileReader()
        fr.readAsText(e.currentTarget.files![0])
        fr.addEventListener('loadend', async () => {
            ref.current!.value = ''
            const str = fr.result as string
            try {
                const json = UpgradeBackupJSONFile(decompressBackupFile(str))
                if (!json) throw new Error('UpgradeBackupJSONFile failed')
                const permissions = await extraPermissions(json.grantedHostPermissions)
                if (!permissions) await Services.Welcome.restoreBackup(json)
                else {
                    setJson(json)
                    setRequiredPermissions(permissions)
                }
                setRestoreState('success')
            } catch (e) {
                console.error(e)
                setRestoreState(e)
            }
        })
    }
    return (
        <>
            <DialogContentItem
                title={t('restore_database')}
                content={t('dashboard_restore_database_hint')}
                actionsAlign="center"
                actions={
                    <>
                        <input type="file" accept="application/json" ref={ref} onChange={fileReceiver} hidden />
                        <ActionButton variant="contained" color="primary" onClick={() => ref.current!.click()}>
                            {t('select_file')}
                        </ActionButton>
                    </>
                }></DialogContentItem>
            {restoreState === 'success' && (
                <DialogRouter
                    fullscreen={false}
                    onExit={() => false}
                    children={
                        <DatabaseRestoreSuccessDialog
                            permissions={!!requiredPermissions}
                            onDecline={() => setRestoreState(null)}
                            onConfirm={() => {
                                if (!requiredPermissions) return history.push('/home')
                                browser.permissions
                                    .request({ origins: requiredPermissions })
                                    .then(notifyPermissionUpdate)
                                    .then((granted) =>
                                        granted
                                            ? Services.Welcome.restoreBackup(json!)
                                            : Promise.reject(new Error('required permissions are not granted')),
                                    )
                                    .then(() => history.push('/home'))
                                    .catch(setRestoreState)
                            }}
                        />
                    }
                />
            )}
            {restoreState && restoreState !== 'success' && (
                <DialogRouter
                    fullscreen={false}
                    children={
                        <DatabaseRestoreFailedDialog onConfirm={() => setRestoreState(null)} error={restoreState} />
                    }
                />
            )}
        </>
    )
}

interface DatabaseRestoreSuccessDialogProps {
    permissions?: boolean | null
    onConfirm(): void
    onDecline?(): void
}

export function DatabaseRestoreSuccessDialog({ permissions, onConfirm, onDecline }: DatabaseRestoreSuccessDialogProps) {
    const { t } = useI18N()
    return (
        <DialogContentItem
            simplified
            title={t(permissions ? 'dashboard_ready_to_import' : 'import_successful')}
            content={t(permissions ? 'dashboard_ready_to_import_hint' : 'dashboard_database_import_successful_hint')}
            actions={
                <>
                    {permissions ? (
                        <>
                            <ActionButton
                                style={{ marginLeft: 0, marginRight: 'auto' }}
                                variant="outlined"
                                color="default"
                                onClick={onDecline}>
                                {t('cancel')}
                            </ActionButton>
                            <ActionButton variant="contained" color={'primary'} onClick={onConfirm}>
                                {t('proceed')}
                            </ActionButton>
                        </>
                    ) : (
                        <ActionButton variant="outlined" color={'default'} onClick={onConfirm}>
                            {t('ok')}
                        </ActionButton>
                    )}
                </>
            }></DialogContentItem>
    )
}

interface DatabaseRestoreFailedDialogProps {
    error: Error | string | null
    onConfirm(): void
}

export function DatabaseRestoreFailedDialog({ error, onConfirm }: DatabaseRestoreFailedDialogProps) {
    const { t } = useI18N()
    return (
        <DialogContentItem
            simplified
            title={t('import_failed')}
            content={typeof error === 'string' ? error : error?.message ?? 'Unknown Error'}
            actions={
                <ActionButton variant="outlined" color="default" onClick={onConfirm}>
                    {t('ok')}
                </ActionButton>
            }></DialogContentItem>
    )
}
