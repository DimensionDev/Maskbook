import * as React from 'react'
import classNames from 'classnames'
import Chip, { ChipProps } from '@material-ui/core/Chip'
import { Group } from '../../../database'
import DoneIcon from '@material-ui/icons/Done'
import { useResolveSpecialGroupName } from '../SelectPeopleAndGroups/resolveSpecialGroupName'
import { makeStyles } from '@material-ui/styles'
import { useCallback, ChangeEvent } from 'react'

export interface GroupInChipProps {
    item: Group
    checked?: boolean
    disabled?: boolean
    onChange?(ev: ChangeEvent<HTMLInputElement>, checked: boolean): void
    ChipProps?: ChipProps
}

const useStyles = makeStyles({
    root: {
        marginRight: 6,
        marginBottom: 6,
        cursor: 'pointer',
    },
    icon: {
        backgroundColor: 'transparent',
    },
})

export function GroupInChip(props: GroupInChipProps) {
    const classes = useStyles()
    const onClick = useCallback(
        ev => {
            if (props.onChange) {
                props.onChange(ev, !props.checked)
            }
        },
        [props],
    )

    return (
        <Chip
            avatar={props.checked ? <DoneIcon className={classes.icon} /> : undefined}
            color={props.checked ? 'primary' : 'default'}
            disabled={props.disabled ?? false}
            onClick={onClick}
            label={useResolveSpecialGroupName(props.item)}
            {...props.ChipProps}
            className={classNames(classes.root, props.ChipProps?.className)}
        />
    )
}
