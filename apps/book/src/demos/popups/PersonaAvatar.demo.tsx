import { Stack } from '@mui/material'
import { PersonaAvatar } from '@masknet/injected-ui/PersonaAvatar'

export const meta = {
    title: 'PersonaAvatar',
    description:
        "A persona's avatar: the uploaded image if set, otherwise an EmojiAvatar fallback generated from the persona's public key (packages/injected-ui/src/PersonaAvatar.tsx).",
}

const SAMPLE_AVATAR =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="#1c68f3"/></svg>',
    )

export default function PersonaAvatarDemo() {
    return (
        <Stack direction="row" spacing={2}>
            <PersonaAvatar pubkey="0x1234567890abcdef" size={48} />
            <PersonaAvatar pubkey="0x1234567890abcdef" avatar={SAMPLE_AVATAR} size={48} />
        </Stack>
    )
}
