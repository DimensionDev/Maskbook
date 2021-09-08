import { useEffect, useRef, useState } from 'react'
import { useWindowSize } from 'react-use'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useLineChart } from '../../hooks/useLineChart'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { Outcome, Trade } from '../types'
import { useDimension, Dimension } from '../../hooks/useDimension'

const DEFAULT_DIMENSION: Dimension = {
    top: 32,
    right: 16,
    bottom: 32,
    left: 16,
    width: 598,
    height: 150,
}
const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        padding: theme.spacing(2),
    },
    svg: {
        display: 'block',
        color: '#fff',
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
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        borderStyle: 'none',
    },
}))

interface PriceChartProps {
    trades: Trade[]
    outcome: Outcome
}

export function PriceChart(props: PriceChartProps) {
    const { trades, outcome } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    const rootRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    //#region make chart responsive
    const { width } = useWindowSize()
    const [responsiveWidth, setResponsiveWidth] = useState(DEFAULT_DIMENSION.width)
    const [responsiveHeight, setResponsiveHeight] = useState(DEFAULT_DIMENSION.height)

    useEffect(() => {
        if (!rootRef.current) return
        setResponsiveWidth(rootRef.current.getBoundingClientRect().width || DEFAULT_DIMENSION.width)
        setResponsiveHeight(rootRef.current.getBoundingClientRect().height || DEFAULT_DIMENSION.height)
    }, [width /* redraw canvas if window width resize */])
    //#endregion

    const dimension = {
        ...DEFAULT_DIMENSION,
        width: responsiveWidth,
        height: responsiveHeight,
    }

    useDimension(svgRef, dimension)
    useLineChart(
        svgRef,
        trades
            .sort((t1, t2) => t1.timestamp - t2.timestamp)
            .map((trade) => ({
                date: new Date(trade.timestamp * 1000),
                value: trade.price ?? 0,
            })),
        dimension,
        `x-augur-trades-chart`,
        {
            tickFormat: '.3',
            formatTooltip: (value: number) => `${value.toFixed(3)}`,
        },
    )

    return (
        <div className={classes.root} ref={rootRef}>
            <Typography variant="h6" textAlign="center">
                {outcome.name}
            </Typography>
            {trades.length >= 2 ? (
                <svg
                    className={classes.svg}
                    ref={svgRef}
                    width={dimension.width}
                    height={dimension.height}
                    viewBox={`0 0 ${dimension.width} ${dimension.height}`}
                    preserveAspectRatio="xMidYMid meet"
                />
            ) : (
                <Typography className={classes.placeholder} align="center" color="textSecondary">
                    {t('plugin_dhedge_no_data')}
                </Typography>
            )}
        </div>
    )
}
