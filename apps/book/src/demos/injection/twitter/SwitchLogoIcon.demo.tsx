import { useState } from 'react'
import { FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import { SwitchLogoIcon } from '@masknet/injected-ui/SwitchLogoIcon'

export const meta = {
    title: 'SwitchLogoIcon',
    description:
        "The click target overlaid on top of X's own logo that opens the switch-logo dialog (packages/injected-ui/src/SwitchLogoIcon.tsx). Hover the box below to reveal it.",
}

export default function SwitchLogoIconDemo() {
    const [minimal, setMinimal] = useState(false)
    const [clicked, setClicked] = useState(0)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <FormControlLabel
                control={<Switch checked={minimal} onChange={(_, checked) => setMinimal(checked)} />}
                label="Minimal mode (hides the click target)"
            />
            <Typography variant="body2" color="text.secondary">
                Clicked {clicked} time(s)
            </Typography>
            <div
                style={{
                    position: 'relative',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--book-accent, #1d9bf0)',
                }}>
                <SwitchLogoIcon minimal={minimal} onClick={() => setClicked((c) => c + 1)} />
            </div>
        </Stack>
    )
}
