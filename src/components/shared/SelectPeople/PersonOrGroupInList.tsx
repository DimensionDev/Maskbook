import * as React from 'react'
import { Person, Group } from '../../../database'
import { ListItem, Theme, ListItemAvatar, ListItemText } from '@material-ui/core'
import { OverridableComponent } from '@material-ui/core/OverridableComponent'
import { makeStyles } from '@material-ui/styles'
import { Avatar } from '../../../utils/components/Avatar'
import MuiAvatar from '@material-ui/core/Avatar/Avatar'
import GroupIcon from '@material-ui/icons/Group'

interface SharedProps {
    onClick(): void
    disabled?: boolean
    showAtNetwork?: boolean
    listItemProps?: Partial<(typeof ListItem extends OverridableComponent<infer U> ? U : never)['props']>
}
interface GroupProps {
    type: 'group'
    item: Group
}
interface PersonProps {
    type: 'person'
    item: Person
}
const useStyle = makeStyles<Theme>(theme => ({
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
export function PersonOrGroupInList(props: SharedProps & (PersonProps | GroupProps)) {
    const classes = useStyle()

    const { disabled, listItemProps, onClick, showAtNetwork } = props
    let name = ''
    let avatar: ReturnType<typeof Avatar>
    let secondaryText: string | undefined = undefined
    if (props.type === 'group') {
        const group = props.item
        name = group.groupName
        avatar = (
            <MuiAvatar>
                <GroupIcon />
            </MuiAvatar>
        )
        secondaryText = `共 ${group.members.length} 人`
    } else {
        const person = props.item
        name = person.nickname || person.identifier.userId
        avatar = <Avatar person={person} />
        secondaryText = person.fingerprint ? person.fingerprint.toLowerCase() : undefined
    }
    const withNetwork = (
        <>
            {name}
            <span className={classes.networkHint}> @ {props.item.identifier.network}</span>
        </>
    )
    return (
        <ListItem button disabled={disabled} onClick={onClick} {...(listItemProps || {})}>
            <ListItemAvatar>{avatar}</ListItemAvatar>
            <ListItemText
                classes={{ primary: classes.overflow, secondary: classes.overflow }}
                primary={showAtNetwork ? withNetwork : name}
                secondary={secondaryText}
            />
        </ListItem>
    )
}
