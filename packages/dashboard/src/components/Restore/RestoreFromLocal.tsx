import { type BackupSummary, decryptBackup } from '@masknet/backup-format'
import { Icons } from '@masknet/icons'
import { delay } from '@masknet/kit'
import { FileFrame, UploadDropArea } from '@masknet/shared'
import { DashboardRoutes } from '@masknet/shared-base'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { decode, encode } from '@msgpack/msgpack'
import { Box, Button, Typography } from '@mui/material'
import { memo, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsync } from 'react-use'
import { Messages, Services } from '../../API.js'
import { usePersonaRecovery } from '../../contexts/RecoveryContext.js'
import { useDashboardI18N } from '../../locales/index.js'
import { PersonaContext } from '../../pages/Personas/hooks/usePersonaContext.js'
import { BackupPreview } from '../../pages/Settings/components/BackupPreview.js'
import PasswordField from '../PasswordField/index.js'
import { PrimaryButton } from '../PrimaryButton/index.js'

enum RestoreStatus {
    WaitingInput = 0,
    Verified = 2,
    Decrypting = 3,
}

const supportedFileType = {
    json: 'application/json',
    octetStream: 'application/octet-stream',
    macBinary: 'application/macbinary',
}

const useStyles = makeStyles()((theme) => ({
    uploadedFile: {
        marginTop: theme.spacing(1.5),
    },
    desc: {
        color: theme.palette.maskColor.second,
        fontWeight: 700,
        fontSize: 12,
        marginTop: 7,
    },
}))
export const RestoreFromLocal = memo(function RestoreFromLocal() {
    const { classes, theme } = useStyles()
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { showSnackbar } = useCustomSnackbar()
    const { currentPersona, changeCurrentPersona } = PersonaContext.useContainer()
    const { fillSubmitOutlet } = usePersonaRecovery()

    const [file, setFile] = useState<File | null>(null)
    const [summary, setSummary] = useState<BackupSummary | null>(null)
    const [backupValue, setBackupValue] = useState('')
    const [backupId, setBackupId] = useState('')
    const [password, setPassword] = useState('123543Aa!')
    const [error, setError] = useState('')
    const [restoreStatus, setRestoreStatus] = useState(RestoreStatus.WaitingInput)
    const [readingFile, setReadingFile] = useState(false)

    const handleSetFile = useCallback(async (file: File) => {
        setFile(file)
        if (file.type === supportedFileType.json) {
            setReadingFile(true)
            const [value] = await Promise.all([file.text(), delay(3000)])
            setBackupValue(value)
            setReadingFile(false)
        } else if ([supportedFileType.octetStream, supportedFileType.macBinary].includes(file.type)) {
            setRestoreStatus(RestoreStatus.Decrypting)
        } else {
            showSnackbar(t.sign_in_account_cloud_backup_not_support(), { variant: 'error' })
        }
    }, [])
    const reset = useCallback(() => {
        setFile(null)
        setBackupValue('')
        setSummary(null)
        setRestoreStatus(RestoreStatus.WaitingInput)
    }, [])

    useAsync(async () => {
        if (!backupValue) return

        const backupInfo = await Services.Backup.addUnconfirmedBackup(backupValue)
        if (backupInfo.ok) {
            setSummary(backupInfo.val.info)
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
            setReadingFile(true)
            const [decrypted] = await Promise.all([
                file.arrayBuffer().then((buffer) => decryptBackup(encode(password), buffer)),
                delay(3000),
            ])
            const decoded = decode(decrypted)
            setBackupValue(JSON.stringify(decoded))
        } catch (error_) {
            setError(t.sign_in_account_cloud_backup_decrypt_failed())
        } finally {
            setReadingFile(false)
        }
    }, [file, password])

    const restoreCallback = useCallback(async () => {
        if (!currentPersona) {
            const lastedPersona = await Services.Identity.queryLastPersonaCreated()
            if (lastedPersona) await changeCurrentPersona(lastedPersona)
        }
        await delay(1000)
        navigate(DashboardRoutes.SignUpPersonaOnboarding, { replace: true })
    }, [!currentPersona, changeCurrentPersona, navigate])

    const restoreDB = useCallback(async () => {
        try {
            // If json has wallets, restore in popup.
            if (summary?.wallets.length) {
                await Services.Backup.restoreUnconfirmedBackup({ id: backupId, action: 'wallet' })
                return
            } else {
                await Services.Backup.restoreUnconfirmedBackup({ id: backupId, action: 'confirm' })
                await restoreCallback()
            }
        } catch {
            showSnackbar(t.sign_in_account_cloud_backup_failed(), { variant: 'error' })
        }
    }, [backupId, summary?.wallets])

    useEffect(() => {
        return Messages.events.restoreSuccess.on(restoreCallback)
    }, [restoreCallback])

    const disabled = readingFile || restoreStatus === RestoreStatus.Verified ? !summary : !file
    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                size="large"
                color="primary"
                onClick={restoreStatus === RestoreStatus.Decrypting ? decryptBackupFile : restoreDB}
                disabled={disabled}>
                {restoreStatus !== RestoreStatus.Verified ? t.next() : t.restore()}
            </PrimaryButton>,
        )
    }, [restoreStatus, decryptBackupFile, restoreDB, disabled])

    return (
        <Box width="100%">
            {restoreStatus !== RestoreStatus.Verified ? (
                <UploadDropArea onSelectFile={handleSetFile} omitSizeLimit />
            ) : null}
            {file && restoreStatus !== RestoreStatus.Verified ? (
                <FileFrame
                    className={classes.uploadedFile}
                    fileName={file.name}
                    operations={
                        <Button variant="text" disableRipple sx={{ p: 1, minWidth: 'auto' }} onClick={reset}>
                            <Icons.Clear size={24} color={theme.palette.maskColor.main} />
                        </Button>
                    }>
                    <Typography className={classes.desc}>{readingFile ? 'Unpacking' : 'Completed'}</Typography>
                </FileFrame>
            ) : null}
            {restoreStatus === RestoreStatus.Decrypting ? (
                <Box mt={4}>
                    <PasswordField
                        placeholder={t.sign_in_account_cloud_backup_password()}
                        type="password"
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        error={!!error}
                        helperText={error}
                    />
                </Box>
            ) : restoreStatus === RestoreStatus.Verified ? (
                summary ? (
                    <>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography>{file?.name}</Typography>
                            <Button variant="text" onClick={reset}>
                                Reselect
                            </Button>
                        </Box>
                        <BackupPreview mt={2} info={summary} />
                    </>
                ) : null
            ) : null}
        </Box>
    )
})
