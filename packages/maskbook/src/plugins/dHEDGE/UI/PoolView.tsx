import React, { useState } from 'react'
import {
    makeStyles,
    Tab,
    Tabs,
    Typography,
    Link,
    Card,
    CardActions,
    CardContent,
    Paper,
    CardHeader,
} from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useFetchPool } from '../hooks/usePool'
import { PoolViewDeck } from './PoolViewDeck'
import { PoolStats } from './PoolStats'
import { PerformanceChart } from './PerformanceChart'
import { useERC20TokenDetailed } from '../../../web3/hooks/useERC20TokenDetailed'
import StableCoins from '../../../web3/hooks/stables_coins.json'
import { MaskbookTextIcon } from '../../../resources/MaskbookIcon'
import { RefreshIcon } from '@dimensiondev/icons'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
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
    maskbook: {
        width: 40,
        height: 10,
    },
    dhedge: {
        height: 10,
        margin: theme.spacing(0, 0.5),
    },
}))

interface PoolViewProps {
    address: string
}

export function PoolView(props: PoolViewProps) {
    const { address } = props

    const { t } = useI18N()
    const classes = useStyles()

    //#region susd token
    const SUSD = StableCoins.find((x) => x.symbol == 'sUSD')
    const {
        value: susdTokenDetailed,
        loading: loadingToken,
        retry: retryToken,
        error: errorToken,
    } = useERC20TokenDetailed(SUSD?.id ?? '')
    //#endregion

    //#region fetch pool
    const { value: pool, error: errorPool, loading: loadingPool, retry: retryPool } = useFetchPool(address)
    //#endregion

    //#region tabs
    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [
        <Tab className={classes.tab} key="stats" label={t('plugin_dhedge_tab_stats')} />,
        <Tab className={classes.tab} key="chart" label={t('plugin_dhedge_tab_chart')} />,
    ].filter(Boolean)
    //#endregion

    if (loadingPool || loadingToken)
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_dhedge_loading')}
            </Typography>
        )
    if (!pool)
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_dhedge_pool_not_found')}
            </Typography>
        )
    if (errorPool || errorToken || !susdTokenDetailed)
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_dhedge_smt_wrong')}
                <RefreshIcon className={classes.refresh} color="primary" onClick={errorPool ? retryPool : retryToken} />
            </Typography>
        )
    return (
        <Card className={classes.root} elevation={0}>
            <CardHeader subheader={<PoolViewDeck pool={pool} inputToken={susdTokenDetailed} />} />
            <CardContent className={classes.content}>
                <Tabs
                    className={classes.tabs}
                    indicatorColor="primary"
                    textColor="primary"
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
                    {tabIndex === 0 ? <PoolStats pool={pool} /> : null}
                    {tabIndex === 1 ? <PerformanceChart pool={pool} /> : null}
                </Paper>
            </CardContent>
            <CardActions className={classes.footer}>
                <Typography className={classes.footnote} variant="subtitle2">
                    <span>Powered by </span>
                    <Link
                        className={classes.footLink}
                        color="textSecondary"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Mask"
                        href="https://mask.io">
                        <MaskbookTextIcon classes={{ root: classes.maskbook }} viewBox="0 0 80 20" />
                    </Link>
                </Typography>
                <Typography className={classes.footnote} variant="subtitle2">
                    <span>Supported by</span>
                    <Link
                        className={classes.footLink}
                        target="_blank"
                        color="textSecondary"
                        rel="noopener noreferrer"
                        title="dHEDGE"
                        href="https://dhedge.org">
                        <img className={classes.dhedge} src="https://app.dhedge.org/favicon.ico" />
                        dHEDGE
                    </Link>
                </Typography>
            </CardActions>
        </Card>
    )
}
