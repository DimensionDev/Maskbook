import { memo, useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { useAsync } from 'react-use'
import { Box, Button, Typography } from '@mui/material'
import { type BackupSummary, decryptBackup } from '@masknet/backup-format'
import { Icons } from '@masknet/icons'
import { delay } from '@masknet/kit'
import { FileFrame, UploadDropArea } from '@masknet/shared'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { decode, encode } from '@msgpack/msgpack'
import Services from '#services'
import { usePersonaRecovery } from '../../contexts/RecoveryContext.js'
import { useDashboardTrans } from '../../locales/index.js'
import PasswordField from '../PasswordField/index.js'
import { PrimaryButton } from '../PrimaryButton/index.js'
import { AccountStatusBar } from './AccountStatusBar.js'
import { BackupPreview } from '../BackupPreview/index.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

enum RestoreStatus {
    WaitingInput = 0,
    Verified = 1,
    Decrypting = 2,
}

const supportedFileType = {
    json: 'application/json',
    octetStream: 'application/octet-stream',
    // cspell:disable-next-line
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
    const { _ } = useLingui()
    const { classes, theme } = useStyles()
    const t = useDashboardTrans()
    const { showSnackbar } = useCustomSnackbar()
    const { fillSubmitOutlet } = usePersonaRecovery()

    const [file, setFile] = useState<File | null>(null)
    const [summary, setSummary] = useState<BackupSummary | null>(null)
    const [backupValue, setBackupValue] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<ReactNode>()
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
            showSnackbar(<Trans>Unsupported data backup</Trans>, { variant: 'error' })
        }
    }, [])

    const { loading: getSummaryLoading } = useAsync(async () => {
        if (!backupValue) return

        const summary = await Services.Backup.generateBackupSummary(backupValue)
        if (summary.isOk()) {
            setSummary(summary.value)
            setRestoreStatus(RestoreStatus.Verified)
        } else {
            showSnackbar(<Trans>Unsupported data backup</Trans>, { variant: 'error' })
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
            setError(<Trans>Incorrect Backup Password.</Trans>)
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
                const hasPassword = await Services.Wallet.hasPassword()
                if (!hasPassword) await Services.Wallet.setDefaultPassword()
            }
            await Services.Backup.restoreBackup(backupValue)

            await onRestore(summary?.countOfWallets)
        } catch {
            showSnackbar(<Trans>Restore backup failed.</Trans>, { variant: 'error' })
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
                {restoreStatus !== RestoreStatus.Verified ?
                    <Trans>Continue</Trans>
                :   <Trans>Restore</Trans>}
            </PrimaryButton>,
        )
    }, [restoreStatus, decryptBackupFile, restoreDB, disabled, loading])

    return (
        <Box width="100%">
            {restoreStatus !== RestoreStatus.Verified ?
                <UploadDropArea onSelectFile={handleSetFile} omitSizeLimit accept=".bin,.json" />
            :   null}
            {file && restoreStatus !== RestoreStatus.Verified ?
                <FileFrame
                    className={classes.uploadedFile}
                    fileName={file.name}
                    operations={
                        <Button variant="text" disableRipple sx={{ p: 1, minWidth: 'auto' }} onClick={reset}>
                            <Icons.Clear size={24} color={theme.palette.maskColor.main} />
                        </Button>
                    }>
                    <Typography className={classes.desc}>
                        {readingFile ?
                            <Trans>Unpacking</Trans>
                        :   <Trans>Completed</Trans>}
                    </Typography>
                </FileFrame>
            :   null}
            {restoreStatus === RestoreStatus.Decrypting ?
                <Box mt={4}>
                    <PasswordField
                        fullWidth
                        placeholder={_(msg`Backup password`)}
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!error}
                        helperText={error}
                        autoFocus
                    />
                </Box>
            : restoreStatus === RestoreStatus.Verified && summary ?
                <>
                    <AccountStatusBar label={file?.name} actionLabel={<Trans>Reselect</Trans>} onAction={reset} />
                    <BackupPreview mt={2} info={summary} />
                </>
            :   null}
        </Box>
    )
})
