import React, { useMemo } from 'react'
import DashboardRouterContainer from './Container'
import { Button, makeStyles, createStyles } from '@material-ui/core'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import { useMyPersonas } from '../../../components/DataSource/useActivatedUI'
import PersonaCard from '../DashboardComponents/PersonaCard'
import { DashboardPersonaCreateDialog, DashboardPersonaImportDialog } from '../Dialog/Persona'
import { useDialog } from '../Dialog/Base'
import { Database as DatabaseIcon } from 'react-feather'
import { DashboardDatabaseBackupDialog, DashboardDatabaseRestoreDialog } from '../Dialog/Database'

const useStyles = makeStyles((theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
            flex: 1,
            alignItems: 'baseline',
            overflow: 'auto',
            marginTop: theme.spacing(1),
            paddingTop: theme.spacing(2),
        },
        footer: {
            flexGrow: 0,
            flexShrink: 0,
            margin: theme.spacing(2, 0),
            '& > *:not(:last-child)': {
                marginRight: theme.spacing(1),
            },
        },
    }),
)

export default function DashboardPersonasRouter() {
    const classes = useStyles()
    const personas = useMyPersonas()

    const [createPersona, openCreatePersona] = useDialog(<DashboardPersonaCreateDialog />)
    const [importPersona, openImportPersona] = useDialog(<DashboardPersonaImportDialog />)
    const [backupDatabase, openBackupDatabase] = useDialog(<DashboardDatabaseBackupDialog />)
    const [restoreDatabase, openRestoreDatabase] = useDialog(<DashboardDatabaseRestoreDialog />)

    const actions = useMemo(
        () => [
            <Button color="primary" variant="outlined" onClick={openImportPersona}>
                Import
            </Button>,
            <Button color="primary" variant="contained" onClick={openCreatePersona} endIcon={<AddCircleIcon />}>
                Create Persona
            </Button>,
        ],
        [openCreatePersona, openImportPersona],
    )

    return (
        <DashboardRouterContainer title="My Personas" actions={actions}>
            <section className={classes.container}>
                {personas.map((persona) => (
                    <PersonaCard key={persona.identifier.toText()} persona={persona} />
                ))}
            </section>
            <section className={classes.footer}>
                <Button
                    onClick={openRestoreDatabase}
                    startIcon={<DatabaseIcon size={18} />}
                    color="primary"
                    variant="text">
                    Restore Datebase
                </Button>
                <Button onClick={openBackupDatabase} color="primary" variant="text">
                    Backup Datebase
                </Button>
            </section>
            {createPersona}
            {importPersona}
            {backupDatabase}
            {restoreDatabase}
        </DashboardRouterContainer>
    )
}
