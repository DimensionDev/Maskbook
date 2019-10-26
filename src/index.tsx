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
} from '@material-ui/core'
import React, { useEffect } from 'react'
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
        },
        cards: {
            width: '100%',
        },
        actionButtons: {
            margin: theme.spacing(4),
        },
        loaderWrapper: {
            position: 'relative',
            '&>MuiLinearProgress-root': {
                width: '100%',
                bottom: 0,
                position: 'absolute',
            },
            '&:not(:last-child)': {
                marginBottom: theme.spacing(4),
            },
        },
        actionButton: {},
        footerButtons: {
            display: 'inline-flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: `${theme.spacing(4)}px`,
        },
        footerButton: {
            '&:not(:last-child)': {
                borderRight: `1px solid ${theme.palette.text.primary}`,
            },
            padding: '0 8px',
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
        // @ts-ignore
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
            href={props.href}
            component={Button}
            className={classes.footerButton}
            target="_blank"
            rel="noopener noreferrer">
            <span>{props.children}</span>
        </MuiLink>
    )
}

function Dashboard() {
    const isDarkTheme = useMediaQuery('(prefers-color-scheme: dark)')
    const Router = (typeof window === 'object' ? HashRouter : MemoryRouter) as typeof HashRouter
    const classes = useStyles()

    const [currentTab, setCurrentTab] = React.useState(0)
    const [exportLoading, setExportLoading] = React.useState(false)

    const identities = useMyIdentities()

    const handleTabChange = (_: React.ChangeEvent<{}>, newValue: number) => {
        setCurrentTab(newValue)
    }

    useEffect(() => {
        document.body.style.overflowX = 'hidden'
        document.body.style.backgroundColor = 'rgb(238,238,238)'
        return () => {
            document.body.style.overflowX = 'auto'
            document.body.style.backgroundColor = null
        }
    }, [])

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
        <ThemeProvider theme={isDarkTheme ? MaskbookDarkTheme : MaskbookLightTheme}>
            <SnackbarProvider
                maxSnack={30}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}>
                <Router>
                    <Container maxWidth="sm">
                        <CssBaseline />
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
                                        <Link
                                            onClick={exportData}
                                            to=""
                                            disabled={exportLoading}
                                            component={PaperButton}>
                                            Export Backup Keystore
                                        </Link>
                                    }
                                    {exportLoading && <LinearProgress />}
                                </div>
                                <Link to="/welcome?restore" component={PaperButton}>
                                    Import Data Backup
                                </Link>
                            </section>
                            <section className={classes.footerButtons}>
                                <FooterLink href="https://maskbook.com/">Maskbook.com</FooterLink>
                                <FooterLink href="https://maskbook.com/privacy-policy/">Privacy Policy</FooterLink>
                                <FooterLink href="https://github.com/DimensionDev/Maskbook">Source Code</FooterLink>
                                <Link to="/developer" component={Button} className={classes.footerButton}>
                                    <span>Developer Options</span>
                                </Link>
                            </section>
                            {OptionsPageRouters}
                        </main>
                    </Container>
                </Router>
            </SnackbarProvider>
        </ThemeProvider>
    )
}

SSRRenderer(<Dashboard />)
