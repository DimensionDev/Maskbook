import * as React from 'react'
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

    return <Chip className={classes.root} {...props.ChipProps} />
}
