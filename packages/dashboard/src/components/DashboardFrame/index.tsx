import {
    makeStyles,
    List,
    ListItem as _ListItem,
    useMediaQuery,
    Toolbar,
    Theme,
    Typography,
    AppBar,
    Grid,
    Box,
    ListItemText,
    ListItemIcon,
    Collapse,
} from '@material-ui/core'
import { Masks, AccountBalanceWallet, ExpandLess, ExpandMore, Settings } from '@material-ui/icons'
import Color from 'color'
import clz from 'classnames'
import { useState } from 'react'
import { styled } from '@material-ui/core'

const ListItem = styled(_ListItem)(({ theme }) => ({
    '&.Mui-selected': {
        backgroundColor: 'transparent',
        borderRight: '4px solid ' + (theme.palette.mode === 'light' ? theme.palette.action.selected : 'white'),
        // Or?
        // borderRight: '4px solid ' + theme.palette.action.selected,
    },
}))
const NestedListItem = styled(_ListItem)(({ theme }) => ({
    paddingLeft: theme.spacing(9),
}))

const useStyles = makeStyles((theme) => ({
    root: { backgroundColor: theme.palette.background.paper },
    temporaryDrawerPaper: {
        backgroundColor: new Color(theme.palette.background.paper).alpha(0.8).toString(),
        backdropFilter: 'blur(4px)',
    },
    permanentDrawer: { height: '100vh' },
    logo: { justifyContent: 'center' },
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
export interface DashboardFrameProps extends React.PropsWithChildren<{}> {
    title: React.ReactNode | string
    primaryAction?: React.ReactNode
}
export function DashboardFrame(props: DashboardFrameProps) {
    const classes = useStyles()
    const menuStyle = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))
    const left = typeof props.title === 'string' ? <Typography variant="h6">{props.title}</Typography> : props.title
    const right = props.primaryAction
    const [expanded, setExpanded] = useState(false)
    return (
        <>
            <Grid container className={classes.root}>
                <Grid item xs={2} className={classes.permanentDrawer}>
                    <List>
                        <_ListItem className={classes.logo}>
                            <img height={40} alt="Mask Logo" src="https://mask.io/assets/icons/logo.svg" />
                        </_ListItem>
                        <Box sx={{ height: 40 }} />
                        <ListItem button>
                            <ListItemIcon>
                                <Masks />
                            </ListItemIcon>
                            <ListItemText primary="Personas" />
                        </ListItem>
                        <ListItem button selected onClick={() => setExpanded((e) => !e)}>
                            <ListItemIcon>
                                <AccountBalanceWallet />
                            </ListItemIcon>
                            <ListItemText>Wallets</ListItemText>
                            {expanded ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={expanded}>
                            <List disablePadding>
                                <NestedListItem button>
                                    <ListItemText primary="Transfer" />
                                </NestedListItem>
                                <NestedListItem button>
                                    <ListItemText primary="Swap" />
                                </NestedListItem>
                                <NestedListItem button>
                                    <ListItemText primary="Red packet" />
                                </NestedListItem>
                                <NestedListItem button>
                                    <ListItemText primary="Sell" />
                                </NestedListItem>
                                <NestedListItem button>
                                    <ListItemText primary="History" />
                                </NestedListItem>
                            </List>
                        </Collapse>
                        <ListItem button>
                            <ListItemIcon>
                                <Settings />
                            </ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItem>
                    </List>
                </Grid>
                <Grid container direction="column" item xs={10}>
                    <AppBar position="relative" color="inherit" elevation={0}>
                        <Toolbar component={Grid} container>
                            {left}
                            <Box sx={{ flex: 1 }} />
                            {right}
                        </Toolbar>
                    </AppBar>
                    <Grid item xs className={classes.containment}>
                        <div className={clz(classes.shapeHelper, classes.shape)}>
                            <div className={clz(classes.container, classes.shape)}>{props.children}</div>
                        </div>
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}
