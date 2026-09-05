import { useState } from 'react'
import { Stack } from '@mui/material'
import { MaskTextField } from '@masknet/theme'

export const meta = {
    title: 'MaskTextField',
    description: 'Labelled text field with the Mask input styling.',
}

export default function TextFieldDemo() {
    const [value, setValue] = useState('')

    return (
        <Stack spacing={3} sx={{ maxWidth: 360 }}>
            <MaskTextField label="Wallet name" placeholder="e.g. Main wallet" />
            <MaskTextField
                label="Amount"
                type="number"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <MaskTextField label="Recipient" defaultValue="0x0000…dead" error helperText="Invalid address" />
            <MaskTextField label="Disabled" value="read only" disabled />
        </Stack>
    )
}
