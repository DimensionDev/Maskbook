import { encryptBackup } from '@masknet/backup-format'
import { MimeType } from '@masknet/shared-base'
import { MaskDialog, useCustomSnackbar } from '@masknet/theme'
import { encode } from '@msgpack/msgpack'
import { Box } from '@mui/material'
import formatDateTime from 'date-fns/format'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { PluginServices, Services } from '../../../../API.js'
import { LoadingButton } from '../../../../components/LoadingButton/index.js'
import { MaskAlert } from '../../../../components/MaskAlert/index.js'
import PasswordFiled from '../../../../components/PasswordField/index.js'
import { LoadingCard } from '../../../../components/LoadingCard/index.js'
import { useDashboardI18N } from '../../../../locales/index.js'
import { fetchUploadLink, uploadBackupValue, type VerifyCodeRequest } from '../../api.js'
import { UserContext } from '../../hooks/UserContext.js'
import BackupContentSelector, { type BackupContentCheckedStatus } from '../BackupContentSelector.js'

export interface BackupDialogProps {
    local?: boolean
    params?: VerifyCodeRequest
    open: boolean
    merged?: boolean
    onClose(): void
}

export default function BackupDialog({ local = true, params, open, merged, onClose }: BackupDialogProps) {
    const { showSnackbar } = useCustomSnackbar()
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

    const { value: previewInfo, loading: searching } = useAsync(() => Services.Backup.generateBackupPreviewInfo())

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

            const { file, personaNickNames } = await Services.Backup.createBackupFile({
                excludeBase: !showPassword,
                excludeWallet: !showPassword.wallet,
            })

            // TODO: move this to background
            if (local) {
                // local backup, no account
                const encrypted = await encryptBackup(encode(backupPassword), encode(file))
                const now = formatDateTime(Date.now(), 'yyyy-MM-dd')
                const blob = new Blob([encrypted], { type: MimeType.Binary })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `mask-network-keystore-backup-${now}.bin`
                a.click()
            } else if (params) {
                const abstract = personaNickNames.join(', ')
                const uploadUrl = await fetchUploadLink({ ...params, abstract })
                const encrypted = await encryptBackup(encode(params.account + backupPassword), encode(file))

                uploadBackupValue(uploadUrl, encrypted).then(() => {
                    showSnackbar(t.settings_alert_backup_success(), { variant: 'success' })
                })
            }

            updateUser({
                backupMethod: local ? 'local' : 'cloud',
                backupAt: formatDateTime(new Date(), 'yyyy-MM-dd HH:mm'),
            })

            onClose()
        } catch {
            showSnackbar(t.settings_alert_backup_fail(), { variant: 'error' })
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
