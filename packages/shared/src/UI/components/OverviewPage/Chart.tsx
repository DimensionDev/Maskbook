import { usePriceLineChart, type Dimension, useDimension } from '@masknet/shared'
import { useRef, type HTMLProps, useMemo } from 'react'
import type { ChartStat } from './types.js'

export const DIMENSION: Dimension = {
    top: 32,
    right: 16,
    bottom: 32,
    left: 16,
    width: 780,
    height: 200,
}

interface ChartProps extends HTMLProps<SVGSVGElement> {
    stats: ChartStat[]
}

export function Chart({ stats, ...props }: ChartProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const chartData = useMemo(() => stats.map(([date, price]) => ({ date: new Date(date), value: price })), [stats])

    useDimension(svgRef, DIMENSION)
    usePriceLineChart(svgRef, chartData, DIMENSION, 'token-price-line-chart', { sign: 'USD' })

    return (
        <svg
            ref={svgRef}
            width={DIMENSION.width}
            height={DIMENSION.height}
            viewBox={`0 0 ${DIMENSION.width} ${DIMENSION.height}`}
            preserveAspectRatio="xMidYMid meet"
            {...props}
        />
    )
}
