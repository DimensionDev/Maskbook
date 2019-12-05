import React from 'react'
import MuiAvatar, { AvatarProps } from '@material-ui/core/Avatar/Avatar'
import { Profile } from '../../database'
interface Props extends AvatarProps {
    person: Profile
}
export function Avatar({ person, ...props }: Props) {
    const { avatar, nickname, identifier } = person
    const name = nickname || identifier.userId || ''
    const [first, last] = name.split(' ')
    return avatar ? (
        <MuiAvatar aria-label={name} src={avatar} {...props} />
    ) : (
        <MuiAvatar aria-label={name} {...props}>
            {first[0]}
            {(last || '')[0]}
        </MuiAvatar>
    )
}
