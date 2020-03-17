import React, { useState } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, Paper } from '@material-ui/core'

import SentimentSatisfiedOutlinedIcon from '@material-ui/icons/SentimentSatisfiedOutlined'
import { Link, useRouteMatch } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
    drawer: {
        height: '100%',
        display: 'grid',
        gridTemplateRows: '[drawerHeader] 0fr [drawerList] auto [drawerFooter] 0fr',
        minWidth: 'var(--drawerWidth)',
        backgroundColor: 'var(--drawerBody)',
        color: 'white',
        overflow: 'auto',
    },
    drawerHeader: {
        padding: theme.spacing(4, 4, 3, 4),
        backgroundColor: 'var(--drawerHeader)',
        color: 'white',
    },
    maskTitle: {
        fontSize: 'large',
        fontWeight: 'bold',
        letterSpacing: '1px',
    },
    drawerList: {},
    drawerFeedback: {
        placeSelf: 'center stretch',
        padding: theme.spacing(3, 0),
    },
    feedback: {
        marginLeft: '-12px',
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

    return (
        <nav className={classes.drawer}>
            <Paper elevation={0} className={classes.drawerHeader}>
                <Typography className={classes.maskTitle}>Maskbook</Typography>
                <Typography variant="caption">Make Privacy Protected Again</Typography>
            </Paper>
            <List className={classes.drawerList}>
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
            <List className={classes.drawerFeedback}>
                <ListItem button>
                    <ListItemIcon children={<SentimentSatisfiedOutlinedIcon fontSize="small" />} />
                    <ListItemText className={classes.feedback} primary="Feedback" />
                </ListItem>
            </List>
        </nav>
    )
}

export default ResponsiveDrawer
