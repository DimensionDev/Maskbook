import { generateContactAvatarColor } from '@masknet/shared-base'
import { useTheme, Avatar as MuiAvatar, type AvatarProps, alpha } from '@mui/material'
import { EMOJI_LIST } from './constants.js'
import { useMemo } from 'react'
import { isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'

interface Props extends AvatarProps {
    address: string
}

export function EmojiAvatar({ address, ...props }: Props) {
    const theme = useTheme()

    const defaultEmojiSetting = useMemo(() => {
        if (!isValidAddress(address) || isZeroAddress(address)) {
            // hard code color.
            return { emoji: '\u{1F43C}', backgroundColor: alpha('#627EEA', 0.2) }
        }
        return undefined
    }, [address])

    const emoji = useMemo(() => {
        return EMOJI_LIST[Number.parseInt(address.slice(0, 6), 16) % EMOJI_LIST.length]
    }, [address])

    return (
        <MuiAvatar
            style={{
                backgroundColor:
                    defaultEmojiSetting?.backgroundColor ?? generateContactAvatarColor(address, theme.palette.mode),
            }}
            {...props}>
            {defaultEmojiSetting?.emoji ?? emoji}
        </MuiAvatar>
    )
}
