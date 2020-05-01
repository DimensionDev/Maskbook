import React from 'react'
import classNames from 'classnames'

import { List, ListItem, ListItemIcon, ListItemText, Typography, Paper, Box } from '@material-ui/core'
import { makeStyles, Theme, ThemeProvider, useTheme } from '@material-ui/core/styles'
import { Link, useRouteMatch } from 'react-router-dom'

import SentimentSatisfiedOutlinedIcon from '@material-ui/icons/SentimentSatisfiedOutlined'
import { useModal } from './Dialog/Base'
import { DashboardFeedbackDialog } from './Dialog/Feedback'
import { useI18N } from '../../utils/i18n-next-ui'
import { cloneDeep, merge } from 'lodash-es'
import Logo from './DashboardComponents/Logo'

const useStyles = makeStyles((theme) => ({
    drawer: {
        height: '100%',
        display: 'grid',
        gridTemplateRows: '[drawerHeader] 0fr [drawerList] auto [drawerFooter] 0fr',
        width: 'var(--drawerWidth)',
        color: 'white',
        overflow: 'visible',
        position: 'relative',
    },
    drawerHeader: {
        padding: theme.spacing(4, 2, 3, 4),
        color: 'white',
        backgroundColor: 'var(--drawerHeader)',
    },
    drawerBody: {
        backgroundColor: 'var(--drawerBody)',
    },
    maskDescription: {
        fontSize: 14,
        lineHeight: '24px',
        marginTop: 6,
        display: 'block',
    },
    drawerList: {
        padding: '0 0 0 5px',
    },
    drawerItem: {
        paddingTop: 16,
        paddingBottom: 16,
    },
    drawerItemText: {
        margin: 0,
    },
    drawerFeedback: {
        placeSelf: 'center stretch',
        padding: 0,
    },
    feedback: {
        paddingLeft: 0,
    },
    slogan: {
        color: theme.palette.type === 'light' ? '#A1C1FA' : '#3B3B3B',
        opacity: 0.5,
        width: 316,
        height: 260,
        left: 48,
        bottom: 30,
        fontWeight: 500,
        fontSize: 40,
        lineHeight: 1.2,
        letterSpacing: -0.4,
        position: 'absolute',
    },
}))

const drawerTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        overrides: {
            MuiListItem: {
                root: {
                    '&$selected$selected': {
                        color: 'var(--drawerTextSelected, --drawerText)',
                        backgroundColor: 'var(--drawerBodySelected, --drawerBody)',
                    },
                },
            },
            MuiListItemIcon: {
                root: {
                    justifyContent: 'center',
                    color: 'unset',
                },
            },
            MuiListItemText: {
                primary: {
                    fontSize: 14,
                    lineHeight: '24px',
                    fontWeight: 500,
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
    const forSetupPurpose = match?.url.includes('/setup')

    const theme = useTheme()

    const { routers, exitDashboard } = props
    const [feedback, openFeedback] = useModal(DashboardFeedbackDialog)

    return (
        <ThemeProvider theme={drawerTheme}>
            <nav className={classes.drawer}>
                <Box
                    className={classes.drawerHeader}
                    style={{ backgroundColor: `var(${forSetupPurpose ? '--drawerBody' : '--drawerHeader'})` }}>
                    <Logo />
                    <Typography
                        className={classes.maskDescription}
                        color={theme.palette.type === 'dark' ? 'textSecondary' : 'inherit'}
                        variant="caption">
                        Make Privacy Protected Again
                    </Typography>
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    className={classes.drawerBody}>
                    {forSetupPurpose ? null : (
                        <>
                            <List className={classes.drawerList}>
                                {routers.map((item, index) => (
                                    <ListItem
                                        className={classes.drawerItem}
                                        selected={match ? item[1].startsWith(match.url) : false}
                                        component={Link}
                                        to={item[1]}
                                        button
                                        key={index}>
                                        <ListItemIcon children={item[2]}></ListItemIcon>
                                        <ListItemText className={classes.drawerItemText} primary={item[0]} />
                                    </ListItem>
                                ))}
                            </List>
                            <List className={classNames(classes.drawerList, classes.feedback)}>
                                <ListItem className={classes.drawerItem} button onClick={openFeedback}>
                                    <ListItemIcon children={<SentimentSatisfiedOutlinedIcon fontSize="small" />} />
                                    <ListItemText className={classes.drawerItemText} primary={t('feedback')} />
                                </ListItem>
                            </List>
                            {feedback}
                        </>
                    )}
                </Box>
                {forSetupPurpose ? (
                    <Typography className={classes.slogan}>
                        Post on social networks without allowing the corporations to stalk you.
                    </Typography>
                ) : null}
            </nav>
        </ThemeProvider>
    )
}

export default ResponsiveDrawer
