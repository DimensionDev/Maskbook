import Services from '#services'
import { Trans, useLingui } from '@lingui/react/macro'
import { encryptBackup } from '@masknet/backup-format'
import { Icons } from '@masknet/icons'
import { LoadingStatus } from '@masknet/shared'
import { MimeType } from '@masknet/shared-base'
import { encode } from '@msgpack/msgpack'
import { Box } from '@mui/material'
import { format as formatDateTime } from 'date-fns'
import { memo } from 'react'
import { Controller } from 'react-hook-form'
import { useAsyncFn } from 'react-use'
import { UserContext } from '../../../../shared-ui/index.js'
import { PersonasBackupPreview, WalletsBackupPreview } from '../../../components/BackupPreview/index.js'
import { OutletPortal } from '../../../components/OutletPortal.js'
import PasswordField from '../../../components/PasswordField/index.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { useBackupFormState, type BackupFormInputs } from '../../../hooks/useBackupFormState.js'
import { useBackupPreviewInfo } from '../../../hooks/useBackupPreviewInfo.js'
import { downloadBackup } from '../../../utils/api.js'

export const Component = memo(function LocalBackup() {
    const { t } = useLingui()
    const { user, updateUser } = UserContext.useContainer()
    const {
        hasPassword,
        backupWallets,
        setBackupWallets,
        formState: { setError, control, handleSubmit, clearErrors, formState },
    } = useBackupFormState()
    const { errors, isDirty, isValid } = formState
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

            const encrypted = await encryptBackup(
                encode(data.backupPassword) as Uint8Array<ArrayBuffer>,
                encode(file) as Uint8Array<ArrayBuffer>,
            )
            const now = formatDateTime(new Date(), 'yyyy-MM-dd HH:mm')
            const blob = new Blob([encrypted], { type: MimeType.Binary })
            const url = URL.createObjectURL(blob)
            downloadBackup(url, `mask-network-keystore-backup-${now}.bin`)

            await updateUser({
                localBackupAt: now,
            })

            window.close()
        },
        [backupWallets, hasPassword, setError, updateUser, user],
    )

    return (
        <form>
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
            <OutletPortal>
                <PrimaryButton
                    startIcon={<Icons.Download />}
                    size="large"
                    color="primary"
                    loading={downloadLoading}
                    disabled={!isDirty || !isValid}
                    onClick={handleSubmit(handleFormSubmit)}>
                    <Trans>Download Backup</Trans>
                </PrimaryButton>
            </OutletPortal>
        </form>
    )
})
