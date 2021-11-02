import { ListItem, ListItemText, Checkbox } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import { ChangeEvent, useCallback } from 'react'
import type { DefaultComponentProps } from '@mui/material/OverridableComponent'
import type { CheckboxProps } from '@mui/material/Checkbox'
import type { ListItemTypeMap } from '@mui/material/ListItem'
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
    highlighted: {
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
