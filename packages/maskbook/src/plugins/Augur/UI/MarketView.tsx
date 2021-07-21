import { RefreshIcon } from '@masknet/icons'
import { Card, CardActions, CardContent, Link, makeStyles, Paper, Tab, Tabs, Typography } from '@material-ui/core'
import React, { useState } from 'react'
import { MaskbookTextIcon } from '../../../resources/MaskbookIcon'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { Market } from '../types'

import { MarketDescription } from './MarketDescription'
import { MarketOdds } from './MarketOdds'
import { MarketBuySell } from './MarketBuySell'

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
}))

interface MarketViewProps {
    market?: Market
    loading?: Boolean
    error?: Error
    retry?: () => void
}

export function MarketView(props: MarketViewProps) {
    const { market, loading, error, retry } = props

    const { t } = useI18N()
    const classes = useStyles()

    //#region tabs
    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [
        <Tab className={classes.tab} key="description" label={t('plugin_augur_tab_description')} />,
        <Tab className={classes.tab} key="chart" label={t('plugin_augur_tab_chart')} />,
        <Tab className={classes.tab} key="buysell" label={t('plugin_augur_tab_buysell')} />,
    ].filter(Boolean)
    //#endregion

    if (loading)
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_augur_loading')}
            </Typography>
        )

    // if (!market) {
    //     return (
    //         <Typography className={classes.message} color="textPrimary">
    //             {t('plugin_augur_market_not_found')}
    //         </Typography>
    //     )
    // }

    if (error)
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_augur_smt_wrong')}
                <RefreshIcon className={classes.refresh} color="primary" onClick={retry} />
            </Typography>
        )

    return (
        <Card className={classes.root} elevation={0}>
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
                    {tabIndex === 0 ? <MarketDescription /> : null}
                    {tabIndex === 1 ? <MarketOdds /> : null}
                    {tabIndex === 2 ? <MarketBuySell /> : null}
                </Paper>
            </CardContent>
            <CardActions className={classes.footer}>
                <Typography className={classes.footnote} variant="subtitle2">
                    <span>{t('plugin_powered_by')} </span>
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
                        title="Augur"
                        href="https://www.augur.net/">
                        Augur
                    </Link>
                </Typography>
            </CardActions>
        </Card>
    )
}
