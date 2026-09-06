import { useState } from 'react'
import { Stack } from '@mui/material'
import { StyledInput } from '../../../../../packages/mask/popups/components/StyledInput/index.js'

export const meta = {
    title: 'StyledInput',
    description:
        'The underline-less MUI TextField used throughout the popups UI (packages/mask/popups/components/StyledInput).',
}

export default function StyledInputDemo() {
    const [value, setValue] = useState('')

    return (
        <Stack spacing={3} sx={{ maxWidth: 360 }}>
            <StyledInput placeholder="Placeholder" value={value} onChange={(e) => setValue(e.target.value)} />
            <StyledInput label="With a label" placeholder="Placeholder" />
            <StyledInput label="With an error" defaultValue="0xnope" error helperText="Not a valid address." />
            <StyledInput label="Disabled" defaultValue="Can't touch this" disabled />
        </Stack>
    )
}
