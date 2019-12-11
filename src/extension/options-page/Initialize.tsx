import React from 'react'
import { Switch, useRouteMatch, Route, useParams, Redirect } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import { Theme, Typography, Card, Container } from '@material-ui/core'
import InitStep0 from './DashboardInitSteps/Step0'
import InitStep1S from './DashboardInitSteps/Step1S'
import InitStep2S from './DashboardInitSteps/Step2S'
import InitStep1R from './DashboardInitSteps/Step1R'
import InitStep1Ra from './DashboardInitSteps/Step1Ra'
import InitStep2R from './DashboardInitSteps/Step2R'
import FooterLine from './DashboardComponents/FooterLine'
import { geti18nString } from '../../utils/i18n'

const useStyles = makeStyles((theme: Theme) => ({
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        width: '100%',
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    maskicon: {
        display: 'block',
        marginBottom: theme.spacing(1),
        width: 72,
        height: 72,
    },
    card: {
        minHeight: '50vh',
        width: '100%',
        maxWidth: '700px',
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    footer: {
        paddingBottom: 48,
    },
}))

const InitializeSteps = () => {
    const { step } = useParams()
    switch (step) {
        case '1s':
            return <InitStep1S />
        case '2s':
            return <InitStep2S />
        case '1r':
            return <InitStep1R />
        case '1ra':
            return <InitStep1Ra />
        case '2r':
            return <InitStep2R />
    }
    return <InitStep0 />
}

function DashboardInitializePageInternal() {
    const { path } = useRouteMatch()!

    const classes = useStyles()

    const RouterItem = () => (
        <Switch>
            <Route path={`${path}/:step`}>
                <InitializeSteps />
            </Route>
            <Route path="*">
                <Redirect path="*" to="/initialize/start" />
            </Route>
        </Switch>
    )

    return (
        <section className={classes.section}>
            <header className={classes.header}>
                <img className={classes.maskicon} src="https://maskbook.com/img/MB--CircleCanvas--WhiteOverBlue.svg" />
                <Typography variant="h6">{geti18nString('dashboard_welcome_to_maskbook')}</Typography>
            </header>
            <Card className={classes.card}>
                <RouterItem />
            </Card>
            <footer className={classes.footer}>
                <FooterLine />
            </footer>
        </section>
    )
}

export default function DashboardInitializeDialog() {
    const classes = useStyles()
    return (
        <Container maxWidth="md" className={classes.wrapper}>
            <DashboardInitializePageInternal />
        </Container>
    )
}
