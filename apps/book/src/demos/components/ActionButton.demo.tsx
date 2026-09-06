import { useState } from 'react'
import { Stack } from '@mui/material'
import { ActionButton } from '@masknet/theme'

export const meta = {
    title: 'ActionButton',
    description: 'MUI Button with a built-in loading state (packages/theme/src/Components/ActionButton).',
}

export default function ActionButtonDemo() {
    const [loading, setLoading] = useState(false)

    return (
        <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
            <Stack direction="row" spacing={2}>
                <ActionButton variant="contained">Contained</ActionButton>
                <ActionButton variant="outlined">Outlined</ActionButton>
                <ActionButton variant="text">Text</ActionButton>
                <ActionButton variant="contained" color="error">
                    Danger
                </ActionButton>
            </Stack>

            <Stack direction="row" spacing={2}>
                <ActionButton variant="contained" loading>
                    Loading
                </ActionButton>
                <ActionButton variant="contained" disabled>
                    Disabled
                </ActionButton>
                <ActionButton variant="contained" width={220}>
                    Fixed width 220
                </ActionButton>
            </Stack>

            <ActionButton
                variant="contained"
                loading={loading}
                onClick={() => {
                    setLoading(true)
                    setTimeout(() => setLoading(false), 1500)
                }}>
                Click to load for 1.5s
            </ActionButton>
        </Stack>
    )
}
