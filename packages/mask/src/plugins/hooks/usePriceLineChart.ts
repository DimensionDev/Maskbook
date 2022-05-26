import type { RefObject } from 'react'
import type { Dimension } from './useDimension'
import { formatCurrency } from '@masknet/web3-shared-evm'
import { useLineChart } from './useLineChart'

export function usePriceLineChart(
    svgRef: RefObject<SVGSVGElement>,
    data: { date: Date; value: number }[],
    dimension: Dimension,
    id: string,
    opts: { color?: string; sign?: string },
) {
    const { color = 'steelblue', sign = '$' } = opts

    useLineChart(svgRef, data, dimension, id, {
        color,
        tickFormat: `${sign},.2s`,
        formatTooltip: (value: number) => formatCurrency(value, sign),
    })
}
