import Services from '#services'
import { Trans, useLingui } from '@lingui/react/macro'
import { decryptBackup } from '@masknet/backup-format'
import { Icons } from '@masknet/icons'
import { formatFileSize, InjectedDialog } from '@masknet/shared'
import type { BackupAccountType } from '@masknet/shared-base'
import { DashboardRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { decode, encode } from '@msgpack/msgpack'
import { Box, DialogActions, DialogContent, LinearProgress, Typography } from '@mui/material'
import { format as formatDateTime, fromUnixTime } from 'date-fns'
import { last } from 'lodash-es'
import { memo, useCallback, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsync, useAsyncFn } from 'react-use'
import PasswordField from '../../components/PasswordField/index.js'
import { passwordRegexp } from '../../utils/regexp.js'
import { BackupPreviewModal } from '../modals.js'

const useStyles = makeStyles()((theme) => ({
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
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 276,
    },
}))

interface MergeBackupDialogProps {
    open: boolean
    onClose: () => void
    downloadLink: string
    account: string
    uploadedAt: string
    size: string
    type?: BackupAccountType
    abstract?: string
    code: string
}

export const MergeBackupDialog = memo<MergeBackupDialogProps>(function MergeBackupDialog({
    open,
    onClose,
    downloadLink,
    account,
    uploadedAt,
    size,
    type,
    code,
    abstract,
}) {
    const { t } = useLingui()
    const { classes, theme } = useStyles()
    const [process, setProcess] = useState(0)
    const [backupPassword, setBackupPassword] = useState('')
    const [backupPasswordError, setBackupPasswordError] = useState<ReactNode>()
    const [showCongratulation, setShowCongratulation] = useState(false)
    const navigate = useNavigate()
    const { showSnackbar } = useCustomSnackbar()

    const handleClose = useCallback(() => {
        setBackupPassword('')
        setBackupPasswordError('')
        setShowCongratulation(false)
        onClose()
    }, [onClose])

    const { value: encrypted } = useAsync(async () => {
        if (!downloadLink || !open) return

        const response = await fetch(downloadLink, { method: 'GET', cache: 'no-store' })

        if (!response.ok || response.status !== 200) {
            showSnackbar(<Trans>The download link is expired</Trans>, { variant: 'error' })
            handleClose()
            navigate(DashboardRoutes.CloudBackup, { replace: true })
            return
        }
        const reader = response.body?.getReader()
        const contentLength = response.headers.get('Content-Length')

        if (!contentLength || !reader) return
        let received = 0
        const chunks: number[] = []
        while (true) {
            const { done, value } = await reader.read()

            if (done || !value) {
                setProcess(100)
                break
            }
            chunks.push(...value)
            received += value.length

            setProcess((received / Number(contentLength)) * 100)
        }
        return Uint8Array.from(chunks).buffer
    }, [downloadLink, handleClose, open])

    const fileName = useMemo(() => {
        try {
            if (!downloadLink) return ''
            const url = new URL(downloadLink)
            return last(url.pathname.split('/'))
        } catch {
            return ''
        }
    }, [downloadLink])

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
            showSnackbar(<Trans>Download backup</Trans>, {
                variant: 'success',
                message: <Trans>Backup downloaded and merged to local successfully.</Trans>,
            })
            setShowCongratulation(true)
        } catch {
            showSnackbar(<Trans>Failed to download and merge the backup.</Trans>)
        }
    }, [encrypted, backupPassword, account])

    const handleClickBackup = useCallback(async () => {
        if (!type) return
        BackupPreviewModal.open({
            isOverwrite: true,
            code,
            abstract,
            type,
            account,
        })
        handleClose()
    }, [code, abstract, type, account, handleClose])

    if (showCongratulation)
        return (
            <InjectedDialog title={<Trans>Merge data to local database</Trans>} open={open} onClose={handleClose}>
                <DialogContent>
                    <Box className={classes.container}>
                        <Typography fontSize={36}>🎉</Typography>
                        <Typography fontSize={24} fontWeight={700} lineHeight="120%" sx={{ my: 1.5 }}>
                            <Trans>Congratulations</Trans>
                        </Typography>
                        <Typography
                            fontSize={14}
                            fontWeight={700}
                            lineHeight="18px"
                            color={theme.palette.maskColor.second}
                            textAlign="center">
                            <Trans>
                                Data merged from Mask Cloud Service to local successfully. Re-enter your password to
                                encrypt and upload the new backup to Mask Cloud Service.
                            </Trans>
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <ActionButton fullWidth onClick={handleClickBackup}>
                        <Trans>Backup to Mask Cloud Service</Trans>
                    </ActionButton>
                </DialogActions>
            </InjectedDialog>
        )

    return (
        <InjectedDialog title={<Trans>Merge data to local database</Trans>} open={open} onClose={onClose}>
            <DialogContent>
                <Typography className={classes.account}>{account}</Typography>
                <Box className={classes.box}>
                    <Icons.Message size={24} />
                    <Box flex={1}>
                        <Typography className={classes.fileName}>{fileName}</Typography>
                        <LinearProgress variant="determinate" value={process} sx={{ my: 0.5 }} />
                        <Typography
                            color={theme.palette.maskColor.third}
                            fontSize={12}
                            fontWeight={700}
                            lineHeight="16px">
                            {process !== 100 ?
                                <Trans>Downloading</Trans>
                            :   <>
                                    <Typography component="span" fontSize={12} fontWeight={700} lineHeight="16px">
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
                    onClick={handleClickMerge}
                    loading={loading}
                    disabled={!!backupPasswordError || !backupPassword || !encrypted}>
                    <Trans>Merge to local</Trans>
                </ActionButton>
            </DialogActions>
        </InjectedDialog>
    )
})
