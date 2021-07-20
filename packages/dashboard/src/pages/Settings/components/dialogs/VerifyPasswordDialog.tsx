import ConfirmDialog from '../../../../components/ConfirmDialog'
import React, { useState } from 'react'
import { TextField } from '@material-ui/core'

interface VerifyPasswordDialogProps {
    open: boolean
    onVerified(): void
    onClose(): void
}

export default function VerifyPasswordDialog({ open, onVerified, onClose }: VerifyPasswordDialogProps) {
    // TODO: get password
    const savedPassword = 'mask'
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
        const matched = savedPassword === password
        setMatchState(!matched)

        if (matched) {
            onClose()
            onVerified()
        }
    }

    return (
        <ConfirmDialog title="Verify Your Password" open={open} onClose={handleClose} onConfirm={handleConfirm}>
            <TextField
                fullWidth
                value={password}
                onChange={handleChange}
                type="password"
                label="Password"
                variant="outlined"
                error={passwordMismatched}
                helperText={passwordMismatched ? 'Incorrect password' : ''}
            />
        </ConfirmDialog>
    )
}
