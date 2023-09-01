import { memo, useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { Box, Button, Typography } from '@mui/material'
import { type BackupSummary, decryptBackup } from '@masknet/backup-format'
import { Icons } from '@masknet/icons'
import { delay } from '@masknet/kit'
import { FileFrame, UploadDropArea } from '@masknet/shared'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { decode, encode } from '@msgpack/msgpack'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import Services from '#services'
import { usePersonaRecovery } from '../../contexts/RecoveryContext.js'
import { useDashboardI18N } from '../../locales/index.js'
import { BackupPreview } from '../../pages/Settings/components/BackupPreview.js'
import PasswordField from '../PasswordField/index.js'
import { PrimaryButton } from '../PrimaryButton/index.js'
import { AccountStatusBar } from './AccountStatusBar.js'

enum RestoreStatus {
    WaitingInput = 0,
    Verified = 1,
    Decrypting = 2,
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
interface RestoreFromLocalProps {
    onRestore: (count?: number) => Promise<void>
}

export const RestorePersonaFromLocal = memo(function RestorePersonaFromLocal({ onRestore }: RestoreFromLocalProps) {
    const { classes, theme } = useStyles()
    const t = useDashboardI18N()
    const { showSnackbar } = useCustomSnackbar()
    const { fillSubmitOutlet } = usePersonaRecovery()

    const [file, setFile] = useState<File | null>(null)
    const [summary, setSummary] = useState<BackupSummary | null>(null)
    const [backupValue, setBackupValue] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [restoreStatus, setRestoreStatus] = useState(RestoreStatus.WaitingInput)
    const [readingFile, setReadingFile] = useState(false)
    const [processing, setProcessing] = useState(false)

    const reset = useCallback(() => {
        setFile(null)
        setBackupValue('')
        setSummary(null)
        setPassword('')
        setRestoreStatus(RestoreStatus.WaitingInput)
    }, [])

    const handleSetFile = useCallback(async (file: File) => {
        setFile(file)
        if (file.type === supportedFileType.json) {
            setReadingFile(true)
            const [value] = await Promise.all([file.text(), delay(1000)])
            setBackupValue(value)
            setReadingFile(false)
        } else if ([supportedFileType.octetStream, supportedFileType.macBinary].includes(file.type)) {
            setRestoreStatus(RestoreStatus.Decrypting)
        } else {
            reset()
            showSnackbar(t.sign_in_account_cloud_backup_not_support(), { variant: 'error' })
        }
    }, [])

    const { loading: getSummaryLoading } = useAsync(async () => {
        if (!backupValue) return

        const summary = await Services.Backup.generateBackupSummary(backupValue)
        if (summary.isOk()) {
            setSummary(summary.value)
            setRestoreStatus(RestoreStatus.Verified)
        } else {
            showSnackbar(t.sign_in_account_cloud_backup_not_support(), { variant: 'error' })
            setRestoreStatus(RestoreStatus.WaitingInput)
            setBackupValue('')
        }
    }, [backupValue])

    const decryptBackupFile = useCallback(async () => {
        if (!file) return
        setProcessing(true)
        try {
            setReadingFile(true)
            const [decrypted] = await Promise.all([
                file.arrayBuffer().then((buffer) => decryptBackup(encode(password), buffer)),
                delay(1000),
            ])
            const decoded = decode(decrypted)
            setBackupValue(JSON.stringify(decoded))
        } catch (error_) {
            setError(t.incorrect_backup_password())
        } finally {
            setReadingFile(false)
            setProcessing(false)
        }
    }, [file, password, t])

    const restoreDB = useCallback(async () => {
        try {
            setProcessing(true)
            // If json has wallets, restore in popup.
            if (summary?.countOfWallets) {
                const hasPassword = await WalletServiceRef.value.hasPassword()
                if (!hasPassword) await WalletServiceRef.value.setDefaultPassword()
            }
            await Services.Backup.restoreBackup(backupValue)

            await onRestore(summary?.countOfWallets)
        } catch {
            showSnackbar(t.sign_in_account_cloud_backup_failed(), { variant: 'error' })
        } finally {
            setProcessing(false)
        }
    }, [backupValue, onRestore, summary])

    const loading = readingFile || processing || getSummaryLoading
    const disabled = useMemo(() => {
        if (loading) return true
        if (restoreStatus === RestoreStatus.Verified) return !summary
        if (restoreStatus === RestoreStatus.Decrypting) return !password
        return !file
    }, [loading, !file, restoreStatus, summary, !password])

    useLayoutEffect(() => {
        return fillSubmitOutlet(
            <PrimaryButton
                size="large"
                color="primary"
                onClick={restoreStatus === RestoreStatus.Decrypting ? decryptBackupFile : restoreDB}
                loading={loading}
                disabled={disabled}>
                {restoreStatus !== RestoreStatus.Verified ? t.continue() : t.restore()}
            </PrimaryButton>,
        )
    }, [restoreStatus, decryptBackupFile, restoreDB, disabled, loading])

    return (
        <Box width="100%">
            {restoreStatus !== RestoreStatus.Verified ? (
                <UploadDropArea onSelectFile={handleSetFile} omitSizeLimit accept=".bin,.json" />
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
                    <Typography className={classes.desc}>
                        {readingFile ? t.file_unpacking() : t.file_unpacking_completed()}
                    </Typography>
                </FileFrame>
            ) : null}
            {restoreStatus === RestoreStatus.Decrypting ? (
                <Box mt={4}>
                    <PasswordField
                        placeholder={t.sign_in_account_cloud_backup_password()}
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!error}
                        helperText={error}
                    />
                </Box>
            ) : restoreStatus === RestoreStatus.Verified && summary ? (
                <>
                    <AccountStatusBar label={file?.name} actionLabel={t.file_reselect()} onAction={reset} />
                    <BackupPreview mt={2} info={summary} />
                </>
            ) : null}
        </Box>
    )
})
