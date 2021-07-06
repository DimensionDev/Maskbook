import { RefreshIcon } from '@masknet/icons'
import {
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    Link,
    makeStyles,
    Paper,
    Tab,
    Tabs,
    Typography,
} from '@material-ui/core'
import React, { useState } from 'react'
import { MaskbookTextIcon } from '../../../resources/MaskbookIcon'
import { PoolTogetherIcon } from '../../../resources/PoolTogetherIcon'
import { useI18N } from '../../../utils/i18n-next-ui'
import { usePools } from '../hooks/usePools'
import { Account } from './Account'
import { PoolsView } from './PoolsView'

const useStyles = makeStyles((theme) => ({
    root: {
        // width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
        backgroundColor: '#290b5a',
        textAlign: 'center',
    },
    message: {
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
    const classes = useStyles()

    //#region pools
    const { value: pools, error: error, loading: loading, retry: retry } = usePools()
    //#endregion

    //#region tabs
    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [
        <Tab className={classes.tab} key="pools" label={t('plugin_pooltogether_tab_pools')} />,
        <Tab className={classes.tab} key="account" label={t('plugin_pooltogether_tab_account')} />,
    ].filter(Boolean)
    //#endregion

    if (loading) {
        return <CircularProgress className={classes.progress} color="primary" size={15} />
    }

    if (error) {
        return <RefreshIcon className={classes.refresh} color="primary" onClick={retry} />
    }

    if (!pools) {
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_pooltogether_no_pool')}
            </Typography>
        )
    }

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
                    {tabIndex === 0 ? <PoolsView pools={pools} /> : null}
                    {tabIndex === 1 ? <Account pools={pools} /> : null}
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
