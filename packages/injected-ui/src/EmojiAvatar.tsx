import { generateContactAvatarColor, calculateHash } from '@masknet/shared-base'
import { Avatar as MuiAvatar, type AvatarProps } from '@mui/material'
import { useMemo } from 'react'
import { usePalette } from '@masknet/theme'
import { EMOJI_LIST } from './EmojiAvatar.constants.js'

export interface EmojiAvatarProps extends AvatarProps {
    value: string
    size?: number
}

/** A deterministic emoji-on-color avatar generated from an identifier (e.g. a persona's public key). */
export function EmojiAvatar({ value, size, ...props }: EmojiAvatarProps) {
    const palette = usePalette()

    const { emoji, backgroundColor } = useMemo(() => {
        if (!value || value.toLowerCase() === '0x0000000000000000000000000000000000000000') {
            return { emoji: '🐼', backgroundColor: 'rgba(98, 126, 234, 0.2)' }
        }
        const hash = calculateHash(value)
        return {
            emoji: EMOJI_LIST[hash % EMOJI_LIST.length],
            backgroundColor: generateContactAvatarColor(value, palette),
        }
    }, [value, palette])

    return (
        <MuiAvatar
            sx={{
                backgroundColor,
                height: size,
                width: size,
            }}
            {...props}>
            {emoji}
        </MuiAvatar>
    )
}
