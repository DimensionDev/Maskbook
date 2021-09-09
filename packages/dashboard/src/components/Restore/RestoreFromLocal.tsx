import { memo, useCallback, useState } from 'react'
import { useAsync } from 'react-use'
import { Box, Button, Card } from '@material-ui/core'
import { MaskTextField, useSnackbar } from '@masknet/theme'
import { useDashboardI18N } from '../../locales'
import { Services } from '../../API'
import BackupPreviewCard from '../../pages/Settings/components/BackupPreviewCard'
import { MaskAlert } from '../MaskAlert'
import FileUpload from '../FileUpload'
import { ButtonContainer } from '../RegisterFrame/ButtonContainer'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../type'
import { blobToText } from '@dimensiondev/kit'
import { LoadingCard } from './steps/LoadingCard'
import { decryptBackup } from '@masknet/backup-format'
import { decode, encode } from '@msgpack/msgpack'

enum RestoreStatus {
    WaitingInput = 0,
    Verifying = 1,
    Verified = 2,
    Decrypting = 3,
}

export const RestoreFromLocal = memo(() => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()

    const [file, setFile] = useState<File | null>(null)
    const [json, setJSON] = useState<any | null>(null)
    const [backupValue, setBackupValue] = useState('')
    const [backupId, setBackupId] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [restoreStatus, setRestoreStatus] = useState(RestoreStatus.WaitingInput)

    const handleSetFile = useCallback(async (file: File) => {
        setFile(file)
        if (file.type === 'application/json') {
            const content = await blobToText(file)
            setBackupValue(content)
        } else {
            setRestoreStatus(RestoreStatus.Decrypting)
        }
    }, [])

    useAsync(async () => {
        if (!backupValue) return

        setRestoreStatus(RestoreStatus.Verifying)
        const backupInfo = await Services.Welcome.parseBackupStr(backupValue)

        if (backupInfo) {
            setJSON(backupInfo.info)
            setBackupId(backupInfo.id)
            setRestoreStatus(RestoreStatus.Verified)
        } else {
            setRestoreStatus(RestoreStatus.WaitingInput)
            setBackupValue('')
        }
    }, [backupValue])

    const decryptBackupFile = useCallback(async () => {
        if (!file) return

        try {
            const decrypted = await decryptBackup(encode(password), await file.arrayBuffer())
            setBackupValue(JSON.stringify(decode(decrypted)))
        } catch (error_) {
            setError(t.sign_in_account_cloud_backup_decrypt_failed())
        }
    }, [file, password])

    const restoreDB = useCallback(async () => {
        try {
            await Services.Welcome.checkPermissionsAndRestore(backupId)
            navigate(RoutePaths.Personas, { replace: true })
        } catch {
            enqueueSnackbar('Restore backup failed, Please try again', { variant: 'error' })
        }
    }, [backupId])

    return (
        <>
            <Box sx={{ width: '100%' }}>
                {restoreStatus === RestoreStatus.Verifying && <LoadingCard text="Verifying" />}
                {restoreStatus === RestoreStatus.WaitingInput && (
                    <Card variant="background" sx={{ height: '144px' }}>
                        <FileUpload onChange={handleSetFile} accept="application/octet-stream, application/json" />
                    </Card>
                )}
                {restoreStatus === RestoreStatus.Verified && <BackupPreviewCard json={json} />}

                {restoreStatus === RestoreStatus.Decrypting && (
                    <Box sx={{ mt: 4 }}>
                        <MaskTextField
                            placeholder={t.sign_in_account_cloud_backup_password()}
                            type="password"
                            onChange={(e) => setPassword(e.currentTarget.value)}
                            error={!!error}
                            helperText={error}
                        />
                    </Box>
                )}
            </Box>
            <ButtonContainer>
                <Button
                    variant="rounded"
                    color="primary"
                    onClick={restoreStatus === RestoreStatus.Decrypting ? decryptBackupFile : restoreDB}
                    disabled={!file}>
                    {restoreStatus !== RestoreStatus.Verified ? t.next() : t.restore()}
                </Button>
            </ButtonContainer>
            <Box sx={{ marginTop: '35px', width: '100%' }}>
                <MaskAlert description={t.sign_in_account_local_backup_warning()} />
            </Box>
        </>
    )
})
