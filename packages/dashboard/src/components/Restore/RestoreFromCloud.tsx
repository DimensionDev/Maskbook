import { memo, useEffect, useState } from 'react'
import { useDashboardI18N } from '../../locales'
import { Box, Button, Card, Stack } from '@material-ui/core'
import { MaskAlert } from '../MaskAlert'
import { CodeValidation } from './CodeValidation'
import { fetchBackupValue } from '../../pages/Settings/api'
import { Services } from '../../API'
import BackupPreviewCard from '../../pages/Settings/components/BackupPreviewCard'
import { ButtonGroup } from '../RegisterFrame/ButtonGroup'
import { useSnackbar } from '@masknet/theme'
import { useAsyncFn } from 'react-use'

enum RestoreStatus {
    validation,
    preview,
    restore,
}

export const RestoreFromCloud = memo(() => {
    const t = useDashboardI18N()
    const { enqueueSnackbar } = useSnackbar()
    const [backupJson, setBackupJson] = useState<any | null>(null)
    const [restoreStatus, setRestoreStatus] = useState(RestoreStatus.validation)
    const [backupId, setBackupId] = useState('')
    const [error, setError] = useState('')

    const [{ loading: fetchingBackupValue, error: fetchBackupValueError }, fetchBackupValueFn] = useAsyncFn(
        async (downloadLink) => {
            return fetchBackupValue(downloadLink)
        },
        [],
    )

    const [{ loading: decryptingBackup, error: decryptError }, decryptBackupFn] = useAsyncFn(
        async (account: string, password: string, encryptedValue: string) => {
            return Services.Crypto.decryptBackup('password', 'account', encryptedValue)
        },
        [],
    )

    useEffect(() => {
        if (!fetchBackupValueError) return
        enqueueSnackbar('Download backup failed', { variant: 'error' })
    }, [fetchBackupValueError])

    useEffect(() => {
        if (!decryptError) return
        enqueueSnackbar('Decrypt failed, please check password', { variant: 'error' })
    }, [decryptError])

    const onValidated = async (downloadLink: string, account: string, password: string) => {
        try {
            const backupValue = await fetchBackupValueFn(downloadLink)
            const backupText = await decryptBackupFn(account, password, backupValue)
            console.log(backupText)
            const backupInfo = await Services.Welcome.parseBackupStr(backupText)

            if (backupInfo) {
                setBackupId(backupInfo.id)
                setBackupJson(backupInfo?.info)
                setRestoreStatus(RestoreStatus.preview)
            }
            //  todo: remove
            return ''
        } catch (e) {
            enqueueSnackbar('Backup failed', { variant: 'error' })
            return 'Password is wrong'
        }
    }

    const onRestore = async () => {
        await Services.Welcome.checkPermissionsAndRestore(backupId)
    }

    // todo: refactor multi step
    return (
        <>
            {restoreStatus === RestoreStatus.validation && !decryptingBackup && !fetchingBackupValue && (
                <Box sx={{ width: '100%' }}>
                    <CodeValidation onValidated={onValidated} />
                </Box>
            )}
            {restoreStatus === RestoreStatus.preview && !decryptingBackup && !fetchingBackupValue && (
                <>
                    <Box>
                        <BackupPreviewCard json={backupJson} />
                    </Box>
                    <ButtonGroup>
                        <Button variant="rounded" color="secondary" onClick={() => {}}>
                            {t.cancel()}
                        </Button>
                        <Button variant="rounded" color="primary" onClick={onRestore}>
                            {t.register_restore_backups_confirm()}
                        </Button>
                    </ButtonGroup>
                </>
            )}
            {decryptingBackup && (
                <Card variant="background">
                    <Stack justifyContent="center" alignItems="center" sx={{ minHeight: 140 }}>
                        Decrypting
                    </Stack>
                </Card>
            )}
            {fetchingBackupValue && (
                <Card variant="background">
                    <Stack justifyContent="center" alignItems="center" sx={{ minHeight: 140 }}>
                        Downloading
                    </Stack>
                </Card>
            )}
            <Box sx={{ marginTop: '35px', width: '100%' }}>
                <MaskAlert description={t.sign_in_account_cloud_backup_warning()} />
            </Box>
        </>
    )
})
