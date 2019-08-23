import React from 'react'
import { HashRouter as Router, Route, Link } from 'react-router-dom'
import ReactDOM from 'react-dom'

import Welcome from './extension/options-page/Welcome'
import Privacy from './extension/options-page/Privacy'

import { ThemeProvider } from '@material-ui/styles'
import { MaskbookLightTheme } from './utils/theme'
import { geti18nString } from './utils/i18n'
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles'
import {
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CssBaseline,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Hidden,
    Drawer,
    Link as MuiLink,
} from '@material-ui/core'
import Menu from '@material-ui/icons/Menu'
import NearMe from '@material-ui/icons/NearMe'
import Assignment from '@material-ui/icons/Assignment'
import Phonelink from '@material-ui/icons/Phonelink'
import { ExportData } from './components/MobileImportExport/Export'
import { uiSetup } from './setup'

uiSetup()
const drawerWidth = 240
const empty = (
    <div
        style={{
            background: '#232D36 url(https://maskbook.com/img/bg--warai-kamen.svg) fixed repeat',
            width: '100%',
            height: 'calc(100vh - 64px)',
        }}
    />
)
const OptionsPageRouters = (
    <>
        <Route exact path="/" component={() => empty} />
        <Route path="/welcome" component={Welcome} />
        <Route path="/privacy" component={() => Privacy} />
        <Route path="/mobile-setup" component={ExportData} />
    </>
)
const Links1st = (
    <>
        <LinkItem icon={<NearMe />} title={geti18nString('options_index_setup')} to="/welcome" />
        <LinkItem icon={<Phonelink />} title={geti18nString('options_index_mobile_export')} to="/mobile-setup" />
    </>
)
const Links2rd = (
    <>
        <LinkItem icon={<Assignment />} title={geti18nString('options_index_privacy')} to="/privacy" />
    </>
)

const useStyles = makeStyles((theme: Theme) =>
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
            // paddingLeft: theme.spacing(3),
            // paddingRight: theme.spacing(3),
        },
    }),
)
document.body.innerHTML = ''
const root = document.createElement('div')
ReactDOM.render(<ResponsiveDrawer />, root)
document.body.appendChild(root)
function ResponsiveDrawer() {
    const classes = useStyles()
    const theme = useTheme()
    const [mobileOpen, setMobileOpen] = React.useState(false)

    function handleDrawerToggle() {
        setMobileOpen(!mobileOpen)
    }

    const drawer = (
        <div>
            <div className={classes.toolbar} />
            <Divider />
            <List onClick={handleDrawerToggle}>{Links1st}</List>
            <Divider />
            <List onClick={handleDrawerToggle}>{Links2rd}</List>
        </div>
    )

    return (
        <ThemeProvider theme={MaskbookLightTheme}>
            <style>{'body {overflow-x: hidden;}'}</style>
            <Router>
                <div className={classes.root}>
                    <CssBaseline />
                    <AppBar position="fixed" className={classes.appBar}>
                        <Toolbar>
                            <IconButton
                                color="inherit"
                                // Todo: i18n
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                className={classes.menuButton}>
                                <Menu />
                            </IconButton>
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
                        <Hidden smUp>
                            <Drawer
                                variant="temporary"
                                anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                                open={mobileOpen}
                                onClose={handleDrawerToggle}
                                classes={{ paper: classes.drawerPaper }}
                                ModalProps={{ keepMounted: true }}>
                                {drawer}
                            </Drawer>
                        </Hidden>
                        <Hidden xsDown>
                            <Drawer classes={{ paper: classes.drawerPaper }} variant="permanent" open>
                                {drawer}
                            </Drawer>
                        </Hidden>
                    </nav>
                    <main className={classes.content}>
                        <div className={classes.toolbar} />
                        {OptionsPageRouters}
                    </main>
                </div>
            </Router>
        </ThemeProvider>
    )
}
function LinkItem(props: { to: string; icon: React.ReactElement; title: string }) {
    return (
        <MuiLink component={Link} to={props.to}>
            <ListItem button>
                <ListItemIcon>{props.icon}</ListItemIcon>
                <ListItemText primary={props.title} />
            </ListItem>
        </MuiLink>
    )
}
