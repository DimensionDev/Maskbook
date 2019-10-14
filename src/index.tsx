import './provider.worker'
import React, { useCallback } from 'react'
import { HashRouter, MemoryRouter, Route, Link, useRouteMatch, useHistory } from 'react-router-dom'

import Empty from './extension/options-page/Empty'
import Welcome from './extension/options-page/Welcome'
import Privacy from './extension/options-page/Privacy'
import Developer from './extension/options-page/Developer'

import { ThemeProvider } from '@material-ui/styles'
import { MaskbookLightTheme, MaskbookDarkTheme } from './utils/theme'
import { geti18nString } from './utils/i18n'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import {
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Hidden,
    Drawer,
    Link as MuiLink,
    useMediaQuery,
    BottomNavigation,
    BottomNavigationAction,
} from '@material-ui/core'
import NearMe from '@material-ui/icons/NearMe'
import Assignment from '@material-ui/icons/Assignment'
import Phonelink from '@material-ui/icons/Phonelink'
import Code from '@material-ui/icons/Code'
import ArrowBack from '@material-ui/icons/ArrowBack'
import { ExportData } from './components/MobileImportExport/Export'
import './setup.ui'
import { SSRRenderer } from './utils/SSRRenderer'

const drawerWidth = 240
const OptionsPageRouters = (
    <>
        <Route exact path="/" component={() => Empty} />
        <Route path="/welcome" component={Welcome} />
        <Route path="/privacy" component={() => Privacy} />
        <Route path="/developer" component={Developer} />
        <Route path="/mobile-setup" component={ExportData} />
    </>
)
const Links1st = (
    <>
        <LinkItem icon={<NearMe />} label={geti18nString('options_index_setup')} to="/welcome" />
        <LinkItem icon={<Phonelink />} label={geti18nString('options_index_mobile_export')} to="/mobile-setup" />
        <LinkItem icon={<Code />} label={geti18nString('options_index_dev')} to="/developer" />
    </>
)
const Links2nd = (
    <>
        <LinkItem icon={<Assignment />} label={geti18nString('options_index_privacy')} to="/privacy" />
    </>
)

const useStyles = makeStyles(theme =>
    createStyles({
        root: {
            display: 'flex',
        },
        logo: {
            height: 54,
            marginBottom: -10,
        },
        drawer: {
            [theme.breakpoints.up('sm')]: {
                width: drawerWidth,
                flexShrink: 0,
            },
        },
        appBar: {
            marginLeft: drawerWidth,
            zIndex: theme.zIndex.drawer + 1,
        },
        menuButton: {
            marginRight: theme.spacing(2),
            [theme.breakpoints.up('sm')]: {
                display: 'none',
            },
        },
        toolbar: theme.mixins.toolbar,
        drawerPaper: {
            width: drawerWidth,
        },
        content: {
            flexGrow: 1,
            width: '100%',
        },
        bottomNavigationRoot: {
            position: 'fixed',
            bottom: 0,
            width: '100%',
        },
        bottomNavigationMargin: {
            height: 56 + 12,
        },
    }),
)

SSRRenderer(<ResponsiveDrawer />)
function ResponsiveDrawer() {
    const classes = useStyles()
    const drawer = (
        <div>
            <div className={classes.toolbar} />
            <Divider />
            <List>{Links1st}</List>
            <Divider />
            <List>
                {Links2nd}
                {(webpackEnv.firefoxVariant === 'GeckoView' || webpackEnv.target === 'WKWebview') && (
                    <MuiLink color="textPrimary" component={Link} to="/" onClick={window.close}>
                        <ListItem button>
                            <ListItemIcon>
                                <ArrowBack />
                            </ListItemIcon>
                            <ListItemText primary="Back" />
                        </ListItem>
                    </MuiLink>
                )}
            </List>
        </div>
    )

    const isDarkTheme = useMediaQuery('(prefers-color-scheme: dark)')
    const Router = (typeof window === 'object' ? HashRouter : MemoryRouter) as typeof HashRouter

    return (
        <ThemeProvider theme={isDarkTheme ? MaskbookDarkTheme : MaskbookLightTheme}>
            <style>{'body {overflow-x: hidden;} a {color:unset;}'}</style>
            <Router>
                <div className={classes.root}>
                    <CssBaseline />
                    <AppBar position="fixed" className={classes.appBar}>
                        <Toolbar>
                            <Typography variant="h6" noWrap>
                                <img
                                    className={classes.logo}
                                    src="https://maskbook.com/img/maskbook--logotype-white.png"
                                    alt="Maskbook"
                                />
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <nav className={classes.drawer}>
                        <Hidden xsDown>
                            <Drawer classes={{ paper: classes.drawerPaper }} variant="permanent" open>
                                {drawer}
                            </Drawer>
                        </Hidden>
                    </nav>
                    <main className={classes.content} style={{ display: 'relative' }}>
                        <div className={classes.toolbar} />
                        <div style={{ display: 'absolute' }}>{OptionsPageRouters}</div>
                        <Hidden smUp>
                            <div className={classes.bottomNavigationMargin} />
                            <BottomNavigation classes={{ root: classes.bottomNavigationRoot }}>
                                {Links1st}
                                {Links2nd}
                            </BottomNavigation>
                        </Hidden>
                    </main>
                </div>
            </Router>
        </ThemeProvider>
    )
}
function LinkItem(props: { to: string; icon: React.ReactElement; label: string }) {
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'))
    const selected = useRouteMatch(props.to) !== null
    const history = useHistory()
    const onClick = useCallback(() => {
        history.push(props.to)
    }, [history, props.to])
    const pc = (
        <MuiLink color="textPrimary" component={Link} to={props.to}>
            <ListItem selected={selected} button>
                <ListItemIcon>{props.icon}</ListItemIcon>
                <ListItemText primary={props.label} />
            </ListItem>
        </MuiLink>
    )
    const mobile = (
        <BottomNavigationAction onClick={onClick} selected={selected} showLabel label={props.label} icon={props.icon} />
    )
    return isMobile ? mobile : pc
}
