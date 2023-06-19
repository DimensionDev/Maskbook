import { memo, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { Box, Card } from '@mui/material'
import type { BackupPreview } from '@masknet/backup-format'
import { useDashboardI18N } from '../../locales/index.js'
import { Messages, Services } from '../../API.js'
import BackupPreviewCard from '../../pages/Settings/components/BackupPreviewCard.js'
import FileUpload from '../FileUpload/index.js'
import { ButtonContainer } from '../RegisterFrame/ButtonContainer.js'
import { useNavigate } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { LoadingCard } from './steps/LoadingCard.js'
import { decryptBackup } from '@masknet/backup-format'
import { decode, encode } from '@msgpack/msgpack'
import { PersonaContext } from '../../pages/Personas/hooks/usePersonaContext.js'
import { LoadingButton } from '../LoadingButton/index.js'
import PasswordField from '../PasswordField/index.js'
import { useCustomSnackbar } from '@masknet/theme'
import { delay } from '@masknet/kit'
import { UploadDropArea } from '@masknet/shared'
import { usePersonaRecovery } from '../../contexts/RecoveryContext.js'
import { PrimaryButton } from '../PrimaryButton/index.js'

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
const acceptFileTypes = Object.values(supportedFileType).join(',')

export const RestoreFromLocal = memo(() => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { showSnackbar } = useCustomSnackbar()
    const { currentPersona, changeCurrentPersona } = PersonaContext.useContainer()
    const { fillSubmitOutlet } = usePersonaRecovery()

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
            setBackupValue(await file.text())
        } else if ([supportedFileType.octetStream, supportedFileType.macBinary].includes(file.type)) {
            setRestoreStatus(RestoreStatus.Decrypting)
        } else {
            showSnackbar(t.sign_in_account_cloud_backup_not_support(), { variant: 'error' })
        }
    }, [])

    useAsync(async () => {
        if (!backupValue) return

        setRestoreStatus(RestoreStatus.Verifying)
        const backupInfo = await Services.Backup.addUnconfirmedBackup(backupValue)
        if (backupInfo.ok) {
            setJSON(backupInfo.val.info)
            setBackupId(backupInfo.val.id)
            setRestoreStatus(RestoreStatus.Verified)
        } else {
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
            if (lastedPersona) await changeCurrentPersona(lastedPersona)
        }
        await delay(1000)
        navigate(DashboardRoutes.Personas, { replace: true })
    }, [currentPersona, changeCurrentPersona, navigate])

    const restoreDB = useCallback(async () => {
        try {
            // If json has wallets, restore in popup.
            if (json?.wallets) {
                await Services.Backup.restoreUnconfirmedBackup({ id: backupId, action: 'wallet' })
                return
            } else {
                await Services.Backup.restoreUnconfirmedBackup({ id: backupId, action: 'confirm' })

                await restoreCallback()
            }
        } catch {
            showSnackbar(t.sign_in_account_cloud_backup_failed(), { variant: 'error' })
        }
    }, [backupId, json])

    useEffect(() => {
        return Messages.events.restoreSuccess.on(restoreCallback)
    }, [restoreCallback])

    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                size="large"
                color="primary"
                onClick={restoreStatus === RestoreStatus.Decrypting ? decryptBackupFile : restoreDB}
                disabled={restoreStatus === RestoreStatus.Verified ? !json : !file}>
                {restoreStatus !== RestoreStatus.Verified ? t.next() : t.restore()}
            </PrimaryButton>,
        )
    }, [restoreStatus, decryptBackupFile, restoreDB])

    return (
        <>
            <Box sx={{ width: '100%' }}>
                {restoreStatus === RestoreStatus.Verifying ? (
                    <LoadingCard text="Verifying" />
                ) : restoreStatus === RestoreStatus.WaitingInput ? (
                    <>
                        <Card variant="background" sx={{ height: '144px' }}>
                            <FileUpload onChange={handleSetFile} accept={acceptFileTypes} />
                        </Card>
                        <UploadDropArea onSelectFile={handleSetFile} />
                    </>
                ) : null}
                {restoreStatus === RestoreStatus.Verified && json ? <BackupPreviewCard info={json} /> : null}
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
        </>
    )
})
