import MuiAvatar, { AvatarProps } from '@mui/material/Avatar/Avatar'
import type { Profile } from '../../database'
import { useTheme } from '@mui/material'

export const mapContactAvatarColor = (string: string, theme: 'light' | 'dark') => {
    const hash = [...string].reduce((prev, current) => {
        // eslint-disable-next-line no-bitwise
        const next = current.charCodeAt(0) + (prev << 5) - prev
        // eslint-disable-next-line no-bitwise
        return next & next
    }, 0)
    return `hsl(${hash % 360}, ${theme === 'dark' ? `78%` : '98%'}, ${theme === 'dark' ? `50%` : '70%'})`
}

interface Props extends AvatarProps {
    person: Profile
}
export function Avatar({ person, ...props }: Props) {
    const { avatar, nickname, identifier } = person
    const name = nickname || identifier.userId || ''
    const [first, last] = name.split(' ')
    const theme = useTheme().palette.mode
    return (
        <MuiAvatar
            aria-label={name}
            src={avatar}
            style={{ backgroundColor: mapContactAvatarColor(identifier.toText(), theme) }}
            {...props}>
            {first[0]}
            {(last || '')[0]}
        </MuiAvatar>
    )
}
