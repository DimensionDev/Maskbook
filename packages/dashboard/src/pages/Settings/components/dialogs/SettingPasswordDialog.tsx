import ConfirmDialog from '../../../../components/ConfirmDialog'
import { useEffect, useState, useContext } from 'react'
import { Box, TextField } from '@material-ui/core'
import { UserContext } from '../../hooks/UserContext'
import { useDashboardI18N } from '../../../../locales'
import { passwordRegexp } from '../../regexp'

interface SettingPasswordDialogProps {
    open: boolean
    onClose(): void
}

export default function SettingPasswordDialog({ open, onClose }: SettingPasswordDialogProps) {
    const t = useDashboardI18N()
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
            updateUser({ backupPassword: newPassword })
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
            <Box sx={{ minHeight: '200px' }}>
                {user.backupPassword ? (
                    <TextField
                        fullWidth
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        type="password"
                        label={t.settings_label_backup_password()}
                        variant="outlined"
                        sx={{ marginBottom: '10px' }}
                        error={incorrectPassword}
                        helperText={incorrectPassword ? t.settings_dialogs_incorrect_password() : ''}
                    />
                ) : null}

                <TextField
                    fullWidth
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    onBlur={validCheck}
                    type="password"
                    label={
                        user.backupPassword
                            ? t.settings_label_backup_password()
                            : t.settings_label_new_backup_password()
                    }
                    variant="outlined"
                    sx={{ marginBottom: '10px' }}
                    error={!passwordValid}
                />
                <TextField
                    fullWidth
                    value={repeatPassword}
                    onChange={(event) => setRepeatPassword(event.target.value)}
                    type="password"
                    label={t.settings_label_re_enter()}
                    variant="outlined"
                    error={!passwordMatched || !passwordValid}
                    helperText={!passwordMatched ? t.settings_dialogs_inconsistency_password() : passwordRule}
                />
            </Box>
        </ConfirmDialog>
    )
}
