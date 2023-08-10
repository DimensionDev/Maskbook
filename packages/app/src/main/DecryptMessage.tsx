import { Suspense, lazy } from 'react'
import { Box, Typography } from '@mui/material'
import { RegistryContext, TypedMessageRender } from '@masknet/typed-message-react'
import { registry } from './TypedMessageRender/registry.js'
import { useDecrypt } from './Decrypt/useDecrypt.js'

const PluginRender = lazy(() => import('./plugin-render.js'))

export function DecryptMessage(props: { text: string; version: string }) {
    const { text, version } = props
    const [error, isE2E, message] = useDecrypt(text, version)

    if (isE2E)
        return (
            <Typography sx={{ padding: 2 }}>
                This message is a e2e encrypted message. You can only decrypt this message when it is encrypted to you
                and decrypt it with Mask Network extension.
            </Typography>
        )
    if (error)
        return (
            <Typography sx={{ padding: 2 }}>
                We encountered an error when try to decrypt this message: <br />
                {error.message}
            </Typography>
        )
    if (!message) return <Typography sx={{ padding: 2 }}>Decrypting...</Typography>

    return (
        <RegistryContext.Provider value={registry.getTypedMessageRender}>
            <Box sx={{ px: 2 }}>
                <TypedMessageRender message={message} />
            </Box>

            <Suspense fallback={<Typography>Plugin is loading...</Typography>}>
                <PluginRender message={message} />
            </Suspense>
        </RegistryContext.Provider>
    )
}
