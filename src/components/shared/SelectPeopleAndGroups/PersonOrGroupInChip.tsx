import * as React from 'react'
import { Avatar } from '../../../utils/components/Avatar'
import MuiAvatar from '@material-ui/core/Avatar/Avatar'
import { Chip } from '@material-ui/core'
import { Person, Group } from '../../../database'
import { geti18nString } from '../../../utils/i18n'
import { isGroup, isPerson } from './SelectPeopleAndGroupsUI'

interface Props {
    onDelete?(): void
    disabled?: boolean
    item: Person | Group
}
export function PersonOrGroupInChip(props: Props) {
    const { disabled, onDelete } = props
    let avatar: ReturnType<typeof Avatar> | undefined = undefined
    let displayName = ''
    if (isGroup(props.item)) {
        const group = props.item
        displayName = geti18nString('person_or_group_in_chip', [group.groupName, group.members.length + ''])
        avatar = group.avatar ? <MuiAvatar aria-label={displayName} src={avatar} /> : undefined
    } else {
        const person = props.item
        displayName = person.nickname || person.identifier.userId
        avatar = person.avatar ? <Avatar person={person} /> : undefined
    }

    return (
        <Chip
            style={{ marginRight: 6, marginBottom: 6 }}
            color={isPerson(props.item) ? 'primary' : 'secondary'}
            onDelete={disabled ? undefined : onDelete}
            label={displayName}
            avatar={avatar}
        />
    )
}
