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
