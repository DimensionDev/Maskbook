import { useState } from 'react'
import { Stack, Typography } from '@mui/material'
import { ToolboxHint } from '@masknet/injected-ui/ToolboxHint'

export const meta = {
    title: 'ToolboxHint',
    description:
        'The "Mask Network" entry injected into the sidebar on Minds (packages/injected-ui/src/ToolboxHint.tsx), shown in its compact ("mini") form.',
}

export default function ToolboxHintMindsDemo() {
    const [clicked, setClicked] = useState(0)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="body2" color="text.secondary">
                Clicked {clicked} time(s)
            </Typography>
            <ToolboxHint mini onClick={() => setClicked((c) => c + 1)} />
        </Stack>
    )
}
