import Services from '#services'
import { Trans, useLingui } from '@lingui/react/macro'
import { encryptBackup } from '@masknet/backup-format'
import { Icons } from '@masknet/icons'
import { LoadingStatus } from '@masknet/shared'
import { MimeType } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { encode } from '@msgpack/msgpack'
import { Box, Typography } from '@mui/material'
import { format as formatDateTime } from 'date-fns'
import { memo } from 'react'
import { Controller } from 'react-hook-form'
import { useAsyncFn } from 'react-use'
import { UserContext } from '../../../../shared-ui/index.js'
import { PersonasBackupPreview, WalletsBackupPreview } from '../../../components/BackupPreview/index.js'
import PasswordField from '../../../components/PasswordField/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { useBackupFormState, type BackupFormInputs } from '../../../hooks/useBackupFormState.js'
import { useBackupPreviewInfo } from '../../../hooks/useBackupPreviewInfo.js'

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

export const Component = memo(function LocalBackup() {
    const { t } = useLingui()
    const { classes } = useStyles()
    const { user, updateUser } = UserContext.useContainer()
    const {
        hasPassword,
        backupWallets,
        setBackupWallets,
        formState: {
            setError,
            control,
            handleSubmit,
            clearErrors,
            formState: { errors, isDirty, isValid },
        },
    } = useBackupFormState()
    const { data: previewInfo, isLoading: loading } = useBackupPreviewInfo()

    const [{ loading: downloadLoading }, handleFormSubmit] = useAsyncFn(
        async (data: BackupFormInputs) => {
            if (backupWallets && hasPassword) {
                const verified = await Services.Wallet.verifyPassword(data.paymentPassword || '')
                if (!verified) {
                    setError('paymentPassword', { type: 'custom', message: t`Incorrect Password` })
                    return
                }
            }
            const { file } = await Services.Backup.createBackupFile({
                excludeBase: false,
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
        [backupWallets, hasPassword, setError, updateUser, user],
    )

    return (
        <>
            <form>
                <Typography variant="h1" className={classes.title}>
                    <Trans>Select the contents of the backup</Trans>
                </Typography>
                <Typography className={classes.description}>
                    <Trans>Please select the appropriate method to restore your personal data.</Trans>
                </Typography>
                {!loading && previewInfo ?
                    <Box display="flex" flexDirection="column">
                        <PersonasBackupPreview info={previewInfo} />

                        <Controller
                            control={control}
                            render={({ field }) => (
                                <PasswordField
                                    {...field}
                                    onFocus={() => clearErrors()}
                                    sx={{ mb: 2 }}
                                    placeholder={t`Backup Password`}
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

                        {backupWallets ?
                            <Controller
                                control={control}
                                render={({ field }) => (
                                    <PasswordField
                                        {...field}
                                        onFocus={() => clearErrors()}
                                        sx={{ mb: 2 }}
                                        placeholder={t`Payment Password`}
                                        error={!!errors.paymentPassword?.message}
                                        helperText={errors.paymentPassword?.message}
                                    />
                                )}
                                name="paymentPassword"
                            />
                        :   null}
                    </Box>
                :   <LoadingStatus minHeight={320} />}
            </form>
            <SetupFrameController>
                <PrimaryButton
                    startIcon={<Icons.Download />}
                    size="large"
                    color="primary"
                    loading={downloadLoading}
                    disabled={!isDirty || !isValid}
                    onClick={handleSubmit(handleFormSubmit)}>
                    <Trans>Download Backup</Trans>
                </PrimaryButton>
            </SetupFrameController>
        </>
    )
})
