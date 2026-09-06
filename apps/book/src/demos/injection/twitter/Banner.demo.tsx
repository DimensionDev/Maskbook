import { useState } from 'react'
import { FormControlLabel, Stack, Switch } from '@mui/material'
import { Banner } from '@masknet/injected-ui/Banner'

export const meta = {
    title: 'Banner',
    description:
        '"Sign in with Mask" entry point injected into the compose box on X/Twitter (packages/injected-ui/src/Banner.tsx). Hidden once a persona is already linked to the account.',
}

export default function BannerTwitterDemo() {
    const [connected, setConnected] = useState(false)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <FormControlLabel
                control={<Switch checked={connected} onChange={(_, checked) => setConnected(checked)} />}
                label="Persona already connected (hides the banner)"
            />
            <Banner nextStep={connected ? 'hidden' : { onClick: () => alert('open dashboard') }} />
        </Stack>
    )
}
