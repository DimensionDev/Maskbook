import { ListItem, ListItemText, Checkbox } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import { ChangeEvent, useCallback } from 'react'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'
import type { CheckboxProps } from '@material-ui/core/Checkbox'
import type { ListItemTypeMap } from '@material-ui/core/ListItem'
import type { UnlockLocks } from '../types'

const useStyle = makeStyles()({
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
})
export interface LockInListProps {
    item: UnlockLocks
    search?: string
    checked?: boolean
    disabled?: boolean
    onChange: (ev: ChangeEvent<HTMLInputElement>, checked: boolean) => void
    CheckboxProps?: Partial<CheckboxProps>
    ListItemProps?: Partial<DefaultComponentProps<ListItemTypeMap<{ button: true }, 'div'>>>
}

export function LockInList(props: LockInListProps) {
    const { classes } = useStyle()
    const lock = props.item
    const name = lock.lock.name
    const secondary = lock.lock.address
    const onClick = useCallback((ev) => props.onChange(ev, !props.checked), [props])

    return (
        <ListItem
            button
            onClick={onClick}
            disabled={props.disabled}
            {...props.ListItemProps}
            className={classNames(classes.root, props.ListItemProps?.className)}>
            <Checkbox checked={props.checked} color="primary" {...props.CheckboxProps} />
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
