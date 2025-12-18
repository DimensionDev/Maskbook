import { Box, Alert, Button, Typography } from '@mui/material'
import { useState } from 'react'
import { QRCode } from 'react-qrcode-logo'

export { TwitterTokenRequestPage as Component }
export function TwitterTokenRequestPage() {
    const [token, setToken] = useState<string | null>(null)
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
                    const cookie = (await browser.cookies.get({ name: 'auth_token', url: 'https://x.com/' }))?.value
                    await browser.permissions.remove({ permissions: ['cookies'] })
                    setToken(cookie || null)
                }}>
                Show my X (Twitter) Token
            </Button>
            {token ?
                <QRCode value={token} size={256} />
            :   null}
        </Box>
    )
}
