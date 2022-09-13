import ConfirmDialog from '../../../../components/ConfirmDialog/index.js'
import React, { useContext, useState } from 'react'
import { Box } from '@mui/material'
import { UserContext } from '../../hooks/UserContext.js'
import { useDashboardI18N } from '../../../../locales/index.js'
import PasswordField from '../../../../components/PasswordField/index.js'

interface VerifyPasswordDialogProps {
    open: boolean
    onVerified(): void
    onClose(): void
}

export default function VerifyPasswordDialog({ open, onVerified, onClose }: VerifyPasswordDialogProps) {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    const [passwordMismatched, setMatchState] = useState(false)
    const [password, setPassword] = useState('')
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value)
        setMatchState(false)
    }
    const handleClose = () => {
        setPassword('')
        onClose()
    }
    const handleConfirm = () => {
        const matched = user.backupPassword === password
        setMatchState(!matched)

        if (matched) {
            onClose()
            onVerified()
        }
    }

    return (
        <ConfirmDialog
            title={t.settings_dialogs_verify_backup_password()}
            open={open}
            onClose={handleClose}
            onConfirm={handleConfirm}>
            <Box sx={{ minHeight: '168px', padding: '0 90px', display: 'flex', alignItems: 'center' }}>
                <PasswordField
                    fullWidth
                    value={password}
                    onChange={handleChange}
                    label={t.settings_label_backup_password()}
                    error={passwordMismatched}
                    helperText={passwordMismatched ? 'Incorrect password' : ''}
                />
            </Box>
        </ConfirmDialog>
    )
}
