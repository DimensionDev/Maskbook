import React from 'react'

import { makeStyles, createStyles } from '@material-ui/styles'
import {
    Button,
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
import { Link, useHistory } from 'react-router-dom'
import { useMyIdentities } from '../../components/DataSource/useActivatedUI'
import Services from '../service'
import { ProfileIdentifier } from '../../database/type'
import { geti18nString } from '../../utils/i18n'
import { DialogRouter } from './DashboardDialogs/DialogBase'

import PersonaCard from './DashboardComponents/PersonaCard'
import {
    DatabaseBackupDialog,
    DatabaseRestoreDialog,
    DatabaseRestoreSuccessDialog,
    DatabaseRestoreFailedDialog,
} from './DashboardDialogs/Database'
import {
    PersonaCreateDialog,
    PersonaCreatedDialog,
    PersonaDeleteDialog,
    PersonaBackupDialog,
    PersonaImportDialog,
    PersonaImportSuccessDialog,
    PersonaImportFailedDialog,
} from './DashboardDialogs/Persona'
import { ProfileConnectStartDialog, ProfileConnectDialog } from './DashboardDialogs/Profile'
import Buttone from '../../components/Dashboard/Buttone'
import { ListItemProps } from '@material-ui/core/ListItem'

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
            paddingRight: 120,
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

const ListItemWithAction = (props: any) => {
    const { secondaryAction } = useStyles()
    return <ListItem classes={{ secondaryAction }} {...props} />
}

export default function DashboardHomePage() {
    const [exportLoading, setExportLoading] = React.useState(false)

    const classes = useStyles()
    const identities = useMyIdentities()

    const exportData = () => {
        setExportLoading(true)
        Services.Welcome.backupMyKeyPair({
            download: true,
            onlyBackupWhoAmI: false,
        })
            .catch(alert)
            .then(() => setExportLoading(false))
    }

    const history = useHistory()

    const dialogs = (
        <>
            <DialogRouter path="/database/backup" children={<DatabaseBackupDialog />} />
            <DialogRouter path="/database/restore" children={<DatabaseRestoreDialog />} />
            <DialogRouter path="/database/success" children={<DatabaseRestoreSuccessDialog />} />
            <DialogRouter path="/database/failed" children={<DatabaseRestoreFailedDialog />} />
            <DialogRouter path="/persona/create" children={<PersonaCreateDialog />} />
            <DialogRouter path="/persona/created" children={<PersonaCreatedDialog />} />
            <DialogRouter path="/persona/delete" children={<PersonaDeleteDialog />} />
            <DialogRouter path="/persona/backup" children={<PersonaBackupDialog />} />
            <DialogRouter path="/persona/import" children={<PersonaImportDialog />} />
            <DialogRouter path="/persona/success" children={<PersonaImportSuccessDialog />} />
            <DialogRouter path="/persona/failed" children={<PersonaImportFailedDialog />} />
            <DialogRouter path="/profile/start" children={<ProfileConnectStartDialog />} />
            <DialogRouter path="/profile/connect" children={<ProfileConnectDialog />} />
        </>
    )

    return (
        <Container maxWidth="md">
            <section className={classes.sections}>
                <Card raised elevation={1}>
                    <List>
                        <ListItemWithAction key="backup-alert">
                            <ListItemText
                                primary="Backup Alert"
                                secondary={
                                    <span>
                                        365 days since last backup. <br /> 999 new contacts and 999 new posts added.
                                    </span>
                                }
                            />
                            <ListItemSecondaryAction>
                                <Buttone
                                    component={Link}
                                    to={'database/backup'}
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}>
                                    Backup
                                </Buttone>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                    </List>
                </Card>
            </section>
            <section className={classes.sections}>
                <Typography className={classes.title} variant="h5" align="left">
                    My Personas
                </Typography>
                {!identities.length && (
                    <Card raised elevation={1}>
                        <List disablePadding>
                            <ListItemWithAction key="initialize">
                                <ListItemText primary="No persona was found" />
                                <ListItemSecondaryAction>
                                    <Buttone
                                        component={Link}
                                        to="/initialize"
                                        variant="contained"
                                        color="primary"
                                        className={classes.button}>
                                        Initialize
                                    </Buttone>
                                </ListItemSecondaryAction>
                            </ListItemWithAction>
                        </List>
                    </Card>
                )}
                <div>
                    {identities.map(i => (
                        <Card className={classes.identity} raised elevation={1}>
                            <PersonaCard identity={i} key={i.identifier.toText()} />
                        </Card>
                    ))}
                </div>
            </section>
            <section className={classes.sections}>
                <Typography className={classes.title} variant="h5" align="left">
                    Add Persona
                </Typography>
                <Card raised elevation={1}>
                    <List disablePadding>
                        <ListItemWithAction key="persona-create">
                            <ListItemText primary="Create" secondary="Create a new persona." />
                            <ListItemSecondaryAction>
                                <Buttone
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    component={Link}
                                    to="persona/create">
                                    Create
                                </Buttone>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                        <Divider></Divider>
                        <ListItemWithAction key="persona-import">
                            <ListItemText primary="Import" secondary="From a previous persona backup." />
                            <ListItemSecondaryAction>
                                <Buttone
                                    variant="outlined"
                                    color="default"
                                    className={classes.button}
                                    component={Link}
                                    to="persona/import">
                                    Import
                                </Buttone>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                    </List>
                </Card>
            </section>
            <section className={classes.sections}>
                <Typography className={classes.title} variant="h5" align="left">
                    Database
                </Typography>
                <Card raised elevation={1}>
                    <List disablePadding>
                        <ListItemWithAction key="dashboard-backup">
                            <ListItemText
                                primary="Backup"
                                secondary="Create a database backup file. Do it frequently."
                            />
                            <ListItemSecondaryAction>
                                <Buttone
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    component={Link}
                                    to="database/backup">
                                    Backup
                                </Buttone>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                        <Divider></Divider>
                        <ListItemWithAction key="dashboard-restore">
                            <ListItemText primary="Restore" secondary="From a previous database backup." />
                            <ListItemSecondaryAction>
                                <Buttone
                                    variant="outlined"
                                    color="default"
                                    className={classes.button}
                                    component={Link}
                                    to="database/restore">
                                    Restore
                                </Buttone>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                    </List>
                </Card>
            </section>
            <section className={classes.sections}>
                DEBUG:
                <Button color="secondary" component={Link} to="/welcome">
                    real create persona
                </Button>
                <Button color="secondary" component={Link} to="/welcome?restore">
                    real Import Persona
                </Button>
                <Button color="secondary" component={Link} to="/initialize">
                    initialize
                </Button>
            </section>
            {dialogs}
        </Container>
    )
}
