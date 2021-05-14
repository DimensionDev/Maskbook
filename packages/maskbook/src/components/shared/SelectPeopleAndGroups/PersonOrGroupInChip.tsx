import MuiAvatar from '@material-ui/core/Avatar/Avatar'
import { Chip } from '@material-ui/core'
import type { ChipProps } from '@material-ui/core/Chip'
import { Avatar, useI18N } from '../../../utils'
import type { Profile, Group } from '../../../database'
import { isGroup, isPerson } from './SelectPeopleAndGroupsUI'
import { useResolveSpecialGroupName } from './resolveSpecialGroupName'

export interface ProfileOrGroupInChipProps {
    onDelete?(): void
    disabled?: boolean
    item: Profile | Group
    ChipProps?: ChipProps
}
export function ProfileOrGroupInChip(props: ProfileOrGroupInChipProps) {
    const { disabled, onDelete } = props
    const { t } = useI18N()
    let avatar: ReturnType<typeof Avatar> | undefined = undefined
    let displayName = ''
    const groupName = useResolveSpecialGroupName(props.item)
    if (isGroup(props.item)) {
        const group = props.item
        displayName = t('person_or_group_in_chip', { name: groupName, count: group.members.length })
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
            {...props.ChipProps}
        />
    )
}
