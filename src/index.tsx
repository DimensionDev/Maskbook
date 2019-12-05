import './provider.worker'

import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Container,
    CssBaseline,
    useMediaQuery,
    Box,
    Tabs,
    Tab,
} from '@material-ui/core'

import CloseIcon from '@material-ui/icons/Close'
import BookmarkIcon from '@material-ui/icons/Bookmark'
import CachedIcon from '@material-ui/icons/Cached'
import SettingsIcon from '@material-ui/icons/Settings'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import LocationOnIcon from '@material-ui/icons/LocationOn'

import React from 'react'
import { ThemeProvider } from '@material-ui/styles'
import { MaskbookDarkTheme, MaskbookLightTheme } from './utils/theme'
import { HashRouter as Router, Route, Switch, Redirect, useRouteMatch, useLocation, useHistory } from 'react-router-dom'
import { makeStyles, createStyles } from '@material-ui/core/styles'

import './setup.ui'
import { SSRRenderer } from './utils/SSRRenderer'

import Welcome from './extension/options-page/Welcome'
import BackupDialog from './extension/options-page/Backup'

import { SnackbarProvider } from 'notistack'
import Services from './extension/service'
import { geti18nString } from './utils/i18n'
import ResponsiveDrawer from './extension/options-page/Drawer'

import { DialogRouter } from './extension/options-page/DashboardDialogs/DialogBase'
import DashboardHomePage from './extension/options-page/Home'
import DashboardDebugPage from './extension/options-page/Debug'
import DashboardInitializeDialog from './extension/options-page/Initialize'
import { useMyIdentities } from './components/DataSource/useActivatedUI'
import classNames from 'classnames'

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
        tabBar: {},
        tabItem: {
            minWidth: 120,
        },
        tabSelected: {
            background: 'rgba(237, 243, 254, 0.8)',
        },
    }),
)

const OptionsPageRouters = (
    <>
        <Switch>
            <Route path="/home/" component={DashboardHomePage} />
            <Route path="/welcome" component={Welcome} />
            <Route path="/debug/" component={DashboardDebugPage}></Route>
            <Route path="/backup" component={() => <BackupDialog />} />
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

    const [exportLoading, setExportLoading] = React.useState(false)

    const identities = useMyIdentities()

    const exportData = () => {
        setExportLoading(true)
        Services.Welcome.backupMyKeyPair({
            download: true,
            onlyBackupWhoAmI: false,
        })
            .catch(alert)
            .then(() => setExportLoading(false))
    }
    const shouldRenderAppbar = webpackEnv.firefoxVariant === 'GeckoView' || webpackEnv.target === 'WKWebview'
    const shouldNotRenderAppbar = useMediaQuery('(min-width:1024px)')

    const routers: [string, string, JSX.Element][] = [
        ['Home', '/home/', <BookmarkIcon />],
        ['Device', '/device/', <CachedIcon />],
        ['Settings', '/settings/', <SettingsIcon />],
        ['About', '/about/', <InfoOutlinedIcon />],
        ['Debug', '/debug/', <LocationOnIcon />],
    ]

    const history = useHistory()
    const currentRouter = useLocation()
    const value = routers.findIndex(i => currentRouter.pathname.startsWith(i[1]))

    const tabBar = (
        <AppBar position="sticky" color="default" elevation={0}>
            <Tabs
                value={value}
                variant="scrollable"
                scrollButtons="desktop"
                onChange={(e, v) => history.push(routers[v][1])}
                indicatorColor="primary"
                textColor="primary">
                className={classes.tabBar}
                {routers.map(tab => (
                    <Tab className={classes.tabItem} classes={{ selected: classes.tabSelected }} label={tab[0]} />
                ))}
            </Tabs>
        </AppBar>
    )

    return (
        <div className={classes.wrapper}>
            <ResponsiveDrawer routers={routers} exitDashboard={shouldRenderAppbar ? () => window.close() : null} />
            <section className={classes.container}>
                {(shouldRenderAppbar ? true : !shouldNotRenderAppbar) && (
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h6">Maskbook</Typography>
                            {shouldRenderAppbar && (
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
                {!shouldNotRenderAppbar && tabBar}
                <Container>
                    <main className={classes.root}>{OptionsPageRouters}</main>
                </Container>
            </section>
        </div>
    )
}

SSRRenderer(<DashboardWithProvider />)
