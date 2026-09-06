import { useState } from 'react'
import { Stack, Typography } from '@mui/material'
import { PostDialogHint } from '@masknet/injected-ui/PostDialogHint'

export const meta = {
    title: 'PostDialogHint',
    description:
        'Mask badge injected next to the compose/reply button on X/Twitter (packages/injected-ui/src/PostDialogHint.tsx), with the onboarding guide tip enabled.',
}

export default function PostDialogHintTwitterDemo() {
    const [clicked, setClicked] = useState(0)
    const [guideDismissed, setGuideDismissed] = useState(false)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start', paddingTop: '48px', paddingLeft: '48px' }}>
            <Typography variant="body2" color="text.secondary">
                Clicked {clicked} time(s){guideDismissed ? ' — guide dismissed' : ''}
            </Typography>
            <PostDialogHint
                size={20}
                tooltip={{ disabled: false, placement: 'top' }}
                onHintButtonClicked={() => setClicked((c) => c + 1)}
                guide={
                    guideDismissed ? undefined : (
                        {
                            step: 1,
                            total: 1,
                            tip: 'Click here to have a quick start.',
                            visible: true,
                            onSkip: () => setGuideDismissed(true),
                            onNext: () => setGuideDismissed(true),
                            onTry: () => {
                                setGuideDismissed(true)
                                setClicked((c) => c + 1)
                            },
                        }
                    )
                }
            />
        </Stack>
    )
}
