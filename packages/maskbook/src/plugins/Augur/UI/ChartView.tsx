import { useMemo, useState } from 'react'
import { CircularProgress, Divider, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import RefreshIcon from '@material-ui/icons/Refresh'
import { useI18N } from '../../../utils/i18n-next-ui'
import { Period } from '../types'
import type { Market } from '../types'
import { PriceChartPeriodControl } from './ChartControl'
import { useMarketTrades } from '../hooks/useMarketTrades'
import { PriceChart } from './PriceChart'

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
        paddingTop: theme.spacing(10),
        paddingBottom: theme.spacing(10),
        borderStyle: 'none',
    },
}))

const timestampByPeriod = (period: Period) => {
    const now = Date.now()
    const DAY = 60 * 60 * 24 * 1000

    switch (period) {
        case Period.H24:
            return now - DAY
        case Period.D7:
            return now - DAY * 7
        case Period.D30:
            return now - DAY * 30
        case Period.ALL:
            return 0
        default:
            return 0
    }
}

interface ChartProps {
    market: Market
}

export function ChartView(props: ChartProps) {
    const { market } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    const [period, setPeriod] = useState(Period.H24)

    //#region fetch market trades
    const fromTimestamp = useMemo(() => Number.parseInt((timestampByPeriod(period) / 1000).toFixed(), 10), [period])
    const { value: trades = [], error, loading, retry } = useMarketTrades(market, fromTimestamp)
    //#endregion

    return (
        <div className={classes.root}>
            {loading ? (
                <CircularProgress className={classes.progress} color="primary" size={15} />
            ) : (
                <RefreshIcon className={classes.refresh} color="primary" onClick={retry} />
            )}
            <PriceChartPeriodControl period={period} onPeriodChange={setPeriod} />
            {trades.length !== 0 && !error && !loading ? (
                <>
                    {market.outcomes
                        .sort((o1, o2) => o2.id - o1.id)
                        .map((outcome) => (
                            <div key={outcome.id}>
                                <PriceChart
                                    key={outcome.id}
                                    trades={trades.filter((trade) => trade.outcome === outcome.id)}
                                    outcome={outcome}
                                />
                                <Divider />
                            </div>
                        ))}
                </>
            ) : (
                <Typography className={classes.placeholder} align="center" color="textSecondary">
                    {loading
                        ? t('plugin_dhedge_loading_chart')
                        : error
                        ? t('plugin_dhedge_fetch_error')
                        : t('plugin_trader_no_data')}
                </Typography>
            )}
        </div>
    )
}
