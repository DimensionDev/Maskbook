import { InjectedDialog, LoadingStatus } from '@masknet/shared'
import { memo, useCallback, useMemo, useRef } from 'react'
import { useDashboardI18N } from '../../locales/i18n_generated.js'
import { Box, DialogActions, DialogContent, Typography } from '@mui/material'
import { useBackupFormState, type BackupFormInputs } from '../../hooks/useBackupFormState.js'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { useAsyncFn } from 'react-use'
import Services from '#services'
import type { AccountType } from '../../type.js'
import { fetchUploadLink, uploadBackupValue } from '../../utils/api.js'
import { encryptBackup } from '@masknet/backup-format'
import { encode } from '@msgpack/msgpack'
import { Controller } from 'react-hook-form'
import { PersonasBackupPreview, WalletsBackupPreview } from '../../components/BackupPreview/index.js'
import PasswordField from '../../components/PasswordField/index.js'
import { useNavigate } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import formatDateTime from 'date-fns/format'
import { UserContext } from '../../../shared-ui/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 276,
    },
    icon: {
        '@keyframes spinner': {
            to: {
                transform: 'rotate(360deg)',
            },
        },
        position: 'relative',
        width: 40,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '&:before': {
            content: "''",
            boxSizing: 'border-box',
            position: 'absolute',
            top: -11,
            left: -15,
            width: 68,
            height: 68,
            borderRadius: '50%',
            border: `2px solid ${theme.palette.maskColor.main}`,
            borderTopColor: theme.palette.maskColor.second,
            animation: 'spinner 2s linear infinite',
        },
    },
}))

