import { useState } from 'react'
import { FormControlLabel, Stack, Switch } from '@mui/material'
import { Banner } from '@masknet/injected-ui/Banner'

export const meta = {
    title: 'Banner',
    description:
        '"Sign in with Mask" entry point injected into the compose box on Facebook (packages/injected-ui/src/Banner.tsx).',
}

export default function BannerFacebookDemo() {
    const [connected, setConnected] = useState(false)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <FormControlLabel
                control={<Switch checked={connected} onChange={(_, checked) => setConnected(checked)} />}
                label="Persona already connected (hides the banner)"
            />
            <span
                style={{
                    display: 'block',
                    padding: '0 16px',
                    marginTop: 0,
                }}>
                <Banner nextStep={connected ? 'hidden' : { onClick: () => alert('open dashboard') }} />
            </span>
        </Stack>
    )
}
