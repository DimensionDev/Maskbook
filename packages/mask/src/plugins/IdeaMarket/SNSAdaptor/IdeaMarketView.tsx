import { useCallback, useState } from 'react'
import { MaskTextIcon } from '@masknet/icons'
import { LoadingAnimation } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Card, CardActions, CardContent, CardHeader, Link, Paper, Tab, Tabs, Typography } from '@mui/material'
import { useI18N } from '../../../utils'
import { useFetchIdeaToken } from '../hooks/useFetchIdeaToken'
import { StatsView } from './StatsView'
import { ChartsView } from '../SNSAdaptor/ChartsView'
import { BoughtTogetherView } from '../SNSAdaptor/BoughtTogetherView'
import { IdeaTokenViewDeck } from '../SNSAdaptor/IdeaTokenViewDeck'
import IdeaMarketIcon from '../icons/IdeaMarketIcon'
import { BASE_URL } from '../constants'
import { ContentView } from './ContentView'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            boxShadow: 'none',
            border: `solid 1px ${theme.palette.divider}`,
            padding: 0,
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
        mask: {
            width: 40,
            height: 10,
        },
        dhedge: {
            height: 10,
            margin: theme.spacing(0, 0.5),
        },
        empty: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: theme.spacing(8, 0),
        },
        message: {
            textAlign: 'center',
        },
    }
})

interface IdeaMarketViewProps {
    marketName: string
    ideaName: string
}

export function IdeaMarketView(props: IdeaMarketViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [tabIndex, setTabIndex] = useState(0)
    const { value: ideaToken, error, loading } = useFetchIdeaToken(props.marketName, props.ideaName)
    const tabCallback = useCallback((): void => setTabIndex(0), [])

    if (loading) {
        return (
            <div className={classes.empty}>
                <LoadingAnimation />
            </div>
        )
    }

    if (!ideaToken) {
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_ideamarket_token_not_found')}
            </Typography>
        )
    }

    if (error) {
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_ideamarket_smthg_wrong')}
            </Typography>
        )
    }

    const tabs = [
        <Tab className={classes.tab} key="stats" label={t('plugin_dhedge_tab_stats')} />,
        <Tab className={classes.tab} key="content" label={t('plugin_ideamarket_tab_content')} />,
        <Tab className={classes.tab} key="chart" label={t('plugin_dhedge_tab_chart')} />,
        <Tab className={classes.tab} key="boughttogether" label={t('plugin_ideamarket_tab_bought_together')} />,
    ].filter(Boolean)

    return (
        <Card className={classes.root} elevation={0}>
            <CardHeader subheader={<IdeaTokenViewDeck ideaToken={ideaToken} />} />
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
                    {tabIndex === 0 ? <StatsView ideaToken={ideaToken} /> : null}
                    {tabIndex === 1 ? <ContentView ideaToken={ideaToken} /> : null}
                    {tabIndex === 2 ? <ChartsView ideaToken={ideaToken} /> : null}
                    {tabIndex === 3 ? <BoughtTogetherView ideaToken={ideaToken} setTabIndex={setTabIndex} /> : null}
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
                        <MaskTextIcon classes={{ root: classes.mask }} viewBox="0 0 80 20" />
                    </Link>
                </Typography>
                <Typography className={classes.footnote} variant="subtitle2">
                    <span>{t('supported_by')}</span>
                    <Link
                        className={classes.footLink}
                        target="_blank"
                        color="textSecondary"
                        rel="noopener noreferrer"
                        title="dHEDGE"
                        href={BASE_URL}>
                        <IdeaMarketIcon height="10px" />
                        {t('plugin_ideamarket_ideamarket')}
                    </Link>
                </Typography>
            </CardActions>
        </Card>
    )
}
