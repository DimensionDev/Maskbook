import { useState } from 'react'
import { Stack, Typography } from '@mui/material'
import { PostDialogHint } from '@masknet/injected-ui/PostDialogHint'

export const meta = {
    title: 'PostDialogHint',
    description:
        'Mask badge injected next to the compose button on Minds (packages/injected-ui/src/PostDialogHint.tsx). Minds disables the onboarding guide tip for this entry point.',
}

export default function PostDialogHintMindsDemo() {
    const [clicked, setClicked] = useState(0)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="body2" color="text.secondary">
                Clicked {clicked} time(s)
            </Typography>
            <PostDialogHint
                size={17}
                iconType="minds"
                tooltip={{ disabled: true }}
                onHintButtonClicked={() => setClicked((c) => c + 1)}
            />
        </Stack>
    )
}
