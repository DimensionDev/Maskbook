import type { RefObject } from 'react'
import type { Dimension } from './useDimension.js'
import { CurrencyType, formatCurrency } from '@masknet/web3-shared-base'
import { useLineChart } from './useLineChart/index.js'
import { useTheme } from '@mui/material'
import { first, last } from 'lodash-es'

export function usePriceLineChart(
    svgRef: RefObject<SVGSVGElement | null>,
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
    const theme = useTheme()
    const colors = theme.palette.maskColor
    const startValue = first(data)?.value ?? 0
    const endValue = last(data)?.value ?? 0
    const defaultColor = endValue - startValue < 0 ? colors.danger : colors.success

    const { color = defaultColor, sign = CurrencyType.USD } = opts

    useLineChart(svgRef, data, dimension, id, {
        color,
        tickFormat: `${sign},.2s`,
        formatTooltip: (value) =>
            sign.match(/^[A-Za-z]{3,5}$/) ? formatCurrency(value, sign) : `${sign} ${value.toPrecision(6)}`,
    })
}
