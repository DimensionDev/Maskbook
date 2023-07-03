import { makeStyles } from '@masknet/theme'
import { Stack, Typography, useTheme } from '@mui/material'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    value: {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
    },
}))

export interface PriceChangedProps {
    amount: number
}

export function PriceChanged(props: PriceChangedProps) {
    const { classes } = useStyles()
    const colors = useTheme().palette.maskColor
    const color = props.amount > 0 ? colors?.success : colors?.danger
    if (props.amount === 0) return null
    return (
        <Stack alignItems="center" direction="row">
            <Icons.ArrowDrop size={16} style={{ color, transform: props.amount > 0 ? 'rotate(180deg)' : '' }} />
            <Typography className={classes.value} color={color}>
                {props.amount.toFixed(2)}%
            </Typography>
        </Stack>
    )
}
