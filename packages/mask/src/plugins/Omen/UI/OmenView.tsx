import { useState } from 'react'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Card, CardContent, Tabs, Tab, Typography, Paper, Box } from '@mui/material'
import { OmenSwapView } from './OmenSwapView'
import { OmenPoolView } from './OmenPoolView'
import { OmenHistoryView } from './OmenHistoryView'
import { OmenDetailsCard } from './OmenDetailsCard'
import { useFetchMarket } from '../hooks/useMarket'
import { useFetchHistory } from '../hooks/useHistory'
import { useFetchLiquidity } from '../hooks/useLiquidity'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { fpmmData, fpmmTransactionsData, fpmmLiquidityData } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontFamily: 'Muli,Helvetica,-apple-system,system-ui,"sans-serif"',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
    },
    title: {
        fontSize: 24,
        lineHeight: 1.25,
        fontWeight: 500,
        color: MaskColorVar.textPrimary,
        marginLeft: '15px',
        marginRight: '5px',
        marginTop: '5px',
    },
    card: {
        width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: theme.spacing(2),
    },
    content: {
        width: '100%',
        height: 'var(--contentHeight)',
        flexDirection: 'column',
        padding: '0 !important',
    },
    tabs: {
        borderTop: `solid 1px ${theme.palette.divider}`,
        borderBottom: `solid 1px ${theme.palette.divider}`,
        backgroundColor: '#1b1b21',
    },
    tab: {
        fontFamily: 'inherit',
        color: 'white',
    },
}))

interface OmenViewProps {
    id: string
}

export function OmenView(props: OmenViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [tabIndex, setTabIndex] = useState(0)
    const marketDataRes = useFetchMarket(props.id)
    const historyRes = useFetchHistory(props.id)
    const liquidityRes = useFetchLiquidity(props.id)
    let marketData = null,
        historyData = null,
        liquidityData = null
    const marketId = ''

    if (marketDataRes.loading || historyRes.loading || liquidityRes.loading) {
        return <Typography align="center">{t('loading')}</Typography>
    }

    if (marketDataRes.error || historyRes.error || liquidityRes.error) {
        return (
            <Typography align="center" color="textPrimary">
                {t('plugin_omen_error_occurred')}
            </Typography>
        )
    }

    const marketDataObj: fpmmData | null | undefined = marketDataRes.value
    marketData = marketDataObj?.fixedProductMarketMaker
    const historyObj: fpmmTransactionsData | null | undefined = historyRes.value
    historyData = historyObj?.fpmmTransactions
    const liquidityObj: fpmmLiquidityData | null | undefined = liquidityRes.value
    liquidityData = liquidityObj?.fpmmLiquidities

    if (!marketData || !historyData || !liquidityData) {
        return (
            <Typography align="center" color="textPrimary">
                {t('plugin_omen_market_not_found')}
            </Typography>
        )
    }

    return (
        <Box className={classes.root}>
            <Typography className={classes.title}>{marketData.title}</Typography>

            <OmenDetailsCard
                liquidityData={liquidityData}
                tokenId={marketData.collateralToken}
                usdRunningDailyVolume={marketData.usdRunningDailyVolume}
                closingTimestamp={new Date(1000 * +marketData.creationTimestamp)}
                collateralVolume={marketData.collateralVolume}
            />

            <Card className={classes.card}>
                <CardContent className={classes.content}>
                    <Tabs
                        value={tabIndex}
                        className={classes.tabs}
                        variant="fullWidth"
                        indicatorColor="primary"
                        textColor="secondary"
                        onChange={(_, newValue: number) => setTabIndex(newValue)}>
                        <Tab value={0} className={classes.tab} key={0} label={t('plugin_omen_swap')} />,
                        <Tab value={1} className={classes.tab} key={1} label={t('plugin_omen_pool')} />,
                        <Tab value={2} className={classes.tab} key={2} label={t('plugin_omen_history')} />,
                    </Tabs>
                    <Paper>
                        {tabIndex === 0 ? (
                            <OmenSwapView
                                marketId={marketId}
                                marketOutcomes={marketData.outcomes}
                                marketOutcomePrices={marketData.outcomeTokenMarginalPrices}
                                tokenId={marketData.collateralToken}
                            />
                        ) : null}
                        {tabIndex === 1 ? (
                            <OmenPoolView
                                marketId={marketId}
                                marketOutcomes={marketData.outcomes}
                                marketOutcomePrices={marketData.outcomeTokenMarginalPrices}
                                marketFee={marketData.fee}
                                tokenId={marketData.collateralToken}
                            />
                        ) : null}
                        {tabIndex === 2 ? (
                            <OmenHistoryView marketHistory={historyData} tokenId={marketData.collateralToken} />
                        ) : null}
                    </Paper>
                </CardContent>
            </Card>
        </Box>
    )
}
