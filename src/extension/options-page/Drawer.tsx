import React from 'react'

import { List, ListItem, ListItemIcon, ListItemText, Typography, Paper } from '@material-ui/core'
import { makeStyles, Theme, ThemeProvider, useTheme } from '@material-ui/core/styles'
import { Link, useRouteMatch } from 'react-router-dom'

import SentimentSatisfiedOutlinedIcon from '@material-ui/icons/SentimentSatisfiedOutlined'
import { useModal } from './Dialog/Base'
import { DashboardFeedbackDialog } from './Dialog/Feedback'
import { useI18N } from '../../utils/i18n-next-ui'
import { cloneDeep, merge } from 'lodash-es'

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

const drawerTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        overrides: {
            MuiListItem: {
                root: {
                    '&$selected$selected': {
                        backgroundColor: 'var(--drawerBodySelected, --drawerBody)',
                        color: 'var(--drawerTextSelected, --drawerText)',
                        '&::before': {
                            content: '""',
                            height: '100%',
                            width: '5px',
                            position: 'absolute',
                            left: '0px',
                            backgroundColor: 'var(--listSelectedIndicator)',
                        },
                    },
                },
            },
            MuiListItemIcon: {
                root: {
                    justifyContent: 'center',
                    color: 'unset',
                },
            },
        },
    })

interface ResponsiveDrawerProps {
    routers: readonly (readonly [string, string, JSX.Element])[]
    exitDashboard: null | (() => void)
}

function ResponsiveDrawer(props: ResponsiveDrawerProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const match = useRouteMatch('/:param/')

    const theme = useTheme()

    const { routers, exitDashboard } = props
    const [feedback, openFeedback] = useModal(DashboardFeedbackDialog)

    return (
        <ThemeProvider theme={drawerTheme}>
            <nav className={classes.drawer}>
                <Paper elevation={0} className={classes.drawerHeader}>
                    <Typography className={classes.maskTitle}>Maskbook</Typography>
                    <Typography color={theme.palette.type === 'dark' ? 'textSecondary' : 'inherit'} variant="caption">
                        Make Privacy Protected Again
                    </Typography>
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
                    <ListItem button onClick={openFeedback}>
                        <ListItemIcon children={<SentimentSatisfiedOutlinedIcon fontSize="small" />} />
                        <ListItemText className={classes.feedback} primary={t('feedback')} />
                    </ListItem>
                </List>
                {feedback}
            </nav>
        </ThemeProvider>
    )
}

export default ResponsiveDrawer
