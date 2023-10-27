import { generateContactAvatarColor, calculateHash } from '@masknet/shared-base'
import { isZeroAddress } from '@masknet/web3-shared-evm'
import { Avatar as MuiAvatar, alpha, useTheme, type AvatarProps } from '@mui/material'
import { useMemo } from 'react'
import { EMOJI_LIST } from './constants.js'

interface Props extends AvatarProps {
    value: string
}

export function EmojiAvatar({ value, ...props }: Props) {
    const theme = useTheme()

    const { emoji, backgroundColor } = useMemo(() => {
        if (isZeroAddress(value) || !value) {
            return { emoji: '🐼', backgroundColor: alpha('#627EEA', 0.2) }
        }
        const hash = calculateHash(value)
        return {
            emoji: EMOJI_LIST[hash % EMOJI_LIST.length],
            backgroundColor: generateContactAvatarColor(value, theme.palette.mode),
        }
    }, [value, theme.palette.mode])

    return (
        <MuiAvatar
            style={{
                backgroundColor,
            }}
            {...props}>
            {emoji}
        </MuiAvatar>
    )
}
