import { useRef, useMemo } from 'react'
import { Stack, Typography } from '@mui/material'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { openWindow } from '@masknet/shared-base-ui'
import { useDimension, usePriceLineChart, type Dimension } from '@masknet/shared'
import { useTraderTrans } from '../../locales/index.js'
import type { Coin, Currency, Stat } from '../../types/index.js'

const DEFAULT_DIMENSION: Dimension = {
    top: 32,
    right: 16,
    bottom: 32,
    left: 16,
    width: 566,
    height: 190,
}

const useStyles = makeStyles<PriceChartProps>()((theme, { stats, coin }) => {
    return {
        root: {
            position: 'relative',
            cursor: stats.length && coin?.platform_url ? 'pointer' : 'default',
        },
        svg: {
            display: 'block',
        },
        progress: {
            position: 'absolute',
            left: 275,
            top: 85,
        },
        placeholder: {
            paddingTop: theme.spacing(10),
            paddingBottom: theme.spacing(10),
            borderStyle: 'none',
        },
    }
})

interface PriceChartProps extends withClasses<'root'> {
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
    const t = useTraderTrans()
    const { classes } = useStyles(props, { props })
    const rootRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)
    const { stats, loading, currency, coin, children } = props

    useDimension(svgRef, DEFAULT_DIMENSION)

    const data = useMemo(() => {
        return stats.map(([date, price]) => ({
            date: new Date(date),
            value: price,
        }))
    }, [stats])

    usePriceLineChart(svgRef, data, DEFAULT_DIMENSION, 'x-trader-price-line-chart', {
        sign: currency.name ?? 'USD',
    })

    return (
        <div className={classes.root} ref={rootRef}>
            {loading && stats.length ?
                <LoadingBase className={classes.progress} color="primary" size={15} />
            :   null}

            <Stack gap={2}>
                {stats.length ?
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
                :   <Typography className={classes.placeholder} align="center" color="textSecondary">
                        {t.plugin_trader_no_data()}
                    </Typography>
                }
                {children}
            </Stack>
        </div>
    )
}
