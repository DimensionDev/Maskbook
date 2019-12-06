import { makeStyles, Theme, ListItem, ListItemText, Checkbox } from '@material-ui/core'
import { useStylesExtends } from '../../custom-ui-helper'
import { OverridableComponent } from '@material-ui/core/OverridableComponent'
import { Person } from '../../../database'
import { ChangeEvent } from 'react'

const useStyle = makeStyles((theme: Theme) => ({
    root: {},
}))

export interface ProfileInListProps extends withClasses<KeysInferFromUseStyles<typeof useStyle>> {
    item: Person
    checked?: boolean
    disabled?: boolean
    onChange: (ev: ChangeEvent<HTMLInputElement>, checked: boolean) => void
    onClick: () => void
    ListItemProps?: Partial<(typeof ListItem extends OverridableComponent<infer U> ? U : never)['props']>
}
export function ProfileInList(props: ProfileInListProps) {
    const classes = useStylesExtends(useStyle(), props)
    const person = props.item
    const name = person.nickname || person.identifier.userId
    const secondary = person.fingerprint ? person.fingerprint.toLowerCase() : undefined

    return (
        <ListItem
            className={classes.root}
            button
            disabled={props.disabled}
            onClick={props.onClick}
            {...props.ListItemProps}>
            <Checkbox checked={props.checked} onChange={props.onChange} />
            <ListItemText primary={name} secondary={secondary} />
        </ListItem>
    )
}
