import './provider.worker'

import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
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

import BackIcon from '@material-ui/icons/ArrowBack'

import React from 'react'
import { ThemeProvider, withStyles } from '@material-ui/styles'
import { MaskbookDarkTheme, MaskbookLightTheme } from './utils/theme'
import { HashRouter as Router, Route, Link } from 'react-router-dom'
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
            width: 200,
            margin: theme.spacing(2, 0, 1),
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

    const shouldRenderBackButton = webpackEnv.firefoxVariant === 'GeckoView' || webpackEnv.target === 'WKWebview'

    return (
        <Router>
            <AppBar position="sticky">
                <Toolbar>
                    {shouldRenderBackButton && (
                        <IconButton onClick={() => window.close()} edge="start" color="inherit" aria-label="back">
                            <BackIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6">Maskbook</Typography>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md">
                <CssBaseline />
                <Container maxWidth="sm">
                    <main className={classes.root}>
                        <img
                            className={classes.logo}
                            src="data:image/png;base64,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"
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
                        <FooterLink href="https://maskbook.com/download-links/#mobile">
                            {geti18nString('dashboard_mobile_test')}
                        </FooterLink>
                        <FooterLink href="https://maskbook.com/privacy-policy/">
                            {geti18nString('options_index_privacy')}
                        </FooterLink>
                        <FooterLink href="https://github.com/DimensionDev/Maskbook">
                            {geti18nString('dashboard_source_code')}
                        </FooterLink>
                        <FooterLink to="/developer">{geti18nString('options_index_dev')}</FooterLink>
                    </Breadcrumbs>
                </footer>
                {OptionsPageRouters}
            </Container>
        </Router>
    )
}

SSRRenderer(<DashboardWithProvider />)
