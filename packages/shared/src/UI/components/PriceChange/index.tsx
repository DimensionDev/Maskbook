import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Skeleton, Stack, Typography, type StackProps } from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles()((theme) => ({
    value: {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
    },
}))

export interface PriceChangeProps extends StackProps {
    change: number
    loading?: boolean
}

export const PriceChange = memo(function PriceChange({ change, loading, ...rest }: PriceChangeProps) {
    const { classes, theme } = useStyles()
    const colors = theme.palette.maskColor
    if (loading)
        return (
            <Stack alignItems="center" justifyContent="center" direction="row" {...rest}>
                <Skeleton width={30} height={16} />
            </Stack>
        )
    if (change === 0) return null

    const color = change > 0 ? colors.success : colors.danger

    return (
        <Stack alignItems="center" justifyContent="center" direction="row" {...rest}>
            <Icons.ArrowDrop size={16} style={{ color, transform: change > 0 ? 'rotate(180deg)' : '' }} />
            <Typography className={classes.value} color={color}>
                {change.toFixed(2)}%
            </Typography>
        </Stack>
    )
})
