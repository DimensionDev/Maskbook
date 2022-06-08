import { useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Card, CardContent, Paper, Tab, Tabs } from '@mui/material'
import { useI18N } from '../../../utils'
import { ListingsView } from './ListingsView'
import { AccountView } from './AccountView'
import classNames from 'classnames'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            boxShadow: 'none',
            padding: 0,
            borderRadius: 0,
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
            borderRadius: 5,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            border: `solid 1px ${theme.palette.divider}`,
        },
        tabs: {
            width: '100%',
            minHeight: 'unset',
            paddingBottom: '10px',
        },
        tab: {
            minHeight: 'unset',
            fontWeight: '400',
            '&:nth-child(1)': {
                borderRadius: '4px 0 0 4px',
            },
            '&:nth-child(2)': {
                borderRadius: ' 0 4px 4px 0',
            },
        },
        disabledTab: {
            opacity: 0.5,
        },
        focusTab: {
            backgroundColor: theme.palette.primary.main,
            color: '#fff !important',
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
        <Tab
            className={classNames(classes.tab, tabIndex === 0 ? classes.focusTab : '')}
            key="listings"
            label={t('plugin_ideamarket_tab_listings')}
        />,
        <Tab
            className={classNames(classes.tab, tabIndex === 1 ? classes.focusTab : '')}
            key="account"
            label={t('plugin_ideamarket_tab_account')}
        />,
    ]

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
