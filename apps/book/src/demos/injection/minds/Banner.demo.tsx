import { useState } from 'react'
import { FormControlLabel, Stack, Switch } from '@mui/material'
import { Banner } from '@masknet/injected-ui/Banner'

export const meta = {
    title: 'Banner',
    description:
        '"Sign in with Mask" entry point injected into the compose box on Minds (packages/injected-ui/src/Banner.tsx). Minds uses the Minds-branded icon via `iconType="minds"`.',
}

export default function BannerMindsDemo() {
    const [connected, setConnected] = useState(false)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <FormControlLabel
                control={<Switch checked={connected} onChange={(_, checked) => setConnected(checked)} />}
                label="Persona already connected (hides the banner)"
            />
            <Banner iconType="minds" nextStep={connected ? 'hidden' : { onClick: () => alert('open dashboard') }} />
        </Stack>
    )
}
