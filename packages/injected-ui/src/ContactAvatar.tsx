import { generateContactAvatarColor, type ProfileInformation as Profile } from '@masknet/shared-base'
import { useTheme, Avatar as MuiAvatar, type AvatarProps } from '@mui/material'

export interface ContactAvatarProps extends AvatarProps {
    person: Profile
}

/** A contact's avatar bubble, falling back to their initials on a generated color when there's no image. */
export function ContactAvatar({ person, ...props }: ContactAvatarProps) {
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
