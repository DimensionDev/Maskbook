import Services from '#services'
import { Trans, useLingui } from '@lingui/react/macro'
import { decryptBackup } from '@masknet/backup-format'
import { Icons } from '@masknet/icons'
import { formatFileSize, InjectedDialog } from '@masknet/shared'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { decode, encode } from '@msgpack/msgpack'
import { Box, DialogActions, DialogContent, LinearProgress, Typography } from '@mui/material'
import { format as formatDateTime, fromUnixTime } from 'date-fns'
import { memo, useCallback, useState, type ReactNode } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import PasswordField from '../../components/PasswordField/index.js'
import { passwordRegexp } from '../../utils/regexp.js'

const useStyles = makeStyles()((theme) => ({
    dialog: {
        height: 620,
        width: 600,
    },
    account: {
        padding: theme.spacing(0.5, 2),
        fontSize: 14,
        fontWeight: 700,
    },
    box: {
        background: theme.palette.maskColor.bottom,
        borderRadius: 8,
        boxShadow: theme.palette.maskColor.bottomBg,
        backdropFilter: 'blur(8px)',
        padding: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(1.5, 0),
        columnGap: 8,
    },
    fileName: {
        fontSize: 14,
        lineHeight: '18px',
    },
}))

export interface MergeBackupDialogProps {
    account: string
    /**
     * A generator that yield progress of download,
     * and return the content of the downloaded file at the end
     */
    download: () => AsyncGenerator<number, ArrayBuffer | undefined>
    fileName: string
    onClose: () => void
    open: boolean
    size: string
    /** unix time */
    uploadedAt: string | number
}

export const MergeBackupDialog = memo<MergeBackupDialogProps>(function MergeBackupDialog({
    open,
    onClose,
    fileName,
    download,
    account,
    uploadedAt,
    size,
}) {
    const { t } = useLingui()
    const { classes, theme } = useStyles()
    const [progress, setProgress] = useState(0)
    const [backupPassword, setBackupPassword] = useState('')
    const [backupPasswordError, setBackupPasswordError] = useState<ReactNode>()
    const { showSnackbar } = useCustomSnackbar()

    const handleClose = useCallback(() => {
        setBackupPassword('')
        setBackupPasswordError('')
        onClose()
    }, [onClose])

    const { value: encrypted } = useAsync(async () => {
        if (!open) return
        const generator = download()
        try {
            let step: IteratorResult<number, ArrayBuffer | undefined>
            while (!(step = await generator.next()).done) {
                setProgress(step.value)
            }
            return step.value
        } catch (err) {
            showSnackbar((err as Error).message, { variant: 'error' })
            handleClose()
            throw err
        }
    }, [handleClose, open, download])

    const [{ loading }, handleClickMerge] = useAsyncFn(async () => {
        try {
            if (!encrypted) return
            const decrypted = await decryptBackup(encode(account + backupPassword), encrypted)
            const backupText = JSON.stringify(decode(decrypted))
            const summary = await Services.Backup.generateBackupSummary(backupText)
            if (summary.isErr()) {
                setBackupPasswordError(<Trans>Incorrect cloud backup password, please try again.</Trans>)
                return
            }
            const backupSummary = summary.unwrapOr(undefined)
            if (!backupSummary) return
            if (backupSummary.countOfWallets) {
                const hasPassword = await Services.Wallet.hasPassword()
                if (!hasPassword) await Services.Wallet.setDefaultPassword()
            }
            await Services.Backup.restoreBackup(backupText)
            showSnackbar(<Trans>Merge Completed</Trans>, {
                variant: 'success',
                message: <Trans>Your file has been successfully merged into the browser data.</Trans>,
            })
        } catch (err) {
            showSnackbar(<Trans>Failed to download and merge the backup: {(err as Error).message}</Trans>)
        }
    }, [encrypted, backupPassword, account])

    return (
        <InjectedDialog
            classes={{ paper: classes.dialog }}
            title={<Trans>Merge data to local database</Trans>}
            open={open}
            onClose={onClose}>
            <DialogContent>
                <Typography className={classes.account}>{account}</Typography>
                <Box className={classes.box}>
                    <Icons.Message size={24} />
                    <Box flex={1}>
                        <Typography className={classes.fileName}>{fileName}</Typography>
                        <LinearProgress variant="determinate" value={progress} sx={{ my: 0.5 }} />
                        <Typography
                            color={theme.palette.maskColor.third}
                            display="flex"
                            gap={0.5}
                            fontSize={12}
                            fontWeight={700}
                            lineHeight="16px">
                            {progress !== 100 ?
                                <Trans>Downloading</Trans>
                            :   <>
                                    <Typography
                                        component="span"
                                        fontSize={12}
                                        fontWeight={700}
                                        lineHeight="16px"
                                        color={theme.palette.maskColor.main}>
                                        {formatFileSize(Number(size))}
                                    </Typography>
                                    <Typography
                                        component="span"
                                        fontSize={12}
                                        lineHeight="16px"
                                        color={theme.palette.maskColor.third}>
                                        {formatDateTime(fromUnixTime(Number(uploadedAt)), 'yyyy-MM-dd HH:mm')}
                                    </Typography>
                                </>
                            }
                        </Typography>
                    </Box>
                    <Icons.BaseClose size={24} />
                </Box>
                <PasswordField
                    fullWidth
                    value={backupPassword}
                    placeholder={t`Backup Password`}
                    onChange={(e) => {
                        setBackupPassword(e.target.value)
                        setBackupPasswordError('')
                    }}
                    onBlur={(e) => {
                        if (!passwordRegexp.test(e.target.value)) {
                            setBackupPasswordError(<Trans>Incorrect cloud backup password, please try again.</Trans>)
                        }
                    }}
                    error={!!backupPasswordError}
                    helperText={
                        backupPasswordError ? backupPasswordError : (
                            <Trans>Please enter cloud backup password to download file.</Trans>
                        )
                    }
                />
            </DialogContent>
            <DialogActions>
                <ActionButton
                    fullWidth
                    startIcon={<Icons.Cloud size={18} />}
                    onClick={handleClickMerge}
                    loading={loading}
                    disabled={!!backupPasswordError || !backupPassword || !encrypted}>
                    <Trans>Merge to Browser</Trans>
                </ActionButton>
            </DialogActions>
        </InjectedDialog>
    )
})
