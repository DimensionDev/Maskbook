import { type ProfileInformation as Profile, generateContactAvatarColor } from '@masknet/shared-base'
import { useTheme, Avatar as MuiAvatar, type AvatarProps } from '@mui/material'
import { EMOJI_LIST } from './constants.js'

interface Props extends AvatarProps {
    address: string
}

export function EmojiAvatar({ address, ...props }: Props) {
    const theme = useTheme()

    return (
        <MuiAvatar style={{ backgroundColor: generateContactAvatarColor(address, theme.palette.mode) }} {...props}>
            {EMOJI_LIST[Number.parseInt(address.slice(0, 6), 16) % EMOJI_LIST.length]}
        </MuiAvatar>
    )
}
