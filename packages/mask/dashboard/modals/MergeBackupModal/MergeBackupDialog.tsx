import { InjectedDialog } from '@masknet/shared'
import { memo, useCallback, useMemo, useState } from 'react'
import { useDashboardI18N } from '../../locales/i18n_generated.js'
import { Box, DialogActions, DialogContent, LinearProgress, Typography } from '@mui/material'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useAsync, useAsyncFn } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { last } from 'lodash-es'
import { formatFileSize } from '@masknet/kit'
import formatDateTime from 'date-fns/format'
import fromUnixTime from 'date-fns/fromUnixTime'
import PasswordField from '../../components/PasswordField/index.js'
import { setPassword } from '../../../background/services/wallet/services/index.js'
import { passwordRegexp } from '../../utils/regexp.js'
import { decryptBackup } from '@masknet/backup-format'
import { decode, encode } from '@msgpack/msgpack'
import Services from '#services'
import { BackupPreviewModal } from '../modals.js'
import type { AccountType } from '../../type.js'

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
        marginTop: theme.spacing(1.5),
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
    type?: AccountType
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
    const t = useDashboardI18N()
    const { classes, theme } = useStyles()
    const [process, setProcess] = useState(0)
    const [backupPassword, setBackupPassword] = useState('')
    const [backupPasswordError, setBackupPasswordError] = useState('')
    const [showCongratulation, setShowCongratulation] = useState(false)
    const navigate = useNavigate()
    const { showSnackbar } = useCustomSnackbar()

    const handleClose = useCallback(() => {
        setBackupPassword('')
        setBackupPasswordError('')
        setShowCongratulation(false)
        onClose()
    }, [onClose])

    const { value: encrytped } = useAsync(async () => {
        if (!downloadLink) return

        const response = await fetch(downloadLink, { method: 'GET' })
        if (!response.ok || response.status !== 200) {
            showSnackbar(t.cloud_backup_download_link_expired(), { variant: 'error' })
            handleClose()
            navigate(DashboardRoutes.CloudBackup, { replace: true })
            return
        }
        const reader = response.body?.getReader()
        const contentLength = response.headers.get('Content-Length')

        if (!contentLength || !reader) return
        let received = 0

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { done, value } = await reader.read()

            if (done || !value) {
                setProcess(100)
                break
            }

            received += value.length
            setProcess((received / Number(contentLength)) * 100)
        }

        return response.arrayBuffer()
    }, [downloadLink, handleClose])

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
            if (!encrytped) return
            const decrypted = await decryptBackup(encode(account + backupPassword), encrytped)
            const backupText = JSON.stringify(decode(decrypted))
            const summary = await Services.Backup.generateBackupSummary(backupText)
            if (summary.isErr()) {
                setBackupPasswordError(t.cloud_backup_incorrect_backup_password())
                return
            }
            const backupSummary = summary.unwrapOr(undefined)
            if (!backupSummary) return
            if (backupSummary.countOfWallets) {
                const hasPassword = await Services.Wallet.hasPassword()
                if (!hasPassword) await Services.Wallet.setDefaultPassword()
            }
            await Services.Backup.restoreBackup(backupText)
            showSnackbar(t.cloud_backup_download_backup(), {
                variant: 'success',
                message: t.cloud_backup_merge_to_local_successfully(),
            })
            setShowCongratulation(true)
        } catch {
            showSnackbar(t.cloud_backup_merge_to_local_failed())
        }
    }, [encrytped, backupPassword, account])

    const handleClickBackup = useCallback(async () => {
        if (!type) return
        BackupPreviewModal.open({
            isOverwrite: true,
            code,
            abstract,
            type,
            account,
        })
        onClose()
    }, [code, abstract, type, account])
    return (
        <InjectedDialog title={t.cloud_backup_merge_to_local_database()} open={open} onClose={onClose}>
            {showCongratulation ? (
                <>
                    <DialogContent>
                        <Box className={classes.container}>
                            <Typography fontSize={36}>🎉</Typography>
                            <Typography fontSize={24} fontWeight={700} lineHeight="120%" sx={{ my: 1.5 }}>
                                {t.congratulations()}
                            </Typography>
                            <Typography
                                fontSize={14}
                                fontWeight={700}
                                lineHeight="18px"
                                color={theme.palette.maskColor.second}
                                textAlign="center">
                                {t.cloud_backup_merge_to_local_congratulation_tips()}
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <ActionButton fullWidth onClick={handleClickBackup}>
                            {t.cloud_backup_backup_to_mask_cloud_service()}
                        </ActionButton>
                    </DialogActions>
                </>
            ) : (
                <>
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
                                    {process !== 100 ? (
                                        t.data_downloading()
                                    ) : (
                                        <>
                                            <Typography
                                                component="span"
                                                fontSize={12}
                                                fontWeight={700}
                                                lineHeight="16px">
                                                {formatFileSize(Number(size), false)}
                                            </Typography>
                                            <Typography
                                                component="span"
                                                fontSize={12}
                                                lineHeight="16px"
                                                color={theme.palette.maskColor.third}>
                                                {formatDateTime(fromUnixTime(Number(uploadedAt)), 'yyyy-MM-dd HH:mm')}
                                            </Typography>
                                        </>
                                    )}
                                </Typography>
                            </Box>
                            <Icons.BaseClose size={24} />
                        </Box>
                        <PasswordField
                            value={backupPassword}
                            placeholder={t.settings_label_backup_password()}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setBackupPasswordError('')
                            }}
                            onBlur={(e) => {
                                if (!passwordRegexp.test(e.target.value)) {
                                    setBackupPasswordError(t.cloud_backup_incorrect_backup_password())
                                }
                            }}
                            error={!!backupPasswordError}
                            helperText={
                                backupPasswordError
                                    ? backupPasswordError
                                    : t.cloud_backup_enter_backup_password_to_decryp_file()
                            }
                        />
                    </DialogContent>
                    <DialogActions>
                        <ActionButton
                            fullWidth
                            onClick={handleClickMerge}
                            loading={loading}
                            disabled={!!backupPasswordError || !backupPassword || !encrytped}>
                            {t.cloud_backup_merge_to_local()}
                        </ActionButton>
                    </DialogActions>
                </>
            )}
        </InjectedDialog>
    )
})
