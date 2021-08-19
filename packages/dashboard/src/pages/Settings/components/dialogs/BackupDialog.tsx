import { useContext, useMemo, useState, useEffect } from 'react'
import { Services } from '../../../../API'
import { useAsync } from 'react-use'
import BackupContentSelector, { BackupContentCheckedStatus } from '../BackupContentSelector'
import { useDashboardI18N } from '../../../../locales'
import { MaskDialog, MaskTextField, useSnackbar } from '@masknet/theme'
import { Box } from '@material-ui/core'
import { UserContext } from '../../hooks/UserContext'
import LoadingButton from '@material-ui/lab/LoadingButton'
import { VerifyCodeRequest, fetchUploadLink, uploadBackupValue } from '../../api'
import formatDateTime from 'date-fns/format'

export interface BackupDialogProps {
    local?: boolean
    params?: VerifyCodeRequest
    open: boolean
    onClose(): void
}

export default function BackupDialog({ local = true, params, open, onClose }: BackupDialogProps) {
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

    const { value, loading } = useAsync(() => Services.Welcome.generateBackupPreviewInfo())

    const handleClose = () => {
        onClose()
    }
    const handleBackup = async () => {
        if (backupPassword !== user.backupPassword) {
            setIncorrectBackupPassword(true)
            return
        }

        if (showPassword.wallet) {
            // TODO: verify payment password
        }

        try {
            const file = await Services.Welcome.createBackupFile({
                noPosts: !showPassword.base,
                noPersonas: !showPassword.base,
                noProfiles: !showPassword.base,
                noWallets: !showPassword.wallet,
                download: local,
                onlyBackupWhoAmI: false,
            })

            if (!local && params) {
                const abstract = file.personas
                    .filter((x) => x.nickname)
                    .map((x) => x.nickname)
                    .join(', ')
                const uploadUrl = await fetchUploadLink({ ...params, abstract })
                const encrypted = await Services.Crypto.encryptBackup(
                    backupPassword,
                    params.account,
                    JSON.stringify(file),
                )

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
    }

    const handleContentChange = ({ baseChecked, walletChecked }: BackupContentCheckedStatus) => {
        setShowPassword({
            base: baseChecked,
            wallet: walletChecked,
        })
    }

    const backupDisabled = useMemo(() => {
        return !backupPassword || loading
    }, [backupPassword, loading])

    useEffect(() => {
        setIncorrectBackupPassword(false)
    }, [backupPassword])

    return (
        <MaskDialog maxWidth="xs" title={title} open={open} onClose={handleClose}>
            <Box sx={{ padding: '0 24px 24px' }}>
                {value ? <BackupContentSelector json={value} onChange={handleContentChange} /> : null}

                <MaskTextField
                    fullWidth
                    value={backupPassword}
                    onChange={(event) => setBackupPassword(event.target.value)}
                    type="password"
                    placeholder={t.settings_label_backup_password()}
                    sx={{ marginBottom: '24px' }}
                    error={incorrectBackupPassword}
                    helperText={incorrectBackupPassword ? t.settings_dialogs_incorrect_password() : ''}
                />

                {showPassword.wallet ? (
                    <MaskTextField
                        fullWidth
                        value={paymentPassword}
                        onChange={(event) => setPaymentPassword(event.target.value)}
                        type="password"
                        placeholder={t.settings_label_payment_password()}
                        sx={{ marginBottom: '24px' }}
                        error={incorrectPaymentPassword}
                        helperText={incorrectPaymentPassword ? t.settings_dialogs_incorrect_password() : ''}
                    />
                ) : null}

                <LoadingButton fullWidth disabled={backupDisabled} onClick={handleBackup} loading={loading}>
                    {t.settings_button_backup()}
                </LoadingButton>
            </Box>
        </MaskDialog>
    )
}
