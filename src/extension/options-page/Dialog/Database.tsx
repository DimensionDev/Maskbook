import React from 'react'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback } from './Base'
import { Database as DatabaseIcon } from 'react-feather'
import { useI18N } from '../../../utils/i18n-next-ui'
import { BackupJSONFileLatest, UpgradeBackupJSONFile } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { decompressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'
import Services from '../../service'
import { extraPermissions } from '../../../utils/permissions'
import { useSnackbar } from 'notistack'
import { DebounceButton } from '../DashboardComponents/ActionButton'
import { useDrop } from 'react-use'
import { Button } from '@material-ui/core'

export function DashboardDatabaseBackupDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
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
                primary={t('backup_database')}
                secondary={t('dashboard_backup_database_hint')}
                footer={
                    <DebounceButton variant="contained" color="primary" onClick={onClick}>
                        {t('dashboard_backup_database_confirmation')}
                    </DebounceButton>
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardDatabaseRestoreDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const { enqueueSnackbar } = useSnackbar()

    const ref = React.useRef<HTMLInputElement>(null!)
    const [json, setJson] = React.useState<BackupJSONFileLatest | null>(null)
    const [requiredPermissions, setRequiredPermissions] = React.useState<string[] | null>(null)

    const fileReceiver = (e: React.ChangeEvent<HTMLInputElement>) =>
        new Promise((resolve) => {
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
                    enqueueSnackbar(`Error: ${e.message}`, { variant: 'error' })
                } finally {
                    resolve()
                }
            })
            fr.addEventListener('error', resolve)
        })

    useDrop({
        onFiles: (files) => fileReceiver({ currentTarget: { files } } as any),
    })

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
                primary={t('restore_database')}
                secondary={
                    requiredPermissions ? t('dashboard_permission_required') : t('dashboard_restore_database_hint')
                }
                content={<input type="file" accept="application/json" ref={ref} onChange={fileReceiver} hidden />}
                footer={
                    requiredPermissions ? (
                        <Button variant="contained" color="secondary" onClick={confirmPermissions}>
                            {t('confirm')}
                        </Button>
                    ) : (
                        <Button variant="contained" color="primary" onClick={() => ref.current?.click()}>
                            {t('browse')}
                        </Button>
                    )
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
