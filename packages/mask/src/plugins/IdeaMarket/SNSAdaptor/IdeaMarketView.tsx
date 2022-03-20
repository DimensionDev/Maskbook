import { useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Card, CardContent, Paper, Tab, Tabs } from '@mui/material'
import { useI18N } from '../../../utils'
import { ListingsView } from './ListingsView'
import { AccountView } from './AccountView'

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
            marginTop: -1,
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

export function IdeaMarketView() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [tabIndex, setTabIndex] = useState(0)

    const tabs = [
        <Tab className={classes.tab} key="listings" label={t('plugin_ideamarket_tab_listings')} />,
        <Tab className={classes.tab} key="account" label={t('plugin_ideamarket_tab_account')} />,
    ].filter(Boolean)

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
                    {tabIndex === 0 ? <ListingsView /> : null}
                    {tabIndex === 1 ? <AccountView /> : null}
                </Paper>
            </CardContent>
        </Card>
    )
}
