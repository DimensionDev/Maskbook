import Services from '#services'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { encryptBackup } from '@masknet/backup-format'
import { Icons } from '@masknet/icons'
import { InjectedDialog, LoadingStatus } from '@masknet/shared'
import type { BackupAccountType } from '@masknet/shared-base'
import { DashboardRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { encode } from '@msgpack/msgpack'
import { Box, DialogActions, DialogContent, Typography } from '@mui/material'
import { memo, useCallback, useMemo, useRef } from 'react'
import { Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAsyncFn, useUpdateEffect } from 'react-use'
import { UserContext } from '../../../shared-ui/index.js'
import { PersonasBackupPreview, WalletsBackupPreview } from '../../components/BackupPreview/index.js'
import PasswordField from '../../components/PasswordField/index.js'
import { useBackupFormState, type BackupFormInputs } from '../../hooks/useBackupFormState.js'
import { useBackupPreviewInfo } from '../../hooks/useBackupPreviewInfo.js'

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

export interface BackupPreviewDialogProps {
    open: boolean
    isUpload?: boolean
    code: string
    type: BackupAccountType
    account: string
    abstract?: string
    title?: React.ReactNode | string
    uploadButtonLabel?: React.ReactNode | string
    onClose: () => void
    onUpload?: (content: ArrayBuffer, signal: AbortSignal) => Promise<void>
}
export const BackupPreviewDialog = memo<BackupPreviewDialogProps>(function BackupPreviewDialog({
    open,
    isUpload,
    code,
    type,
    account,
    abstract,
    title = <Trans>Upload backup</Trans>,
    uploadButtonLabel,
    onClose,
    onUpload,
}) {
    const { _ } = useLingui()
    const controllerRef = useRef<AbortController | null>(null)
    const { classes, theme } = useStyles()
    const navigate = useNavigate()
    const { updateUser } = UserContext.useContainer()
    const {
        hasPassword,
        backupWallets,
        setBackupWallets,
        formState: {
            clearErrors,
            setError,
            control,
            handleSubmit,
            resetField,
            formState: { errors, isDirty, isValid },
        },
    } = useBackupFormState()
    const { data: previewInfo, isLoading: loading } = useBackupPreviewInfo()
    const { showSnackbar } = useCustomSnackbar()

    const [{ loading: uploadLoading, value }, handleUploadBackup] = useAsyncFn(
        async (data: BackupFormInputs) => {
            try {
                if (backupWallets && hasPassword) {
                    const verified = await Services.Wallet.verifyPassword(data.paymentPassword || '')
                    if (!verified) {
                        setError('paymentPassword', { type: 'custom', message: _(msg`Incorrect Password`) })
                        return
                    }
                }

                const { file } = await Services.Backup.createBackupFile({
                    excludeBase: false,
                    excludeWallet: !backupWallets,
                })

                const encrypted = await encryptBackup(encode(account + data.backupPassword), encode(file))
                const controller = new AbortController()
                controllerRef.current = controller
                await onUpload?.(encrypted, controller.signal)
                showSnackbar(<Trans>Backup Successful</Trans>, {
                    variant: 'success',
                    message: <Trans>Data backed up successfully!</Trans>,
                })
                onClose()
            } catch (error) {
                showSnackbar(<Trans>Backup Failed</Trans>, { variant: 'error' })
                onClose()
                if ((error as any).status === 400) navigate(DashboardRoutes.BackupCloud, { replace: true })
            }
        },
        [code, hasPassword, backupWallets, abstract, code, account, type, _, navigate, updateUser],
    )

    const handleClose = useCallback(() => {
        // Cancel upload fetch when user close the modal
        if (uploadLoading && controllerRef.current) controllerRef.current.abort()
        onClose()
    }, [uploadLoading, onClose])

    useUpdateEffect(() => {
        resetField('paymentPassword')
    }, [backupWallets, resetField])

    const content = useMemo(() => {
        if (uploadLoading)
            return (
                <Box className={classes.container}>
                    <Icons.FileService className={classes.icon} />
                    <Typography sx={{ mt: 2, fontWeight: 700, fontSize: 16, lineHeight: '20px' }}>
                        <Trans>Uploading</Trans>
                    </Typography>
                </Box>
            )
        return !loading && previewInfo ?
                <Box display="flex" flexDirection="column">
                    <PersonasBackupPreview info={previewInfo} />

                    <Controller
                        control={control}
                        render={({ field }) => (
                            <PasswordField
                                {...field}
                                onFocus={() => clearErrors('backupPassword')}
                                sx={{ mb: 2 }}
                                placeholder={_(msg`Backup Password`)}
                                error={!!errors.backupPassword?.message}
                                helperText={errors.backupPassword?.message}
                            />
                        )}
                        name="backupPassword"
                    />

                    <WalletsBackupPreview
                        wallets={previewInfo.wallets}
                        selectable
                        selected={backupWallets}
                        onChange={setBackupWallets}
                    />

                    {backupWallets && hasPassword ?
                        <Controller
                            control={control}
                            render={({ field }) => (
                                <PasswordField
                                    {...field}
                                    onFocus={() => clearErrors('paymentPassword')}
                                    sx={{ mb: 2 }}
                                    placeholder={_(msg`Payment Password`)}
                                    error={!!errors.paymentPassword?.message}
                                    helperText={errors.paymentPassword?.message}
                                />
                            )}
                            name="paymentPassword"
                        />
                    :   null}
                    {isUpload ?
                        <Typography color={theme.palette.maskColor.danger} fontSize={14} lineHeight="18px">
                            <Trans>
                                This will overwrite the existing cloud backup with the local data, this cannot be undo.
                            </Trans>
                        </Typography>
                    :   null}
                </Box>
            :   <LoadingStatus minHeight={320} />
    }, [
        loading,
        previewInfo,
        control,
        _,
        errors.backupPassword?.message,
        errors.paymentPassword?.message,
        backupWallets,
        setBackupWallets,
        isUpload,
        theme,
        value,
        uploadLoading,
        classes,
    ])

    const action = useMemo(() => {
        if (value)
            return (
                <ActionButton fullWidth color="success" onClick={onClose}>
                    <Trans>Done</Trans>
                </ActionButton>
            )
        if (uploadLoading)
            return (
                <ActionButton fullWidth color="error" onClick={handleClose}>
                    <Trans>Cancel</Trans>
                </ActionButton>
            )
        return (
            <ActionButton
                fullWidth
                onClick={handleSubmit(handleUploadBackup)}
                startIcon={isUpload ? <Icons.CloudBackup2 size={18} /> : <Icons.Cloud />}
                color="primary"
                disabled={!isDirty || !isValid}>
                {isUpload ? (uploadButtonLabel ?? <Trans>Backup</Trans>) : <Trans>Backup to the Cloud</Trans>}
            </ActionButton>
        )
    }, [
        backupWallets,
        isUpload,
        isDirty,
        isValid,
        hasPassword,
        backupWallets,
        value,
        uploadLoading,
        handleClose,
        handleSubmit,
        handleUploadBackup,
        onClose,
    ])

    return (
        <InjectedDialog title={title} open={open} onClose={handleClose}>
            <DialogContent data-hide-scrollbar>{content}</DialogContent>
            <DialogActions>{action}</DialogActions>
        </InjectedDialog>
    )
})
