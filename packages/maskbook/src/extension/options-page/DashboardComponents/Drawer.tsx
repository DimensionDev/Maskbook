import { Fragment } from 'react'
import classNames from 'classnames'
import { List, ListItem, ListItemIcon, ListItemText, Typography, Box, Divider } from '@material-ui/core'
import { makeStyles, ThemeProvider } from '@material-ui/core/styles'
import { Link, useRouteMatch } from 'react-router-dom'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import SentimentSatisfiedOutlinedIcon from '@material-ui/icons/SentimentSatisfiedOutlined'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardFeedbackDialog } from '../DashboardDialogs/Feedback'
import { useI18N } from '../../../utils/i18n-next-ui'
import Logo from './MaskbookLogo'
import { Carousel } from './Carousel'
import { makeNewBugIssueURL } from '../../debug-page/issue'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'
import { extendsTheme } from '../../../utils/theme'

const useStyles = makeStyles((theme) => ({
    drawer: {
        height: '100%',
        display: 'grid',
        gridTemplateRows: '[drawerHeader] 0fr [drawerList] auto [drawerFooter] 0fr',
        width: 250,
        color: 'white',
        overflow: 'visible',
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            color: theme.palette.text.primary,
            width: '100%',
        },
    },
    drawerHeader: {
        color: 'white',
        padding: theme.spacing(5.5, 2, 4, 4),
        backgroundColor: 'var(--drawerHeader)',
    },
    drawerBody: {
        backgroundColor: 'var(--drawerBody)',
    },
    drawerList: {
        padding: 0,
    },
    drawerItem: {
        borderLeft: 'solid 5px var(--drawerBody)',
        paddingTop: 16,
        paddingBottom: 16,
        [theme.breakpoints.down('sm')]: {
            borderLeft: 'none',
            padding: theme.spacing(3, 0),
        },
    },
    drawerItemIcon: {
        [theme.breakpoints.down('sm')]: {
            color: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.text.primary,
        },
    },
    drawerItemText: {
        margin: 0,
        fontWeight: 500,
    },
    drawerItemTextPrimary: {
        [theme.breakpoints.down('sm')]: {
            fontSize: 16,
        },
    },
    drawerFeedback: {
        borderLeft: 'none',
    },
    slogan: {
        color: theme.palette.mode === 'light' ? '#A1C1FA' : '#3B3B3B',
        opacity: 0.5,
        width: 316,
        height: 260,
        left: 48,
        bottom: 30,
        fontWeight: 'bold',
        fontSize: 40,
        lineHeight: 1.2,
        letterSpacing: -0.4,
        position: 'absolute',
        transitionDuration: '2s',
    },
}))

const drawerTheme = extendsTheme((theme) => ({
    components: {
        MuiListItem: {
            styleOverrides: {
                root: {
                    '&$selected$selected': {
                        borderLeftColor:
                            theme.palette.mode === 'dark' ? theme.palette.primary.light : 'var(--drawerBody)',
                        backgroundColor:
                            theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    justifyContent: 'center',
                    color: 'unset',
                },
            },
        },
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    fontSize: 14,
                    lineHeight: '24px',
                    fontWeight: 500,
                },
            },
        },
    },
}))

interface DrawerProps {
    routers: readonly (readonly [string, string, JSX.Element])[]
    exitDashboard: null | (() => void)
}

export default function Drawer(props: DrawerProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const match = useRouteMatch('/:param/')
    const forSetupPurpose = match?.url.includes('/setup')
    const xsMatched = useMatchXS()

    const { routers } = props
    const [feedback, openFeedback] = useModal(DashboardFeedbackDialog)

    const onDebugPage = (event: React.MouseEvent) => {
        if (event.shiftKey) {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/debug.html'),
            })
        } else if (event.altKey) {
            browser.tabs.create({
                active: true,
                url: makeNewBugIssueURL(),
            })
        }
    }

    return (
        <ThemeProvider theme={drawerTheme}>
            <nav className={classes.drawer}>
                {xsMatched ? null : (
                    <Box
                        onClick={onDebugPage}
                        className={classes.drawerHeader}
                        style={{ backgroundColor: `var(--drawerBody)` }}>
                        <Logo />
                    </Box>
                )}
                <Box
                    className={classes.drawerBody}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}>
                    {forSetupPurpose ? null : (
                        <>
                            <List className={classes.drawerList}>
                                {routers.map((item, index) => (
                                    <Fragment key={index}>
                                        <ListItem
                                            className={classes.drawerItem}
                                            selected={match ? item[1].startsWith(match.url) : false}
                                            component={Link}
                                            to={item[1]}
                                            button>
                                            <ListItemIcon
                                                className={classes.drawerItemIcon}
                                                children={item[2]}></ListItemIcon>
                                            <ListItemText
                                                className={classes.drawerItemText}
                                                primary={item[0]}
                                                primaryTypographyProps={{ className: classes.drawerItemTextPrimary }}
                                            />
                                            {xsMatched ? (
                                                <ListItemIcon>
                                                    <ChevronRightIcon color="action" />
                                                </ListItemIcon>
                                            ) : null}
                                        </ListItem>
                                        {xsMatched ? <Divider /> : null}
                                    </Fragment>
                                ))}
                            </List>
                            <List className={classes.drawerList}>
                                <ListItem
                                    className={classNames(classes.drawerItem, classes.drawerFeedback)}
                                    button
                                    onClick={openFeedback}>
                                    <ListItemIcon
                                        className={classes.drawerItemIcon}
                                        children={<SentimentSatisfiedOutlinedIcon fontSize="small" />}
                                    />
                                    <ListItemText
                                        className={classes.drawerItemText}
                                        primary={t('feedback')}
                                        primaryTypographyProps={{ className: classes.drawerItemTextPrimary }}
                                    />
                                    {xsMatched ? (
                                        <ListItemIcon>
                                            <ChevronRightIcon color="action" />
                                        </ListItemIcon>
                                    ) : null}
                                </ListItem>
                                {xsMatched ? <Divider /> : null}
                            </List>
                            {feedback}
                        </>
                    )}
                </Box>
                {forSetupPurpose ? (
                    <Carousel
                        items={[
                            <Typography className={classes.slogan}>
                                Post on social networks without allowing the corporations to stalk you.
                            </Typography>,
                            <Typography className={classes.slogan}>Take back our online privacy.</Typography>,
                            <Typography className={classes.slogan}>
                                Neutralize the surveillance from tech giants.
                            </Typography>,
                        ]}
                    />
                ) : null}
            </nav>
        </ThemeProvider>
    )
}
