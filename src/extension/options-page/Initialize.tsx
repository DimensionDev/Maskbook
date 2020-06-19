import React from 'react'
import { Switch, useRouteMatch, Route, useParams, Redirect } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import { Theme, Typography, Card, Container } from '@material-ui/core'
import Disclaimer from './DashboardInitSteps/Disclaimer'
import InitStep0 from './DashboardInitSteps/Step0'
import InitStep1S from './DashboardInitSteps/Step1S'
import InitStep2S from './DashboardInitSteps/Step2S'
import InitStep1R from './DashboardInitSteps/Step1R'
import InitStep1Ra from './DashboardInitSteps/Step1Ra'
import InitStep2R from './DashboardInitSteps/Step2R'
import FooterLine from './DashboardComponents/FooterLine'
import { useI18N } from '../../utils/i18n-next-ui'
import { InitStep } from './InitStep'
import { getUrl } from '../../utils/utils'

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
    switch (step as InitStep) {
        case InitStep.Disclaimer:
            return <Disclaimer />
        case InitStep.Setup1:
            return <InitStep1S />
        case InitStep.Setup2:
            return <InitStep2S />
        case InitStep.Restore1:
            return <InitStep1R />
        case InitStep.RestoreAdvanced1:
            return <InitStep1Ra />
        case InitStep.Restore2:
            return <InitStep2R />
    }
    return <InitStep0 />
}

function DashboardInitializePageInternal() {
    const { t } = useI18N()
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
                <img className={classes.maskicon} src={getUrl('MB--CircleCanvas--WhiteOverBlue.svg')} />
                <Typography variant="h6">{t('dashboard_welcome_to_maskbook')}</Typography>
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
