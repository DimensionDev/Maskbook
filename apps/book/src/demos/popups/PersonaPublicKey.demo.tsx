import { Stack } from '@mui/material'
import { PersonaPublicKey } from '@masknet/injected-ui/PersonaPublicKey'

export const meta = {
    title: 'PersonaPublicKey',
    description:
        "A persona's public key fingerprint with a copy button (packages/injected-ui/src/PersonaPublicKey.tsx).",
}

export default function PersonaPublicKeyDemo() {
    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <PersonaPublicKey
                rawPublicKey="0x0401e6c6a68a15a2f3f2b4d5c6e7f809abcdef0123456789abcdef0123456789"
                publicHexString="0401e6c6a68a15a2f3f2b4d5c6e7f809abcdef0123456789abcdef0123456789"
                iconSize={16}
            />
        </Stack>
    )
}
