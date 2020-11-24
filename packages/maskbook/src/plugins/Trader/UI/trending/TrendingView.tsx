import { useEffect, useState } from 'react'
import { makeStyles, createStyles, Link, Tab, Tabs } from '@material-ui/core'
import type { DataProvider, TradeProvider } from '../../types'
import { resolveDataProviderName, resolveDataProviderLink } from '../../pipes'
import { useTrending } from '../../trending/useTrending'
import { TickersTable } from './TickersTable'
import { PriceChangedTable } from './PriceChangedTable'
import { PriceChart } from './PriceChart'
import { usePriceStats } from '../../trending/usePriceStats'
import { Days, PriceChartDaysControl } from './PriceChartDaysControl'
import { useCurrentDataProvider } from '../../trending/useCurrentDataProvider'
import { useCurrentTradeProvider } from '../../trending/useCurrentTradeProvider'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { useConstant } from '../../../../web3/hooks/useConstant'
import { CONSTANTS } from '../../../../web3/constants'
import { TradeView } from '../trader/TradeView'
import { TrendingViewError } from './TrendingViewError'
import { TrendingViewSkeleton } from './TrendingViewSkeleton'
import { TrendingViewDeck } from './TrendingViewDeck'

const useStyles = makeStyles((theme) => {
    return createStyles({
        header: {},
        body: {
            minHeight: 303,
            overflow: 'hidden',
            border: `solid 1px ${theme.palette.divider}`,
        },
        footer: {},
        tabs: {
            height: 35,
            width: '100%',
            minHeight: 'unset',
        },
        tab: {
            height: 35,
            minHeight: 'unset',
            minWidth: 'unset',
        },
    })
})

export interface TrendingViewProps {
    name: string
    dataProviders: DataProvider[]
    tradeProviders: TradeProvider[]
    onUpdate?: () => void
}

export function TrendingView(props: TrendingViewProps) {
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')

    const { t } = useI18N()
    const classes = useStyles()
    const [tabIndex, setTabIndex] = useState(0)

    //#region trending
    const dataProvider = useCurrentDataProvider(props.dataProviders)
    const {
        value: { currency, trending },
        error: trendingError,
        loading: loadingTrending,
    } = useTrending(props.name, dataProvider)
    //#endregion

    //#region swap
    const tradeProvider = useCurrentTradeProvider(props.tradeProviders)
    //#endregion

    //#region stats
    const [days, setDays] = useState(Days.ONE_WEEK)
    const { value: stats = [], loading: loadingStats } = usePriceStats({
        coinId: trending?.coin.id,
        dataProvider: trending?.dataProvider,
        currency: trending?.currency,
        days,
    })
    //#endregion

    //#region api ready callback
    useEffect(() => {
        props.onUpdate?.()
    }, [tabIndex, loadingTrending])
    //#endregion

    //#region no available platform
    if (props.dataProviders.length === 0) return null
    //#endregion

    //#region error handling
    // error: unknown coin or api error
    if (trendingError)
        return (
            <TrendingViewError
                message={
                    <span>
                        Fail to load trending info from{' '}
                        <Link
                            color="primary"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={resolveDataProviderLink(dataProvider)}>
                            {resolveDataProviderName(dataProvider)}
                        </Link>
                        .
                    </span>
                }
            />
        )
    //#endregion

    //#region display loading skeleton
    if (loadingTrending || !currency || !trending) return <TrendingViewSkeleton />
    //#endregion

    const { coin, market, tickers } = trending
    const canSwap = trending.coin.eth_address || trending.coin.symbol.toLowerCase() === 'eth'

    return (
        <TrendingViewDeck
            classes={{ header: classes.header, body: classes.body, footer: classes.footer }}
            stats={stats}
            currency={currency}
            trending={trending}
            dataProvider={dataProvider}
            tradeProvider={tradeProvider}
            showDataProviderIcon={tabIndex !== 2}
            showTradeProviderIcon={tabIndex === 2}>
            <Tabs
                className={classes.tabs}
                textColor="primary"
                variant="fullWidth"
                value={tabIndex}
                onChange={(ev: React.ChangeEvent<{}>, newValue: number) => setTabIndex(newValue)}
                TabIndicatorProps={{
                    style: {
                        display: 'none',
                    },
                }}>
                <Tab className={classes.tab} label={t('plugin_trader_tab_price')} />
                <Tab className={classes.tab} label={t('plugin_trader_tab_exchange')} />
                {canSwap ? <Tab className={classes.tab} label={t('plugin_trader_tab_swap')} /> : null}
            </Tabs>
            {tabIndex === 0 ? (
                <>
                    {market ? <PriceChangedTable market={market} /> : null}
                    <PriceChart coin={coin} stats={stats} loading={loadingStats}>
                        <PriceChartDaysControl days={days} onDaysChange={setDays} />
                    </PriceChart>
                </>
            ) : null}
            {tabIndex === 1 ? <TickersTable tickers={tickers} dataProvider={dataProvider} /> : null}
            {tabIndex === 2 && canSwap ? (
                <TradeView
                    TraderProps={{
                        address: coin.eth_address ?? ETH_ADDRESS,
                        name: coin.name,
                        symbol: coin.symbol,
                    }}
                />
            ) : null}
        </TrendingViewDeck>
    )
}
