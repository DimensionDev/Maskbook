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
import { Menu as MenuIcon } from '@material-ui/icons'
import { ErrorBoundary } from '@dimensiondev/maskbook-theme'
import clz from 'classnames'
import { Navigation } from './Navigation'
import { useState } from 'react'
import Color from 'color'

export interface DashboardFrameProps extends React.PropsWithChildren<{}> {
    title: React.ReactNode | string
    primaryAction?: React.ReactNode
}

const useStyles = makeStyles((theme) => ({
    appBar: {},
    root: {
        backgroundColor: theme.palette.background.paper,
        height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
    },
    temporaryDrawer: {
        width: 232,
    },
    temporaryPaper: {
        width: 232,
        top: theme.mixins.toolbar.minHeight,
        paddingTop: 60,
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
        paddingBottom: 0,
    },
    container: {
        backgroundColor: theme.palette.background.paper,
    },
    logo: {
        [theme.breakpoints.down(1184)]: {
            flexBasis: 232,
            maxWidth: 232,
        },
    },
    title: {
        minHeight: 40,
        alignItems: 'center',
        [theme.breakpoints.down(1184)]: {
            flex: 1,
        },
    },
}))

export function DashboardFrame(props: DashboardFrameProps) {
    const classes = useStyles()
    const left = typeof props.title === 'string' ? <Typography variant="h6">{props.title}</Typography> : props.title
    const right = props.primaryAction
    const matches = useMediaQuery<Theme>((theme) => theme.breakpoints.down(1184))

    const [open, setOpen] = useState(false)

    return (
        <>
            <AppBar position="relative" color="inherit" elevation={0} className={classes.appBar}>
                <Toolbar component={Grid} container>
                    <Grid item xs={2} container alignItems="center" className={classes.logo}>
                        {matches && (
                            <IconButton onClick={() => setOpen(!open)}>
                                <MenuIcon />
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
