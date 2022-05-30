import { useState } from 'react'
import { RefreshIcon } from '@masknet/icons'
import { Box, Card, CardContent, CardHeader, CircularProgress, Paper, Tab, Tabs, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useFetchPool, usePoolDepositAssets } from '../hooks/usePool'
import { PerformanceChart } from './PerformanceChart'
import { PoolStats } from './PoolStats'
import { PoolViewDeck } from './PoolViewDeck'
import { useChainId } from '@masknet/plugin-infra/web3'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '100%',
        boxShadow: 'none',
        padding: 0,
    },
    message: {
        textAlign: 'center',
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        fontSize: 'inherit',
    },
    content: {
        width: '100%',
        height: 'var(--contentHeight)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 !important',
    },
    body: {
        flex: 1,
        overflow: 'auto',
        maxHeight: 350,
        borderRadius: 0,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    tabs: {
        borderTop: `solid 1px ${theme.palette.divider}`,
        borderBottom: `solid 1px ${theme.palette.divider}`,
        width: '100%',
        minHeight: 'unset',
    },
    tab: {
        minHeight: 'unset',
        minWidth: 'unset',
    },
}))

interface PoolViewProps {
    address?: string
    link: string
}

export function PoolView(props: PoolViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    // #region allowed tokens
    const { value: pool, error, loading, retry } = useFetchPool(props.address ?? '')

    // #region susd token
    const {
        value: allowedTokens,
        loading: loadingAllowedTokens,
        retry: retryAllowedTokens,
        error: errorAllowedTokens,
    } = usePoolDepositAssets(pool)
    // #endregion

    // #region tabs
    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [
        <Tab className={classes.tab} key="stats" label={t('plugin_dhedge_tab_stats')} />,
        <Tab className={classes.tab} key="chart" label={t('plugin_dhedge_tab_chart')} />,
    ].filter(Boolean)
    // #endregion

    if (loading || loadingAllowedTokens)
        return (
            <Typography className={classes.message} textAlign="center" sx={{ padding: 2 }}>
                <CircularProgress />
            </Typography>
        )
    if (!pool)
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_dhedge_pool_not_found')}
            </Typography>
        )
    if (error || (errorAllowedTokens && currentChainId === pool.chainId))
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_dhedge_smt_wrong')}
                <br />
                {(error as any)?.message || errorAllowedTokens?.message}
                <br />
                <RefreshIcon className={classes.refresh} color="primary" onClick={error ? retry : retryAllowedTokens} />
            </Typography>
        )

    return (
        <>
            <Card className={classes.root} elevation={0}>
                <CardHeader subheader={<PoolViewDeck pool={pool} inputTokens={allowedTokens} link={props.link} />} />
                <CardContent className={classes.content}>
                    <Tabs
                        className={classes.tabs}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        value={tabIndex}
                        onChange={(_, newValue: number) => setTabIndex(newValue)}
                        TabIndicatorProps={{
                            style: {
                                display: 'none',
                            },
                        }}>
                        {tabs}
                    </Tabs>
                    <Paper className={classes.body}>
                        {tabIndex === 0 ? <PoolStats pool={pool} /> : null}
                        {tabIndex === 1 ? <PerformanceChart pool={pool} /> : null}
                    </Paper>
                </CardContent>
            </Card>
            <Box sx={{ display: 'flex', width: 'calc(100% - 24px)', padding: 1.5 }}>
                <ChainBoundary
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    expectedChainId={pool?.chainId ?? ChainId.Mainnet}
                    renderInTimeline
                />
            </Box>
        </>
    )
}
