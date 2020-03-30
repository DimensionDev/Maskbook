import React from 'react'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback } from './Base'
import { Database as DatabaseIcon } from 'react-feather'
import { Button } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { BackupJSONFileLatest, UpgradeBackupJSONFile } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { decompressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'
import Services from '../../service'
import { extraPermissions } from '../../../utils/permissions'
import { useSnackbar } from 'notistack'

export function DashboardDatabaseBackupDialog(props: WrappedDialogProps) {
    const onClick = useSnackbarCallback(
        () => Services.Welcome.createBackupFile({ download: true, onlyBackupWhoAmI: false }),
        [],
        props.onClose,
    )
    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<DatabaseIcon />}
                iconColor="#699CF7"
                primary="Backup Database"
                secondary="Create a database backup file. Do it frequently.">
                <Button variant="contained" color="primary" onClick={onClick}>
                    Ok, Back it up
                </Button>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardDatabaseRestoreDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const { enqueueSnackbar } = useSnackbar()

    const ref = React.useRef<HTMLInputElement>(null!)
    const [json, setJson] = React.useState<BackupJSONFileLatest | null>(null)
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
                if (!permissions) {
                    await Services.Welcome.restoreBackup(json)
                    enqueueSnackbar(t('done'), { variant: 'success' })
                    props.onClose()
                } else {
                    setJson(json)
                    setRequiredPermissions(permissions)
                }
            } catch (e) {
                enqueueSnackbar(`Error: ${e.message}`, { variant: 'success' })
            }
        })
    }

    const confirmPermissions = useSnackbarCallback(
        () =>
            browser.permissions
                .request({ origins: requiredPermissions! })
                .then((granted) =>
                    granted
                        ? Services.Welcome.restoreBackup(json!)
                        : Promise.reject(new Error('required permissions are not granted')),
                ),
        [json, requiredPermissions],
        props.onClose,
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<DatabaseIcon />}
                iconColor="#699CF7"
                primary="Restore Database"
                secondary={
                    requiredPermissions
                        ? 'We need permissions to do that.'
                        : 'Choose a backup file to restore your database.'
                }>
                <input type="file" accept="application/json" ref={ref} onChange={fileReceiver} hidden />
                {requiredPermissions ? (
                    <Button variant="contained" color="secondary" onClick={confirmPermissions}>
                        Confirm
                    </Button>
                ) : (
                    <Button variant="contained" color="primary" onClick={() => ref.current?.click()}>
                        Browse...
                    </Button>
                )}
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
