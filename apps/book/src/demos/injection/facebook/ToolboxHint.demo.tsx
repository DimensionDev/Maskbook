import { useState } from 'react'
import { Stack, Typography } from '@mui/material'
import { ToolboxHint } from '@masknet/injected-ui/ToolboxHint'

export const meta = {
    title: 'ToolboxHint',
    description:
        'The "Mask Network" entry injected into the left rail on Facebook (packages/injected-ui/src/ToolboxHint.tsx).',
}

export default function ToolboxHintFacebookDemo() {
    const [clicked, setClicked] = useState(0)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start', maxWidth: 280 }}>
            <Typography variant="body2" color="text.secondary">
                Clicked {clicked} time(s)
            </Typography>
            <ToolboxHint iconSize={32} onClick={() => setClicked((c) => c + 1)} />
        </Stack>
    )
}
