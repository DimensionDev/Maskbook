import './provider.worker'

import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Container,
    CssBaseline,
    useMediaQuery,
    Tabs,
    Tab,
} from '@material-ui/core'

import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
import CloseIcon from '@material-ui/icons/Close'
import BookmarkIcon from '@material-ui/icons/Bookmark'
import LocationOnIcon from '@material-ui/icons/LocationOn'

import React from 'react'
import { ThemeProvider } from '@material-ui/styles'
import { MaskbookDarkTheme, MaskbookLightTheme } from './utils/theme'
import { HashRouter as Router, Route, Switch, Redirect, useLocation, useHistory } from 'react-router-dom'
import { makeStyles, createStyles } from '@material-ui/core/styles'

import './setup.ui'
import { SSRRenderer } from './utils/SSRRenderer'

import { SnackbarProvider } from 'notistack'

import { geti18nString } from './utils/i18n'
import ResponsiveDrawer from './extension/options-page/Drawer'

import { DialogRouter } from './extension/options-page/DashboardDialogs/DialogBase'
import DashboardHomePage from './extension/options-page/Home'
import DashboardDebugPage from './extension/options-page/Debug'
import DashboardInitializeDialog from './extension/options-page/Initialize'
import DashboardWalletsPage from './extension/options-page/Wallets'

const useStyles = makeStyles(theme =>
    createStyles({
        wrapper: {
            display: 'flex',
        },
        container: {
            width: '100%',
            flex: '1 1 auto',
            paddingBottom: 80,
        },
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        logo: {
            height: 100,
            marginBottom: -theme.spacing(1),
            filter: `invert(${theme.palette.type === 'dark' ? '0.9' : '0.1'})`,
        },
        cards: {
            width: '100%',
        },
        actionButtons: {
            margin: theme.spacing(2),
        },
        close: {
            marginLeft: 'auto',
        },
        tabItem: {
            minWidth: 110,
        },
        tabSelected: {
            background: theme.palette.type === 'dark' ? 'rgba(18, 12, 20, 0.6)' : 'rgba(237, 243, 254, 0.8)',
        },
    }),
)

const OptionsPageRouters = (
    <>
        <Switch>
            <Route path="/home/" component={DashboardHomePage} />
            <Route path="/wallets/" component={DashboardWalletsPage} />
            <Route path="/debug/" component={DashboardDebugPage} />
            <DialogRouter path="/initialize" component={DashboardInitializeDialog} onExit={'/'} fullscreen />
            <Redirect path="*" to="/home/" />
        </Switch>
    </>
)

function DashboardWithProvider() {
    const isDarkTheme = useMediaQuery('(prefers-color-scheme: dark)')
    return (
        <ThemeProvider theme={isDarkTheme ? MaskbookDarkTheme : MaskbookLightTheme}>
            <SnackbarProvider
                maxSnack={30}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}>
                <Router>
                    <CssBaseline />
                    <Dashboard></Dashboard>
                </Router>
            </SnackbarProvider>
        </ThemeProvider>
    )
}

function Dashboard() {
    const classes = useStyles()

    const shouldRenderAppBar = webpackEnv.firefoxVariant === 'GeckoView' || webpackEnv.target === 'WKWebview'
    const shouldNotRenderAppBar = useMediaQuery('(min-width:1024px)')

    const routers: [string, string, JSX.Element][] = [
        [geti18nString('home'), '/home/', <BookmarkIcon />],
        ['Wallets', '/wallets/', <AccountBalanceWalletIcon />],
        // ['Settings', '/settings/', <SettingsIcon />],
        // ['About', '/about/', <InfoOutlinedIcon />],
        [geti18nString('debug'), '/debug/', <LocationOnIcon />],
    ]

    const history = useHistory()
    const currentRouter = useLocation()
    const index = routers.findIndex(i => currentRouter.pathname.startsWith(i[1]))
    const value = index < 0 ? 0 : index

    const tabBar = (
        <AppBar position="sticky" color="default" elevation={0}>
            <Tabs
                value={value}
                variant="scrollable"
                scrollButtons="on"
                onChange={(e, v) => history.push(routers[v][1])}
                indicatorColor="primary"
                textColor="primary">
                {routers.map(tab => (
                    <Tab
                        key={`dashboard-tab-${tab[0]}`}
                        className={classes.tabItem}
                        classes={{ selected: classes.tabSelected }}
                        label={tab[0]}
                    />
                ))}
            </Tabs>
        </AppBar>
    )

    return (
        <div className={classes.wrapper}>
            <ResponsiveDrawer routers={routers} exitDashboard={shouldRenderAppBar ? () => window.close() : null} />
            <section className={classes.container}>
                {(shouldRenderAppBar ? true : !shouldNotRenderAppBar) && (
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h6">Maskbook</Typography>
                            {shouldRenderAppBar && (
                                <IconButton
                                    className={classes.close}
                                    onClick={() => window.close()}
                                    edge="end"
                                    color="inherit">
                                    <CloseIcon />
                                </IconButton>
                            )}
                        </Toolbar>
                    </AppBar>
                )}
                {!shouldNotRenderAppBar && tabBar}
                <Container>
                    <main className={classes.root}>{OptionsPageRouters}</main>
                </Container>
            </section>
        </div>
    )
}

SSRRenderer(<DashboardWithProvider />)
