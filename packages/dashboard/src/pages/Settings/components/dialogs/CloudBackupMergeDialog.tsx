import { useEffect, useState } from 'react'
import { MaskDialog, useSnackbar } from '@masknet/theme'
import { Box, Typography } from '@material-ui/core'
import LoadingButton from '@material-ui/lab/LoadingButton'
import { BackupInfoCard } from '../../../../components/Restore/BackupInfoCard'
import type { BackupFileInfo } from '../../type'
import { useDashboardI18N } from '../../../../locales'
import { Services } from '../../../../API'
import { fetchBackupValue } from '../../api'
import { useAsyncFn } from 'react-use'
import { decryptBackup } from '@masknet/backup-format'
import { decode, encode } from '@msgpack/msgpack'
import PasswordField from '../../../../components/PasswordField'

export interface CloudBackupMergeDialogProps {
    account: string
    info: BackupFileInfo
    open: boolean
    onClose(): void
    onMerged(): void
}

export function CloudBackupMergeDialog({ account, info, open, onClose, onMerged }: CloudBackupMergeDialogProps) {
    const [backupPassword, setBackupPassword] = useState('')
    const [incorrectBackupPassword, setIncorrectBackupPassword] = useState(false)
    const t = useDashboardI18N()
    const snackbar = useSnackbar()

    const [{ loading }, handleMerge] = useAsyncFn(async () => {
        try {
            const encrypted = await fetchBackupValue(info.downloadURL)
            const decrypted = await decryptBackup(encode(account + backupPassword), encrypted)
            const backupText = JSON.stringify(decode(decrypted))
            const data = await Services.Welcome.parseBackupStr(backupText)

            if (data?.id) {
                await Services.Welcome.checkPermissionsAndRestore(data.id)
            }

            onMerged()
            snackbar.enqueueSnackbar(t.settings_alert_merge_success(), { variant: 'success' })
        } catch (error) {
            setIncorrectBackupPassword(true)
        }
    }, [backupPassword, account, info])

    useEffect(() => {
        setIncorrectBackupPassword(false)
    }, [backupPassword])

    return (
        <MaskDialog maxWidth="xs" title={t.settings_cloud_backup()} open={open} onClose={onClose}>
            <Box sx={{ padding: '0 24px 24px' }}>
                <BackupInfoCard info={info} />
                <Typography sx={{ fontSize: '13px', padding: '24px 0' }}>
                    {t.settings_dialogs_backup_action_desc()}
                </Typography>
                <PasswordField
                    fullWidth
                    value={backupPassword}
                    onChange={(event) => setBackupPassword(event.target.value)}
                    placeholder={t.settings_label_backup_password_cloud()}
                    sx={{ marginBottom: '24px' }}
                    error={incorrectBackupPassword}
                    helperText={incorrectBackupPassword ? t.settings_dialogs_incorrect_password() : ''}
                />

                <LoadingButton fullWidth onClick={handleMerge} loading={loading} disabled={incorrectBackupPassword}>
                    {t.settings_dialogs_merge_to_local_data()}
                </LoadingButton>
            </Box>
        </MaskDialog>
    )
}
