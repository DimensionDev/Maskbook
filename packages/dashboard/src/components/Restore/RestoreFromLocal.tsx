import { memo, useCallback, useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { Box, Card } from '@mui/material'
import type { BackupPreview } from '@masknet/public-api'
import { useDashboardI18N } from '../../locales'
import { Messages, Services } from '../../API'
import BackupPreviewCard from '../../pages/Settings/components/BackupPreviewCard'
import { MaskAlert } from '../MaskAlert'
import FileUpload from '../FileUpload'
import { ButtonContainer } from '../RegisterFrame/ButtonContainer'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../type'
import { blobToText } from '@dimensiondev/kit'
import { LoadingCard } from './steps/LoadingCard'
import { decryptBackup } from '@masknet/backup-format'
import { decode, encode } from '@msgpack/msgpack'
import { PersonaContext } from '../../pages/Personas/hooks/usePersonaContext'
import { LoadingButton } from '../LoadingButton'
import PasswordField from '../PasswordField'
import { useCustomSnackbar } from '@masknet/theme'

enum RestoreStatus {
    WaitingInput = 0,
    Verifying = 1,
    Verified = 2,
    Decrypting = 3,
}

const supportedFileType = {
    json: 'application/json',
    octetStream: 'application/octet-stream',
    macBinary: 'application/macbinary',
}

export const RestoreFromLocal = memo(() => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { showSnackbar } = useCustomSnackbar()
    const { currentPersona, changeCurrentPersona } = PersonaContext.useContainer()

    const [file, setFile] = useState<File | null>(null)
    const [json, setJSON] = useState<BackupPreview | null>(null)
    const [backupValue, setBackupValue] = useState('')
    const [backupId, setBackupId] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [restoreStatus, setRestoreStatus] = useState(RestoreStatus.WaitingInput)

    const handleSetFile = useCallback(async (file: File) => {
        setFile(file)
        if (file.type === supportedFileType.json) {
            const content = await blobToText(file)
            setBackupValue(content)
        } else if ([supportedFileType.octetStream, supportedFileType.macBinary].includes(file.type)) {
            setRestoreStatus(RestoreStatus.Decrypting)
        } else {
            showSnackbar(t.sign_in_account_cloud_backup_not_support(), { variant: 'error' })
        }
    }, [])

    useAsync(async () => {
        if (!backupValue) return

        setRestoreStatus(RestoreStatus.Verifying)
        try {
            const backupInfo = await Services.Welcome.parseBackupStr(backupValue)

            if (backupInfo) {
                setJSON(backupInfo.info)
                setBackupId(backupInfo.id)
                setRestoreStatus(RestoreStatus.Verified)
            } else {
                setRestoreStatus(RestoreStatus.WaitingInput)
                setBackupValue('')
            }
        } catch {
            showSnackbar(t.sign_in_account_cloud_backup_not_support(), { variant: 'error' })
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

    const restoreCallback = useCallback(async () => {
        if (!currentPersona) {
            const lastedPersona = await Services.Identity.queryLastPersonaCreated()
            if (lastedPersona) {
                await changeCurrentPersona(lastedPersona.identifier)
            }
        }
        navigate(RoutePaths.Personas, { replace: true })
    }, [currentPersona, changeCurrentPersona])

    const restoreDB = useCallback(async () => {
        try {
            // If json has wallets, restore in popup.
            if (json?.wallets) {
                await Services.Welcome.checkPermissionAndOpenWalletRecovery(backupId)
                return
            } else {
                await Services.Welcome.checkPermissionsAndRestore(backupId)

                await restoreCallback()
            }
        } catch {
            showSnackbar(t.sign_in_account_cloud_backup_failed(), { variant: 'error' })
        }
    }, [backupId, json])

    useEffect(() => {
        return Messages.events.restoreSuccess.on(restoreCallback)
    }, [restoreCallback])

    return (
        <>
            <Box sx={{ width: '100%' }}>
                {restoreStatus === RestoreStatus.Verifying && <LoadingCard text="Verifying" />}
                {restoreStatus === RestoreStatus.WaitingInput && (
                    <Card variant="background" sx={{ height: '144px' }}>
                        <FileUpload onChange={handleSetFile} accept={Object.values(supportedFileType).join(',')} />
                    </Card>
                )}
                {restoreStatus === RestoreStatus.Verified && json && <BackupPreviewCard json={json} />}
                {restoreStatus === RestoreStatus.Decrypting && (
                    <Box sx={{ mt: 4 }}>
                        <PasswordField
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
                <LoadingButton
                    variant="rounded"
                    size="large"
                    color="primary"
                    onClick={restoreStatus === RestoreStatus.Decrypting ? decryptBackupFile : restoreDB}
                    disabled={restoreStatus === RestoreStatus.Verified ? !json : !file}>
                    {restoreStatus !== RestoreStatus.Verified ? t.next() : t.restore()}
                </LoadingButton>
            </ButtonContainer>
            <Box sx={{ pt: 4, pb: 2, width: '100%' }}>
                <MaskAlert description={t.sign_in_account_local_backup_warning()} />
            </Box>
        </>
    )
})
