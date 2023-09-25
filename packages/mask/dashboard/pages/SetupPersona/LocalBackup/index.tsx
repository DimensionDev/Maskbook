import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { memo } from 'react'
import { useDashboardTrans } from '../../../locales/i18n_generated.js'
import { useAsyncFn } from 'react-use'
import Services from '#services'
import { LoadingStatus } from '@masknet/shared'
import PasswordField from '../../../components/PasswordField/index.js'
import { PersonasBackupPreview, WalletsBackupPreview } from '../../../components/BackupPreview/index.js'
import { Controller } from 'react-hook-form'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { Icons } from '@masknet/icons'
import { encryptBackup } from '@masknet/backup-format'
import { encode } from '@msgpack/msgpack'
import formatDateTime from 'date-fns/format'
import { MimeType } from '@masknet/shared-base'
import { useBackupFormState, type BackupFormInputs } from '../../../hooks/useBackupFormState.js'
import { UserContext } from '../../../../shared-ui/index.js'

const useStyles = makeStyles()((theme) => ({
    title: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    description: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(3),
    },
}))

export const LocalBackup = memo(function LocalBackup() {
    const t = useDashboardTrans()
    const { classes } = useStyles()
    const { user, updateUser } = UserContext.useContainer()
    const {
        hasPassword,
        previewInfo,
        loading,
        backupPersonas,
        backupWallets,
        setBackupPersonas,
        setBackupWallets,
        formState: {
            setError,
            control,
            handleSubmit,
            clearErrors,
            formState: { errors, isDirty, isValid },
        },
    } = useBackupFormState()

    const [{ loading: downloadLoading }, handleFormSubmit] = useAsyncFn(
        async (data: BackupFormInputs) => {
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

            const encrypted = await encryptBackup(encode(data.backupPassword), encode(file))
            const now = formatDateTime(new Date(), 'yyyy-MM-dd HH:mm')
            const blob = new Blob([encrypted], { type: MimeType.Binary })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `mask-network-keystore-backup-${now}.bin`
            a.click()

            await updateUser({
                localBackupAt: now,
            })

            window.close()
        },
        [backupPersonas, backupWallets, hasPassword, setError, updateUser, user],
    )

    return (
        <>
            <form>
                <Typography variant="h1" className={classes.title}>
                    {t.data_backup_title()}
                </Typography>
                <Typography className={classes.description}>{t.data_backup_description()}</Typography>
                {!loading && previewInfo ? (
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

                        {backupWallets ? (
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
                    </Box>
                ) : (
                    <LoadingStatus minHeight={320} />
                )}
            </form>
            <SetupFrameController>
                <PrimaryButton
                    startIcon={<Icons.Download />}
                    size="large"
                    color="primary"
                    loading={downloadLoading}
                    disabled={!isDirty || !isValid}
                    onClick={handleSubmit(handleFormSubmit)}>
                    {t.download_backup()}
                </PrimaryButton>
            </SetupFrameController>
        </>
    )
})
