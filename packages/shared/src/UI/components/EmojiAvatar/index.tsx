import { generateContactAvatarColor, calculateHash } from '@masknet/shared-base'
import { isZeroAddress } from '@masknet/web3-shared-evm'
import { Avatar as MuiAvatar, type AvatarProps } from '@mui/material'
import { useMemo } from 'react'
import { EMOJI_LIST } from './constants.js'
import { usePalette } from '@masknet/theme'

interface Props extends AvatarProps {
    value: string
    size?: number
}

export function EmojiAvatar({ value, size, ...props }: Props) {
    const palette = usePalette()

    const { emoji, backgroundColor } = useMemo(() => {
        if (isZeroAddress(value) || !value) {
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
