import * as React from 'react'
import { Person } from '../../../database'
import { ListItem, Theme, ListItemAvatar, ListItemText } from '@material-ui/core'
import { OverridableComponent } from '@material-ui/core/OverridableComponent'
import { makeStyles } from '@material-ui/styles'
import { Avatar } from '../../../utils/components/Avatar'

interface PeopleInListProps {
    person: Person
    onClick(): void
    disabled?: boolean
    showAtNetwork?: boolean
    listItemProps?: Partial<(typeof ListItem extends OverridableComponent<infer U> ? U : never)['props']>
}
const usePeopleInListStyle = makeStyles<Theme>(theme => ({
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
export function PersonInList({ person, onClick, disabled, showAtNetwork, listItemProps }: PeopleInListProps) {
    const classes = usePeopleInListStyle()
    const name = person.nickname || person.identifier.userId
    const withNetwork = (
        <>
            {name}
            <span className={classes.networkHint}> @ {person.identifier.network}</span>
        </>
    )
    return (
        <ListItem button disabled={disabled} onClick={onClick} {...(listItemProps || {})}>
            <ListItemAvatar>
                <Avatar person={person} />
            </ListItemAvatar>
            <ListItemText
                classes={{ primary: classes.overflow, secondary: classes.overflow }}
                primary={showAtNetwork ? withNetwork : name}
                secondary={person.fingerprint ? person.fingerprint.toLowerCase() : undefined}
            />
        </ListItem>
    )
}
