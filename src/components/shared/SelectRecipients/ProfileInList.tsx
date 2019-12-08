import { makeStyles, Theme, ListItem, ListItemText, Checkbox, ListItemAvatar } from '@material-ui/core'
import { useStylesExtends } from '../../custom-ui-helper'
import { OverridableComponent } from '@material-ui/core/OverridableComponent'
import { Person } from '../../../database'
import { ChangeEvent, useCallback } from 'react'
import { Avatar } from '../../../utils/components/Avatar'

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        paddingLeft: 8,
    },
    overflow: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
}))

export interface ProfileInListProps extends withClasses<KeysInferFromUseStyles<typeof useStyle>> {
    item: Person
    checked?: boolean
    disabled?: boolean
    onChange: (ev: ChangeEvent<HTMLInputElement>, checked: boolean) => void
    CheckboxProps?: Partial<(typeof Checkbox extends OverridableComponent<infer U> ? U : never)['props']>
    ListItemProps?: Partial<(typeof ListItem extends OverridableComponent<infer U> ? U : never)['props']>
}
export function ProfileInList(props: ProfileInListProps) {
    const classes = useStylesExtends(useStyle(), props)
    const person = props.item
    const name = person.nickname || person.identifier.userId
    const secondary = person.fingerprint ? person.fingerprint.toLowerCase() : undefined
    const onClick = useCallback(ev => props.onChange(ev, !props.checked), [props])

    return (
        <ListItem className={classes.root} button disabled={props.disabled} onClick={onClick} {...props.ListItemProps}>
            <Checkbox checked={props.checked} color="primary" {...props.CheckboxProps} />
            <ListItemAvatar>
                <Avatar person={person} />
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
