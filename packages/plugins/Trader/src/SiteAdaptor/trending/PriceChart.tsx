import { useRef, type HTMLProps } from 'react'
import { Box, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { openWindow } from '@masknet/shared-base-ui'
import { EmptyStatus, LoadingStatus, useDimension, usePriceLineChart, type Dimension } from '@masknet/shared'
import type { Coin, Currency, Stat } from '../../types/index.js'

const DEFAULT_DIMENSION: Dimension = {
    top: 32,
    right: 16,
    bottom: 32,
    left: 16,
    width: 566,
    height: 190,
}

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            position: 'relative',
        },
        chart: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        svg: {
            display: 'block',
        },
        placeholder: {
            paddingTop: theme.spacing(10),
            paddingBottom: theme.spacing(10),
            borderStyle: 'none',
        },
    }
})

interface PriceChartProps extends HTMLProps<HTMLDivElement> {
    coin?: Coin
    currency: Currency
    stats: Stat[]
    loading?: boolean
    width?: number
    height?: number
    amount: number
    children?: React.ReactNode
}

export function PriceChart(props: PriceChartProps) {
    const { stats, loading, currency, children, coin, className, ...rest } = props
    const { classes, cx } = useStyles()
    const rootRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    useDimension(svgRef, DEFAULT_DIMENSION)

    usePriceLineChart(
        svgRef,
        stats.map(([date, price]) => ({
            date: new Date(date),
            value: price,
        })),
        DEFAULT_DIMENSION,
        'x-trader-price-line-chart',
        { sign: currency.name ?? 'USD' },
    )

    return (
        <Box
            className={cx(classes.root, className)}
            {...rest}
            ref={rootRef}
            sx={{
                cursor: stats.length && coin?.platform_url ? 'pointer' : 'default',
            }}>
            <Stack gap={2}>
                <Box className={classes.chart} height={DEFAULT_DIMENSION.height}>
                    {loading ?
                        <LoadingStatus iconSize={36} />
                    : stats.length ?
                        <svg
                            className={classes.svg}
                            ref={svgRef}
                            width={DEFAULT_DIMENSION.width}
                            height={DEFAULT_DIMENSION.height}
                            viewBox={`0 0 ${DEFAULT_DIMENSION.width} ${DEFAULT_DIMENSION.height}`}
                            preserveAspectRatio="xMidYMid meet"
                            onClick={() => {
                                stats.length && openWindow(coin?.platform_url)
                            }}
                        />
                    :   <EmptyStatus className={classes.placeholder} />}
                </Box>
                {children}
            </Stack>
        </Box>
    )
}
