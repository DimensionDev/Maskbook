import './provider.worker'

import { Container, CssBaseline, useMediaQuery, Tabs, Tab, Button, Link as MuiLink } from '@material-ui/core'
import React, { useEffect } from 'react'
import { ThemeProvider } from '@material-ui/styles'
import { MaskbookDarkTheme, MaskbookLightTheme } from './utils/theme'
import { HashRouter, MemoryRouter, Route, Link, useRouteMatch, useHistory, Redirect } from 'react-router-dom'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import PersonaCard from './extension/options-page/PersonaCard'
import NewPersonaCard from './extension/options-page/NewPersonaCard'
import { useMyIdentities } from './components/DataSource/useActivatedUI'

import './setup.ui'
import { SSRRenderer } from './utils/SSRRenderer'

import Welcome from './extension/options-page/Welcome'
import Privacy from './extension/options-page/Privacy'
import Developer from './extension/options-page/Developer'
import FullScreenDialog from './extension/options-page/Dialog'
import BackupDialog from './extension/options-page/Backup'

import { SnackbarProvider, VariantType, useSnackbar } from 'notistack'

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
        actionButton: {},
        footerButtons: {
            display: 'inline-flex',
            marginBottom: `${theme.spacing(4)}px`,
        },
        footerButton: {
            '&:not(:last-child)': {
                borderRight: `1px solid ${theme.palette.primary.main}`,
            },
            padding: '0 8px',
            borderRadius: '0',
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
            path="/privacy"
            component={() => (
                <FullScreenDialog>
                    <Privacy />
                </FullScreenDialog>
            )}
        />
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

function Dashboard() {
    const isDarkTheme = useMediaQuery('(prefers-color-scheme: dark)')
    const Router = (typeof window === 'object' ? HashRouter : MemoryRouter) as typeof HashRouter
    const classes = useStyles()

    const [currentTab, setCurrentTab] = React.useState(0)

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
                                {
                                    // @ts-ignore
                                    <Link
                                        to="/welcome?restore"
                                        component={Button}
                                        variant="contained"
                                        className={classes.actionButton}>
                                        Import Data Backup
                                    </Link>
                                }
                            </section>
                            <section className={classes.footerButtons}>
                                <MuiLink
                                    href="https://maskbook.com/"
                                    component={Button}
                                    className={classes.footerButton}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <span>Maskbook.com</span>
                                </MuiLink>
                                <MuiLink
                                    href="https://maskbook.com/privacy-policy/"
                                    component={Button}
                                    className={classes.footerButton}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <span>Privacy Policy</span>
                                </MuiLink>
                                <MuiLink
                                    href="https://github.com/DimensionDev/Maskbook"
                                    component={Button}
                                    className={classes.footerButton}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <span>Source Code</span>
                                </MuiLink>
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
