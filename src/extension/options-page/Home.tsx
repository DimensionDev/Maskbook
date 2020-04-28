import React from 'react'

import { makeStyles, createStyles, styled } from '@material-ui/styles'
import {
    Theme,
    Typography,
    Card,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Container,
} from '@material-ui/core'
import { Link, useHistory, useRouteMatch, Redirect } from 'react-router-dom'
import { useMyPersonas } from '../../components/DataSource/independent'
import Services from '../service'
import { DialogRouter } from './DashboardDialogs/DialogBase'

import PersonaCard from './DashboardComponents/PersonaCard'
import { DatabaseRestoreDialog } from './DashboardDialogs/Database'
import { PersonaCreateDialog, PersonaCreatedDialog, PersonaImportDialog } from './DashboardDialogs/Persona'
import ActionButton from './DashboardComponents/ActionButton'
import FooterLine from './DashboardComponents/FooterLine'
import { useI18N } from '../../utils/i18n-next-ui'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        sections: {
            width: '100%',
            marginTop: theme.spacing(2),
        },
        title: {
            marginTop: theme.spacing(3),
            marginBottom: theme.spacing(1),
        },
        button: {
            width: 120,
        },
        secondaryAction: {
            paddingRight: 120 + theme.spacing(2),
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
        identity: {
            '&:not(:first-child)': {
                marginTop: theme.spacing(2),
            },
        },
    }),
)

const ListItemWithAction: typeof ListItem = (props: any) => {
    const { classes, ...p } = props
    const { secondaryAction } = useStyles()
    return <ListItem classes={{ secondaryAction, ...classes }} {...p} />
}

export default function DashboardHomePage() {
    const { t } = useI18N()
    const [exportLoading, setExportLoading] = React.useState(false)

    const classes = useStyles()
    const personas = useMyPersonas()
    const match = useRouteMatch()!

    const exportData = () => {
        setExportLoading(true)
        Services.Welcome.createBackupFile({
            download: true,
            onlyBackupWhoAmI: false,
        })
            .catch(alert)
            .then(() => setExportLoading(false))
    }

    const history = useHistory()

    const dialogs = (
        <>
            <DialogRouter path="/database/restore" children={<DatabaseRestoreDialog />} />
            <DialogRouter path="/persona/create" children={<PersonaCreateDialog />} />
            <DialogRouter path="/persona/created" children={<PersonaCreatedDialog />} />
            <DialogRouter path="/persona/import" children={<PersonaImportDialog />} />
        </>
    )

    React.useEffect(() => {
        Services.Identity.queryMyPersonas().then((personas) => {
            if (!personas.length) history.replace('/initialize')
            if (personas.length === 1)
                Services.Identity.queryMyProfiles().then((profiles) => {
                    if (!profiles.length) {
                        history.replace(
                            `/initialize/2s?identifier=${encodeURIComponent(personas[0].identifier.toText())}`,
                        )
                    }
                })
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Container maxWidth="md">
            <section className={classes.sections}>
                <Typography className={classes.title} variant="h5" align="left">
                    {t('my_personas')}
                </Typography>
                {!personas.length && (
                    <Card raised elevation={1}>
                        <List disablePadding>
                            <ListItemWithAction key="initialize">
                                <ListItemText primary={t('dashboard_no_persona_found')} />
                                <ListItemSecondaryAction>
                                    <ActionButton<typeof Link>
                                        component={Link}
                                        to="/initialize"
                                        variant="contained"
                                        color="primary"
                                        className={classes.button}>
                                        {t('initialize')}
                                    </ActionButton>
                                </ListItemSecondaryAction>
                            </ListItemWithAction>
                        </List>
                    </Card>
                )}
                <div>
                    {personas.map((i, index) => (
                        <Card key={`cardIdentity-${index}`} className={classes.identity} raised elevation={1}>
                            <PersonaCard persona={i} key={i.identifier.toText()} />
                        </Card>
                    ))}
                </div>
            </section>
            <section className={classes.sections}>
                <Typography className={classes.title} variant="h5" align="left">
                    {t('add_persona')}
                </Typography>
                <Card raised elevation={1}>
                    <List disablePadding>
                        <ListItemWithAction key="persona-create">
                            <ListItemText primary={t('create')} secondary={t('dashboard_create_persona_hint')} />
                            <ListItemSecondaryAction>
                                <ActionButton<typeof Link>
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    component={Link}
                                    to="persona/create">
                                    {t('create')}
                                </ActionButton>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                        <Divider></Divider>
                        <ListItemWithAction key="persona-import">
                            <ListItemText primary={t('import')} secondary={t('dashboard_import_persona_hint')} />
                            <ListItemSecondaryAction>
                                <ActionButton<typeof Link>
                                    variant="outlined"
                                    color="default"
                                    className={classes.button}
                                    component={Link}
                                    to="persona/import">
                                    {t('import')}
                                </ActionButton>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                    </List>
                </Card>
            </section>
            <section className={classes.sections}>
                <Typography className={classes.title} variant="h5" align="left">
                    {t('database')}
                </Typography>
                <Card raised elevation={1}>
                    <List disablePadding>
                        <ListItemWithAction key="dashboard-backup">
                            <ListItemText primary={t('backup')} secondary={t('dashboard_backup_database_hint')} />
                            <ListItemSecondaryAction>
                                <ActionButton
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    component={'a'}
                                    loading={exportLoading}
                                    onClick={exportData}>
                                    {t('backup')}
                                </ActionButton>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                        <Divider></Divider>
                        <ListItemWithAction key="dashboard-restore">
                            <ListItemText primary={t('restore')} secondary={t('dashboard_import_database_hint')} />
                            <ListItemSecondaryAction>
                                <ActionButton<typeof Link>
                                    variant="outlined"
                                    color="default"
                                    className={classes.button}
                                    component={Link}
                                    to="database/restore">
                                    {t('restore')}
                                </ActionButton>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                    </List>
                </Card>
            </section>
            <section className={classes.sections}>
                <FooterLine />
            </section>
            {dialogs}
            {!match?.url.endsWith('/') && match?.isExact && <Redirect to={match?.url + '/'} />}
        </Container>
    )
}
