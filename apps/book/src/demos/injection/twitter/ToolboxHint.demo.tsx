import { useState } from 'react'
import { Stack, Typography } from '@mui/material'
import { ToolboxHint } from '@masknet/injected-ui/ToolboxHint'

export const meta = {
    title: 'ToolboxHint',
    description:
        'The "Mask Network" entry injected into the sidebar/toolbox on X/Twitter (packages/injected-ui/src/ToolboxHint.tsx). Only the application slot is decoupled here — the wallet slot needs live chain state.',
}

export default function ToolboxHintTwitterDemo() {
    const [clicked, setClicked] = useState(0)
    const [guideDismissed, setGuideDismissed] = useState(false)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start', maxWidth: 280, paddingTop: '48px', paddingLeft: '48px' }}>
            <Typography variant="body2" color="text.secondary">
                Clicked {clicked} time(s){guideDismissed ? ' — guide dismissed' : ''}
            </Typography>
            <ToolboxHint
                onClick={() => setClicked((c) => c + 1)}
                guide={
                    guideDismissed ? undefined : (
                        {
                            step: 1,
                            total: 4,
                            tip: 'Explore multi-chain dApps.',
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
