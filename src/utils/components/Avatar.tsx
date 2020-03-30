import React from 'react'
import MuiAvatar, { AvatarProps } from '@material-ui/core/Avatar/Avatar'
import type { Profile } from '../../database'

export const mapContactAvatarColor = (string: string) => {
    const hash = [...string].reduce((prev, current) => {
        // eslint-disable-next-line no-bitwise
        const next = current.charCodeAt(0) + (prev << 5) - prev
        // eslint-disable-next-line no-bitwise
        return next & next
    }, 0)
    return `hsl(${hash % 360}, 98%, 70%)`
}

interface Props extends AvatarProps {
    person: Profile
}
export function Avatar({ person, ...props }: Props) {
    const { avatar, nickname, identifier } = person
    const name = nickname || identifier.userId || ''
    const [first, last] = name.split(' ')
    return (
        <MuiAvatar
            aria-label={name}
            src={avatar}
            style={{ backgroundColor: mapContactAvatarColor(identifier.toText()) }}
            {...props}>
            {first[0]}
            {(last || '')[0]}
        </MuiAvatar>
    )
}