interface BackupPreviewDialogProps {
    open: boolean
    onClose: () => void
    isOverwrite: boolean
    code: string
    type: AccountType
    account: string
    abstract?: string
}
export const BackupPreviewDialog = memo<BackupPreviewDialogProps>(function BackupPreviewDialog({
    open,
    onClose,
    isOverwrite,
    code,
    type,
    account,
    abstract,
}) {
    const controllerRef = useRef<AbortController | null>(null)
    const { classes, theme } = useStyles()
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const { updateUser } = UserContext.useContainer()
    const {
        hasPassword,
        previewInfo,
        loading,
        backupPersonas,
        backupWallets,
        setBackupPersonas,
        setBackupWallets,
        formState: {
            clearErrors,
            setError,
            control,
            handleSubmit,
            formState: { errors, isDirty, isValid },
        },
    } = useBackupFormState()
    const { showSnackbar } = useCustomSnackbar()

    const [{ loading: uploadLoading, value }, handleUploadBackup] = useAsyncFn(
        async (data: BackupFormInputs) => {
            try {
                if (backupWallets && hasPassword) {
                    const verified = await Services.Wallet.verifyPassword(data.paymentPassword || '')
                    if (!verified) {
                        setError('paymentPassword', { type: 'custom', message: t.incorrect_password() })
                        return
                    }
                }

                const { file } = await Services.Backup.createBackupFile({
                    excludeBase: !backupPersonas,
                    excludeWallet: !backupWallets,
                })

                const name = `mask-network-keystore-backup-${formatDateTime(new Date(), 'yyyy-MM-dd')}`
                const uploadUrl = await fetchUploadLink({
                    code,
                    account,
                    type,
                    abstract: name,
                })
                const encrypted = await encryptBackup(encode(account + data.backupPassword), encode(file))
                const controller = new AbortController()
                controllerRef.current = controller
                const response = await uploadBackupValue(uploadUrl, encrypted, controller.signal)

                if (response.ok) {
                    const now = formatDateTime(new Date(), 'yyyy-MM-dd HH:mm')
                    showSnackbar(t.settings_alert_backup_success(), { variant: 'success' })
                    updateUser({ cloudBackupAt: now, cloudBackupMethod: type })
                }
                return true
            } catch (error) {
                showSnackbar(t.settings_alert_backup_fail(), { variant: 'error' })
                onClose()
                if ((error as any).status === 400) navigate(DashboardRoutes.CloudBackup, { replace: true })
                return false
            }
        },
        [code, hasPassword, backupWallets, abstract, backupPersonas, code, account, type, t, navigate, updateUser],
    )

    const handleClose = useCallback(() => {
        // Cancel upload fetch when user close the modal
        if (uploadLoading && controllerRef.current) controllerRef.current.abort()
        onClose()
    }, [uploadLoading, onClose])

    const content = useMemo(() => {
        if (value)
            return (
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
                        {t.cloud_backup_successfully_tips()}
                    </Typography>
                </Box>
            )
        if (uploadLoading)
            return (
                <Box className={classes.container}>
                    <Icons.FileService className={classes.icon} />
                    <Typography sx={{ mt: 2, fontWeight: 700, fontSize: 16, lineHeight: '20px' }}>
                        {t.uploading()}
                    </Typography>
                </Box>
            )
        return !loading && previewInfo ? (
            <Box display="flex" flexDirection="column">
                <PersonasBackupPreview
                    info={previewInfo}
                    selectable
                    selected={backupPersonas}
                    onChange={setBackupPersonas}
                />

                {backupPersonas ? (
                    <Controller
                        control={control}
                        render={({ field }) => (
                            <PasswordField
                                {...field}
                                onFocus={() => clearErrors()}
                                sx={{ mb: 2 }}
                                placeholder={t.settings_label_backup_password()}
                                error={!!errors.backupPassword?.message}
                                helperText={errors.backupPassword?.message}
                            />
                        )}
                        name="backupPassword"
                    />
                ) : null}

                <WalletsBackupPreview
                    wallets={previewInfo.wallets}
                    selectable
                    selected={backupWallets}
                    onChange={setBackupWallets}
                />

                {backupWallets && hasPassword ? (
                    <Controller
                        control={control}
                        render={({ field }) => (
                            <PasswordField
                                {...field}
                                onFocus={() => clearErrors()}
                                sx={{ mb: 2 }}
                                placeholder={t.sign_in_account_local_backup_payment_password()}
                                error={!!errors.paymentPassword?.message}
                                helperText={errors.paymentPassword?.message}
                            />
                        )}
                        name="paymentPassword"
                    />
                ) : null}
                {isOverwrite ? (
                    <Typography color={theme.palette.maskColor.danger} fontSize={14} lineHeight="18px">
                        {t.cloud_backup_overwrite_tips()}
                    </Typography>
                ) : null}
            </Box>
        ) : (
            <LoadingStatus minHeight={320} />
        )
    }, [
        loading,
        previewInfo,
        control,
        backupPersonas,
        setBackupPersonas,
        t,
        JSON.stringify(errors),
        backupWallets,
        setBackupWallets,
        isOverwrite,
        theme,
        value,
        uploadLoading,
        classes,
    ])

    const action = useMemo(() => {
        if (value)
            return (
                <ActionButton fullWidth color="success" onClick={onClose}>
                    {t.done()}
                </ActionButton>
            )
        if (uploadLoading)
            return (
                <ActionButton fullWidth color="error" onClick={handleClose}>
                    {t.cancel()}
                </ActionButton>
            )
        return (
            <ActionButton
                fullWidth
                onClick={handleSubmit(handleUploadBackup)}
                startIcon={isOverwrite ? <Icons.CloudBackup2 size={18} /> : <Icons.Cloud />}
                color={isOverwrite ? 'error' : 'primary'}
                disabled={!isDirty || !isValid}>
                {isOverwrite ? t.cloud_backup_overwrite_backup() : t.cloud_backup_upload_to_cloud()}
            </ActionButton>
        )
    }, [
        isOverwrite,
        isDirty,
        isValid,
        hasPassword,
        backupWallets,
        value,
        uploadLoading,
        t,
        handleClose,
        handleSubmit,
        handleUploadBackup,
        onClose,
    ])

    return (
        <InjectedDialog title={t.cloud_backup_upload_backup()} open={open} onClose={handleClose}>
            <DialogContent data-hide-scrollbar>{content}</DialogContent>
            <DialogActions>{action}</DialogActions>
        </InjectedDialog>
    )
})
