import { useMemo } from 'react'
import { ListItem, Theme, ListItemAvatar, ListItemText } from '@material-ui/core'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'
import type { ListItemTypeMap } from '@material-ui/core/ListItem'
import { makeStyles } from '@material-ui/core/styles'
import MuiAvatar from '@material-ui/core/Avatar/Avatar'
import GroupIcon from '@material-ui/icons/Group'
import { Avatar, useI18N, useIntlListFormat } from '../../../utils'
import { useFriendsList } from '../../DataSource/useActivatedUI'
import type { Profile, Group } from '../../../database'
import type { ProfileIdentifier } from '../../../database/type'
import { isGroup } from './SelectPeopleAndGroupsUI'
import { useResolveSpecialGroupName } from './resolveSpecialGroupName'
import { useStylesExtends } from '../../custom-ui-helper'

export interface ProfileOrGroupInListProps extends withClasses<never> {
    item: Group | Profile
    disabled?: boolean
    showAtNetwork?: boolean
    onClick?: () => void
    ListItemProps?: Partial<DefaultComponentProps<ListItemTypeMap<{ button: true }, 'div'>>>
}
const useStyle = makeStyles((theme: Theme) => ({
    // ? I want to let the children of this element have no change to
    // ? extends the width of the parent element.
    // ? Only `grid` or `inline-grid` works. but why??
    root: { display: 'inline-grid' },
    overflow: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    networkHint: {
        color: theme.palette.grey[500],
    },
}))
/**
 * Item in the list
 */
export function ProfileOrGroupInList(props: ProfileOrGroupInListProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyle(), props)
    const nicknamePreviewsForGroup = useNickNamesFromList(isGroup(props.item) ? props.item.members : [])
    const listFormat = useIntlListFormat()

    const { disabled, ListItemProps: listItemProps, onClick, showAtNetwork } = props
    let name = ''
    let avatar: ReturnType<typeof Avatar>
    let secondaryText: string | undefined = undefined
    const groupName = useResolveSpecialGroupName(props.item)
    if (isGroup(props.item)) {
        const group = props.item
        name = groupName
        avatar = (
            <MuiAvatar>
                <GroupIcon />
            </MuiAvatar>
        )
        const joined = listFormat(nicknamePreviewsForGroup)
        const groupSize = group.members.length
        const data = { people: joined, count: groupSize }
        if (groupSize === 0) {
            secondaryText = t('person_or_group_in_list_0')
        } else if (nicknamePreviewsForGroup.length === 0) {
            secondaryText = t('person_or_group_in_list_many_no_preview', data)
        } else if (groupSize > nicknamePreviewsForGroup.length) {
            secondaryText = t('person_or_group_in_list_many', data)
        } else {
            secondaryText = joined
        }
    } else {
        const person = props.item
        name = person.nickname || person.identifier.userId
        avatar = <Avatar person={person} />
        secondaryText = person.linkedPersona?.fingerprint.toLowerCase()
    }
    const withNetwork = (
        <>
            {name}
            <span className={classes.networkHint}> @ {props.item.identifier.network}</span>
        </>
    )
    return (
        <ListItem button disabled={disabled} onClick={onClick} {...listItemProps}>
            <ListItemAvatar>{avatar}</ListItemAvatar>
            <ListItemText
                classes={{
                    root: classes.root,
                    primary: classes.overflow,
                    secondary: classes.overflow,
                }}
                primary={showAtNetwork ? withNetwork : name}
                secondary={secondaryText}
            />
        </ListItem>
    )
}

function useNickNamesFromList(preview: readonly ProfileIdentifier[]) {
    const profile = useFriendsList()
    const userWithNames = useMemo(() => profile.filter((x) => x.nickname), [profile])

    const [x, y, z] = preview
    const [a] = useMemo(() => x && userWithNames.filter((w) => w.identifier.equals(x)), [userWithNames, x]) || []
    const [b] = useMemo(() => y && userWithNames.filter((w) => w.identifier.equals(y)), [userWithNames, y]) || []
    const [c] = useMemo(() => z && userWithNames.filter((w) => w.identifier.equals(z)), [userWithNames, z]) || []
    return useMemo(() => [a, b, c].filter((x) => x).map((x) => x.nickname!), [a, b, c])
}
