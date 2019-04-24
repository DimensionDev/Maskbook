import React from 'react'
import MuiAvatar, { AvatarProps } from '@material-ui/core/Avatar/Avatar'
import { Person } from '../../extension/background-script/PeopleService'
interface Props extends AvatarProps {
    person: Person
}
export function Avatar({ person, ...props }: Props) {
    const { avatar, nickname, username } = person
    const name = nickname || username || ''
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
