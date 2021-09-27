import { RefreshIcon } from '@masknet/icons'
import { DarkColor } from '@masknet/theme/constants'
import { usePoolTogetherConstants } from '@masknet/web3-shared'
import { Card, CardActions, CardContent, CircularProgress, Link, Paper, Tab, Tabs, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { MaskTextIcon } from '../../../resources/MaskIcon'
import { PoolTogetherIcon } from '../../../resources/PoolTogetherIcon'
import { useI18N } from '../../../utils/i18n-next-ui'
import { usePool, usePools } from '../hooks/usePools'
import type { Pool } from '../types'
import { Account } from './Account'
import { PoolsView } from './PoolsView'

const useStyles = makeStyles()((theme) => ({
    root: {
        // width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
        backgroundColor: '#290b5a',
        textAlign: 'center',
    },
    message: {
        color: theme.palette.text.primary,
        textAlign: 'center',
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
    footer: {
        marginTop: -1, // merge duplicate borders
        zIndex: 1,
        position: 'relative',
        borderTop: `solid 1px ${theme.palette.divider}`,
        justifyContent: 'space-between',
    },
    footnote: {
        fontSize: 10,
        marginRight: theme.spacing(1),
    },
    footLink: {
        cursor: 'pointer',
        marginRight: theme.spacing(0.5),
        '&:last-child': {
            marginRight: 0,
        },
    },
    footMenu: {
        color: theme.palette.text.secondary,
        fontSize: 10,
        display: 'flex',
        alignItems: 'center',
    },
    footName: {
        marginLeft: theme.spacing(0.5),
    },
    mask: {
        width: 40,
        height: 10,
    },
    pooltogether: {
        height: 10,
        width: 10,
        marginLeft: theme.spacing(0.5),
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

    //#region pools
    const { value: _pools = [], error: error, loading: loading, retry: retry } = usePools()
    _pools.sort((x, y) => Number(y.prize.weeklyTotalValueUsd) - Number(x.prize.weeklyTotalValueUsd))
    //#endregion

    //#region mask pool
    const { MASK_POOL_ADDRESS, MASK_POOL_SUBGRAPH } = usePoolTogetherConstants()
    const {
        value: maskPool,
        error: errorMask,
        loading: loadingMask,
        retry: retryMask,
    } = usePool(MASK_POOL_ADDRESS, MASK_POOL_SUBGRAPH, true)
    //#endregion

    //#region tabs
    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [
        <Tab className={classes.tab} key="pools" label={t('plugin_pooltogether_tab_pools')} />,
        <Tab className={classes.tab} key="account" label={t('plugin_pooltogether_tab_account')} />,
    ].filter(Boolean)
    //#endregion

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
        return <Typography className={classes.message}>{t('plugin_pooltogether_no_pool')}</Typography>
    }

    return (
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
            <CardActions className={classes.footer}>
                <Typography color={DarkColor.textSecondary} className={classes.footnote} variant="subtitle2">
                    <span>{t('plugin_powered_by')} </span>
                    <Link
                        className={classes.footLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Mask"
                        href="https://mask.io">
                        <MaskTextIcon classes={{ root: classes.mask }} viewBox="0 0 80 20" />
                    </Link>
                </Typography>
                <Typography className={classes.footnote} color={DarkColor.textSecondary} variant="subtitle2">
                    <span>Supported by</span>
                    <Link
                        className={classes.footLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="PoolTogether"
                        href="https://pooltogether.com/">
                        <PoolTogetherIcon classes={{ root: classes.pooltogether }} />
                        oolTogether
                    </Link>
                </Typography>
            </CardActions>
        </Card>
    )
}
