import '../../provider.worker'

import React, { useRef, useMemo, useContext, useEffect, useState } from 'react'
import { CssBaseline, useMediaQuery } from '@material-ui/core'
import { ThemeProvider, makeStyles, createStyles, useTheme } from '@material-ui/core/styles'

import PeopleOutlinedIcon from '@material-ui/icons/PeopleOutlined'
import CreditCardIcon from '@material-ui/icons/CreditCard'
import BookmarkBorderOutlinedIcon from '@material-ui/icons/BookmarkBorderOutlined'
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined'

import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

import { MaskbookDarkTheme, MaskbookLightTheme } from '../../utils/theme'

import '../../setup.ui'
import { SSRRenderer } from '../../utils/SSRRenderer'

import { SnackbarProvider } from 'notistack'

import { I18nextProvider } from 'react-i18next'
import ResponsiveDrawer from './Drawer'

import { DialogRouter } from './DashboardDialogs/DialogBase'
import DashboardInitializeDialog from './Initialize'
import { useI18N } from '../../utils/i18n-next-ui'
import i18nNextInstance from '../../utils/i18n-next'
import FooterLine from './DashboardComponents/FooterLine'

import DashboardPersonasRouter from './Router/Personas'
import DashboardWalletsRouter from './Router/Wallets'
import DashboardContactsRouter from './Router/Contacts'
import DashboardSettingsRouter from './Router/Settings'

const OptionsPageRouters = (
    <>
        <Switch>
            <Route path="/personas/" component={DashboardPersonasRouter} />
            <Route path="/wallets/" component={DashboardWalletsRouter} />
            <Route path="/contacts/" component={DashboardContactsRouter} />
            <Route path="/settings/" component={DashboardSettingsRouter} />
            <DialogRouter path="/initialize" component={DashboardInitializeDialog} onExit={'/'} fullscreen />
            <Redirect path="*" to="/home/" />
        </Switch>
    </>
)

function DashboardWithProvider() {
    const isDarkTheme = useMediaQuery('(prefers-color-scheme: dark)')
    return (
        <I18nextProvider i18n={i18nNextInstance}>
            <ThemeProvider theme={isDarkTheme ? MaskbookDarkTheme : MaskbookLightTheme}>
                <SnackbarProvider
                    maxSnack={30}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}>
                    <Router>
                        <CssBaseline />
                        <Dashboard></Dashboard>
                    </Router>
                </SnackbarProvider>
            </ThemeProvider>
        </I18nextProvider>
    )
}

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            '--monospace': 'SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',

            '--primary': theme.palette.primary.main,
            '--textOnPrimary': theme.palette.primary.contrastText,
            '--lightText': '#C4C4C4',
            '--background': theme.palette.type === 'dark' ? '#212121' : '#F6F9FF',
            '--container': theme.palette.type === 'dark' ? '#121212' : '#FFFFFF',
            '--drawerWidth': '251px',
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
            // background: 'var(--background) bottom 10px right 10px no-repeat url(/maskface.svg)',
            display: 'grid',
            gridTemplateColumns: '20px [content-start] minmax(984px, auto) [content-end] 20px',
            '@media screen and (min-width: 1180px)': {
                gridTemplateColumns: '1fr [content-start] 1180px [content-end] 1fr',
            },
            gridTemplateRows: '64px [content-start] auto [content-end] 80px',
            placeItems: 'center',

            transition: 'filter 0.3s linear',
            willChange: 'filter',
        },
        container: {
            width: '100%',
            height: '100%',
            overflow: 'auto',
            borderRadius: '12px',
            maxWidth: '1100px',
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

let blurRequest = 0

const DashboardBlurContext = React.createContext<{
    blur(): void
    unblur(): void
}>(null!)
const DashboardBlurContextProvider = DashboardBlurContext.Provider

export function useBlurContext(open: boolean) {
    const context = useContext(DashboardBlurContext)
    useEffect(() => (open ? context.blur() : context.unblur()), [context, open])
}

function Dashboard() {
    const { t } = useI18N()
    const classes = useStyles()
    const theme = useTheme()

    useEffect(() => {
        // global filter blur color fix
        document.body.style.backgroundColor = theme.palette.background.paper
    }, [theme])

    const routers: [string, string, JSX.Element][] = [
        ['Personas', '/personas/', <PeopleOutlinedIcon />],
        /* without redpacket */
        ...(webpackEnv.target === 'WKWebview'
            ? []
            : ([['Wallets', '/wallets/', <CreditCardIcon />]] as [string, string, JSX.Element][])),
        ['Contacts', '/contacts/', <BookmarkBorderOutlinedIcon />],
        [t('settings'), '/settings/', <SettingsOutlinedIcon />],
    ]

    const ref = useRef<HTMLDivElement>(null!)

    const toggle = useMemo(
        () => ({
            blur: () => {
                blurRequest += 1
                ref.current.classList.add(classes.blur)
            },
            unblur: () => {
                blurRequest -= 1
                if (blurRequest <= 0) ref.current.classList.remove(classes.blur)
            },
        }),
        [classes.blur],
    )

    return (
        <DashboardBlurContextProvider value={toggle}>
            <div className={classes.wrapper} ref={ref}>
                <div className={classes.container}>
                    <ResponsiveDrawer routers={routers} exitDashboard={null} />
                    {OptionsPageRouters}
                </div>
                <footer className={classes.footer}>
                    <FooterLine />
                </footer>
            </div>
        </DashboardBlurContextProvider>
    )
}

SSRRenderer(<DashboardWithProvider />)
