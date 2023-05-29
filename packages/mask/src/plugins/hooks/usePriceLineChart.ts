import type { RefObject } from 'react'
import type { Dimension } from './useDimension.js'
import { formatCurrency } from '@masknet/web3-shared-base'
import { useLineChart } from './useLineChart/index.js'

export function usePriceLineChart(
    svgRef: RefObject<SVGSVGElement>,
    data: Array<{
        date: Date
        value: number
    }>,
    dimension: Dimension,
    id: string,
    opts: {
        color?: string
        sign?: string
    },
) {
    const { color = 'steelblue', sign = 'USD' } = opts

    useLineChart(svgRef, data, dimension, id, {
        color,
        tickFormat: `${sign},.2s`,
        formatTooltip: (value) =>
            sign.match(/^[A-Za-z]{3,5}$/) ? formatCurrency(value, sign) : `${sign} ${value.toPrecision(6)}`,
    })
}
