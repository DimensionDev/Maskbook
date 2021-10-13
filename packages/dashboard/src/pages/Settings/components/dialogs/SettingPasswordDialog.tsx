import ConfirmDialog from '../../../../components/ConfirmDialog'
import { useEffect, useState, useContext } from 'react'
import { Box, Typography } from '@material-ui/core'
import { UserContext } from '../../hooks/UserContext'
import { useDashboardI18N } from '../../../../locales'
import { passwordRegexp } from '../../regexp'
import { useCustomSnackbar } from '@masknet/theme'
import PasswordField from '../../../../components/PasswordField'

interface SettingPasswordDialogProps {
    open: boolean
    onClose(): void
    onSet?: () => void
}

export default function SettingPasswordDialog({ open, onClose, onSet }: SettingPasswordDialogProps) {
    const t = useDashboardI18N()
    const { showSnackbar } = useCustomSnackbar()
    const { user, updateUser } = useContext(UserContext)
    const [incorrectPassword, setIncorrectPassword] = useState(false)
    const [passwordValid, setValidState] = useState(true)
    const [passwordMatched, setMatchState] = useState(true)
    const [password, setPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const passwordRule = t.settings_password_rule()

    const handleClose = () => {
        setPassword('')
        onClose()
    }
    const handleConfirm = () => {
        if (user.backupPassword) {
            if (user.backupPassword !== password) {
                setIncorrectPassword(true)
                return
            }
        }

        const matched = newPassword === repeatPassword
        setMatchState(matched)

        if (passwordValid && matched) {
            const msg = user.backupPassword ? t.settings_alert_password_updated() : t.settings_alert_password_set()
            showSnackbar(msg, {
                variant: 'success',
            })

            updateUser({ backupPassword: newPassword })
            onSet?.()
            onClose()
        }
    }

    const validCheck = () => {
        if (!newPassword) return

        const isValid = passwordRegexp.test(newPassword)
        setValidState(isValid)
    }

    useEffect(() => {
        if (!newPassword || !repeatPassword) {
            setMatchState(true)
        }
        if (!newPassword) {
            setValidState(true)
        }
    }, [newPassword, repeatPassword])

    return (
        <ConfirmDialog
            title={
                user.backupPassword
                    ? t.settings_dialogs_change_backup_password()
                    : t.settings_dialogs_setting_backup_password()
            }
            maxWidth="xs"
            open={open}
            onClose={handleClose}
            onConfirm={handleConfirm}>
            <Box sx={{ minHeight: '160px' }} py={1}>
                {user.backupPassword ? (
                    <PasswordField
                        fullWidth
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder={t.settings_label_backup_password()}
                        sx={{ marginBottom: '16px' }}
                        error={incorrectPassword}
                        helperText={incorrectPassword ? t.settings_dialogs_incorrect_password() : ''}
                    />
                ) : null}
                <PasswordField
                    fullWidth
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    onBlur={validCheck}
                    placeholder={
                        user.backupPassword
                            ? t.settings_label_new_backup_password()
                            : t.settings_label_backup_password()
                    }
                    sx={{ marginBottom: '16px' }}
                    error={!passwordValid}
                    helperText={passwordValid ? '' : passwordRule}
                />

                <PasswordField
                    fullWidth
                    value={repeatPassword}
                    onChange={(event) => setRepeatPassword(event.target.value)}
                    placeholder={t.settings_label_re_enter()}
                    error={!passwordMatched}
                    helperText={!passwordMatched ? t.settings_dialogs_inconsistency_password() : ''}
                />
                {passwordValid && passwordMatched ? (
                    <Typography sx={{ fontSize: '12px', padding: '8px 0' }}>{passwordRule}</Typography>
                ) : null}
            </Box>
        </ConfirmDialog>
    )
}
