import { Button, Stack, Typography } from '@mui/material'
import { memo } from 'react'
import { AccountType } from '../../../pages/Settings/type'

interface LabelProps {
    onModeChange(mode: AccountType): void
    mode: AccountType
}

export enum ValidationCodeStep {
    EmailInput = 'EmailInput',
    PhoneInput = 'PhoneInput',
    AccountValidation = 'AccountValidation',
    ConfirmBackupInfo = 'ConfirmBackupInfo',
}

export const Label = memo(({ mode, onModeChange }: LabelProps) => {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 'bolder' }} color="textPrimary">
                {mode === 'email' ? 'Email' : 'Phone Number'}
            </Typography>
            {mode === 'email' ? (
                <Button size="small" variant="text" onClick={() => onModeChange(AccountType.phone)}>
                    Recovery with Mobile
                </Button>
            ) : (
                <Button size="small" variant="text" onClick={() => onModeChange(AccountType.email)}>
                    Recovery with Email
                </Button>
            )}
        </Stack>
    )
})
