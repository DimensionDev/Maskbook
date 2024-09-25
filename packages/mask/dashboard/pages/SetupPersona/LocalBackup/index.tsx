import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { memo } from 'react'
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
import { format as formatDateTime } from 'date-fns'
import { MimeType } from '@masknet/shared-base'
import { useBackupFormState, type BackupFormInputs } from '../../../hooks/useBackupFormState.js'
import { UserContext } from '../../../../shared-ui/index.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    const { _ } = useLingui()
    const { classes } = useStyles()
    const { user, updateUser } = UserContext.useContainer()
    const {
        hasPassword,
        previewInfo,
        loading,
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

    const [{ loading: downloadLoading }, handleFormSubmit] = useAsyncFn(
        async (data: BackupFormInputs) => {
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

                        {backupWallets ?
                            <Controller
                                control={control}
                                render={({ field }) => (
                                    <PasswordField
                                        {...field}
                                        onFocus={() => clearErrors()}
                                        sx={{ mb: 2 }}
                                        placeholder={_(msg`Payment Password`)}
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
