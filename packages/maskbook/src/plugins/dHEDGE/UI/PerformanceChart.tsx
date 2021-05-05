import { useState } from 'react'
import { Typography } from '@material-ui/core'
import { usePoolHistory } from '../hooks/usePool'
import { PriceChart } from '../../Trader/UI/trending/PriceChart'
import { PriceChartPeriodControl } from './ChartControl'
import type { Stat } from '../../Trader/types'
import { Period } from '../types'

interface PerformanceChartProps {
    address: string
}

export function PerformanceChart(props: PerformanceChartProps) {
    const [period, setPeriod] = useState(Period.D1)

    const { value: perfHistory, error: error, loading: loading, retry: retryStats } = usePoolHistory(
        props.address,
        period,
    )
    const stats: Stat[] = perfHistory?.map((row) => [Number(row.timestamp), Number(row.performance) * 100]) ?? []

    if (error) return <Typography>Something went wrong.</Typography>

    return (
        <PriceChart
            coin={undefined}
            currency={{ id: 'percent', name: '%', symbol: '' }}
            stats={stats ?? []}
            loading={loading}
            retry={retryStats}>
            <PriceChartPeriodControl period={period} onPeriodChange={setPeriod} />
        </PriceChart>
    )
}
