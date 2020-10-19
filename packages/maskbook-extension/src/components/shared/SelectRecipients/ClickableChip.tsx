import * as React from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'
import Chip, { ChipProps } from '@material-ui/core/Chip'

export interface ClickableChipProps {
    checked?: boolean
    ChipProps?: ChipProps & {
        'data-testid'?: string
    }
}

const useStyles = makeStyles({
    root: {
        marginRight: 6,
        marginBottom: 6,
        cursor: 'pointer',
    },
    icon: {
        backgroundColor: 'transparent !important',
    },
    label: {
        display: 'flex',
    },
})

export function ClickableChip(props: ClickableChipProps) {
    const classes = useStyles()
    return (
        <Chip
            avatar={props.checked ? <DoneIcon className={classes.icon} /> : undefined}
            color={props.checked ? 'primary' : 'default'}
            {...props.ChipProps}
            classes={classes}
            className={props.ChipProps?.className}
        />
    )
}
