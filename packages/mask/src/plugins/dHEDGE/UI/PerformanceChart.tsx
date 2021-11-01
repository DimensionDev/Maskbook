import { useEffect, useRef, useState } from 'react'
import { useWindowSize } from 'react-use'
import { CircularProgress, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Period, Pool } from '../types'
import { useFetchPoolHistory } from '../hooks/usePool'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { Stat } from '../../Trader/types'
import { useDimension, Dimension } from '../../hooks/useDimension'
import { useLineChart } from '../hooks/useLineChart'

const DEFAULT_DIMENSION: Dimension = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: 598,
    height: 100,
}
const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        padding: theme.spacing(0),
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
        paddingTop: theme.spacing(10),
        paddingBottom: theme.spacing(10),
        borderStyle: 'none',
    },
}))

interface PerformanceChartProps {
    pool: Pool
}

export function PerformanceChart(props: PerformanceChartProps) {
    const { pool } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    const rootRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    const [period, setPeriod] = useState(Period.W1)

    //#region fetch pool history
    const { value: perfHistory, error, loading, retry } = useFetchPoolHistory(pool.address, period)
    const stats: Stat[] = perfHistory?.map((row) => [Number(row.timestamp), Number(row.performance)]) ?? []
    //#endregion

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
        stats.map(([date, price]) => ({
            date: new Date(date),
            value: price,
        })),
        dimension,
        'x-dhedge-performance-line-chart',
        {
            tickFormat: '.0%',
            formatTooltip: (value: number) => `${(value * 100).toFixed(1)}%`,
        },
    )

    return (
        <div className={classes.root} ref={rootRef}>
            {loading ? (
                <CircularProgress className={classes.progress} color="primary" size={15} />
            ) : (
                <RefreshIcon className={classes.refresh} color="primary" onClick={retry} />
            )}
            {stats.length && !error ? (
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
                    {loading
                        ? t('plugin_dhedge_loading_chart')
                        : error
                        ? t('plugin_dhedge_fetch_error')
                        : t('plugin_dhedge_no_data')}
                </Typography>
            )}
        </div>
    )
}
