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
import FullScreenDialog from './extension/options-page/Dialog'
import BackupDialog from './extension/options-page/Backup'

import { SnackbarProvider } from 'notistack'
import Services from './extension/service'
import { PersonIdentifier } from './database/type'

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
            '&>MuiLinearProgress-root': {
                width: '100%',
                bottom: 0,
                position: 'absolute',
            },
            '&:not(:last-child)': {
                marginBottom: theme.spacing(2),
            },
        },
        actionButton: {},
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
        <Route
            path="/developer"
            component={() => (
                <FullScreenDialog>
                    <Developer />
                </FullScreenDialog>
            )}
        />
        <Route path="/backup" component={() => <BackupDialog />} />
    </>
)

const ColorButton = withStyles((theme: Theme) => ({
    root: {
        color: theme.palette.getContrastText('#FFFFFF'),
        padding: '0.5em 1.5rem',
        boxShadow: '0px 0px 15px 1px rgba(0,0,0,0.1)',
        backgroundColor: 'rgba(255,255,255,0.8)',
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
                            <Tab label="Dashboard" />
                            <Tab label="Synchronization" disabled />
                        </Tabs>
                        <section className={classes.cards}>
                            {identities.map(i => (
                                <PersonaCard identity={i} key={i.identifier.toText()} />
                            ))}
                            <NewPersonaCard />
                        </section>
                        <section className={classes.actionButtons}>
                            <div className={classes.loaderWrapper}>
                                {
                                    // @ts-ignore
                                    <Link onClick={exportData} to="" disabled={exportLoading} component={PaperButton}>
                                        Export Backup Keystore
                                    </Link>
                                }
                                {exportLoading && <LinearProgress />}
                            </div>
                            <Link to="/welcome?restore" component={PaperButton}>
                                Import Data Backup
                            </Link>
                        </section>
                    </main>
                </Container>
                <footer>
                    <Breadcrumbs className={classes.footerButtons} separator="|" aria-label="breadcrumb">
                        <FooterLink href="https://maskbook.com/">Maskbook.com</FooterLink>
                        <FooterLink href="https://maskbook.com/privacy-policy/">Privacy Policy</FooterLink>
                        <FooterLink href="https://github.com/DimensionDev/Maskbook">Source Code</FooterLink>
                        <FooterLink to="/developer">Developer Options</FooterLink>
                    </Breadcrumbs>
                </footer>
                {OptionsPageRouters}
            </Container>
        </Router>
    )
}

SSRRenderer(<DashboardWithProvider />)
