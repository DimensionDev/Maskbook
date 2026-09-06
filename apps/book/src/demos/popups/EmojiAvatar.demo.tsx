import { Stack } from '@mui/material'
import { EmojiAvatar } from '@masknet/injected-ui/EmojiAvatar'

export const meta = {
    title: 'EmojiAvatar',
    description:
        'A deterministic emoji-on-color avatar generated from an identifier, used as the fallback persona/wallet avatar when there is no uploaded image (packages/injected-ui/src/EmojiAvatar.tsx).',
}

export default function EmojiAvatarDemo() {
    return (
        <Stack direction="row" spacing={2}>
            <EmojiAvatar value="0x1234567890abcdef" size={48} />
            <EmojiAvatar value="some-other-pubkey" size={48} />
            <EmojiAvatar value="0x0000000000000000000000000000000000000000" size={48} />
        </Stack>
    )
}
