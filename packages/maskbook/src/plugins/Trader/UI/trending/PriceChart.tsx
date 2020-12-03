import { useEffect, useRef, useState } from 'react'
import { useWindowSize } from 'react-use'
import type { Coin, Stat } from '../../types'
import { makeStyles, Theme, createStyles, CircularProgress, Typography } from '@material-ui/core'
import { useDimension, Dimension } from '../../graphs/useDimension'
import { usePriceLineChart } from '../../graphs/usePriceLineChart'
import { useI18N } from '../../../../utils/i18n-next-ui'

const DEFAULT_DIMENSION: Dimension = {
    top: 32,
    right: 16,
    bottom: 32,
    left: 16,
    width: 598,
    height: 200,
}

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {
            position: 'relative',
            cursor: ({ stats, coin }: PriceChartProps) => (stats.length && coin?.platform_url ? 'pointer' : 'default'),
        },
        svg: {
            display: 'block',
        },
        progress: {
            bottom: theme.spacing(1),
            right: theme.spacing(1),
            position: 'absolute',
        },
        placeholder: {
            paddingTop: theme.spacing(10),
            paddingBottom: theme.spacing(10),
            borderStyle: 'none',
        },
    })
})

export interface PriceChartProps {
    coin?: Coin
    stats: Stat[]
    loading?: boolean
    width?: number
    height?: number
    children?: React.ReactNode
}

export function PriceChart(props: PriceChartProps) {
    const { t } = useI18N()
    const classes = useStyles(props)
    const rootRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    //#region make chart responisve
    const { width } = useWindowSize()
    const [responsiveWidth, setResponsiveWidth] = useState(DEFAULT_DIMENSION.width)

    useEffect(() => {
        if (!rootRef.current) return
        setResponsiveWidth(rootRef.current.getBoundingClientRect().width || DEFAULT_DIMENSION.width)
    }, [width /* redraw canvas if window width resize */])
    //#endregion

    const dimension = {
        ...DEFAULT_DIMENSION,
        width: responsiveWidth,
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
    )

    return (
        <div className={classes.root} ref={rootRef}>
            {props.loading ? <CircularProgress className={classes.progress} color="primary" size={15} /> : null}
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
                            props.stats.length &&
                                props.coin?.platform_url &&
                                window.open(props.coin.platform_url, '_blank', 'noopener noreferrer')
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
