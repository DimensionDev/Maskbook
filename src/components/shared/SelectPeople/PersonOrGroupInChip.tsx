import * as React from 'react'
import { Avatar } from '../../../utils/components/Avatar'
import MuiAvatar from '@material-ui/core/Avatar/Avatar'
import { Chip } from '@material-ui/core'
import { Person, Group } from '../../../database'

interface SharedProps {
    onDelete?(): void
    disabled?: boolean
}
interface PersonChipProps {
    type: 'person'
    item: Person
}
interface GroupChipProps {
    type: 'group'
    item: Group
}
export function PersonOrGroupInChip(props: SharedProps & (PersonChipProps | GroupChipProps)) {
    const { disabled, onDelete } = props
    let avatar: ReturnType<typeof Avatar> | undefined = undefined
    let displayName = ''
    if (props.type === 'group') {
        const group = props.item
        displayName = group.groupName
        avatar = group.avatar ? <MuiAvatar aria-label={displayName} src={avatar} /> : undefined
    } else {
        const person = props.item
        displayName = person.nickname || person.identifier.userId
        avatar = person.avatar ? <Avatar person={person} /> : undefined
    }

    return (
        <Chip
            style={{ marginRight: 6, marginBottom: 6 }}
            color="primary"
            onDelete={disabled ? undefined : onDelete}
            label={displayName}
            avatar={avatar}
        />
    )
}
