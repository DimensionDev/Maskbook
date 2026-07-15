import { Box, Alert, Button, Typography } from '@mui/material'
import { useState } from 'react'
import { QRCode } from 'react-qrcode-logo'

async function getCookies(keys: string[]): Promise<{ [property: string]: string | undefined }> {
    const results = await Promise.allSettled(
        keys.map((key) =>
            browser.cookies.get({ name: key, url: 'https://x.com/' }).then((x) => ({ key, value: x?.value })),
        ),
    )
    return Object.fromEntries(
        results
            .filter((x) => x.status === 'fulfilled')
            .map((x) => x.value)
            .map((y) => [y.key, y.value]),
    )
}

export { TwitterTokenRequestPage as Component }
export function TwitterTokenRequestPage() {
    const [payload, setPayload] = useState<string>()
    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                padding: 2,
                gap: 2,
            }}>
            <Typography sx={{ fontSize: 24 }}>Login X (Twitter) on your Firefly App</Typography>
            <Typography>Open your Firefly App and scan the QR Code.</Typography>
            <Alert severity="warning">
                <b>This will read your X token (cookie).</b>
                <br />
                <b>NEVER share the token (QR Code) with anyone, this will LET THEM CONTROL YOUR ACCOUNT.</b>
            </Alert>
            <Button
                color="warning"
                onClick={async () => {
                    if (!(await browser.permissions.request({ permissions: ['cookies'] }))) return
                    const cookies = await getCookies([
                        'guest_id_marketing',
                        'guest_id_ads',
                        'personalization_id',
                        'guest_id',
                        '__cf_bm',
                        'gt',
                        '__cuid',
                        '_twitter_sess',
                        'kdt',
                        'twid',
                        'ct0',
                        'auth_token',
                        'g_state',
                        'lang',
                        'connect',
                        'cf_clearance',
                        'lang',
                    ])
                    await browser.permissions.remove({ permissions: ['cookies'] })
                    setPayload(JSON.stringify(cookies))
                }}>
                Show my X (Twitter) Token
            </Button>
            {payload ?
                <QRCode value={payload} size={256} />
            :   null}
        </Box>
    )
}
