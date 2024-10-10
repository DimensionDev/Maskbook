import { InjectedDialog, LoadingStatus } from '@masknet/shared'
import { memo, useCallback, useMemo, useRef } from 'react'
import { useDashboardTrans } from '../../locales/i18n_generated.js'
import { Box, DialogActions, DialogContent, Typography } from '@mui/material'
import { useBackupFormState, type BackupFormInputs } from '../../hooks/useBackupFormState.js'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { useAsyncFn, useUpdateEffect } from 'react-use'
import Services from '#services'
import type { BackupAccountType } from '@masknet/shared-base'
import { fetchDownloadLink, fetchUploadLink, uploadBackupValue } from '../../utils/api.js'
import { encryptBackup } from '@masknet/backup-format'
import { encode } from '@msgpack/msgpack'
import { Controller } from 'react-hook-form'
import { PersonasBackupPreview, WalletsBackupPreview } from '../../components/BackupPreview/index.js'
import PasswordField from '../../components/PasswordField/index.js'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { format as formatDateTime } from 'date-fns'
import { UserContext } from '../../../shared-ui/index.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    type: BackupAccountType
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
    const { _ } = useLingui()
    const controllerRef = useRef<AbortController | null>(null)
    const { classes, theme } = useStyles()
    const [params, setParams] = useSearchParams()
    const navigate = useNavigate()
    const t = useDashboardTrans()
    const { updateUser } = UserContext.useContainer()
    const {
        hasPassword,
        previewInfo,
        loading,
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
                    const downloadLinkResponse = await fetchDownloadLink({
                        account,
                        type,
                        code,
                    })
                    showSnackbar(<Trans>You have backed up your data.</Trans>, { variant: 'success' })
                    updateUser({ cloudBackupAt: now, cloudBackupMethod: type })
                    setParams((params) => {
                        params.set('size', downloadLinkResponse.size.toString())
                        params.set('abstract', downloadLinkResponse.abstract)
                        params.set('uploadedAt', downloadLinkResponse.uploadedAt.toString())
                        params.set('downloadURL', downloadLinkResponse.downloadURL)
                        return params.toString()
                    })
                }
                return true
            } catch (error) {
                showSnackbar(<Trans>Backup Failed</Trans>, { variant: 'error' })
                onClose()
                if ((error as any).status === 400) navigate(DashboardRoutes.CloudBackup, { replace: true })
                return false
            }
        },
        [code, hasPassword, backupWallets, abstract, code, account, type, t, navigate, updateUser, params],
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
        if (value)
            return (
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
                        <Trans>Backup is saved to Mask Cloud Service.</Trans>
                    </Typography>
                </Box>
            )
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
                    {isOverwrite ?
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
                startIcon={isOverwrite ? <Icons.CloudBackup2 size={18} /> : <Icons.Cloud />}
                color={isOverwrite ? 'error' : 'primary'}
                disabled={!isDirty || !isValid}>
                {isOverwrite ?
                    <Trans>Overwrite Backup</Trans>
                :   <Trans>Backup to the Cloud</Trans>}
            </ActionButton>
        )
    }, [
        backupWallets,
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
        <InjectedDialog title={<Trans>Upload backup</Trans>} open={open} onClose={handleClose}>
            <DialogContent data-hide-scrollbar>{content}</DialogContent>
            <DialogActions>{action}</DialogActions>
        </InjectedDialog>
    )
})
