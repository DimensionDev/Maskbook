import {
    makeStyles,
    useMediaQuery,
    Toolbar,
    Theme,
    Typography,
    AppBar,
    Grid,
    Box,
    IconButton,
    Drawer,
} from '@material-ui/core'
import { Menu as MenuIcon, Close as CloseIcon } from '@material-ui/icons'
import Color from 'color'
import clz from 'classnames'
import { Navigation } from './Navigation'
import { ErrorBoundary } from '@dimensiondev/maskbook-theme'
import { useState, useEffect, useContext } from 'react'
import { DashboardContext } from './context'

const useStyles = makeStyles((theme) => ({
    root: { backgroundColor: theme.palette.background.paper },
    toolbar: {
        [theme.breakpoints.up('lg')]: {
            paddingLeft: theme.spacing(0),
        },
        [theme.breakpoints.down('lg')]: {
            paddingLeft: theme.spacing(1),
        },
    },
    logo: {
        flexBasis: 212,
        maxWidth: 212,
    },
    menuButton: {
        paddingLeft: theme.spacing(1.5),
        paddingRight: theme.spacing(1.5),
    },
    title: {
        minHeight: 40,
        alignItems: 'center',
        paddingLeft: theme.spacing(4.25),
        [theme.breakpoints.down('lg')]: {
            flex: 1,
        },
    },
    drawerRoot: {
        top: `${theme.mixins.toolbar.minHeight}px!important`,
    },
    drawerBackdropRoot: {
        top: theme.mixins.toolbar.minHeight,
    },
    temporaryDrawerPaper: {
        backgroundColor: new Color(theme.palette.background.paper).alpha(0.8).toString(),
        backdropFilter: 'blur(4px)',
    },
    permanentDrawer: {
        height: '100vh',
        [theme.breakpoints.up('lg')]: {
            minWidth: 232,
        },
    },
    rightContainer: {
        flex: 1,
    },
    temporaryPaper: {
        width: 232,
        top: theme.mixins.toolbar.minHeight,
        paddingTop: theme.spacing(7.5),
        background: new Color(theme.palette.background.paper).alpha(0.8).toString(),
        backdropFilter: 'blur(4px)',
    },
    containment: {
        overflow: 'auto',
        contain: 'strict',
        [theme.breakpoints.down('lg')]: {
            minHeight: '100vh',
        },
    },
    shape: {
        height: '100%',
        padding: theme.spacing(2),
        borderTopLeftRadius: Number(theme.shape.borderRadius) * 5,
        borderTopRightRadius: Number(theme.shape.borderRadius) * 5,
    },
    shapeHelper: {
        backgroundColor: theme.palette.background.default,
        paddingBottom: 0,
    },
    container: {
        backgroundColor: theme.palette.background.paper,
    },
}))

export interface DashboardFrameProps extends React.PropsWithChildren<{}> {}

export function DashboardFrame(props: DashboardFrameProps) {
    const classes = useStyles()
    const matches = useMediaQuery<Theme>((theme) => theme.breakpoints.down('lg'))
    const [navigationExpanded, setNavigationExpanded] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)

    return (
        <DashboardContext.Provider
            value={{
                drawerOpen,
                expanded: navigationExpanded,
                toggleNavigationExpand: () => setNavigationExpanded((e) => !e),
                toggleDrawer: () => setDrawerOpen((e) => !e),
            }}>
            <Grid container className={classes.root}>
                {!matches && (
                    <Grid item xs={2} className={classes.permanentDrawer}>
                        <Navigation />
                    </Grid>
                )}
                <Grid container direction="column" item xs={matches ? 12 : 10} className={classes.rightContainer}>
                    <ErrorBoundary>{props.children}</ErrorBoundary>
                </Grid>
            </Grid>
        </DashboardContext.Provider>
    )
}

export interface PageFrameProps extends React.PropsWithChildren<{}> {
    title: React.ReactNode | string
    primaryAction?: React.ReactNode
}

export function PageFrame(props: PageFrameProps) {
    const classes = useStyles()
    const left = typeof props.title === 'string' ? <Typography variant="h6">{props.title}</Typography> : props.title
    const right = props.primaryAction
    const matches = useMediaQuery<Theme>((theme) => theme.breakpoints.down('lg'))
    const { drawerOpen, toggleDrawer } = useContext(DashboardContext)
    return (
        <>
            <AppBar position="relative" color="inherit" elevation={0}>
                <Toolbar component={Grid} container className={classes.toolbar}>
                    {matches && (
                        <Grid item xs={2} container alignItems="center" className={classes.logo}>
                            <IconButton onClick={toggleDrawer} className={classes.menuButton}>
                                {drawerOpen ? <CloseIcon /> : <MenuIcon />}
                            </IconButton>

                            <img height={40} alt="Mask Logo" src="https://mask.io/assets/icons/logo.svg" />
                        </Grid>
                    )}
                    <Grid item xs={matches ? 10 : 12} container className={classes.title}>
                        {left}
                        <Box sx={{ flex: 1 }} />
                        {right}
                    </Grid>
                </Toolbar>
            </AppBar>
            <Grid item xs className={classes.containment}>
                {matches && (
                    <Drawer
                        open={drawerOpen}
                        onClose={toggleDrawer}
                        BackdropProps={{ invisible: true }}
                        PaperProps={{ elevation: 0 }}
                        variant="temporary"
                        ModalProps={{
                            BackdropProps: {
                                classes: { root: classes.drawerBackdropRoot },
                            },
                        }}
                        classes={{ paper: classes.temporaryPaper, root: classes.drawerRoot }}>
                        <Navigation />
                    </Drawer>
                )}
                <div className={clz(classes.shapeHelper, classes.shape)}>
                    <div className={clz(classes.container, classes.shape)}>
                        <ErrorBoundary>{props.children}</ErrorBoundary>
                    </div>
                </div>
            </Grid>
        </>
    )
}
