import { createContainer, useContainer } from 'unstated-next'
import type { ChartStat } from '../types.js'

function useChartStatContext(initialState?: { chartStat: ChartStat[] }) {
    return {
        chartStat: initialState?.chartStat ?? [],
    }
}

export const ChartStatContext = createContainer(useChartStatContext)

export function useChartStat() {
    return useContainer(ChartStatContext)
}

ChartStatContext.Provider.displayName = 'ChartStatContext'
