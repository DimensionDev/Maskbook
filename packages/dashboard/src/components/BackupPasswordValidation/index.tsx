import { memo, useContext, useState } from 'react'
import { Button, DialogActions, DialogContent, Typography } from '@material-ui/core'
import { UserContext } from '../../pages/Settings/hooks/UserContext'
import { MaskDialog, MaskTextField } from '@masknet/theme'
import { useDashboardI18N } from '../../locales'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../type'

interface DialogProps {
    open: boolean
    onClose(): void
    onConfirmed(): void
}

export const BackupPasswordValidation = memo<DialogProps>(({ onConfirmed, onClose, open }) => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { user } = useContext(UserContext)
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const onSubmitPassword = () => {
        if (user.backupPassword === password) {
            console.log(password)
            onConfirmed()
        } else {
            setError(t.settings_dialogs_incorrect_password())
        }
    }

    return (
        <MaskDialog open={open} title={t.personas_logout()} onClose={onClose} maxWidth="xs">
            {!user.backupPassword && (
                <>
                    <DialogContent>
                        <Typography color="error" variant="body2" fontSize={13}>
                            1You haven’t set up your password. To export your private key, you must set up backup
                            password first.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button color="secondary" onClick={onClose}>
                            {t.personas_cancel()}
                        </Button>
                        <Button onClick={() => navigate(RoutePaths.Settings, { state: { open: 'password' } })}>
                            {t.settings()}
                        </Button>
                    </DialogActions>
                </>
            )}
            {user.backupPassword && (
                <>
                    <DialogContent>
                        <MaskTextField
                            onChange={(e) => {
                                setPassword(e.currentTarget.value)
                                setError('')
                            }}
                            placeholder={t.settings_label_backup_password()}
                            error={!!error}
                            helperText={error}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button color="secondary" onClick={onClose}>
                            {t.personas_cancel()}
                        </Button>
                        <Button disabled={!!error} onClick={onSubmitPassword}>
                            {t.personas_confirm()}
                        </Button>
                    </DialogActions>
                </>
            )}
        </MaskDialog>
    )
})
