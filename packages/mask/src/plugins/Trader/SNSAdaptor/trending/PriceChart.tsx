import { useEffect, useRef, useState } from 'react'
import { useWindowSize } from 'react-use'
import { CircularProgress, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useI18N } from '../../../../utils'
import type { Coin, Currency, Stat } from '../../types'
import { useDimension, Dimension } from '../../../hooks/useDimension'
import { usePriceLineChart } from '../../../hooks/usePriceLineChart'
import { openWindow } from '@masknet/shared-base-ui'

const DEFAULT_DIMENSION: Dimension = {
    top: 32,
    right: 16,
    bottom: 32,
    left: 16,
    width: 598,
    height: 200,
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
            bottom: theme.spacing(1),
            right: theme.spacing(1),
            position: 'absolute',
        },
        refresh: {
            bottom: theme.spacing(1),
            right: theme.spacing(1),
            position: 'absolute',
            fontSize: 15,
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
    retry(): void
    children?: React.ReactNode
}

export function PriceChart(props: PriceChartProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(props), props)
    const rootRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    // #region make chart responsive
    const { width } = useWindowSize()
    const [responsiveWidth, setResponsiveWidth] = useState(DEFAULT_DIMENSION.width)
    const [responsiveHeight, setResponsiveHeight] = useState(DEFAULT_DIMENSION.height)

    useEffect(() => {
        if (!rootRef.current) return
        setResponsiveWidth(rootRef.current.getBoundingClientRect().width || DEFAULT_DIMENSION.width)
        setResponsiveHeight(rootRef.current.getBoundingClientRect().height || DEFAULT_DIMENSION.height)
    }, [width /* redraw canvas if window width resize */])
    // #endregion

    const dimension = {
        ...DEFAULT_DIMENSION,
        width: responsiveWidth,
        height: responsiveHeight,
    }

    useDimension(svgRef, dimension)
    usePriceLineChart(
        svgRef,
        props.stats.map(([date, price]) => ({
            date: new Date(date),
            value: price,
        })),
        dimension,
        'x-trader-price-line-chart',
        { sign: props.currency.symbol },
    )

    return (
        <div className={classes.root} ref={rootRef}>
            {props.loading ? (
                <CircularProgress className={classes.progress} color="primary" size={15} />
            ) : (
                <RefreshIcon
                    className={classes.refresh}
                    color="primary"
                    style={{ fill: '#1C68F3' }}
                    onClick={props.retry}
                />
            )}
            {props.stats.length ? (
                <>
                    {props.children}
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
                </>
            ) : (
                <Typography className={classes.placeholder} align="center" color="textSecondary">
                    {t('plugin_trader_no_data')}
                </Typography>
            )}
        </div>
    )
}
