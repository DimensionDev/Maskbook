import { useCallback } from 'react'
import classNames from 'classnames'
import { ListItemText, Checkbox, ListItemAvatar } from '@mui/material'
import ListItemButton from '@mui/material/ListItemButton'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import Highlighter from 'react-highlight-words'
import type { DefaultComponentProps } from '@mui/material/OverridableComponent'
import type { ProfileInformation as Profile } from '@masknet/shared-base'
import { Avatar } from '../../../utils/components/Avatar'
import type { CheckboxProps } from '@mui/material/Checkbox'
import type { ListItemTypeMap } from '@mui/material/ListItem'

const useStyle = makeStyles()({
    root: {
        maxWidth: 'calc(50% - 6px)',
        cursor: 'pointer',
        paddingLeft: 8,
    },
    overflow: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    highlighted: {
        backgroundColor: 'inherit',
        color: 'inherit',
        fontWeight: 'bold',
    },
})

export interface ProfileInListProps extends withClasses<never> {
    item: Profile
    search?: string
    checked?: boolean
    disabled?: boolean
    onChange: (ev: React.MouseEvent<HTMLDivElement>, checked: boolean) => void
    CheckboxProps?: Partial<CheckboxProps>
    ListItemProps?: Partial<DefaultComponentProps<ListItemTypeMap<{ button: true }, 'div'>>>
}
export function ProfileInList(props: ProfileInListProps) {
    const classes = useStylesExtends(useStyle(), props)
    const profile = props.item
    const name = profile.nickname || profile.identifier.userId
    const secondary = profile.fingerprint?.toLowerCase()
    const onClick = useCallback((ev: React.MouseEvent<HTMLDivElement>) => props.onChange(ev, !props.checked), [props])
    return (
        <ListItemButton
            onClick={onClick}
            disabled={props.disabled}
            {...props.ListItemProps}
            className={classNames(classes.root, props.ListItemProps?.className)}>
            <ListItemAvatar>
                <Avatar person={profile} />
            </ListItemAvatar>
            <ListItemText
                classes={{
                    primary: classes.overflow,
                    secondary: classes.overflow,
                }}
                primary={
                    <Highlighter
                        highlightClassName={classes.highlighted}
                        searchWords={[props.search ?? '']}
                        autoEscape
                        textToHighlight={name}
                    />
                }
                secondary={
                    <Highlighter
                        highlightClassName={classes.highlighted}
                        searchWords={[props.search ?? '']}
                        autoEscape
                        textToHighlight={secondary || ''}
                    />
                }
            />
            <Checkbox checked={!!props.checked} color="primary" {...props.CheckboxProps} />
        </ListItemButton>
    )
}
