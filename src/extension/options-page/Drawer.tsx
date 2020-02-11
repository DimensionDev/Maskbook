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
        width: 120,
        height: 'auto',
    },
}))

interface ResponsiveDrawerProps {
    routers: [string, string, JSX.Element][]
    exitDashboard: null | (() => void)
}

function ResponsiveDrawer(props: ResponsiveDrawerProps) {
    const classes = useStyles()
    const match = useRouteMatch('/:param/')

    const { routers, exitDashboard } = props

    const drawer = (
        <div>
            {exitDashboard && (
                <div className={classNames(classes.toolbar, classes.padded)}>
                    <IconButton color="inherit" edge="start" onClick={exitDashboard} className={classes.exitButton}>
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6">Dashboard</Typography>
                </div>
            )}
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
        </nav>
    )
}

export default ResponsiveDrawer
