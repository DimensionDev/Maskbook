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
    const { item, checked, onChange } = props
    const onClick = useCallback(
        ev => {
            if (onChange) {
                onChange(ev, !checked)
            }
        },
        [checked, onChange],
    )

    return (
        <Chip
            className={classes.root}
            avatar={checked ? <DoneIcon className={classes.icon} /> : undefined}
            color={checked ? 'primary' : 'default'}
            onClick={onClick}
            label={useResolveSpecialGroupName(item)}
            {...props.ChipProps}
        />
    )
}
