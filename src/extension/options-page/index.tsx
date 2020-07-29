import '../../provider.worker'
import '../../setup.ui'

import React from 'react'
import { CssBaseline, useMediaQuery, NoSsr, CircularProgress, Box } from '@material-ui/core'
import { ThemeProvider, makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import PeopleOutlinedIcon from '@material-ui/icons/PeopleOutlined'
import CreditCardIcon from '@material-ui/icons/CreditCard'
import BookmarkBorderOutlinedIcon from '@material-ui/icons/BookmarkBorderOutlined'
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined'
import { HashRouter as Router, Route, Switch, Redirect, useHistory } from 'react-router-dom'

import { I18nextProvider } from 'react-i18next'

import { useI18N } from '../../utils/i18n-next-ui'
import i18nNextInstance from '../../utils/i18n-next'
import { MaskbookDarkTheme, MaskbookLightTheme } from '../../utils/theme'

import FooterLine from './DashboardComponents/FooterLine'
import Drawer from './DashboardComponents/Drawer'

import DashboardPersonasRouter from './DashboardRouters/Personas'
import DashboardWalletsRouter from './DashboardRouters/Wallets'
import DashboardContactsRouter from './DashboardRouters/Contacts'
import DashboardSettingsRouter from './DashboardRouters/Settings'
import { appearanceSettings, Appearance } from '../../settings/settings'
import { DashboardSetupRouter } from './DashboardRouters/Setup'
import { DashboardBlurContextUI } from './DashboardContexts/BlurContext'
import { DashboardRoute } from './Route'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { useValueRef } from '../../utils/hooks/useValueRef'

import { useAsync } from 'react-use'
import Services from '../service'
import { RequestPermissionPage } from '../../components/RequestPermission/RequestPermission'
import { grey } from '@material-ui/core/colors'
import { DashboardSnackbarProvider } from './DashboardComponents/DashboardSnackbar'
import { SetupStep } from './SetupStep'
import DashboardNavRouter from './DashboardRouters/Nav'

const useStyles = makeStyles((theme) => {
    const dark = theme.palette.type === 'dark'
    return createStyles({
        wrapper: {
            '--monospace': 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
            '--drawerHeader': dark ? '#121212' : theme.palette.primary.main,
            '--drawerBody': dark
                ? '#121212'
                : theme.breakpoints.down('xs')
                ? 'transparent'
                : theme.palette.primary.main,

            backgroundColor: dark ? grey[900] : grey[50],
            userSelect: 'none',
            width: '100vw',
            height: '100vh',
            position: 'absolute',

            [theme.breakpoints.up('sm')]: {
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
            [theme.breakpoints.down('xs')]: {
                borderRadius: 0,
            },
        },
        suspend: {
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        },
        footer: {
            gridRow: 'content-end / span 1',
            gridColumn: 'content-start / content-end',
        },
        blur: {
            filter: 'blur(3px)',
        },
    })
})

function DashboardUI() {
    const { t } = useI18N()
    const classes = useStyles()
    const history = useHistory<unknown>()
    const xsMatched = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'), {
        defaultMatches: webpackEnv.perferResponsiveTarget === 'xs',
    })

    const routers = ([
        [t('personas'), DashboardRoute.Personas, <PeopleOutlinedIcon />],
        [t('wallets'), DashboardRoute.Wallets, <CreditCardIcon />],
        [t('contacts'), DashboardRoute.Contacts, <BookmarkBorderOutlinedIcon />],
        [t('settings'), DashboardRoute.Settings, <SettingsOutlinedIcon />],
    ] as const).filter((x) => x)

    // jump to persona if needed
    const { loading } = useAsync(async () => {
        if (webpackEnv.target === 'E2E' && location.hash.includes('noredirect=true')) return
        if (location.hash.includes(SetupStep.ConsentDataCollection)) return
        const personas = (await Services.Identity.queryMyPersonas()).filter((x) => !x.uninitialized)
        if (!personas.length) history.replace(`${DashboardRoute.Setup}/${SetupStep.CreatePersona}`)
        if (personas.length !== 1) return
        const profiles = await Services.Identity.queryMyProfiles()
        if (profiles.length) return
        history.replace(
            `${DashboardRoute.Setup}/${SetupStep.ConnectNetwork}?identifier=${encodeURIComponent(
                personas[0].identifier.toText(),
            )}`,
        )
    }, [])

    const drawer = <Drawer routers={routers} exitDashboard={null} />
    const nav = () => <DashboardNavRouter children={drawer} />

    return (
        <DashboardBlurContextUI>
            <div className={classes.wrapper}>
                <div className={classes.container}>
                    {loading ? (
                        <Box className={classes.suspend}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {xsMatched ? null : drawer}
                            <Switch>
                                {webpackEnv.perferResponsiveTarget === 'xs' ? (
                                    <Route path={DashboardRoute.Nav} component={nav} />
                                ) : null}
                                <Route path={DashboardRoute.Personas} component={DashboardPersonasRouter} />
                                <Route path={DashboardRoute.Wallets} component={DashboardWalletsRouter} />
                                <Route path={DashboardRoute.Contacts} component={DashboardContactsRouter} />
                                <Route path={DashboardRoute.Settings} component={DashboardSettingsRouter} />
                                <Route path={DashboardRoute.Setup} component={DashboardSetupRouter} />
                                {/* // TODO: this page should be boardless */}
                                <Route path={DashboardRoute.RequestPermission} component={RequestPermissionPage} />
                                <Redirect
                                    path="*"
                                    to={
                                        webpackEnv.perferResponsiveTarget === 'xs'
                                            ? DashboardRoute.Nav
                                            : DashboardRoute.Personas
                                    }
                                />
                            </Switch>
                        </>
                    )}
                </div>
                {xsMatched ? null : (
                    <footer className={classes.footer}>
                        <FooterLine />
                    </footer>
                )}
            </div>
        </DashboardBlurContextUI>
    )
}

export default function Dashboard() {
    const preferDarkScheme = useMediaQuery('(prefers-color-scheme: dark)')
    const appearance = useValueRef(appearanceSettings)
    return (
        <I18nextProvider i18n={i18nNextInstance}>
            <ThemeProvider
                theme={
                    (preferDarkScheme && appearance === Appearance.default) || appearance === Appearance.dark
                        ? MaskbookDarkTheme
                        : MaskbookLightTheme
                }>
                <DashboardSnackbarProvider>
                    <NoSsr>
                        <Router>
                            <CssBaseline />
                            <DashboardUI />
                        </Router>
                    </NoSsr>
                </DashboardSnackbarProvider>
            </ThemeProvider>
        </I18nextProvider>
    )
}

SSRRenderer(<Dashboard />)
