import { useEffect, useState } from 'react'
import { MaskColorVar, MaskDialog, useCustomSnackbar } from '@masknet/theme'
import {
    Box,
    FormControlLabel,
    formControlLabelClasses,
    Radio,
    RadioGroup,
    styled,
    Typography,
} from '@material-ui/core'
import LoadingButton from '@material-ui/lab/LoadingButton'
import { BackupInfoCard } from '../../../../components/Restore/BackupInfoCard'
import type { BackupFileInfo } from '../../type'
import { useDashboardI18N } from '../../../../locales'
import { PluginServices, Services } from '../../../../API'
import { fetchBackupValue } from '../../api'
import { useAsyncFn } from 'react-use'
import { decryptBackup } from '@masknet/backup-format'
import { decode, encode } from '@msgpack/msgpack'
import PasswordField from '../../../../components/PasswordField'

const StyledFormControlLabel = styled(FormControlLabel)({
    [`&.${formControlLabelClasses.root}`]: {
        background: MaskColorVar.lightBackground,
        margin: '0 0 16px',
        padding: '2px 0',
        borderRadius: 8,
    },
    [`& .${formControlLabelClasses.label}`]: {
        fontSize: 14,
    },
})

export interface CloudBackupMergeDialogProps {
    account: string
    info: BackupFileInfo
    open: boolean
    onClose(): void
    onMerged(merged: boolean): void
}

export function CloudBackupMergeDialog({ account, info, open, onClose, onMerged }: CloudBackupMergeDialogProps) {
    const [mode, setMode] = useState('1')
    const [backupPassword, setBackupPassword] = useState('')
    const [incorrectBackupPassword, setIncorrectBackupPassword] = useState(false)
    const t = useDashboardI18N()
    const { showSnackbar } = useCustomSnackbar()

    const [{ loading }, handleMerge] = useAsyncFn(async () => {
        try {
            const encrypted = await fetchBackupValue(info.downloadURL)
            const decrypted = await decryptBackup(encode(account + backupPassword), encrypted)
            const backupText = JSON.stringify(decode(decrypted))
            const data = await Services.Welcome.parseBackupStr(backupText)

            if (
                data?.info.wallets &&
                (!(await PluginServices.Wallet.hasPassword()) || (await PluginServices.Wallet.isLocked()))
            ) {
                await Services.Helper.openPopupsWindow('/wallet/recovered', { backupId: data.id })
                return
            }

            if (data?.id) {
                await Services.Welcome.checkPermissionsAndRestore(data.id)
            }

            onMerged(true)
            showSnackbar(t.settings_alert_merge_success(), { variant: 'success' })
        } catch (error) {
            setIncorrectBackupPassword(true)
        }
    }, [backupPassword, account, info])

    const onBackup = () => {
        if (mode === '1') {
            onMerged(false)
        } else {
            handleMerge()
        }
    }

    useEffect(() => {
        setIncorrectBackupPassword(false)
    }, [backupPassword])

    return (
        <MaskDialog maxWidth="xs" title={t.settings_cloud_backup()} open={open} onClose={onClose}>
            <Box sx={{ padding: '0 24px 24px' }}>
                <BackupInfoCard info={info} />
                <Typography sx={{ fontSize: '13px', padding: '24px 0' }}>
                    {t.settings_dialogs_backup_action_desc()}
                </Typography>

                <RadioGroup aria-label="mode" name="mode" value={mode} onChange={(e) => setMode(e.target.value)}>
                    <StyledFormControlLabel
                        value="1"
                        control={<Radio size="small" />}
                        label={t.settings_dialogs_backup_to_cloud()}
                    />
                    <StyledFormControlLabel
                        sx={{ fontSize: 14 }}
                        value="2"
                        control={<Radio size="small" />}
                        label={t.settings_dialogs_merge_to_local_data()}
                    />
                </RadioGroup>

                {mode === '2' ? (
                    <PasswordField
                        fullWidth
                        value={backupPassword}
                        onChange={(event) => setBackupPassword(event.target.value)}
                        placeholder={t.settings_label_backup_password_cloud()}
                        sx={{ marginBottom: '24px' }}
                        error={incorrectBackupPassword}
                        helperText={incorrectBackupPassword ? t.settings_dialogs_incorrect_password() : ''}
                    />
                ) : null}

                <LoadingButton fullWidth onClick={onBackup} loading={loading} disabled={incorrectBackupPassword}>
                    {t.settings_button_backup()}
                </LoadingButton>
            </Box>
        </MaskDialog>
    )
}
