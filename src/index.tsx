import './provider.worker'

import {
    Container,
    CssBaseline,
    useMediaQuery,
    Tabs,
    Tab,
    Button,
    Link as MuiLink,
    Paper,
    LinearProgress,
    Breadcrumbs,
} from '@material-ui/core'
import React from 'react'
import { ThemeProvider, withStyles } from '@material-ui/styles'
import { MaskbookDarkTheme, MaskbookLightTheme } from './utils/theme'
import { HashRouter, MemoryRouter, Route, Link } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import PersonaCard from './extension/options-page/PersonaCard'
import NewPersonaCard from './extension/options-page/NewPersonaCard'
import { useMyIdentities } from './components/DataSource/useActivatedUI'

import './setup.ui'
import { SSRRenderer } from './utils/SSRRenderer'

import Welcome from './extension/options-page/Welcome'
import Developer from './extension/options-page/Developer'
import FullScreenDialogRouter from './extension/options-page/Dialog'
import BackupDialog from './extension/options-page/Backup'

import { SnackbarProvider } from 'notistack'
import Services from './extension/service'
import { PersonIdentifier } from './database/type'
import { geti18nString } from './utils/i18n'

const useStyles = makeStyles(theme =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        logo: {
            height: 100,
            marginBottom: -theme.spacing(1),
            filter: `invert(${theme.palette.type === 'dark' ? '0.9' : '0.1'})`,
        },
        cards: {
            width: '100%',
        },
        actionButtons: {
            margin: theme.spacing(2),
        },
        loaderWrapper: {
            position: 'relative',
            '&:not(:last-child)': {
                marginBottom: theme.spacing(2),
            },
        },
        loader: {
            width: '100%',
            bottom: 0,
            position: 'absolute',
        },
        actionButton: {},
        footer: {
            paddingBottom: 48,
        },
        footerButtons: {
            marginTop: `${theme.spacing(1)}px`,
            '& ol': {
                justifyContent: 'center',
            },
        },
        footerButton: {
            borderRadius: '0',
            whiteSpace: 'nowrap',
            '& > span': {
                marginLeft: theme.spacing(1),
                marginRight: theme.spacing(1),
            },
        },
    }),
)

const OptionsPageRouters = (
    <>
        <Route exact path="/" component={() => null} />
        <Route path="/welcome" component={Welcome} />
        <FullScreenDialogRouter path="/developer" component={Developer}></FullScreenDialogRouter>
        <Route path="/backup" component={() => <BackupDialog />} />
    </>
)

const ColorButton = withStyles((theme: Theme) => ({
    root: {
        padding: '0.5em 1.5rem',
        boxShadow: theme.shadows[2],
        width: '100%',
    },
}))(Button)

const BlockAElement = (props: any) => <a style={{ display: 'block', textDecoration: 'none' }} {...props}></a>

const PaperButton = function(props: any) {
    const classes = useStyles()
    const { children, disabled, ...paperProps } = props
    return (
        <Paper
            component={BlockAElement}
            href={props.href}
            className={classes.actionButton}
            elevation={3}
            {...paperProps}>
            <ColorButton disabled={disabled}> {props.children} </ColorButton>
        </Paper>
    )
}

const FooterLink = function(props: any) {
    const classes = useStyles()
    return (
        <MuiLink
            underline="none"
            {...(props.href
                ? { href: props.href, target: '_blank', rel: 'noopener noreferrer' }
                : { to: props.to, component: Link })}
            color="inherit"
            className={classes.footerButton}>
            <span>{props.children}</span>
        </MuiLink>
    )
}

function DashboardWithProvider() {
    const isDarkTheme = useMediaQuery('(prefers-color-scheme: dark)')
    return (
        <ThemeProvider theme={isDarkTheme ? MaskbookDarkTheme : MaskbookLightTheme}>
            <SnackbarProvider
                maxSnack={30}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}>
                <Dashboard></Dashboard>
            </SnackbarProvider>
        </ThemeProvider>
    )
}

function Dashboard() {
    const Router = (typeof window === 'object' ? HashRouter : MemoryRouter) as typeof HashRouter
    const classes = useStyles()

    const [currentTab, setCurrentTab] = React.useState(0)
    const [exportLoading, setExportLoading] = React.useState(false)

    const identities = useMyIdentities()

    const handleTabChange = (_: React.ChangeEvent<{}>, newValue: number) => {
        setCurrentTab(newValue)
    }

    const exportData = () => {
        setExportLoading(true)
        Services.Welcome.backupMyKeyPair(PersonIdentifier.unknown, {
            download: true,
            onlyBackupWhoAmI: false,
        })
            .catch(alert)
            .then(() => setExportLoading(false))
    }

    return (
        <Router>
            <Container maxWidth="md">
                <CssBaseline />
                <Container maxWidth="sm">
                    <main className={classes.root}>
                        <img
                            className={classes.logo}
                            src="https://maskbook.com/img/maskbook--logotype-black.png"
                            alt="Maskbook"
                        />
                        <Tabs
                            value={currentTab}
                            indicatorColor="primary"
                            textColor="primary"
                            onChange={handleTabChange}>
                            <Tab label={geti18nString('dashboard')} />
                            {/* <Tab label={geti18nString('synchronization')} disabled /> */}
                        </Tabs>
                        <section className={classes.cards}>
                            {identities.map(i => (
                                <PersonaCard identity={i} key={i.identifier.toText()} />
                            ))}
                            <NewPersonaCard />
                        </section>
                        <section className={classes.actionButtons}>
                            <div className={classes.loaderWrapper}>
                                <PaperButton onClick={exportData} disabled={exportLoading}>
                                    {geti18nString('dashboard_export_keystore')}
                                </PaperButton>
                                {exportLoading && <LinearProgress classes={{ root: classes.loader }} />}
                            </div>
                            <Link to="/welcome?restore" component={PaperButton}>
                                {geti18nString('dashboard_import_backup')}
                            </Link>
                        </section>
                    </main>
                </Container>
                <footer className={classes.footer}>
                    <Breadcrumbs className={classes.footerButtons} separator="|" aria-label="breadcrumb">
                        <FooterLink href="https://maskbook.com/">Maskbook.com</FooterLink>
                        <FooterLink href="https://maskbook.com/privacy-policy/">
                            {geti18nString('options_index_privacy')}
                        </FooterLink>
                        <FooterLink href="https://github.com/DimensionDev/Maskbook">Source Code</FooterLink>
                        <FooterLink to="/developer">{geti18nString('options_index_dev')}</FooterLink>
                    </Breadcrumbs>
                </footer>
                {OptionsPageRouters}
            </Container>
        </Router>
    )
}

SSRRenderer(<DashboardWithProvider />)
