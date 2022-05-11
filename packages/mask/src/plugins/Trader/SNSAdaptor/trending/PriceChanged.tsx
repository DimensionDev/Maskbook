import { makeStyles } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { ArrowDropIcon } from '@masknet/icons'

const useStyles = makeStyles()({
    root: {
        fontSize: 'inherit',
        position: 'relative',
    },
    icon: {
        top: 0,
        bottom: 0,
        margin: 'auto',
        position: 'absolute',
        verticalAlign: 'middle',
    },
    value: {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
    },
})

export interface PriceChangedProps {
    amount: number
}

export function PriceChanged(props: PriceChangedProps) {
    const { classes } = useStyles()
    if (props.amount === 0) return null
    return (
        <Stack alignItems="center" direction="row">
            {props.amount > 0 ? <ArrowDropIcon style={{ transform: 'rotate(180deg)' }} /> : null}
            {props.amount < 0 ? <ArrowDropIcon /> : null}
            <Typography className={classes.value}>{props.amount.toFixed(2)}%</Typography>
        </Stack>
    )
}
