import MuiAvatar, { AvatarProps } from '@mui/material/Avatar/Avatar'
import { ProfileInformation as Profile, generateContactAvatarColor } from '@masknet/shared-base'
import { useTheme } from '@mui/material'

interface Props extends AvatarProps {
    person: Profile
}

export function Avatar({ person, ...props }: Props) {
    const { avatar, nickname, identifier } = person
    const name = identifier.userId || nickname || ''
    const [first, last] = name.split(' ')
    const theme = useTheme().palette.mode
    return (
        <MuiAvatar
            aria-label={name}
            src={avatar}
            style={{ backgroundColor: generateContactAvatarColor(identifier.toText(), theme) }}
            {...props}>
            {first[0]}
            {(last || '')[0]}
        </MuiAvatar>
    )
}
