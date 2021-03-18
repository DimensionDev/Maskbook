import '../../social-network-adaptor'
import '../../setup.ui'

import { useState } from 'react'
import { useAsync } from 'react-use'
import { CssBaseline, NoSsr, CircularProgress, Box, Typography, Card, StylesProvider } from '@material-ui/core'
import { ThemeProvider, makeStyles, createStyles } from '@material-ui/core/styles'

import PeopleOutlinedIcon from '@material-ui/icons/PeopleOutlined'
import CreditCardIcon from '@material-ui/icons/CreditCard'
import BookmarkBorderOutlinedIcon from '@material-ui/icons/BookmarkBorderOutlined'
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined'
import { HashRouter as Router, Route, Switch, Redirect, useHistory } from 'react-router-dom'

import { useI18N } from '../../utils/i18n-next-ui'
import { useMaskbookTheme } from '../../utils/theme'

import FooterLine from './DashboardComponents/FooterLine'
import Drawer from './DashboardComponents/Drawer'

import DashboardPersonasRouter from './DashboardRouters/Personas'
import DashboardWalletsRouter from './DashboardRouters/Wallets'
import DashboardContactsRouter from './DashboardRouters/Contacts'
import DashboardSettingsRouter from './DashboardRouters/Settings'
import { DashboardSetupRouter } from './DashboardRouters/Setup'
import { DashboardBlurContextUI } from './DashboardContexts/BlurContext'
import { DashboardRoute } from './Route'
import { SSRRenderer } from '../../utils/SSRRenderer'

import Services from '../service'
import { RequestPermissionPage } from '../../components/RequestPermission/RequestPermission'
import { grey } from '@material-ui/core/colors'
import { DashboardSnackbarProvider } from './DashboardComponents/DashboardSnackbar'
import { SetupStep } from './SetupStep'
import DashboardNavRouter from './DashboardRouters/Nav'
import ActionButton from './DashboardComponents/ActionButton'
import ShowcaseBox from './DashboardComponents/ShowcaseBox'
import { Flags } from '../../utils/flags'
import { useMatchXS } from '../../utils/hooks/useMatchXS'
import type { PluginConfig } from '../../plugins/types'
import { PluginUI } from '../../plugins/PluginUI'
import { ErrorBoundary, withErrorBoundary } from '../../components/shared/ErrorBoundary'
import { MaskbookUIRoot } from '../../UIRoot'

const useStyles = makeStyles((theme) => {
    const dark = theme.palette.mode === 'dark'
    return createStyles({
        root: {
            '--monospace': 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
            '--drawerHeader': dark ? '#121212' : theme.palette.primary.main,
            '--drawerBody': dark ? '#121212' : theme.palette.primary.main,

            [theme.breakpoints.down('sm')]: {
                '--drawerBody': 'transparent',
            },

            backgroundColor: dark ? grey[900] : grey[50],
            userSelect: 'none',
            width: '100vw',
            height: '100vh',
            position: 'absolute',

            [theme.breakpoints.up('md')]: {
                display: 'grid',
                gridTemplateColumns: '1fr [content-start] 1110px [content-end] 1fr',
                gridTemplateRows: '32px [content-start] auto [content-end] 50px',
                placeItems: 'center',
            },

            transition: 'filter 0.3s linear',
            willChange: 'filter',

            '& *::-webkit-scrollbar': {
                display: 'none',
            },
        },
        container: {
            width: '100%',
            height: '100%',
            overflow: 'auto',
            borderRadius: 12,
            backgroundColor: dark ? '#121212' : '#FFFFFF',
            gridRow: 'content-start / content-end',
            gridColumn: 'content-start / content-end',
            display: 'flex',
            [theme.breakpoints.down('sm')]: {
                borderRadius: 0,
            },
        },
        suspend: {
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
        },
        footer: {
            gridRow: 'content-end / span 1',
            gridColumn: 'content-start / content-end',
        },
        blur: {
            filter: 'blur(3px)',
        },
        errorTitle: {
            marginBottom: theme.spacing(3),
        },
        errorMessage: {
            maxWidth: '50%',
            maxHeight: 300,
            whiteSpace: 'pre-wrap',
            marginBottom: theme.spacing(3),
        },
    })
})

