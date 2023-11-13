import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Skeleton, Box, Typography, type BoxProps } from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles()((theme) => ({
    container: {
        fontSize: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    value: {
        lineHeight: '16px',
        fontWeight: 700,
    },
}))

export interface PriceChangeProps extends BoxProps {
    change: number
    loading?: boolean
}

export const PriceChange = memo(function PriceChange({ change, loading, ...rest }: PriceChangeProps) {
    const { classes, theme, cx } = useStyles()
    const colors = theme.palette.maskColor
    if (loading)
        return (
            <Box {...rest} className={cx(classes.container, rest.className)}>
                <Skeleton width={30} height={16} />
            </Box>
        )

    const color = change > 0 ? colors.success : colors.danger

    return (
        <Box {...rest} className={cx(classes.container, rest.className)}>
            {change ?
                <Icons.ArrowDrop size={16} style={{ color, transform: change > 0 ? 'rotate(180deg)' : '' }} />
            :   null}
            <Typography className={classes.value} color={color}>
                {change ? `${change.toFixed(2)}%` : '--'}
            </Typography>
        </Box>
    )
})
