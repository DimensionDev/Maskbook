import { ChangeEvent, useCallback } from 'react'
import classNames from 'classnames'
import { makeStyles, Theme, ListItem, ListItemText, Checkbox, ListItemAvatar } from '@material-ui/core'
import Highlighter from 'react-highlight-words'
import { useStylesExtends } from '../../custom-ui-helper'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'
import type { Profile } from '../../../database'
import { Avatar } from '../../../utils/components/Avatar'
import type { CheckboxProps } from '@material-ui/core/Checkbox'
import type { ListItemTypeMap } from '@material-ui/core/ListItem'

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
    hightlighted: {
        backgroundColor: 'inherit',
        color: 'inherit',
        fontWeight: 'bold',
    },
}))

export interface ProfileInListProps extends withClasses<never> {
    item: Profile
    search?: string
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
    const secondary = profile.linkedPersona?.fingerprint ? profile.linkedPersona?.fingerprint.toLowerCase() : ''
    const onClick = useCallback((ev) => props.onChange(ev, !props.checked), [props])
    return (
        <ListItem
            button
            onClick={onClick}
            disabled={props.disabled}
            {...props.ListItemProps}
            className={classNames(classes.root, props.ListItemProps?.className)}>
            <Checkbox checked={props.checked} color="primary" {...props.CheckboxProps} />
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
                        highlightClassName={classes.hightlighted}
                        searchWords={[props.search ?? '']}
                        autoEscape={true}
                        textToHighlight={name}
                    />
                }
                secondary={
                    <Highlighter
                        highlightClassName={classes.hightlighted}
                        searchWords={[props.search ?? '']}
                        autoEscape={true}
                        textToHighlight={secondary}
                    />
                }
            />
        </ListItem>
    )
}
