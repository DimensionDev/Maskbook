import React, { useCallback } from 'react'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { makeStyles } from '@material-ui/core/styles'
import { IconButton, Typography, BottomNavigation, BottomNavigationAction } from '@material-ui/core'
import classNames from 'classnames'

import CloseIcon from '@material-ui/icons/Close'
import BookmarkIcon from '@material-ui/icons/Bookmark'
import CachedIcon from '@material-ui/icons/Cached'
import SettingsIcon from '@material-ui/icons/Settings'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import { Link, useRouteMatch, useHistory } from 'react-router-dom'

const drawerWidth = 240

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('md')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        [theme.breakpoints.up('md')]: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
        },
    },
    exitButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },
    padded: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        ...theme.mixins.toolbar,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    maskicon: {
        display: 'block',
        marginTop: 20,
        marginBottom: 20,
        width: 72,
        height: 72,
    },
    masktext: {
        display: 'block',
        marginTop: -20,
        marginBottom: -20,
        width: 120,
        height: 60,
    },
    bottomNavigationRoot: {
        position: 'fixed',
        bottom: 0,
        width: '100%',
    },
    bottomNavigationMargin: {
        height: 56 + 12,
    },
}))

interface ResponsiveDrawerProps {
    exitDashboard: null | (() => void)
}

function LinkItem(props: { to: string; icon: React.ReactElement; label: string }) {
    const selected = useRouteMatch(props.to) !== null
    const history = useHistory()
    const onClick = useCallback(() => {
        history.push(props.to)
    }, [history, props.to])
    return (
        <BottomNavigationAction onClick={onClick} selected={selected} showLabel label={props.label} icon={props.icon} />
    )
}

function ResponsiveDrawer(props: ResponsiveDrawerProps) {
    const classes = useStyles()
    const match = useRouteMatch('/:param/')

    const { exitDashboard } = props

    const routers: [string, string, JSX.Element][] = [
        ['Home', '/home/', <BookmarkIcon />],
        ['Device', '/device/', <CachedIcon />],
        ['Settings', '/settings/', <SettingsIcon />],
        ['About', '/about/', <InfoOutlinedIcon />],
        ['Debug', '/debug/', <LocationOnIcon />],
    ]

    const drawer = (
        <div>
            <div className={classNames(classes.toolbar, classes.padded)}>
                {exitDashboard && (
                    <IconButton color="inherit" edge="start" onClick={exitDashboard} className={classes.exitButton}>
                        <CloseIcon />
                    </IconButton>
                )}
                <Typography variant="h6">Dashboard</Typography>
            </div>
            <Divider />
            <section className={classNames(classes.padded)}>
                <img className={classes.maskicon} src="https://maskbook.com/img/MB--CircleCanvas--WhiteOverBlue.svg" />
                <img className={classes.masktext} src="https://maskbook.com/img/maskbook--logotype-blue.png" />
                <Typography variant="caption">Make Privacy Protected Again</Typography>
            </section>
            <Divider />
            <List>
                {routers.map((item, index) => (
                    <ListItem
                        selected={match ? item[1].startsWith(match.url) : false}
                        component={Link}
                        to={item[1]}
                        button
                        key={index}>
                        <ListItemIcon children={item[2]}></ListItemIcon>
                        <ListItemText primary={item[0]} />
                    </ListItem>
                ))}
            </List>
        </div>
    )

    return (
        <nav className={classes.drawer}>
            <Hidden smDown implementation="css">
                <Drawer
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                    variant="permanent"
                    open>
                    {drawer}
                </Drawer>
            </Hidden>
            <Hidden mdUp implementation="css">
                <div className={classes.bottomNavigationMargin} />
                <BottomNavigation classes={{ root: classes.bottomNavigationRoot }}>
                    {routers.map((item, index) => (
                        <LinkItem to={item[1]} icon={item[2]} label={item[0]} key={index}></LinkItem>
                    ))}
                </BottomNavigation>
            </Hidden>
        </nav>
    )
}

export default ResponsiveDrawer
