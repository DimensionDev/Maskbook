import { useContext, useEffect, useMemo, useState } from 'react'
import { PluginServices, Services } from '../../../../API'
import { useAsync, useAsyncFn } from 'react-use'
import BackupContentSelector, { BackupContentCheckedStatus } from '../BackupContentSelector'
import { useDashboardI18N } from '../../../../locales'
import { MaskDialog, useSnackbar } from '@masknet/theme'
import { Box } from '@material-ui/core'
import { UserContext } from '../../hooks/UserContext'
import LoadingButton from '@material-ui/lab/LoadingButton'
import { fetchUploadLink, uploadBackupValue, VerifyCodeRequest } from '../../api'
import formatDateTime from 'date-fns/format'
import { LoadingCard } from '../../../../components/Restore/steps/LoadingCard'
import { encryptBackup } from '@masknet/backup-format'
import { encode } from '@msgpack/msgpack'
import PasswordFiled from '../../../../components/PasswordField'
import { MaskAlert } from '../../../../components/MaskAlert'

export interface BackupDialogProps {
    local?: boolean
    params?: VerifyCodeRequest
    open: boolean
    merged?: boolean
    onClose(): void
}

export default function BackupDialog({ local = true, params, open, merged, onClose }: BackupDialogProps) {
    const snackbar = useSnackbar()
    const t = useDashboardI18N()
    const [backupPassword, setBackupPassword] = useState('')
    const [paymentPassword, setPaymentPassword] = useState('')
    const [incorrectBackupPassword, setIncorrectBackupPassword] = useState(false)
    const [incorrectPaymentPassword, setIncorrectPaymentPassword] = useState(false)
    const [showPassword, setShowPassword] = useState({
        base: true,
        wallet: false,
    })
    const title = local ? t.settings_local_backup() : t.settings_cloud_backup()
    const { user, updateUser } = useContext(UserContext)

    const { value: previewInfo, loading: searching } = useAsync(() => Services.Welcome.generateBackupPreviewInfo())

    const [{ loading }, handleBackup] = useAsyncFn(async () => {
        if (backupPassword !== user.backupPassword) {
            setIncorrectBackupPassword(true)
            return
        }

        try {
            if (showPassword.wallet) {
                const verified = await PluginServices.Wallet.verifyPassword(paymentPassword)
                if (!verified) {
                    setIncorrectPaymentPassword(true)
                    return
                }
            }

            const fileJson = await Services.Welcome.createBackupFile({
                noPosts: !showPassword.base,
                noPersonas: !showPassword.base,
                noProfiles: !showPassword.base,
                noWallets: !showPassword.wallet,
                download: false,
                onlyBackupWhoAmI: false,
            })

            if (local) {
                // local backup, no account
                const encrypted = await encryptBackup(encode(backupPassword), encode(fileJson))
                await Services.Welcome.downloadBackupV2(encrypted)
            } else if (params) {
                const abstract = fileJson.personas
                    .filter((x) => x.nickname)
                    .map((x) => x.nickname)
                    .join(', ')
                const uploadUrl = await fetchUploadLink({ ...params, abstract })
                const encrypted = await encryptBackup(encode(params.account + backupPassword), encode(fileJson))

                uploadBackupValue(uploadUrl, encrypted).then(() => {
                    snackbar.enqueueSnackbar(t.settings_alert_backup_success(), { variant: 'success' })
                })
            }

            updateUser({
                backupMethod: local ? 'local' : 'cloud',
                backupAt: formatDateTime(new Date(), 'yyyy-MM-dd HH:mm'),
            })

            onClose()
        } catch {
            snackbar.enqueueSnackbar(t.settings_alert_backup_fail(), { variant: 'error' })
        }
    }, [backupPassword, paymentPassword])

    const handleContentChange = ({ baseChecked, walletChecked }: BackupContentCheckedStatus) => {
        setShowPassword({
            base: baseChecked,
            wallet: walletChecked,
        })
    }

    const backupDisabled = useMemo(() => {
        return !backupPassword || (showPassword.wallet && !paymentPassword) || loading
    }, [backupPassword, paymentPassword, loading])

    useEffect(() => {
        setIncorrectBackupPassword(false)
    }, [backupPassword])

    useEffect(() => {
        setIncorrectPaymentPassword(false)
    }, [paymentPassword])

    return (
        <MaskDialog maxWidth="xs" title={title} open={open} onClose={onClose}>
            {searching ? (
                <Box sx={{ padding: '0 24px 24px' }}>
                    <LoadingCard text={t.searching()} />
                </Box>
            ) : (
                <Box sx={{ padding: '0 24px 24px' }}>
                    {merged ? (
                        <Box sx={{ marginBottom: '16px' }}>
                            <MaskAlert description={t.settings_dialogs_backup_merged_tip()} type="success" />
                        </Box>
                    ) : null}

                    {previewInfo ? <BackupContentSelector json={previewInfo} onChange={handleContentChange} /> : null}

                    <PasswordFiled
                        fullWidth
                        value={backupPassword}
                        onChange={(event) => setBackupPassword(event.target.value)}
                        placeholder={t.settings_label_backup_password()}
                        sx={{ marginBottom: '16px' }}
                        error={incorrectBackupPassword}
                        helperText={incorrectBackupPassword ? t.settings_dialogs_incorrect_password() : ''}
                    />

                    {showPassword.wallet ? (
                        <PasswordFiled
                            fullWidth
                            value={paymentPassword}
                            onChange={(event) => setPaymentPassword(event.target.value)}
                            placeholder={t.settings_label_payment_password()}
                            sx={{ marginBottom: '16px' }}
                            error={incorrectPaymentPassword}
                            helperText={incorrectPaymentPassword ? t.settings_dialogs_incorrect_password() : ''}
                        />
                    ) : null}

                    <LoadingButton fullWidth disabled={backupDisabled} onClick={handleBackup} loading={loading}>
                        {t.settings_button_backup()}
                    </LoadingButton>
                </Box>
            )}
        </MaskDialog>
    )
}
