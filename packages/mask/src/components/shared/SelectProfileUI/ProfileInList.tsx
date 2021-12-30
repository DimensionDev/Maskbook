import { memo } from 'react'
import { ListItemAvatar, ListItemText } from '@mui/material'
import ListItemButton from '@mui/material/ListItemButton'
import { makeStyles } from '@masknet/theme'
import type { DefaultComponentProps } from '@mui/material/OverridableComponent'
import type { ListItemTypeMap } from '@mui/material/ListItem'
import { Avatar } from '../../../utils'
import type { Profile } from '../../../database'

export interface ProfileInListProps {
    item: Profile
    disabled?: boolean
    onClick?: () => void
    ListItemProps?: Partial<DefaultComponentProps<ListItemTypeMap<{ button: true }, 'div'>>>
}
const useStyle = makeStyles()((theme) => ({
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
export const ProfileInList = memo<ProfileInListProps>((props) => {
    const { classes } = useStyle()
    const { disabled, ListItemProps: listItemProps, onClick } = props
    const name = props.item.nickname || props.item.identifier.userId

    return (
        <ListItemButton disabled={disabled} onClick={onClick} {...listItemProps}>
            <ListItemAvatar>
                <Avatar person={props.item} />
            </ListItemAvatar>
            <ListItemText
                classes={{
                    root: classes.root,
                    primary: classes.overflow,
                    secondary: classes.overflow,
                }}
                primary={name}
                secondary={props.item.linkedPersona?.fingerprint.toLowerCase()}
            />
        </ListItemButton>
    )
})
