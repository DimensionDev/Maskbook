import './provider.worker'

import { AppBar, Toolbar, IconButton, Typography, Container, CssBaseline, useMediaQuery } from '@material-ui/core'

import BackIcon from '@material-ui/icons/ArrowBack'

import React from 'react'
import { ThemeProvider } from '@material-ui/styles'
import { MaskbookDarkTheme, MaskbookLightTheme } from './utils/theme'
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
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
                <Dashboard></Dashboard>
            </SnackbarProvider>
        </ThemeProvider>
    )
}

function Dashboard() {
    const classes = useStyles()

    const [currentTab, setCurrentTab] = React.useState(0)
    const [exportLoading, setExportLoading] = React.useState(false)

    const identities = useMyIdentities()

    const handleTabChange = (_: React.ChangeEvent<{}>, newValue: number) => {
        setCurrentTab(newValue)
    }

    const exportData = () => {
        setExportLoading(true)
        Services.Welcome.backupMyKeyPair({
            download: true,
            onlyBackupWhoAmI: false,
        })
            .catch(alert)
            .then(() => setExportLoading(false))
    }

    const shouldRenderBackButton = webpackEnv.firefoxVariant === 'GeckoView' || webpackEnv.target === 'WKWebview'
    const shouldRenderCloseButton = webpackEnv.firefoxVariant === 'GeckoView' || webpackEnv.target === 'WKWebview'

    return (
        <Router>
            <CssBaseline />
            <div className={classes.wrapper}>
                <ResponsiveDrawer exitDashboard={shouldRenderCloseButton ? () => window.close() : null} />
                <section className={classes.container}>
                    <AppBar position="sticky">
                        <Toolbar>
                            {shouldRenderCloseButton && (
                                <IconButton
                                    onClick={() => window.close()}
                                    edge="start"
                                    color="inherit"
                                    aria-label="back">
                                    <BackIcon />
                                </IconButton>
                            )}
                            <Typography variant="h6">Maskbook</Typography>
                        </Toolbar>
                    </AppBar>
                    <Container>
                        <main className={classes.root}>{OptionsPageRouters}</main>
                    </Container>
                </section>
            </div>
        </Router>
    )
}

SSRRenderer(<DashboardWithProvider />)
