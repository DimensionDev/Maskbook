import * as React from 'react'
import className from 'classnames'
import { makeStyles, Theme, ListItem, ListItemText, Checkbox, ListItemAvatar } from '@material-ui/core'
import { useStylesExtends } from '../../custom-ui-helper'
import { DefaultComponentProps } from '@material-ui/core/OverridableComponent'
import { Profile } from '../../../database'
import { ChangeEvent, useCallback } from 'react'
import { Avatar } from '../../../utils/components/Avatar'
import { CheckboxProps } from '@material-ui/core/Checkbox'
import { ListItemTypeMap } from '@material-ui/core/ListItem'

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        cursor: 'pointer',
        paddingLeft: 8,
    },
    overflow: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
}))

export interface ProfileInListProps extends withClasses<KeysInferFromUseStyles<typeof useStyle>> {
    item: Profile
    checked?: boolean
    disabled?: boolean
    onChange: (ev: ChangeEvent<HTMLInputElement>, checked: boolean) => void
    CheckboxProps?: Partial<CheckboxProps>
    ListItemProps?: Partial<DefaultComponentProps<ListItemTypeMap<{ button: true }, 'div'>>>
}
export function ProfileInList(props: ProfileInListProps) {
    const classes = useStylesExtends(useStyle(), props)
    const profile = props.item
    const name = profile.nickname || profile.identifier.userId
    const secondary = profile.linkedPersona?.fingerprint ? profile.linkedPersona?.fingerprint.toLowerCase() : undefined
    const onClick = useCallback((ev) => props.onChange(ev, !props.checked), [props])

    return (
        <ListItem
            button
            onClick={onClick}
            disabled={props.disabled}
            {...props.ListItemProps}
            className={className(classes.root, props.ListItemProps?.className)}>
            <Checkbox checked={props.checked} color="primary" {...props.CheckboxProps} />
            <ListItemAvatar>
                <Avatar person={profile} />
            </ListItemAvatar>
            <ListItemText
                classes={{
                    primary: classes.overflow,
                    secondary: classes.overflow,
                }}
                primary={name}
                secondary={secondary}
            />
        </ListItem>
    )
}
