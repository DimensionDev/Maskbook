import {
    AppBar,
    Box,
    Grid,
    makeStyles,
    Toolbar,
    Typography,
    Drawer,
    useMediaQuery,
    Theme,
    IconButton,
} from '@material-ui/core'
import { Menu as MenuIcon, Close as CloseIcon } from '@material-ui/icons'
import { ErrorBoundary } from '@dimensiondev/maskbook-theme'
import clz from 'classnames'
import { Navigation } from './Navigation'
import { useEffect, useState } from 'react'
import Color from 'color'

export interface DashboardFrameProps extends React.PropsWithChildren<{}> {
    title: React.ReactNode | string
    primaryAction?: React.ReactNode
}

const useStyles = makeStyles((theme) => ({
    appBar: {},
    toolbar: {
        [theme.breakpoints.up(1184)]: {
            paddingLeft: theme.spacing(0),
        },
        [theme.breakpoints.down(1184)]: {
            paddingLeft: theme.spacing(1),
        },
    },
    root: {
        backgroundColor: theme.palette.background.paper,
        height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
    },
    temporaryDrawer: {
        width: 232,
        // Or theme.xxx.width?
        // like width: theme.layout.navigation.width,
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
    },
    shape: {
        height: '100%',
        padding: theme.spacing(2),
        borderTopLeftRadius: Number(theme.shape.borderRadius) * 5,
        borderTopRightRadius: Number(theme.shape.borderRadius) * 5,
    },
    shapeHelper: {
        backgroundColor: theme.palette.background.default,
        paddingBottom: theme.spacing(0),
    },
    container: {
        backgroundColor: theme.palette.background.paper,
    },
    logo: {
        [theme.breakpoints.up(1184)]: {
            paddingLeft: theme.spacing(7),
        },
        [theme.breakpoints.down(1184)]: {
            flexBasis: 212,
            maxWidth: 212,
        },
    },
    title: {
        minHeight: 40,
        alignItems: 'center',
        paddingLeft: theme.spacing(4.25),
        [theme.breakpoints.down(1184)]: {
            flex: 1,
        },
    },
    menuButton: {
        paddingLeft: theme.spacing(1.5),
        paddingRight: theme.spacing(1.5),
    },
}))

export function DashboardFrame(props: DashboardFrameProps) {
    const classes = useStyles()
    const left = typeof props.title === 'string' ? <Typography variant="h6">{props.title}</Typography> : props.title
    const right = props.primaryAction
    const matches = useMediaQuery<Theme>((theme) => theme.breakpoints.down(1184))

    const [open, setOpen] = useState(false)

    useEffect(() => {
        setOpen(false)
    }, [matches])

    return (
        <>
            <AppBar position="relative" color="inherit" elevation={0} className={classes.appBar}>
                <Toolbar component={Grid} container className={classes.toolbar}>
                    <Grid item xs={2} container alignItems="center" className={classes.logo}>
                        {matches && (
                            <IconButton onClick={() => setOpen(!open)} className={classes.menuButton}>
                                {open ? <CloseIcon /> : <MenuIcon />}
                            </IconButton>
                        )}
                        <img height={40} alt="Mask Logo" src="https://mask.io/assets/icons/logo.svg" />
                    </Grid>
                    <Grid item xs={10} container className={classes.title}>
                        {left}
                        <Box sx={{ flex: 1 }} />
                        {right}
                    </Grid>
                </Toolbar>
            </AppBar>
            <Grid container className={classes.root}>
                {!matches ? (
                    <Grid xs={2} item>
                        <Navigation />
                    </Grid>
                ) : (
                    <Drawer
                        open={open}
                        onClose={() => setOpen(false)}
                        BackdropProps={{ invisible: true }}
                        PaperProps={{ elevation: 0 }}
                        variant="temporary"
                        // className={classes.temporaryDrawer}
                        classes={{ paper: classes.temporaryPaper }}>
                        <Navigation />
                    </Drawer>
                )}
                <Grid item xs className={clz(classes.containment)}>
                    <div className={clz(classes.shapeHelper, classes.shape)}>
                        <div className={clz(classes.container, classes.shape)}>
                            <ErrorBoundary>{props.children}</ErrorBoundary>
                        </div>
                    </div>
                </Grid>
            </Grid>
        </>
    )
}
