import { useEffect, useRef, useState } from 'react'
import { useWindowSize } from 'react-use'
import { makeStyles } from '@masknet/theme'
import { useDimension, Dimension } from '../../../hooks/useDimension'
import { useStylesExtends } from '@masknet/shared'
import { usePriceLineChart } from '../../../hooks/usePriceLineChart'
import type { Currency } from '../../types'

const DEFAULT_DIMENSION: Dimension = {
    top: 32,
    right: 16,
    bottom: 32,
    left: 16,
    width: 598,
    height: 269,
}

export interface PriceChartProps extends withClasses<'root'> {
    data: { date: Date; value: number }[]
    width?: number
    height?: number
    currency: Currency
}

const useStyles = makeStyles()({
    root: {
        position: 'relative',
    },
    svg: {
        display: 'block',
    },
})

export function LBPPriceChart(props: PriceChartProps) {
    const { data } = props
    const classes = useStylesExtends(useStyles(), props)
    const rootRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    const { width } = useWindowSize()
    const [responsiveWidth, setResponsiveWidth] = useState(DEFAULT_DIMENSION.width)
    const [responsiveHeight, setResponsiveHeight] = useState(DEFAULT_DIMENSION.height)

    useEffect(() => {
        if (!rootRef.current) return
        setResponsiveWidth(rootRef.current.getBoundingClientRect().width || DEFAULT_DIMENSION.width)
        setResponsiveHeight(rootRef.current.getBoundingClientRect().height || DEFAULT_DIMENSION.height)
    }, [width /* redraw canvas if window width resize */])

    const dimension = {
        ...DEFAULT_DIMENSION,
        width: responsiveWidth,
        height: responsiveHeight,
    }

    useDimension(svgRef, dimension)
    usePriceLineChart(svgRef, data, dimension, 'x-lbp-price-line-chart', { sign: props.currency.symbol })

    return (
        <div className={classes.root} ref={rootRef}>
            <svg
                className={classes.svg}
                ref={svgRef}
                width={dimension.width}
                height={dimension.height}
                viewBox={`0 0 ${dimension.width} ${dimension.height}`}
                preserveAspectRatio="xMidYMid meet"
            />
        </div>
    )
}
