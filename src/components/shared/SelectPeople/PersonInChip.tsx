import * as React from 'react'
import { Avatar } from '../../../utils/components/Avatar'
import { Chip } from '@material-ui/core'
import { Person } from '../../../database'
interface PersonInChipProps {
    person: Person
    onDelete?(): void
    disabled?: boolean
}
export function PersonInChip({ disabled, onDelete, person }: PersonInChipProps) {
    const avatar = person.avatar ? <Avatar person={person} /> : undefined
    return (
        <Chip
            style={{ marginRight: 6, marginBottom: 6 }}
            color="primary"
            onDelete={disabled ? undefined : onDelete}
            label={person.nickname || person.identifier.userId}
            avatar={avatar}
        />
    )
}