function DashboardUI() {
    const { t } = useI18N()
    const classes = useStyles()
    const history = useHistory<unknown>()
    const xsMatched = useMatchXS()
    const routers = ([
        [t('personas'), DashboardRoute.Personas, <PeopleOutlinedIcon />],
        [t('wallets'), DashboardRoute.Wallets, <CreditCardIcon />],
        [t('contacts'), DashboardRoute.Contacts, <BookmarkBorderOutlinedIcon />],
        [t('settings'), DashboardRoute.Settings, <SettingsOutlinedIcon />],
    ] as const).filter((x) => x)

    // jump to persona if needed
    const [reloadSpy, setReloadSpy] = useState(false)
    const { loading, error } = useAsync(async () => {
        if (process.env.target === 'E2E' && location.hash.includes('noredirect=true')) return
        if (location.hash.includes(SetupStep.ConsentDataCollection)) return
        const personas = (await Services.Identity.queryMyPersonas()).filter((x) => !x.uninitialized)
        // the user need setup at least one persona
        if (!personas.length) {
            history.replace(`${DashboardRoute.Setup}/${SetupStep.CreatePersona}`)
            return
        }
        // the user has got more than one personas, so we cannot make decision for user.
        if (personas.length !== 1) return
        // the user has linked the only persona with some profiles
        if (personas.some((x) => x.linkedProfiles.size)) return
        history.replace(
            `${DashboardRoute.Setup}/${SetupStep.ConnectNetwork}?identifier=${encodeURIComponent(
                personas[0].identifier.toText(),
            )}`,
        )
    }, [reloadSpy])

    const renderDashboard = (children: React.ReactNode) => {
        return (
            <div className={classes.root}>
                <div className={classes.container}>{children}</div>
                {xsMatched ? null : (
                    <footer className={classes.footer}>
                        <FooterLine />
                    </footer>
                )}
            </div>
        )
    }

    if (loading)
        return renderDashboard(
            <Box className={classes.suspend}>
                <CircularProgress />
            </Box>,
        )
    if (error)
        return renderDashboard(
            <Box className={classes.suspend}>
                <Typography className={classes.errorTitle} variant="h5">
                    {t('dashboard_load_failed_title')}
                </Typography>
                {error.message ? (
                    <Card className={classes.errorMessage}>
                        <ShowcaseBox>{error.message}</ShowcaseBox>
                    </Card>
                ) : null}
                <ActionButton variant="text" onClick={() => setReloadSpy((x) => !x)}>
                    {t('reload')}
                </ActionButton>
            </Box>,
        )

    const drawer = <Drawer routers={routers} exitDashboard={null} />
    return renderDashboard(
        <>
            {xsMatched ? null : drawer}
            <Switch>
                {Flags.has_no_browser_tab_ui ? (
                    <Route path={DashboardRoute.Nav} component={() => <DashboardNavRouter children={drawer} />} />
                ) : null}
                <Route path={DashboardRoute.Personas} component={withErrorBoundary(DashboardPersonasRouter)} />
                <Route path={DashboardRoute.Wallets} component={withErrorBoundary(DashboardWalletsRouter)} />
                <Route path={DashboardRoute.Contacts} component={withErrorBoundary(DashboardContactsRouter)} />
                <Route path={DashboardRoute.Settings} component={withErrorBoundary(DashboardSettingsRouter)} />
                <Route path={DashboardRoute.Setup} component={withErrorBoundary(DashboardSetupRouter)} />
                {/* // TODO: this page should be boardless */}
                <Route path={DashboardRoute.RequestPermission} component={withErrorBoundary(RequestPermissionPage)} />
                <Redirect
                    path="*"
                    to={Flags.has_no_browser_tab_ui && xsMatched ? DashboardRoute.Nav : DashboardRoute.Personas}
                />
            </Switch>
        </>,
    )
}

//#region dashboard plugin UI
function PluginDashboardInspectorForEach({ config }: { config: PluginConfig }) {
    const F = config.DashboardComponent
    if (typeof F === 'function') return <F />
    return null
}

function DashboardPluginUI() {
    return (
        <ThemeProvider theme={useMaskbookTheme()}>
            {[...PluginUI.values()].map((x) => (
                <ErrorBoundary key={x.identifier} subject={`Plugin "${x.pluginName}"`}>
                    <PluginDashboardInspectorForEach config={x} />
                </ErrorBoundary>
            ))}
        </ThemeProvider>
    )
}
//#endregion

export function Dashboard() {
    return MaskbookUIRoot(
        <StylesProvider injectFirst>
            <ThemeProvider theme={useMaskbookTheme()}>
                <DashboardSnackbarProvider>
                    <NoSsr>
                        <Router>
                            <CssBaseline />
                            <DashboardBlurContextUI>
                                <DashboardUI />
                                <DashboardPluginUI />
                            </DashboardBlurContextUI>
                        </Router>
                    </NoSsr>
                </DashboardSnackbarProvider>
            </ThemeProvider>
        </StylesProvider>,
    )
}

export default SSRRenderer(<Dashboard />)
