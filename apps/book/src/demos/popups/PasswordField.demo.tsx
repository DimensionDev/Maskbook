import { useState } from 'react'
import { Stack } from '@mui/material'
import { PasswordField } from '@masknet/injected-ui/PasswordField'

export const meta = {
    title: 'PasswordField',
    description:
        'StyledInput with a show/hide adornment, used for backup and wallet passwords (packages/injected-ui/src/PasswordField.tsx).',
}

export default function PasswordFieldDemo() {
    const [value, setValue] = useState('correct horse battery staple')

    return (
        <Stack spacing={3} sx={{ maxWidth: 360 }}>
            <PasswordField label="Payment password" value={value} onChange={(e) => setValue(e.target.value)} />
            <PasswordField label="Toggle hidden" show={false} defaultValue="always masked" />
        </Stack>
    )
}
