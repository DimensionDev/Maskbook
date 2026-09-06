import { Stack } from '@mui/material'
import { MaskAlert } from '@masknet/theme'

export const meta = {
    title: 'MaskAlert',
    description: 'Themed wrapper around MUI Alert.',
}

export default function AlertDemo() {
    return (
        <Stack spacing={2} sx={{ maxWidth: 520 }}>
            <MaskAlert severity="success">Your transaction was confirmed.</MaskAlert>
            <MaskAlert severity="info">A new persona backup is available.</MaskAlert>
            <MaskAlert severity="warning">Gas price is unusually high right now.</MaskAlert>
            <MaskAlert severity="error">Failed to decrypt this post.</MaskAlert>
        </Stack>
    )
}
