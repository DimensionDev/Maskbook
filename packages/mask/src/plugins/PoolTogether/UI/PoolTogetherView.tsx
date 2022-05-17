import { RefreshIcon } from '@masknet/icons'
import { DarkColor } from '@masknet/theme/base'
import { ChainId, usePoolTogetherConstants } from '@masknet/web3-shared-evm'
import { Box, Card, CardContent, CircularProgress, Paper, Tab, Tabs, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import React, { useState, useEffect } from 'react'
import { useI18N } from '../../../utils/i18n-next-ui'
import { usePool, usePools } from '../hooks/usePools'
import type { Pool } from '../types'
import { Account } from './Account'
import { PoolsView } from './PoolsView'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

const useStyles = makeStyles()((theme) => ({
    root: {
        // width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
        backgroundColor: '#290b5a',
        textAlign: 'center',
        width: '100%',
    },
    message: {
        textAlign: 'center',
        padding: 16,
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        padding: theme.spacing(1),
        fontSize: 'inherit',
    },
    content: {
        // width: '100%',
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
        backgroundColor: '#290b5a',
    },
    tabs: {
        borderTop: `solid 1px ${theme.palette.divider}`,
        borderBottom: `solid 1px ${theme.palette.divider}`,
        width: '100%',
        minHeight: 'unset',
        color: DarkColor.textPrimary,
    },
    tab: {
        minHeight: 'unset',
        minWidth: 'unset',
    },
    progress: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        padding: theme.spacing(1),
    },
}))

interface PoolTogetherViewProps {}

export function PoolTogetherView(props: PoolTogetherViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [pools, setPools] = useState<Pool[]>([])

    // #region pools
    const { value: _pools = [], error, loading, retry } = usePools()
    _pools.sort((x, y) => Number(y.prize.weeklyTotalValueUsd) - Number(x.prize.weeklyTotalValueUsd))
    // #endregion

    // #region mask pool
    const { MASK_POOL_ADDRESS, MASK_POOL_SUBGRAPH } = usePoolTogetherConstants()
    const {
        value: maskPool,
        error: errorMask,
        loading: loadingMask,
        retry: retryMask,
    } = usePool(MASK_POOL_ADDRESS, MASK_POOL_SUBGRAPH, true)
    // #endregion

    // #region tabs
    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [
        <Tab className={classes.tab} key="pools" label={t('plugin_pooltogether_tab_pools')} />,
        <Tab className={classes.tab} key="account" label={t('plugin_pooltogether_tab_account')} />,
    ].filter(Boolean)
    // #endregion

    useEffect(() => {
        if (maskPool) {
            setPools([maskPool, ..._pools])
        } else {
            setPools(_pools)
        }
    }, [_pools, maskPool])

    if (loading || loadingMask) {
        return <CircularProgress className={classes.progress} color="primary" size={15} />
    }

    if (error || errorMask) {
        return <RefreshIcon className={classes.refresh} color="primary" onClick={error ? retry : retryMask} />
    }

    if (pools.length === 0) {
        return (
            <Typography color="error" className={classes.message}>
                {t('plugin_pooltogether_no_pool')}
            </Typography>
        )
    }

    return (
        <>
            <Card className={classes.root} elevation={0}>
                <CardContent className={classes.content}>
                    <Tabs
                        className={classes.tabs}
                        indicatorColor="primary"
                        textColor="inherit"
                        variant="fullWidth"
                        value={tabIndex}
                        onChange={(ev: React.ChangeEvent<{}>, newValue: number) => setTabIndex(newValue)}
                        TabIndicatorProps={{
                            style: {
                                display: 'none',
                            },
                        }}>
                        {tabs}
                    </Tabs>
                    <Paper className={classes.body}>
                        {tabIndex === 0 ? <PoolsView pools={pools} /> : null}
                        {tabIndex === 1 ? <Account pools={pools} /> : null}
                    </Paper>
                </CardContent>
            </Card>
            <Box style={{ padding: 12 }}>
                <EthereumChainBoundary
                    chainId={ChainId.Mainnet}
                    isValidChainId={(chainId) => [ChainId.Mainnet, ChainId.Matic].includes(chainId)}
                />
            </Box>
        </>
    )
}
