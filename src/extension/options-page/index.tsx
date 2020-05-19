import React from 'react'
import { CssBaseline, useMediaQuery, NoSsr } from '@material-ui/core'
import { ThemeProvider, makeStyles, createStyles } from '@material-ui/core/styles'

import PeopleOutlinedIcon from '@material-ui/icons/PeopleOutlined'
import CreditCardIcon from '@material-ui/icons/CreditCard'
import BookmarkBorderOutlinedIcon from '@material-ui/icons/BookmarkBorderOutlined'
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined'

import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

import { MaskbookDarkTheme, MaskbookLightTheme } from '../../utils/theme'

import '../../setup.ui'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { useValueRef } from '../../utils/hooks/useValueRef'

import { SnackbarProvider } from 'notistack'

import { I18nextProvider } from 'react-i18next'

import { useI18N } from '../../utils/i18n-next-ui'
import i18nNextInstance from '../../utils/i18n-next'
import FooterLine from './DashboardComponents/FooterLine'
import Drawer from './DashboardComponents/Drawer'

import DashboardPersonasRouter from './DashboardRouters/Personas'
import DashboardWalletsRouter from './DashboardRouters/Wallets'
import DashboardContactsRouter from './DashboardRouters/Contacts'
import DashboardSettingsRouter from './DashboardRouters/Settings'
import { appearanceSettings, Appearance } from '../../components/shared-settings/settings'
import { DashboardSetupRouter } from './DashboardRouters/Setup'
import { DashboardBlurContextUI } from './DashboardContexts/BlurContext'

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            '--monospace': 'SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',

            '--primary': theme.palette.primary.main,
            '--textOnPrimary': theme.palette.primary.contrastText,
            '--lightText': '#C4C4C4',
            '--background': theme.palette.type === 'dark' ? '#212121' : '#F6F9FF',
            '--container': theme.palette.type === 'dark' ? '#121212' : '#FFFFFF',
            '--drawerWidth': '250px',
            '--drawerHeader': theme.palette.type === 'dark' ? '#121212' : '#1756CA',
            '--drawerBody': theme.palette.type === 'dark' ? '#121212' : 'var(--primary)',
            '--drawerText': 'var(--textOnPrimary, #FFFFFF)',
            '--drawerBodySelected': theme.palette.type === 'dark' ? '#114097' : 'var(--textOnPrimary)',
            '--drawerTextSelected': theme.palette.type === 'dark' ? 'var(--textOnPrimary)' : 'var(--primary)',
            '--listSelectedIndicator': 'var(--primary)',

            position: 'absolute',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'var(--background)',
            display: 'grid',
            gridTemplateColumns: '1fr [content-start] 1110px [content-end] 1fr',
            gridTemplateRows: '32px [content-start] auto [content-end] 50px',
            placeItems: 'center',

            transition: 'filter 0.3s linear',
            willChange: 'filter',

            '--thumbBG': 'rgba(0,0,0,0.15)',
            '--scrollbarBG': 'rgba(15,34,0,0.05)',

            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--thumbBG) var(--scrollbarBG)',
            '& *::-webkit-scrollbar': {
                width: '8px',
            },
            '& *::-webkit-scrollbar-track': {
                borderRadius: '6px',
                background: 'var(--scrollbarBG)',
            },
            '& *::-webkit-scrollbar-thumb': {
                borderRadius: '50px',
                backgroundColor: 'var(--thumbBG)',
            },
        },
        container: {
            width: '100%',
            height: '100%',
            overflow: 'auto',
            borderRadius: '12px',
            backgroundColor: 'var(--container)',
            gridRow: 'content-start / content-end',
            gridColumn: 'content-start / content-end',

            display: 'flex',
        },
        footer: {
            gridRow: 'content-end / span 1',
            gridColumn: 'content-start / content-end',
        },
        blur: {
            filter: 'blur(3px)',
        },
    }),
)

function DashboardUI() {
    const { t } = useI18N()
    const classes = useStyles()

    const routers = ([
        [t('personas'), '/personas/', <PeopleOutlinedIcon />],
        webpackEnv.target === 'WKWebview' ? undefined! : ([t('wallets'), '/wallets/', <CreditCardIcon />] as const),
        [t('contacts'), '/contacts/', <BookmarkBorderOutlinedIcon />],
        [t('settings'), '/settings/', <SettingsOutlinedIcon />],
    ] as const).filter((x) => x)

    return (
        <DashboardBlurContextUI>
            <div className={classes.wrapper}>
                <div className={classes.container}>
                    {/* TODO: detect clean for setup only */}
                    <Drawer routers={routers} exitDashboard={null} />
                    <Switch>
                        <Route path="/personas/" component={DashboardPersonasRouter} />
                        <Route path="/wallets/" component={DashboardWalletsRouter} />
                        <Route path="/contacts/" component={DashboardContactsRouter} />
                        <Route path="/settings/" component={DashboardSettingsRouter} />
                        <Route path="/setup" component={DashboardSetupRouter} onExit={'/'} />
                        <Redirect path="*" to="/personas/" />
                    </Switch>
                </div>
                <footer className={classes.footer}>
                    <FooterLine />
                </footer>
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
                <SnackbarProvider
                    maxSnack={30}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}>
                    <NoSsr>
                        <Router>
                            <CssBaseline />
                            <DashboardUI />
                        </Router>
                    </NoSsr>
                </SnackbarProvider>
            </ThemeProvider>
        </I18nextProvider>
    )
}

SSRRenderer(<Dashboard />)
