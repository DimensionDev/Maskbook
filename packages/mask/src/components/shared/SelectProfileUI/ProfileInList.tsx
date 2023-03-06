import { memo } from 'react'
import { ListItemAvatar, ListItemText, ListItemButton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { DefaultComponentProps } from '@mui/material/OverridableComponent.js'
import type { ListItemTypeMap } from '@mui/material/ListItem'
import { Avatar } from '../../../utils/index.js'
import type { ProfileInformation as Profile } from '@masknet/web3-shared-base'

export interface ProfileInListProps {
    item: Profile
    disabled?: boolean
    onClick?: () => void
    ListItemProps?: Partial<
        DefaultComponentProps<
            ListItemTypeMap<
                {
                    button: true
                },
                'div'
            >
        >
    >
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
                secondary={props.item.linkedPersona?.rawPublicKey?.toLowerCase()}
            />
        </ListItemButton>
    )
})
