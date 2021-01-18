import { makeStyles, useMediaQuery, Toolbar, Theme, Typography, AppBar, Grid, Box } from '@material-ui/core'
import Color from 'color'
import clz from 'classnames'
import { Navigation } from './Navigation'
import { ErrorBoundary } from '@dimensiondev/maskbook-theme'

const useStyles = makeStyles((theme) => ({
    root: { backgroundColor: theme.palette.background.paper },
    temporaryDrawerPaper: {
        backgroundColor: new Color(theme.palette.background.paper).alpha(0.8).toString(),
        backdropFilter: 'blur(4px)',
    },
    permanentDrawer: { height: '100vh' },
    containment: { overflow: 'auto', contain: 'strict' },
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
    container: { backgroundColor: theme.palette.background.paper },
}))
export interface DashboardFrameProps extends React.PropsWithChildren<{}> {}
export function DashboardFrame(props: DashboardFrameProps) {
    const classes = useStyles()
    const menuStyle = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))
    return (
        <>
            <Grid container className={classes.root}>
                <Grid item xs={2} className={classes.permanentDrawer}>
                    <Navigation />
                </Grid>
                <Grid container direction="column" item xs={10}>
                    <ErrorBoundary>{props.children}</ErrorBoundary>
                </Grid>
            </Grid>
        </>
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
    return (
        <>
            <AppBar position="relative" color="inherit" elevation={0}>
                <Toolbar component={Grid} container>
                    {left}
                    <Box sx={{ flex: 1 }} />
                    {right}
                </Toolbar>
            </AppBar>
            <Grid item xs className={classes.containment}>
                <div className={clz(classes.shapeHelper, classes.shape)}>
                    <div className={clz(classes.container, classes.shape)}>
                        <ErrorBoundary>{props.children}</ErrorBoundary>
                    </div>
                </div>
            </Grid>
        </>
    )
}
