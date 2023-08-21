import { usePriceLineChart, type Dimension, useDimension } from '@masknet/shared'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { useRef, type HTMLProps, useMemo } from 'react'
import { multipliedBy } from '@masknet/web3-shared-base'
import { useCurrencyType, useFiatCurrencyRate } from '@masknet/web3-hooks-base'

export const DIMENSION: Dimension = {
    top: 32,
    right: 16,
    bottom: 32,
    left: 16,
    width: 368,
    height: 174,
}

interface TrendingChartProps extends HTMLProps<SVGSVGElement> {
    stats: TrendingAPI.Stat[]
}

export function TrendingChart({ stats, ...props }: TrendingChartProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const currencyType = useCurrencyType()
    const { data: fiatCurrencyRate = 1 } = useFiatCurrencyRate()
    const chartData = useMemo(
        () =>
            stats.map(([date, price]) => ({
                date: new Date(date),
                value: multipliedBy(price, fiatCurrencyRate).toNumber(),
            })),
        [stats],
    )

    useDimension(svgRef, DIMENSION)
    usePriceLineChart(svgRef, chartData, DIMENSION, 'token-price-line-chart', { sign: currencyType })

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
