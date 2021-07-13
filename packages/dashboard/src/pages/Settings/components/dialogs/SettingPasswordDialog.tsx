import ConfirmDialog from '../../../../components/ConfirmDialog'
import { useEffect, useState, useContext } from 'react'
import { Box, TextField } from '@material-ui/core'
import { UserContext } from '../../hooks/UserContext'
import { useDashboardI18N } from '../../../../locales'

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
    const reg = /^(?=.{8,20}$)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*/
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

        const isValid = reg.test(newPassword)
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
            title={`${user.backupPassword ? 'Change' : 'Setting'} Backup Password`}
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
                        label="Backup Password"
                        variant="outlined"
                        sx={{ marginBottom: '10px' }}
                        error={incorrectPassword}
                        helperText={incorrectPassword ? 'Incorrect password.' : ''}
                    />
                ) : null}

                <TextField
                    fullWidth
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    onBlur={validCheck}
                    type="password"
                    label={`${user.backupPassword ? 'New ' : ''}Backup Password`}
                    variant="outlined"
                    sx={{ marginBottom: '10px' }}
                    error={!passwordValid}
                />
                <TextField
                    fullWidth
                    value={repeatPassword}
                    onChange={(event) => setRepeatPassword(event.target.value)}
                    type="password"
                    label="Re-enter"
                    variant="outlined"
                    error={!passwordMatched || !passwordValid}
                    helperText={!passwordMatched ? 'Password inconsistency.' : passwordRule}
                />
            </Box>
        </ConfirmDialog>
    )
}
