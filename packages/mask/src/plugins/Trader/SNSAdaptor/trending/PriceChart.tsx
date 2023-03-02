import { useRef } from 'react'
import { first, last } from 'lodash-es'
import { Stack, Typography, useTheme } from '@mui/material'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils/index.js'
import type { Coin, Currency, Stat } from '../../types/index.js'
import { useDimension, Dimension } from '../../../hooks/useDimension.js'
import { usePriceLineChart } from '../../../hooks/usePriceLineChart.js'
import { openWindow } from '@masknet/shared-base-ui'

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

export interface PriceChartProps extends withClasses<'root'> {
    coin?: Coin
    currency: Currency
    stats: Stat[]
    loading?: boolean
    width?: number
    height?: number
    amount: number
    retry(): void
    children?: React.ReactNode
}

export function PriceChart(props: PriceChartProps) {
    const { t } = useI18N()
    const { classes } = useStyles(props, { props })
    const colors = useTheme().palette.maskColor
    const rootRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    const dimension = {
        ...DEFAULT_DIMENSION,
        width: DEFAULT_DIMENSION.width,
        height: DEFAULT_DIMENSION.height,
    }

    useDimension(svgRef, dimension)

    const firstPrice = first(props.stats)?.[1] ?? 0
    const lastPrice = last(props.stats)?.[1] ?? 0

    usePriceLineChart(
        svgRef,
        props.stats.map(([date, price]) => ({
            date: new Date(date),
            value: price,
        })),
        dimension,
        'x-trader-price-line-chart',
        { sign: props.currency.name ?? 'USD', color: lastPrice - firstPrice < 0 ? colors.danger : colors.success },
    )

    return (
        <div className={classes.root} ref={rootRef}>
            {props.loading && props.stats.length ? (
                <LoadingBase className={classes.progress} color="primary" size={15} />
            ) : null}

            <Stack gap={2}>
                {props.stats.length ? (
                    <svg
                        className={classes.svg}
                        ref={svgRef}
                        width={dimension.width}
                        height={dimension.height}
                        viewBox={`0 0 ${dimension.width} ${dimension.height}`}
                        preserveAspectRatio="xMidYMid meet"
                        onClick={() => {
                            props.stats.length && openWindow(props.coin?.platform_url)
                        }}
                    />
                ) : (
                    <Typography className={classes.placeholder} align="center" color="textSecondary">
                        {t('plugin_trader_no_data')}
                    </Typography>
                )}
                {props.children}
            </Stack>
        </div>
    )
}
