import * as React from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core'
import Chip, { ChipProps } from '@material-ui/core/Chip'

export interface ClickableChipProps {
    ChipProps?: ChipProps
}

const useStyles = makeStyles({
    root: {
        marginRight: 6,
        marginBottom: 6,
        cursor: 'pointer',
    },
})

export function ClickableChip(props: ClickableChipProps) {
    const classes = useStyles()
    return <Chip {...props.ChipProps} className={classNames(classes.root, props.ChipProps?.className)} />
}
